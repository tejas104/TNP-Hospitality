// Synthetic admin-console records for the client demo. Every name, event,
// amount and rating is invented. Money is integer paise; nothing here is a
// real booking, payout, quotation or login.
export type EventStatus = 'upcoming' | 'ongoing' | 'finished';
export type Role =
  | 'Event Coordinator'
  | 'Event Executive'
  | 'Hostess'
  | 'Volunteer'
  | 'Porter';
export type Freelancer = {
  id: string;
  name: string;
  role: Role;
  city: string;
  experienceYears: number;
  languages: string[];
  rating: number; // 0–5, sample
  ratings: { eventId: string; score: number; note: string }[];
  status: 'active' | 'under-review';
};
export type Application = {
  id: string;
  name: string;
  role: Role;
  city: string;
  experienceYears: number;
  assessment: number; // sample score out of 100
  appliedOn: string;
  note: string;
  status: 'pending' | 'approved' | 'rejected';
  decisionReason?: string;
};
export type Assignment = {
  id: string;
  eventId: string;
  role: Role;
  quantity: number;
  dayRatePaise: number;
  days: number;
  notes: string;
  applicants: string[]; // freelancer ids who applied
  approved: string[]; // freelancer ids approved for this event
};
export type Attendance = 'appeared' | 'late' | 'absent' | 'unmarked';
export type AdminEvent = {
  id: string;
  name: string;
  client: string;
  venue: string;
  city: string;
  start: string;
  end: string;
  status: EventStatus;
  functions: string[];
  guests: number;
  rsvpEnabled: boolean;
  attendance: Record<string, Attendance>; // freelancerId -> state
};
export type ClientRequest = {
  id: string;
  client: string;
  contact: string;
  occasion: string;
  city: string;
  date: string;
  guests: number;
  lines: { role: Role; quantity: number; days: number }[];
  extras: string[];
  status: 'new' | 'quoting' | 'quoted';
  receivedOn: string;
};
export type QuoteLine = {
  id: string;
  label: string;
  quantity: number;
  days: number;
  ratePaise: number;
};
export type Quotation = {
  id: string;
  requestId: string;
  client: string;
  title: string;
  lines: QuoteLine[];
  discountPct: number;
  adjustmentPaise: number;
  status: 'draft' | 'ready' | 'accepted-sample';
  updatedOn: string;
};
export type Payout = {
  id: string;
  freelancerId: string;
  amountPaise: number;
  paidOn: string;
  reference: string;
};
export type RsvpMember = {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'operator' | 'viewer';
  eventIds: string[];
  active: boolean;
};
export type CoAdmin = {
  id: string;
  name: string;
  main: boolean;
  capabilities: Capability[];
};
export const CAPABILITIES = [
  'Applications',
  'Events',
  'Quotations',
  'Finance',
  'RSVP access',
  'Reports',
] as const;
export type Capability = (typeof CAPABILITIES)[number];

export const RATE_CARD: Record<Role, number> = {
  'Event Coordinator': 450000,
  'Event Executive': 300000,
  Hostess: 250000,
  Volunteer: 150000,
  Porter: 120000,
};
export const EXTRA_RATES: Record<string, number> = {
  'RSVP messaging (per event)': 2500000,
  'Venue discovery support': 1500000,
  'TNP Planner (per day)': 900000,
};

export type Approval = { coordinator?: string; finance?: string };
export type AttendanceChange = {
  id: string;
  eventId: string;
  freelancerId: string;
  from: Attendance;
  to: Attendance;
  reason: string;
  actor: string;
  at: string;
};
export type RateRevision = {
  rev: number;
  role: Role;
  fromPaise: number;
  toPaise: number;
  reason: string;
  actor: string;
  at: string;
};
export type Collection = {
  id: string;
  quoteId: string;
  amountPaise: number;
  receivedOn: string;
  reference: string;
};
export type ServiceListing = { title: string; startingPaise: number; published: boolean };

