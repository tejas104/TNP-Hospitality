# TNP full-platform usage and workflow blueprint

Status: product-flow blueprint for client refinement, recorded 2026-09-19. It defines the intended responsive-web experience and trust boundaries. It does not claim that production authentication, database persistence, notifications, allocation, payments or provider integrations are already implemented.

## 1. Platform in one view

```mermaid
flowchart LR
    V[Public visitor] --> H[Public website]
    H --> C0[For Clients]
    H --> P0[For Planners]
    H --> F0[For Freelancers]
    H --> R0[RSVP services]
    H --> E[General enquiry]

    C0 --> C1[Client explanation and enquiry]
    C1 --> C2[Client sign in or access invitation]
    C2 --> CD[Client workspace]

    P0 --> P1[What a TNP Planner can do]
    P1 --> P2[Become a Planner]
    P1 --> P3[Planner sign in]
    P2 --> PA[Planner application and organization profile]
    PA --> AR{Operations review}
    AR -->|Changes needed| PA
    AR -->|Approved| PD[Planner dashboard]
    AR -->|Rejected or suspended| PX[Decision and support path]
    P3 --> PD

    F0 --> F1[Role and opportunity explanation]
    F1 --> F2[Apply as Freelancer]
    F2 --> FA[Application and assessment]
    FA --> FR{Operations review}
    FR -->|Approved| FD[Freelancer workspace]
    FR -->|Changes or rejected| FX[Decision and support path]

    R0 --> R1[TNP-managed RSVP enquiry]
    R0 --> R2[Vendor RSVP access]
    R1 --> RW[Customer RSVP workspace]
    R2 --> RV[Vendor organization workspace]

    E --> OQ[Operations enquiry queue]
    CD --> OD[Operations and Admin]
    PD --> OD
    FD --> OD
    RW --> OD
    RV --> OD
    OQ --> OD

    OD --> FI[Finance and reporting]
    OD --> AU[Audit and support]
```

The public website explains and converts. The authenticated workspaces execute. Operations/Admin coordinates the shared record, approvals and exceptions. Finance owns financial effects. RSVP has its own event/guest permissions but shares the platform identity boundary.

## 2. Entry and access model

| Audience | Public experience | Access action | Authenticated destination | What must never happen |
|---|---|---|---|---|
| Client | Services, venues/planners, process, enquiry | Sign in or use invitation | Client workspace | Public page exposing private quote, booking or guest data |
| Planner | Clear explanation of benefits, requirements and process | `Become a Planner` or `Planner sign in` | Planner application/status/dashboard | Sending every visitor directly into an editable planner workspace |
| Freelancer | Roles, eligibility, process and expectations | `Apply as Freelancer` or `Freelancer sign in` | Application/status/opportunity workspace | Showing restricted event details before eligibility |
| RSVP customer | Managed-service explanation | Enquire or open customer invitation | Customer RSVP workspace | Treating a guest invitation as staff access |
| RSVP vendor | Vendor product, limits and onboarding | Request access or sign in | Vendor organization workspace | Cross-vendor guest/event visibility |
| TNP staff | No public operational controls | Staff sign in with stronger security | Operations/Admin/Finance | Publishing synthetic Operations records as public content |

Demo profiles may reproduce these journeys using clearly labelled synthetic data. Demo selection is not production authentication.

## 3. Complete event lifecycle

```mermaid
flowchart TD
    A[Enquiry or existing client/planner] --> B[Create booking or event brief]
    B --> C[Event functions, venue, schedule and contacts]
    C --> D[Add workforce requirement lines]
    D --> D1[Example: 3 Hostesses]
    D --> D2[Example: 5 Event Executives]
    D --> D3[Example: 1 Team Leader]
    D --> E[Save draft and estimate]
    E --> F[Submit requirement]
    F --> G{Operations review}
    G -->|Needs changes| H[Planner or client revises]
    H --> F
    G -->|Rejected| I[Reason, support and resubmit policy]
    G -->|Approved| J[Approved event and position records]
    J --> K[Publish only to eligible freelancers]
    K --> L[Applications or claims]
    L --> M[Planner event-scoped comparison]
    L --> N[Operations eligibility and conflict review]
    M --> O[Planner shortlist or preference]
    N --> P{Final allocation}
    O --> P
    P -->|Full, overlap or ineligible| Q[Reject, waitlist or replacement path]
    P -->|Assigned| R[Worker accepts assignment]
    R --> S[Pre-event briefing and reconfirmation]
    S --> T[Attendance and exception evidence]
    T --> U[Planner or authorized event rating]
    T --> V[Verified earning calculation]
    U --> W[Performance history and human review]
    V --> X[Operations and Finance approvals]
    X --> Y[Payout reconciliation]
    C --> Z[Quote, invoice and client collection]
    Z --> FI[Finance ledger and reporting]
    Y --> FI
    FI --> CL[Event closure, reports and audit]
```

