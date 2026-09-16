---
name: code-review-gate
description: Review meaningful completed work in risk order—requirements through documentation—rather than focusing first on formatting.
---
# Code review gate
**Trigger:** meaningful completed work, PR review, or pre-merge assessment. **Do not trigger:** an unimplemented plan or trivial isolated edit unless requested.
1. Review in order: requirements, correctness, security, data integrity, architecture, edges/concurrency, performance, tests, maintainability, UI/accessibility, documentation.
2. Inspect the actual diff and relevant surrounding code; rank findings by impact and include evidence.
3. Verify claimed checks and call out residual risk.
**Quality gates:** correctness problems are prioritized over style; findings are actionable and scoped. **Output:** pass/findings, evidence, test status, follow-ups. **Stop:** missing diff, requirements, or runtime evidence prevents a reliable conclusion.
