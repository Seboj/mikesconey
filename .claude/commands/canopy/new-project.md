---
name: canopy:new-project
description: Initialize a new project with deep context gathering and PROJECT.md
argument-hint: "[--auto]"
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
  - AskUserQuestion
---
<context>
**Flags:**
- `--auto` — Automatic mode. After config questions, runs research → requirements → roadmap without further interaction. Expects idea document via @ reference.
</context>

<objective>
Initialize a new project through unified flow: questioning → research (optional) → requirements → roadmap.

**Creates:**
- `.canopy/PROJECT.md` — project context
- `.canopy/config.json` — workflow preferences
- `.canopy/research/` — domain research (optional)
- `.canopy/REQUIREMENTS.md` — scoped requirements
- `.canopy/ROADMAP.md` — phase structure
- `.canopy/STATE.md` — project memory

**After this command:** Run `/canopy:plan-phase 1` to start execution.
</objective>

<execution_context>
@./.claude/canopy/workflows/new-project.md
@./.claude/canopy/references/questioning.md
@./.claude/canopy/references/ui-brand.md
@./.claude/canopy/templates/project.md
@./.claude/canopy/templates/requirements.md
</execution_context>

<process>
Execute the new-project workflow from @./.claude/canopy/workflows/new-project.md end-to-end.
Preserve all workflow gates (validation, approvals, commits, routing).
</process>
</output>
