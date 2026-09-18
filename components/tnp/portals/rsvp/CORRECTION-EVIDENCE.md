# RSVP correction and refinement evidence

- Writer: `/root/rsvp_astra_refiner`, process `01a0b5da-a640-7d92-b88e-519d07dbe96f`; orchestrator-verified `gpt-6-astra` / medium.
- Host: `DESKTOP-DL9FDM7`; worktree `D:\TNP-worktrees\TNP-RSVP-CLAUDE-M1`; branch `codex/tnp-rsvp-claude-m1`.
- Reviewed parent: `7fb677bb614422e0d7b5a64842b7533e09ec8a7d`.
- Correction contract: `788acbfbc2a0ed296b004e0d9cb338b59d307fc4`, read with `git show`; no main merge.
- Original source: `435b62bb1f66e4c8090f3bf5e15b1fcad8d1b42d`.

## Corrections

Vehicle assignment validates a prospective complete active manifest before mutating any transfer. Existing assignments in the same three-hour date/window contribute passengers; incompatible routes conflict. Assignment, status changes and replanning require the current event data revision. Illegal lifecycle transitions and incomplete/changed travel plans are rejected. The UI shares the adapter transition list and provides stale-data refresh actions.

Room proposals and reproposals enforce category maximum occupancy and inventory inside the adapter. The current stay's existing hold is excluded; party version checks precede writes. Returning a customer proposal preserves its current room when no replacement was requested. The UI subtracts an existing hold only when it actually occupies inventory.

Reports use strict invalidation: an exact scope/content signature includes report kind, filters, rows, columns, counts and event/customer context. Changed scope/content or data revision removes preview and both export actions until a matching new generation. Older sample metadata without a signature cannot export.

Drawer navigation focuses the destination after the native dialog close event; Escape and cancel restore the opener. Calls selection follows the URL party parameter across selection, refresh, deep links and history; foreign-event IDs never resolve to another event's record. Reduced-motion spinners are static.

The bounded CSS refinement preserves TNP colors/composition, shortens the phone event hero, adds light surface depth, and clarifies selected navigation, queue/report choices, changed manifests and step progress. Hover/press travel applies only to fine pointers; reduced-motion overrides remain effective.

## Commands and results

- `node --experimental-strip-types --test components/tnp/portals/rsvp/rsvp.test.mjs components/tnp/portals/rsvp/corrections.test.mjs`: 37/37 PASS.
- All 14 discovered `*.test.mjs` files run through `node --experimental-strip-types --test --test-reporter=spec`: 109/109 PASS, zero skipped.
- `npm run lint`: exit 0, three inherited React compiler warnings in `hooks/use-mobile.ts:16` and `components/tnp/AppShell.tsx:79,116`; not warning-free.
- `npx --no-install oxlint components/tnp/portals/rsvp`: exit 0, no RSVP warnings.
- `npx --no-install tsc --noEmit --incremental false`: exit 0.
- `npm run build:vercel`: first attempt hit Nitro `EBUSY` copying `content-type` into `.vercel/output`; one retry after stopping task-owned server/browser passed. No source changes were made to work around the lock; intervening source edits completed the authorized corrections. Existing optional traceInclude/plugin timing notices remained.
- `git diff --check`: exit 0; Windows line-ending conversion notices only.

## Browser evidence

`agent-browser` was absent. Used the already installed `openclaw/node_modules/playwright-core` with installed Chrome; no installation or dependency change. Reproducible harness: `browser-check.mjs`. Supply `RSVP_PLAYWRIGHT_MODULE` (existing module's index.mjs), `RSVP_CHROME` (browser executable), and optionally `RSVP_ORIGIN`. Origin used: `http://127.0.0.1:3107`, from `npm run dev -- --port 3107 --hostname 127.0.0.1`.

- Overview plus Today, calendar, guests, add-party, import, travel, movements, rooming, messages and documents load without document overflow at 1440x900, 1101x900, 1100x900, 390x844 and 320x844.
- Native drawer: Enter opens; Space activates Calling queue; destination h1 receives focus after close. Escape restores Sections opener.
- Calls: second/third record activation updates party URL; Back, Forward, refresh and direct link display the corresponding party. A foreign event's party ID cannot leak its details.
- Report generation exposes export; changing scope removes export and preview; regeneration restores them.
- Existing vehicle commitment: UI assignment of another two passengers to a three-seat car rejects with `4 passengers exceed 3 seats`. Another route in the same window rejects even with 12 seats.
- Room proposal: three occupants in a two-person category shows the conflict and disables submission. Adapter tests separately exercise inventory, own-hold reproposal, stale versions and atomic rejection.
- Reduced-motion emulation: actual spinner CSS computes `animation-name: none`, `transform: none`.
- Filtered-empty search and clear-search recovery pass.
- 390px mobile context with `hasTouch`, `isMobile`, coarse pointer and reduced motion: drawer touch navigation passes. Guest invitation Begin/Next progression reaches Review directly after all function answers decline, skipping logistics.
- No browser page errors or hydration errors observed. Browser console contained only `/favicon.ico` 404. Development server emitted inherited-looking multiple-renderer/context warnings during HMR; these were not silently treated as browser failures or fixed outside RSVP ownership.
- Final screenshots: `browser-1440.png`, `browser-1101.png`, `browser-1100.png`, `browser-390.png`, `browser-320.png`; captured after finite animations and images settled. Desktop and 390px screenshots visually inspected.
- Phone hero measured 316.5px at 390px and 312.9px at 320px; first status heading appeared around y706/y720 respectively.

These are synthetic local checks, not server authorization, tenant isolation, production inventory, WhatsApp delivery, durable storage, private documents or audit proof. The complete pre-existing import/provider/access scenario inventory was covered by the Node suite, not exhaustively replayed in this browser correction pass. Independent fixed-SHA review and Kartik acceptance remain required.
