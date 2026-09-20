export const events = [
  {
    id: 'lotus-evening',
    org: 'lotus',
    name: 'Evening celebration',
    date: '24 September · Jaipur',
    owner: 'Tara Kapoor',
  },
  {
    id: 'lotus-welcome',
    org: 'lotus',
    name: 'Welcome gathering',
    date: '23 September · Jaipur',
    owner: 'Tara Kapoor',
  },
  {
    id: 'marigold-evening',
    org: 'marigold',
    name: 'Evening celebration',
    date: '26 September · Pune',
    owner: 'Ishaan Roy',
  },
] as const;
export type Reply = 'pending' | 'yes' | 'no' | 'needs-review';
export type Guest = {
  id: string;
  org: string;
  event: string;
  name: string;
  party: string;
  reply: Reply;
  people: number;
  original: string;
  travel: string;
  stay: string;
  pickup: string;
  reviewed: boolean;
};
export type RsvpState = {
  version: 1;
  guests: Guest[];
  campaigns: {
    id: string;
    org: string;
    event: string;
    text: string;
    state: 'draft' | 'queued-preview' | 'failed-preview';
  }[];
};
export function initialRsvp(): RsvpState {
  return {
    version: 1,
    guests: events.flatMap((event) => [
      {
        id: event.id + '-1',
        org: event.org,
        event: event.id,
        name: 'Sample Mehta family',
        party: 'Party A',
        reply: 'needs-review' as const,
        people: 2,
        original: 'We may come with one more person. Please confirm tomorrow.',
        travel: 'Arrival time missing',
        stay: 'Preference not supplied',
        pickup: 'Not supplied',
        reviewed: false,
      },
      {
        id: event.id + '-2',
        org: event.org,
        event: event.id,
        name: 'Sample Shah family',
        party: 'Party B',
        reply: 'yes' as const,
        people: 3,
        original: 'All three of us will attend.',
        travel: 'Train · sample arrival 16:30',
        stay: 'No stay information requested',
        pickup: 'Own transport',
        reviewed: true,
      },
    ]),
    campaigns: [],
  };
}
export function scopeGuests(state: RsvpState, org: string, event?: string) {
  return state.guests.filter(
    (g) => g.org === org && (!event || g.event === event),
  );
}
export function updateReply(
  state: RsvpState,
  org: string,
  event: string,
  id: string,
  reply: Reply,
  people: number,
): RsvpState {
  if (!['pending', 'yes', 'no', 'needs-review'].includes(reply))
    throw Error('Choose a valid response.');
  if (!Number.isInteger(people) || people < 0 || people > 30)
    throw Error('Party size must be a whole number from 0 to 30.');
  if (!events.some((e) => e.org === org && e.id === event))
    throw Error('Event is outside this organization.');
  const guest = scopeGuests(state, org, event).find((g) => g.id === id);
  if (!guest) throw Error('Guest is outside this event.');
  return {
    ...state,
    guests: state.guests.map((g) =>
      g.id === id && g.org === org && g.event === event
        ? { ...g, reply, people, reviewed: true }
        : g,
    ),
  };
}
export function importGuests(
  text: string,
  org: string,
  event: string,
  nonce: string,
): Guest[] {
  if (!events.some((e) => e.org === org && e.id === event))
    throw Error('Choose an event in this organization.');
  const rows = text.trim().split(/\r?\n/);
  if (rows[0]?.trim().toLowerCase() !== 'name,party,people')
    throw Error('Use the header name,party,people.');
  if (rows.length < 2 || rows.length > 51)
    throw Error('Provide 1–50 sample rows.');
  return rows.slice(1).map((row, i) => {
    const columns = row.split(',').map((x) => x.trim());
    const [name, party, number] = columns;
    if (
      columns.length !== 3 ||
      !name ||
      !party ||
      name.length > 100 ||
      party.length > 100 ||
      !/^\d+$/.test(number) ||
      +number < 1 ||
      +number > 30
    )
      throw Error(
        'Row ' +
          (i + 2) +
          ': use a sample name, party and whole party size 1–30. Commas inside values are not supported.',
      );
    return {
      id: nonce + '-' + i,
      org,
      event,
      name,
      party,
      people: +number,
      reply: 'pending',
      original: 'No reply yet.',
      travel: 'Not supplied',
      stay: 'Not supplied',
      pickup: 'Not supplied',
      reviewed: false,
    };
  });
}
export function reportCsv(guests: Guest[]) {
  const cell = (s: string) =>
    '"' + (/^[=+@\-\t\r]/.test(s) ? "'" + s : s).replaceAll('"', '""') + '"';
  return (
    'Sample name,Party,Response,People,Review\r\n' +
    guests
      .map((g) =>
        [
          g.name,
          g.party,
          g.reply,
          String(g.people),
          g.reviewed ? 'Human reviewed' : 'Needs review',
        ]
          .map(cell)
          .join(','),
      )
      .join('\r\n')
  );
}
export function readRsvp(raw: string | null): RsvpState {
  if (!raw) return initialRsvp();
  try {
    const s = JSON.parse(raw);
    const validScope = (row: { org: string; event: string }) =>
      events.some((e) => e.id === row.event && e.org === row.org);
    if (
      s.version !== 1 ||
      !Array.isArray(s.guests) ||
      !Array.isArray(s.campaigns) ||
      s.guests.length > 1000 ||
      s.campaigns.length > 1000
    )
      return initialRsvp();
    if (
      s.guests.some(
        (g: Guest) =>
          !g ||
          ![
            'id',
            'name',
            'party',
            'original',
            'travel',
            'stay',
            'pickup',
          ].every((k) => typeof g[k as keyof Guest] === 'string') ||
          typeof g.reviewed !== 'boolean' ||
          !['pending', 'yes', 'no', 'needs-review'].includes(g.reply) ||
          !Number.isInteger(g.people) ||
          g.people < 0 ||
          g.people > 30 ||
          !validScope(g),
      )
    )
      return initialRsvp();
    if (
      s.campaigns.some(
        (c: RsvpState['campaigns'][number]) =>
          !c ||
          typeof c.id !== 'string' ||
          typeof c.text !== 'string' ||
          !['draft', 'queued-preview', 'failed-preview'].includes(c.state) ||
          !validScope(c),
      )
    )
      return initialRsvp();
    if (new Set(s.guests.map((g: Guest) => g.id)).size !== s.guests.length)
      return initialRsvp();
    return s;
  } catch {
    return initialRsvp();
  }
}

export type RsvpCapability = 'review' | 'import' | 'draft' | 'export';
export function canUseRsvp(
  entitlement: string,
  role: string,
  date: string,
  capability: RsvpCapability,
) {
  if (
    entitlement !== 'active' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    date < '2026-09-01' ||
    date > '2026-09-30'
  )
    return false;
  const capabilities: Record<string, RsvpCapability[]> = {
    manager: ['review', 'import', 'draft', 'export'],
    operator: ['review', 'import', 'draft'],
    viewer: [],
  };
  return capabilities[role]?.includes(capability) ?? false;
}
