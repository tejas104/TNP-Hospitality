// Synthetic, fictional sample records for the RSVP preview. No real guest,
// contact or document data. Phone numbers use the fictional 555 range and
// emails use the reserved example.test domain.

import { addDays, at } from './dates.ts';
import type {
  Customer,
  Engagement,
  EventData,
  FunctionEvent,
  FunctionRsvp,
  GuestDocument,
  Hotel,
  Member,
  MessageRecord,
  MessageTemplate,
  Organization,
  Party,
  Persona,
  Priority,
  ProviderGate,
  ReportSnapshot,
  RsvpEvent,
  Section,
  Stay,
  Transfer,
  TravelLeg,
  Vehicle,
} from './model.ts';

export const ALL_SECTIONS: Section[] = [
  'overview',
  'today',
  'calendar',
  'guests',
  'add',
  'import',
  'calls',
  'travel',
  'movements',
  'rooming',
  'messages',
  'documents',
  'reports',
];

const RSVP_ONLY: Section[] = ['overview', 'today', 'calendar', 'guests', 'add', 'import', 'calls', 'messages', 'documents', 'reports'];

export type Directory = {
  organizations: Organization[];
  customers: Customer[];
  engagements: Engagement[];
  personas: Persona[];
  invitations: Record<string, { partyId: string; eventId: string; state: 'active' | 'expired' | 'revoked' }>;
};

export type Fixtures = Directory & { events: Record<string, EventData> };

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = [
  'Aarav', 'Diya', 'Kabir', 'Meera', 'Rohan', 'Ananya', 'Vihaan', 'Isha', 'Arjun', 'Tara', 'Neel', 'Riya', 'Dev', 'Kiara', 'Advait',
  'Saanvi', 'Ishaan', 'Aditi', 'Reyansh', 'Myra', 'Aryan', 'Zoya', 'Veer', 'Nitya', 'Krish', 'Avni', 'Shaurya', 'Pihu', 'Yash', 'Anika',
];
const LAST = [
  'Malhotra', 'Iyer', 'Banerjee', 'Chawla', 'Deshpande', 'Gill', 'Joshi', 'Kulkarni', 'Menon', 'Nair', 'Oberoi', 'Pillai', 'Rao',
  'Saxena', 'Thakur', 'Varma', 'Wadhwa', 'Bhatia', 'Chopra', 'Dutta', 'Fernandes', 'Grewal', 'Hegde', 'Kaul',
];
const LANGS = ['English', 'Hindi', 'English', 'Marathi', 'Punjabi', 'Tamil'];
const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad', 'London', 'Dubai'];

type EventSeed = {
  event: RsvpEvent;
  functionNames: Array<[string, number, string, string, string]>; // name, day offset from start, time, venue, dress
  partyCount: number;
  seed: number;
  offset: string;
  refPrefix: string;
  callers: string[];
  withRooming: boolean;
  documentsPolicy: 'sample-metadata' | 'disabled';
};

function pick<T>(r: () => number, list: T[]) {
  return list[Math.floor(r() * list.length)];
}

function weighted<T>(r: () => number, pairs: Array<[T, number]>): T {
  const total = pairs.reduce((s, [, w]) => s + w, 0);
  let x = r() * total;
  for (const [v, w] of pairs) {
    if ((x -= w) < 0) return v;
  }
  return pairs[pairs.length - 1][0];
}

