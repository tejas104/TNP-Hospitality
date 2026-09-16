# Bootstrap review intake and author dispositions

Both supplied reports reviewed b0e1d70f7730a2779dc053cc7f24081ee7db012d. Raw text and SHA256 provenance are in received/. These are reports relayed by the user, not locally observed review sessions.
The first report labels itself R-Astra but declares Claude Opus 5: treat it as Claude-family review only, changes requested. The second reports verified gpt-6-astra/low and changes requested, with prior Dev D orientation (not fresh context). Neither passes the required gate. Corrected candidate: new immutable tnp-bootstrap-review-02, full SHA in P's handoff. No prior approval carries forward.

| Finding | Author disposition and correction | Remaining evidence |
|---|---|---|
| Astra P1 S1 circular journey | Accepted: service-level journey in S1; browser journey scheduled at I01 after all consumers | S1/I01 implementation and acceptance pending |
| Astra P2 / Claude H2 TypeScript imports | Accepted: S1 owns only allowImportingTsExtensions; explicit relative runtime .ts and import type; Node host differences stated | Builder must pass Node tests and tsc; no app/config edit in bootstrap |
| Astra P2 / Claude M5 missing shared operations | Accepted: consumer matrix includes catalogues, replacement, nonresponse, collection, enquiry, GPS/standing and finance states; async/request-key outcomes defined | S1 mapping/tests and both human semantic approvals pending |
| Astra P2 / Claude H3 launch ambiguity | Accepted: separate SOURCE_SHA and externally supplied LAUNCH_SHA; Ready contract commit has no self-reference; initial HEAD equals LAUNCH_SHA | Actual Ready packets remain unissued; ancestry/diff/lease checks at launch |
| Claude H3 checker scope | Accepted: bootstrap snapshot clearly named; --provenance-only for later use; unrelated untracked files ignored unless --strict-untracked requested | Neither mode certifies task dispatch |
| Astra P2 / Claude L10 S0 conflict | Accepted: narrow extraction/navigation/truthful-copy acceptance; no self dependencies | Later feature gaps stay open |
| Claude H1 Astra routing | Access evidence updated from real Astra report; fresh Kartik Astra session preferred with separate Anjaneya-host fallback; no self-review/gate waiver | Fresh session appointment still needed; account entitlement not inferred |
| Claude H4 omitted invariants | Explicit uniqueness, serialization, attendance, scan and batch rules retained; taxes/multi-role and reviewer additions recorded as pending DEC-14..16 | Production design/tests and client policy decisions pending |
| Claude M6 capacity | One waiting review per human plus global two limit; named preferred hosts; no silent Day-3 scope cuts | Actual slots and any client-agreed scope change pending |
| Claude M7 sharing | Explicit pusher/ref authority in every Ready packet; no force-push/moved review tags | Future branch authority must be recorded, not invented |
| Claude M8 preview claims | Copy-only neutralization and no-real-PII warning assigned to S0 | Browser copy checks when S0 executes |
| Claude M9 paste safety | Removed interactive multi-line setup recipe; single read-only review prompt detects D: paths and pins exact target | Reviewer reports actual worktree setup; no install in wrong directory |
| Claude L11 architect identity | P identified by STATUS session, not whoever reads AGENTS | No new architect/writer inferred |
| Claude L12 co-design/review | H1/H2 semantic approvals explicit, H2 co-design acknowledged, independent AI review retained | Human approvals pending |
| Claude L13 paths/models | All current planned writer/review paths D:; actual clone distinction retained; codex/ is a branch convention | Node24 compatibility/fresh session models pending |

This table records author fixes, not independent acceptance. Main remains unmerged; no application task is Ready. Review the whole baseline-to-new-candidate diff plus these dispositions. P does not certify architecture authored here.
