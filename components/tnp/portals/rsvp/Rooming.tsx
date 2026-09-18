'use client';

import { AlertTriangle, ArrowRight, BedDouble } from 'lucide-react';
import { useState } from 'react';
import type { Command } from './adapter';
import { formatDay, localDate } from './dates';
import { categoryUsage, roomConflicts } from './logic';
import { STAY_LABEL, type Role, type Stay, type StayState } from './model';
import type { SectionProps } from './types';
import { ActionError, Modal, PendingLabel, StatePanel, Tag, styles, useEventMutation } from './ui';

type Move = { to: StayState; label: string; needsRoom?: boolean; roles: Role[] };

const STAFF: Role[] = ['service-manager', 'vendor-owner', 'coordinator'];

// Distinct steps: request, proposal, customer approval, allocation/communication and actual stay.
const MOVES: Record<StayState, Move[]> = {
  'not-required': [],
  requested: [{ to: 'proposed', label: 'Propose a room', needsRoom: true, roles: STAFF }],
  proposed: [
    { to: 'approval-pending', label: 'Send for customer approval', roles: STAFF },
    { to: 'requested', label: 'Withdraw proposal', roles: STAFF },
  ],
  'approval-pending': [
    { to: 'approved', label: 'Approve room', roles: ['customer-owner'] },
    { to: 'proposed', label: 'Return for changes', roles: ['customer-owner'] },
    // Staff only record a decision the customer gave outside the portal; the change history names the staff actor.
    { to: 'approved', label: 'Record customer approval', roles: STAFF },
    { to: 'proposed', label: 'Record customer changes requested', roles: STAFF },
  ],
  approved: [
    { to: 'communicated', label: 'Record details communicated', roles: STAFF },
    { to: 'proposed', label: 'Re-propose', needsRoom: true, roles: STAFF },
  ],
  communicated: [
    { to: 'checked-in', label: 'Record check-in', roles: ['hotel-contact', ...STAFF] },
    { to: 'proposed', label: 'Re-propose', needsRoom: true, roles: STAFF },
  ],
  'checked-in': [{ to: 'checked-out', label: 'Record check-out', roles: ['hotel-contact', ...STAFF] }],
  'checked-out': [],
};

const STATE_TONE: Record<StayState, 'good' | 'warn' | 'info' | 'muted' | 'neutral'> = {
  'not-required': 'muted',
  requested: 'warn',
  proposed: 'info',
  'approval-pending': 'warn',
  approved: 'info',
  communicated: 'good',
  'checked-in': 'good',
  'checked-out': 'muted',
};

