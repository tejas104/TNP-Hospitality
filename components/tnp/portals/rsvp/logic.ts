// Pure presentation logic for the RSVP workspace. Counts, filters and
// warnings are derived from the same records the directory displays.

import { addDays, daysBetween, localDate } from './dates.ts';
import type {
  ContactState,
  DeliveryState,
  DocState,
  EventData,
  FunctionRsvp,
  InvitationState,
  Member,
  Party,
  Priority,
  Stay,
  StayState,
  Transfer,
  TravelLeg,
} from './model.ts';
import { PRIORITY_LABEL } from './model.ts';

// ---------- People versus households ----------

export type PersonStatus = 'confirmed' | 'tentative' | 'declined' | 'awaiting';

/** One status per person across invited functions; the four values partition people. */
export function personStatus(member: Member): PersonStatus {
  const values = member.invitedFunctionIds.map((id) => member.responses[id] ?? 'awaiting');
  if (values.includes('confirmed')) return 'confirmed';
  if (values.includes('tentative')) return 'tentative';
  if (values.length > 0 && values.every((v) => v === 'declined' || v === 'cancelled')) return 'declined';
  return 'awaiting';
}

export function isAttending(member: Member) {
  const s = personStatus(member);
  return s === 'confirmed' || s === 'tentative';
}

export function activeMembers(data: Pick<EventData, 'members'>, partyId?: string) {
  return data.members.filter((m) => !m.removed && (!partyId || m.partyId === partyId));
}

export function functionCounts(data: Pick<EventData, 'functions' | 'members'>) {
  return data.functions.map((fn) => {
    const counts: Record<FunctionRsvp, number> = { awaiting: 0, confirmed: 0, tentative: 0, declined: 0, cancelled: 0 };
    let invited = 0;
    for (const m of data.members) {
      if (m.removed || !m.invitedFunctionIds.includes(fn.id)) continue;
      invited += 1;
      counts[m.responses[fn.id] ?? 'awaiting'] += 1;
    }
    return { fn, invited, counts };
  });
}

// ---------- Party rows and attention ----------

export type AttentionReason =
  | 'overdue'
  | 'delivery-failed'
  | 'delivery-uncertain'
  | 'needs-review'
  | 'missing-travel'
  | 'changed-arrival'
  | 'over-allowance'
  | 'document-issue'
  | 'room-conflict';

export const ATTENTION_LABEL: Record<AttentionReason, string> = {
  overdue: 'Follow-up overdue',
  'delivery-failed': 'Message failed — call or share web link',
  'delivery-uncertain': 'Delivery uncertain — reconcile before resending',
  'needs-review': 'Reply needs staff review',
  'missing-travel': 'Travel details missing',
  'changed-arrival': 'Arrival changed after movement plan',
  'over-allowance': 'More members than allowed',
  'document-issue': 'Document needs attention',
  'room-conflict': 'Room capacity conflict',
};

export type TravelStatus = 'none' | 'missing' | 'changed' | 'complete';

export type PartyRow = {
  party: Party;
  members: Member[];
  people: number;
  statusCounts: Record<PersonStatus, number>;
  attending: boolean;
  travel: TravelStatus;
  transferNeed: 'none' | 'required' | 'awaiting';
  stay: Stay | null;
  followUp: 'overdue' | 'today' | 'upcoming' | 'none';
  assistance: boolean;
  attention: AttentionReason[];
};

const ACTIVE_TRANSFER: Transfer['state'][] = ['planned', 'assigned', 'dispatched'];
const OCCUPYING: StayState[] = ['proposed', 'approval-pending', 'approved', 'communicated', 'checked-in'];

export function changedArrival(leg: TravelLeg, transfers: Transfer[]) {
  return transfers.some((t) => t.legId === leg.id && ACTIVE_TRANSFER.includes(t.state) && t.planBasedOn !== leg.at);
}

