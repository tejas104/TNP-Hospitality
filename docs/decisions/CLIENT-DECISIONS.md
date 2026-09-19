# Client and owner decision log

## Corrected TNP product, Planner, RSVP, quotation and monthly-pay model (2026-09-19)

This supersedes the earlier interpretation of Planner as primarily an external customer organization. TNP sells four connected product families: hospitality People/workforce (including Event Coordinator, Event Executive, Hostess, Volunteer and Porter), TNP Planner, Venue and detailed RSVP.

A client's own planner is an authorized representative within the Client workspace and may order TNP workforce/venue/RSVP for that client. A TNP Planner is a vetted senior TNP member approved based on experience and sold/assigned as a TNP service. After Admin grants event scope, the TNP Planner may select/assign the approved venue and workforce; the allocation service still enforces capacity, eligibility, overlap, replacement and audit.

Every product request reaches Admin. Admin alone creates/revises the official quotation, which goes to the authorized ordering/billing party. Acceptance/payment requirements and Admin grant precede fulfillment. A TNP Planner requesting an event add-on does not personally become the billing party unless an explicit contract says so.

RSVP is a separately paid, WhatsApp-based product with a detailed isolated vendor-team workspace. Vendor registration, Admin quotation, required acceptance/payment and entitlement activation are separate. A Client or TNP Planner may also request RSVP for a TNP-managed event, but Admin must grant it.

The assigned TNP Planner may rate event workforce; Event Coordinators may rate approved lower-level assigned roles. Freelancer monthly payment derives from verified attendance days and captured day rates during the calendar month, followed by Admin/Finance review and month-end payout/reconciliation. Event count alone is not the payment basis. Detailed unresolved policy remains in `docs/DOMAIN-RULES.md` and the client-input register.

The corrected canonical diagram is `docs/PLATFORM-USAGE-WORKFLOW-BLUEPRINT.md`; ADR-0004 supersedes ADR-0003.

## Planner public entry, approval and full workspace direction (2026-09-19 — superseded in part)

The public-entry, experience approval, multi-role request, applicant evidence and privacy requirements below remain valid. The statement giving Operations normal final allocation is superseded by the corrected model above: after Admin grant, the assigned TNP Planner may assign within scope while the allocation service validates safety.

The user confirms that a website visitor selecting `For Planners` must first receive a clear public explanation of the Planner offering. The public page then provides `Become a Planner` and `Planner sign in`; it must not place an unauthenticated visitor directly inside the editable Planner workspace.

The target Planner product includes Planner onboarding/application, authenticated access, Operations/Admin account review, multi-line workforce demand for one event (for example three Hostesses and five Event Executives), venue/event details, per-requirement Operations approval and an approval/status trail visible to the Planner. Account approval and requirement approval are separate gates.

After a requirement is approved and staffing begins, the Planner dashboard should expose event-scoped applicant/team comparison with truthful ratings, prior performance/review evidence and assignment progress. Private KYC, banking, internal notes, unrelated-event information and unrestricted personal contact data remain outside Planner visibility. Under the corrected model, the assigned TNP Planner can assign approved resources after Admin grant; server-side allocation still enforces capacity, eligibility and schedule overlap.

The complete role/platform flow and open refinements are canonical in `docs/PLATFORM-USAGE-WORKFLOW-BLUEPRINT.md`; the required client package is in `docs/CLIENT-INPUTS-AND-ACCESS-REGISTER.md`. This direction does not claim the current synthetic `/planner` route has production authentication or backend enforcement.

## Platform UX completion, demo access and partner discovery direction (2026-09-19)

The user directs a platform-wide frontend usability and completion pass, with the public homepage deliberately handled last. Preserve the approved editorial TNP style, but prioritize first-visit comprehension, predictable navigation, obvious actions and compact task completion over decorative whitespace.

