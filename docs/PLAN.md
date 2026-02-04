# Multi-Agent System Plan (Single Gateway)

## Goals
- Run a single OpenClaw gateway.
- Represent each agent as a separate session with its own workspace and persona files.
- Provide a Slack-like UI that lets users message any agent and track work.
- Keep costs low with staggered heartbeats and short-lived task sessions.
- Host everything on Cloudflare.

## Core Decisions
- One gateway, many agents, one session per agent: `agent:<agentId>:main`.
- Each agent has its own workspace with `SOUL.md`, `IDENTITY.md`, and `AGENTS.md`.
- A Mission Control backend stores tasks, messages, and notifications.
- The UI talks to Mission Control, not directly to agents.
- Agents pull work from Mission Control on heartbeat or when pinged.

## OpenClaw Session and Workspace Conventions
- Direct chat sessions follow `agent:<agentId>:<mainKey>` with `mainKey` defaulting to `main`.
- DM routing behavior is controlled by `session.dmScope`.
- Group and channel sessions are isolated by channel key.
- Each agent workspace can include `AGENTS.md`, `SOUL.md`, `USER.md`, `IDENTITY.md`, `TOOLS.md`, and `HEARTBEAT.md`.
- The workspace is the default working directory for tools unless sandboxing is enabled.

## Architecture (Cloudflare)
- Public Edge: Cloudflare Worker (routing and auth).
- Gateway Runtime: Cloudflare Container running the OpenClaw gateway.
- Mission Control API: Cloudflare Worker (HTTP + WebSocket).
- Data: Cloudflare D1 for tasks and message threads.
- Files: Cloudflare R2 for attachments and exports.
- Realtime: Durable Objects for presence and push updates.
- Scheduling: Cloudflare Cron Triggers for heartbeat and standups.

## OpenClaw Configuration Strategy
- Define agents in `agents.list` with unique `workspace` and optional `agentDir`.
- Use `bindings` to route channels to the correct agent.
- Set `session.mainKey` to `main` and keep `dmScope` consistent across channels.
- Enable `tools.agentToAgent` so Jarvis can delegate.
- Use isolated sessions for cron-driven work to keep long-term context small.

## Session and Routing Rules
- Direct chats route to `agent:<agentId>:main` for each agent.
- Group messages route to Jarvis unless a binding overrides.
- For UI chats, use a per-thread or per-user session key to avoid crosstalk.

## Mission Control Data Model (D1)
- agents: id, name, role, status, sessionKey, lastSeenAt.
- tasks: id, title, description, status, assignees, priority.
- messages: id, taskId, fromAgentId, content, attachments.
- documents: id, title, content, type, taskId.
- activities: id, type, agentId, message, createdAt.
- notifications: id, agentId, content, delivered, createdAt.

## Cost Controls
- Staggered heartbeats per agent, default 15 minutes.
- Heartbeats run in isolated sessions with short prompts.
- Use cheaper models for routine checks, premium models for final outputs.
- Keep memory files small and curated.
- Summarize long threads into a short recap file.

## UI Requirements
- Slack-like left sidebar with agents.
- Threaded task view with status lanes.
- Activity feed and notification center.
- Inline document viewer and export.

## Security and Compliance
- Gateway protected with Cloudflare Access.
- Mission Control API uses service-to-service auth.
- D1 data access scoped to project.
- R2 objects use signed URLs.

## Operations
- Logs and metrics from Workers and Container.
- Daily standup summary cron.
- Backup strategy for D1 and R2.

## Sources
- OpenClaw sessions: https://docs.openclaw.ai/concepts/session
- OpenClaw agent workspace: https://docs.openclaw.ai/agent/workspace
- OpenClaw configuration: https://docs.openclaw.ai/advanced/configuration
- OpenClaw session tools: https://docs.openclaw.ai/tools/session
- Cloudflare Workers WebSockets: https://developers.cloudflare.com/workers/runtime-apis/websockets/
- Cloudflare D1: https://developers.cloudflare.com/d1/
- Cloudflare Durable Objects: https://developers.cloudflare.com/durable-objects/