export function roomConflicts(data: Pick<EventData, 'hotels' | 'stays'>) {
  const conflicts = new Map<string, string>();
  for (const hotel of data.hotels) {
    for (const cat of hotel.categories) {
      const holding = data.stays.filter((s) => s.categoryId === cat.id && OCCUPYING.includes(s.state));
      if (holding.length > cat.inventory) {
        for (const s of holding) conflicts.set(s.id, `${cat.name}: ${holding.length} held for ${cat.inventory} rooms`);
      }
      for (const s of holding) {
        if (s.occupantIds.length > cat.maxOccupancy) conflicts.set(s.id, `${s.occupantIds.length} occupants exceed ${cat.name} maximum of ${cat.maxOccupancy}`);
      }
    }
  }
  return conflicts;
}

export function categoryUsage(data: Pick<EventData, 'hotels' | 'stays'>) {
  return data.hotels.flatMap((hotel) =>
    hotel.categories.map((cat) => ({
      hotel,
      cat,
      held: data.stays.filter((s) => s.categoryId === cat.id && OCCUPYING.includes(s.state)).length,
    })),
  );
}

export function buildPartyRows(data: EventData, now: number): PartyRow[] {
  const today = localDate(now, data.event.timezone);
  const conflicts = roomConflicts(data);
  return data.parties.map((party) => {
    const members = activeMembers(data, party.id);
    const statusCounts: Record<PersonStatus, number> = { confirmed: 0, tentative: 0, declined: 0, awaiting: 0 };
    for (const m of members) statusCounts[personStatus(m)] += 1;
    const attending = statusCounts.confirmed + statusCounts.tentative > 0;
    const legs = data.legs.filter((l) => l.partyId === party.id);
    const transfers = data.transfers.filter((t) => t.partyId === party.id);
    const anyChanged = legs.some((l) => changedArrival(l, transfers));
    const travel: TravelStatus = legs.length === 0 ? 'none' : anyChanged ? 'changed' : legs.some((l) => !l.at) ? 'missing' : 'complete';
    const needed = transfers.filter((t) => t.state !== 'not-required' && t.state !== 'cancelled');
    const transferNeed = needed.length === 0 ? 'none' : needed.some((t) => t.state === 'awaiting-details' || t.state === 'requested') ? 'awaiting' : 'required';
    const stay = data.stays.find((s) => s.partyId === party.id) ?? null;
    let followUp: PartyRow['followUp'] = 'none';
    if (party.followUpDueAt) {
      const dueDay = localDate(party.followUpDueAt, data.event.timezone);
      followUp = Date.parse(party.followUpDueAt) < now ? 'overdue' : dueDay === today ? 'today' : 'upcoming';
    }
    const attention: AttentionReason[] = [];
    if (followUp === 'overdue') attention.push('overdue');
    if (party.delivery === 'failed') attention.push('delivery-failed');
    if (party.delivery === 'uncertain') attention.push('delivery-uncertain');
    if (party.contact === 'needs-review') attention.push('needs-review');
    if (attending && travel === 'missing') attention.push('missing-travel');
    if (anyChanged) attention.push('changed-arrival');
    if (members.length - 1 > party.allowedAccompanying) attention.push('over-allowance');
    if (party.documentState === 'replacement-required' || party.documentState === 'download-failed') attention.push('document-issue');
    if (stay && conflicts.has(stay.id)) attention.push('room-conflict');
    return {
      party,
      members,
      people: members.length,
      statusCounts,
      attending,
      travel,
      transferNeed,
      stay,
      followUp,
      assistance: members.some((m) => m.accessibility),
      attention,
    };
  });
}

// ---------- Summary tiles ----------

export type Summary = {
  invitedPeople: number;
  parties: number;
  confirmedPeople: number;
  tentativePeople: number;
  declinedPeople: number;
  awaitingPeople: number;
  unansweredParties: number;
  overdueFollowUps: number;
  missingTravel: number;
  outstandingTransfers: number;
  stayRequests: number;
  allocatedRooms: number;
  roomExceptions: number;
  documentQueue: number;
  recentChanges: number;
  dueToday: number;
  attention: number;
};