The multicolour circular custom cursor is a homepage-only storytelling treatment. Every access and workspace route must use the native cursor. All links, buttons, selectable cards and expandable controls must be identifiable without hover through shape, contrast, label, icon/chevron or a consistent boundary. A user entering a role workspace must immediately understand the current state, the most important next action and where to find the remaining tasks.

Portal task names—not slogans or step numerals—carry the primary hierarchy. In Planner, `Planner registration` and `Workforce requirement` become dominant task headings; supporting explanation becomes smaller secondary copy. Desktop portals must reduce excess vertical space, keep the first useful action within the initial viewport where practical and prevent demo/preview overlays from covering real task controls.

Replace exaggerated display/monospace dashboard numerals with the body type stack and tabular numerals across operational metrics, money, counts, dates and percentages. Keep Georgia for restrained editorial headings, not dense data. Preserve textual labels and non-colour meaning.

Navigation must use destination-accurate labels, visible active states and one predictable route model across desktop and mobile. Portal `Login` must not hard-link to Planner, and portal `Let's Talk` must not impersonate a Client navigation action. The public shell has one prominent Workspaces entry; the workspace shell exposes Home, Workspaces, the complete portal switcher, current demo identity and clear switch/exit actions. Homepage navigation/content refinement remains last.

Provide truthful demo access for Client, TNP Planner, Freelancer, Operations and RSVP using named synthetic profiles and explicit one-click entry. A client-appointed planner is represented as a scoped Client persona, not another TNP Planner. This is a tab-scoped demo context, not production authentication. It must never request or store a password, impersonate server authorization or call browser-local state a real account. Switching identity must not reset scenario records; exiting clears only demo identity. Guest invitations remain separate from staff/customer workspace login.

Where external partners or TNP talent are genuinely presented for comparison, use image-led cards with a prominent name, location/service area, truthful social proof, explicit price qualifier and one clear action. Ratings, review counts, verification and photographs render only with attributable evidence. Current synthetic Planner match scores are not star ratings; destination-context images are not partner photographs; sample venue budget bands are not commercial starting prices. The first proven consumers are Client venue and TNP Planner selection. Other portals retain their domain-specific rows until reviewed provider/partner contracts exist.

Use the interaction principles—not copied layouts or assets—of Airbnb, Notion, ChatGPT and Apple: task-first entry, scannable evidence, one dominant action and predictable action vocabulary. Preserve accessibility, keyboard operation, reduced motion, truthful loading/empty/error/retry/reset states and the fixed-SHA review gates.

## Primary colour, public navigation and workforce notification clarification (2026-09-18)

The user confirms `#008080` as the client-selected primary brand colour. As of 2026-09-19, this direction is expanded and supersedes the earlier allowance for dark teal as a supporting brand surface: replace visible dark-green/dark-teal treatments, including the homepage hero and platform workspace surfaces, with `#008080`. Do not substitute another green. Ivory `#f5f1e7` and champagne `#bba879` remain supporting surfaces. Use neutral charcoal/black only where text, shadows or overlays require contrast, and `#006b6b` only as the accessible interactive hover/text variant of the same teal family. Apply the change through reviewed semantic tokens, an audited literal migration and a regression guard; semantic success states must also use text/icon meaning rather than relying on green alone.

The public navbar must expose enough of the platform for visitors to understand its breadth, with clear routes to services, events, destinations, RSVP, people/work opportunities and company information, plus visible workspace/login and enquiry actions. The homepage role drawer remains a quick audience finder, not a second unrelated navigation system. Operations preview is not a public marketing destination.

The original engineering scope already requires opportunity and confirmation notifications. Publishing Positions moves an Event into staffing and notifies eligible freelancers; the Freelancer opportunity feed is filtered by role level, availability, rating and location. Do not broadcast private event details to ineligible, inactive or unauthorized accounts. Separately, assigned freelancers receive the configurable pre-event push/full-screen confirmation prompt and must answer Coming/Not Coming; expiry flags replacement. Firebase Cloud Messaging is the specified primary channel, but real push delivery, device registration, durable jobs, retry/deduplication, delivery evidence and provider credentials are not implemented by the current synthetic preview and remain production work.

