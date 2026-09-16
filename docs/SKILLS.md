# Reviewed custom project skills

Nine custom local skills were read in full before copying. Each selected directory contains only SKILL.md, no scripts, external actions, bundled dependencies or credential resources. Copies are byte-identical; no repository skill existed to reconcile. These are local custom skills, not public marketplace packages.

| Skill | SHA256 | Status |
|---|---|---|
| platform-architect | df50c9102085b8c50a355d53470d8d4b2d6deb3320f1b94ce176b186bb0c9fd2 | Copied in bootstrap branch; independent review/discovery pending |
| web-mobile-platform-contracts | 91412d40e3471b9cfff005ce05d24b033022e7ab526a639861d82f8898257b08 | Copied in bootstrap branch; independent review/discovery pending |
| adr-decision-engineer | 42dc813e81959d5b0c09022afb6392e07fa4e9327896fb373b84c1d0a506b49c | Copied in bootstrap branch; independent review/discovery pending |
| frontend-product-engineer | e0886bc453334bb44e9700b07b947966b0c1fe6caeee29104976e3cd1ea4c381 | Copied in bootstrap branch; independent review/discovery pending |
| design-system-engineer | c343e2fdf4456bfdc037813bc653b5985d6c6e1d5901b42b216eb9880ee9dc74 | Copied in bootstrap branch; independent review/discovery pending |
| code-review-gate | 88a2c5a4c458f4c8274c86b530318bdc06ea24c0aefa61d037f6aec378f77bd0 | Copied in bootstrap branch; independent review/discovery pending |
| testing-quality-engineer | c45baf4157e088ee12edc1ed72aa5496f0b64579d7f480dfae69391496d3f5a7 | Copied in bootstrap branch; independent review/discovery pending |
| e2e-browser-verifier | 3bf8bd9c3cbcd0d82bcb2586a15ef3fc335189dd050848cc5f1d7ff050edb696 | Copied in bootstrap branch; independent review/discovery pending |
| multi-agent-orchestrator | 9c994e62cba22750947eda6aa85adbd7e65747e2efe5c2d7fc363bda198192f9 | Copied in bootstrap branch; independent review/discovery pending |

Source root: C:\Users\DELL\.codex\skills. Per-file absolute provenance in references/MANIFEST.json. No attribution/license text was removed.

Use architecture/contract/ADR skills for relevant design; frontend/design-system for substantive UI; review/testing/browser skills for their proper checks. multi-agent-orchestrator is planning guidance only: root policy prohibits automatic delegation/unregistered writers.

## Available locally but not shared yet
api-engineer, database-architect, auth-security-engineer, realtime-background-engineer, migration-release-safety, devops-release-engineer and production-readiness are locally inventoried but not copied or approved for this bootstrap. Inspect them when relevant tasks begin.
Other local skills (dependency/performance/state-sync/mobile/monorepo/debugging) are not needed in this bounded bootstrap. Built-in system skills are not reinstalled.

## Installation versus discovery
Repository copies exist only in codex/tnp-bootstrap until human review/integration. Fresh Codex session discovery and Claude entry-point compliance must be verified after integration. Laptop 2 has not been observed receiving or verifying these files. It can clone the published candidate for review before main integration; see TNP-START-HERE.md.
Claude's existing skill installation is untouched. CLAUDE.md explicitly directs it to the shared repository rules. No Business purchase, personal config copy or invented marketplace URL.

## Verification on each host
At the exact integrated SHA, run python docs/checks/verify_bootstrap.py, then in a fresh session ask the tool to identify the applicable AGENTS.md, TASK, canonical scope and visible project skill names/paths. Record actual output/host/SHA in a serialized docs handoff. A successful copy is not proof of runtime discovery.
