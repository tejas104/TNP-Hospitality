# Round-4 minimal adapter correction

Writer `/root/rsvp_astra_refiner`, process `01a0b5da-a640-7d92-b88e-519d07dbe96f`, orchestrator-verified `gpt-6-astra` / medium on `DESKTOP-DL9FDM7`.

Contract `e6b5bc1f619c78eac3da18b6c0bb6ffa1a54f490` read with `git show`, not merged. Existing `D:\TNP-worktrees\TNP-RSVP-CLAUDE-M1`, branch `codex/tnp-rsvp-claude-m1`, initially clean and live remote-equal at `992b00d49ee1209e0289c2167fad5408318bd2e8`, port 3107 free.

## Bounded changes

- Import preflight additionally derives a batch-scoped material reverse index from canonical receipt values/function IDs, excluding parser line/key. This works with retained earlier receipts, rejects moved material and same-request duplicate material before mutation, and retains slot/key checks. Different household members remain distinct; existing scope/replay/retry/skip tests remain passing.
- Null arrival/departure removes the obsolete leg and invalidates/releases every active dependent movement, including assigned and dispatched records. Dependencies become awaiting-details with null leg, vehicle and plan basis. Restored details reconnect those dependencies without restoring a vehicle or plan; staff must record planning and capacity-checked assignment before dispatch. The non-null route update path is unchanged.
- Only adapter, Round-4 tests/browser harness and this evidence changed. UI/design/motion remain frozen.

## Verification

- Six new Node regressions use actual `previewImport` output after blank-line insertion and reordering, verify household grouping, exact replay, fresh-row-plus-moved-material atomic rejection, first-request duplicate material rejection, and both null travel directions with two active dependencies. Null persists after adapter reload; dispatch/assignment/replan reject without details; restore details, plan, assign, then dispatch succeeds.
- All discovered tests: `node --experimental-strip-types --test --test-reporter=spec` with `rg --files -g '*.test.mjs'`: **149/149 PASS**.
- All RSVP-local tests using `rg --files components/tnp/portals/rsvp -g '*.test.mjs'`: **77/77 PASS**.
- `npm run lint`: PASS; only inherited React compiler warnings at `hooks/use-mobile.ts:16`, `components/tnp/AppShell.tsx:79,116`.
- Focused `npx --no-install oxlint` on adapter and both new harnesses: PASS, no warnings.
- `npx --no-install tsc --noEmit --incremental false`: PASS.
- `git diff --check`: PASS; routine Windows LF/CRLF notice only.
- `npm run build:vercel`: PASS first attempt; no EBUSY retry.

## Real browser

No agent-browser executable is installed; used the previously approved existing Playwright Core/installed Chrome fallback, without dependencies added. Run `round4-browser.mjs` with `RSVP_PLAYWRIGHT_MODULE=C:\Users\DELL\AppData\Roaming\npm\node_modules\openclaw\node_modules\playwright-core\index.mjs` and `RSVP_CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe`, against `npm run dev -- --port 3107 --hostname 127.0.0.1`.

PASS at 390×844: synthetic manager login; real browser-loaded parser/adapter inserted-blank-line conflict without mutation; both arrival and departure cleared to null, persisted/reloaded; obsolete legs and active plan/vehicle references absent; attempted dispatch and assignment rejected. Reloaded actual Movements UI displays no planned movements and no obsolete manifest. No horizontal overflow or page errors. Initial harness run used an incorrect heading label; corrected to the actual `Movement manifests` heading and final run passed with application code unchanged. Browser closed in finally and dev server stopped before build.

This is synthetic frontend adapter evidence, not production/server concurrency or provider proof. No full visual matrix repeated for this adapter-only delta. Independent fixed-SHA review and human acceptance remain required; no main integration/deployment performed.
