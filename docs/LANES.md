# Current lane and resource register

Current candidate: tnp-bootstrap-review-04. Review pair: Sonnet + independent Sol. Foundation milestone: TNP-FOUND-01.

| Lane | Human/host | Tool | Current reservation |
|---|---|---|---|
| P occupying B | Anjaneya Laptop1 | Architect Codex session01a0aa12-b112-7052-b7de-49e070c4fa09 | Bootstrap docs corrections only; pauses at candidate handoff |
| A | Anjaneya Laptop1 | Sol preferred, exact setting at launch | NONE; client/planner after foundation |
| B builder | Anjaneya Laptop1 | Sol preferred, exact setting at launch | NONE; first task foundation after approved bootstrap integration |
| C | Kartik Laptop2 | Sonnet preferred, exact setting at launch | NONE; workforce after foundation |
| D | Kartik Laptop2 | Sol preferred, exact setting at launch | NONE; Operations after foundation |
| R | Kartik preferred bootstrap host | Separate Sonnet and independent Sol | Current candidate gate not passed; supplied Sol report used previous DevD context |

Base clones: Anjaneya D:\TNP Hospitality; Kartik D:\TNP-Hospitality. Bootstrap writer D:\TNP-worktrees\TNP-BOOT-01. Future B foundation D:\TNP-worktrees\TNP-FOUND-01, branch codex/tnp-foundation. Future consumer worktrees D:\TNP-worktrees\TASK on their assigned host. Kartik review parent D:\TNP-review. All future paths remain unleased until a Ready packet and actual launch evidence.
S0/S1 have no separate writer or merged dependency record. One B milestone owns their union, checks S0 before S1, and pauses for one foundation review. Only its reviewed integration SHA unlocks consumers.
Normally one builder per human; at most four staffed writers. Pause dispatch at two waiting reviews and do not add work to a human with one waiting review. Proposed ports A3101/B3102/C3103/D3104 are not yet reserved. One heavy build per host by default; synthetic profile per task.
P alone serializes Ready/Building/status commits onto current main through the authorized captain. Builders never race on registers. Ready contracts name SOURCE_SHA/LAUNCH_SHA, actual model/host/reviewer appointments, resource reservation, exclusive lease and exact branch sharing authority. Human review A/B -> Kartik; C/D -> Anjaneya. Checkpoint pushes are inspection evidence, not approval or permission to merge main.
