# TNP RSVP, Guest Hospitality and Logistics Service

Status: product and architecture proposal, 2026-09-17. Based on the user's explicit requirement and supplied TNP 30-day operating brief. This is a dedicated sellable service; it is not implemented, launched, priced or scheduled by this document. Existing A/D milestones are unchanged. Real guest-document collection requires the proposed private backend and access controls before activation.

## 1. Product and commercial model

TNP can sell RSVP/hospitality management independently of staffing, venue booking or event planning. Create an RSVP service engagement for a customer with its own events/functions, guest list, assigned TNP team, package/scope, service dates, agreed guest allowance, communication usage and operational reports. Link an existing TNP booking when relevant; never require one to buy RSVP.

Latest confirmed user decision (2026-09-17): support BOTH TNP-managed service with customer portal and vendor-operated RSVP workspaces. TNP sells access to multiple vendors; each vendor creates and manages its own events and RSVP operations. This expands the earlier TNP-managed-only choice. TNP controls vendor accounts, access state and commercial entitlements through its administration area. White-label domains and independent vendor billing/resale are not implied by access sales. Proposed packages may cover RSVP, travel/rooming and complete hospitality; prices and included usage remain undecided.

### Vendor administration and isolation
TNP administrator can invite/activate/suspend/reactivate vendor organizations, assign package, subscription/service dates, event/guest/user/message limits, see usage and manage staff membership. Vendor owners can invite scoped team members and create/manage multiple events. An organization is the data isolation boundary; events are nested inside it. The same person may belong to several organizations only through explicit memberships and an organization switcher. A vendor never accesses another vendor's guests, documents, conversations or exports.

TNP manages access through invitations, role assignment, session revocation and recovery workflows, not by viewing or sharing vendor passwords. Support access to guest information must be explicitly scoped and audited. Suspension blocks new sessions and actions and revokes active sessions through server checks; retention/export/renewal handling must be agreed before production. Package limits must be enforced by the backend rather than merely hiding UI buttons. Keep manual entitlement assignment available without assuming automated billing is ready.

For first implementation, use TNP admin plus vendor owner/coordinator plus event-scoped client viewer/approver and guest roles. TNP-managed engagements use the same domain under the TNP operating organization. Sender ownership is a production dependency: each vendor's WhatsApp number/account must be bound to its organization, or an explicitly designed shared-TNP-sender mode must resolve event/guest identity safely. Never route solely by a guest phone number across vendors.

## 2. Dedicated login and workspaces

Proposed routes, not existing deployed routes: /rsvp/login, /rsvp/workspace, /rsvp/events/:id, and a restricted guest invitation link.

- TNP platform administrator: vendor provisioning, packages/limits, expiry/suspension, membership, usage and audited support access.
- TNP service manager: authorized managed engagements, team assignment, workload, commercial scope and escalation.
- Vendor owner/coordinator: only their organization's events, clients, guest data, WhatsApp connections, documents and reports; no global TNP administration.
- TNP coordinator/calling agent: assigned events/guest groups, shared WhatsApp inbox, call outcomes, follow-ups and approved documents.
- Customer owner: only their organization's events; summary, approved guest editing/imports, rooming/message approvals, scoped reports. No access to other customers or TNP staffing/finance administration.
- Hotel contact: approved rooming list and necessary stay details only.
- Transport coordinator/driver: assigned movements and necessary passenger/contact data; no identity-document archive or full guest list.
- Guest/family organizer: mobile invitation form and authorized party members only; expiring/revocable link, with stronger verification for sensitive document access.

Use one identity system with server-enforced organization, engagement, event and action permissions; dedicated UI does not require a separate authentication database. Staff/admin stronger authentication should be part of identity design. Log exports, sensitive document access and delegated access. Customer branding can cover event name, image, language and approved copy while retaining clear sender identity.

## 3. Guest classification: separate dimensions, not one overloaded status