export function summarize(rows: PartyRow[], data: EventData): Summary {
  const sum = (fn: (r: PartyRow) => number) => rows.reduce((s, r) => s + fn(r), 0);
  const conflicts = roomConflicts(data);
  return {
    invitedPeople: sum((r) => r.people),
    parties: rows.length,
    confirmedPeople: sum((r) => r.statusCounts.confirmed),
    tentativePeople: sum((r) => r.statusCounts.tentative),
    declinedPeople: sum((r) => r.statusCounts.declined),
    awaitingPeople: sum((r) => r.statusCounts.awaiting),
    unansweredParties: rows.filter((r) => r.party.contact === 'no-response').length,
    overdueFollowUps: rows.filter((r) => r.followUp === 'overdue').length,
    missingTravel: rows.filter((r) => r.attending && r.travel === 'missing').length,
    outstandingTransfers: data.transfers.filter((t) => ['requested', 'awaiting-details', 'planned'].includes(t.state)).length,
    stayRequests: data.stays.filter((s) => s.state !== 'not-required').length,
    allocatedRooms: data.stays.filter((s) => ['approved', 'communicated', 'checked-in'].includes(s.state)).length,
    roomExceptions: conflicts.size,
    documentQueue: data.documents.filter((d) => ['requested', 'received', 'under-review', 'replacement-required', 'download-failed', 'download-pending'].includes(d.state)).length,
    recentChanges: rows.filter((r) => r.party.changes.length > 0).length,
    dueToday: rows.filter((r) => r.followUp === 'today').length,
    attention: rows.filter((r) => r.attention.length > 0).length,
  };
}

// ---------- Directory filters ----------

export type GuestFilters = {
  query: string;
  functionId: string;
  functionRsvp: FunctionRsvp | 'any';
  person: PersonStatus | 'any';
  contact: ContactState | 'any';
  invitation: InvitationState | 'any';
  delivery: DeliveryState | 'any';
  priority: Priority | 'any';
  caller: string;
  followUp: 'any' | 'overdue' | 'today' | 'upcoming' | 'none';
  travel: TravelStatus | 'any';
  transfer: PartyRow['transferNeed'] | 'any';
  stay: StayState | 'any';
  document: DocState | 'any';
  assistance: 'any' | 'yes';
  attention: 'any' | 'yes';
};

export const EMPTY_FILTERS: GuestFilters = {
  query: '',
  functionId: 'any',
  functionRsvp: 'any',
  person: 'any',
  contact: 'any',
  invitation: 'any',
  delivery: 'any',
  priority: 'any',
  caller: 'any',
  followUp: 'any',
  travel: 'any',
  transfer: 'any',
  stay: 'any',
  document: 'any',
  assistance: 'any',
  attention: 'any',
};

