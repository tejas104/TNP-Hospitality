// Task-local SYNTHETIC RSVP adapter. It imitates the shape of a scoped,
// versioned, idempotent service so the UI can exercise real states. It is not
// authentication, not server-enforced tenant isolation and not durable
// persistence: everything runs in this browser tab against fictional records.

import { addDays, localDate } from './dates.ts';
import { createFixtures, type Fixtures } from './fixtures.ts';
import type { PreviewRow } from './importer.ts';
import { ALL_SECTIONS } from './fixtures.ts';
import { buildManifests, buildPartyRows } from './logic.ts';
import type {
  CallOutcome,
  ChangeEntry,
  Customer,
  Engagement,
  EventData,
  FunctionRsvp,
  Member,
  Organization,
  Party,
  Persona,
  Priority,
  ReportKind,
  ReportSnapshot,
  Role,
  RsvpEvent,
  Section,
  StayState,
  TransferState,
  TravelMode,
} from './model.ts';

export type AdapterErrorCode =
  | 'not-found'
  | 'suspended'
  | 'expired'
  | 'revoked'
  | 'forbidden'
  | 'stale-version'
  | 'validation'
  | 'unavailable'
  | 'offline'
  | 'conflict'
  | 'closed'
  | 'lost-response';

export type AdapterError = {
  code: AdapterErrorCode;
  message: string;
  retryable: boolean;
  fields?: Record<string, string>;
};

export type Result<T> = { ok: true; value: T; replayed: boolean; requestId?: string } | { ok: false; error: AdapterError; requestId?: string };

export type Scenario = 'none' | 'error' | 'offline' | 'lost-response' | 'partial-import';

export type Access = {
  persona: Persona;
  organizations: Organization[];
  blocked: Array<{ org: Organization; reason: 'suspended' | 'expired' }>;
  customers: Customer[];
  engagements: Engagement[];
  events: RsvpEvent[];
};

export const ROLE_SECTIONS: Record<Role, Section[]> = {
  'service-manager': ALL_SECTIONS,
  'vendor-owner': ALL_SECTIONS,
  coordinator: ALL_SECTIONS,
  'calling-agent': ['overview', 'today', 'calendar', 'guests', 'calls'],
  'customer-owner': ['overview', 'today', 'calendar', 'guests', 'add', 'import', 'rooming', 'messages', 'reports'],
  'hotel-contact': ['rooming'],
  'transport-coordinator': ['travel', 'movements'],
};

export type PartyDraftMember = { name: string; ageBand: 'adult' | 'child'; functionIds: string[]; dietary: string; accessibility: string };
export type PartyDraft = {
  displayName: string;
  phone: string;
  email: string;
  priority: Priority;
  language: string;
  allowedAccompanying: number;
  members: PartyDraftMember[];
  duplicateReviewed: boolean;
};

export type GuestAnswers = {
  responses: Record<string, Record<string, FunctionRsvp>>;
  arrival: { mode: TravelMode; reference: string; from: string; at: string } | null;
  departure: { mode: TravelMode; reference: string; to: string; at: string } | null;
  pickup: boolean;
  drop: boolean;
  stay: 'needed' | 'not-needed' | null;
  dietary: Record<string, string>;
  accessibility: Record<string, string>;
};

export type Command =
  | { type: 'record-call'; partyId: string; baseVersion: number; outcome: CallOutcome; note: string; nextDueAt: string | null }
  | { type: 'reschedule'; partyId: string; baseVersion: number; dueAt: string }
  | { type: 'update-responses'; partyId: string; baseVersion: number; responses: Record<string, Record<string, FunctionRsvp>> }
  | { type: 'update-party'; partyId: string; baseVersion: number; patch: { notes?: string; priority?: Priority; assignedCaller?: string; allowedAccompanying?: number } }
  | { type: 'bulk-assign-caller'; items: Array<{ partyId: string; baseVersion: number }>; caller: string }
  | { type: 'create-party'; draft: PartyDraft }
  | { type: 'change-leg'; legId: string; baseVersion: number; at: string | null; reference: string }
  | { type: 'transfer'; transferId: string; baseVersion: number; state: TransferState }
  | { type: 'assign-vehicle'; transferIds: string[]; baseVersion: number; vehicleId: string | null }
  | { type: 'replan-transfer'; transferIds: string[]; baseVersion: number }
  | { type: 'stay'; stayId: string; baseVersion: number; to: StayState; hotelId?: string; categoryId?: string; roomLabel?: string }
  | { type: 'generate-report'; kind: ReportKind; filters: string; columns: string[]; scopeSignature?: string; scope?: { people: number; parties: number; records: number } };

export const COMMAND_ROLES: Record<Command['type'], Role[]> = {
  'record-call': ['service-manager', 'vendor-owner', 'coordinator', 'calling-agent'],
  reschedule: ['service-manager', 'vendor-owner', 'coordinator', 'calling-agent'],
  'update-responses': ['service-manager', 'vendor-owner', 'coordinator', 'calling-agent', 'customer-owner'],
  'update-party': ['service-manager', 'vendor-owner', 'coordinator', 'calling-agent'],
  'bulk-assign-caller': ['service-manager', 'vendor-owner', 'coordinator'],
  'create-party': ['service-manager', 'vendor-owner', 'coordinator', 'customer-owner'],
  'change-leg': ['service-manager', 'vendor-owner', 'coordinator', 'transport-coordinator'],
  transfer: ['service-manager', 'vendor-owner', 'coordinator', 'transport-coordinator'],
  'assign-vehicle': ['service-manager', 'vendor-owner', 'coordinator', 'transport-coordinator'],
  'replan-transfer': ['service-manager', 'vendor-owner', 'coordinator', 'transport-coordinator'],
  stay: ['service-manager', 'vendor-owner', 'coordinator', 'customer-owner', 'hotel-contact'],
  'generate-report': ['service-manager', 'vendor-owner', 'coordinator', 'customer-owner'],
};

// Which stay transitions each role may perform. Customer approval is distinct from staff allocation.
const STAY_TRANSITIONS: Record<StayState, StayState[]> = {
  'not-required': ['requested'],
  requested: ['proposed', 'not-required'],
  proposed: ['approval-pending', 'requested'],
  'approval-pending': ['approved', 'proposed'],
  approved: ['communicated', 'proposed'],
  communicated: ['checked-in', 'proposed'],
  'checked-in': ['checked-out'],
  'checked-out': [],
};

export const TRANSFER_TRANSITIONS: Partial<Record<TransferState, TransferState[]>> = {
  requested: ['planned', 'cancelled'],
  'awaiting-details': ['planned', 'cancelled'],
  planned: ['cancelled'],
  assigned: ['dispatched', 'cancelled'],
  dispatched: ['guest-met', 'no-show'],
  'guest-met': ['completed'],
};

export type ImportRowOutcome = {
  rowNumber: number;
  key: string;
  result: 'accepted' | 'rejected' | 'skipped' | 'unresolved' | 'failed';
  reason: string;
  partyRef?: string;
  replayed: boolean;
};

