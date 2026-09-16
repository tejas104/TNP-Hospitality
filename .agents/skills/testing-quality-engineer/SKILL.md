---
name: testing-quality-engineer
description: Select and implement the smallest effective verification layer after non-trivial changes, from unit through end-to-end testing.
---
# Testing and quality engineer
**Trigger:** non-trivial implementation, important bug fix, contract change, security-sensitive flow, or release candidate. **Do not trigger:** when a trivial edit has no behavioral risk beyond existing checks.
1. Identify behavior, risks, and the smallest suitable layer: unit, integration, API/contract, then E2E.
2. Cover relevant critical flows: auth/permissions, tenancy, payments, CRUD, business workflows, and shared-client behavior.
3. Run and report actual commands/results; distinguish unrun checks from passing checks.
**Quality gates:** tests assert behavior, not compilation alone; important fixes have regression coverage. **Output:** test matrix and evidence. **Stop:** test environment/data access prevents meaningful verification; report the gap.
