# Prompting Guide (Internal)

## Goals
- Make tasks unambiguous and testable.
- Specify output format up front.
- Separate instructions, context, and examples.
- Iterate based on observed outputs.

## Prompt Template
- Task: one sentence summary.
- Context: relevant details only.
- Constraints: scope, tone, length, style.
- Output format: headings and flat bullets.
- Examples: input and ideal output when needed.
- Evaluation checklist: what success looks like.

## Best Practices
- Put instructions at the top and separate context with clear delimiters.
- Be specific about format, tone, and length.
- Use structured tags or labeled sections to avoid mixing context and instructions.
- Iterate on prompts based on real outputs.
- Define success criteria and use simple evals when possible.

## Sources
- OpenAI prompt engineering best practices: https://help.openai.com/en/articles/6654000-best-practices-for-prompt-engineering-with-openai-api
- Anthropic prompt engineering overview: https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview
- Google Gemini prompting intro: https://ai.google.dev/gemini-api/docs/prompting-intro
