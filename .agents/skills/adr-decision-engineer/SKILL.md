---
name: adr-decision-engineer
description: Record meaningful, durable architectural decisions as lightweight ADRs without documenting every ordinary implementation choice.
---
# ADR decision engineer
**Trigger:** consequential architecture, platform, data, security, or integration decision future engineers must understand. **Do not trigger:** reversible local implementation choices.
1. Search existing ADRs and architecture docs.
2. Write `docs/architecture/decisions/ADR-XXXX-short-title.md` with Status, Context, Decision, Alternatives, and Consequences.
3. Link evidence/contracts and update status only when the decision genuinely changes.
**Quality gates:** decision and trade-offs are specific, durable, and non-duplicative. **Output:** ADR path and concise rationale. **Stop:** decision owner or alternatives are not known.
