---
name: mission-control
description: Manage Mission Control Convex data via HTTP query/mutation. Supports task updates, document creation, messaging, notifications, and Jarvis-only admin actions for agent creation and monitoring.
---

# Mission Control

Manage tasks, documents, agents, messages, notifications, and activities using the Convex HTTP API.

## Requirements

- `CONVEX_URL` set to your deployment URL (example: https://rare-rook-425.convex.cloud)
- Optional: `CONVEX_ADMIN_KEY` for protected deployments (sent as `Authorization: Convex <key>` unless you include a prefix)

## Quick Start

Query tasks:

```bash
node /root/openclaw/skills/mission-control/scripts/mission-control.js query tasks:list '{}' --format json
```

Update task status:

```bash
node /root/openclaw/skills/mission-control/scripts/mission-control.js mutation tasks:updateStatus '{"id":"TASK_ID","status":"completed"}' --format json
```

Create a document:

```bash
node /root/openclaw/skills/mission-control/scripts/mission-control.js mutation documents:create '{"title":"Spec","content":"...","type":"markdown","taskId":"TASK_ID"}' --format json
```

## Command Patterns

All calls use:

```bash
node /root/openclaw/skills/mission-control/scripts/mission-control.js <query|mutation> <path> [argsJson] [--format json]
```

The CLI sends a JSON payload shaped like:

```json
{
  "path": "tasks:createTask",
  "args": { "text": "My first task" },
  "format": "json"
}
```

`format` defaults to `json`. Override with `--format` if your deployment expects a different value.

The CLI also sets the `format` query parameter to match the request body.

Examples:

- `query tasks:list {}`
- `query messages:getByTask {"taskId":"TASK_ID"}`
- `mutation tasks:assign {"id":"TASK_ID","assigneeIds":["AGENT_ID"]}`
- `mutation documents:update {"id":"DOC_ID","content":"..."}`

## Jarvis-Only Operations

Use these only when acting as Jarvis (Squad Lead).

Create a new agent:

```bash
node /root/openclaw/skills/mission-control/scripts/mission-control.js mutation agents:create '{"name":"New Agent","role":"Designer","status":"idle","sessionKey":"agent:designer:main"}'
```

Monitor everything (tasks, agents, messages, documents, activities, notifications):

```bash
node /root/openclaw/skills/mission-control/scripts/mission-control.js monitor --limit 50
```

## Available Paths

Use the exact path from your Convex deployment. The list below matches `../mission-control`.

Tasks:
- `tasks:list`
- `tasks:get`
- `tasks:getByStatus`
- `tasks:getByAssignee`
- `tasks:create`
- `tasks:updateStatus`
- `tasks:assign`

Agents:
- `agents:list`
- `agents:get`
- `agents:getBySessionKey`
- `agents:create`
- `agents:updateStatus`
- `agents:heartbeat`

Documents:
- `documents:list`
- `documents:get`
- `documents:getByTask`
- `documents:create`
- `documents:update`

Messages:
- `messages:list`
- `messages:getByTask`
- `messages:getByAgent`
- `messages:create`
- `messages:remove`

Activities:
- `activities:list`
- `activities:getByAgent`
- `activities:getByTask`
- `activities:getRecent`
- `activities:create`
- `activities:cleanup`

Notifications:
- `notifications:list`
- `notifications:getByAgent`
- `notifications:getUndeliveredByAgent`
- `notifications:getUndelivered`
- `notifications:create`
- `notifications:markDelivered`
- `notifications:markAllDelivered`
- `notifications:remove`

Thread Subscriptions:
- `threadSubscriptions:getByTask`
- `threadSubscriptions:getByAgent`
- `threadSubscriptions:isSubscribed`
- `threadSubscriptions:getSubscribersToNotify`
- `threadSubscriptions:subscribe`
- `threadSubscriptions:unsubscribe`
- `threadSubscriptions:autoSubscribe`
