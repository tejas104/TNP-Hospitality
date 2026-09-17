# Environments, models and commands

## Observed local setup
Original checkout D:\TNP Hospitality, main at 9d58061f2d36514ebc932fa94bb3dc90f4b97a97; origin https://github.com/tejas104/TNP-Hospitality.git. Remote main was verified at that SHA; the current bootstrap target is recorded in OPERATING-POLICY.json. Earlier review tags are immutable history. Verify current remote evidence at handoff.
Bootstrap checkout D:\TNP-worktrees\TNP-BOOT-01 on codex/tnp-bootstrap. Keeping it outside the source tree avoids tsconfig's recursive **/*.ts include pulling in nested worktrees.
Node v22.23.2, npm 11.8.0, Git 2.47.1.windows.2. package engine >=22.13.0. Record the actual toolchain inside every new Windows/application profile before launch.
Codex local tool catalog exposes gpt-6-astra, gpt-5.6-sol, gpt-5.6-terra, gpt-5.6-luna and gpt-5.5. Local config reports gpt-6-astra/high. Config is not proof of a per-session override or other-host entitlement.
Claude command exists at C:\Users\DELL\AppData\Roaming\npm\claude.ps1; installed skills were not changed. Historical Kartik Laptop2 evidence remains D:\TNP-Hospitality on DESKTOP-VO8G3GR, Node24.19.0/npm11.17.0/Python3.11.9 and Claude Code2.1.273. For future launches the user authorizes Kartik to operate team-assigned Claude and Antigravity-hosted Codex on Laptop1 / DESKTOP-DL9FDM7 under a separate assigned profile/seat. Antigravity does not prove the underlying Codex model, effort, identity or filesystem isolation; every task must report them in preflight. Do not copy personal auth/config folders or infer entitlement from another profile.

## Commands actually defined
| Command | Purpose |
|---|---|
| npm ci | Locked clean install in each isolated worktree |
| npm run lint | oxlint; inherited findings in BASELINE.md |
| npx --no-install tsc --noEmit | TypeScript; may write ignored tsbuildinfo |
| npm run build:vercel | Local Vinext/Nitro Vercel output; does not publish |
| npm run dev | Vinext development; inspect actual printed origin |
| npm run build | Vinext build using existing alternate config; not baseline-validated |
| npm run start | Wrangler dist/server/wrangler.json; not a Vercel-output launcher |
| npm run format | oxfmt; mutates files, not a verification substitute |

No npm test/typecheck/test:e2e scripts exist. Future task test commands must name the files/harness that task adds; do not report them as existing.
Sandbox Node path resolution on D:\ previously returned EPERM; elevated approved checks worked. This is an environment limitation, not evidence of a source bug. Bootstrap sibling-directory commands also require appropriate filesystem access.
Do not share writable node_modules/build caches across worktrees. Start one heavy build/browser run per laptop by default.

## Environment truth
Reference demo URLs are design evidence, deployed SHA unknown. No new preview is published. Production, auth, Mongo, storage, KYC, payment/payout, OTP/push/email and WhatsApp credentials/access are unverified, not configured by this bootstrap.
Use only synthetic preview data and local build checks. Never read/copy .env, .vercel credentials, personal auth/config folders or real client data into the branch.
H2 collects provider test/live readiness evidence, with H1/client decisions for any restricted launch. No production operation or publication is authorized.

Verified CLI help: npm run dev -- --port 3102 --hostname localhost is supported (use each task's reserved port). Help default is 3000; the old README's fixed 3001 is not authoritative. No dev server was launched here.

Current A/D fixed-SHA candidates retain their original execution-host evidence. Future centralized-host launches follow LAUNCH-PROTOCOL.md and must verify profile-local Node/npm/Git/Claude/Codex versions, worktree permissions and ports. Node22.23.2 remains the tested Laptop1 baseline; no account entitlement is inferred from another session.
