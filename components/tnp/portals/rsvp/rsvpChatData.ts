// Synthetic "RSVP on WhatsApp" records. Every guest, number and message is
// invented; nothing is sent, delivered or read by a real provider.
export type Category = 'attending' | 'declined' | 'maybe' | 'no-reply' | 'needs-review';
export type FunctionReply = 'yes' | 'no' | 'unknown';
export type Message = {
  id: string;
  from: 'guest' | 'team' | 'system';
  text: string;
  at: string; // display time
  template?: string;
  quickReplies?: string[];
  status?: 'simulated' | 'sample-delivered' | 'sample-read';
};
export type GuestThread = {
  id: string;
  eventId: string;
  party: string;
  contact: string; // masked sample number
  members: number;
  category: Category;
  suggested: Category;
  confirmed: boolean; // a person reviewed the category
  functions: Record<string, FunctionReply>;
  travel: { mode: string; arrival: string; reference: string };
  stay: string;
  pickup: 'needed' | 'not-needed' | 'unknown';
  dietary: string;
  notes: string;
  unread: number;
  messages: Message[];
};
export type RsvpEvent = {
  id: string;
  org: 'lotus' | 'marigold';
  name: string;
  host: string;
  city: string;
  dates: string;
  functions: string[];
  invited: number;
};
export type Broadcast = {
  id: string;
  eventId: string;
  template: string;
  audience: string;
  text: string;
  status: 'draft' | 'simulated';
  sent: number;
  delivered: number;
  read: number;
  replied: number;
  at: string;
};
export type TeamMember = { name: string; role: 'Manager' | 'Operator' | 'Viewer'; active: boolean };
export type RsvpChatState = {
  version: 2;
  events: RsvpEvent[];
  threads: GuestThread[];
  broadcasts: Broadcast[];
  team: Record<'lotus' | 'marigold', TeamMember[]>;
};

export const ORGS = { lotus: 'Lotus Events (sample)', marigold: 'Marigold Weddings (sample)' } as const;
export const CATEGORY_LABEL: Record<Category, string> = {
  attending: 'Attending',
  declined: 'Declined',
  maybe: 'Maybe',
  'no-reply': 'No reply',
  'needs-review': 'Needs review',
};
export const TEMPLATES: Record<string, { label: string; text: string; quickReplies?: string[] }> = {
  invitation: {
    label: 'Invitation',
    text: 'Namaste {party}! You are warmly invited to {event} in {city} ({dates}). Will you be joining us?',
    quickReplies: ['Yes, attending', 'Sorry, can’t make it', 'Not sure yet'],
  },
  functions: {
    label: 'Function-wise RSVP',
    text: 'Please tell us which functions {party} will attend: {functions}. Reply with the names, e.g. “Sangeet and Reception”.',
  },
  travel: {
    label: 'Travel & stay details',
    text: 'To help us welcome you, please share your arrival date, travel mode (flight/train/road) and whether you need a pickup or a room.',
    quickReplies: ['Share travel details', 'We’ll arrange our own'],
  },
  reminder: {
    label: 'Gentle reminder',
    text: 'A gentle reminder from the {event} team — we’d love to know if {party} can join us. Reply anytime.',
    quickReplies: ['Yes, attending', 'Sorry, can’t make it'],
  },
  thanks: {
    label: 'Thank you',
    text: 'Thank you {party}! Your response is noted. We’ll share venue and timing details closer to the day.',
  },
};

export function fillTemplate(key: string, thread: GuestThread, event: RsvpEvent) {
  return (TEMPLATES[key]?.text ?? '')
    .replaceAll('{party}', thread.party)
    .replaceAll('{event}', event.name)
    .replaceAll('{city}', event.city)
    .replaceAll('{dates}', event.dates)
    .replaceAll('{functions}', event.functions.join(', '));
}

/**
 * Suggests a category and extracts obvious details from a guest's message.
 * It only suggests — a person must confirm before counts change.
 */
