# TNP client inputs, assets, access and approval register

Status: client-facing collection checklist for the responsive-web v1. This document asks for names, files, decisions and account access—not passwords, API keys, session tokens, identity documents or payment credentials in chat, email or Git.

## How the client should respond

Provide one accountable decision-maker and one backup. For each item, mark `APPROVED`, `PROVIDED`, `NOT APPLICABLE`, or `PENDING — owner/date`. Put files in the agreed private client folder with stable filenames. Grant account access directly through each provider's member/invite controls. Never paste secrets into this document.

The current MongoDB cluster and linked Vercel project are temporary development resources. Before production, the client must provide or accept ownership transfer to client-controlled accounts, and the team must rehearse migration, backup/restore, DNS cutover and rollback.

## 1. Business identity and decision authority

- Registered business name, trading name, legal entity type, registered address and operating address.
- Primary client signatory, product/content approver, finance approver, privacy/data contact, technical/account owner and emergency release contact.
- Official phone numbers, support number, sales number, WhatsApp number and escalation number; identify which may be public.
- Official email addresses for sales, RSVP, operations, staffing, finance, privacy, legal and support.
- Final service regions, office locations, working hours, response-time promises and supported languages.
- Written confirmation of who may approve content, pricing, contractual text, production release and emergency rollback.

## 2. Brand system

- Primary and alternate logos in SVG plus transparent PNG; monochrome/light/dark variants.
- Brand guidelines covering exact colour values, typography licences, spacing, logo clear space, prohibited uses and tone of voice.
- Favicon, app icon, social profile image and Open Graph/social-share artwork.
- Approved strapline, company description, short bio, long bio and preferred capitalization of `TNP Hospitality`.
- Approved examples of premium, friendly and operational language; words or claims the client does not want used.
- Accessibility exceptions, if any, must be explicit; brand colours do not override minimum readable contrast.

## 3. Photography, video and visual provenance

For every supplied asset provide the original file, photographer/source, usage rights, permitted channels, expiry if any, required credit, event/client consent status and a short factual caption.

- Hero images: at least 6 landscape originals, preferably 2400px or wider.
- Service images: one approved hero plus two supporting images for every service page.
- Department/role images: one approved image for each department and freelancer role.
- Event portfolio: event name, city/venue, date/year, services actually delivered, approved caption and permission to identify the client/venue.
- Destination images: approved cities/venues, factual location labels and confirmation that images represent real supported destinations.
- RSVP/guest-hospitality imagery showing appropriate consent and no exposed guest records.
- Staff/team portraits with names, roles, consent and preferred crop.
- Optional video: original 1080p/4K files, usage rights, poster frame, captions/transcript and whether audio may autoplay (default is no).
- Identify stock, illustrative, AI-generated and real TNP work separately. Do not label inspiration imagery as a TNP commission.
- Supply alt-text facts: who/what is shown, relevant action/context, and any detail that must not be described.

## 4. Homepage and 3D direction

- Choose the preferred 3D concept: hospitality pavilion, guest-journey constellation, event-floor choreography, venue portal, or another supplied reference.
- Provide 3–5 visual references and identify what is liked in each: form, material, motion, lighting, colour or mood.
- Confirm elements that must not appear: people likenesses, religious/cultural motifs, venue replicas, logos, confetti, excessive particles or gaming-style effects.
- Approve the motion character: calm/editorial, ceremonial, architectural or energetic.
- Approve a still fallback image/illustration and reduced-motion presentation.
- Confirm public homepage priorities in order: brand story, services, RSVP, destinations, staffing/freelancer network, vendor enquiry and client enquiry.
- Approve how many images may appear by default versus inside an optional gallery.

## 5. Public website content

- Final navigation labels and ordering.
- Approved homepage headline, supporting statement, primary CTA, secondary CTA and final CTA.
- About/company story: founding year, leadership, differentiators, experience claims and any numbers that may be published with evidence.
- Complete service catalogue. For every service: title, short description, full detail copy, inclusions, exclusions, ideal customer, cities, lead time, enquiry CTA and imagery.
- Complete department catalogue. For every department/role: name, responsibilities, experience expectations, uniform/appearance rules, training/certification requirements and imagery.
- Approved destinations, venues and event types. Do not imply formal venue partnerships without confirmation.
- Testimonials, awards, partner logos and client logos with written publication permission and exact attribution.
- FAQ answers, cancellation/changes wording, response times and emergency support boundaries.
- Contact-page address, map/link preference, hours, public phone/email and enquiry-routing rules.

