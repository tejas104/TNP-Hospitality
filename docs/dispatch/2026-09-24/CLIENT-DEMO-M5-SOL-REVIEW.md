SESSION TYPE: NEW SESSION
DO NOT REUSE AN OLD SESSION.

# Claude client-demo M5 - independent Sol review packet

Status: read-only assessment complete, **CHANGES REQUESTED** at exact `15502c3bfdc0ba3e8df9a39a0cc8a04b83340e8d`; see `docs/reviews/TNP-CLIENT-DEMO-M5-SOL-REVIEW.md`. P appointed independent collaboration reviewer `/root/m5_sol_review`, thread `01a0d429-6843-7bc1-8be6-295016aaaa64`, on DESKTOP-DL9FDM7. The reviewer could not inspect runtime model/effort metadata during its turn; P subsequently verified its own session JSONL `turn_context` records actual `gpt-6-sol` / high. Review path remained clean detached `D:\TNP-review\TNP-CLIENT-DEMO-M5-15502c3`. The reviewer had no writer lease. This appointment does not authorize integration.

## Fixed repository facts at 2026-09-24 preflight

- Repository: D:\TNP Hospitality.
- Main/local/remote: 831597573fe6898f8a19e5cf416d36a364c3544b.
- Claude branch: claude/tnp-client-demo-m5, remote-equal docs tip 42ada80e0ef448e5262c6d7b18057bf28592dfb6.
- Exact application code target: 15502c3bfdc0ba3e8df9a39a0cc8a04b83340e8d. The two following commits are docs-only; read them for author claims, not as independent proof.
- Earlier aggregate be78ffa7de22a971e4122ff378b8bf7ccc99cd92 and completion 8062b5a3b296c838fb6fa0b784b84ced5e06cbbe are ancestors of this target. Review one combined frontend range from merge-base e4fab8e2f9874a7d2df51a9bc55f3c33c2e86a66 through 15502c3; do not count ancestor candidates as extra queue items.
- Main advanced on a separate docs line after e4fab8e. It is not an ancestor of M5, so the old Claude handoff's fast-forward assertion is stale. Do not merge or push during review.

## Review requirements

Read AGENTS.md, TNP-START-HERE.md, PRODUCT, DESIGN, DOMAIN-RULES, ARCHITECTURE, ADR-0008 and the M5 handoff. Verify actual repo state rather than following stale prompt assertions; the M5 handoff also calls the backend absent, while main contains the platform foundation. Use a clean detached review worktree at code SHA and do not edit it.

Prioritize product boundaries and privacy: public Clients have no login; the public launcher has Planner and Careers/Freelancer only under ADR-0008; Operations stays internal; RSVP remains message/information-only. In M5, PortalLauncher maps demoWorkspaces to four public dock entries, and HomeExperience replaces the approved cube with a moving photo hero. Treat both as findings needing DEC-38 product disposition or correction. Seeing the demo is not acceptance.

Then review the combined frontend diff for correctness, route compatibility, source/fixture provenance, data persistence claims, accessible responsive interaction, keyboard/touch/reduced motion and meaningful 19-set evidence. Check admin-console replacement of the old Operations desk and all lost or carried-over capability/attendance/reporting behavior. Inspect Planner navigation anchors and the Freelancer synthetic-state boundary. Review homepage typography/content measurements independently before using them as implementation criteria.

Run focused tests, lint, nonincremental TypeScript, diff check, Vercel build and real browser matrices at 1440/1100/390/320 including the public dock, hero, Planner, Careers, admin console, RSVP and mobile overflow/focus. Record initial build failure and at most one unchanged environmental retry after stopping only owned processes; do not normalize repeated failures away.

Return P0-P3 findings with exact code file/line, reproduction and proposed correction; exact commands/results; missing evidence; and a fixed-SHA verdict. Kartik acceptance and a separately reviewed integration plan remain mandatory. No main merge, provider action or deployment.