| Dimension | Values / rules |
|---|---|
| Invitation | Not prepared, pending client approval, scheduled, sent, delivered, failed; read when provider reports it |
| Response contact | No response, replied-needs-review, response recorded; independent of delivery/read status |
| RSVP per function | Awaiting confirmation, confirmed, tentative, declined, cancelled |
| Party | Family/group ID, primary contact, named individual members, allowed accompanying count, adults/children |
| Stay | Not required, requested, awaiting approval, allocated, details communicated, checked in, checked out |
| Arrival transport | Flight, train, bus, self-drive, local/private transport; multiple journeys supported |
| Departure transport | Separate from arrival, with its own time, mode and assistance |
| Pickup and drop | Not required, requested, awaiting details, planned, vehicle/driver assigned, dispatched, guest met, completed, cancelled/no-show |
| Documents | Not required, requested, received, under review, accepted, rejected/replace, expired/deleted |
| Service priority | Standard, VIP, VVIP; separate tags for family side, language and service needs |
| Event-day attendance | Expected, arrived, checked in, departed, no-show; confirmation is not actual arrival |

Example: confirmed for reception, declined for ceremony, replied, arriving by train, pickup requested, no hotel stay, ticket received, ID not required. The same guest can self-drive on arrival and need a departure transfer.

Treat 'Not Confirmed' from the brief as awaiting confirmation, not as a synonym for declined. Report people and households separately so one family reply does not count as one attendee. Shared phone numbers must not merge different guests automatically.

## 4. Screens and primary workflows

1. Service dashboard: customer/event selector, confirmed/tentative/declined people, unanswered contacts, pending documents/travel, room capacity, outstanding pickups, overdue tasks and recent changes.
2. Guest directory: saved filters and combined categories, grouping, search, safe bulk actions, assignment to calling agents, change history and duplicate review.
3. Guest profile: invited functions, individual/party answers, conversation/call timeline, documents, arrival/departure, stay, requests and next action.
4. Shared inbox/calling queue: assigned owner, message delivery and response states, call attempts/outcomes, language, next follow-up, internal notes and escalation; avoid two agents chasing the same guest.
5. Mobile form builder: event invitation, party members, function-wise RSVP, arrival/departure details, pickup/drop, stay, dietary/accessibility requests, optional document upload, confirmation and revision link. Conditional questions prevent asking a declining guest for travel or IDs. Only request sensitive details when required, with purpose and access explained.
6. Document desk: missing/requested/received queues, previews, guest/event association, reviewer and reason, replacement version and restricted downloads.
7. Travel and transport board: arrivals/departures by date/time/location, missing information, grouped rides, luggage/seats, vehicle/driver allocation, dispatch and actual pickup/drop confirmation.
8. Rooming board: hotels, categories, inventory and stay date ranges, family/group preferences, accessibility needs, allocation conflicts, customer approval, guest communication.
9. Campaign/calendar: versioned templates, relevant audience, preview/sample recipients, customer approval, schedule, cancellation, delivery/failure queue and opt-outs.
10. Reports and approvals: versioned master guest sheet, travel manifest, pickup/drop sheet, hotel rooming list, daily pending report, change report, final hospitality audit and post-event summary.

## 5. Supplied service calendar, configurable by engagement

These offsets are days before the customer's event, not software-development deadlines.

| Offset | Work and exit evidence |
|---|---|
| T-30 | Guest import, invitation/RSVP kickoff, caller assignment, master guest list |
| T-28 | Record responses and accompanying-member changes; daily updated master view |
| T-26 | Request required IDs, record received files and pending follow-ups |
| T-24 | Cross-check names/contact/party/stay; escalate unresolved information |
| T-22 | Arrival/departure and transport category collection; logistics master |
| T-20 | Confirm times/locations and preliminary pickup/drop requirements |
| T-18 to T-16 | Rooming proposal, hotel/client approval, approved room communication |
| T-15 | Supplied 'Save the Date' / e-invite milestone; confirm naming because invitation already began at T-30 |
| T-10 | Final confirmation calls, counts, travel/documents/rooming follow-up |
| T-7 | Guest/travel/room/pickup reconfirmation and VIP/VVIP review |
| T-5 | Final movement plan, transport/hotel coordination and special requirements |
| T-3 | Guest -> RSVP -> documents -> stay -> room -> travel -> pickup -> drop audit and versioned team reports |
| T-2 | Late room details only if not previously communicated and approved; final instructions |
| Each function day | Relevant guest event name, time, location, dress code, parking/transport, assistance contact; operational check-in |
| After event | Departure transfers, thank-you audience/copy approval, closure report and retention/deletion tasks |

