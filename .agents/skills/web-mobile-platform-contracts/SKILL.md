---
name: web-mobile-platform-contracts
description: Keep web and mobile as clients of one platform API when contracts, authentication, shared entities, or mobile support change.
---
# Web-mobile platform contracts
**Trigger:** mobile addition, API/DTO/auth/entity or backend endpoint change. **Do not trigger:** presentation-only changes with no platform contract.
1. Inspect the existing contract and client-generation approach before proposing a replacement.
2. Keep rules in domain/application services, not clients; define request/response/error, auth, versioning, pagination, upload, notification, and realtime event contracts as relevant.
3. Prefer a machine-readable contract and generated client only where it fits the stack.
**Quality gates:** both clients use compatible contracts; no server-only code leaks; older released clients remain considered. **Output:** contract change, compatibility strategy, affected clients/tests. **Stop:** contract breaking change lacks a versioning or rollout decision.
