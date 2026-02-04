# Agent Workspace Templates

## Required Files
- AGENTS.md
- SOUL.md
- IDENTITY.md
- TOOLS.md
- HEARTBEAT.md
- SKILLS.md

## Shared Memory Files
Create these files once in the shared workspace that all agents can read/write:
- memory/WORKING.md
- memory/MEMORY.md
- memory/HEARTBEAT.md
- memory/YYYY-MM-DD.md (daily notes)

## WORKING.md Template
```md
# WORKING.md

## Current Task

## Status

## Next Steps
1.
2.
3.

## Blockers
- None
```

## MEMORY.md Template
```md
# MEMORY.md

## Stable Facts

## Decisions

## Preferences
```

## HEARTBEAT.md Template
```md
# HEARTBEAT.md

## On Wake
- [ ] Read memory/WORKING.md
- [ ] Check Mission Control for mentions
- [ ] Check assigned tasks
- [ ] Scan activity feed for relevant items

## If Idle
- [ ] Post HEARTBEAT_OK
- [ ] Log to memory/YYYY-MM-DD.md
```