export function suggestFromMessage(text: string, functions: string[]) {
  const t = text.toLowerCase();
  const no = /\b(can'?t|cannot|won'?t|not able|unable|sorry|regret|no\b)/.test(t);
  const yes = /\b(yes|attending|coming|will be there|joining|sure|definitely|confirm)/.test(t);
  const maybe = /\b(maybe|not sure|might|tentative|will confirm|let you know)/.test(t);
  const category: Category =
    maybe ? 'maybe' : yes && no ? 'needs-review' : yes ? 'attending' : no ? 'declined' : 'needs-review';
  const people = /(\d+)\s*(people|persons|of us|guests|members|adults)/.exec(t);
  const fn: Record<string, FunctionReply> = {};
  for (const f of functions)
    if (t.includes(f.toLowerCase())) fn[f] = /\b(only|just)\b/.test(t) || yes ? 'yes' : 'unknown';
  return {
    category,
    members: people ? Number(people[1]) : undefined,
    functions: fn,
    travel: /\b(flight|train|bus|drive|road|arriv)/.test(t),
    pickup: /\b(pickup|pick up|pick-up|airport|station)/.test(t),
    stay: /\b(room|stay|hotel|accommodation)/.test(t),
  };
}

const ev = (id: string, org: RsvpEvent['org'], name: string, host: string, city: string, dates: string, functions: string[], invited: number): RsvpEvent =>
  ({ id, org, name, host, city, dates, functions, invited });

type Seed = [string, number, Category, string, Record<string, FunctionReply>, string, string, RsvpChatState['threads'][number]['pickup'], string, number];

function thread(eventId: string, event: RsvpEvent, i: number, s: Seed): GuestThread {
  const [party, members, category, reply, functions, travel, stay, pickup, dietary, unread] = s;
  const messages: Message[] = [
    { id: `${eventId}-${i}-m1`, from: 'team', template: 'invitation', text: fillTemplate('invitation', { party } as GuestThread, event), at: 'Mon 10:02', quickReplies: TEMPLATES.invitation.quickReplies, status: 'sample-read' },
  ];
  if (reply)
    messages.push({ id: `${eventId}-${i}-m2`, from: 'guest', text: reply, at: 'Mon 11:4' + (i % 10) });
  if (reply && category === 'attending')
    messages.push(
      { id: `${eventId}-${i}-m3`, from: 'team', template: 'travel', text: TEMPLATES.travel.text, at: 'Mon 12:10', quickReplies: TEMPLATES.travel.quickReplies, status: 'sample-delivered' },
    );
  if (travel && category === 'attending')
    messages.push({ id: `${eventId}-${i}-m4`, from: 'guest', text: travel, at: 'Tue 09:1' + (i % 10) });
  const suggestion = suggestFromMessage(reply, event.functions);
  return {
    id: `${eventId}-${i}`,
    eventId,
    party,
    contact: `+91 ••••• ••${String(100 + i * 7).slice(-3)} (sample)`,
    members,
    category,
    suggested: reply ? suggestion.category : 'no-reply',
    confirmed: category !== 'needs-review' && category !== 'no-reply',
    functions: Object.fromEntries(event.functions.map((f) => [f, functions[f] ?? 'unknown'])),
    travel: {
      mode: /flight/i.test(travel) ? 'Flight' : /train/i.test(travel) ? 'Train' : /drive|road|car/i.test(travel) ? 'Road' : '—',
      arrival: /(\d{1,2}\s\w{3})/.exec(travel)?.[1] ?? '—',
      reference: /\b([A-Z0-9]{2}\s?\d{3,4})\b/.exec(travel)?.[1] ?? '—',
    },
    stay,
    pickup,
    dietary,
    notes: '',
    unread,
    messages,
  };
}

