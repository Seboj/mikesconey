<purpose>
Research how to implement a phase. Spawns canopy-phase-researcher with phase context.

Standalone research command. For most workflows, use `/canopy:plan-phase` which integrates research automatically.
</purpose>

<process>

## Step 0: Resolve Model Profile

@./.claude/canopy/references/model-profile-resolution.md

Resolve model for:
- `canopy-phase-researcher`

## Step 1: Normalize and Validate Phase

@./.claude/canopy/references/phase-argument-parsing.md

```bash
PHASE_INFO=$(node ./.claude/canopy/bin/canopy-tools.cjs roadmap get-phase "${PHASE}")
```

If `found` is false: Error and exit.

## Step 2: Check Existing Research

```bash
ls .canopy/phases/${PHASE}-*/RESEARCH.md 2>/dev/null
```

If exists: Offer update/view/skip options.

## Step 3: Gather Phase Context

```bash
INIT=$(node ./.claude/canopy/bin/canopy-tools.cjs init phase-op "${PHASE}")
# Extract: phase_dir, padded_phase, phase_number, state_path, requirements_path, context_path
```

## Step 4: Spawn Researcher

```
Task(
  prompt="<objective>
Research implementation approach for Phase {phase}: {name}
</objective>

<files_to_read>
- {context_path} (USER DECISIONS from /canopy:discuss-phase)
- {requirements_path} (Project requirements)
- {state_path} (Project decisions and history)
</files_to_read>

<additional_context>
Phase description: {description}
</additional_context>

<output>
Write to: .canopy/phases/${PHASE}-{slug}/${PHASE}-RESEARCH.md
</output>",
  subagent_type="canopy-phase-researcher",
  model="{researcher_model}"
)
```

## Step 5: Handle Return

- `## RESEARCH COMPLETE` — Display summary, offer: Plan/Dig deeper/Review/Done
- `## CHECKPOINT REACHED` — Present to user, spawn continuation
- `## RESEARCH INCONCLUSIVE` — Show attempts, offer: Add context/Try different mode/Manual

</process>
</output>