## Integration, infrastructure, reviewer and Astra direction (2026-09-18)

The user authorizes architect-controlled local integration of the already fixed-SHA reviewed D Operations target `c6d26b00487286e8602655997c06ae298ac94052` and Shared Fix target `022449ee02626ed70bd2081c798fb65788b25b76`, treating Anjaneya and Kartik approval as supplied for those two gates. This does not authorize a main push, deployment or production operation.

The current MongoDB cluster is configured for present development use and may be operated for this project, but the client will replace or take ownership of the database during deployment. The locally linked Vercel project is likewise temporary and tied to the currently connected project/account; the client will provide or receive a client-controlled production project during deployment. No secret values enter Git. Production cutover requires account ownership, environment inventory, migration reconciliation, backup/restore and rollback evidence.

For future milestones Kartik is the sole human fixed-SHA reviewer across the whole project. Anjaneya remains the product/content/visual decision owner, and independent Claude/Sol/security/data/finance gates remain where required. This is not permission for author self-review.

Use `gpt-6-astra` for homepage, Client, Freelancer, RSVP, public service-page and related UI/frontend creation, with actual runtime/model/effort verified at Ready. The homepage candidate is not approved as-is: the supplied external Claude review returned CHANGES REQUESTED for contrast, focus-ring visibility, vendor enquiry and public-shell exposure, and the user additionally requests a materially changed single 3D homepage model. Those corrections return to an Astra frontend milestone before fixed-SHA re-review and Kartik disposition.

The requested client asset/access/content inventory is canonical in `docs/CLIENT-INPUTS-AND-ACCESS-REGISTER.md`.

## Twenty-day deployment target (2026-09-18)
The user replaces the prior 25-day cadence with a fast-paced 20-calendar-day target through production deployment. Day 1 is 2026-09-18 and Day 20 is 2026-10-07. The compressed plan is authoritative in `docs/DELIVERY-PLAN.md`: three consolidated review windows, freeze on Day 14, QA/security/UAT/rehearsal through Day 19 and deployment on Day 20 only after fixed-SHA go/no-go and explicit deployment authorization. The shorter target does not waive server authorization, tenant isolation, atomic allocation/attendance, financial idempotency, backups/restore, rollback, independent review or external WhatsApp/provider evidence. Provider-dependent features may be disabled only through an explicit release-scope decision; previews must not be represented as production functionality.

## Operations preview and homepage design clarification (2026-09-17)
The user clarifies that the client liked the visual/interface style of the Operations demo; the demo itself was never intended to become a public marketing page. Keep `/admin` available as a labelled synthetic development surface until the authenticated Operations workspace replaces it, but remove public-facing "Operations Demo" positioning before production. The public homepage should retain its strong current UI and receive deliberate refinement in motion design, 3D treatment and overall polish. It may translate the Operations dark/cream control-room language into a public "how TNP operates" story without exposing internal controls or synthetic data. Use `gpt-6-astra` for the B homepage design/motion implementation session, with actual model/effort confirmed at Ready. Preserve reduced-motion, mobile and non-WebGL fallbacks. This decision does not authorize immediate shared-file edits, B launch, deployment or a framework migration.

## Team-operated centralized tooling plan (2026-09-17)
The user confirms the Codex and Claude subscriptions are team resources and Kartik approves and will personally operate the team's assigned Claude and Antigravity-hosted Codex sessions from Anjaneya's Laptop1 / DESKTOP-DL9FDM7. Use separate Windows/application profiles and assigned seats; do not share credentials or impersonate another member. Human ownership remains H1 A/B and H2 C/D. Existing A and completed D fixed-SHA work are not moved mid-cycle. Future C/D, corrections and reviews require exact identity/model/effort/host/worktree preflight and a serialized Ready lease. Laptop2 remains a review/backup host. Fresh reviewer sessions must not be author sessions, and review findings do not authorize reviewer edits without a new writer lease. This decision changes the future operating host preference only; it does not authorize B/C implementation, integration, deployment or production access.

