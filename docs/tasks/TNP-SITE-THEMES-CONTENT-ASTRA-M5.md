# TNP-SITE-THEMES-CONTENT-ASTRA-M5 - Teal/Gradient system and homepage polish

Status: DRAFT / FRONTEND REVIEW AND PRODUCT DECISION HOLD. No writer, branch, worktree, port, Ready SHA, reviewer appointment or push authority.

Human content/visual owner: Anjaneya. Human fixed-SHA code acceptance owner: Kartik. Required UI author: verified gpt-6-astra. Source must be the accepted/integrated client-demo M5 successor, with its four-workspace dock and homepage cube disposition recorded.

## Scope

- Build two semantic color themes: Teal retains current #008080/ivory/champagne brand; Gradient uses approved stops on large surfaces while text, controls, borders and focus have contrast-safe solid tokens. Teal/Beige is the user-confirmed default and Gradient is the second theme. Site-wide is the working scope; DEC-37 closes exact gradient stops, supporting accents and final coverage. Shared :root/data-theme tokens precede feature adoption; header/workspace switchers store only theme preference and apply before first paint.
- Correct homepage typography using a bounded scale with no rendered text below 12px, 16px normal body copy, readable heading line heights and stable cross-device display font or approved sans alternative. Verify Android and iOS behavior. Typography decisions require Anjaneya sign-off.
- Consolidate homepage copy in data/public-content.ts, remove repeated service eyebrow copy, and use truthful occasion/content data. Hide unsupported trust numbers, testimonials and logos until real client evidence and rights arrive. DEC-11 and DEC-25 gate real proof and public prices.
- Preserve the reviewed homepage composition except changes explicitly accepted in the M5 product disposition. No new homepage cube removal decision is inferred from the demo.

## Proposed ownership

app/globals.css, app/layout.tsx, theme helper, components/tnp/AppShell.tsx, public/homepage components and data/public-content.ts; exact exclusive allowlist before Ready. Planner, Careers and admin adoption use later non-overlapping leases. Keep React/Vinext/Vite/Nitro.

## Acceptance

Both themes and no first-paint mismatch at 1440/1100/390/320, 200% zoom, keyboard/touch/reduced motion, and representative Android/iOS. Computed typography guard catches text below 12px; content has attributable rights and unique service copy. Contrast and focus pass in both themes; representative mobile Lighthouse target is above 80 with exact build/profile recorded. One fixed SHA, independent review, Anjaneya content/visual sign-off and Kartik code acceptance precede integration.
