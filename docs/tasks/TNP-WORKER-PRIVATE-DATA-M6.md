# TNP-WORKER-PRIVATE-DATA-M6 - photo, identity evidence and payout onboarding

Status: DRAFT / SECURITY AND PROVIDER HOLD. No writer, branch, worktree, port, Ready SHA, reviewer appointment or push authority.

Human owner and fixed-SHA acceptance reviewer: Kartik. Backend author must be a verified GPT-6 Sol session under an exact Ready lease. Fresh non-author Sol security/data review, external Claude review and domain/Finance evidence are required.

## Prerequisites

Accepted ADR-0009; recorded DEC-28/33/34/35/36; integrated worker/Operations sign-in, capability grants and normal-profile API; selected private object storage/scanning and approved payout beneficiary adapter; migration/readiness and rollback plan. No real Aadhaar, bank or passbook data enters development fixtures.

## Result

Implement separately protected photo/identity/passbook document lifecycle, consent records and versioned payout-destination onboarding. Use quarantined private staging, content sniffing, bounded types/sizes, malware scan, portrait re-encoding/EXIF stripping, owner and verifier checks, audited expiring downloads and retention/deletion policy. The Aadhaar workflow follows the explicitly accepted DEC-34 method and rejects unmasked full-number capture if that path is chosen. Provider-backed payout versions remain pending until step-up, separate notice, verification, cooling and maker/checker requirements pass. Snapshot the effective destination at batch freeze; never redirect an existing frozen instruction.

## Proposed ownership

server/workers/private/**, server/data/**, server/audit/**, exact private upload/download and payout API routes, focused adversarial tests and operations runbook. P replaces this broad proposal with an exclusive exact file allowlist before Ready. UI controls and provider activation are separate leases.

## Acceptance

Cross-worker/tenant, role, revoked grant, withdrawn consent, malicious MIME, over-size, infected/quarantined file, repeated finalization, stale revision, unaudited download, leaked EXIF and export leakage all fail safely. Profile, each document and destination have independent revisions; protected mutations require both expected revision and Idempotency-Key. No exact account or Aadhaar value enters normal responses, logs or preview state. Security, data migration, provider sandbox UAT, independent reviews and Kartik acceptance precede live collection.
