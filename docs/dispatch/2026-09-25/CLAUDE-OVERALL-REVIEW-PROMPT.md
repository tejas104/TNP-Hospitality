SESSION TYPE: NEW SESSION

# Independent Claude overall review and refinement suggestions — TNP Hospitality

Open a **new** Claude review session. Reusing any previous author or reviewer session is forbidden. Work read-only: do not edit files, commit, push, merge, deploy, change MongoDB/Meta/provider settings, or use real personal data. Record your actual model, effort if exposed, host, worktree, branch, exact HEAD and Git status before reviewing. If these differ from the refs below, report the mismatch and review the verified refs by exact SHA in clean detached checkouts.

## Repository and source of truth

- Canonical project: `D:\TNP Hospitality`. Read `AGENTS.md`, `TNP-START-HERE.md`, `docs/PRODUCT.md`, `docs/DESIGN.md`, `docs/DOMAIN-RULES.md`, `docs/ARCHITECTURE.md`, `docs/REVIEW-CADENCE.md`, relevant ADRs/contracts/tasks and `docs/decisions/CLIENT-DECISIONS.md` before judging scope. Current user decisions and these canonical documents outrank historical proposals. Do not infer acceptance because a client viewed a branch.
- Documentation-only local main checkpoint when this prompt was prepared: `499e5bdd00eeead87196367003eb5b38dfdd404a`; `origin/main` was `10f149472c06fa8ad7855bf24f21e4fa9a41c94f`. Recheck live. The local main commit has not been pushed.
- Latest combined local candidate: `3334a14dbb600fa09387734bbadbea378e5560b8` on `codex/tnp-rsvp-fullstack-20260924`, clean at `D:\TNP-worktrees\TNP-HOMEPAGE-REDESIGN-20260924`, with an existing clean detached review checkout `D:\TNP-review\TNP-RSVP-BACKEND-3334a14`. This branch is not integrated or remotely published. It descends from Claude M5 application SHA `15502c3bfdc0ba3e8df9a39a0cc8a04b83340e8d`; M5 docs tip is `42ada80e0ef448e5262c6d7b18057bf28592dfb6`.
- A newer **RSVP correction candidate**, `d883a8d654840e12176efd9ec1959adff0763986`, is clean on `codex/tnp-rsvp-correction-20260925` at `D:\TNP-worktrees\TNP-RSVP-CORRECTION-20260925`; its correction-only diff is `b6e622680f5097265288ae94671bbeff43065607..d883a8d`. It is undergoing focused independent Sol re-review and is not accepted or integrated. Review this as the latest backend correction while assessing the aggregate frontend still inherited from M5/`3334a14`.
- Read `docs/reviews/TNP-CLIENT-DEMO-M5-SOL-REVIEW.md` and `docs/reviews/TNP-RSVP-3334A14-SOL-REVIEW.md` from canonical main. M5 has three P1/two P2 findings. RSVP `3334a14` has two P1/two P2 findings. Both are **CHANGES REQUESTED**; neither review or any local test proves production readiness. Reproduce or challenge each finding on exact code rather than copying verdict text.
- The `d883a8d` correction reports fixes for the four RSVP findings with 161/161 tracked tests and a final build, but the real Mongo replica-set race test skipped because no isolated URI was configured. Independently inspect those changes and keep their review status separate from the older `3334a14` verdict.

## What to review

Review the latest combined candidate against the actual product requirements, including desktop, 1100px, 390px and 320px layouts; keyboard, focus, reduced motion, 200% zoom, readable typography, real navigation targets, empty/loading/error states and truthful synthetic preview labels. Inspect the public homepage, nav/dock, Contact and service/catalogue pages; Planner, Careers With Us, RSVP and internal Admin/Operations workspaces. Identify dead links, broken flows, data that appears live but is browser-local, and duplicated or contradictory screens.

Assess the requested product direction: Teal/Beige is the default (`#008080` primary with approved supporting neutrals); Gradient is the second selectable theme. Site-wide scope and exact stops remain DEC-37, so propose a coherent token and contrast plan without inventing client approval. Public human-facing Freelancer copy becomes **Careers With Us** and Hostess becomes **Hostess/Welcome Girls**. Worker profile should cover normal staffing data, photo, availability, and Operations use. Aadhaar/passbook/bank details require private storage, authorization, consent, retention, audit and payout-policy decisions before real upload is enabled. No real personal documents in fixtures or screenshots.

Inspect RSVP backend API and browser UI separation, tenancy and event authorization, replay/idempotency, event-close concurrency, shared-contact suppression, consent evidence, exports, provider-disabled state, missing real sign-in/recovery and Meta WhatsApp approval dependencies. Clients have no login. RSVP covers WhatsApp messages, replies and information collection, with no booking, dispatch, calls or payment. Distinguish development candidate, integration evidence, provider approval and launch readiness.

## Deliverable

1. **Findings first:** severity P0–P3, exact absolute file and one-based line, affected user/data, a reproducible path or code reasoning, and a concrete suggested fix. Separate confirmed defects from plausible risks and product decisions.
2. **Refinement suggestions:** a short prioritized list for visual polish, content/copy, accessibility, information architecture, frontend/backend contracts, and operational workflow. Give specific affected screens/components and a testable acceptance criterion for each; avoid generic aesthetic advice.
3. **Coverage map:** for each major surface, mark working, partial, missing or unverified, and label browser-local preview versus API-backed behavior. State which checks you actually ran, viewport/origin, results, and what could not be verified because configuration or providers are absent.
4. **Execution order:** propose small non-overlapping correction slices with owned paths, dependencies and review gates. Preserve the user's full frontend + backend goal; identify the first safe implementation slice. Kartik retains fixed-SHA human acceptance, Anjaneya product/visual decisions, GPT-6 Astra/low authors new UI, and independent Sol review covers security/data/concurrency. Your review is read-only and does not issue a writer lease.

Keep the report concise and evidence-led. Do not claim the earlier M5 branch or latest RSVP candidate is accepted, integrated or live.
