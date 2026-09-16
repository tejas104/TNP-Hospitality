# Start here

P is the architect in the current session and has prepared the bootstrap directly. Do not ask the user to run another setup prompt.
Confirmed humans: Anjaneya H1 and Kartik H2. A/B are demand/public/shared; C/D are workforce/Operations. R is separate read-only review. No H3/E.
Read AGENTS.md, PRODUCT.md, DESIGN.md, STATUS.md, LANES.md, then the assigned task. Domain work also reads DOMAIN-RULES.md, ARCHITECTURE.md and contracts.

## Next human action
Kartik opens a separate Claude review at the fixed bootstrap SHA given in the handoff and a fresh independent Astra review at that same SHA. Prompts are in DISPATCH.md.
Reviews begin read-only. Send findings to P; P fixes under B. Human integration comes after review and appropriate check disposition.
The documentation branch inherits baseline lint failures; see BASELINE.md. Do not call it green or silently waive the main gate.

## Next development order
1. Review and integrate TNP-BOOT-01.
2. Dispatcher records the actual merge SHA, launch fields and lease; B implements TNP-S0.
3. Review/integrate S0; B implements TNP-S1 at the new exact baseline.
4. Review/integrate S1; start only Ready independent tasks. Initially one builder per human (A-01 and D-01), then rotate public/workforce as capacity allows.
5. Human reviews and integration continue between short tasks. At two waiting reviews stop dispatch.
6. D3 actual F01–F16 review-ready count; D4–6 F17–F20/accepted feedback. Release still requires separate authorization.

All downstream contracts are Draft; no app builder was launched by this task. Model, reviewer, host and path suggestions are not launch evidence.
Only copy selected TNP reference files. Repository already carries them in this branch with provenance; after human integration/authorized sharing, other laptops receive the same commit and verify skills in a fresh session. Do not claim “uploaded to all chats” or “installed on Laptop 2”.
See CLEANUP.md for intentionally preserved local user files and config.

Integration details and the original untracked-reference collision: docs/INTEGRATION.md. Follow only after independent reviews and human authorization.