Every milestone creates work with an owner, due date, status and escalation. Message sending is conditional on audience eligibility, consent, current facts and approvals; milestones do not send blindly. Late service onboarding offers a compressed plan for staff approval; it does not send all overdue messages at once. Rescheduling an event revises future jobs and prevents duplicate invitations/reminders.

## 6. WhatsApp and guest-document chain

Use the official WhatsApp Business Platform through a selected provider or direct Cloud API; do not promise access to arbitrary personal WhatsApp chats or previous chat history. Messages/documents sent to the connected business number after setup enter this workflow:

Authenticated webhook -> durable event receipt -> deduplicate provider message ID -> identify sender and candidate event/party -> attach to existing conversation or staff matching queue -> download media using server credentials -> validate type/size and quarantine/scan -> private object storage -> scoped guest document record -> reviewer confirmation -> timeline and pending queue update.

Record organization/event/guest, sender, provider message ID, timestamps, original filename/type, checksum, storage key, document purpose, review status, reviewer and access history. Receiving a file is not verifying the guest's identity. For ambiguous sender/event/member matches, do not attach an ID to a guessed person. A failed download remains 'media pending/failed' with retry and operator alert, not 'document received'.

Keep documents in private storage; a provider media URL is not a durable archive. Meta's documented media retrieval URL expires after five minutes. Use authorized short-lived viewing links, revocation and an explicit retention schedule; do not include raw IDs in routine Excel/PDF reports or driver views. OCR can propose ticket/ID fields but requires human confirmation before overwriting guest facts. Treat uploaded content as untrusted data; macros, scripts and instructions in documents must never execute.

Messaging records distinguish queued, submitted, sent, delivered, read-if-known, failed and uncertain. None of these means RSVP confirmed. Use approved templates where required outside the customer-service window, maintain consent/opt-out evidence, and stop future reminders for opted-out or ineligible recipients. Keep a manual calling/web-form fallback and operational alerts. Client-specific numbers/branding require a separate account-onboarding decision if the first release uses a TNP-owned sender.

## 7. Excel, PDF and a single master record

The platform is the authoritative guest record. Excel/PDF are controlled inputs and timestamped outputs, not competing editable masters.

- Excel/CSV import: sample template, column mapping, validation, duplicate/conflict preview, row-level errors, import batch and rollback/reversal plan. Use stable guest IDs; never match on name alone. Re-import is idempotent. Neutralize formula injection on exports.
- PDF import: store as source evidence; proposed extraction with staff review where feasible. Do not promise arbitrary PDFs become accurate structured guest lists automatically.
- Excel/PDF export: selected organization/event, filters, record count, timezone, generated-at and revision, scoped columns, who exported, and a delta report since previous export.
- Reports: guest/party counts, RSVP per function, documents pending, hotel/stay inventory, arrival/departure, pickup/drop manifests, VIP attention, communication delivery, follow-up workload and final closure.
- A late flight/guest-count/room change records old/new values, actor, source and time; it reopens affected logistics tasks and marks prior manifests outdated. Resending updated room/transport information requires appropriate approval.

## 8. Proposed architecture decision (RSVP-ADR-DRAFT-01)

Decision proposed: add a distinct RSVP domain to the existing modular application with a dedicated responsive portal, shared identity, private media storage and durable integration jobs. Preserve the current frontend framework. Do not create a separate microservice system or native app solely for RSVP.

Core records: VendorOrganization, OrganizationMembership, AccessEntitlement, CustomerOrganization, RSVPServiceEngagement, FunctionEvent, GuestParty, GuestMember, Invitation, FunctionResponse, WhatsAppConnection, Conversation, Message, CallAttempt, Consent, GuestDocument, TravelLeg, TransferJob, VehicleAllocation, HotelStay, RoomAllocation, FollowUpTask, Approval, ImportBatch, ExportSnapshot and AuditEvent. Customer organizations and engagements are scoped to their operating vendor organization; vendor and customer are not interchangeable roles.

