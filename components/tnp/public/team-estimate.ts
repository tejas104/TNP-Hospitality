// Illustrative staffing ratios for the public team estimator. These are
// planning examples for a first conversation — not a quote, a staffing
// commitment or client-approved policy. TNP confirms the real team.
export const OCCASIONS = ['Wedding', 'Corporate event', 'Private celebration', 'Conference'] as const;
export type Occasion = (typeof OCCASIONS)[number];
export type EstimateRole =
  | 'Event Coordinator'
  | 'Event Executive'
  | 'Hostess'
  | 'Volunteer'
  | 'Porter';

// Guests served per person, per occasion. Lower = more people.
const RATIOS: Record<Occasion, Record<EstimateRole, number>> = {
  Wedding: { 'Event Coordinator': 200, 'Event Executive': 160, Hostess: 70, Volunteer: 60, Porter: 120 },
  'Corporate event': { 'Event Coordinator': 250, 'Event Executive': 100, Hostess: 90, Volunteer: 80, Porter: 300 },
  'Private celebration': { 'Event Coordinator': 150, 'Event Executive': 200, Hostess: 60, Volunteer: 90, Porter: 250 },
  Conference: { 'Event Coordinator': 300, 'Event Executive': 80, Hostess: 120, Volunteer: 70, Porter: 250 },
};

export type Estimate = {
  roles: { role: EstimateRole; people: number }[];
  perDay: number;
  personDays: number;
};

/** Team per function day; at least one coordinator always leads. */
export function estimateTeam(occasion: Occasion, guests: number, days: number): Estimate {
  const g = Math.max(10, Math.min(5000, Math.round(guests) || 0));
  const d = Math.max(1, Math.min(7, Math.round(days) || 1));
  const roles = (Object.entries(RATIOS[occasion]) as [EstimateRole, number][])
    .map(([role, per]) => ({
      role,
      people: role === 'Event Coordinator' ? Math.max(1, Math.ceil(g / per)) : Math.round(g / per),
    }))
    .filter((r) => r.people > 0);
  const perDay = roles.reduce((n, r) => n + r.people, 0);
  return { roles, perDay, personDays: perDay * d };
}

/** Encodes a team for the contact form, e.g. "Hostess:4,Volunteer:6". */
export const encodeTeam = (roles: Estimate['roles']) =>
  roles.map((r) => `${r.role}:${r.people}`).join(',');

/** Parses the contact-form team parameter; ignores unknown roles and bad counts. */
export function decodeTeam(value: string | undefined, allowed: readonly string[]) {
  const out: Record<string, string> = {};
  for (const part of (value ?? '').split(',')) {
    const [role, count] = part.split(':');
    const n = Number(count);
    if (allowed.includes(role) && Number.isInteger(n) && n >= 0 && n <= 10000) out[role] = String(n);
  }
  return out;
}
