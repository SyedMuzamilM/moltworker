/**
 * Mission Control Task Delegation
 *
 * Runs inside the Worker (not the container) to check Convex for tasks
 * and delegate them to agents by calling the container's OpenClaw.
 *
 * This is triggered by the cron job on each scheduled tick.
 */

import type { Sandbox } from "@cloudflare/sandbox";
import type { OpenClawEnv } from "../types";

// Agent role to session key mapping
const AGENT_SESSION_MAP: Record<string, string> = {
  "Squad Lead": "agent:main:main",
  "Product Analyst": "agent:product-analyst:main",
  "Customer Researcher": "agent:customer-researcher:main",
  "SEO Analyst": "agent:seo-analyst:main",
  "Content Writer": "agent:content-writer:main",
  "Social Media Manager": "agent:social-media-manager:main",
  Designer: "agent:designer:main",
  "Email Marketing": "agent:email-marketing:main",
  Developer: "agent:developer:main",
  "Documentation Specialist": "agent:documentation:main",
};

interface ConvexAgent {
  _id: string;
  name: string;
  role: string;
  sessionKey?: string;
}

interface ConvexTask {
  _id: string;
  title: string;
  status: "pending" | "in_progress" | "completed" | "blocked" | "cancelled";
  assigneeIds?: string[];
  description?: string;
}

interface ConvexMessage {
  _id: string;
  content: string;
  fromAgentId: string;
  _creationTime: number;
}

interface DelegationResult {
  success: boolean;
  notificationsSent: number;
  errors: string[];
}

/**
 * Query Convex via HTTP API
 */
async function convexQuery<T>(
  env: OpenClawEnv,
  functionName: string,
  args: Record<string, unknown> = {},
): Promise<T | null> {
  const convexUrl = env.CONVEX_URL;
  if (!convexUrl) {
    console.log("[task-delegator] CONVEX_URL not set, skipping");
    return null;
  }

  try {
    const url = new URL("/api/query", convexUrl);
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: functionName, args }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const result = (await response.json()) as { value?: T };
    return result.value ?? null;
  } catch (error) {
    console.error(
      `[task-delegator] Convex query failed for ${functionName}:`,
      error,
    );
    return null;
  }
}

/**
 * Send notification to agent via OpenClaw in the container
 */
