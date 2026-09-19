# Round-6 identity and current-intent correction

Writer `/root/rsvp_astra_refiner`, process `01a0b5da-a640-7d92-b88e-519d07dbe96f`, orchestrator-verified `gpt-6-astra` / medium on `DESKTOP-DL9FDM7`.

Contract `9ba6ff14a5f640253e667074de2e1bb5b8223aa1` read via `git show`, not merged. Existing RSVP worktree/feature branch verified clean/live remote-equal at `4ce52f1885e6fd326257c530b7a49d7aee051efc`; port 3107 free before start.

## Minimal changes

- New pickup/drop transfer IDs check every retained ID, incrementing the persisted sequence suffix until collision-free. Exact submission replay returns before allocation; historical IDs are never reused.
- Invitation pickup/drop projection uses only requested, awaiting-details, planned, assigned and dispatched transfers. Historical guest-met/completed, cancelled and not-required records do not represent current guest intent.
- `logic.ts`, import/history behavior, UI/TSX/CSS/design/motion and dependencies remain unchanged.

## Verification

- Four focused scenarios cover both pickup and drop: three complete clear/restore/lifecycle cycles with historical base/suffixed IDs, exact replay without new allocation, globally distinct transfer IDs, targeted planned/assigned/dispatched/guest-met/completed mutations and unchanged history; all nine transfer-state projections; clear/reload false; unchanged projected false cannot resurrect cancellation; history remains in manifests.
- Full discovered Node suite: **157/157 PASS**. RSVP-local suite: **85/85 PASS**. Run `node --experimental-strip-types --test --test-reporter=spec` with test paths from `rg --files -g '*.test.mjs'`, optionally scoped to `components/tnp/portals/rsvp`.
- `npm run lint`: PASS with only inherited React compiler warnings at `hooks/use-mobile.ts:16`, `components/tnp/AppShell.tsx:79,116`.
- Focused `npx --no-install oxlint` on adapter and Round-6 harnesses: PASS without warnings.
- `npx --no-install tsc --noEmit --incremental false`: PASS.
- `git diff --check`: PASS, routine Windows LF/CRLF notice only.
- `npm run build:vercel`: PASS on the single permitted unchanged retry, exit 0 and Nitro output generated. First attempt failed with confirmed `EBUSY` copying `node_modules/negotiator/node_modules/content-type/package.json` to `.vercel/output/functions/__server.func/node_modules/.nf3/content-type@2.1.0/package.json` under this worktree. Browser/dev server were stopped; no task-owned Node process and free port 3107 reverified before retry. No source/dependency changes between attempts. Root assigned the serialized heavy-build slot before start; released immediately on success.

## Browser

Existing approved fallback, no install: set `RSVP_PLAYWRIGHT_MODULE=C:\Users\DELL\AppData\Roaming\npm\node_modules\openclaw\node_modules\playwright-core\index.mjs` and `RSVP_CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe`, then run `round6-browser.mjs` against `npm run dev -- --port 3107 --hostname 127.0.0.1`.

PASS in actual Chrome at 390×844: synthetic manager login and all four scenarios through actual browser-loaded adapter modules. Pickup/drop unique multi-cycle IDs, replay stability, ID-targeted lifecycle changes, current-intent projection/reload/no resurrection, and retained historical manifests all asserted; no page errors. Browser closed in finally and server stopped. This is browser-module behavioral proof, not a repeated visual matrix or rendered guest-form interaction audit.

Synthetic frontend evidence only, not provider/server concurrency/production proof. Independent fixed-SHA review and human acceptance remain required; no main integration/deployment.
