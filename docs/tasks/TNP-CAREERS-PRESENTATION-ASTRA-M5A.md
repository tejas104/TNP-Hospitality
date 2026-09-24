# TNP-CAREERS-PRESENTATION-ASTRA-M5A - Careers names and synthetic profile

Status: DRAFT / REVIEW CAPACITY HOLD. No writer, branch, worktree, port, Ready SHA, review appointment or push authority. Source must be freshly verified after client-demo M5 fixed-SHA review, product disposition and integration. M5 code tip is 15502c3; docs tip is 42ada80. Neither is on main.

Human owner and fixed-SHA acceptance reviewer: Kartik. UI author must be verified gpt-6-astra under an exact Ready lease; independent Codex review of Claude-authored M5 and this task's fresh reviewer appointment remain separate.

## Result

- Rename visible workforce entry to "Careers With Us" in M5 public navigation, dock/chooser, /people career information, footer, worker workspace and admin-console labels. Keep /freelancer and stored freelancer/worker keys compatible.
- Show "Hostess/Welcome Girls" via one roleKey -> roleLabel formatter in service data, application, opportunity, Planner, admin console and human-facing exports. Submit the existing Hostess key. Include Porter consistently. Do not rewrite historical free text.
- Add a Profile screen with synthetic details, portrait placeholder, roles, skills, language, service area and completion status; an Availability screen with weekly pattern and blocked dates; a Documents screen showing status and the reason real upload is unavailable. No bank/Aadhaar inputs or active file controls.
- Adopt the shared Teal/Gradient tokens from the separately accepted site-theme foundation after DEC-37; do not create a Freelancer-only third system. The theme switch controls non-sensitive preference only.
- Preserve visible synthetic/sample labels. Existing browser-local application drafts remain sample-only and receive a direct warning. Server-backed M5b will remove known personal-field draft keys before real entry.

## Proposed ownership

M5's app/people and app/freelancer routes; components/tnp/portals/freelancer/**; narrow shared label formatter and adoption seams in components/tnp/access/**, components/tnp/portals/planner/**, components/tnp/portals/admin/**, data/tnp.ts and export display code. P must serialize any overlap with the site-theme/homepage or Planner/Admin tasks into exact owned paths before Ready. The old components/tnp/portals/operations/** desk is deleted in M5 and is not an ownership target.

## Acceptance

The user sees the requested names at 1440/1100/390/320 widths in both themes. Internal IDs, application matching and report keys remain stable. Profile/Documents/Availability show complete labelled synthetic states and do not accept real personal or financial data. Keyboard, touch, focus, reduced motion, refresh and public no-login boundaries pass. Run focused regressions, lint, TypeScript, Vercel build, browser matrix and diff check. One fixed SHA, independent review and Kartik acceptance precede integration.