## 6. Enquiries and transactional email

- Name the production email provider/account owner and invite the technical operator through the provider—never send API keys.
- Confirm sender domain and sender identities, for example `hello@`, `rsvp@`, `operations@`, `finance@` and `support@`.
- Approve sender display names and reply-to inboxes.
- Provide DNS owner access for SPF, DKIM and DMARC configuration; approve a DMARC rollout plan.
- Define who receives each enquiry type and backup/escalation recipients.
- Approve templates for enquiry receipt, internal notification, RSVP invitation/reminder, access invitation, password recovery, assignment, attendance exception, quote/invoice and payout notice.
- Approve subject lines, signature, legal footer, expected response time and whether emails may contain personal/event data.
- Provide bounce/complaint handling owner and retention period for delivery logs.

## 7. WhatsApp onboarding and policy

- Client-controlled Meta Business Portfolio and verified legal business details.
- WhatsApp Business Account owner, production phone number, number migration status and display-name choice.
- Provider choice, billing owner and authorized technical member access.
- Approved opt-in wording, opt-out/help keywords, privacy notice and evidence-retention rule.
- Template inventory by language and use case: invitation, RSVP reminder, travel/accommodation request, document request, update, cancellation and support handoff.
- Webhook verification owner, callback-domain/DNS access and incident contact.
- Decide whether guests may upload documents through WhatsApp; if yes, approve file types, malware scanning, access roles, retention, deletion and audit policy.
- Provide UAT numbers and test scenarios without placing real guest data in fixtures.
- Business verification, sender/display-name and template approvals are separate external gates; no approval timing is promised.

## 8. Organization, vendor and account model

- List legal/operating organizations that need isolated workspaces.
- Define vendor account lifecycle: requested, invited, active, suspended, revoked and deleted.
- Approve initial roles and permissions: platform administrator, organization administrator, planner, operations, finance, client, vendor operator and worker/freelancer.
- Name who may invite, suspend, restore and permanently remove users.
- Confirm whether one person may belong to multiple organizations and how they switch context.
- Approve sign-in method, password policy, MFA requirement, session duration, inactivity timeout and recovery/support process.
- Define client offboarding and data export/deletion obligations.

## 9. Client and planner workflows

- Required booking fields, optional fields, event statuses and who may change each status.
- Quote request/revision/approval flow, expiry rules, version numbering and required approvers.
- Requirement creation fields, service/department taxonomy, quantities, shifts, skills, languages, dress code and notes.
- Venue/event schedule format, reporting instructions and change-notification rules.
- Which information clients can see about individual workers and which must remain private.
- Client dashboard metrics, reports, exports and notification preferences.
- Exact meaning of `submitted`, `accepted`, `confirmed`, `cancelled`, `completed` and other domain statuses.

### Planner access, approval and organization package

- Confirm whether an individual Planner, a registered planning company, or both may apply.
- Supply public `For Planners` copy: eligibility, benefits, supported cities/services, onboarding steps, review time, support contact and reasons an application may be rejected or returned.
- Define mandatory Planner profile fields, portfolio/reference evidence, declarations and any documents. For every document specify purpose, reviewer, storage, retention and deletion; do not send real documents until protected production intake exists.
- Define Planner account states and who may approve, request changes, reject, suspend, restore and close an account. Confirm whether rejection may be appealed or resubmitted.
- Define Planner-organization roles such as owner, event manager, finance viewer and read-only member; state who may invite/remove members and whether one user may belong to several Planner organizations.
- Approve login method, MFA/session/recovery rules and support escalation. Grant provider access through named invitations; never provide passwords in this register.

### Planner event and multi-role workforce package

