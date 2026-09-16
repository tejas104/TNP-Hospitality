# Lane and shared-resource register

Updated 2026-09-16 by P. Confirmed humans: Anjaneya (H1), Kartik (H2).
Bootstrap owner: P occupies B solely for TNP-BOOT-01; writing pauses at the local review commit. User directly instructed this session to make repository changes. At preflight only this Codex task was active at this root; Git showed one worktree before bootstrap. No independent B builder was launched. Other-machine processes are not observable; no remote lease is asserted.
Bootstrap worktree: D:\TNP-worktrees\TNP-BOOT-01; branch codex/tnp-bootstrap; base 9d58061f2d36514ebc932fa94bb3dc90f4b97a97. Session ID 01a0aa12-b112-7052-b7de-49e070c4fa09.
Lease state at final handoff: PAUSED FOR REVIEW; no other writer may use it without an explicit handoff. Ownership: AGENTS.md, CLAUDE.md, .gitattributes (source-byte preservation only), docs/**, .agents/skills/** and eight allowlisted deliverables/TNP-*.md references only. No app/schema/provider/config ownership.

| Lane | Human | Host | Tool/model | Work / state |
|---|---|---|---|---|
| P occupying B | Anjaneya | Current local host (Laptop 1 designation) | Codex; config reports gpt-6-astra/high; active override not independently exposed | TNP-BOOT-01; local writer reservation |
| A | Anjaneya | Laptop 1 proposed | Codex; actual setting pending launch | Client/planner; not launched |
| B after P handoff | Anjaneya | Laptop 1 proposed | Codex; actual setting pending launch | S0 -> S1 -> public; not launched |
| C | Kartik | Laptop 2 proposed | Codex; local access/model/path unverified | Workforce; not launched |
| D | Kartik | Laptop 2 proposed; use existing Claude host if necessary | Claude preferred; actual version/effort/host unverified | Operations; not launched |
| R | Opposite human | Available host, scheduled | Opposite author family + independent Astra for risk gate | Read-only; no review started |

No H3/E assignment. Normal concurrency two; expand to four only with human capacity. Original absolute ceiling five has no fifth task in this roster.
Proposed ports A=3101, B=3102, C=3103, D=3104. None reserved or listening by this task. Review browser/build slots are serialized with the human owner. Preview test data uses per-task browser profiles and namespaced synthetic storage; no DB/webhook/job resources exist yet.

## Launch evidence required in TASK
Actual host and absolute worktree, branch, model/effort, current baseline, each merged dependency SHA, resource/port availability, owned/forbidden paths, reviewer appointment, human capacity, lease owner/session/time and next check.
Worktree suggestions are not leases. Never mark another laptop running from a prompt alone.
A/B human reviewer Kartik; C/D reviewer Anjaneya. AI reviewer follows actual author, not historical lane labels.
Only P/captain in a reserved docs task updates this shared register. Source review is read-only; fixes return to the builder.