The Planner's demand, Operations staffing records, Freelancer assignments, attendance, ratings and finance records remain connected by stable booking/event/position IDs. A dashboard is a view of this record; it is not a separate copy of the truth.

## 4. Planner journey in detail

### 4.1 Before login

`/planner` is a public Planner landing page, not the private dashboard. It should answer:

1. Who qualifies as a Planner or planning company?
2. What can they request from TNP?
3. How approval works and what documents/details are needed.
4. What they can see after approval.
5. What TNP Operations still controls.

Primary actions: `Become a Planner` and `Planner sign in`. A third, lower-priority action may be `Talk to TNP`.

### 4.2 Planner account lifecycle

```mermaid
stateDiagram-v2
    [*] --> DraftApplication
    DraftApplication --> Submitted
    Submitted --> UnderReview
    UnderReview --> ChangesRequested
    ChangesRequested --> Submitted
    UnderReview --> Approved
    UnderReview --> Rejected
    Approved --> Suspended
    Suspended --> Approved: restored by authorized admin
    Approved --> Closed: approved offboarding
    Rejected --> DraftApplication: resubmission allowed
```

Account approval and requirement approval are intentionally separate. An approved Planner may create requests, but each submitted event/workforce request still receives operational review.

### 4.3 Planner onboarding fields

- Planner/company name, legal/operating type and cities served.
- Primary contact and organization members.
- Experience, event categories, portfolio/reference evidence and service areas.
- Billing identity and address when commercial flow begins.
- Required declarations/terms acceptance.
- Documents only after client-approved purpose, storage, access and retention rules exist.

### 4.4 Planner event and workforce composer

One event brief contains:

- event name, client/reference and one or more functions;
- venue selection or custom venue request, city, address/reporting point and map instructions;
- date, timezone, start/end, setup/travel buffers and guest scale;
- on-site contacts, dress code, languages, briefing and accessibility needs;
- multiple workforce lines, each with role, quantity, shift, skill/experience, language, gender only if lawful and explicitly approved, uniform and notes;
- attachments/briefs only through approved private storage;
- estimate/quote state, acknowledgement and change history.

The interface supports adding, duplicating, editing and removing several workforce lines before one submission. It must not force the Planner to submit `3 Hostesses` and `5 Event Executives` as unrelated event requests.

### 4.5 Requirement lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Submitted
    Submitted --> UnderReview
    UnderReview --> ChangesRequested
    ChangesRequested --> Submitted
    UnderReview --> Rejected
    UnderReview --> Approved
    Approved --> PositionsPublished
    PositionsPublished --> Staffing
    Staffing --> PartiallyStaffed
    PartiallyStaffed --> Staffed
    Staffing --> Staffed
    Staffed --> InProgress
    InProgress --> Completed
    Completed --> Closed
    Draft --> Cancelled
    Submitted --> Cancelled
    Approved --> Cancelled: authorized cancellation
```

### 4.6 Planner dashboard

The approved Planner dashboard is a substantial workspace with:

- **Overview:** next action, account state, pending approvals, upcoming events and staffing risk.
- **Events:** draft, submitted, approved, staffing, live, completed and cancelled events.
- **Workforce requests:** multi-line demand, change requests, approval history and fill progress.
- **Applicants:** event-scoped applicants/eligible candidates with comparison and shortlist tools.
- **Assigned team:** confirmed/reconfirming/declined/replacement states and briefing acknowledgement.
- **Venues:** approved catalogue or custom venue record, evidence-rich cards and selected event venue.
- **Quotes and invoices:** versions, approval/revision, deposits/collections and downloadable approved documents.
- **Messages/notifications:** request decisions, staffing changes, reconfirmation risk and event updates.
- **Reviews:** submit event-specific worker feedback and view allowed history.
- **Reports:** event staffing, attendance summary, ratings and closure report.
- **Organization settings:** team members, permissions, contact/billing profile and audit-visible changes.

### 4.7 What a Planner can see about applicants

Recommended event-scoped comparison card:

- approved display name and profile image if consented;
- role/skills, city/service area and relevant experience;
- aggregate rating with count and scale;
- recent relevant event-performance summaries;
- attendance/reliability indicators with defined calculation period;
- verified badges only when issuer and verification state exist;
- availability/overlap result and application state;
- Planner's shortlist/preference action.

Never expose private KYC documents, bank details, home address, internal disciplinary notes, unrelated-event client names, exact payout data or unrestricted phone/email. Operations can see the additional information required for legitimate administration under role and audit controls.

### 4.8 Who selects the final worker

Recommended v1 decision: the Planner can shortlist, rank or approve preferences; Operations performs final allocation. This preserves capacity, eligibility, overlapping-event and replacement integrity. If the client wants the Planner to make final assignments, that requires a separately approved permission and server-side allocation design—the UI alone cannot make it safe.

## 5. Client workflow

```mermaid
flowchart LR
    A[Public client page] --> B[Enquiry or access invitation]
    B --> C[Client workspace]
    C --> D[Create or review booking]
    D --> E[Choose venue/planner or provide own]
    E --> F[Functions and service requirements]
    F --> G[Quote issued]
    G -->|Revision requested| F
    G -->|Approved| H[Collection and delivery milestones]
    H --> I[Event progress and approved reports]
    I --> J[Closure and feedback]