export function seedRsvpChat(): RsvpChatState {
  const events = [
    ev('lotus-evening', 'lotus', 'Mehta–Kapoor Wedding', 'Sample Mehta family', 'Jaipur', '23–25 Nov 2026', ['Mehendi', 'Sangeet', 'Reception'], 240),
    ev('lotus-welcome', 'lotus', 'Sharma 60th Birthday', 'Sample Sharma family', 'Jaipur', '4 Oct 2026', ['Dinner'], 120),
    ev('marigold-evening', 'marigold', 'Goa Beach Reception', 'Sample D’Souza family', 'Goa', '15–16 Nov 2026', ['Welcome drinks', 'Reception'], 210),
  ];
  const seeds: Record<string, Seed[]> = {
    'lotus-evening': [
      ['Sample Iyer family', 4, 'attending', 'Yes, all 4 of us are coming! Sangeet and Reception for sure.', { Sangeet: 'yes', Reception: 'yes', Mehendi: 'unknown' }, 'Arriving by flight 6E 2134 on 23 Nov, need airport pickup.', 'Need 2 rooms', 'needed', 'Two vegetarian', 2],
      ['Sample Bose household', 2, 'needs-review', 'We are coming for reception but not sure about sangeet, sorry', {}, '', '', 'unknown', '', 1],
      ['Sample Khanna family', 3, 'declined', 'So sorry, we cannot make it this time. Blessings to the couple!', {}, '', '', 'not-needed', '', 0],
      ['Sample Rao cousins', 5, 'maybe', 'Maybe — will confirm by next week.', {}, '', '', 'unknown', '', 0],
      ['Sample Gupta family', 3, 'attending', 'Confirm! 3 people, all functions.', { Mehendi: 'yes', Sangeet: 'yes', Reception: 'yes' }, 'Train 12956 arriving 22 Nov, we will drive to venue.', 'Own arrangement', 'not-needed', 'Jain food', 0],
      ['Sample Menon family', 2, 'no-reply', '', {}, '', '', 'unknown', '', 0],
      ['Sample Singh uncle', 1, 'attending', 'Yes attending, just the reception', { Reception: 'yes', Mehendi: 'no', Sangeet: 'no' }, 'Driving from Delhi, arriving 25 Nov.', 'Need 1 room', 'not-needed', '', 3],
      ['Sample Dutta friends', 6, 'no-reply', '', {}, '', '', 'unknown', '', 0],
    ],
    'lotus-welcome': [
      ['Sample Verma family', 3, 'attending', 'Yes, 3 people coming. Looking forward!', { Dinner: 'yes' }, 'Local — driving.', 'Not needed', 'not-needed', '', 0],
      ['Sample Joshi couple', 2, 'needs-review', 'Might come late, will try', {}, '', '', 'unknown', '', 1],
      ['Sample Kulkarni family', 4, 'no-reply', '', {}, '', '', 'unknown', '', 0],
    ],
    'marigold-evening': [
      ['Sample Fernandes family', 4, 'attending', 'Yes! 4 of us, both evenings.', { 'Welcome drinks': 'yes', Reception: 'yes' }, 'Flight AI 865 arriving 14 Nov, pickup from airport please.', 'Need 2 rooms', 'needed', 'One child meal', 1],
      ['Sample Pinto household', 2, 'declined', 'Regret, we are travelling abroad.', {}, '', '', 'not-needed', '', 0],
      ['Sample Naik cousins', 3, 'no-reply', '', {}, '', '', 'unknown', '', 0],
    ],
  };
  const threads = events.flatMap((event) => seeds[event.id].map((s, i) => thread(event.id, event, i + 1, s)));
  return {
    version: 2,
    events,
    threads,
    broadcasts: [
      { id: 'bc-1', eventId: 'lotus-evening', template: 'invitation', audience: 'All guests', text: TEMPLATES.invitation.text, status: 'simulated', sent: 8, delivered: 8, read: 7, replied: 6, at: 'Mon 10:02' },
      { id: 'bc-2', eventId: 'lotus-evening', template: 'travel', audience: 'Attending guests', text: TEMPLATES.travel.text, status: 'simulated', sent: 3, delivered: 3, read: 3, replied: 2, at: 'Mon 12:10' },
    ],
    team: {
      lotus: [
        { name: 'Tara Kapoor', role: 'Manager', active: true },
        { name: 'Ishaan Roy', role: 'Operator', active: true },
        { name: 'Lina Fernandes', role: 'Viewer', active: false },
      ],
      marigold: [{ name: 'Ishaan Roy', role: 'Manager', active: true }],
    },
  };
}

export function eventStats(threads: GuestThread[]) {
  const count = (c: Category) => threads.filter((t) => t.category === c).length;
  const attendingPeople = threads.filter((t) => t.category === 'attending').reduce((n, t) => n + t.members, 0);
  return {
    parties: threads.length,
    attending: count('attending'),
    declined: count('declined'),
    maybe: count('maybe'),
    noReply: count('no-reply'),
    review: threads.filter((t) => !t.confirmed && t.category !== 'no-reply').length,
    attendingPeople,
    pickups: threads.filter((t) => t.pickup === 'needed').length,
    rooms: threads.filter((t) => /room/i.test(t.stay) && !/not/i.test(t.stay)).length,
    unread: threads.reduce((n, t) => n + t.unread, 0),
  };
}