export type AdminState = {
  version: 2;
  /** `${assignmentId}:${freelancerId}` → who approved the earned amount. */
  approvals: Record<string, Approval>;
  attendanceLog: AttendanceChange[];
  rateCard: Record<Role, number>;
  rateRevisions: RateRevision[];
  services: ServiceListing[];
  collections: Collection[];
  events: AdminEvent[];
  freelancers: Freelancer[];
  applications: Application[];
  assignments: Assignment[];
  requests: ClientRequest[];
  quotations: Quotation[];
  payouts: Payout[];
  rsvpMembers: RsvpMember[];
  coAdmins: CoAdmin[];
  log: { at: string; text: string; actor: string }[];
};
export const ACTOR = 'Kavya Rao (Main admin)';
export const COORDINATOR_ACTOR = 'Rahul Sharma (event coordinator, sample)';
export const FINANCE_ACTOR = 'Zoya Qureshi (finance co-admin, sample)';

const fl = (
  id: string,
  name: string,
  role: Role,
  city: string,
  experienceYears: number,
  rating: number,
  languages: string[],
  status: Freelancer['status'] = 'active',
): Freelancer => ({
  id,
  name,
  role,
  city,
  experienceYears,
  languages,
  rating,
  ratings: [],
  status,
});

export function seedAdmin(): AdminState {
  const freelancers = [
    fl('fl-01', 'Rahul Sharma', 'Event Coordinator', 'Jaipur', 7, 4.8, ['Hindi', 'English']),
    fl('fl-02', 'Neha Verma', 'Event Coordinator', 'Delhi', 5, 4.6, ['Hindi', 'English', 'Punjabi']),
    fl('fl-03', 'Aisha Khan', 'Hostess', 'Mumbai', 3, 4.9, ['English', 'Hindi', 'Marathi']),
    fl('fl-04', 'Kabir Mehta', 'Event Executive', 'Pune', 4, 4.3, ['English', 'Marathi']),
    fl('fl-05', 'Sana Iyer', 'Hostess', 'Goa', 2, 4.5, ['English', 'Konkani']),
    fl('fl-06', 'Vikram Rao', 'Volunteer', 'Udaipur', 1, 3.9, ['Hindi']),
    fl('fl-07', 'Meera Das', 'Volunteer', 'Jaipur', 2, 4.2, ['Hindi', 'English']),
    fl('fl-08', 'Arjun Nair', 'Porter', 'Mumbai', 3, 4.0, ['Hindi', 'Malayalam']),
    fl('fl-09', 'Tara Kapoor', 'Event Executive', 'Delhi', 6, 4.7, ['English', 'Hindi']),
    fl('fl-10', 'Dev Malhotra', 'Volunteer', 'Delhi', 1, 3.4, ['Hindi'], 'under-review'),
    fl('fl-11', 'Riya Sen', 'Hostess', 'Udaipur', 2, 4.4, ['English', 'Hindi', 'Bengali']),
  ];
  const events: AdminEvent[] = [
    {
      id: 'ev-101',
      name: 'Mehta–Kapoor Wedding',
      client: 'Sample Mehta family',
      venue: 'Lakeview Palace (sample)',
      city: 'Udaipur',
      start: '2026-09-20',
      end: '2026-09-22',
      status: 'ongoing',
      functions: ['Mehendi', 'Sangeet', 'Reception'],
      guests: 320,
      rsvpEnabled: true,
      attendance: { 'fl-01': 'appeared', 'fl-03': 'appeared', 'fl-06': 'late', 'fl-07': 'appeared', 'fl-05': 'absent' },
    },
    {
      id: 'ev-102',
      name: 'Aurora Tech Summit',
      client: 'Sample Aurora Tech Pvt Ltd',
      venue: 'Harbour Convention Centre (sample)',
      city: 'Mumbai',
      start: '2026-09-21',
      end: '2026-09-21',
      status: 'ongoing',
      functions: ['Registration', 'Keynote', 'Networking dinner'],
      guests: 800,
      rsvpEnabled: false,
      attendance: { 'fl-09': 'appeared', 'fl-03': 'unmarked', 'fl-08': 'appeared', 'fl-04': 'unmarked' },
    },
    {
      id: 'ev-103',
      name: 'Sharma 60th Birthday',
      client: 'Sample Sharma family',
      venue: 'Rosewood Lawns (sample)',
      city: 'Jaipur',
      start: '2026-10-04',
      end: '2026-10-04',
      status: 'upcoming',
      functions: ['Dinner'],
      guests: 120,
      rsvpEnabled: true,
      attendance: {},
    },
    {
      id: 'ev-104',
      name: 'Goa Beach Reception',
      client: 'Sample D’Souza family',
      venue: 'Palm Shore Resort (sample)',
      city: 'Goa',
      start: '2026-11-15',
      end: '2026-11-16',
      status: 'upcoming',
      functions: ['Welcome drinks', 'Reception'],
      guests: 210,
      rsvpEnabled: false,
      attendance: {},
    },
    {
      id: 'ev-099',
      name: 'Heritage Gala Dinner',
      client: 'Sample Rajputana Trust',
      venue: 'City Palace Courtyard (sample)',
      city: 'Jaipur',
      start: '2026-08-30',
      end: '2026-08-30',
      status: 'finished',
      functions: ['Gala dinner'],
      guests: 260,
      rsvpEnabled: true,
      attendance: { 'fl-01': 'appeared', 'fl-07': 'appeared', 'fl-06': 'absent', 'fl-02': 'appeared', 'fl-10': 'absent' },
    },
    {
      id: 'ev-098',
      name: 'Product Launch Evening',
      client: 'Sample Nimbus Retail',
      venue: 'Skyline Rooftop (sample)',
      city: 'Delhi',
      start: '2026-08-18',
      end: '2026-08-18',
      status: 'finished',
      functions: ['Launch', 'Cocktails'],
      guests: 180,
      rsvpEnabled: false,
      attendance: { 'fl-09': 'appeared', 'fl-02': 'appeared', 'fl-04': 'late' },
    },
  ];
  // Sample ratings derived from finished-event attendance.
  const notes = ['Calm with guests', 'Great coordination', 'Punctual and warm', 'Needs clearer briefing'];
  for (const event of events.filter((e) => e.status === 'finished'))
    for (const [id, state] of Object.entries(event.attendance))
      if (state !== 'absent') {
        const f = freelancers.find((x) => x.id === id)!;
        f.ratings.push({
          eventId: event.id,
          score: Math.round(f.rating),
          note: notes[f.name.length % notes.length],
        });
      }
  // Finished events are fully approved; ongoing ones wait for approvals.
  const approvals: Record<string, Approval> = {};
  for (const a of ['as-296', 'as-297', 'as-290', 'as-291'])
    for (const id of ['fl-01', 'fl-02', 'fl-04', 'fl-06', 'fl-07', 'fl-09', 'fl-10'])
      approvals[`${a}:${id}`] = { coordinator: COORDINATOR_ACTOR, finance: FINANCE_ACTOR };
  approvals['as-301:fl-01'] = { coordinator: COORDINATOR_ACTOR };
  return {
    version: 2,
    approvals,
    attendanceLog: [
      { id: 'al-1', eventId: 'ev-099', freelancerId: 'fl-06', from: 'late', to: 'absent', reason: 'Left before the gala started; confirmed by coordinator.', actor: COORDINATOR_ACTOR, at: '2026-08-30 23:10' },
    ],
    rateCard: { ...RATE_CARD },
    rateRevisions: [],
    services: [
      { title: 'Event Coordinators', startingPaise: 450000, published: true },
      { title: 'Event Executives', startingPaise: 300000, published: true },
      { title: 'Volunteers', startingPaise: 150000, published: true },
      { title: 'Hostesses / Guest Hospitality', startingPaise: 250000, published: true },
      { title: 'Porters', startingPaise: 120000, published: true },
      { title: 'RSVP Services', startingPaise: 2500000, published: true },
      { title: 'Venue / Event Discovery', startingPaise: 1500000, published: false },
    ],
    collections: [],
    events,
    freelancers,
    applications: [
      { id: 'ap-201', name: 'Riya Sen', role: 'Hostess', city: 'Mumbai', experienceYears: 2, assessment: 86, appliedOn: '2026-09-19', note: 'Hotel front-desk background, fluent English and Hindi.', status: 'pending' },
      { id: 'ap-202', name: 'Karan Gill', role: 'Volunteer', city: 'Delhi', experienceYears: 0, assessment: 71, appliedOn: '2026-09-19', note: 'College events volunteer, available weekends.', status: 'pending' },
      { id: 'ap-203', name: 'Pooja Menon', role: 'Event Executive', city: 'Pune', experienceYears: 4, assessment: 92, appliedOn: '2026-09-18', note: 'Managed registrations for 3 conferences.', status: 'pending' },
      { id: 'ap-204', name: 'Imran Ali', role: 'Porter', city: 'Jaipur', experienceYears: 3, assessment: 64, appliedOn: '2026-09-17', note: 'Luggage and logistics support at hotels.', status: 'pending' },
      { id: 'ap-205', name: 'Nisha Rao', role: 'Hostess', city: 'Goa', experienceYears: 1, assessment: 78, appliedOn: '2026-09-15', note: 'Resort guest-relations intern.', status: 'approved' },
      { id: 'ap-206', name: 'Sahil Jain', role: 'Volunteer', city: 'Udaipur', experienceYears: 0, assessment: 42, appliedOn: '2026-09-14', note: 'Incomplete assessment.', status: 'rejected', decisionReason: 'Assessment below sample threshold (60).' },
    ],
    assignments: [
      { id: 'as-301', eventId: 'ev-101', role: 'Event Coordinator', quantity: 2, dayRatePaise: 450000, days: 3, notes: 'Lead the sangeet and reception teams.', applicants: ['fl-01', 'fl-02'], approved: ['fl-01'] },
      { id: 'as-302', eventId: 'ev-101', role: 'Hostess', quantity: 4, dayRatePaise: 250000, days: 3, notes: 'Welcome desk and guest guidance.', applicants: ['fl-03', 'fl-05'], approved: ['fl-03', 'fl-05'] },
      { id: 'as-303', eventId: 'ev-101', role: 'Volunteer', quantity: 6, dayRatePaise: 150000, days: 3, notes: 'Seating and flow support.', applicants: ['fl-06', 'fl-07', 'fl-10'], approved: ['fl-06', 'fl-07'] },
      { id: 'as-304', eventId: 'ev-102', role: 'Event Executive', quantity: 3, dayRatePaise: 300000, days: 1, notes: 'Registration desks.', applicants: ['fl-09', 'fl-04'], approved: ['fl-09', 'fl-04'] },
      { id: 'as-305', eventId: 'ev-102', role: 'Hostess', quantity: 2, dayRatePaise: 250000, days: 1, notes: 'Keynote hall ushering.', applicants: ['fl-03'], approved: ['fl-03'] },
      { id: 'as-306', eventId: 'ev-102', role: 'Porter', quantity: 2, dayRatePaise: 120000, days: 1, notes: 'Equipment and luggage.', applicants: ['fl-08'], approved: ['fl-08'] },
      { id: 'as-307', eventId: 'ev-103', role: 'Hostess', quantity: 3, dayRatePaise: 250000, days: 1, notes: 'Dinner welcome.', applicants: ['fl-03', 'fl-05'], approved: [] },
      { id: 'as-308', eventId: 'ev-103', role: 'Volunteer', quantity: 4, dayRatePaise: 150000, days: 1, notes: 'Table service support.', applicants: ['fl-07', 'fl-06'], approved: [] },
      { id: 'as-296', eventId: 'ev-099', role: 'Event Coordinator', quantity: 2, dayRatePaise: 450000, days: 1, notes: '', applicants: ['fl-01', 'fl-02'], approved: ['fl-01', 'fl-02'] },
      { id: 'as-297', eventId: 'ev-099', role: 'Volunteer', quantity: 3, dayRatePaise: 150000, days: 1, notes: '', applicants: ['fl-07', 'fl-06', 'fl-10'], approved: ['fl-07', 'fl-06', 'fl-10'] },
      { id: 'as-290', eventId: 'ev-098', role: 'Event Executive', quantity: 2, dayRatePaise: 300000, days: 1, notes: '', applicants: ['fl-09', 'fl-04'], approved: ['fl-09', 'fl-04'] },
      { id: 'as-291', eventId: 'ev-098', role: 'Event Coordinator', quantity: 1, dayRatePaise: 450000, days: 1, notes: '', applicants: ['fl-02'], approved: ['fl-02'] },
    ],
    requests: [
      { id: 'rq-401', client: 'Sample Banerjee family', contact: 'Sample contact · no real details', occasion: 'Wedding reception', city: 'Kolkata', date: '2026-12-12', guests: 400, lines: [{ role: 'Event Coordinator', quantity: 2, days: 2 }, { role: 'Hostess', quantity: 6, days: 2 }, { role: 'Volunteer', quantity: 8, days: 2 }], extras: ['RSVP messaging (per event)'], status: 'new', receivedOn: '2026-09-20' },
      { id: 'rq-402', client: 'Sample Orbit Pharma', contact: 'Sample contact · no real details', occasion: 'Annual conference', city: 'Pune', date: '2026-11-05', guests: 600, lines: [{ role: 'Event Executive', quantity: 4, days: 2 }, { role: 'Hostess', quantity: 4, days: 2 }, { role: 'Porter', quantity: 3, days: 2 }], extras: ['Venue discovery support'], status: 'quoting', receivedOn: '2026-09-18' },
      { id: 'rq-403', client: 'Sample Kapoor family', contact: 'Sample contact · no real details', occasion: 'Engagement dinner', city: 'Delhi', date: '2026-10-25', guests: 90, lines: [{ role: 'Hostess', quantity: 2, days: 1 }, { role: 'Volunteer', quantity: 2, days: 1 }], extras: [], status: 'new', receivedOn: '2026-09-21' },
    ],
    quotations: [
      { id: 'QT-0007', requestId: 'rq-402', client: 'Sample Orbit Pharma', title: 'Annual conference · Pune', lines: [
        { id: 'l1', label: 'Event Executive', quantity: 4, days: 2, ratePaise: 300000 },
        { id: 'l2', label: 'Hostess', quantity: 4, days: 2, ratePaise: 250000 },
        { id: 'l3', label: 'Porter', quantity: 3, days: 2, ratePaise: 120000 },
        { id: 'l4', label: 'Venue discovery support', quantity: 1, days: 1, ratePaise: 1500000 },
      ], discountPct: 5, adjustmentPaise: 0, status: 'ready', updatedOn: '2026-09-19' },
    ],
    payouts: [
      { id: 'po-1', freelancerId: 'fl-01', amountPaise: 450000, paidOn: '2026-09-05', reference: 'SAMPLE-PAY-0098' },
      { id: 'po-2', freelancerId: 'fl-02', amountPaise: 900000, paidOn: '2026-09-05', reference: 'SAMPLE-PAY-0099' },
      { id: 'po-3', freelancerId: 'fl-09', amountPaise: 300000, paidOn: '2026-09-05', reference: 'SAMPLE-PAY-0100' },
      { id: 'po-4', freelancerId: 'fl-07', amountPaise: 150000, paidOn: '2026-09-05', reference: 'SAMPLE-PAY-0101' },
    ],
    rsvpMembers: [
      { id: 'rm-1', name: 'Tara Kapoor', email: 'tara@sample.invalid', role: 'manager', eventIds: ['ev-101', 'ev-099'], active: true },
      { id: 'rm-2', name: 'Ishaan Roy', email: 'ishaan@sample.invalid', role: 'operator', eventIds: ['ev-101'], active: true },
      { id: 'rm-3', name: 'Lina Fernandes', email: 'lina@sample.invalid', role: 'viewer', eventIds: ['ev-103'], active: false },
    ],
    coAdmins: [
      { id: 'ca-1', name: 'Kavya Rao', main: true, capabilities: [...CAPABILITIES] },
      { id: 'ca-2', name: 'Aman Sethi', main: false, capabilities: ['Applications', 'Events', 'RSVP access'] },
      { id: 'ca-3', name: 'Zoya Qureshi', main: false, capabilities: ['Quotations', 'Finance', 'Reports'] },
    ],
    log: [{ at: '2026-09-21 09:00', text: 'Sample data loaded.', actor: 'System' }],
  };
}