```

Clients see their own bookings, quotes, collections, approved staffing summaries and reports. They do not automatically receive worker KYC, payroll or other clients' data.

## 6. Freelancer workflow

```mermaid
flowchart LR
    A[Public freelancer page] --> B[Application]
    B --> C[Assessment and review]
    C -->|Approved| D[Opportunity workspace]
    C -->|Changes/rejected| E[Decision and support]
    D --> F[Eligible opportunities only]
    F --> G[Apply or claim]
    G --> H[Assigned]
    H --> I[Accept and reconfirm]
    I --> J[Briefing and event pass]
    J --> K[Attendance and corrections]
    K --> L[Rating and standing]
    K --> M[Earning and payout status]
```

Opportunity visibility is filtered by active status, role, availability, rating/location policy and event scope. Application does not guarantee assignment.

## 7. Operations and Admin workflow

Operations is not one unlimited super-screen. Permissions should separate platform administration, operations, workforce review, event coordination and finance.

```mermaid
flowchart TD
    A[Operations dashboard] --> B[Planner account reviews]
    A --> C[Freelancer application reviews]
    A --> D[Bookings and event briefs]
    A --> E[Requirement approval]
    A --> F[Position publishing]
    A --> G[Allocation and replacements]
    A --> H[Attendance exceptions]
    A --> I[Ratings and standing review]
    A --> J[RSVP organizations and support]
    A --> K[Reports and audit]
    D --> L[Quotes and collections]
    G --> M[Briefing and reconfirmation]
    H --> N[Earnings]
    L --> O[Finance]
    N --> O
```

Every sensitive decision records actor, time, reason, before/after state and related event/account IDs. Admin override cannot silently bypass capacity or overlap rules.

## 8. RSVP usage structure

```mermaid
flowchart LR
    A[TNP Admin] --> B[Provision vendor/customer organization]
    B --> C[Organization owner/coordinator]
    C --> D[Create engagement and events]
    D --> E[Import guests and parties]
    E --> F[Function-wise invitations and RSVP]
    F --> G[Calling and message queues]
    G --> H[Travel and pickup/drop]
    G --> I[Stay and rooming]
    G --> J[Approved document workflow]
    H --> K[Event-day operations]
    I --> K
    J --> K
    K --> L[Excel/PDF reports and closure]
    M[Guest invitation] --> F
```

Vendor/customer organizations are isolated. Guest invitation links are not employee logins. Hotel and transport contacts receive only the minimum assigned information.

## 9. Finance usage structure

```mermaid
flowchart TD
    A[Booking and approved scope] --> B[Versioned quote]
    B --> C[Client approval or revision]
    C --> D[Invoice and collection ledger]
    E[Assignment rate snapshot] --> F[Verified attendance]
    F --> G[Calculated earning]
    G --> H[Operations approval]
    H --> I[Finance approval]
    I --> J[Monthly payable]
    J --> K[Provider attempt]
    K -->|Paid| L[Reconciled success]
    K -->|Failed, uncertain or reversed| M[Reconciliation queue]
    D --> N[Financial reporting]
    L --> N
    M --> N
