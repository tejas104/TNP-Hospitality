# TNP-BOOT-01 — Canonical context and dependency-safe dispatch

Status: Prepared for independent review; gate/acceptance pending.
Responsible human: Anjaneya (H1). Author: current architect P session.
Lane/host: B / current local host designated Laptop 1.
Tool/model/effort: Codex; local config gpt-6-astra/high. Per-session override not exposed by inspected metadata; record as configuration evidence, not verified remote entitlement.
Branch: codex/tnp-bootstrap.
Absolute isolated worktree: D:\TNP-worktrees\TNP-BOOT-01.
Baseline SHA: 9d58061f2d36514ebc932fa94bb3dc90f4b97a97.
Dependencies: none; root tracked tree clean before task; user authorized direct bootstrap in this session.
Mode: documentation/governance and frontend-preview planning; no production operation.
Risk: architecture/operating contract.
Astra gate: REQUIRED in separate independent session at fixed commit.
Opposite-model reviewer: Claude, actual selected version and reviewer session pending.
Independent human reviewer: Kartik.
Writer lease: reserved B for P after direct user instruction and local Git/app preflight; paused at fixed review handoff. No external writer lease claimed.

## Ownership
AGENTS.md; CLAUDE.md; .gitattributes (only source-byte provenance rules); docs/**; .agents/skills/{platform-architect,web-mobile-platform-contracts,adr-decision-engineer,frontend-product-engineer,design-system-engineer,code-review-gate,testing-quality-engineer,e2e-browser-verifier,multi-agent-orchestrator}/SKILL.md;
the exact eight TNP Markdown references listed in docs/references/MANIFEST.json.
Local documentation validation script under docs/checks; local evidence under docs/evidence. No ports, DB, jobs or providers.

## Do not modify
app/**, components/**, data/**, hooks/**, lib/**, public/**, package.json, package-lock.json, framework/hosting/lint/TypeScript configs, original user files or unrelated deliverables. No Claude installation/config/credentials changes.
No application fixes, framework/database/provider migration, real services, merge, push or publication.

## Acceptance
Canonical documents reflect two humans and A/B/C/D plus independent R; correct current baseline and pending scope decisions; all 20 screen sets audited with evidence; S0/S1 ownership and dependencies explicit; future task fields complete or visibly Draft; selected skills and references retain hashes/provenance; concise next-step dispatch/review prompts; no unintended app diff.
Actual baseline checks are recorded honestly, including inherited lint errors. Passing documentation validation does not make the application baseline green.
Preparation is not independent approval or production readiness.

## Required checks
npm ci --no-audit --no-fund; npm run lint; npx --no-install tsc --noEmit; npm run build:vercel (isolated checkout).
python docs/checks/verify_bootstrap.py (or absolute bundled Python executable).
git diff --check; staged/commit file allowlist and empty application diff against baseline.
Reference/skill source-vs-copy SHA256 checks; task field/ownership/readiness validation.
Browser reference observation is evidence only; no claim of full F01–F20 acceptance.

## Review/integration
Record fixed local HEAD SHA in the human handoff. Review docs/reviews/TNP-BOOT-01.md and docs/DISPATCH.md.
Kartik arranges read-only Claude review and separate Astra architecture gate, disposes findings, and approves integration only after fixes/re-review.
Existing lint defects are assigned to S0. Any exception to an all-green app merge gate must be explicitly acknowledged as a docs-only inherited-baseline exception; never silently waive it.
No dependent builder is running. Bootstrap must be reviewed/integrated before S0; S0 before S1; S1 before parallel consumers.
