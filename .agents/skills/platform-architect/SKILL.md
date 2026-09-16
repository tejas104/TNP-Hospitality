---
name: platform-architect
description: Assess architecture before a new platform, major module, service-boundary, or infrastructure change; avoid applying it to local isolated edits.
---
# Platform architect
**Trigger:** new platform, major module, service boundary, mobile client, queue/cache/realtime/storage/search change. **Do not trigger:** local bug fixes or implementation contained within established boundaries.
1. Inspect current architecture and requirements; map domain ownership, trust/API boundaries, dependencies, and failure modes.
2. Compare the simplest viable topology (prefer modular monolith unless requirements justify services); identify scale bottlenecks and acceptance criteria.
3. Record a lightweight ADR for consequential decisions.
**Quality gates:** requirements—not fashion—justify boundaries; ownership and failure handling are explicit. **Output:** decision, diagram/text boundary map, risks, acceptance criteria. **Stop:** missing product requirements or an irreversible choice needs an owner decision.