export type StorageLike = { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void };

type State = {
  anchor: string;
  fixtures: Fixtures;
  receipts: Record<string, { fingerprint: string; result: Result<unknown> }>;
  rowReceipts: Record<string, { fingerprint: string; outcome: ImportRowOutcome }>;
  historicalLegIds?: string[];
  importParties: Record<string, string>;
  seq: number;
};

const STORAGE_KEY = 'tnp-rsvp-synthetic-v1';

/** Stable JSON with sorted keys, used as a canonical request fingerprint. */
export function fingerprint(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(fingerprint).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value as object)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${fingerprint((value as Record<string, unknown>)[k])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value ?? null);
}

let fallbackCounter = 0;
/** New logical action identity. A retry of the same action must reuse the old id. */
export function newRequestId(prefix = 'req') {
  const c = globalThis.crypto as Crypto | undefined;
  const id = c?.randomUUID ? c.randomUUID() : `${Date.now().toString(36)}-${(fallbackCounter += 1)}`;
  return `${prefix}-${id}`;
}

const fail = (code: AdapterErrorCode, message: string, retryable = false, fields?: Record<string, string>): Result<never> => ({
  ok: false,
  error: { code, message, retryable, fields },
});

export type AdapterOptions = { now?: () => number; latency?: number; storage?: StorageLike | null; timezone?: string };