- Confirm whether Planners create new bookings/events, are invited to existing Client/TNP bookings, or both.
- Approve the event/function schema: names, event types, dates/timezones, setup/travel buffers, guest scale, on-site contacts, reporting point, dress code, languages, accessibility and briefing fields.
- Approve the venue model: TNP-listed venues, Planner-supplied custom venues, or both; define address/map evidence, verification, image rights, pricing display and who may edit after approval.
- Supply the canonical workforce role catalogue and aliases—for example Hostess, Event Executive, Team Leader—with role descriptions, required skills, experience, uniform, language, shift limits and minimum/maximum quantities.
- Confirm that one requirement may contain several role/quantity lines, for example `3 Hostesses`, `5 Event Executives` and `1 Team Leader`, and define whether lines can have different shifts/reporting points.
- Define requirement states, mandatory approval checks, change-request reasons, rejection reasons, SLA and who may cancel/reopen after approval.
- Confirm whether quote approval or deposit is required before Operations publishes positions.
- Define cancellation, replacement, overtime, late-change and shortage handling, including which changes require a new quote.

### Planner applicant and team visibility package

- Decide whether the Planner may shortlist/rank preferences only, or make final assignments. Recommended v1: Planner preference with Operations final allocation.
- Approve every worker field visible to a Planner: display name, consented profile image, role, skills, city, experience, verified badges, availability, aggregate rating, review count and performance summary period.
- Explicitly identify fields that remain private: KYC files, bank/payment data, home address, internal notes, unrelated-client/event records, exact payout and unrestricted contact details.
- Define the rating scale, categories, eligible raters, minimum evidence, aggregation period, review-count display, dispute/correction process and whether a low score affects opportunity eligibility.
- Define what “previous performance” means: completed assignments, attendance/reliability, client/Planner feedback, role relevance, date window and how corrected/disputed events are handled.
- Approve when direct contact is revealed, whether communication stays inside TNP, and what is visible before shortlist, after assignment and after event closure.
- Define what the Planner sees for accepted, reconfirming, declined, replaced, checked-in, attendance-exception and completed team members.
- Supply synthetic UAT Planner organizations, events, multi-role requests, applicants, ratings/reviews and edge cases. Do not provide real worker personal data for development fixtures.

## 10. Freelancer/workforce inputs

- Application fields, minimum age, supported cities, roles, experience bands and eligibility rules.
- Assessment questions, passing score, reattempt policy and human-review criteria.
- Required documents and whether collection is deferred; if collected, approve retention and access policy first.
- Opportunity eligibility, capacity, overlap, cancellation, replacement and nonresponse rules.
- Coming/not-coming deadlines, briefing acknowledgement and escalation rules.
- Attendance methods permitted: QR, manual supervisor record, location evidence or combinations; define failure and correction procedure.
- Rating categories, who can rate, dispute process and whether ratings affect eligibility.
- Worker support, grievance, incident and emergency contacts.

## 11. RSVP and guest hospitality

- Confirm supported operating modes: TNP-managed, vendor self-service, or both.
- Guest import template with required columns, accepted formats, row-error policy and duplicate rules.
- Guest categories, households/plus-ones, function-wise invitations and response options.
- Dietary, accessibility, travel, pickup, accommodation and special-request fields.
- Invitation sender identity, languages, reminder cadence, manual follow-up ownership and escalation windows.
- Rules for guest edits, RSVP closure, late changes, walk-ins and duplicate identities.
- Vendor/customer isolation rules and TNP administrator visibility.
- Required Excel/PDF exports and exact columns, grouping, branding and audit requirements.
- Consent text, privacy notice, document policy and post-event retention/deletion schedule.
- Named UAT events and synthetic UAT guests; production guest data must not be used in development fixtures.

## 12. Finance, payments and commercial rules

- Currency, tax/GST handling, invoice numbering, legal invoice fields and finance contact.
- Quote line items, discounts, deposits, milestones, adjustments, refunds and cancellation rules.
- Payment provider/account owner, supported methods, settlement bank owner and reconciliation process.
- Webhook/event types, failed/duplicate payment handling and refund authority.
- Freelancer rate cards, units, overtime, allowances, deductions and earning approval process.
- Payout cadence, minimum threshold, two-stage approval actors, failure/retry/reconciliation and export format.
- Expense categories, receipt requirements, approval limits and audit/reporting needs.
- No live payment or payout operation begins without provider, security, reconciliation and UAT evidence.

## 13. Documents, privacy, legal and retention

- Privacy policy, terms, cookie policy, acceptable-use policy and consent wording reviewed by the client's adviser.
- Data categories collected, lawful purpose, visibility by role, retention period and deletion owner.
- India and any other jurisdictional requirements the client wants applied; obtain qualified legal advice where required.
- Identity-document decision: disabled, or approved types/need/access/encryption/retention/deletion/audit policy.
- Data-subject access, correction, export and deletion request process.
- Minor/child guest policy, if relevant.
- Incident/breach escalation contacts and notification expectations.
- Approved subprocessors and any prohibited storage region/vendor.

