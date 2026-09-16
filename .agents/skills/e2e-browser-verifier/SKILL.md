---
name: e2e-browser-verifier
description: Behaviorally verify significant frontend flows with browser automation when a runnable application and suitable tooling are available.
---
# E2E browser verifier
**Trigger:** significant frontend functionality, interaction, layout, auth flow, or release verification. **Do not trigger:** no runnable UI, backend-only work, or a trivial static edit.
1. Start or locate the approved app environment and inspect relevant flows.
2. Verify load, console errors, navigation, forms, desktop/mobile layouts, loading/error states, auth, and important motion where applicable.
3. Prefer behavioral assertions; capture reproducible evidence for failures.
**Quality gates:** key user flows succeed at relevant viewports with no unexplained console errors. **Output:** scenarios run, evidence, failures/limitations. **Stop:** credentials, external environment, or test data is required but unavailable.
