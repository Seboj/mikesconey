---
name: canopy:help
description: Show available Canopy commands and usage guide
---
<objective>
Display the complete Canopy command reference.

Output ONLY the reference content below. Do NOT add:
- Project-specific analysis
- Git status or file context
- Next-step suggestions
- Any commentary beyond the reference
</objective>

<execution_context>
@./.claude/canopy/workflows/help.md
</execution_context>

<process>
Output the complete Canopy command reference from @./.claude/canopy/workflows/help.md.
Display the reference content directly — no additions or modifications.
</process>
</output>