function normalize(value: string) {
  return value.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

function digits(value: string) {
  return value.replace(/\D/g, '');
}

export function matchesQuery(row: PartyRow, query: string) {
  const q = normalize(query);
  if (!q) return true;
  const qDigits = digits(query);
  if (qDigits.length >= 4 && digits(row.party.phone).includes(qDigits)) return true;
  const haystack = [row.party.displayName, row.party.ref, row.party.email, ...row.members.map((m) => m.name)].map(normalize);
  return haystack.some((h) => h.includes(q));
}

export function matchesFilters(row: PartyRow, f: GuestFilters) {
  if (!matchesQuery(row, f.query)) return false;
  if (f.functionId !== 'any' || f.functionRsvp !== 'any') {
    const ok = row.members.some((m) => {
      const ids = f.functionId === 'any' ? m.invitedFunctionIds : m.invitedFunctionIds.filter((id) => id === f.functionId);
      return ids.some((id) => f.functionRsvp === 'any' || (m.responses[id] ?? 'awaiting') === f.functionRsvp);
    });
    if (!ok) return false;
  }
  if (f.person !== 'any' && row.statusCounts[f.person] === 0) return false;
  if (f.contact !== 'any' && row.party.contact !== f.contact) return false;
  if (f.invitation !== 'any' && row.party.invitation !== f.invitation) return false;
  if (f.delivery !== 'any' && row.party.delivery !== f.delivery) return false;
  if (f.priority !== 'any' && row.party.priority !== f.priority) return false;
  if (f.caller !== 'any' && row.party.assignedCaller !== f.caller) return false;
  if (f.followUp !== 'any' && row.followUp !== f.followUp) return false;
  if (f.travel !== 'any' && (row.travel !== f.travel || (f.travel === 'missing' && !row.attending))) return false;
  if (f.transfer !== 'any' && row.transferNeed !== f.transfer) return false;
  if (f.stay !== 'any' && (row.stay?.state ?? 'not-required') !== f.stay) return false;
  if (f.document !== 'any' && row.party.documentState !== f.document) return false;
  if (f.assistance === 'yes' && !row.assistance) return false;
  if (f.attention === 'yes' && row.attention.length === 0) return false;
  return true;
}

/** People matching the active filter: counts people with the filtered person status when one is set. */
export function matchingPeople(rows: PartyRow[], f: GuestFilters) {
  return rows.reduce((s, r) => s + (f.person === 'any' ? r.people : r.statusCounts[f.person]), 0);
}

export function activeFilterKeys(f: GuestFilters) {
  return (Object.keys(EMPTY_FILTERS) as Array<keyof GuestFilters>).filter((k) => k !== 'query' && f[k] !== EMPTY_FILTERS[k]);
}

const FOLLOW_ORDER = { overdue: 0, today: 1, upcoming: 2, none: 3 } as const;

export type SortKey = 'attention' | 'name' | 'reference' | 'follow-up';

/** Stable, predictable ordering; overdue work first by oldest due time. */
export function sortRows(rows: PartyRow[], key: SortKey) {
  const indexed = rows.map((row, i) => ({ row, i }));
  const due = (r: PartyRow) => (r.party.followUpDueAt ? Date.parse(r.party.followUpDueAt) : Number.POSITIVE_INFINITY);
  const priority = { vvip: 0, vip: 1, standard: 2 } as const;
  indexed.sort((a, b) => {
    let d = 0;
    if (key === 'name') d = a.row.party.displayName.localeCompare(b.row.party.displayName);
    else if (key === 'reference') d = a.row.party.ref.localeCompare(b.row.party.ref);
    else if (key === 'follow-up') d = FOLLOW_ORDER[a.row.followUp] - FOLLOW_ORDER[b.row.followUp] || due(a.row) - due(b.row);
    else
      d =
        FOLLOW_ORDER[a.row.followUp] - FOLLOW_ORDER[b.row.followUp] ||
        due(a.row) - due(b.row) ||
        b.row.attention.length - a.row.attention.length ||
        priority[a.row.party.priority] - priority[b.row.party.priority];
    return d || a.row.party.ref.localeCompare(b.row.party.ref) || a.i - b.i;
  });
  return indexed.map((x) => x.row);
}

export function filterLabel(key: keyof GuestFilters, f: GuestFilters, fnName: (id: string) => string) {
  const v = String(f[key]);
  const words = v.replace(/-/g, ' ');
  switch (key) {
    case 'functionId':
      return `Function: ${fnName(v)}`;
    case 'functionRsvp':
      return `Function RSVP: ${words}`;
    case 'person':
      return `People: ${words}`;
    case 'priority':
      return `Priority: ${PRIORITY_LABEL[f.priority as Priority] ?? v}`;
    case 'caller':
      return `Caller: ${v}`;
    case 'followUp':
      return `Follow-up: ${words}`;
    case 'assistance':
      return 'Special assistance';
    case 'attention':
      return 'Needs attention';
    default:
      return `${key.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${words}`.replace(/^./, (c) => c.toUpperCase());
  }
}

// ---------- Selection reconciliation ----------

/**
 * visible: in the current filtered list. filtered-out: still in this event but
 * hidden by filters (kept open with an explicit explanation). gone: not in this
 * context at all, so the detail must close.
 */
export function selectionStatus(selectedId: string | null, visibleIds: string[], contextIds: string[]) {
  if (!selectedId) return 'none' as const;
  if (visibleIds.includes(selectedId)) return 'visible' as const;
  if (contextIds.includes(selectedId)) return 'filtered-out' as const;
  return 'gone' as const;
}

/** Bulk selections never survive into a list where the records are not visible. */
export function reconcileBulk(selected: string[], visibleIds: string[]) {
  const visible = new Set(visibleIds);
  return selected.filter((id) => visible.has(id));
}

// ---------- Service calendar ----------

export type CalendarStatus = 'complete' | 'overdue' | 'due-today' | 'due-soon' | 'upcoming' | 'not-applicable' | 'revised';

export type CalendarTask = {
  id: string;
  offset: number;
  offsetLabel: string;
  title: string;
  owner: string;
  due: string;
  revisedDue: string | null;
  status: CalendarStatus;
  escalation: 'none' | 'watch' | 'escalated';
  prerequisite: string;
  related: number;
  relatedLabel: string;
  nextAction: string;
};

type Milestone = {
  id: string;
  offset: number;
  label?: string;
  title: string;
  owner: string;
  related: (rows: PartyRow[], data: EventData) => number;
  relatedLabel: string;
  nextAction: string;
  applicable?: (data: EventData) => boolean;
};

const MILESTONES: Milestone[] = [
  { id: 't30', offset: -30, title: 'Guest import and RSVP kickoff', owner: 'Coordinator', related: (r) => r.filter((x) => x.party.invitation !== 'issued').length, relatedLabel: 'parties not yet invited', nextAction: 'Finish import review and prepare invitations for approval' },
  { id: 't28', offset: -28, title: 'Responses and accompanying-member changes', owner: 'Calling team', related: (r) => r.filter((x) => x.party.contact !== 'recorded').length, relatedLabel: 'parties without a recorded response', nextAction: 'Work the calling queue; record each party change' },
  { id: 't26', offset: -26, title: 'Document follow-up (policy permitting)', owner: 'Coordinator', related: (_r, d) => d.documents.filter((x) => ['requested', 'replacement-required', 'download-failed'].includes(x.state)).length, relatedLabel: 'document items outstanding', nextAction: 'Follow up only where the approved policy requires a document', applicable: (d) => d.documents.length > 0 },
  { id: 't24', offset: -24, title: 'Guest, contact and stay cross-check', owner: 'Coordinator', related: (r) => r.filter((x) => x.attention.includes('needs-review') || x.attention.includes('over-allowance')).length, relatedLabel: 'parties with unresolved details', nextAction: 'Resolve replies needing review and allowance exceptions' },
  { id: 't22', offset: -22, title: 'Travel and transport categorization', owner: 'Logistics', related: (r) => r.filter((x) => x.attending && x.travel === 'missing').length, relatedLabel: 'attending parties missing travel', nextAction: 'Collect arrival and departure details separately' },
  { id: 't20', offset: -20, title: 'Preliminary pickup/drop planning', owner: 'Logistics', related: (_r, d) => d.transfers.filter((t) => t.state === 'requested' || t.state === 'awaiting-details').length, relatedLabel: 'transfers not yet planned', nextAction: 'Group arrivals into draft movements' },
  { id: 't18', offset: -18, label: 'T-18 to T-16', title: 'Rooming proposal and approval', owner: 'Hospitality lead', related: (_r, d) => d.stays.filter((s) => ['requested', 'proposed', 'approval-pending'].includes(s.state)).length, relatedLabel: 'stays awaiting proposal or approval', nextAction: 'Propose rooms and send for customer approval', applicable: (d) => d.hotels.length > 0 },
  { id: 't15', offset: -15, title: 'Invitation milestone (save-the-date / e-invite naming to confirm)', owner: 'Coordinator', related: (r) => r.filter((x) => x.party.invitation !== 'issued').length, relatedLabel: 'parties not yet issued', nextAction: 'Confirm naming with the customer; invitations began at T-30' },
  { id: 't10', offset: -10, title: 'Final confirmation calls', owner: 'Calling team', related: (r) => r.filter((x) => x.statusCounts.awaiting > 0).length, relatedLabel: 'parties with people awaiting confirmation', nextAction: 'Call every party with awaiting members' },
  { id: 't7', offset: -7, title: 'Guest, travel, room and pickup reconfirmation', owner: 'Hospitality lead', related: (r) => r.filter((x) => x.party.priority !== 'standard' && x.attention.length > 0).length, relatedLabel: 'VIP/VVIP parties needing attention', nextAction: 'Reconfirm VIP/VVIP arrangements first' },
  { id: 't5', offset: -5, title: 'Movement and hospitality plan', owner: 'Logistics', related: (_r, d) => d.transfers.filter((t) => ['requested', 'awaiting-details', 'planned'].includes(t.state)).length, relatedLabel: 'transfers without a vehicle', nextAction: 'Assign vehicles and share manifests with transport' },
  { id: 't3', offset: -3, title: 'Complete guest and logistics audit', owner: 'Service manager', related: (r) => r.filter((x) => x.attention.length > 0).length, relatedLabel: 'parties with open exceptions', nextAction: 'Clear every needs-attention reason and version the reports' },
  { id: 't2', offset: -2, title: 'Approved final details communicated', owner: 'Hospitality lead', related: (_r, d) => d.stays.filter((s) => s.state === 'approved').length, relatedLabel: 'approved rooms not yet communicated', nextAction: 'Communicate only approved room details' },
  { id: 't0', offset: 0, label: 'Function days', title: 'Function-day instructions and check-in', owner: 'Event-day desk', related: (r) => r.reduce((s, x) => s + x.statusCounts.confirmed, 0), relatedLabel: 'confirmed people expected', nextAction: 'Share function instructions and run check-in' },
  { id: 'post', offset: 1, label: 'After event', title: 'Departures, closure and retention tasks', owner: 'Service manager', related: (_r, d) => d.transfers.filter((t) => t.kind === 'drop' && t.state !== 'completed' && t.state !== 'not-required').length, relatedLabel: 'departure transfers open', nextAction: 'Close departures, approve thank-you copy, schedule retention' },
];

export function buildCalendar(data: EventData, rows: PartyRow[], today: string): { tasks: CalendarTask[]; lateOnboarding: boolean } {
  const start = data.event.startsOn;
  const lateOnboarding = data.event.onboardedOn > addDays(start, -30);
  const tasks = MILESTONES.map((m, index) => {
    const due = m.id === 'post' ? addDays(start, Math.max(data.functions.length, 1)) : addDays(start, m.offset);
    const applicable = m.applicable ? m.applicable(data) : true;
    const related = applicable ? m.related(rows, data) : 0;
    let revisedDue: string | null = null;
    if (lateOnboarding && due < data.event.onboardedOn) {
      // Compressed proposal: missed milestones are respread from onboarding, never sent automatically.
      const nextOriginal = MILESTONES.slice(index + 1)
        .map((n) => addDays(start, n.offset))
        .find((d) => d >= data.event.onboardedOn);
      const span = nextOriginal ? Math.max(daysBetween(data.event.onboardedOn, nextOriginal), 1) : 1;
      const missed = MILESTONES.filter((n) => addDays(start, n.offset) < data.event.onboardedOn).length;
      revisedDue = addDays(data.event.onboardedOn, Math.min(Math.floor((index * span) / Math.max(missed, 1)), span - 1));
    }
    const effective = revisedDue ?? due;
    let status: CalendarStatus;
    if (!applicable) status = 'not-applicable';
    else if (effective < today) status = related > 0 ? 'overdue' : 'complete';
    else if (effective === today) status = 'due-today';
    else if (daysBetween(today, effective) <= 2) status = 'due-soon';
    else status = revisedDue ? 'revised' : 'upcoming';
    if (revisedDue && status !== 'complete' && status !== 'overdue' && status !== 'not-applicable' && effective > today) status = 'revised';
    const overdueDays = status === 'overdue' ? daysBetween(effective, today) : 0;
    const escalation = status === 'overdue' ? (overdueDays > 2 || rows.some((r) => r.party.priority === 'vvip' && r.attention.length > 0) ? 'escalated' : 'watch') : 'none';
    const prev = index > 0 ? MILESTONES[index - 1] : null;
    return {
      id: m.id,
      offset: m.offset,
      offsetLabel: m.label ?? (m.offset === 0 ? 'T-0' : `T${m.offset}`),
      title: m.title,
      owner: m.owner,
      due,
      revisedDue,
      status,
      escalation,
      prerequisite: prev ? prev.title : 'Engagement onboarding and guest source file',
      related,
      relatedLabel: applicable ? m.relatedLabel : 'Disabled by the current document policy',
      nextAction: applicable ? m.nextAction : 'No action until a document policy is approved',
    } satisfies CalendarTask;
  });
  return { tasks, lateOnboarding };
}

// ---------- Movements ----------

export type Manifest = {
  id: string;
  kind: 'pickup' | 'drop';
  date: string;
  window: string;
  location: string;
  transfers: Transfer[];
  passengers: number;
  vehicleId: string | null;
  seats: number;
  capacityIssue: string | null;
  changed: boolean;
};

export function transferPassengers(t: Transfer, data: Pick<EventData, 'legs' | 'members'>) {
  const leg = data.legs.find((l) => l.id === t.legId);
  const ids = leg?.passengerIds ?? data.members.filter((m) => m.partyId === t.partyId).map((m) => m.id);
  const active = new Set(data.members.filter((m) => !m.removed && isAttending(m)).map((m) => m.id));
  return ids.filter((id) => active.has(id)).length;
}

export function buildManifests(data: EventData): Manifest[] {
  const groups = new Map<string, Manifest>();
  const tz = data.event.timezone;
  for (const t of data.transfers) {
    if (!['planned', 'assigned', 'dispatched', 'guest-met'].includes(t.state)) continue;
    const leg = data.legs.find((l) => l.id === t.legId);
    if (!leg?.at) continue;
    const date = localDate(leg.at, tz);
    const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', hourCycle: 'h23' }).format(new Date(leg.at)));
    const block = Math.floor(hour / 3) * 3;
    const window = `${String(block).padStart(2, '0')}:00–${String(block + 3).padStart(2, '0')}:00`;
    const location = t.kind === 'pickup' ? `${leg.mode === 'train' ? 'Railway station' : leg.mode === 'bus' ? 'Bus terminal' : 'Airport'} → hotel` : `Hotel → ${leg.mode === 'train' ? 'Railway station' : 'Airport'}`;
    const key = `${t.kind}|${date}|${window}|${location}|${t.vehicleId ?? 'unassigned'}`;
    const m = groups.get(key) ?? {
      id: `mf-${t.kind}-${date}-${block}-${location.length}-${t.vehicleId ?? 'none'}`,
      kind: t.kind,
      date,
      window,
      location,
      transfers: [],
      passengers: 0,
      vehicleId: t.vehicleId,
      seats: 0,
      capacityIssue: null,
      changed: false,
    };
    m.transfers.push(t);
    m.passengers += transferPassengers(t, data);
    if (leg && changedArrival(leg, [t])) m.changed = true;
    groups.set(key, m);
  }
  const list = [...groups.values()];
  for (const m of list) {
    const v = data.vehicles.find((x) => x.id === m.vehicleId);
    m.seats = v?.seats ?? 0;
    if (v && m.passengers > v.seats) m.capacityIssue = `${m.passengers} passengers exceed ${v.seats} seats`;
    const doubleBooked = v && list.some((o) => o !== m && o.vehicleId === v.id && o.date === m.date && o.window === m.window);
    if (doubleBooked) m.capacityIssue = `${v.label} is also assigned to another movement in this window`;
  }
  return list.sort((a, b) => a.date.localeCompare(b.date) || a.window.localeCompare(b.window) || a.kind.localeCompare(b.kind));
}

/** Transfers and stays affected when a travel leg changes. */
export function dependentsOfLeg(legId: string, data: EventData) {
  const leg = data.legs.find((l) => l.id === legId);
  if (!leg) return { transfers: [], stay: null as Stay | null, stayDateMismatch: false };
  const transfers = data.transfers.filter((t) => t.legId === legId && t.state !== 'not-required' && t.state !== 'cancelled');
  const stay = data.stays.find((s) => s.partyId === leg.partyId && s.state !== 'not-required') ?? null;
  let stayDateMismatch = false;
  if (stay && leg.at) {
    const day = localDate(leg.at, data.event.timezone);
    stayDateMismatch = leg.direction === 'arrival' ? day < stay.checkIn : day > stay.checkOut;
  }
  return { transfers, stay, stayDateMismatch };
}