function buildEvent(seed: EventSeed, today: string): EventData {
  const r = rng(seed.seed);
  const { event, offset } = seed;
  const functions: FunctionEvent[] = seed.functionNames.map(([name, day, time, venue, dress], i) => ({
    id: `${event.id}-fn-${i + 1}`,
    eventId: event.id,
    name,
    startsAt: at(addDays(event.startsOn, day), time, offset),
    venue,
    dressCode: dress,
  }));
  const parties: Party[] = [];
  const members: Member[] = [];
  const legs: TravelLeg[] = [];
  const transfers: Transfer[] = [];
  const stays: Stay[] = [];
  const documents: GuestDocument[] = [];
  const messages: MessageRecord[] = [];
  const nowIso = at(today, '10:00', offset);
  let sharedPhone = '';

  for (let i = 0; i < seed.partyCount; i++) {
    const last = LAST[(i * 7 + seed.seed) % LAST.length];
    const size = weighted(r, [[1, 3], [2, 5], [3, 3], [4, 2], [5, 1]]);
    const partyId = `${event.id}-p${String(i + 1).padStart(3, '0')}`;
    const priority: Priority = i % 13 === 0 ? 'vvip' : i % 5 === 0 ? 'vip' : 'standard';
    const onlyReception = r() < 0.18;
    const invitedFunctionIds = onlyReception ? [functions[functions.length - 1].id] : functions.map((f) => f.id);
    const contact = weighted(r, [['recorded', 6], ['no-response', 3], ['needs-review', 1]] as Array<[Party['contact'], number]>);
    const delivery = weighted(r, [['delivered', 5], ['read', 3], ['failed', 1], ['uncertain', 1], ['sent', 1]] as Array<[Party['delivery'], number]>);
    const partyMembers: Member[] = [];
    for (let m = 0; m < size; m++) {
      const responses: Record<string, FunctionRsvp> = {};
      for (const fnId of invitedFunctionIds) {
        responses[fnId] =
          contact === 'recorded'
            ? weighted(r, [['confirmed', 7], ['declined', 2], ['tentative', 1]] as Array<[FunctionRsvp, number]>)
            : contact === 'needs-review'
              ? weighted(r, [['awaiting', 3], ['tentative', 1]] as Array<[FunctionRsvp, number]>)
              : 'awaiting';
      }
      partyMembers.push({
        id: `${partyId}-m${m + 1}`,
        partyId,
        name: `${m === 0 ? pick(r, FIRST) : pick(r, FIRST)} ${last}`,
        ageBand: m >= 2 && r() < 0.5 ? 'child' : 'adult',
        invitedFunctionIds,
        responses,
        attendance: 'expected',
        dietary: r() < 0.2 ? pick(r, ['Vegetarian', 'Jain', 'Vegan', 'Nut allergy', 'Gluten-free']) : '',
        accessibility: r() < 0.08 ? pick(r, ['Wheelchair access', 'Ground-floor room', 'Hearing assistance']) : '',
        removed: false,
      });
    }
    members.push(...partyMembers);
    let phone = `+91 55501 ${String(10000 + ((i * 7919 + seed.seed) % 89999)).padStart(5, '0')}`;
    // Two different households intentionally share one contact number.
    if (i === 3) sharedPhone = phone;
    if (i === 4) phone = sharedPhone;
    const overdue = contact !== 'recorded' && r() < 0.6;
    const dueDay = overdue ? addDays(today, -Math.ceil(r() * 3)) : addDays(today, Math.floor(r() * 3));
    const caller = pick(r, seed.callers);
    const calls =
      contact === 'recorded' || r() < 0.5
        ? [
            {
              id: `${partyId}-c1`,
              at: at(addDays(today, -Math.ceil(r() * 5) - 1), '11:15', offset),
              actor: caller,
              outcome: contact === 'recorded' ? ('answered' as const) : ('no-answer' as const),
              note: contact === 'recorded' ? 'Responses captured on call.' : 'Rang twice; no answer.',
            },
          ]
        : [];
    parties.push({
      id: partyId,
      orgId: event.orgId,
      eventId: event.id,
      ref: `${seed.refPrefix}-${String(101 + i).padStart(4, '0')}`,
      displayName: `${partyMembers[0].name.split(' ')[0]} ${last} ${size > 1 ? 'family' : ''}`.trim(),
      primaryMemberId: partyMembers[0].id,
      phone,
      email: `${last.toLowerCase()}.${i + 1}@example.test`,
      allowedAccompanying: Math.max(size - 1, 0) + (r() < 0.15 ? 1 : 0),
      priority,
      side: pick(r, ['Bride', 'Groom', 'Host']),
      language: pick(r, LANGS),
      assignedCaller: caller,
      invitation: 'issued',
      delivery,
      contact,
      followUpDueAt: contact === 'recorded' ? null : at(dueDay, overdue ? '16:00' : '12:00', offset),
      followUpReason: contact === 'needs-review' ? 'Reply needs staff review' : contact === 'no-response' ? 'No RSVP yet' : '',
      calls,
      notes: '',
      documentState: 'not-required',
      version: 1,
      updatedAt: at(addDays(today, -2), '09:30', offset),
      changes: [],
    });

    const attending = partyMembers.some((m) => Object.values(m.responses).some((v) => v === 'confirmed' || v === 'tentative'));
    const outstation = r() < 0.7;
    if (attending && outstation) {
      const passengerIds = partyMembers.map((m) => m.id);
      const arrMode = weighted(r, [['flight', 5], ['train', 2], ['self-drive', 2], ['bus', 1]] as Array<[TravelLeg['mode'], number]>);
      const arrDay = addDays(event.startsOn, -1 - Math.floor(r() * 2));
      const missingTime = r() < 0.2;
      const arrivalId = `${partyId}-arr`;
      const lateNight = i % 11 === 2;
      legs.push({
        id: arrivalId,
        partyId,
        direction: 'arrival',
        mode: arrMode,
        reference: arrMode === 'flight' ? `6E ${200 + i}` : arrMode === 'train' ? `12${900 + i}` : '',
        from: pick(r, CITIES),
        to: event.city,
        at: missingTime ? null : lateNight ? at(addDays(arrDay, 1), '00:40', offset) : at(arrDay, `${String(8 + Math.floor(r() * 12)).padStart(2, '0')}:${r() < 0.5 ? '15' : '45'}`, offset),
        passengerIds,
        luggage: size + Math.floor(r() * 3),
        assistance: partyMembers.some((m) => m.accessibility) ? 'Wheelchair at arrival' : '',
        changedFrom: null,
      });
      const depMode = arrMode === 'self-drive' && r() < 0.5 ? 'flight' : arrMode;
      const departureId = `${partyId}-dep`;
      legs.push({
        id: departureId,
        partyId,
        direction: 'departure',
        mode: depMode,
        reference: depMode === 'flight' ? `AI ${600 + i}` : '',
        from: event.city,
        to: pick(r, CITIES),
        at: r() < 0.25 ? null : at(addDays(event.startsOn, functions.length), `${String(9 + Math.floor(r() * 9)).padStart(2, '0')}:30`, offset),
        passengerIds,
        luggage: size + 1,
        assistance: '',
        changedFrom: null,
      });
      const arrLeg = legs[legs.length - 2];
      const depLeg = legs[legs.length - 1];
      if (arrMode !== 'self-drive') {
        transfers.push({
          id: `${partyId}-pickup`,
          partyId,
          legId: arrivalId,
          kind: 'pickup',
          state: arrLeg.at ? weighted(r, [['planned', 3], ['assigned', 3], ['requested', 1]] as Array<[Transfer['state'], number]>) : 'awaiting-details',
          vehicleId: null,
          planBasedOn: arrLeg.at,
        });
      }
      if (depMode !== 'self-drive' || r() < 0.3) {
        transfers.push({
          id: `${partyId}-drop`,
          partyId,
          legId: departureId,
          kind: 'drop',
          state: depLeg.at ? 'requested' : 'awaiting-details',
          vehicleId: null,
          planBasedOn: depLeg.at,
        });
      }
      if (seed.withRooming) {
        const stayState = weighted(r, [['requested', 2], ['proposed', 2], ['approval-pending', 2], ['approved', 2], ['communicated', 3]] as Array<[Stay['state'], number]>);
        stays.push({
          id: `${partyId}-stay`,
          partyId,
          state: stayState,
          hotelId: stayState === 'requested' ? null : `${event.id}-h1`,
          categoryId: stayState === 'requested' ? null : size > 2 ? `${event.id}-h1-suite` : `${event.id}-h1-deluxe`,
          roomLabel: stayState === 'communicated' || stayState === 'approved' ? `${1 + (i % 4)}${String(10 + i).padStart(2, '0')}` : '',
          checkIn: arrDay,
          checkOut: addDays(event.startsOn, functions.length),
          occupantIds: passengerIds,
          preference: size > 2 ? 'Connecting rooms near family' : '',
          accessibility: partyMembers.find((m) => m.accessibility)?.accessibility ?? '',
        });
      }
    } else if (seed.withRooming && attending) {
      stays.push({
        id: `${partyId}-stay`,
        partyId,
        state: 'not-required',
        hotelId: null,
        categoryId: null,
        roomLabel: '',
        checkIn: event.startsOn,
        checkOut: event.startsOn,
        occupantIds: [],
        preference: '',
        accessibility: '',
      });
    }

    if (seed.documentsPolicy === 'sample-metadata' && attending && outstation && i % 3 === 0) {
      const state = weighted(r, [['requested', 3], ['received', 2], ['under-review', 1], ['accepted', 2], ['replacement-required', 1], ['download-failed', 1]] as Array<[GuestDocument['state'], number]>);
      documents.push({
        id: `${partyId}-doc1`,
        partyId,
        memberId: partyMembers[0].id,
        purpose: 'travel-ticket',
        state,
        note: state === 'download-failed' ? 'Provider media retrieval failed; not received.' : '',
        updatedAt: at(addDays(today, -1), '14:20', offset),
      });
      parties[parties.length - 1].documentState = state;
    }

    messages.push({ id: `${partyId}-msg1`, partyId, templateId: `${event.id}-t-invite`, state: delivery, at: at(addDays(event.startsOn, -29), '11:00', offset) });
  }

  // One confirmed flight changed after the movement plan was prepared.
  const changed = legs.find((l) => l.direction === 'arrival' && l.mode === 'flight' && l.at && transfers.some((t) => t.legId === l.id && t.state !== 'awaiting-details'));
  if (changed && changed.at) {
    changed.changedFrom = changed.at;
    changed.at = new Date(Date.parse(changed.at) + 3 * 3_600_000 + 20 * 60_000).toISOString();
    const party = parties.find((p) => p.id === changed.partyId);
    if (party) {
      party.changes.push({
        id: `${party.id}-chg1`,
        at: nowIso,
        actor: 'Guest form',
        field: 'Arrival time',
        before: changed.changedFrom,
        after: changed.at,
        source: 'guest-form',
      });
    }
  }

  const vehicles: Vehicle[] = seed.withRooming
    ? [
        { id: `${event.id}-v1`, eventId: event.id, label: 'Sedan 01', seats: 3, driver: 'Driver A (sample)' },
        { id: `${event.id}-v2`, eventId: event.id, label: 'SUV 02', seats: 6, driver: 'Driver B (sample)' },
        { id: `${event.id}-v3`, eventId: event.id, label: 'Tempo Traveller 03', seats: 12, driver: 'Driver C (sample)' },
      ]
    : [];
  const hotels: Hotel[] = seed.withRooming
    ? [
        {
          id: `${event.id}-h1`,
          eventId: event.id,
          name: 'Lakeside Heritage Hotel (sample)',
          categories: [
            { id: `${event.id}-h1-deluxe`, name: 'Deluxe room', inventory: 22, maxOccupancy: 2 },
            { id: `${event.id}-h1-suite`, name: 'Family suite', inventory: 6, maxOccupancy: 5 },
          ],
        },
        {
          id: `${event.id}-h2`,
          eventId: event.id,
          name: 'Garden Court Residency (sample)',
          categories: [{ id: `${event.id}-h2-std`, name: 'Standard room', inventory: 14, maxOccupancy: 3 }],
        },
      ]
    : [];

  const templates: MessageTemplate[] = [
    { id: `${event.id}-t-invite`, name: 'Invitation and RSVP link', purpose: 'Invitation', language: 'English', approval: 'approved', body: 'Dear {{guest}}, {{hosts}} invite you to {{event}}. Please share your RSVP: {{link}}' },
    { id: `${event.id}-t-invite-hi`, name: 'Invitation (Hindi)', purpose: 'Invitation', language: 'Hindi', approval: 'submitted', body: 'प्रिय {{guest}}, {{hosts}} आपको {{event}} में आमंत्रित करते हैं। कृपया उत्तर दें: {{link}}' },
    { id: `${event.id}-t-reminder`, name: 'RSVP reminder', purpose: 'Reminder', language: 'English', approval: 'approved', body: 'Gentle reminder from {{hosts}}: please confirm attendance for {{event}} — {{link}}' },
    { id: `${event.id}-t-travel`, name: 'Travel details request', purpose: 'Travel', language: 'English', approval: 'rejected', body: 'Please share your arrival and departure details for {{event}}: {{link}}' },
    { id: `${event.id}-t-room`, name: 'Room details', purpose: 'Stay', language: 'English', approval: 'not-submitted', body: 'Your stay at {{hotel}} is confirmed: {{room}}, {{dates}}.' },
  ];
  const gates: ProviderGate[] = [
    { id: 'business-verification', label: 'Business verification', state: 'in-progress', note: 'Submitted externally; no approval date is promised.' },
    { id: 'account-connection', label: 'WhatsApp account connection', state: 'not-started', note: 'Sender ownership decision pending.' },
    { id: 'sender-approval', label: 'Sender / display-name approval', state: 'not-started', note: 'Depends on account connection.' },
    { id: 'template-approval', label: 'Template approval', state: 'not-started', note: 'Template states shown below are synthetic samples.' },
    { id: 'integration', label: 'Integration readiness', state: 'blocked', note: 'Webhook, consent and retry adapters are not implemented.' },
    { id: 'uat', label: 'UAT completion', state: 'not-started', note: 'Requires approved UAT numbers and scenarios.' },
  ];
  const reports: ReportSnapshot[] = [
    {
      id: `${event.id}-r1`,
      kind: 'master',
      eventId: event.id,
      generatedAt: at(addDays(today, -1), '18:00', offset),
      revision: 1,
      dataRevision: 1,
      recordCount: members.length,
      peopleCount: members.length,
      partyCount: parties.length,
      filters: 'All guests',
      columns: ['Reference', 'Party', 'Guest', 'Function responses'],
    },
  ];
  return {
    event,
    functions,
    parties,
    members,
    legs,
    transfers,
    vehicles,
    hotels,
    stays,
    documents,
    templates,
    messages,
    gates,
    reports,
    // Starts ahead of the sample report so the change since "yesterday" is visible.
    dataRevision: 2,
  };
}

