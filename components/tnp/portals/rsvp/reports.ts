// Report builders. Scoped to one event and to the supplied (already filtered)
// party rows. No document identifiers ever appear in report output.

import { formatExact } from './dates.ts';
import { functionCounts, type PartyRow } from './logic.ts';
import type { EventData, ReportKind, ReportSnapshot } from './model.ts';
import { CONTACT_LABEL, DELIVERY_LABEL, FUNCTION_RSVP_LABEL, INVITATION_LABEL, PRIORITY_LABEL, STAY_LABEL, TRANSFER_LABEL, TRAVEL_MODE_LABEL } from './model.ts';

export const REPORT_META: Record<ReportKind, { title: string; description: string; sensitive: string }> = {
  master: { title: 'Master guest list', description: 'Every person with party, priority and function-wise answers.', sensitive: 'Includes names and phone numbers; no documents.' },
  'function-rsvp': { title: 'Function-wise RSVP', description: 'People counts per function, households kept separate.', sensitive: 'Counts only.' },
  pending: { title: 'Pending and follow-up', description: 'Parties with people awaiting confirmation and their next follow-up.', sensitive: 'Includes phone numbers for calling.' },
  travel: { title: 'Travel manifest', description: 'Arrival and departure legs in the event timezone.', sensitive: 'Names and travel references; no contact details.' },
  transfers: { title: 'Pickup / drop sheet', description: 'Transfers with exact passenger counts and vehicles.', sensitive: 'Names and movement times only.' },
  rooming: { title: 'Rooming list', description: 'Stays with category, room, dates and occupants.', sensitive: 'Names and room details; no phone, email or documents.' },
  changes: { title: 'Change / delta report', description: 'Before/after values recorded against parties.', sensitive: 'Names and changed values.' },
  delivery: { title: 'Communication-delivery summary', description: 'Invitation, delivery and contact states side by side. Synthetic sample states.', sensitive: 'No message content.' },
  final: { title: 'Final hospitality report', description: 'Headline people, household, logistics and exception counts.', sensitive: 'Counts only.' },
};

export type BuiltReport = { columns: string[]; rows: string[][]; people: number; parties: number };