async function notifyAgent(
  sandbox: Sandbox,
  sessionKey: string,
  message: string,
  token?: string,
): Promise<boolean> {
  try {
    const escapedMessage = message.replace(/"/g, '\\"').replace(/\n/g, "\\n");
    let command = `openclaw sessions send --session "${sessionKey}" --message "${escapedMessage}"`;

    if (token) {
      command += ` --token "${token}"`;
    }

    const result = await sandbox.exec(command);

    if (result.exitCode !== 0) {
      console.error(
        `[task-delegator] Failed to notify ${sessionKey}:`,
        result.stderr,
      );
      return false;
    }

    console.log(`[task-delegator] ✅ Notified ${sessionKey}`);
    return true;
  } catch (error) {
    console.error(`[task-delegator] Error notifying ${sessionKey}:`, error);
    return false;
  }
}

/**
 * Check for tasks assigned to each agent
 */
async function checkAssignedTasks(
  env: OpenClawEnv,
  agents: ConvexAgent[],
): Promise<Array<{ sessionKey: string; message: string; agent: string }>> {
  const tasks = await convexQuery<ConvexTask[]>(env, "tasks:list", {});
  if (!tasks) return [];

  const notifications = [];

  for (const agent of agents) {
    const assignedTasks = tasks.filter(
      (task) =>
        task.assigneeIds?.includes(agent._id) &&
        (task.status === "pending" || task.status === "in_progress"),
    );

    if (assignedTasks.length > 0) {
      const sessionKey = agent.sessionKey || AGENT_SESSION_MAP[agent.role];
      if (!sessionKey) continue;

      const taskList = assignedTasks
        .map((t) => `• ${t.title} (${t.status})`)
        .join("\n");
      const message = `📋 **Assigned Tasks**\n\nYou have ${assignedTasks.length} task(s) assigned:\n\n${taskList}\n\nCheck Mission Control for details.`;

      notifications.push({ sessionKey, message, agent: agent.name });
    }
  }

  return notifications;
}

/**
 * Check for @mentions in recent messages (last 10 minutes)
 */
async function checkMentions(
  env: OpenClawEnv,
  agents: ConvexAgent[],
): Promise<Array<{ sessionKey: string; message: string; agent: string }>> {
  const messages = await convexQuery<ConvexMessage[]>(env, "messages:list", {});
  if (!messages) return [];

  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  const recentMessages = messages.filter(
    (m) => (m._creationTime || 0) > tenMinutesAgo,
  );

  const notifications = [];

  for (const agent of agents) {
    const mentions = recentMessages.filter((m) => {
      if (!m.content) return false;
      const mentionRegex = new RegExp(`@${agent.name}\\b|@all`, "i");
      return mentionRegex.test(m.content) && m.fromAgentId !== agent._id;
    });

    if (mentions.length > 0) {
      const sessionKey = agent.sessionKey || AGENT_SESSION_MAP[agent.role];
      if (!sessionKey) continue;

      const mentionList = mentions
        .map((m) => {
          const preview =
            m.content.length > 50
              ? m.content.substring(0, 50) + "..."
              : m.content;
          return `• "${preview}"`;
        })
        .join("\n");

      const message = `💬 **You were mentioned**\n\n${mentionList}\n\nView in Mission Control to respond.`;

      notifications.push({ sessionKey, message, agent: agent.name });
    }
  }

  return notifications;
}

/**
 * Check for tasks in "review" status
 */
async function checkReviewTasks(
  env: OpenClawEnv,
): Promise<Array<{ sessionKey: string; message: string; agent: string }>> {
  const tasks = await convexQuery<ConvexTask[]>(env, "tasks:list", {});
  if (!tasks) return [];

  const reviewTasks = tasks.filter((t) => t.status === "completed");

  if (reviewTasks.length > 0) {
    const sessionKey = "agent:main:main";
    const taskList = reviewTasks.map((t) => `• ${t.title}`).join("\n");
    const message = `👀 **Tasks Needing Review**\n\n${taskList}\n\nPlease review and approve in Mission Control.`;

    return [{ sessionKey, message, agent: "Jarvis" }];
  }

  return [];
}

/**
 * Check for blocked tasks
 */
async function checkBlockedTasks(
  env: OpenClawEnv,
): Promise<Array<{ sessionKey: string; message: string; agent: string }>> {
  const tasks = await convexQuery<ConvexTask[]>(env, "tasks:list", {});
  if (!tasks) return [];

  const blockedTasks = tasks.filter((t) => t.status === "blocked");

  if (blockedTasks.length > 0) {
    const sessionKey = "agent:main:main";
    const taskList = blockedTasks
      .map((t) => {
        const assignees = t.assigneeIds?.length
          ? `(${t.assigneeIds.length} assignee(s))`
          : "";
        return `• ${t.title} ${assignees}`;
      })
      .join("\n");

    const message = `🚫 **Blocked Tasks**\n\n${taskList}\n\nThese tasks need your attention to unblock.`;

    return [{ sessionKey, message, agent: "Jarvis" }];
  }

  return [];
}

/**
 * Main task delegation function - runs every cron tick
 */
export async function delegateTasks(
  sandbox: Sandbox,
  env: OpenClawEnv,
): Promise<DelegationResult> {
  console.log("[task-delegator] 🤖 Checking Mission Control for tasks...");

  const result: DelegationResult = {
    success: true,
    notificationsSent: 0,
    errors: [],
  };

  if (!env.CONVEX_URL) {
    console.log("[task-delegator] CONVEX_URL not configured, skipping");
    return result;
  }

  try {
    // Get all agents from Convex
    const agents = await convexQuery<ConvexAgent[]>(env, "agents:list", {});
    if (!agents || agents.length === 0) {
      console.log("[task-delegator] No agents found in Convex");
      return result;
    }

    console.log(`[task-delegator] Found ${agents.length} agents`);

    // Collect all notifications
    const allNotifications = [];

    // Check for assigned tasks
    console.log("[task-delegator] Checking assigned tasks...");
    allNotifications.push(...(await checkAssignedTasks(env, agents)));

    // Check for mentions
    console.log("[task-delegator] Checking @mentions...");
    allNotifications.push(...(await checkMentions(env, agents)));

    // Check for review tasks (notify Jarvis)
    console.log("[task-delegator] Checking tasks for review...");
    allNotifications.push(...(await checkReviewTasks(env)));

    // Check for blocked tasks (notify Jarvis)
    console.log("[task-delegator] Checking blocked tasks...");
    allNotifications.push(...(await checkBlockedTasks(env)));

    // Send notifications
    console.log(
      `[task-delegator] Sending ${allNotifications.length} notification(s)...`,
    );

    for (const notif of allNotifications) {
      const sent = await notifyAgent(
        sandbox,
        notif.sessionKey,
        notif.message,
        env.OPENCLAW_GATEWAY_TOKEN,
      );
      if (sent) {
        result.notificationsSent++;
      } else {
        result.errors.push(`Failed to notify ${notif.agent}`);
      }
    }

    console.log(
      `[task-delegator] ✅ Sent ${result.notificationsSent} notification(s)`,
    );
  } catch (error) {
    console.error("[task-delegator] Error:", error);
    result.success = false;
    result.errors.push(String(error));
  }

  return result;
}