export function RoomingSection(props: SectionProps) {
  const { data, rows, persona, changedIds } = props;
  const tz = data.event.timezone;
  const [filter, setFilter] = useState<StayState | 'all' | 'attention'>('all');
  const [moving, setMoving] = useState<{ stay: Stay; move: Move } | null>(null);
  const conflicts = roomConflicts(data);
  const usage = categoryUsage(data);
  const hotelView = persona.role === 'hotel-contact';
  const partyOf = (id: string) => rows.find((r) => r.party.id === id);

  if (!data.hotels.length) {
    return (
      <StatePanel title="No hotel inventory for this event" headingLevel={2}>
        <p>Rooming is not part of this event’s service. Stay requests from guests are recorded for follow-up only.</p>
      </StatePanel>
    );
  }

  // Travel that now falls outside the stay dates flags the stay for review.
  const dateIssue = (s: Stay) =>
    data.legs.some((l) => l.partyId === s.partyId && l.at && (l.direction === 'arrival' ? localDate(l.at, tz) < s.checkIn : localDate(l.at, tz) > s.checkOut));
  const stays = data.stays.filter((s) => s.state !== 'not-required');
  const shown = stays.filter((s) => (filter === 'all' ? true : filter === 'attention' ? conflicts.has(s.id) || dateIssue(s) : s.state === filter));

  return (
    <div className={styles.stack}>
      {hotelView && <p className={styles.notice}>Hotel view: only the rooming details needed for this stay are shown — no contact details, travel documents or the wider guest list.</p>}
      <section className={styles.panel} aria-labelledby="inventory-h">
        <h2 id="inventory-h">
          <BedDouble size={18} aria-hidden /> Inventory held (synthetic — not live availability)
        </h2>
        <ul className={styles.inventoryList}>
          {usage.map(({ hotel, cat, held }) => (
            <li key={cat.id} className={held > cat.inventory ? styles.inventoryOver : ''}>
              <span className={styles.wrap}>
                <strong>{hotel.name}</strong> · {cat.name} · up to {cat.maxOccupancy} guests
              </span>
              <span className={styles.meter} aria-hidden>
                <span style={{ width: `${Math.min(100, (held / cat.inventory) * 100)}%` }} />
              </span>
              <span>
                {held} of {cat.inventory} held {held > cat.inventory && <Tag tone="bad">Over capacity</Tag>}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <div className={styles.toolbar}>
        <label className={styles.inlineField}>
          <span>Show</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
            <option value="all">All stays ({stays.length})</option>
            <option value="attention">Needs attention ({stays.filter((s) => conflicts.has(s.id) || dateIssue(s)).length})</option>
            {(Object.keys(STAY_LABEL) as StayState[])
              .filter((k) => k !== 'not-required')
              .map((k) => (
                <option key={k} value={k}>
                  {STAY_LABEL[k]} ({stays.filter((s) => s.state === k).length})
                </option>
              ))}
          </select>
        </label>
        <output className={styles.resultCount}>{shown.length} stays shown</output>
      </div>
      {shown.length === 0 ? (
        <StatePanel title="No stays in this view" headingLevel={3} action={<button type="button" className={styles.btnSecondary} onClick={() => setFilter('all')}>Show all stays</button>}>
          <p>Try another status.</p>
        </StatePanel>
      ) : (
        <section className={styles.tableWrap} aria-label="Rooming list" data-lenis-prevent>
          <table className={`${styles.table} ${styles.responsiveTable}`}>
            <caption className={styles.srOnly}>Stays with dates, occupants, room and status. Requesting, proposing, approving, communicating and checking in are separate steps.</caption>
            <thead>
              <tr>
                <th scope="col">Party</th>
                <th scope="col">Dates</th>
                <th scope="col">Occupants</th>
                <th scope="col">Room</th>
                <th scope="col">Status</th>
                <th scope="col">Needs</th>
                <th scope="col">Next step</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((s) => {
                const r = partyOf(s.partyId);
                const hotel = data.hotels.find((h) => h.id === s.hotelId);
                const cat = hotel?.categories.find((c) => c.id === s.categoryId);
                const moves = MOVES[s.state].filter((m) => m.roles.includes(persona.role));
                return (
                  <tr key={s.id} className={changedIds.has(s.partyId) ? styles.rowChanged : ''}>
                    <th scope="row" data-label="Party" className={styles.wrap}>
                      {r?.party.displayName} <span className={styles.meta}>{r?.party.ref}</span>
                    </th>
                    <td data-label="Dates">
                      {formatDay(s.checkIn)} – {formatDay(s.checkOut)}
                    </td>
                    <td data-label="Occupants">{s.occupantIds.length}</td>
                    <td data-label="Room" className={styles.wrap}>
                      {hotel ? `${hotel.name} · ${cat?.name ?? ''}` : '—'} {s.roomLabel && <strong>· {s.roomLabel}</strong>}
                    </td>
                    <td data-label="Status">
                      <Tag tone={STATE_TONE[s.state]}>{STAY_LABEL[s.state]}</Tag>
                    </td>
                    <td data-label="Needs" className={styles.wrap}>
                      {[s.preference, s.accessibility].filter(Boolean).join(' · ') || <span className={styles.meta}>—</span>}
                      {conflicts.has(s.id) && (
                        <Tag tone="bad" icon={<AlertTriangle size={12} aria-hidden />}>
                          {conflicts.get(s.id)}
                        </Tag>
                      )}
                      {dateIssue(s) && <Tag tone="bad">Travel falls outside stay dates</Tag>}
                    </td>
                    <td data-label="Next step">
                      {moves.length === 0 ? (
                        <span className={styles.meta}>{s.state === 'approval-pending' ? 'Awaiting customer approval' : 'No action for your role'}</span>
                      ) : (
                        <div className={styles.inlineActions}>
                          {moves.map((m) => (
                            <button key={m.label} type="button" className={styles.btnGhost} onClick={() => setMoving({ stay: s, move: m })}>
                              {m.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
      {moving && <StayMove key={`${moving.stay.id}-${moving.move.to}`} stay={moving.stay} move={moving.move} props={props} onClose={() => setMoving(null)} />}
    </div>
  );
}

function StayMove({ stay, move, props, onClose }: { stay: Stay; move: Move; props: SectionProps; onClose: () => void }) {
  const { data, rows, persona } = props;
  const party = rows.find((r) => r.party.id === stay.partyId)?.party;
  const [hotelId, setHotelId] = useState(stay.hotelId ?? data.hotels[0]?.id ?? '');
  const [categoryId, setCategoryId] = useState(stay.categoryId ?? '');
  const [roomLabel, setRoomLabel] = useState(stay.roomLabel);
  const hotel = data.hotels.find((h) => h.id === hotelId);
  const cat = hotel?.categories.find((c) => c.id === categoryId);
  const usage = categoryUsage(data).find((u) => u.cat.id === categoryId);
  const wouldExceed = Boolean(move.needsRoom && usage && stay.categoryId !== categoryId && usage.held + 1 > usage.cat.inventory);
  const tooMany = Boolean(move.needsRoom && cat && stay.occupantIds.length > cat.maxOccupancy);
  const staff = persona.role !== 'customer-owner' && persona.role !== 'hotel-contact';
  const action = useEventMutation(
    () =>
      party
        ? ({
            type: 'stay',
            stayId: stay.id,
            baseVersion: party.version,
            to: move.to,
            ...(move.needsRoom ? { hotelId, categoryId } : {}),
            ...(staff ? { roomLabel } : {}),
          } satisfies Command)
        : null,
    () => onClose(),
    (_v, replayed) =>
      replayed
        ? 'Stay change already recorded — confirmed once.'
        : move.to === 'communicated'
          ? 'Recorded that room details were communicated. This preview sends no message.'
          : `Stay moved to “${STAY_LABEL[move.to]}”.`,
  );
  const oldRoom = stay.hotelId ? `${data.hotels.find((h) => h.id === stay.hotelId)?.name} · ${data.hotels.flatMap((h) => h.categories).find((c) => c.id === stay.categoryId)?.name ?? ''} ${stay.roomLabel}` : 'No room';
  const newRoom = move.needsRoom ? `${hotel?.name ?? ''} · ${cat?.name ?? 'choose category'} ${roomLabel}` : `${oldRoom.replace(stay.roomLabel, '')} ${roomLabel}`;
  return (
    <Modal open title={`${move.label} — ${party?.displayName ?? ''}`} onClose={onClose} description="Review the before and after summary. Significant stay changes are recorded with actor and time.">
      <form
        className={styles.form}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void action.start();
        }}
      >
        {move.needsRoom && (
          <div className={styles.grid2}>
            <label className={styles.field}>
              <span>Hotel</span>
              <select
                value={hotelId}
                onChange={(e) => {
                  setHotelId(e.target.value);
                  setCategoryId('');
                }}
              >
                {data.hotels.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Room category</span>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Choose a category</option>
                {hotel?.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (up to {c.maxOccupancy})
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        {staff && (
          <label className={styles.field}>
            <span>Room number or label (optional)</span>
            <input value={roomLabel} onChange={(e) => setRoomLabel(e.target.value)} autoComplete="off" maxLength={24} />
          </label>
        )}
        {(wouldExceed || tooMany) && (
          <p className={styles.notice} role="alert">
            <AlertTriangle size={15} aria-hidden /> {wouldExceed ? `${cat?.name} is already fully held (${usage?.held} of ${usage?.cat.inventory}).` : ''} {tooMany ? `${stay.occupantIds.length} occupants exceed the ${cat?.name} maximum of ${cat?.maxOccupancy}.` : ''} This would create a capacity conflict.
          </p>
        )}
        <section className={styles.reviewBox} aria-label="Before and after">
          <h4>Before and after</h4>
          <p className={styles.beforeAfter}>
            <span>{STAY_LABEL[stay.state]}</span> <ArrowRight size={12} aria-hidden /> <strong>{STAY_LABEL[move.to]}</strong>
          </p>
          <p className={styles.beforeAfter}>
            <span>{oldRoom.trim() || 'No room'}</span> <ArrowRight size={12} aria-hidden /> <strong>{newRoom.trim()}</strong>
          </p>
        </section>
        <ActionError status={action.status} onRetry={action.retry} onRefresh={onClose} />
        <div className={styles.formActions}>
          <button type="submit" className={styles.btnPrimary} disabled={action.status.phase === 'pending' || (move.needsRoom && !categoryId) || wouldExceed || tooMany}>
            <PendingLabel pending={action.status.phase === 'pending'} idle={move.label} busy="Saving…" />
          </button>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