export function buildReport(kind: ReportKind, data: EventData, rows: PartyRow[]): BuiltReport {
  const tz = data.event.timezone;
  const when = (iso: string | null) => (iso ? formatExact(iso, tz) : 'Not supplied');
  const partyIds = new Set(rows.map((r) => r.party.id));
  const people = rows.reduce((s, r) => s + r.people, 0);
  const base = { people, parties: rows.length };
  const byParty = new Map(rows.map((r) => [r.party.id, r]));
  switch (kind) {
    case 'master': {
      const columns = ['Reference', 'Party', 'Guest', 'Age band', 'Priority', 'Phone', ...data.functions.map((f) => f.name)];
      const out = rows.flatMap((r) =>
        r.members.map((m) => [
          r.party.ref,
          r.party.displayName,
          m.name,
          m.ageBand,
          PRIORITY_LABEL[r.party.priority],
          r.party.phone,
          ...data.functions.map((f) => (m.invitedFunctionIds.includes(f.id) ? FUNCTION_RSVP_LABEL[m.responses[f.id] ?? 'awaiting'] : 'Not invited')),
        ]),
      );
      return { columns, rows: out, ...base };
    }
    case 'function-rsvp': {
      const scoped = { ...data, members: data.members.filter((m) => partyIds.has(m.partyId)) };
      const columns = ['Function', 'Starts', 'Invited people', 'Confirmed', 'Tentative', 'Declined', 'Awaiting confirmation'];
      const out = functionCounts(scoped).map(({ fn, invited, counts }) => [fn.name, when(fn.startsAt), String(invited), String(counts.confirmed), String(counts.tentative), String(counts.declined + counts.cancelled), String(counts.awaiting)]);
      return { columns, rows: out, ...base };
    }
    case 'pending': {
      const columns = ['Reference', 'Party', 'People awaiting', 'Contact', 'Follow-up due', 'Caller', 'Reason'];
      const out = rows
        .filter((r) => r.statusCounts.awaiting > 0 || r.party.followUpDueAt)
        .map((r) => [r.party.ref, r.party.displayName, String(r.statusCounts.awaiting), CONTACT_LABEL[r.party.contact], when(r.party.followUpDueAt), r.party.assignedCaller, r.party.followUpReason || '—']);
      return { columns, rows: out, ...base };
    }
    case 'travel': {
      const columns = ['Reference', 'Party', 'Direction', 'Mode', 'Travel reference', 'From', 'To', `Time (${tz})`, 'Passengers', 'Assistance', 'Changed from'];
      const out = data.legs
        .filter((l) => partyIds.has(l.partyId))
        .map((l) => {
          const r = byParty.get(l.partyId) as PartyRow;
          const pax = l.passengerIds.filter((id) => r.members.some((m) => m.id === id)).length;
          return [r.party.ref, r.party.displayName, l.direction, TRAVEL_MODE_LABEL[l.mode], l.reference || '—', l.from, l.to, when(l.at), String(pax), l.assistance || '—', l.changedFrom ? when(l.changedFrom) : '—'];
        });
      return { columns, rows: out, ...base };
    }
    case 'transfers': {
      const columns = ['Reference', 'Party', 'Kind', 'Status', 'Vehicle', 'Passengers', `Time (${tz})`];
      const out = data.transfers
        .filter((t) => partyIds.has(t.partyId) && t.state !== 'not-required')
        .map((t) => {
          const r = byParty.get(t.partyId) as PartyRow;
          const leg = data.legs.find((l) => l.id === t.legId);
          const v = data.vehicles.find((x) => x.id === t.vehicleId);
          const pax = (leg?.passengerIds ?? []).filter((id) => r.members.some((m) => m.id === id)).length;
          return [r.party.ref, r.party.displayName, t.kind, TRANSFER_LABEL[t.state], v ? `${v.label} · ${v.driver}` : 'Unassigned', String(pax), when(leg?.at ?? null)];
        });
      return { columns, rows: out, ...base };
    }
    case 'rooming': {
      const columns = ['Reference', 'Party', 'Hotel', 'Category', 'Room', 'Check-in', 'Check-out', 'Occupants', 'Status', 'Accessibility'];
      const out = data.stays
        .filter((s) => partyIds.has(s.partyId) && s.state !== 'not-required')
        .map((s) => {
          const r = byParty.get(s.partyId) as PartyRow;
          const hotel = data.hotels.find((h) => h.id === s.hotelId);
          const cat = hotel?.categories.find((c) => c.id === s.categoryId);
          return [r.party.ref, r.party.displayName, hotel?.name ?? '—', cat?.name ?? '—', s.roomLabel || '—', s.checkIn, s.checkOut, String(s.occupantIds.length), STAY_LABEL[s.state], s.accessibility || '—'];
        });
      return { columns, rows: out, ...base };
    }
    case 'changes': {
      const columns = ['Reference', 'Party', 'Field', 'Before', 'After', 'Actor', 'Source', 'Recorded (synthetic adapter time)'];
      const out = rows.flatMap((r) => r.party.changes.map((c) => [r.party.ref, r.party.displayName, c.field, c.before, c.after, c.actor, c.source, when(c.at)]));
      return { columns, rows: out, ...base };
    }
    case 'delivery': {
      const columns = ['Reference', 'Party', 'Invitation', 'Delivery (synthetic sample)', 'Contact response'];
      const out = rows.map((r) => [r.party.ref, r.party.displayName, INVITATION_LABEL[r.party.invitation], DELIVERY_LABEL[r.party.delivery], CONTACT_LABEL[r.party.contact]]);
      return { columns, rows: out, ...base };
    }
    case 'final': {
      const count = (fn: (r: PartyRow) => number) => String(rows.reduce((s, r) => s + fn(r), 0));
      const out = [
        ['Parties / households', String(rows.length)],
        ['People invited', String(people)],
        ['People confirmed (any function)', count((r) => r.statusCounts.confirmed)],
        ['People tentative', count((r) => r.statusCounts.tentative)],
        ['People declined (all functions)', count((r) => r.statusCounts.declined)],
        ['People awaiting confirmation', count((r) => r.statusCounts.awaiting)],
        ['Parties needing attention', String(rows.filter((r) => r.attention.length).length)],
        ['Stays not yet communicated', String(data.stays.filter((s) => partyIds.has(s.partyId) && ['requested', 'proposed', 'approval-pending', 'approved'].includes(s.state)).length)],
        ['Transfers without vehicle', String(data.transfers.filter((t) => partyIds.has(t.partyId) && ['requested', 'awaiting-details', 'planned'].includes(t.state)).length)],
      ];
      return { columns: ['Measure', 'Value'], rows: out, ...base };
    }
  }
}

export function isStale(snapshot: ReportSnapshot, data: Pick<EventData, 'dataRevision'>) {
  return snapshot.dataRevision < data.dataRevision;
}

export function exportFileName(kind: ReportKind, eventName: string, revision: number) {
  const slug = eventName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${slug}-${kind}-r${revision}-synthetic-preview.csv`;
}