export const rupees = (paise: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(paise) / 100);

/** Quote totals in integer paise: subtotal − discount + adjustment. */
export function quoteTotals(quote: Pick<Quotation, 'lines' | 'discountPct' | 'adjustmentPaise'>) {
  const subtotal = quote.lines.reduce(
    (sum, line) => sum + line.quantity * line.days * line.ratePaise,
    0,
  );
  const discount = Math.round((subtotal * quote.discountPct) / 100);
  return { subtotal, discount, total: subtotal - discount + quote.adjustmentPaise };
}

export function quoteFromRequest(
  request: ClientRequest,
  id: string,
  today: string,
  rates: Record<Role, number> = RATE_CARD,
): Quotation {
  let n = 0;
  return {
    id,
    requestId: request.id,
    client: request.client,
    title: `${request.occasion} · ${request.city}`,
    lines: [
      ...request.lines.map((line) => ({
        id: `l${++n}`,
        label: line.role,
        quantity: line.quantity,
        days: line.days,
        ratePaise: rates[line.role],
      })),
      ...request.extras.map((extra) => ({
        id: `l${++n}`,
        label: extra,
        quantity: 1,
        days: 1,
        ratePaise: EXTRA_RATES[extra] ?? 0,
      })),
    ],
    discountPct: 0,
    adjustmentPaise: 0,
    status: 'draft',
    updatedOn: today,
  };
}

