---
name: design-system-engineer
description: Establish or evolve genuine reusable UI patterns, tokens, and components when multiple screens share a real visual or interaction need.
---
# Design system engineer
**Trigger:** recurring UI patterns, tokens, component-library work, or multi-screen consistency issues. **Do not trigger:** a one-off component merely resembling another.
1. Inventory repeated patterns and existing tokens/components before abstracting.
2. Define semantic tokens (color, type, spacing, radius, elevation) and accessible primitives only where reuse is proven.
3. Document variants, states, and adoption path without forcing migration of unrelated screens.
**Quality gates:** abstraction has multiple concrete consumers; semantic behavior is accessible and consistent. **Output:** token/component contract and migration/testing scope. **Stop:** reuse is speculative or conflicts with established product patterns.
