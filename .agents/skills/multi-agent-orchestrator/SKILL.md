---
name: multi-agent-orchestrator
description: Plan safe parallel work for large features with independent ownership boundaries; do not use for overlapping or small tasks.
---
# Multi-agent orchestrator
**Trigger:** large feature with separable backend, web, mobile, test, or review work. **Do not trigger:** small work or tasks that edit the same files/unclear contracts.
1. Establish acceptance criteria, shared data/API contracts, file/ownership boundaries, integration order, and branch/worktree strategy.
2. Delegate only independent slices; avoid concurrent edits to shared files.
3. Integrate, test contracts, review the aggregate diff, and create a structured handoff when needed.
**Quality gates:** ownership is non-overlapping; agents share only agreed contracts; integration has a named owner. **Output:** work breakdown, contracts, merge/test plan. **Stop:** coupled changes cannot be safely parallelized.
