'use client';

import { AlertTriangle, ArrowRight, CalendarCheck, History, Plane } from 'lucide-react';
import type { CSSProperties } from 'react';
import { daysBetween, formatDay, formatExact, formatTime, localDate } from './dates';
import { ATTENTION_LABEL, functionCounts, summarize, sortRows, type GuestFilters } from './logic';
import { TRANSFER_LABEL, TRAVEL_MODE_LABEL, type Section } from './model';
import type { SectionProps } from './types';
import { IllustrativeImage, Stamp, StatePanel, Tag, styles, useMotion } from './ui';
import { staggerDelay } from './motion';

type Tile = { label: string; value: number; unit: 'people' | 'parties' | 'items'; view: Section; filters?: Partial<GuestFilters>; tone?: 'warn' | 'bad' | 'good' };

export function OverviewSection(props: SectionProps) {
  const { data, rows, now, go, canView } = props;
  const motion = useMotion();
  const s = summarize(rows, data);
  const tz = data.event.timezone;
  const today = localDate(now, tz);
  const t = daysBetween(today, data.event.startsOn);
  const tiles: Tile[] = [
    { label: 'People invited', value: s.invitedPeople, unit: 'people', view: 'guests' },
    { label: 'Parties / households', value: s.parties, unit: 'parties', view: 'guests' },
    { label: 'Confirmed people', value: s.confirmedPeople, unit: 'people', view: 'guests', filters: { person: 'confirmed' }, tone: 'good' },
    { label: 'Tentative people', value: s.tentativePeople, unit: 'people', view: 'guests', filters: { person: 'tentative' } },
    { label: 'Declined people', value: s.declinedPeople, unit: 'people', view: 'guests', filters: { person: 'declined' } },
    { label: 'Awaiting confirmation', value: s.awaitingPeople, unit: 'people', view: 'guests', filters: { person: 'awaiting' }, tone: 'warn' },
    { label: 'Unanswered contacts', value: s.unansweredParties, unit: 'parties', view: 'guests', filters: { contact: 'no-response' } },
    { label: 'Overdue follow-ups', value: s.overdueFollowUps, unit: 'parties', view: 'guests', filters: { followUp: 'overdue' }, tone: s.overdueFollowUps ? 'bad' : undefined },
    { label: 'Follow-ups due today', value: s.dueToday, unit: 'parties', view: 'guests', filters: { followUp: 'today' } },
    { label: 'Missing travel details', value: s.missingTravel, unit: 'parties', view: 'guests', filters: { travel: 'missing' }, tone: s.missingTravel ? 'warn' : undefined },
    { label: 'Outstanding pickups / drops', value: s.outstandingTransfers, unit: 'items', view: 'movements' },
    { label: 'Stay requests', value: s.stayRequests, unit: 'items', view: 'rooming' },
    { label: 'Rooms allocated', value: s.allocatedRooms, unit: 'items', view: 'rooming' },
    { label: 'Room / capacity exceptions', value: s.roomExceptions, unit: 'items', view: 'rooming', tone: s.roomExceptions ? 'bad' : undefined },
    { label: 'Document-policy queue', value: s.documentQueue, unit: 'items', view: 'documents' },
    { label: 'Parties needing attention', value: s.attention, unit: 'parties', view: 'guests', filters: { attention: 'yes' }, tone: s.attention ? 'warn' : undefined },
  ];
  const attention = sortRows(rows.filter((r) => r.attention.length), 'attention').slice(0, 6);
  const changes = rows
    .flatMap((r) => r.party.changes.map((c) => ({ c, r })))
    .sort((a, b) => b.c.at.localeCompare(a.c.at))
    .slice(0, 6);
  const fnCounts = functionCounts(data);

  return (
    <div className={styles.stack}>
      <section className={`${styles.eventHero} ${styles.reveal}`} aria-labelledby="event-identity">
        <IllustrativeImage image={{ id: `rsvp-hero-${data.event.id}`, mediaId: data.event.imageId, alt: `Illustrative setting for ${data.event.name}`, provenance: 'Unsplash preview media via data/media' }} eager />
        <div className={styles.eventHeroCopy}>
          <p className={styles.kickerDark}>{data.event.hosts}</p>
          <h2 id="event-identity">{data.event.name}</h2>
          <p>
            {data.event.city} · {data.functions.length} functions from {formatDay(data.event.startsOn)} · {tz}
          </p>
          <p className={styles.heroCountdown}>{t > 0 ? `T-${t} days` : t === 0 ? 'Function day' : `${-t} days after start`}</p>
          <p className={styles.meta}>RSVP closes {formatExact(data.event.rsvpClosesAt, tz)}</p>
        </div>
      </section>

      <section aria-labelledby="metrics-heading">
        <div className={styles.sectionHead}>
          <h2 id="metrics-heading">Where things stand</h2>
          <p className={styles.meta}>People and households are counted separately. Every figure opens the records behind it.</p>
        </div>
        <ul className={styles.tiles}>
          {tiles.map((tile, i) => {
            const enabled = canView(tile.view);
            const content = (
              <>
                <span className={styles.tileValue} key={tile.value}>
                  {tile.value}
                </span>
                <span className={styles.tileLabel}>{tile.label}</span>
                <span className={styles.tileUnit}>{tile.unit}</span>
              </>
            );
            return (
              <li key={tile.label} className={styles.staggerItem} style={{ '--delay': `${staggerDelay(i, motion)}ms` } as CSSProperties}>
                {enabled ? (
                  <button type="button" className={`${styles.tile} ${tile.tone ? styles[`tile_${tile.tone}`] : ''}`} onClick={() => go(tile.view, { filters: tile.filters ?? {} })}>
                    {content}
                  </button>
                ) : (
                  <div className={`${styles.tile} ${styles.tileDisabled}`}>
                    {content}
                    <span className={styles.meta}>Not available for your role or package</span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="fn-heading" className={styles.panel}>
        <h2 id="fn-heading">Function-wise responses (people)</h2>
        <section className={styles.tableWrap} aria-label="Function-wise responses table" data-lenis-prevent>
          <table className={styles.table}>
            <caption className={styles.srOnly}>People response counts per function. Bars are a visual aid for the same numbers.</caption>
            <thead>
              <tr>
                <th scope="col">Function</th>
                <th scope="col">Invited</th>
                <th scope="col">Confirmed</th>
                <th scope="col">Tentative</th>
                <th scope="col">Declined</th>
                <th scope="col">Awaiting</th>
                <th scope="col" aria-hidden>
                  <span className={styles.srOnly}>Distribution</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {fnCounts.map(({ fn, invited, counts }) => (
                <tr key={fn.id}>
                  <th scope="row">
                    <button type="button" className={styles.linkBtn} onClick={() => go('guests', { filters: { functionId: fn.id } })}>
                      {fn.name}
                    </button>
                    <span className={styles.meta}> {formatExact(fn.startsAt, tz)}</span>
                  </th>
                  <td>{invited}</td>
                  <td>{counts.confirmed}</td>
                  <td>{counts.tentative}</td>
                  <td>{counts.declined + counts.cancelled}</td>
                  <td>{counts.awaiting}</td>
                  <td aria-hidden>
                    <span className={styles.bar}>
                      {(['confirmed', 'tentative', 'declined', 'awaiting'] as const).map((k) => (
                        <span key={k} className={styles[`bar_${k}`]} style={{ width: `${invited ? ((k === 'declined' ? counts.declined + counts.cancelled : counts[k]) / invited) * 100 : 0}%` }} />
                      ))}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </section>

      <div className={styles.twoCol}>
        <section aria-labelledby="attn-heading" className={styles.panel}>
          <h2 id="attn-heading">
            <AlertTriangle size={18} aria-hidden /> Needs attention
          </h2>
          {attention.length === 0 ? (
            <p>Nothing needs attention right now.</p>
          ) : (
            <ul className={styles.attnList}>
              {attention.map((r) => (
                <li key={r.party.id}>
                  <button type="button" className={styles.rowLink} onClick={() => go('guests', { party: r.party.id })} disabled={!canView('guests')}>
                    <strong className={styles.wrap}>{r.party.displayName}</strong>
                    <span className={styles.meta}>{r.party.ref}</span>
                    <span className={styles.reasons}>{r.attention.map((a) => ATTENTION_LABEL[a]).join(' · ')}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {canView('guests') && (
            <button type="button" className={styles.btnSecondary} onClick={() => go('guests', { filters: { attention: 'yes' } })}>
              See all {s.attention} parties needing attention <ArrowRight size={14} aria-hidden />
            </button>
          )}
        </section>
        <section aria-labelledby="changes-heading" className={styles.panel}>
          <h2 id="changes-heading">
            <History size={18} aria-hidden /> Recent meaningful changes
          </h2>
          {changes.length === 0 ? (
            <p>No changes recorded yet.</p>
          ) : (
            <ul className={styles.changeList}>
              {changes.map(({ c, r }) => (
                <li key={c.id}>
                  <p>
                    <strong className={styles.wrap}>{r.party.displayName}</strong> · {c.field}
                  </p>
                  <p className={styles.beforeAfter}>
                    <span>
                      <span className={styles.srOnly}>Before: </span>
                      {displayValue(c.before, tz)}
                    </span>
                    <ArrowRight size={13} aria-hidden />
                    <span>
                      <span className={styles.srOnly}>After: </span>
                      {displayValue(c.after, tz)}
                    </span>
                  </p>
                  <p className={styles.meta}>
                    {c.actor} · <Stamp iso={c.at} timeZone={tz} now={now} />
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

/** Shows ISO instants from change records in the event timezone. */
export function displayValue(v: string, tz: string) {
  return /^\d{4}-\d{2}-\d{2}T/.test(v) ? formatExact(v, tz) : v;
}

export function TodaySection(props: SectionProps) {
  const { data, rows, now, go, canView } = props;
  const tz = data.event.timezone;
  const today = localDate(now, tz);
  const fnsToday = data.functions.filter((f) => localDate(f.startsAt, tz) === today);
  const nextFn = data.functions.find((f) => Date.parse(f.startsAt) > now);
  const dueNow = sortRows(rows.filter((r) => r.followUp === 'overdue' || r.followUp === 'today'), 'follow-up');
  const legsToday = data.legs.filter((l) => l.at && localDate(l.at, tz) === today).sort((a, b) => (a.at ?? '').localeCompare(b.at ?? ''));
  const party = (id: string) => rows.find((r) => r.party.id === id);
  const checkIns = data.stays.filter((s) => s.checkIn === today && s.state !== 'not-required');

  return (
    <div className={styles.stack}>
      <section className={styles.panel} aria-labelledby="today-fn">
        <h2 id="today-fn">
          <CalendarCheck size={18} aria-hidden /> {formatDay(today)} in {data.event.city}
        </h2>
        {fnsToday.length ? (
          <ul className={styles.fnList}>
            {fnsToday.map((f) => (
              <li key={f.id}>
                <strong>{formatTime(f.startsAt, tz)}</strong> {f.name} · {f.venue} · Dress: {f.dressCode}
              </li>
            ))}
          </ul>
        ) : (
          <p>
            No function today.{' '}
            {nextFn ? (
              <>
                Next: <strong>{nextFn.name}</strong>, {formatExact(nextFn.startsAt, tz)}.
              </>
            ) : (
              'All functions have taken place.'
            )}
          </p>
        )}
      </section>

      <section className={styles.panel} aria-labelledby="today-follow">
        <h2 id="today-follow">Follow-ups due now ({dueNow.length} parties)</h2>
        {dueNow.length === 0 ? (
          <p>No follow-ups are due or overdue. Nice.</p>
        ) : (
          <ul className={styles.attnList}>
            {dueNow.slice(0, 8).map((r) => (
              <li key={r.party.id}>
                <button type="button" className={styles.rowLink} onClick={() => go(canView('calls') ? 'calls' : 'guests', { party: r.party.id })}>
                  <strong className={styles.wrap}>{r.party.displayName}</strong>
                  <Tag tone={r.followUp === 'overdue' ? 'bad' : 'warn'}>{r.followUp === 'overdue' ? 'Overdue' : 'Due today'}</Tag>
                  <span className={styles.meta}>
                    {r.party.followUpReason} · {r.party.assignedCaller}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {dueNow.length > 8 && canView('calls') && (
          <button type="button" className={styles.btnSecondary} onClick={() => go('calls')}>
            Open the calling queue ({dueNow.length})
          </button>
        )}
      </section>

      <div className={styles.twoCol}>
        <section className={styles.panel} aria-labelledby="today-moves">
          <h2 id="today-moves">
            <Plane size={18} aria-hidden /> Arrivals and departures today
          </h2>
          {legsToday.length === 0 ? (
            <p>No travel legs today.</p>
          ) : (
            <ul className={styles.plainList}>
              {legsToday.map((l) => {
                const r = party(l.partyId);
                const t = data.transfers.find((x) => x.legId === l.id);
                return (
                  <li key={l.id}>
                    <strong>{formatTime(l.at as string, tz)}</strong> {l.direction === 'arrival' ? 'Arrives' : 'Departs'} · {r?.party.displayName} · {TRAVEL_MODE_LABEL[l.mode]} {l.reference}
                    {t && <span className={styles.meta}> · {TRANSFER_LABEL[t.state]}</span>}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <section className={styles.panel} aria-labelledby="today-stays">
          <h2 id="today-stays">Check-ins today</h2>
          {checkIns.length === 0 ? <p>No check-ins scheduled today.</p> : <p>{checkIns.length} stays check in today.</p>}
          {checkIns.length > 0 && canView('rooming') && (
            <button type="button" className={styles.btnSecondary} onClick={() => go('rooming')}>
              Open rooming
            </button>
          )}
        </section>
      </div>
      {!canView('guests') && <StatePanel title="Limited view" headingLevel={3}><p>Your role shows only the information needed for your work.</p></StatePanel>}
    </div>
  );
}
