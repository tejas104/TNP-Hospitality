# ADR-0001 — Preserve the demo and introduce a shared service boundary

Status: User-mandated web-only/preserve-design constraints recorded; detailed boundary proposal awaiting independent Astra and human review.
Owners: Anjaneya and Kartik. Author: P in TNP-BOOT-01.

## Context
At 9d58061f2d36514ebc932fa94bb3dc90f4b97a97, five routes use a single frontend package; four portals share PortalPages.tsx and local state. The PDF proposes a different layout/hosting stack, but no production monorepo/backend exists. Day 3 demands frontend coverage. Only two humans now supervise the project.

## Decision proposed
Preserve the current framework, lockfile and visual language. Serialize S0 component extraction and S1 typed service/fixture agreement before disjoint portal work. Keep production authorization, allocation/attendance/finance in a future shared server boundary, reusable by separately funded mobile. Preserve MongoDB Atlas as stated database direction; do not provision it here.

## Alternatives
Immediate framework/monorepo migration creates frontend milestone risk without resolving a proven blocker.
Parallel editing of PortalPages/global CSS produces ownership conflicts.
Independent per-portal fixtures are quick initially but cannot demonstrate a coherent cross-portal journey.
Microservices increase operations and transaction complexity for two humans.

## Consequences
S0/S1 are a real serial dependency inside D1–D3. A single preview store must define IDs, transitions, failure cases and reset semantics; it is not a production backend.
Production API/hosting/auth/jobs/storage decisions remain pending and require separate contracts/tests. No automatic mobile scaffold.
Independent Astra at a fixed commit and the opposite-model/human review are required before accepting this proposal. This file is not author self-certification.
