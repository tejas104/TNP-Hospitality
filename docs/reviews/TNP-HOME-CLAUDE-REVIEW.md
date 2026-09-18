# TNP homepage external Claude fixed-SHA review

Verdict: **CHANGES REQUESTED**.

- Reviewer: fresh Claude Code session, actual model `claude-opus-5`; effort not visible to the model; DESKTOP-DL9FDM7 / DELL.
- Range: `1700b2521145c923c6dc31f3f1afe184b27dfd34..b1dcac83d29a0c26d490f9ede6dad8bc65f0106d`.
- Worktree: detached, clean and remote-equal with exactly six changed paths.
- Commands: lint, explicit non-incremental TypeScript, 13/13 shared tests, 5/5 WebGL tests, diff check and Vercel build passed; the build passed after one unchanged retry for a Windows `EBUSY` lock.
- Browser: anchors, one main, zero overflow at 1440x900 and 390x844, one capped-DPR canvas, offscreen/manual pause, reduced-motion and unavailable/thrown-WebGL fallbacks, sensible Tab order, visible outlines and no console errors. The inherited Three Clock deprecation warning remained.
- Image accounting: baseline 51 placements; final 38 (74.5%), including 13 inside the collapsed inspiration gallery and five inactive service images.

Required corrections:

1. P2: four small ivory-background body-text rules in `Home.module.css` measure 4.40–4.48:1 and must reach the 4.5:1 WCAG AA threshold.
2. P2: the `#bd8c36` focus outline is 2.67:1 on ivory and must reach 3:1 on light sections.
3. P2/product: the vendor RSVP card needs a real vendor-interest enquiry action rather than only the planner preview. Provider/document claims must remain explicitly planned/disabled.
4. P3/shared: the homepage skip link appears after header controls; fix through a serialized public-shell change.
5. P3/product: Kartik decides whether 13 of 38 retained placements being collapsed is acceptable.

Inherited public-shell corrections needed in a separately authorized shared scope: public `Login` linking to a preview, mobile `Operations Demo`, and public PreviewControls/portal switcher exposure. The reviewer made no edits, commits, pushes, merges or deployments and stopped the server.