## 14. MongoDB/data cutover

- Client-controlled MongoDB Atlas organization/project owner and invited technical operators.
- Production region, tier, network/access policy, encryption/KMS requirement and budget alerts.
- Database name conventions and separate development/staging/production projects or clusters.
- Backup frequency, point-in-time requirement, retention, restore operator, recovery-time target and recovery-point target.
- Migration/cutover window from the temporary cluster, record-count/hash reconciliation and rollback decision-maker.
- Index review, data lifecycle/archive rules and monitoring/alert recipients.
- Evidence required before production: connectivity from staging, tenant-isolation tests, backup success and demonstrated restore.

## 15. Vercel, domain and production ownership

- Client-controlled Vercel team/project owner, billing owner and technical members.
- Git repository ownership and branch-protection/approval policy.
- Production domain, DNS registrar owner, current DNS records and approved cutover window.
- Separate preview, staging and production environment ownership.
- Environment-variable owner for each environment; provide values only through Vercel/provider secret controls.
- Deployment approval owner, rollback operator, support/on-call contacts and maintenance window.
- Web Analytics/Speed Insights preference, log retention, alert recipients and budget/spend controls.
- Migration plan from the temporary linked project: environment inventory, domains, build settings, functions, logs and rollback.

## 16. Analytics, SEO and social

- Analytics provider/account, consent requirements and permitted events.
- Search Console/Bing ownership, sitemap preference and robots/no-index rules for preview/staging/portals.
- Final page titles, descriptions, canonical domain, organization schema facts and social profiles.
- Approved conversion events: enquiry submitted, RSVP interest, vendor interest, application started/completed and authenticated milestones.
- Cookie/banner decision and categories; no non-essential tracking before consent where required.

## 17. Accessibility, device and browser acceptance

- Minimum supported browsers/devices and any required low-end Android testing.
- Preferred languages, text scaling and accessibility contact.
- Confirm keyboard access, visible focus, reduced motion, sufficient contrast, semantic labels and no horizontal overflow as non-negotiable acceptance criteria.
- Supply any client-specific accessibility standard beyond WCAG 2.2 AA.

## 18. UAT, training, support and launch

- Named UAT participants for public site, client/planner, freelancer, Operations, RSVP and finance.
- Synthetic UAT data set approved for staging.
- Critical user journeys and expected results, including invalid/error/retry cases.
- Defect severity definitions and who accepts known limitations.
- Training audience, preferred format, recording permission and required runbooks.
- Support hours, first-line owner, engineering escalation, incident severity and communications channel.
- Final content freeze owner/date, feature freeze owner/date, go/no-go attendees and explicit production deployment approver.
- Post-launch monitoring window, rollback threshold and handover acceptance.

## Minimum blocking package by milestone

| Needed by | Client package | Release consequence if missing |
|---|---|---|
| Public/frontend review | Approved logo/brand, homepage/service copy, image rights, contact details, 3D references, public claims | UI may remain a labelled content preview; no content acceptance |
| Auth/platform staging | Organization/role model, account owner, session/MFA policy, staging Atlas/Vercel access, secret owners | No production-ready authentication or tenant claim |
| RSVP staging | Guest schema, consent, templates, sender/provider state, retention and UAT scenarios | WhatsApp/documents disabled; RSVP limited to approved manual/web behavior |
| Finance staging | Tax/invoice/rate/payout rules, provider account, distinct approvers and reconciliation | Payments/payouts disabled; no financial production claim |
| Release candidate | Client-controlled production accounts, domain/DNS, final assets/copy/legal, backup restore, UAT names | Production go/no-go is FAIL |
| Deployment | Signed UAT, exact release SHA approval, deployment window, monitoring/on-call and rollback authority | No deployment |

## Safe transfer rules

- Files: private approved folder with versioned filenames and a manifest.
- Access: provider invitations with least privilege and named individual accounts.
- Secrets: provider secret managers only; never documents, screenshots, source control or chat.
- Personal data: use synthetic records until an approved protected environment and retention policy exist.
- Approval: written decision referencing exact content/version/SHA where applicable.
