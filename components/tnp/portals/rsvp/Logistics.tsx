'use client';

import { AlertTriangle, ArrowRight, Car, Plane, RouteOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Command } from './adapter';
import { formatDay, formatExact, isoToZonedLocal, localDate, zonedToIso } from './dates';
import { buildManifests, changedArrival, dependentsOfLeg, transferPassengers, type Manifest } from './logic';
import { STAY_LABEL, TRANSFER_LABEL, TRAVEL_MODE_LABEL, type Transfer, type TransferState, type TravelLeg } from './model';
import type { SectionProps } from './types';
import { ActionError, FieldError, Modal, PendingLabel, StatePanel, Tag, WhyUnavailable, fieldProps, styles, useEventMutation } from './ui';

// ---------- Travel ----------

export function TravelSection(props: SectionProps) {
  const { data, rows, can, go, changedIds } = props;
  const tz = data.event.timezone;
  const [direction, setDirection] = useState<'arrival' | 'departure'>('arrival');
  const [status, setStatus] = useState<'all' | 'missing' | 'changed'>('all');
  const [editing, setEditing] = useState<TravelLeg | null>(null);
  const partyOf = (id: string) => rows.find((r) => r.party.id === id);

  const all = data.legs.filter((l) => l.direction === direction);
  const isChangedLeg = (l: TravelLeg) => changedArrival(l, data.transfers) || Boolean(l.changedFrom);
  const legs = all.filter((l) => (status === 'missing' ? !l.at : status === 'changed' ? isChangedLeg(l) : true));
  // Group by calendar day in the event timezone, so after-midnight arrivals land on the correct date.
  const groups = new Map<string, TravelLeg[]>();
  for (const l of [...legs].sort((a, b) => (a.at ?? '9999').localeCompare(b.at ?? '9999'))) {
    const key = l.at ? localDate(l.at, tz) : 'missing';
    groups.set(key, [...(groups.get(key) ?? []), l]);
  }

  return (
    <div className={styles.stack}>
      <div className={styles.toolbar}>
        <fieldset className={styles.segmented}>
          <legend className={styles.srOnly}>Direction</legend>
          <button type="button" aria-pressed={direction === 'arrival'} onClick={() => setDirection('arrival')}>
            Arrivals
          </button>
          <button type="button" aria-pressed={direction === 'departure'} onClick={() => setDirection('departure')}>
            Departures
          </button>
        </fieldset>
        <label className={styles.inlineField}>
          <span>Show</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            <option value="all">All legs</option>
            <option value="missing">Missing time ({all.filter((l) => !l.at).length})</option>
            <option value="changed">Changed ({all.filter(isChangedLeg).length})</option>
          </select>
        </label>
        <output className={styles.resultCount}>
          {legs.length} {direction} legs · times in {tz}
        </output>
      </div>
      <p className={styles.meta}>Arrival and departure are independent: a self-drive arrival can still need a departure drop. Changing a time flags dependent transfers and stays for review.</p>
      {legs.length === 0 ? (
        <StatePanel
          title={all.length ? 'No legs match this view' : 'No travel recorded yet'}
          headingLevel={3}
          action={
            all.length ? (
              <button type="button" className={styles.btnSecondary} onClick={() => setStatus('all')}>
                Show all legs
              </button>
            ) : undefined
          }
        >
          <p>{all.length ? 'Try another filter.' : 'Guests share travel through the invitation form or with the calling team.'}</p>
        </StatePanel>
      ) : (
        [...groups.entries()].map(([day, items]) => (
          <section key={day} className={styles.panel} aria-labelledby={`day-${day}`}>
            <h2 id={`day-${day}`}>{day === 'missing' ? 'Time not supplied yet' : formatDay(day)}</h2>
            <section className={styles.tableWrap} aria-label={`${direction} legs, ${day === 'missing' ? 'time not supplied' : formatDay(day)}`} data-lenis-prevent>
              <table className={`${styles.table} ${styles.responsiveTable}`}>
                <caption className={styles.srOnly}>{direction === 'arrival' ? 'Arrivals' : 'Departures'} with passengers and dependent transfers</caption>
                <thead>
                  <tr>
                    <th scope="col">Party</th>
                    <th scope="col">Mode</th>
                    <th scope="col">Time ({tz})</th>
                    <th scope="col">{direction === 'arrival' ? 'From' : 'To'}</th>
                    <th scope="col">Passengers</th>
                    <th scope="col">Luggage</th>
                    <th scope="col">Transfer</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((l) => {
                    const r = partyOf(l.partyId);
                    const t = data.transfers.find((x) => x.legId === l.id);
                    const pax = r ? l.passengerIds.filter((id) => r.members.some((m) => m.id === id)).length : l.passengerIds.length;
                    return (
                      <tr key={l.id} className={changedIds.has(l.partyId) ? styles.rowChanged : ''}>
                        <th scope="row" data-label="Party" className={styles.wrap}>
                          {r?.party.displayName ?? '—'} <span className={styles.meta}>{r?.party.ref}</span>
                        </th>
                        <td data-label="Mode">
                          {TRAVEL_MODE_LABEL[l.mode]} {l.reference && <span className={styles.meta}>{l.reference}</span>}
                        </td>
                        <td data-label="Time">
                          {l.at ? formatExact(l.at, tz) : <Tag tone="warn">Not supplied</Tag>}
                          {l.changedFrom && <span className={styles.meta}> · was {formatExact(l.changedFrom, tz)}</span>}
                        </td>
                        <td data-label={direction === 'arrival' ? 'From' : 'To'}>{direction === 'arrival' ? l.from : l.to}</td>
                        <td data-label="Passengers">
                          {pax}
                          {l.assistance && <span className={styles.meta}> · {l.assistance}</span>}
                        </td>
                        <td data-label="Luggage">{l.luggage}</td>
                        <td data-label="Transfer">
                          {t ? TRANSFER_LABEL[t.state] : l.mode === 'self-drive' ? 'Self-drive' : 'None'}{' '}
                          {changedArrival(l, data.transfers) && (
                            <Tag tone="bad" icon={<AlertTriangle size={12} aria-hidden />}>
                              Plan outdated
                            </Tag>
                          )}
                        </td>
                        <td data-label="Action">
                          {can('change-leg') ? (
                            <button type="button" className={styles.btnGhost} onClick={() => setEditing(l)}>
                              Change time
                            </button>
                          ) : (
                            <WhyUnavailable>Your role cannot change travel.</WhyUnavailable>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          </section>
        ))
      )}
      {editing && <ChangeLeg leg={editing} props={props} onClose={() => setEditing(null)} onOpenMovements={() => go('movements')} />}
    </div>
  );
}

function ChangeLeg({ leg, props, onClose, onOpenMovements }: { leg: TravelLeg; props: SectionProps; onClose: () => void; onOpenMovements: () => void }) {
  const { data, rows } = props;
  const tz = data.event.timezone;
  const party = rows.find((r) => r.party.id === leg.partyId)?.party;
  const [value, setValue] = useState(leg.at ? isoToZonedLocal(leg.at, tz) : '');
  const [reference, setReference] = useState(leg.reference);
  const [errors, setErrors] = useState<Array<{ id: string; message: string }>>([]);
  const [done, setDone] = useState(false);
  const deps = dependentsOfLeg(leg.id, data);
  const nextIso = value ? zonedToIso(value, tz) : null;
  const action = useEventMutation(
    () => (party ? ({ type: 'change-leg', legId: leg.id, baseVersion: party.version, at: nextIso, reference: reference.trim() } satisfies Command) : null),
    () => setDone(true),
    (_v, replayed) => (replayed ? 'Travel change already recorded — confirmed once.' : 'Travel time changed. Dependent transfers are flagged for replanning.'),
  );
  const submit = () => {
    const errs = value && !nextIso ? [{ id: 'leg-time', message: 'Enter a valid date and time.' }] : [];
    setErrors(errs);
    if (!errs.length) void action.start();
  };
  return (
    <Modal open title={`Change ${leg.direction} for ${party?.displayName ?? 'party'}`} onClose={onClose} description={`Times are in the event timezone (${tz}).`}>
      {done ? (
        <div className={styles.stack}>
          <output className={styles.receipt}>
            Recorded. {deps.transfers.length ? `${deps.transfers.length} dependent transfer(s) now show "Plan outdated" until replanned.` : 'No dependent transfer.'}
            {deps.stayDateMismatch ? ' The stay dates no longer match this travel time.' : ''}
          </output>
          <div className={styles.inlineActions}>
            {deps.transfers.length > 0 && (
              <button type="button" className={styles.btnPrimary} onClick={onOpenMovements}>
                Review movements <ArrowRight size={14} aria-hidden />
              </button>
            )}
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      ) : (
        <form
          className={styles.form}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <label className={styles.field}>
            <span>New {leg.direction} time</span>
            <input {...fieldProps('leg-time', errors)} type="datetime-local" value={value} onChange={(e) => setValue(e.target.value)} />
            <FieldError id="leg-time" errors={errors} />
          </label>
          <label className={styles.field}>
            <span>Travel reference</span>
            <input value={reference} onChange={(e) => setReference(e.target.value)} autoComplete="off" />
          </label>
          <section className={styles.reviewBox} aria-label="Before and after">
            <h4>Before and after</h4>
            <p className={styles.beforeAfter}>
              <span>{leg.at ? formatExact(leg.at, tz) : 'Not supplied'}</span> <ArrowRight size={12} aria-hidden /> <strong>{nextIso ? formatExact(nextIso, tz) : 'Not supplied'}</strong>
            </p>
            <p className={styles.meta}>
              Affects {deps.transfers.length} transfer(s)
              {deps.stay ? ` and a stay (${STAY_LABEL[deps.stay.state]}, ${deps.stay.checkIn} to ${deps.stay.checkOut})` : ''}. Updated details are not sent to the guest, hotel or driver from this preview.
            </p>
          </section>
          <ActionError status={action.status} onRetry={action.retry} onRefresh={onClose} />
          <div className={styles.formActions}>
            <button type="submit" className={styles.btnPrimary} disabled={action.status.phase === 'pending'}>
              <PendingLabel pending={action.status.phase === 'pending'} idle="Save change" busy="Saving…" />
            </button>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

// ---------- Movements ----------

const NEXT_STATES: Partial<Record<TransferState, TransferState[]>> = {
  requested: ['planned', 'cancelled'],
  planned: ['cancelled'],
  assigned: ['dispatched', 'cancelled'],
  dispatched: ['guest-met', 'no-show'],
  'guest-met': ['completed'],
};

export function MovementsSection(props: SectionProps) {
  const { data, rows, can } = props;
  const tz = data.event.timezone;
  const manifests = useMemo(() => buildManifests(data), [data]);
  const partyOf = (id: string) => rows.find((r) => r.party.id === id);
  const stale = data.transfers.filter((t) => {
    const leg = data.legs.find((l) => l.id === t.legId);
    return leg ? changedArrival(leg, [t]) : false;
  });
  const unplanned = data.transfers.filter((t) => t.state === 'requested' || t.state === 'awaiting-details');
  const states = Object.keys(TRANSFER_LABEL) as TransferState[];
  const editable = can('transfer');

  return (
    <div className={styles.stack}>
      <p className={styles.meta}>
        <RouteOff size={14} aria-hidden /> No live GPS or vehicle tracking: states change only when staff record them. Drivers would see only their assigned movement and passenger names — never documents or the full guest list.
      </p>
      <ul className={styles.countRow} aria-label="Transfer status counts">
        {states
          .map((k) => [k, data.transfers.filter((t) => t.state === k).length] as const)
          .filter(([, n]) => n > 0)
          .map(([k, n]) => (
            <li key={k}>
              <Tag tone={k === 'cancelled' || k === 'no-show' || k === 'not-required' ? 'muted' : k === 'completed' ? 'good' : k === 'awaiting-details' || k === 'requested' ? 'warn' : 'info'}>
                {n} {TRANSFER_LABEL[k]}
              </Tag>
            </li>
          ))}
      </ul>
      {stale.length > 0 && <ChangedWarnings transfers={stale} props={props} />}
      <section className={styles.panel} aria-labelledby="manifests-h">
        <h2 id="manifests-h">
          <Car size={18} aria-hidden /> Movement manifests
        </h2>
        <p className={styles.meta}>Planned transfers grouped by kind, day, three-hour window and route. Passenger counts include only attending party members.</p>
        {manifests.length === 0 ? (
          <p>No planned movements yet. Plan requested transfers below.</p>
        ) : (
          <ul className={styles.manifestList}>
            {manifests.map((m) => (
              <li key={m.id} className={`${styles.manifest} ${m.changed ? styles.manifestChanged : ''}`}>
                <div className={styles.manifestHead}>
                  <div>
                    <p className={styles.kickerDark}>
                      {m.kind === 'pickup' ? 'Pickup' : 'Drop'} · {formatDay(m.date)} · {m.window}
                    </p>
                    <h3>{m.location}</h3>
                  </div>
                  <p className={styles.manifestPax}>
                    <strong>{m.passengers}</strong> passengers
                  </p>
                </div>
                {m.changed && (
                  <p className={styles.notice}>
                    <AlertTriangle size={15} aria-hidden /> A travel time in this manifest changed after planning. Replan before dispatch.
                  </p>
                )}
                <VehicleAssign key={`${m.id}-${m.vehicleId}`} manifest={m} props={props} />
                <ul className={styles.plainList}>
                  {m.transfers.map((t) => (
                    <li key={t.id} className={styles.transferRow}>
                      <span className={styles.wrap}>
                        {partyOf(t.partyId)?.party.displayName} · {transferPassengers(t, data)} pax
                      </span>
                      <Tag tone="info">{TRANSFER_LABEL[t.state]}</Tag>
                      {editable && <TransferStep key={`${t.id}-${t.state}`} transfer={t} />}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className={styles.panel} aria-labelledby="unplanned-h">
        <h2 id="unplanned-h">
          <Plane size={18} aria-hidden /> Requested and awaiting details ({unplanned.length})
        </h2>
        {unplanned.length === 0 ? (
          <p>Every requested transfer is planned.</p>
        ) : (
          <ul className={styles.plainList}>
            {unplanned.map((t) => {
              const leg = data.legs.find((l) => l.id === t.legId);
              return (
                <li key={t.id} className={styles.transferRow}>
                  <span className={styles.wrap}>
                    {t.kind === 'pickup' ? 'Pickup' : 'Drop'} · {partyOf(t.partyId)?.party.displayName} · {leg?.at ? formatExact(leg.at, tz) : 'time not supplied'}
                  </span>
                  <Tag tone="warn">{TRANSFER_LABEL[t.state]}</Tag>
                  {editable &&
                    (leg?.at ? (
                      <TransferStep key={`${t.id}-${t.state}`} transfer={t} />
                    ) : (
                      <WhyUnavailable>A movement cannot be planned until the guest shares the {t.kind === 'pickup' ? 'arrival' : 'departure'} time.</WhyUnavailable>
                    ))}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function ChangedWarnings({ transfers, props }: { transfers: Transfer[]; props: SectionProps }) {
  const { data, rows } = props;
  const tz = data.event.timezone;
  const action = useEventMutation(
    () => ({ type: 'replan-transfer', transferIds: transfers.map((t) => t.id) }) satisfies Command,
    undefined,
    (_v, replayed) => (replayed ? 'Replanning already recorded.' : `${transfers.length} transfer(s) moved back to planned against the new times; vehicles released for a capacity re-check.`),
  );
  return (
    <section className={`${styles.panel} ${styles.warnPanel}`} aria-labelledby="changed-h">
      <h2 id="changed-h">
        <AlertTriangle size={18} aria-hidden /> Changed travel affects {transfers.length} planned movement(s)
      </h2>
      <ul className={styles.plainList}>
        {transfers.map((t) => {
          const leg = data.legs.find((l) => l.id === t.legId);
          return (
            <li key={t.id}>
              <strong>{rows.find((r) => r.party.id === t.partyId)?.party.displayName}</strong>: planned for {t.planBasedOn ? formatExact(t.planBasedOn, tz) : 'unknown'}, now{' '}
              {leg?.at ? formatExact(leg.at, tz) : 'not supplied'}
            </li>
          );
        })}
      </ul>
      <ActionError status={action.status} onRetry={action.retry} />
      {props.can('replan-transfer') && (
        <button type="button" className={styles.btnPrimary} onClick={action.start} disabled={action.status.phase === 'pending'}>
          <PendingLabel pending={action.status.phase === 'pending'} idle="Replan against new times" busy="Replanning…" />
        </button>
      )}
    </section>
  );
}

function VehicleAssign({ manifest, props }: { manifest: Manifest; props: SectionProps }) {
  const { data, can } = props;
  const [vehicleId, setVehicleId] = useState(manifest.vehicleId ?? '');
  const selected = data.vehicles.find((v) => v.id === vehicleId);
  const over = Boolean(selected && manifest.passengers > selected.seats);
  const action = useEventMutation(
    () => ({ type: 'assign-vehicle', transferIds: manifest.transfers.map((t) => t.id), vehicleId: vehicleId || null }) satisfies Command,
    undefined,
    (_v, replayed) => (replayed ? 'Assignment already recorded.' : vehicleId ? `Assigned ${selected?.label} to ${manifest.transfers.length} transfer(s).` : 'Vehicle released.'),
  );
  if (!data.vehicles.length) return <p className={styles.meta}>No vehicles are configured for this event.</p>;
  return (
    <div className={styles.vehicleRow}>
      <label className={styles.inlineField}>
        <span>Vehicle and driver</span>
        <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} disabled={!can('assign-vehicle')}>
          <option value="">Unassigned</option>
          {data.vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label} · {v.seats} seats · {v.driver}
            </option>
          ))}
        </select>
      </label>
      <output className={over || manifest.capacityIssue ? styles.fieldError : styles.meta}>
        {selected ? (over ? `${manifest.passengers} passengers exceed ${selected.seats} seats` : `${selected.seats - manifest.passengers} seat(s) spare`) : 'Choose a vehicle to check capacity'}
        {manifest.capacityIssue && vehicleId === manifest.vehicleId ? ` · ${manifest.capacityIssue}` : ''}
      </output>
      {can('assign-vehicle') && (
        <button type="button" className={styles.btnSecondary} disabled={vehicleId === (manifest.vehicleId ?? '') || over || action.status.phase === 'pending'} onClick={action.start}>
          <PendingLabel pending={action.status.phase === 'pending'} idle={vehicleId ? 'Assign' : 'Release'} busy="Saving…" />
        </button>
      )}
      <ActionError status={action.status} onRetry={action.retry} />
    </div>
  );
}

function TransferStep({ transfer }: { transfer: Transfer }) {
  const options = NEXT_STATES[transfer.state] ?? [];
  const [next, setNext] = useState<TransferState | ''>('');
  const action = useEventMutation(
    () => (next ? ({ type: 'transfer', transferId: transfer.id, state: next } satisfies Command) : null),
    undefined,
    () => `Recorded: ${next ? TRANSFER_LABEL[next] : ''}. No message was sent to the driver or guest.`,
  );
  if (!options.length) return null;
  return (
    <span className={styles.stepControl}>
      <label className={styles.srOnly} htmlFor={`step-${transfer.id}`}>
        Next status for this transfer
      </label>
      <select id={`step-${transfer.id}`} value={next} onChange={(e) => setNext(e.target.value as TransferState)}>
        <option value="">Record next status…</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {TRANSFER_LABEL[o]}
          </option>
        ))}
      </select>
      <button type="button" className={styles.btnGhost} disabled={!next || action.status.phase === 'pending'} onClick={action.start}>
        Record
      </button>
      <ActionError status={action.status} onRetry={action.retry} />
    </span>
  );
}
