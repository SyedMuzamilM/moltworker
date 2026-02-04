# Agent Persona Bundles

Each agent has a folder with persona and operating files.

Required files per agent:
- SOUL.md
- IDENTITY.md
- AGENTS.md
- SKILLS.md
- TOOLS.md
- HEARTBEAT.md

Shared memory files (single shared workspace):
- memory/WORKING.md
- memory/MEMORY.md
- memory/HEARTBEAT.md
- memory/YYYY-MM-DD.md

Copy these files into the shared workspace directory used by all agents.
Use the prompting guide in docs/PROMPTING_GUIDE.md when crafting tasks.

Note: Jarvis uses agent id `main` to match the session key `agent:main:main`.
