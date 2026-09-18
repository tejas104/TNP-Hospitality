# Round-3 bounded correction evidence

- Writer: `/root/rsvp_astra_refiner`, process `01a0b5da-a640-7d92-b88e-519d07dbe96f`, orchestrator-verified `gpt-6-astra` / medium; host `DESKTOP-DL9FDM7`.
- Contract: `5ba3f7252e331bf19c470982ef5481b899e5a69e`, read with `git show`, not merged.
- Reviewed parent: `87e91f9eea7ef3a317a0f16cb3381df2bf7365dc`; existing worktree `D:\TNP-worktrees\TNP-RSVP-CLAUDE-M1`, branch `codex/tnp-rsvp-claude-m1`, initially clean/remote-equal and port 3107 free.
- Scope: adapter plus this evidence and two regression harnesses only. No UI, CSS, design, motion, shared contract, dependency or provider changes.

## Corrections

Import remembers rejected/unresolved as well as accepted/skipped/failed outcomes. A scoped reverse index derived from persisted receipts checks row keys against original slots, alongside the material fingerprint check, before processing any rows. This includes existing Round-2 receipts and conflicting duplicate keys within one request. Exact final outcomes replay; exact operational failures retry; new batches retain stable-reference skips.

Existing guest travel legs persist normalized origin/destination/reference along with mode/time. Material route changes release active dependent vehicle assignments and invalidate their plan basis in the same mutation. Replanning and capacity-checked reassignment are required before dispatch. Staff time/reference edits use the same invalidation. Historical met/completed movements are not reversed.

## Checks

- `node --experimental-strip-types --test --test-reporter=spec` over every `rg --files -g '*.test.mjs'` result: **143/143 PASS**, no skips. Includes 10 new Round-3 cases: accepted row moved slot with preceding fresh row, rejected/unresolved replay and material/slot conflict, duplicate key slots, failed retry/new-batch skip, arrival origin, departure destination, mode-only, reference-only and time-only travel updates with blocked dispatch until replan/reassignment and current route keys.
- `npm run lint`: PASS; three inherited React compiler warnings only in `hooks/use-mobile.ts:16` and `components/tnp/AppShell.tsx:79,116`.
- Focused `npx --no-install oxlint` for adapter and both new harnesses: PASS without warnings.
- `npx --no-install tsc --noEmit --incremental false`: PASS.
- `npm run build:vercel`: PASS first attempt, no EBUSY retry needed.
- `git diff --check`: PASS (Git reports routine LF/CRLF conversion notice only).

## Focused real browser

`agent-browser` is absent; no installation performed. Approved fallback is existing Playwright Core at `C:\Users\DELL\AppData\Roaming\npm\node_modules\openclaw\node_modules\playwright-core\index.mjs` with installed Chrome at `C:\Program Files\Google\Chrome\Application\chrome.exe`.

Run `round3-browser.mjs` with those paths in `RSVP_PLAYWRIGHT_MODULE` / `RSVP_CHROME`, against `npm run dev -- --port 3107 --hostname 127.0.0.1`.

PASS at 390×844: synthetic manager login; real browser-loaded adapter accepted-row moved-slot conflict without event mutation, rejected exact replay and changed-material conflict, normalized endpoint persistence and atomic plan release with dispatch blocked. Reloaded actual Movements UI renders `Terminal 2 → Lake Hotel (flight)`, shows changed-plan warning; clicking actual Replan button persists the new basis. No horizontal overflow or page errors. Browser closed in finally; dev server stopped before build. Initial harness attempts used UTC instead of adapter-local day and then an incorrect helper import; harness corrected, final run passed unchanged application code.

These are synthetic local adapter checks, not server concurrency/provider/production proof. Round-1 broad responsive/keyboard/motion evidence and Round-2 route/scope regression coverage remain unchanged; this round intentionally does not repeat the full visual matrix. Independent fixed-SHA review and human acceptance remain required.