Server services own authorization, transitions, counts, capacity and documents. Provider adapters and jobs own WhatsApp receipt/send/media retries. Browser-local demo fixtures may show the flow but cannot certify actual login, private document access or live delivery.

Critical invariants: organization isolation on every read/write/export/media request; one provider event applied once; concurrent guest edits use versions; correct party/member/function joins; no overbooked rooms or vehicle seats; uncertain sends reconcile before resending; opt-outs suppress future jobs; approved rooming only communicated; deletion applies to owned media and access links according to policy.

Consequence: this is substantially larger than the previous 'basic RSVP' slice. It needs explicit contracts and separately owned milestones. The current 20-day release target in `docs/DELIVERY-PLAN.md` includes only the gated v1 RSVP/vendor scope described there; it does not promise the entire expanded blueprint without provider approval and release evidence. Do not absorb this work into A or D silently. New builder dispatch still requires an explicit Ready lease; planning/onboarding preparation can continue.

## 9. Delivery batches and acceptance

Phase 0: TNP-managed plus vendor-operated models are confirmed. Settle sender ownership/onboarding, account suspension/expiry policy, required documents/retention, party/function rules, package scope and provider access. Prepare contracts and UI flow using synthetic data; begin WhatsApp onboarding separately.

Batch 1 prerequisite: TNP vendor administration, vendor login/membership, organization isolation and manual package/access controls. Then dedicated vendor/customer/team workspace + guest directory/import; conditional guest/family RSVP form + response/calling queues. Split into additional two-prompt milestones as needed rather than forcing all identity work into two prompts. Verify two vendors cannot access each other's data even through direct IDs, file URLs, exports and webhooks; verify suspension/session revocation and per-event permissions. Household/function counts must remain correct on revisions and duplicate import.

Batch 2: WhatsApp inbox/templates + private media ingestion/document desk. Verify actual guest message/file -> correct event/person or unmatched queue -> authorized view; replay webhook, expired media URL, unsupported file, rejected scan, opt-out and provider failure cases.

Batch 3: travel/pickup/drop + rooming/approval, with Excel/PDF exports. Verify capacity/date overlaps, flight changes reopening affected tasks, driver/hotel view scoping and export revision accuracy.

Batch 4: scheduled service calendar + event-day/closure and resilience. Verify cancellation/rescheduling/late onboarding, no duplicate sends, role-specific walkthrough, delivery/reply end-to-end evidence and backup/restore before production activation.

Each batch can contain two compatible implementation prompts with internal checked checkpoints and one consolidated review. This is a proposed decomposition, not a Ready lease or fixed delivery-date promise.

Useful later additions: reusable service templates; multilingual approved forms/copy; assigned caller performance; guest duplicate suggestions; waitlist/capacity handling; transport grouping with manual approval; structured change acknowledgements; event-day offline contingency manifests; event budget/usage tracking. AI extraction/translation never silently approves ID, RSVP, rooming or logistics changes.

## 10. Decisions needed before production implementation

TNP-managed service with customer portal AND vendor-operated multi-event workspaces are confirmed. Remaining decisions: vendor-specific versus shared sender ownership/onboarding; suspension/expiry/export policy; required identity documents and who may review them; retention/deletion period; expected vendor/event/guest/message volume; hotel/driver access; approved calling/message cadence and languages; commercial packages and release scope. These decisions do not block synthetic UX planning, but no real ID upload or external message send is authorized by this blueprint.

## Provider references checked 2026-09-17

- Meta media retrieval: https://www.postman.com/meta/whatsapp-business-platform/request/ptjyi84/retrieve-media-url
- WhatsApp Business Messaging Policy: https://whatsappbusiness.com/policy/
- Business onboarding can take several weeks: https://www.twilio.com/docs/whatsapp/self-sign-up
- Template approval may require up to48hours: https://www.twilio.com/docs/whatsapp/tutorial/message-template-approvals-statuses

Prior recommended21-28day onboarding buffer is a planning allowance, not an approval guarantee. The brief starts operations30days before an event, so complete onboarding before that kickoff whenever possible; for a fresh account begin preparation roughly7-8weeks before the first event, allowing approval buffer before T-30. This is a planning recommendation, not a new confirmed event or project date.
