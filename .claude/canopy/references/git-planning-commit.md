# Git Planning Commit

Commit planning artifacts using the canopy-tools CLI, which automatically checks `commit_docs` config and gitignore status.

## Commit via CLI

Always use `canopy-tools.cjs commit` for `.canopy/` files — it handles `commit_docs` and gitignore checks automatically:

```bash
node ./.claude/canopy/bin/canopy-tools.cjs commit "docs({scope}): {description}" --files .canopy/STATE.md .canopy/ROADMAP.md
```

The CLI will return `skipped` (with reason) if `commit_docs` is `false` or `.canopy/` is gitignored. No manual conditional checks needed.

## Amend previous commit

To fold `.canopy/` file changes into the previous commit:

```bash
node ./.claude/canopy/bin/canopy-tools.cjs commit "" --files .canopy/codebase/*.md --amend
```

## Commit Message Patterns

| Command | Scope | Example |
|---------|-------|---------|
| plan-phase | phase | `docs(phase-03): create authentication plans` |
| execute-phase | phase | `docs(phase-03): complete authentication phase` |
| new-milestone | milestone | `docs: start milestone v1.1` |
| remove-phase | chore | `chore: remove phase 17 (dashboard)` |
| insert-phase | phase | `docs: insert phase 16.1 (critical fix)` |
| add-phase | phase | `docs: add phase 07 (settings page)` |

## When to Skip

- `commit_docs: false` in config
- `.canopy/` is gitignored
- No changes to commit (check with `git status --porcelain .canopy/`)
