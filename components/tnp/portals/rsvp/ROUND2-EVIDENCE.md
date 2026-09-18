# RSVP round-2 bounded correction evidence

- Writer: `/root/rsvp_astra_refiner`, process `01a0b5da-a640-7d92-b88e-519d07dbe96f`, orchestrator-verified `gpt-6-astra` / medium.
- Contract: `8584a287d999503d201d0d461d026d7ae23c3f67`, read via git show; no main merge.
- Parent: `177cf3057b31f19d618e5a8f6a3ae3706165cca5`, verified clean/remote-equal before edits. Existing worktree `D:\TNP-worktrees\TNP-RSVP-CLAUDE-M1`, branch `codex/tnp-rsvp-claude-m1`, host `DESKTOP-DL9FDM7`; port 3107 was free.

## Two corrections

Import row receipts bind organization, event, persona, batch, original row slot, row key and normalized full material fingerprint (every mapped value, household key and resolved function IDs). The original row slot prevents a changed name/party from escaping the guard by regenerating its preview key. All row identities are checked before applying any row, so a later conflict cannot leave earlier rows partially applied. Failed transient rows retain the fingerprint and permit only an exact retry. Accepted/skipped rows replay only in scope. Household grouping maps are scoped to organization/event/persona/batch/party key and are consulted only after row identity validation, preserving multi-member household imports. Request function arrays and returned outcomes are copied to avoid mutable aliases. Existing legacy receipt keys are not reused by the versioned scoped keys.

Movement grouping uses normalized actual origin and destination, leg direction, transfer kind, transport mode, local date and three-hour window. Equal routes aggregate passengers; different endpoints or modes conflict when a vehicle is already held in the same window. Incomplete endpoint pairs are not pooled. Manifest identity uses the complete key instead of location-label length. Existing stale-version, lifecycle and atomic prospective-manifest guards remain intact.

Only adapter/logic plus focused tests and evidence changed. Cleared TSX/CSS/design/motion files and Round-1 screenshots remain untouched.

## Verification

- Full discovered Node suite: `node --experimental-strip-types --test --test-reporter=spec` over all 15 `*.test.mjs` files: **133/133 PASS**, no skips. Includes 61 RSVP tests, of which 24 are new Round-2 cases.
- Matrix covers exact replay; changed phone/email/functions/party name/reference/priority/language/accompanying/member/age material; resolved function changes; regenerated row keys; no mutation when a later row conflicts; same-org/different-event; different-org/event; different persona; failed-row retry; new-batch reference skip; normalized same-route capacity; flight/train; flight/bus including drop; same-mode different origin/destination; direction; different window; stale/illegal movement writes.
- `npm run lint`: exit 0, only three inherited React compiler warnings in `hooks/use-mobile.ts:16` and `components/tnp/AppShell.tsx:79,116`.
- Focused `oxlint` for all changed JS/TS files: exit 0, no warnings.
- `npx --no-install tsc --noEmit --incremental false`: exit 0.
- `npm run build:vercel`: first attempt PASS, no EBUSY retry needed. Task-owned server/browser were stopped before build. Existing optional dependency-trace/plugin timing notices remain.
- `git diff --check`: exit 0 (Windows line-ending notices only).

## Focused real browser reproduction

Harness: `round2-browser.mjs`, using the same preinstalled Playwright Core and Chrome fallback documented in `CORRECTION-EVIDENCE.md`; no packages installed. Origin `http://127.0.0.1:3107`.

- Desktop import UI: valid five-row sample, partial-import scenario, one failed row, retry that eligible row, all ready rows imported: PASS.
- Browser-loaded actual adapter modules: exact receipt replay, changed phone conflict without mutation, same batch/row key used in another organization without replay leakage: PASS.
- 390px movements UI: actual terminal endpoints displayed; same-mode Terminal 1 versus Terminal 2 in the same window rejected despite 12-seat capacity: PASS. No document overflow.
- No browser page errors. Browser closed; development server stopped; port 3107 free.

Round-1 broad UI/design/browser evidence remains applicable to unchanged files; this pass intentionally did not repeat that complete matrix. All data and actions remain synthetic and provider-disabled. Independent fixed-SHA acceptance and Kartik review remain pending; no main push, merge, deployment or provider activation occurred.
