# Agent Implementation Notes

## Principle
Each agent is a distinct session with a shared workspace and shared memory files. The gateway routes messages to each agent based on bindings. Agents communicate in shared channels and via direct session messaging.

## Session Model
- Long-running session: `agent:<agentId>:main` for direct chat and continuity.
- Isolated session: heartbeat or cron-driven tasks use short-lived sessions.
- All agents write durable outputs to their workspace files.

## Task Flow (Based on article.md)
1. Jarvis receives user request.
2. Jarvis delegates work to specialist agents.
3. Specialists post findings to Mission Control and update their WORKING.md.
4. Jarvis compiles results and returns a final summary.
5. Daily standup summarizes progress.

## Shared Brain + Shared Memory
Agents coordinate through a shared task system (Mission Control) and a shared memory folder.
- Tasks and comments live in D1.
- Shared channels provide ambient awareness.
- Notifications are delivered via @mentions and subscriptions.
- Shared memory files live in `memory/` under the shared workspace.

## Heartbeats
- Staggered cron triggers prevent concurrent spikes.
- Each heartbeat is low-cost and quick. If no tasks, respond HEARTBEAT_OK.
- Summaries go to #heartbeat-log.

## Cost Discipline
- Use cheaper models for heartbeat and routine checks.
- Use premium models only for final deliverables.
- Keep shared memory files small and prune with summaries.