## Vendor RSVP and homepage expansion (latest 2026-09-17 instruction)
User expanded the earlier managed-only RSVP choice: TNP sells access to multiple vendors, each vendor creates/manages its own events and RSVP, and TNP admin manages vendor logins/access. Both managed-service and vendor-workspace modes are now required product direction. User also requests a reorganized public homepage with a strong3Danimated design and clarified the image target: "Keep75%; remove roughly25%". This supersedes preservation of the current homepage composition. Commercial entitlement rules, provider onboarding and release estimates remain unresolved. No main publication, production deployment or review-queue exception is inferred from this design instruction.

## RSVP service direction confirmed by user (2026-09-17)
User supplied the TNP RSVP/guest hospitality/logistics T-30 through post-event brief and explicitly requested a separately sellable service, dedicated customer login, guest categories, forms, Excel/PDF records and WhatsApp document capture/viewing. In the follow-up choice the user selected: "TNP-managed service with client portal". Record this as a user-confirmed product direction; do not infer pricing, client contractual acceptance, identity-document policy, provider choice or release-date approval. DEC-01 is partially resolved accordingly. Proposed scope/architecture/batches are in RSVP-SERVICE-BLUEPRINT.md. Existing A/D implementation contracts remain unchanged; new work requires explicit ownership and schedule reforecast.

## Confirmed user instructions (2026-09-16)
- Responsive web only; native app excluded from this release.
- H1 Anjaneya and H2 Kartik; no third human.
- This P session performs repository bootstrap directly; no self-assignment prompt for the user.
- Cleanup of unnecessary repository files is allowed, but unrelated client material and useful source evidence must be preserved.
- No new publication/production authorization was given.

These are user decisions, not evidence of client acceptance of every product proposal.
Kickoff, Day 3 slot/timezone, client decision owner and active external writer paths remain unconfirmed.
All DEC-01..DEC-13 items in DOMAIN-RULES.md remain pending.
For a resolved client decision record: ID, date/time, decision-maker, exact outcome, evidence/channel, affected tasks and scope/schedule consequence.

## Subsequent user clarification: two laptops and repository access
Anjaneya's current laptop runs P plus A/B Codex; Kartik's laptop runs C Claude and D Codex. Functional domains unchanged. User requests one ordered guide and authorizes pushing bootstrap to GitHub so Kartik can clone and review it. This authorizes only candidate branch/tag sharing, not main integration or production deployment. Reviewers must receive repository access before local review; file names alone do not provide access. Anjaneya needs no new clone, but every writer still needs an isolated task worktree.

## Review correction and current user clarification
Both laptop repositories and all planned task/review worktrees use D:. Exact host mapping is in LAUNCH-PROTOCOL.md. Initial development never needs a reopened correction lease or earlier findings. Received bootstrap findings are stored, and only P corrects the bootstrap. DEC-14..16 extend pending questions; no client policy approval is inferred. Review candidate sharing continues under the user's instruction to push the prepared bootstrap; no main merge or production deployment is inferred.

## Confirmed review/model policy change (2026-09-16)
User explicitly answered "Yes—use Sol + Sonnet" to whether fresh independent Sol may replace the mandatory Astra gate with separate Sonnet review. This applies to the current bootstrap and subsequent high-risk gates; independent review and human approval remain. It is a model substitution, not retroactive approval of an interrupted/mixed-model report. User also requested milestone batching and branch checkpoint sharing; see REVIEW-CADENCE.md. Exact runtime model availability still must be observed.

## Review-03 human disposition relayed
User states Kartik approves the requested corrections and wants developer launch. P records authorization to fix the listed findings; corrected-candidate independent review and actual foundation implementation/integration remain outstanding. No client business policy or production operation is approved by that statement.
