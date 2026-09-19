# Round-5 compatibility correction evidence

Writer `/root/rsvp_astra_refiner`, process `01a0b5da-a640-7d92-b88e-519d07dbe96f`, orchestrator-verified `gpt-6-astra` / medium on `DESKTOP-DL9FDM7`.

Initial contract `8b7ffbb9b0c38df23caa7417c928a42fea6f32f8`; serialized manifest-scope clarification `58180d8c5440c3571eb00bdf5e3b3a16422e8699`, read via `git show`, not merged. Baseline `e142cf2713df8ced51c5ce67334a4a2f93e0a5e9` was clean/live remote-equal in the existing RSVP worktree/feature branch; port 3107 free.

## Changes

- Exact retained slot/key/material receipts take precedence over reverse-material conflict checks, replaying their own accepted/rejected outcomes. Operational failure still retries; unseen/moved material still conflicts before mutation. Retained Round-3-style duplicate receipt tests use real parser rows and canonical persisted receipts.
- Cleared current travel retains its referenced leg as historical when any transfer still references it; current invitation/upsert selection excludes that persisted historical ID. Active transfers release their plan/vehicle/leg reference; guest-met/completed records retain state, leg, vehicle and plan. Historical snapshots reject staff edits. Restored details use a distinct leg ID and reconnect future dependencies without restoring their plan/vehicle.
- `buildManifests` has only the approved explicit history mode: display includes completed transfers; both adapter allocation/dispatch guard calls exclude completed history. Tests prove completed routes stay visible without blocking assignment/dispatch.
- No UI/CSS/design/motion/shared/dependency/provider changes.

## Verification

- Four Round-5 scenarios: retained accepted/rejected duplicate receipt exact replay and unseen/moved atomic rejection; arrival clearing; departure clearing; completed-history guard isolation. Travel scenarios include history-first ordering, requested/planned/assigned/dispatched plus guest-met/completed, clear with pickup/drop false, persisted null/reload, no dangling references, preserved historical manifests/snapshots, blocked active assignment/dispatch, restored details with distinct IDs and preserved history.
- Full discovered Node suite: **153/153 PASS**; RSVP-only suite: **81/81 PASS**. Command: `node --experimental-strip-types --test --test-reporter=spec` with paths from `rg --files -g '*.test.mjs'` (or scoped to `components/tnp/portals/rsvp`).
- `npm run lint`: PASS; inherited three React compiler warnings only in `hooks/use-mobile.ts:16`, `components/tnp/AppShell.tsx:79,116`. Focused `npx --no-install oxlint` on all changed source/harnesses: PASS without warnings.
- `npx --no-install tsc --noEmit --incremental false`: PASS after final source changes.
- `git diff --check`: PASS; routine Windows LF/CRLF notices only.
- `npm run build:vercel`: PASS on one explicitly P-authorized unchanged diagnostic rerun (exit 0; Nitro output generated). Initial attempt failed in Nitro/nf3 `writePackage`; the retained tail omitted its leading error, so its cause/code/path is unconfirmed and is not claimed as EBUSY. P authorized exactly one diagnostic rerun after no worktree-owned Node process and free port 3107 were verified. No source/dependency change and no third attempt. Heavy-build slot released immediately after success.

## Browser

Existing approved fallback (agent-browser absent, no install): Playwright Core `C:\Users\DELL\AppData\Roaming\npm\node_modules\openclaw\node_modules\playwright-core\index.mjs`, installed Chrome `C:\Program Files\Google\Chrome\Application\chrome.exe`. Set `RSVP_PLAYWRIGHT_MODULE` / `RSVP_CHROME`, run `round5-browser.mjs` against dev origin `http://127.0.0.1:3107`.

PASS in actual Chrome at 390×844: synthetic manager login then all four scenarios executed through browser-loaded real adapter/parser/manifest modules. Assertions cover exact retained accepted/rejected replay, moved conflict, both null travel directions with persisted historical evidence and blocked active assignment/dispatch, distinct restored leg identity, and completed-history allocation isolation. No page errors. These are browser-module behavioral assertions, not a new visual-matrix or rendered historical-manifest UI audit. Initial attempt preceded dev-server readiness and returned connection-refused; final run passed after readiness, with no code change. Browser closed in finally; dev server stopped.

Synthetic frontend evidence only; not server concurrency/provider/production proof. Independent fixed-SHA review and human acceptance remain required. No main integration/deployment.