/** Builds the full synthetic directory relative to an anchor calendar day. */
export function createFixtures(today: string): Fixtures {
  const organizations: Organization[] = [
    { id: 'org-tnp', name: 'TNP Hospitality — Managed RSVP', kind: 'tnp', status: 'active', serviceEndsOn: addDays(today, 180), entitlements: ALL_SECTIONS },
    { id: 'org-marigold', name: 'Marigold Events', kind: 'vendor', status: 'active', serviceEndsOn: addDays(today, 90), entitlements: ALL_SECTIONS },
    { id: 'org-marigold-co', name: 'Marigold Event Co.', kind: 'vendor', status: 'active', serviceEndsOn: addDays(today, 45), entitlements: RSVP_ONLY },
    { id: 'org-saffron', name: 'Saffron Lane RSVP', kind: 'vendor', status: 'suspended', serviceEndsOn: addDays(today, 60), entitlements: ALL_SECTIONS },
    { id: 'org-juniper', name: 'Juniper Guest Desk', kind: 'vendor', status: 'active', serviceEndsOn: addDays(today, -17), entitlements: ALL_SECTIONS },
  ];
  const customers: Customer[] = [
    { id: 'cust-mehra', orgId: 'org-tnp', name: 'Mehra family (sample customer)' },
    { id: 'cust-kapoor-a', orgId: 'org-marigold', name: 'Kapoor family (sample customer)' },
    { id: 'cust-kapoor-b', orgId: 'org-marigold-co', name: 'Kapoor & Sons (sample customer)' },
    { id: 'cust-juniper', orgId: 'org-juniper', name: 'Sample customer' },
  ];
  const engagements: Engagement[] = [
    { id: 'eng-mehra', orgId: 'org-tnp', customerId: 'cust-mehra', name: 'Mehra–Rao wedding hospitality', mode: 'tnp-managed', packageLabel: 'Complete hospitality (sample package)' },
    { id: 'eng-kapoor-a', orgId: 'org-marigold', customerId: 'cust-kapoor-a', name: 'Kapoor–Sethi wedding RSVP', mode: 'vendor-operated', packageLabel: 'RSVP + travel + rooming (sample)' },
    { id: 'eng-kapoor-b', orgId: 'org-marigold-co', customerId: 'cust-kapoor-b', name: 'Kapoor–Seth wedding RSVP', mode: 'vendor-operated', packageLabel: 'RSVP only (sample)' },
    { id: 'eng-juniper', orgId: 'org-juniper', customerId: 'cust-juniper', name: 'Expired sample engagement', mode: 'vendor-operated', packageLabel: 'RSVP only (sample)' },
  ];

  const seeds: EventSeed[] = [
    {
      event: {
        id: 'evt-mehra-udaipur',
        orgId: 'org-tnp',
        engagementId: 'eng-mehra',
        name: 'Mehra–Rao Wedding',
        hosts: 'The Mehra and Rao families',
        city: 'Udaipur',
        timezone: 'Asia/Kolkata',
        startsOn: addDays(today, 24),
        onboardedOn: addDays(today, -6),
        imageId: 'palace-courtyard',
        rsvpClosesAt: at(addDays(today, 14), '23:59', '+05:30'),
      },
      functionNames: [
        ['Mehendi', 0, '16:00', 'Courtyard lawns', 'Pastels'],
        ['Sangeet', 0, '20:00', 'Lakeside pavilion', 'Festive'],
        ['Wedding ceremony', 1, '10:30', 'Palace terrace', 'Traditional'],
        ['Reception', 1, '20:00', 'Grand ballroom', 'Formal'],
      ],
      partyCount: 42,
      seed: 11,
      offset: '+05:30',
      refPrefix: 'MRW',
      callers: ['Asha (TNP caller)', 'Imran (TNP caller)', 'Leela (TNP caller)'],
      withRooming: true,
      documentsPolicy: 'sample-metadata',
    },
    {
      event: {
        id: 'evt-kapoor-jaipur',
        orgId: 'org-marigold',
        engagementId: 'eng-kapoor-a',
        name: 'Kapoor–Sethi Wedding',
        hosts: 'The Kapoor and Sethi families',
        city: 'Jaipur',
        timezone: 'Asia/Kolkata',
        // Late onboarding: service started after T-30, so the calendar is revised.
        startsOn: addDays(today, 15),
        onboardedOn: addDays(today, -3),
        imageId: 'tablescape',
        rsvpClosesAt: at(addDays(today, 8), '23:59', '+05:30'),
      },
      functionNames: [
        ['Haldi', 0, '11:00', 'Garden court', 'Yellow'],
        ['Wedding ceremony', 0, '19:30', 'Fort lawns', 'Traditional'],
        ['Reception', 1, '20:00', 'Durbar hall', 'Formal'],
      ],
      partyCount: 30,
      seed: 29,
      offset: '+05:30',
      refPrefix: 'KSW',
      callers: ['Neha (Marigold)', 'Farhan (Marigold)'],
      withRooming: true,
      documentsPolicy: 'disabled',
    },
    {
      event: {
        id: 'evt-kapoor-dubai',
        orgId: 'org-marigold-co',
        engagementId: 'eng-kapoor-b',
        name: 'Kapoor–Seth Wedding',
        hosts: 'The Kapoor and Seth families',
        city: 'Dubai',
        timezone: 'Asia/Dubai',
        startsOn: addDays(today, 2),
        onboardedOn: addDays(today, -34),
        imageId: 'floral',
        rsvpClosesAt: at(addDays(today, -3), '23:59', '+04:00'),
      },
      functionNames: [
        ['Welcome dinner', 0, '19:00', 'Marina terrace', 'Smart casual'],
        ['Wedding ceremony', 1, '17:00', 'Desert pavilion', 'Traditional'],
      ],
      partyCount: 24,
      seed: 47,
      offset: '+04:00',
      refPrefix: 'KSD',
      callers: ['Omar (Marigold Co.)', 'Priya (Marigold Co.)'],
      withRooming: false,
      documentsPolicy: 'disabled',
    },
  ];
  const events: Record<string, EventData> = {};
  for (const seed of seeds) events[seed.event.id] = buildEvent(seed, today);

  const personas: Persona[] = [
    { id: 'tnp-manager', name: 'Sample TNP service manager', role: 'service-manager', orgIds: ['org-tnp'], customerId: null, scenario: 'normal' },
    { id: 'tnp-caller', name: 'Sample TNP calling agent', role: 'calling-agent', orgIds: ['org-tnp'], customerId: null, scenario: 'normal' },
    { id: 'customer-mehra', name: 'Sample customer owner', role: 'customer-owner', orgIds: ['org-tnp'], customerId: 'cust-mehra', scenario: 'normal' },
    { id: 'marigold-owner', name: 'Sample Marigold Events owner', role: 'vendor-owner', orgIds: ['org-marigold'], customerId: null, scenario: 'normal' },
    { id: 'marigold-co-owner', name: 'Sample Marigold Event Co. owner', role: 'vendor-owner', orgIds: ['org-marigold-co'], customerId: null, scenario: 'normal' },
    { id: 'multi-coordinator', name: 'Sample coordinator with two memberships', role: 'coordinator', orgIds: ['org-marigold', 'org-marigold-co'], customerId: null, scenario: 'normal' },
    { id: 'hotel-contact', name: 'Sample hotel contact', role: 'hotel-contact', orgIds: ['org-tnp'], customerId: null, scenario: 'normal' },
    { id: 'transport-lead', name: 'Sample transport coordinator', role: 'transport-coordinator', orgIds: ['org-tnp'], customerId: null, scenario: 'normal' },
    { id: 'saffron-owner', name: 'Sample suspended-vendor owner', role: 'vendor-owner', orgIds: ['org-saffron'], customerId: null, scenario: 'normal' },
    { id: 'juniper-owner', name: 'Sample expired-service owner', role: 'vendor-owner', orgIds: ['org-juniper'], customerId: null, scenario: 'normal' },
    { id: 'revoked-session', name: 'Sample revoked session', role: 'coordinator', orgIds: ['org-marigold'], customerId: null, scenario: 'session-revoked' },
  ];

  const invitations: Directory['invitations'] = {
    'mrw-guest-0101': { partyId: 'evt-mehra-udaipur-p002', eventId: 'evt-mehra-udaipur', state: 'active' },
    'mrw-guest-0107': { partyId: 'evt-mehra-udaipur-p008', eventId: 'evt-mehra-udaipur', state: 'active' },
    'ksw-guest-0104': { partyId: 'evt-kapoor-jaipur-p004', eventId: 'evt-kapoor-jaipur', state: 'active' },
    'ksd-guest-0102': { partyId: 'evt-kapoor-dubai-p002', eventId: 'evt-kapoor-dubai', state: 'active' },
    'mrw-expired': { partyId: 'evt-mehra-udaipur-p003', eventId: 'evt-mehra-udaipur', state: 'expired' },
    'mrw-revoked': { partyId: 'evt-mehra-udaipur-p005', eventId: 'evt-mehra-udaipur', state: 'revoked' },
  };

  return { organizations, customers, engagements, personas, invitations, events };
}
