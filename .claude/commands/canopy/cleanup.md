---
name: canopy:cleanup
description: Archive accumulated phase directories from completed milestones
---
<objective>
Archive phase directories from completed milestones into `.canopy/milestones/v{X.Y}-phases/`.

Use when `.canopy/phases/` has accumulated directories from past milestones.
</objective>

<execution_context>
@./.claude/canopy/workflows/cleanup.md
</execution_context>

<process>
Follow the cleanup workflow at @./.claude/canopy/workflows/cleanup.md.
Identify completed milestones, show a dry-run summary, and archive on confirmation.
</process>
</output>