```

Client collections and freelancer payouts are separate ledgers. Money uses integer paise. No ambiguous provider response becomes a successful payment without reconciliation.

## 10. Responsibility and visibility matrix

| Capability | Client | Planner | Freelancer | Operations | Finance | RSVP vendor/customer |
|---|---:|---:|---:|---:|---:|---:|
| Public information/enquiry | Yes | Yes | Yes | Staff contact only | No | Yes |
| Own organization/profile | Own | Own | Own person | Scoped administration | Scoped | Own organization |
| Create booking/event brief | Own | Own | No | On behalf with audit | Read as needed | RSVP events only |
| Add multi-role workforce demand | Own if enabled | Yes | No | Yes | No | No unless separately sold |
| Approve Planner/Freelancer accounts | No | No | No | Authorized reviewer | No | Vendor members only within scope |
| Publish positions/final allocation | No | Preference only | Apply/accept | Yes | No | No |
| View applicant comparison | Approved scope | Event scope | Self only | Authorized scope | No | No |
| View KYC/private workforce data | No | No | Own only | Restricted authorized role | Minimum needed | No |
| Record attendance | No | Optional event evidence only | Self evidence if allowed | Authorized event actor | Read approved | RSVP check-in is separate |
| Rate worker/event | Own event if approved | Own event | View own | Review/correct with audit | No | Guest-service feedback only |
| Approve earnings/payouts | No | No | View own | First approval if policy confirms | Final approval/provider | No |
| Guest/document operations | Own engagement scope | No by default | No | Audited support scope | Commercial summary only | Own organization/event scope |

## 11. Main records and relationships

```mermaid
erDiagram
    ORGANIZATION ||--o{ MEMBERSHIP : has
    USER ||--o{ MEMBERSHIP : receives
    ORGANIZATION ||--o{ PLANNER_PROFILE : owns
    ORGANIZATION ||--o{ BOOKING : creates
    BOOKING ||--o{ EVENT : contains
    EVENT }o--|| VENUE : uses
    EVENT ||--o{ REQUIREMENT : requests
    REQUIREMENT ||--o{ POSITION : creates
    WORKER ||--o{ APPLICATION : submits
    POSITION ||--o{ APPLICATION : receives
    POSITION ||--o{ ASSIGNMENT : fills
    WORKER ||--o{ ASSIGNMENT : accepts
    ASSIGNMENT ||--o{ ATTENDANCE : evidences
    ASSIGNMENT ||--o{ RATING : receives
    ATTENDANCE ||--o| EARNING : derives
    WORKER ||--o{ PAYABLE : receives
    BOOKING ||--o{ QUOTE : versions
    BOOKING ||--o{ COLLECTION : records
    ORGANIZATION ||--o{ RSVP_ENGAGEMENT : owns
    RSVP_ENGAGEMENT ||--o{ GUEST_PARTY : contains
    GUEST_PARTY ||--o{ GUEST_MEMBER : contains
```

## 12. Failure and exception paths that must remain visible

- Unauthenticated, wrong-role and wrong-organization access fails closed.
- Planner account approval and requirement approval can be pending, changed, rejected, suspended or restored.
- A requirement may be partly staffed; the dashboard must not call it complete.
- Full capacity, schedule overlap, ineligibility and expired reconfirmation are different outcomes.
- Applicant withdrawal, worker decline and Operations replacement preserve history.
- Missing GPS, outside-radius evidence and no attendance are different states.
- Rating dispute and human review do not automatically erase a worker.
- Quote revision and approval operate on explicit versions.
- Payment/payout failed, uncertain, reversed and paid are distinct.
- RSVP sent, delivered, read, replied and confirmed are distinct.
- Every list needs loading, empty, error, retry, filtered-empty and permission-denied states.

## 13. Delivery boundaries

### Current frontend preview

Can demonstrate labelled synthetic profiles, forms, statuses, connected IDs and responsive dashboards. It cannot prove production login, authorization, concurrency-safe staffing, real notifications, private files or money movement.

### Production platform

Requires server-derived identity and organization scope, versioned APIs, MongoDB persistence, allocation transactions/conflict controls, private storage, durable jobs, provider adapters, audit, backup/restore, monitoring and UAT.

### Recommended implementation order

1. Public role pages and truthful demo access foundation.
2. Production identity, organizations, memberships and permissions.
3. Planner public page, application/status and approved dashboard shell.
4. Booking/event/venue and multi-line workforce requirement contracts.
5. Operations account/request review and position publishing.
6. Freelancer eligibility/application/allocation and Planner comparison view.
7. Briefing, reconfirmation, attendance, ratings and event closure.
8. Quotes/collections and attendance-derived earnings/payouts.
9. RSVP provider/document/logistics batches.
10. Aggregate security, accessibility, performance, restore, UAT and release gates.

## 14. Client decisions needed to refine this blueprint

1. Can an individual Planner register, or only a planning company/organization?
2. What evidence is mandatory before Planner approval, and may rejected applicants reapply?
3. Can approved Planners create new events directly, or only work on Client/TNP-created bookings?
4. Can a Planner enter a custom venue, select only TNP-listed venues, or both?
5. Does a workforce request require a quote/deposit before positions are published?
6. Does the Planner only shortlist, or may the Planner make final worker assignments?
7. Which worker fields and performance periods may a Planner see?
8. Who may rate workers: Planner, Client, Team Leader, Operations, or a combination?
9. How are disputed ratings corrected, and what rating affects eligibility?
10. Who may invite additional users into a Planner organization, and which roles exist there?
11. Which notifications use email, WhatsApp, in-app or manual follow-up?
12. What is the approved cancellation/replacement policy and timing?

The collection package for these decisions and all assets/accounts is [CLIENT-INPUTS-AND-ACCESS-REGISTER.md](CLIENT-INPUTS-AND-ACCESS-REGISTER.md).