export type EarningLine = {
  key: string;
  assignmentId: string;
  eventId: string;
  eventName: string;
  freelancerId: string;
  role: Role;
  amountPaise: number;
  approval: Approval;
};
/** One earning line per attended (appeared/late) assignment: days × day rate. */
export function earningLines(state: AdminState, freelancerId?: string): EarningLine[] {
  const lines: EarningLine[] = [];
  for (const a of state.assignments) {
    const event = state.events.find((e) => e.id === a.eventId);
    for (const id of a.approved) {
      if (freelancerId && id !== freelancerId) continue;
      const mark = event?.attendance[id];
      if (mark !== 'appeared' && mark !== 'late') continue;
      const key = `${a.id}:${id}`;
      lines.push({ key, assignmentId: a.id, eventId: a.eventId, eventName: event!.name, freelancerId: id, role: a.role, amountPaise: a.dayRatePaise * a.days, approval: state.approvals[key] ?? {} });
    }
  }
  return lines;
}
/**
 * Earned counts every attended line; only lines approved by BOTH the
 * coordinator and finance are payable. Remaining = approved − paid.
 */
export function earnings(state: AdminState, freelancerId: string) {
  const lines = earningLines(state, freelancerId);
  const earned = lines.reduce((n, l) => n + l.amountPaise, 0);
  const approved = lines
    .filter((l) => l.approval.coordinator && l.approval.finance)
    .reduce((n, l) => n + l.amountPaise, 0);
  const paid = state.payouts
    .filter((p) => p.freelancerId === freelancerId)
    .reduce((sum, p) => sum + p.amountPaise, 0);
  return { earned, approved, awaitingApproval: earned - approved, paid, remaining: Math.max(0, approved - paid) };
}

/** Finance approval only after the coordinator's; the same person can't do both. */
export function approveEarning(approval: Approval, stage: 'coordinator' | 'finance', actor: string): Approval {
  if (stage === 'finance' && !approval.coordinator)
    throw Error('The event coordinator must approve before finance.');
  if (stage === 'finance' && approval.coordinator === actor)
    throw Error('Finance approval needs a different person from the coordinator.');
  return { ...approval, [stage]: actor };
}

/** Collections for a quote: total, received and outstanding (separate from payouts). */
export function collectionStatus(state: AdminState, quote: Quotation) {
  const total = quoteTotals(quote).total;
  const received = state.collections
    .filter((c) => c.quoteId === quote.id)
    .reduce((n, c) => n + c.amountPaise, 0);
  return { total, received, outstanding: Math.max(0, total - received) };
}

/** Approving respects the assignment's quantity: never overfill. */
export function approveApplicant(assignment: Assignment, freelancerId: string) {
  if (assignment.approved.includes(freelancerId)) return assignment;
  if (assignment.approved.length >= assignment.quantity)
    throw Error(`All ${assignment.quantity} ${assignment.role} places are filled.`);
  return { ...assignment, approved: [...assignment.approved, freelancerId] };
}