export function createRsvpAdapter(options: AdapterOptions = {}) {
  const now = options.now ?? (() => Date.now());
  const latency = options.latency ?? 0;
  const anchorFor = () => localDate(now(), options.timezone ?? 'Asia/Kolkata');
  let storageStatus: 'session' | 'memory' | 'unavailable' = options.storage ? 'session' : 'memory';
  let scenario: Scenario = 'none';
  let state = load();

  function seed(): State {
    const anchor = anchorFor();
    return { anchor, fixtures: createFixtures(anchor), receipts: {}, rowReceipts: {}, importParties: {}, seq: 1 };
  }

  function load(): State {
    if (!options.storage) return seed();
    try {
      const raw = options.storage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as State;
        if (parsed && parsed.anchor === anchorFor() && parsed.fixtures?.events) return parsed;
      }
    } catch {
      storageStatus = 'unavailable';
    }
    return seed();
  }

  function persist() {
    if (!options.storage || storageStatus === 'unavailable') return;
    try {
      options.storage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      storageStatus = 'unavailable';
    }
  }

  const wait = () => (latency > 0 ? new Promise((r) => setTimeout(r, latency)) : Promise.resolve());

  function takeScenario(): Scenario {
    const s = scenario;
    if (s !== 'partial-import') scenario = 'none';
    return s;
  }

  function access(personaId: string): Result<Access> {
    const f = state.fixtures;
    const persona = f.personas.find((p) => p.id === personaId);
    if (!persona) return fail('not-found', 'This preview persona does not exist.');
    if (persona.scenario === 'session-revoked') return fail('revoked', 'This session was revoked. Sign in again to continue.');
    const today = state.anchor;
    const all = persona.orgIds.map((id) => f.organizations.find((o) => o.id === id)).filter((o): o is Organization => Boolean(o));
    const blocked: Access['blocked'] = [];
    const organizations: Organization[] = [];
    for (const org of all) {
      if (org.status === 'suspended') blocked.push({ org, reason: 'suspended' });
      else if (org.serviceEndsOn < today) blocked.push({ org, reason: 'expired' });
      else organizations.push(org);
    }
    if (organizations.length === 0) {
      const b = blocked[0];
      if (b?.reason === 'suspended') return fail('suspended', `${b.org.name} is suspended. New sessions and actions are blocked.`);
      if (b?.reason === 'expired') return fail('expired', `${b.org.name}'s service period ended on ${b.org.serviceEndsOn}.`);
      return fail('forbidden', 'No organization membership is active for this persona.');
    }
    const orgIds = new Set(organizations.map((o) => o.id));
    const engagements = f.engagements.filter((e) => orgIds.has(e.orgId) && (!persona.customerId || e.customerId === persona.customerId));
    const engIds = new Set(engagements.map((e) => e.id));
    const customers = f.customers.filter((c) => engagements.some((e) => e.customerId === c.id));
    const events = Object.values(f.events)
      .map((d) => d.event)
      .filter((e) => orgIds.has(e.orgId) && engIds.has(e.engagementId));
    return { ok: true, replayed: false, value: structuredClone({ persona, organizations, blocked, customers, engagements, events }) };
  }

  function scopedEvent(personaId: string, eventId: string): Result<{ persona: Persona; data: EventData; org: Organization }> {
    const a = access(personaId);
    if (!a.ok) return a;
    const event = a.value.events.find((e) => e.id === eventId);
    // Unknown and out-of-scope events answer identically so existence is not revealed.
    if (!event) return fail('not-found', 'This event is not available in your current access.');
    const data = state.fixtures.events[eventId];
    const org = a.value.organizations.find((o) => o.id === event.orgId) as Organization;
    return { ok: true, replayed: false, value: { persona: a.value.persona, data, org } };
  }

  function redact(data: EventData, role: Role): EventData {
    const copy = structuredClone(data);
    if (role === 'hotel-contact' || role === 'transport-coordinator') {
      copy.documents = [];
      copy.messages = [];
      copy.templates = [];
      copy.reports = [];
      for (const p of copy.parties) {
        p.email = '';
        p.notes = '';
        p.calls = [];
        p.changes = p.changes.filter((c) => c.field.startsWith('Arrival') || c.field.startsWith('Departure') || c.field.startsWith('Stay'));
        p.documentState = 'not-required';
        if (role === 'hotel-contact') p.phone = '';
      }
      if (role === 'hotel-contact') {
        copy.legs = [];
        copy.transfers = [];
        copy.vehicles = [];
      }
    }
    return copy;
  }

  function change(party: Party, actor: string, field: string, before: string, after: string, source: ChangeEntry['source']) {
    state.seq += 1;
    party.changes.unshift({ id: `chg-${state.seq}`, at: new Date(now()).toISOString(), actor, field, before, after, source });
  }

  function touch(data: EventData, party?: Party) {
    data.dataRevision += 1;
    if (party) {
      party.version += 1;
      party.updatedAt = new Date(now()).toISOString();
    }
  }

  function invalidateLegPlan(data: EventData, legId: string) {
    for (const transfer of data.transfers) {
      if (transfer.legId !== legId || !['requested', 'awaiting-details', 'planned', 'assigned', 'dispatched'].includes(transfer.state)) continue;
      transfer.vehicleId = null;
      transfer.planBasedOn = null;
      if (transfer.state === 'assigned' || transfer.state === 'dispatched') transfer.state = 'planned';
    }
  }

  function partyFor(data: EventData, partyId: string, baseVersion: number): Result<Party> {
    const party = data.parties.find((p) => p.id === partyId);
    if (!party) return fail('not-found', 'This party is no longer in the event.');
    if (party.version !== baseVersion) {
      return fail('stale-version', `${party.displayName} changed since you opened it (now version ${party.version}). Review the latest details, then apply your change again.`);
    }
    return { ok: true, replayed: false, value: party };
  }

  function apply(persona: Persona, data: EventData, cmd: Command): Result<unknown> {
    const actor = persona.name;
    switch (cmd.type) {
      case 'record-call': {
        const p = partyFor(data, cmd.partyId, cmd.baseVersion);
        if (!p.ok) return p;
        if (cmd.outcome === 'callback-requested' && !cmd.nextDueAt) return fail('validation', 'A callback needs a follow-up time.', false, { nextDueAt: 'Choose when to call back.' });
        const party = p.value;
        state.seq += 1;
        party.calls.unshift({ id: `call-${state.seq}`, at: new Date(now()).toISOString(), actor, outcome: cmd.outcome, note: cmd.note });
        const before = party.followUpDueAt ?? 'none';
        party.followUpDueAt = cmd.outcome === 'declined-contact' ? null : cmd.nextDueAt;
        party.followUpReason =
          cmd.outcome === 'declined-contact'
            ? 'Declined contact — do not call again'
            : cmd.outcome === 'wrong-number'
              ? 'Contact details need correction'
              : cmd.outcome === 'callback-requested'
                ? 'Guest asked for a callback'
                : cmd.outcome === 'needs-review'
                  ? 'Call outcome needs review'
                  : party.followUpReason;
        if (cmd.outcome === 'needs-review') party.contact = 'needs-review';
        change(party, actor, 'Next follow-up', before, party.followUpDueAt ?? 'none', 'call');
        touch(data, party);
        return { ok: true, replayed: false, value: structuredClone(party) };
      }
      case 'reschedule': {
        const p = partyFor(data, cmd.partyId, cmd.baseVersion);
        if (!p.ok) return p;
        if (Number.isNaN(Date.parse(cmd.dueAt))) return fail('validation', 'Choose a valid follow-up time.', false, { dueAt: 'Choose a date and time.' });
        const before = p.value.followUpDueAt ?? 'none';
        p.value.followUpDueAt = cmd.dueAt;
        change(p.value, actor, 'Next follow-up', before, cmd.dueAt, 'staff');
        touch(data, p.value);
        return { ok: true, replayed: false, value: structuredClone(p.value) };
      }
      case 'update-responses': {
        const p = partyFor(data, cmd.partyId, cmd.baseVersion);
        if (!p.ok) return p;
        const party = p.value;
        for (const [memberId, answers] of Object.entries(cmd.responses)) {
          const m = data.members.find((x) => x.id === memberId && x.partyId === party.id && !x.removed);
          if (!m) return fail('validation', 'A member in this update is not part of the party.');
          for (const [fnId, value] of Object.entries(answers)) {
            if (!m.invitedFunctionIds.includes(fnId)) return fail('validation', `${m.name} is not invited to that function.`);
            const prev = m.responses[fnId] ?? 'awaiting';
            if (prev !== value) {
              m.responses[fnId] = value;
              const fn = data.functions.find((f) => f.id === fnId);
              change(party, actor, `${m.name} · ${fn?.name ?? fnId}`, prev, value, 'staff');
            }
          }
        }
        party.contact = 'recorded';
        touch(data, party);
        return { ok: true, replayed: false, value: structuredClone(party) };
      }
      case 'update-party': {
        const p = partyFor(data, cmd.partyId, cmd.baseVersion);
        if (!p.ok) return p;
        const party = p.value;
        if (cmd.patch.notes !== undefined && cmd.patch.notes !== party.notes) {
          change(party, actor, 'Internal note', party.notes || '—', cmd.patch.notes || '—', 'staff');
          party.notes = cmd.patch.notes;
        }
        if (cmd.patch.priority && cmd.patch.priority !== party.priority) {
          change(party, actor, 'Priority', party.priority, cmd.patch.priority, 'staff');
          party.priority = cmd.patch.priority;
        }
        if (cmd.patch.assignedCaller && cmd.patch.assignedCaller !== party.assignedCaller) {
          change(party, actor, 'Assigned caller', party.assignedCaller, cmd.patch.assignedCaller, 'staff');
          party.assignedCaller = cmd.patch.assignedCaller;
        }
        if (cmd.patch.allowedAccompanying !== undefined && cmd.patch.allowedAccompanying !== party.allowedAccompanying) {
          if (!Number.isInteger(cmd.patch.allowedAccompanying) || cmd.patch.allowedAccompanying < 0) {
            return fail('validation', 'Allowed accompanying must be zero or more.', false, { allowedAccompanying: 'Enter a whole number, 0 or more.' });
          }
          change(party, actor, 'Allowed accompanying', String(party.allowedAccompanying), String(cmd.patch.allowedAccompanying), 'staff');
          party.allowedAccompanying = cmd.patch.allowedAccompanying;
        }
        touch(data, party);
        return { ok: true, replayed: false, value: structuredClone(party) };
      }
      case 'bulk-assign-caller': {
        const results = cmd.items.map((item) => {
          const p = partyFor(data, item.partyId, item.baseVersion);
          if (!p.ok) return { partyId: item.partyId, ok: false, message: p.error.message };
          if (p.value.assignedCaller !== cmd.caller) {
            change(p.value, actor, 'Assigned caller', p.value.assignedCaller, cmd.caller, 'staff');
            p.value.assignedCaller = cmd.caller;
            touch(data, p.value);
          }
          return { partyId: item.partyId, ok: true, message: 'Assigned' };
        });
        return { ok: true, replayed: false, value: results };
      }
      case 'create-party': {
        const d = cmd.draft;
        const fields: Record<string, string> = {};
        if (!d.displayName.trim()) fields.displayName = 'Enter the party or household name.';
        if (!d.phone.trim() && !d.email.trim()) fields.phone = 'Enter a phone number or an email for the primary contact.';
        if (d.phone.trim() && d.phone.replace(/\D/g, '').length < 8) fields.phone = 'Include the country code and full number.';
        d.members.forEach((m, i) => {
          if (!m.name.trim()) fields[`member-${i}-name`] = 'Enter this guest’s name.';
          if (m.functionIds.length === 0) fields[`member-${i}-functions`] = 'Invite this guest to at least one function.';
        });
        if (d.members.length === 0) fields.members = 'Add at least one guest.';
        if (Object.keys(fields).length) return fail('validation', 'Some details need attention.', false, fields);
        const digits = d.phone.replace(/\D/g, '');
        const possible = digits ? data.parties.filter((p) => p.phone.replace(/\D/g, '') === digits) : [];
        if (possible.length && !d.duplicateReviewed) {
          return fail('conflict', `Phone matches ${possible.map((p) => `${p.displayName} (${p.ref})`).join(', ')}. Households may share numbers — confirm this is a separate party.`);
        }
        state.seq += 1;
        const id = `${data.event.id}-n${state.seq}`;
        const prefix = data.parties[0]?.ref.split('-')[0] ?? 'RSV';
        const party: Party = {
          id,
          orgId: data.event.orgId,
          eventId: data.event.id,
          ref: `${prefix}-N${String(state.seq).padStart(3, '0')}`,
          displayName: d.displayName.trim(),
          primaryMemberId: `${id}-m1`,
          phone: d.phone.trim(),
          email: d.email.trim(),
          allowedAccompanying: d.allowedAccompanying,
          priority: d.priority,
          side: 'Host',
          language: d.language,
          assignedCaller: 'Unassigned',
          invitation: 'not-prepared',
          delivery: 'none',
          contact: 'no-response',
          followUpDueAt: null,
          followUpReason: 'New party — prepare invitation',
          calls: [],
          notes: '',
          documentState: 'not-required',
          version: 1,
          updatedAt: new Date(now()).toISOString(),
          changes: [],
        };
        const members: Member[] = d.members.map((m, i) => ({
          id: `${id}-m${i + 1}`,
          partyId: id,
          name: m.name.trim(),
          ageBand: m.ageBand,
          invitedFunctionIds: m.functionIds,
          responses: Object.fromEntries(m.functionIds.map((f) => [f, 'awaiting' as FunctionRsvp])),
          attendance: 'expected',
          dietary: m.dietary,
          accessibility: m.accessibility,
          removed: false,
        }));
        change(party, actor, 'Party created', '—', `${members.length} guest(s)`, 'staff');
        data.parties.push(party);
        data.members.push(...members);
        touch(data);
        return { ok: true, replayed: false, value: structuredClone(party) };
      }
      case 'change-leg': {
        const leg = data.legs.find((l) => l.id === cmd.legId);
        if (state.historicalLegIds?.includes(cmd.legId)) return fail('validation', 'Historical travel evidence cannot be edited.');
        if (!leg) return fail('not-found', 'This travel leg no longer exists.');
        const p = partyFor(data, leg.partyId, cmd.baseVersion);
        if (!p.ok) return p;
        const before = leg.at;
        if (before !== cmd.at || leg.reference !== cmd.reference) invalidateLegPlan(data, leg.id);
        if (before !== cmd.at) {
          // Keep the time the movement plan was built on; the dependency warning compares against it.
          leg.changedFrom = before;
          leg.at = cmd.at;
        }
        leg.reference = cmd.reference;
        change(p.value, actor, `${leg.direction === 'arrival' ? 'Arrival' : 'Departure'} time`, before ?? 'not supplied', cmd.at ?? 'not supplied', 'staff');
        touch(data, p.value);
        return { ok: true, replayed: false, value: structuredClone(leg) };
      }
      case 'transfer': {
        if (cmd.baseVersion !== data.dataRevision) return fail('stale-version', 'Movement records changed. Refresh before recording a new status.');
        const t = data.transfers.find((x) => x.id === cmd.transferId);
        if (!t) return fail('not-found', 'This transfer no longer exists.');
        if (!TRANSFER_TRANSITIONS[t.state]?.includes(cmd.state)) return fail('validation', `A transfer cannot move from ${t.state} to ${cmd.state}.`);
        const leg = data.legs.find((l) => l.id === t.legId);
        if (cmd.state === 'planned' && !leg?.at) return fail('validation', 'A travel time is required before planning.');
        if (cmd.state === 'dispatched' && !t.vehicleId) return fail('validation', 'Assign a vehicle and driver before dispatch.');
        if (cmd.state === 'dispatched' && leg?.at !== t.planBasedOn) return fail('conflict', 'Travel changed after planning. Replan before dispatch.');
        if (cmd.state === 'dispatched') {
          const conflict = buildManifests(data, false).find((m) => m.vehicleId === t.vehicleId && m.capacityIssue);
          if (conflict) return fail('conflict', conflict.capacityIssue as string);
        }
        const before = t.state;
        t.state = cmd.state;
        if (cmd.state === 'planned') t.planBasedOn = leg?.at ?? null;
        const party = data.parties.find((p) => p.id === t.partyId);
        if (party) {
          change(party, actor, `${t.kind === 'pickup' ? 'Pickup' : 'Drop'} status`, before, cmd.state, 'staff');
        }
        touch(data, party);
        return { ok: true, replayed: false, value: structuredClone(t) };
      }
      case 'assign-vehicle': {
        if (cmd.baseVersion !== data.dataRevision) return fail('stale-version', 'Movement records changed. Refresh before assigning a vehicle.');
        const v = cmd.vehicleId ? data.vehicles.find((x) => x.id === cmd.vehicleId) : null;
        if (cmd.vehicleId && !v) return fail('not-found', 'That vehicle is not available for this event.');
        const ids = new Set(cmd.transferIds);
        if (!ids.size || ids.size !== cmd.transferIds.length) return fail('validation', 'Select distinct transfers.');
        const selected = data.transfers.filter((t) => ids.has(t.id));
        if (selected.length !== ids.size) return fail('not-found', 'A selected transfer no longer exists.');
        if (selected.some((t) => !['planned', 'assigned'].includes(t.state))) return fail('validation', 'Only planned or assigned transfers can change vehicle.');
        if (v && selected.some((t) => {
          const leg = data.legs.find((l) => l.id === t.legId);
          return !leg?.at || leg.at !== t.planBasedOn;
        })) return fail('conflict', 'Travel details changed or are incomplete. Replan before assigning.');
        // Validate the complete prospective manifest, including existing holds,
        // without touching live state. One failure rejects the whole batch.
        const prospective = { ...data, transfers: data.transfers.map((t) => ids.has(t.id) ? { ...t, vehicleId: cmd.vehicleId } : t) };
        if (v) {
          const conflict = buildManifests(prospective, false).find((m) => m.vehicleId === v.id && m.capacityIssue);
          if (conflict) return fail('conflict', conflict.capacityIssue as string);
        }
        for (const t of selected) {
          t.vehicleId = cmd.vehicleId;
          if (cmd.vehicleId && (t.state === 'planned' || t.state === 'requested')) t.state = 'assigned';
          if (!cmd.vehicleId && t.state === 'assigned') t.state = 'planned';
        }
        touch(data);
        return { ok: true, replayed: false, value: cmd.transferIds.length };
      }
      case 'replan-transfer': {
        if (cmd.baseVersion !== data.dataRevision) return fail('stale-version', 'Movement records changed. Refresh before replanning.');
        const ids = new Set(cmd.transferIds);
        const selected = data.transfers.filter((t) => ids.has(t.id));
        if (!ids.size || ids.size !== cmd.transferIds.length || selected.length !== ids.size) return fail('validation', 'Select existing, distinct transfers.');
        if (selected.some((t) => !['planned', 'assigned', 'dispatched'].includes(t.state) || !data.legs.find((l) => l.id === t.legId)?.at)) return fail('validation', 'Only planned, assigned or dispatched transfers with a travel time can be replanned.');
        for (const t of selected) {
          const leg = data.legs.find((l) => l.id === t.legId)!;
          t.planBasedOn = leg.at;
          leg.changedFrom = null;
          // Replanning releases the vehicle so capacity is rechecked for the new window.
          if (t.state === 'assigned' || t.state === 'dispatched') t.state = 'planned';
          t.vehicleId = null;
        }
        touch(data);
        return { ok: true, replayed: false, value: cmd.transferIds.length };
      }
      case 'stay': {
        const s = data.stays.find((x) => x.id === cmd.stayId);
        if (!s) return fail('not-found', 'This stay no longer exists.');
        const p = partyFor(data, s.partyId, cmd.baseVersion);
        if (!p.ok) return p;
        if (!STAY_TRANSITIONS[s.state].includes(cmd.to)) return fail('validation', `A stay cannot move from ${s.state} to ${cmd.to}.`);
        if (persona.role === 'customer-owner' && !(s.state === 'approval-pending' && (cmd.to === 'approved' || cmd.to === 'proposed'))) {
          return fail('forbidden', 'Customers approve or return proposals; staff handle allocation.');
        }
        if (persona.role === 'hotel-contact' && !['checked-in', 'checked-out'].includes(cmd.to)) {
          return fail('forbidden', 'Hotel contacts record check-in and check-out only.');
        }
        if (cmd.to === 'proposed') {
          const hotel = data.hotels.find((h) => h.id === (cmd.hotelId ?? s.hotelId));
          const cat = hotel?.categories.find((c) => c.id === (cmd.categoryId ?? s.categoryId));
          if (!hotel || !cat) return fail('validation', 'Choose a hotel and room category.', false, { categoryId: 'Choose a room category.' });
          if (s.occupantIds.length > cat.maxOccupancy) return fail('conflict', `${s.occupantIds.length} occupants exceed the ${cat.maxOccupancy}-person maximum for ${cat.name}.`);
          const held = data.stays.filter((other) => other.id !== s.id && other.hotelId === hotel.id && other.categoryId === cat.id && ['proposed', 'approval-pending', 'approved', 'communicated', 'checked-in'].includes(other.state)).length;
          if (held >= cat.inventory) return fail('conflict', `${cat.name} is fully held (${held} of ${cat.inventory}). Choose another category.`);
          s.hotelId = hotel.id;
          s.categoryId = cat.id;
        }
        if (cmd.roomLabel !== undefined && persona.role !== 'customer-owner') s.roomLabel = cmd.roomLabel.trim();
        const before = s.state;
        s.state = cmd.to;
        change(p.value, actor, 'Stay', before, cmd.to, 'staff');
        touch(data, p.value);
        return { ok: true, replayed: false, value: structuredClone(s) };
      }
      case 'generate-report': {
        const rows = buildPartyRows(data, now());
        const revision = Math.max(0, ...data.reports.filter((r) => r.kind === cmd.kind).map((r) => r.revision)) + 1;
        state.seq += 1;
        const snapshot: ReportSnapshot = {
          id: `${data.event.id}-r${state.seq}`,
          kind: cmd.kind,
          eventId: data.event.id,
          generatedAt: new Date(now()).toISOString(),
          revision,
          dataRevision: data.dataRevision,
          recordCount: cmd.scope?.records ?? rows.length,
          peopleCount: cmd.scope?.people ?? rows.reduce((s, r) => s + r.people, 0),
          partyCount: cmd.scope?.parties ?? rows.length,
          filters: cmd.filters,
          columns: cmd.columns,
          scopeSignature: cmd.scopeSignature,
        };
        data.reports.unshift(snapshot);
        return { ok: true, replayed: false, value: structuredClone(snapshot) };
      }
    }
  }

  async function mutate<T = unknown>(personaId: string, eventId: string, requestId: string, cmd: Command): Promise<Result<T>> {
    await wait();
    const s = takeScenario();
    if (s === 'offline') return { ...fail('offline', 'You appear to be offline. Nothing was sent; your entries are kept.', true), requestId };
    const receipt = state.receipts[requestId];
    const fp = fingerprint({ personaId, eventId, cmd });
    if (receipt) {
      if (receipt.fingerprint !== fp) return { ...fail('conflict', 'This request identity was already used for a different change. Start a new action instead.'), requestId };
      return { ...(receipt.result as Result<T>), replayed: true, requestId } as Result<T>;
    }
    if (s === 'error') return { ...fail('unavailable', 'The synthetic service failed before applying anything. Retry the same action safely.', true), requestId };
    const scoped = scopedEvent(personaId, eventId);
    if (!scoped.ok) return { ...scoped, requestId };
    if (!COMMAND_ROLES[cmd.type].includes(scoped.value.persona.role)) {
      return { ...fail('forbidden', 'Your role cannot perform this action.'), requestId };
    }
    const result = apply(scoped.value.persona, scoped.value.data, cmd);
    // Only definitive outcomes are remembered; a stale or invalid request can be corrected and resent.
    if (result.ok) state.receipts[requestId] = { fingerprint: fp, result };
    persist();
    if (s === 'lost-response' && result.ok) {
      return { ...fail('lost-response', 'No answer arrived after sending. The change may already be applied — retry the same action to confirm without duplicating it.', true), requestId };
    }
    return { ...(result as Result<T>), requestId };
  }

  async function applyImport(personaId: string, eventId: string, batchId: string, rows: PreviewRow[]): Promise<Result<ImportRowOutcome[]>> {
    await wait();
    const s = takeScenario();
    if (s === 'offline') return fail('offline', 'You appear to be offline. Nothing was imported; the preview is kept.', true);
    if (s === 'error') return fail('unavailable', 'The synthetic service failed before importing. Retry the same batch safely.', true);
    const scoped = scopedEvent(personaId, eventId);
    if (!scoped.ok) return scoped;
    if (!COMMAND_ROLES['create-party'].includes(scoped.value.persona.role)) return fail('forbidden', 'Your role cannot import guests.');
    const { data, persona } = scoped.value;
    const scope = { orgId: data.event.orgId, eventId, personaId, batchId };
    const rowIdentity = (row: PreviewRow) => `v2:${fingerprint({ ...scope, rowNumber: row.rowNumber })}`;
    const partyIdentity = (row: PreviewRow) => `v2:${fingerprint({ ...scope, partyKey: row.partyKey })}`;
    const materialFingerprint = (row: PreviewRow) => fingerprint({
      rowKey: row.key,
      partyKey: row.partyKey,
      values: Object.fromEntries(Object.entries(row.values).map(([key, value]) => [key, value.normalize('NFKC').replace(/\s+/g, ' ').trim()])),
      functionIds: [...new Set(row.functionIds)].sort(),
    });
    // Bind the original row slot as well as its key: editing a party/name can
    // regenerate a different preview key, but it is still a changed batch row.
    // Validate every retained identity before applying any row in this request.
    const incoming = new Map<string, string>();
    const knownKeys = new Map<string, number>();
    const knownMaterials = new Map<string, number>();
    // Receipt fingerprints retain canonical values, so older receipts can be
    // indexed without trusting parser-derived keys or introducing a new scope.
    const stableMaterial = (material: string) => {
      const { values, functionIds } = JSON.parse(material);
      return fingerprint({ values, functionIds });
    };
    for (const [identity, receipt] of Object.entries(state.rowReceipts)) {
      // Derive the reverse index from persisted scoped receipts. This also covers
      // accepted Round-2 receipts without inventing a new batch or losing history.
      if (receipt.outcome && identity === `v2:${fingerprint({ ...scope, rowNumber: receipt.outcome.rowNumber })}`) {
        knownKeys.set(receipt.outcome.key, receipt.outcome.rowNumber);
        knownMaterials.set(stableMaterial(receipt.fingerprint), receipt.outcome.rowNumber);
      }
    }
    for (const row of rows) {
      const identity = rowIdentity(row);
      const material = materialFingerprint(row);
      const stable = stableMaterial(material);
      const prior = state.rowReceipts[identity];
      // Retained pre-guard batches may have accepted/rejected duplicate material
      // at separate slots. Exact receipts replay their own outcome, not another
      // slot's outcome. Failed operational receipts still retry below.
      if (prior && prior.fingerprint === material && prior.outcome.key === row.key) continue;
      if ((knownMaterials.has(stable) && knownMaterials.get(stable) !== row.rowNumber) || (knownKeys.has(row.key) && knownKeys.get(row.key) !== row.rowNumber) || (prior && prior.fingerprint !== material) || (incoming.has(identity) && incoming.get(identity) !== material)) {
        return fail('conflict', `Import row ${row.rowNumber} changed under the same batch identity. Start a new batch; no rows were changed.`);
      }
      incoming.set(identity, material);
      knownKeys.set(row.key, row.rowNumber);
      knownMaterials.set(stable, row.rowNumber);
    }
    let attempt = 0;
    const outcomes = rows.map((row): ImportRowOutcome => {
      const rk = rowIdentity(row);
      const prior = state.rowReceipts[rk];
      if (prior && prior.outcome.result !== 'failed') return { ...prior.outcome, replayed: true };
      const remember = (outcome: ImportRowOutcome) => {
        state.rowReceipts[rk] = { fingerprint: materialFingerprint(row), outcome };
        return outcome;
      };
      if (row.status === 'invalid' || row.status === 'duplicate') {
        return remember({ rowNumber: row.rowNumber, key: row.key, result: 'rejected', reason: row.issues.map((i) => i.reason).join('; '), replayed: false });
      }
      if (row.status === 'review') return remember({ rowNumber: row.rowNumber, key: row.key, result: 'unresolved', reason: 'Possible existing guest — needs staff review; not merged.', replayed: false });
      const batchParty = state.importParties[partyIdentity(row)];
      const refExists = row.values.guest_ref && data.parties.some((p) => p.ref.toLowerCase() === row.values.guest_ref.toLowerCase());
      if (!batchParty && refExists) {
        const out: ImportRowOutcome = { rowNumber: row.rowNumber, key: row.key, result: 'skipped', reason: 'Reference already imported; skipped to avoid a duplicate.', replayed: false };
        return remember(out);
      }
      attempt += 1;
      if (s === 'partial-import' && attempt % 3 === 0) {
        const out: ImportRowOutcome = { rowNumber: row.rowNumber, key: row.key, result: 'failed', reason: 'Temporary service failure. Eligible for retry with the same batch.', replayed: false };
        return remember(out);
      }
      let party = data.parties.find((p) => p.id === batchParty);
      if (!party) {
        state.seq += 1;
        const id = `${data.event.id}-i${state.seq}`;
        const prefix = data.parties[0]?.ref.split('-')[0] ?? 'RSV';
        party = {
          id,
          orgId: data.event.orgId,
          eventId: data.event.id,
          ref: row.values.guest_ref ? row.values.guest_ref.toUpperCase() : `${prefix}-I${String(state.seq).padStart(3, '0')}`,
          displayName: row.values.party_name,
          primaryMemberId: `${id}-m1`,
          phone: row.values.phone,
          email: row.values.email,
          allowedAccompanying: row.values.allowed_accompanying ? Number(row.values.allowed_accompanying) : 0,
          priority: (row.values.priority.toLowerCase() || 'standard') as Priority,
          side: 'Host',
          language: row.values.language || 'English',
          assignedCaller: 'Unassigned',
          invitation: 'not-prepared',
          delivery: 'none',
          contact: 'no-response',
          followUpDueAt: null,
          followUpReason: 'Imported — prepare invitation',
          calls: [],
          notes: '',
          documentState: 'not-required',
          version: 1,
          updatedAt: new Date(now()).toISOString(),
          changes: [],
        };
        data.parties.push(party);
        state.importParties[partyIdentity(row)] = id;
      }
      const index = data.members.filter((m) => m.partyId === party.id).length + 1;
      data.members.push({
        id: `${party.id}-m${index}`,
        partyId: party.id,
        name: row.values.member_name,
        ageBand: row.values.age_band.toLowerCase() === 'child' ? 'child' : 'adult',
        invitedFunctionIds: [...row.functionIds],
        responses: Object.fromEntries(row.functionIds.map((f) => [f, 'awaiting' as FunctionRsvp])),
        attendance: 'expected',
        dietary: '',
        accessibility: '',
        removed: false,
      });
      if (!row.values.allowed_accompanying) party.allowedAccompanying = Math.max(index - 1, party.allowedAccompanying);
      change(party, persona.name, 'Imported guest', '—', row.values.member_name, 'import');
      touch(data, party);
      const out: ImportRowOutcome = { rowNumber: row.rowNumber, key: row.key, result: 'accepted', reason: 'Imported', partyRef: party.ref, replayed: false };
      return remember(out);
    });
    if (s === 'partial-import') scenario = 'none';
    persist();
    return { ok: true, replayed: false, value: structuredClone(outcomes) };
  }

  // ---------- Guest invitation (restricted link) ----------

  type InvitationView = {
    event: RsvpEvent;
    organizer: string;
    functions: EventData['functions'];
    party: Pick<Party, 'id' | 'ref' | 'displayName' | 'allowedAccompanying' | 'version'>;
    members: Array<Pick<Member, 'id' | 'name' | 'ageBand' | 'invitedFunctionIds' | 'responses' | 'dietary' | 'accessibility'>>;
    arrival: GuestAnswers['arrival'];
    departure: GuestAnswers['departure'];
    pickup: boolean;
    drop: boolean;
    stay: 'needed' | 'not-needed' | null;
    stayOffered: boolean;
    closed: boolean;
    lateChange: boolean;
    submittedBefore: boolean;
  };

  function invitation(token: string): Result<{ data: EventData; party: Party }> {
    const inv = state.fixtures.invitations[token];
    if (!inv) return fail('not-found', 'This invitation link is not valid.');
    if (inv.state === 'expired') return fail('expired', 'This invitation link has expired.');
    if (inv.state === 'revoked') return fail('revoked', 'This invitation link was withdrawn by the organizer.');
    const data = state.fixtures.events[inv.eventId];
    const party = data?.parties.find((p) => p.id === inv.partyId);
    if (!data || !party) return fail('not-found', 'This invitation link is not valid.');
    return { ok: true, replayed: false, value: { data, party } };
  }

  function invitationView(data: EventData, party: Party): InvitationView {
    const members = data.members.filter((m) => m.partyId === party.id && !m.removed);
    const invited = new Set(members.flatMap((m) => m.invitedFunctionIds));
    const legs = data.legs.filter((l) => l.partyId === party.id && !state.historicalLegIds?.includes(l.id));
    const arr = legs.find((l) => l.direction === 'arrival');
    const dep = legs.find((l) => l.direction === 'departure');
    const stay = data.stays.find((s) => s.partyId === party.id);
    const transfers = data.transfers.filter((t) => t.partyId === party.id && t.state !== 'not-required' && t.state !== 'cancelled');
    const today = localDate(now(), data.event.timezone);
    return structuredClone({
      event: data.event,
      organizer: state.fixtures.organizations.find((o) => o.id === data.event.orgId)?.name ?? 'The organizer',
      functions: data.functions.filter((f) => invited.has(f.id)),
      party: { id: party.id, ref: party.ref, displayName: party.displayName, allowedAccompanying: party.allowedAccompanying, version: party.version },
      members: members.map((m) => ({ id: m.id, name: m.name, ageBand: m.ageBand, invitedFunctionIds: m.invitedFunctionIds, responses: m.responses, dietary: m.dietary, accessibility: m.accessibility })),
      arrival: arr ? { mode: arr.mode, reference: arr.reference, from: arr.from, at: arr.at ?? '' } : null,
      departure: dep ? { mode: dep.mode, reference: dep.reference, to: dep.to, at: dep.at ?? '' } : null,
      pickup: transfers.some((t) => t.kind === 'pickup'),
      drop: transfers.some((t) => t.kind === 'drop'),
      stay: stay ? (stay.state === 'not-required' ? 'not-needed' : 'needed') : null,
      stayOffered: data.hotels.length > 0,
      closed: Date.parse(data.event.rsvpClosesAt) < now(),
      lateChange: today >= addDays(data.event.startsOn, -7),
      submittedBefore: party.contact === 'recorded',
    });
  }

  async function loadInvitation(token: string): Promise<Result<InvitationView>> {
    await wait();
    const s = takeScenario();
    if (s === 'offline') return fail('offline', 'You appear to be offline. Check your connection and try again.', true);
    if (s === 'error') return fail('unavailable', 'We could not load your invitation. Please try again.', true);
    const inv = invitation(token);
    if (!inv.ok) return inv;
    return { ok: true, replayed: false, value: invitationView(inv.value.data, inv.value.party) };
  }

  async function submitInvitation(token: string, requestId: string, baseVersion: number, answers: GuestAnswers): Promise<Result<InvitationView>> {
    await wait();
    const s = takeScenario();
    if (s === 'offline') return fail('offline', 'You appear to be offline. Your answers are kept on this screen — try again when connected.', true);
    const receipt = state.receipts[requestId];
    const fp = fingerprint({ token, baseVersion, answers });
    if (receipt) {
      if (receipt.fingerprint !== fp) return fail('conflict', 'This submission identity was already used. Review your answers and submit again.');
      // Only successful submissions are stored as receipts.
      return { ...(receipt.result as Extract<Result<InvitationView>, { ok: true }>), replayed: true };
    }
    if (s === 'error') return fail('unavailable', 'We could not save your response. Nothing was changed — please try again.', true);
    const inv = invitation(token);
    if (!inv.ok) return inv;
    const { data, party } = inv.value;
    if (Date.parse(data.event.rsvpClosesAt) < now()) return fail('closed', 'RSVP for this event has closed. Please contact the organizer for changes.');
    if (party.version !== baseVersion) {
      return fail('stale-version', 'Your invitation was updated by the organizer since you opened it. Review the latest details before submitting.', false);
    }
    const members = data.members.filter((m) => m.partyId === party.id && !m.removed);
    for (const memberId of Object.keys(answers.responses)) {
      if (!members.some((m) => m.id === memberId)) return fail('stale-version', 'Your party list changed. Reload to see who is currently included.');
    }
    const view = invitationView(data, party);
    const actor = 'Guest (web form)';
    for (const m of members) {
      const a = answers.responses[m.id] ?? {};
      for (const fnId of m.invitedFunctionIds) {
        const v = a[fnId];
        if (!v) return fail('validation', `Please answer every function for ${m.name}.`, false, { [`${m.id}-${fnId}`]: 'Choose an answer.' });
        if (m.responses[fnId] !== v) {
          change(party, actor, `${m.name} · ${data.functions.find((f) => f.id === fnId)?.name}`, m.responses[fnId] ?? 'awaiting', v, 'guest-form');
          m.responses[fnId] = v;
        }
      }
      if ((answers.dietary[m.id] ?? '') !== m.dietary) m.dietary = answers.dietary[m.id] ?? '';
      if ((answers.accessibility[m.id] ?? '') !== m.accessibility) m.accessibility = answers.accessibility[m.id] ?? '';
    }
    const attending = members.some((m) => Object.values(m.responses).some((v) => v === 'confirmed' || v === 'tentative'));
    const upsertLeg = (direction: 'arrival' | 'departure', ans: GuestAnswers['arrival'] | GuestAnswers['departure']) => {
      const existing = data.legs.find((l) => l.partyId === party.id && l.direction === direction && !state.historicalLegIds?.includes(l.id));
      if (!ans) {
        if (existing) {
          change(party, actor, `${direction === 'arrival' ? 'Arrival' : 'Departure'} details`, `${existing.from} → ${existing.to}`, 'Details later', 'guest-form');
          invalidateLegPlan(data, existing.id);
          for (const transfer of data.transfers) {
            if (transfer.legId === existing.id && ['requested', 'awaiting-details', 'planned', 'assigned', 'dispatched'].includes(transfer.state)) {
              transfer.legId = null;
              transfer.state = 'awaiting-details';
            }
          }
          if (data.transfers.some((t) => t.legId === existing.id)) {
            state.historicalLegIds = [...new Set([...(state.historicalLegIds ?? []), existing.id])];
          } else data.legs = data.legs.filter((l) => l.id !== existing.id);
        }
        return;
      }
      if (!attending) return;
      const at = ans.at || null;
      const normalize = (value: string) => value.normalize('NFKC').trim().replace(/\s+/g, ' ');
      const from = normalize(direction === 'arrival' ? (ans as NonNullable<GuestAnswers['arrival']>).from : existing?.from ?? data.event.city);
      const to = normalize(direction === 'departure' ? (ans as NonNullable<GuestAnswers['departure']>).to : existing?.to ?? data.event.city);
      const reference = normalize(ans.reference);
      if (existing) {
        const routeChanged = normalize(existing.from) !== from || normalize(existing.to) !== to || existing.mode !== ans.mode || existing.at !== at || normalize(existing.reference) !== reference;
        if (routeChanged) {
          change(party, actor, `${direction === 'arrival' ? 'Arrival' : 'Departure'} route`, `${existing.from} → ${existing.to} (${existing.mode}) · ${existing.reference}`, `${from} → ${to} (${ans.mode}) · ${reference}`, 'guest-form');
          invalidateLegPlan(data, existing.id);
        }
        if (existing.at !== at) {
          change(party, actor, `${direction === 'arrival' ? 'Arrival' : 'Departure'} time`, existing.at ?? 'not supplied', at ?? 'not supplied', 'guest-form');
          existing.changedFrom = existing.at;
          existing.at = at;
        }
        existing.mode = ans.mode;
        existing.reference = reference;
        existing.from = from;
        existing.to = to;
      } else {
        const baseId = `${party.id}-${direction === 'arrival' ? 'arr' : 'dep'}`;
        const id = data.legs.some((l) => l.id === baseId) ? `${baseId}-${++state.seq}` : baseId;
        data.legs.push({
          id,
          partyId: party.id,
          direction,
          mode: ans.mode,
          reference,
          from,
          to,
          at,
          passengerIds: members.map((m) => m.id),
          luggage: members.length,
          assistance: '',
          changedFrom: null,
        });
      }
    };
    upsertLeg('arrival', answers.arrival);
    upsertLeg('departure', answers.departure);
    const setTransfer = (kind: 'pickup' | 'drop', wanted: boolean) => {
      const leg = data.legs.find((l) => l.partyId === party.id && l.direction === (kind === 'pickup' ? 'arrival' : 'departure') && !state.historicalLegIds?.includes(l.id));
      const t = data.transfers.find((x) => x.partyId === party.id && x.kind === kind && !['guest-met', 'completed'].includes(x.state));
      const want = attending && wanted;
      // Reconnect every active dependency after details-later creates a new leg.
      for (const transfer of data.transfers) {
        if (transfer.partyId === party.id && transfer.kind === kind && (transfer.state === 'awaiting-details' || (want && ['cancelled', 'not-required'].includes(transfer.state)))) transfer.legId = leg?.id ?? null;
      }
      if (t) {
        if (!want && t.state !== 'not-required') t.state = 'cancelled';
        if (want && (t.state === 'cancelled' || t.state === 'not-required')) t.state = leg?.at ? 'requested' : 'awaiting-details';
      } else if (want) {
        data.transfers.push({ id: `${party.id}-${kind}`, partyId: party.id, legId: leg?.id ?? null, kind, state: leg?.at ? 'requested' : 'awaiting-details', vehicleId: null, planBasedOn: null });
      }
    };
    setTransfer('pickup', answers.pickup);
    setTransfer('drop', answers.drop);
    if (data.hotels.length) {
      const stay = data.stays.find((x) => x.partyId === party.id);
      const want = attending && answers.stay === 'needed';
      if (stay) {
        if (want && stay.state === 'not-required') stay.state = 'requested';
        // An allocated room is never silently released by a form; staff review it.
        if (!want && stay.state === 'requested') stay.state = 'not-required';
      } else if (want) {
        data.stays.push({
          id: `${party.id}-stay`,
          partyId: party.id,
          state: 'requested',
          hotelId: null,
          categoryId: null,
          roomLabel: '',
          checkIn: addDays(data.event.startsOn, -1),
          checkOut: addDays(data.event.startsOn, data.functions.length),
          occupantIds: members.map((m) => m.id),
          preference: '',
          accessibility: '',
        });
      }
    }
    party.contact = view.lateChange && view.submittedBefore ? 'needs-review' : 'recorded';
    party.followUpReason = party.contact === 'needs-review' ? 'Late change from guest form — review logistics' : '';
    party.followUpDueAt = party.contact === 'needs-review' ? new Date(now()).toISOString() : null;
    touch(data, party);
    const result: Result<InvitationView> = { ok: true, replayed: false, value: invitationView(data, party) };
    state.receipts[requestId] = { fingerprint: fp, result };
    persist();
    return result;
  }

  return {
    get storageStatus() {
      return storageStatus;
    },
    get anchor() {
      return state.anchor;
    },
    get scenario() {
      return scenario;
    },
    setScenario(next: Scenario) {
      scenario = next;
    },
    personas: () => structuredClone(state.fixtures.personas),
    invitationTokens: () => Object.keys(state.fixtures.invitations),
    async access(personaId: string) {
      await wait();
      const s = takeScenario();
      if (s === 'offline') return fail('offline', 'You appear to be offline.', true) as Result<Access>;
      if (s === 'error') return fail('unavailable', 'The synthetic service did not respond. Retry.', true) as Result<Access>;
      return access(personaId);
    },
    async loadEvent(personaId: string, eventId: string): Promise<Result<EventData>> {
      await wait();
      const s = takeScenario();
      if (s === 'offline') return fail('offline', 'You appear to be offline. Showing nothing rather than old data.', true);
      if (s === 'error') return fail('unavailable', 'The guest list could not be loaded. Retry.', true);
      const scoped = scopedEvent(personaId, eventId);
      if (!scoped.ok) return scoped;
      return { ok: true, replayed: false, value: redact(scoped.value.data, scoped.value.persona.role) };
    },
    /** Revision probe for the "updated since you opened this" indicator. */
    revision(personaId: string, eventId: string) {
      const scoped = scopedEvent(personaId, eventId);
      return scoped.ok ? scoped.value.data.dataRevision : null;
    },
    mutate,
    applyImport,
    loadInvitation,
    submitInvitation,
    /** Simulates another staff member editing a party (for stale-version demonstrations). */
    simulateExternalEdit(eventId: string, partyId: string) {
      const data = state.fixtures.events[eventId];
      const party = data?.parties.find((p) => p.id === partyId);
      if (!data || !party) return false;
      change(party, 'Another coordinator (simulated)', 'Internal note', party.notes || '—', `${party.notes ? `${party.notes} ` : ''}Checked by another coordinator.`.trim(), 'staff');
      party.notes = `${party.notes ? `${party.notes} ` : ''}Checked by another coordinator.`.trim();
      touch(data, party);
      persist();
      return true;
    },
    reset() {
      state = seed();
      scenario = 'none';
      if (options.storage) {
        try {
          options.storage.removeItem(STORAGE_KEY);
          storageStatus = 'session';
        } catch {
          storageStatus = 'unavailable';
        }
      }
    },
  };
}

export type RsvpAdapter = ReturnType<typeof createRsvpAdapter>;
export type InvitationView = Extract<Awaited<ReturnType<RsvpAdapter['loadInvitation']>>, { ok: true }>['value'];
