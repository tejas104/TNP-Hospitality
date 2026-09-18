'use client';

import { ArrowRight, CalendarClock, Phone, UserRound } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import type { Command } from './adapter';
import { isoToZonedLocal, zonedToIso } from './dates';
import { ATTENTION_LABEL, sortRows, type PartyRow } from './logic';
import { CALL_OUTCOME_LABEL, PRIORITY_LABEL, type CallOutcome, type Party } from './model';
import type { SectionProps } from './types';
import { ActionError, CopyRef, ErrorSummary, FieldError, PendingLabel, Stamp, StatePanel, Tag, fieldProps, styles, useEventMutation } from './ui';

export function queueRows(rows: PartyRow[]) {
  // Declined-contact parties leave the queue; everything else with open work stays, overdue first.
  return sortRows(
    rows.filter((r) => r.party.calls[0]?.outcome !== 'declined-contact' && (r.party.followUpDueAt || r.party.contact !== 'recorded')),
    'follow-up',
  );
}

export function CallsSection({ data, rows, now, can, go, selectedParty }: SectionProps) {
  const tz = data.event.timezone;
  const [assignee, setAssignee] = useState('all');
  // URL selection is authoritative on refresh and browser history navigation.
  const currentId = rows.some((r) => r.party.id === selectedParty) ? selectedParty : null;
  const [position, setPosition] = useState(0);
  const queue = useMemo(() => {
    const base = queueRows(rows).filter((r) => assignee === 'all' || r.party.assignedCaller === assignee);
    // Keep the party being worked on in place (with its receipt) until the caller moves on.
    const pinned = currentId && !base.some((r) => r.party.id === currentId) ? rows.find((r) => r.party.id === currentId) : null;
    if (pinned) base.splice(Math.min(position, base.length), 0, pinned);
    return base;
  }, [rows, assignee, currentId, position]);
  const leaving = (id: string) => !queueRows(rows).some((r) => r.party.id === id);
  const callers = [...new Set(rows.map((r) => r.party.assignedCaller))].sort();

  // Preserve queue position: keep the current party, or fall back to the same position.
  const index = currentId ? queue.findIndex((r) => r.party.id === currentId) : -1;
  const current = index >= 0 ? queue[index] : queue[0];

  const moveTo = (i: number) => {
    const next = queue[i];
    if (!next) return;
    setPosition(i);
    go('calls', { party: next.party.id });
    window.setTimeout(() => document.getElementById('call-card-title')?.focus(), 20);
  };

  if (!can('record-call')) {
    return (
      <StatePanel tone="locked" title="The calling queue is not available for your role">
        <p>Calling agents and coordinators work this queue.</p>
      </StatePanel>
    );
  }

  const currentPos = current ? queue.indexOf(current) : -1;

  return (
    <div className={styles.stack}>
      <div className={styles.toolbar}>
        <label className={styles.inlineField}>
          <span>Assigned caller</span>
          <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
            <option value="all">Everyone</option>
            {callers.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <output className={styles.resultCount}>
          {queue.filter((r) => !leaving(r.party.id)).length} parties in queue · {queue.filter((r) => r.followUp === 'overdue').length} overdue
        </output>
      </div>
      <p className={styles.meta}>This preview does not dial phones, send messages or lock records. Two people could open the same guest; coordinate assignments.</p>
      {queue.length === 0 ? (
        <StatePanel title="Queue is clear" headingLevel={3}>
          <p>No party has an open follow-up{assignee !== 'all' ? ` for ${assignee}` : ''}.</p>
        </StatePanel>
      ) : (
        <div className={styles.queueLayout}>
          <ol className={styles.queueList} aria-label="Calling queue" data-lenis-prevent>
            {queue.map((r, i) => (
              <li key={r.party.id}>
                <button type="button" className={styles.queueItem} aria-current={current?.party.id === r.party.id ? 'true' : undefined} onClick={() => moveTo(i)}>
                  <span className={styles.wrap}>
                    <strong>{r.party.displayName}</strong>
                  </span>
                  <span className={styles.meta}>
                    {r.party.language} · {r.party.assignedCaller}
                  </span>
                  <span>
                    {r.followUp === 'overdue' && <Tag tone="bad">Overdue</Tag>}
                    {r.followUp === 'today' && <Tag tone="warn">Today</Tag>}
                    {r.followUp === 'upcoming' && <Tag tone="muted">Upcoming</Tag>}
                    {leaving(r.party.id) ? <Tag tone="good">Done — leaves queue</Tag> : r.followUp === 'none' && <Tag tone="muted">No time set</Tag>}
                    {r.party.priority !== 'standard' && <Tag tone="info">{PRIORITY_LABEL[r.party.priority]}</Tag>}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          {current && (
            <CallCard
              key={current.party.id}
              row={current}
              tz={tz}
              now={now}
              position={currentPos}
              total={queue.length}
              eventName={data.event.name}
              onNext={() => moveTo(Math.min(currentPos + 1, queue.length - 1))}
              onProfile={() => go('guests', { party: current.party.id })}
            />
          )}
        </div>
      )}
    </div>
  );
}

function CallCard({
  row,
  tz,
  now,
  position,
  total,
  eventName,
  onNext,
  onProfile,
}: {
  row: PartyRow;
  tz: string;
  now: number;
  position: number;
  total: number;
  eventName: string;
  onNext: () => void;
  onProfile: () => void;
}) {
  const p = row.party;
  const last = p.calls[0];
  const [outcome, setOutcome] = useState<CallOutcome | ''>('');
  const [note, setNote] = useState('');
  const [next, setNext] = useState('');
  const [errors, setErrors] = useState<Array<{ id: string; message: string }>>([]);
  const [attempt, setAttempt] = useState(0);
  const [receipt, setReceipt] = useState<{ at: string; actor: string; outcome: CallOutcome; replayed: boolean } | null>(null);
  const [reschedule, setReschedule] = useState(false);
  const noteId = useId();

  const record = useEventMutation<Party>(
    () =>
      outcome
        ? ({ type: 'record-call', partyId: p.id, baseVersion: p.version, outcome, note: note.trim(), nextDueAt: next ? zonedToIso(next, tz) : null } satisfies Command)
        : null,
    (party, replayed) => {
      const c = party.calls[0];
      setReceipt({ at: c.at, actor: c.actor, outcome: c.outcome, replayed });
      setOutcome('');
      setNote('');
      setNext('');
    },
    (_v, replayed) => (replayed ? 'Outcome already recorded — confirmed without a duplicate entry.' : 'Call outcome recorded.'),
  );
  const move = useEventMutation<Party>(
    () => (next ? ({ type: 'reschedule', partyId: p.id, baseVersion: p.version, dueAt: zonedToIso(next, tz) as string } satisfies Command) : null),
    () => {
      setReschedule(false);
      setNext('');
    },
    () => 'Follow-up rescheduled. No call attempt was recorded.',
  );

  const submit = () => {
    const errs: Array<{ id: string; message: string }> = [];
    if (!outcome) errs.push({ id: 'call-outcome', message: 'Choose the call outcome.' });
    if (outcome === 'callback-requested' && !next) errs.push({ id: 'call-next', message: 'A callback needs a follow-up date and time.' });
    setErrors(errs);
    setAttempt((a) => a + 1);
    if (!errs.length) void record.start();
  };

  return (
    <article className={styles.callCard} aria-labelledby="call-card-title">
      <header className={styles.detailHead}>
        <div>
          <p className={styles.kickerDark}>
            Guest {position + 1} of {total} · {eventName}
          </p>
          <h2 id="call-card-title" tabIndex={-1} className={styles.wrap}>
            {p.displayName}
          </h2>
          <p className={styles.meta}>
            <CopyRef value={p.ref} /> · {p.language} · {PRIORITY_LABEL[p.priority]} · {row.people} people, {row.statusCounts.awaiting} awaiting
          </p>
        </div>
      </header>
      <dl className={styles.facts}>
        <div>
          <dt>
            <Phone size={13} aria-hidden /> Number (dial from your own phone)
          </dt>
          <dd>{p.phone || 'Not recorded'}</dd>
        </div>
        <div>
          <dt>Last contact</dt>
          <dd>{last ? <Stamp iso={last.at} timeZone={tz} now={now} /> : 'Never'}</dd>
        </div>
        <div>
          <dt>Last outcome</dt>
          <dd>{last ? CALL_OUTCOME_LABEL[last.outcome] : '—'}</dd>
        </div>
        <div>
          <dt>Next follow-up</dt>
          <dd>{p.followUpDueAt ? <Stamp iso={p.followUpDueAt} timeZone={tz} now={now} /> : 'None scheduled'}</dd>
        </div>
        <div>
          <dt>Why in queue</dt>
          <dd>{[p.followUpReason, ...row.attention.map((a) => ATTENTION_LABEL[a])].filter(Boolean).join(' · ') || 'Response not yet recorded'}</dd>
        </div>
        {p.notes && (
          <div>
            <dt>Internal note</dt>
            <dd>{p.notes}</dd>
          </div>
        )}
      </dl>
      {receipt && (
        <output className={styles.receipt}>
          {receipt.replayed ? 'Confirmed earlier record: ' : 'Recorded: '}
          <strong>{CALL_OUTCOME_LABEL[receipt.outcome]}</strong> by {receipt.actor} · <Stamp iso={receipt.at} timeZone={tz} now={now} />
        </output>
      )}
      <form
        className={styles.form}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <ErrorSummary errors={errors} focusKey={attempt} title="Before recording" />
        <label className={styles.field}>
          <span>Outcome *</span>
          <select {...fieldProps('call-outcome', errors)} value={outcome} onChange={(e) => setOutcome(e.target.value as CallOutcome)}>
            <option value="">Choose an outcome</option>
            {Object.entries(CALL_OUTCOME_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          <FieldError id="call-outcome" errors={errors} />
        </label>
        <label className={styles.field} htmlFor={noteId}>
          <span>Note (safe internal text only)</span>
          <textarea id={noteId} rows={2} value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} />
        </label>
        <label className={styles.field}>
          <span>Next follow-up ({tz}){outcome === 'callback-requested' ? ' *' : ''}</span>
          <input {...fieldProps('call-next', errors)} type="datetime-local" value={next} min={isoToZonedLocal(new Date(now).toISOString(), tz)} onChange={(e) => setNext(e.target.value)} />
          <FieldError id="call-next" errors={errors} />
        </label>
        {outcome === 'answered' && (
          <p className={styles.meta}>
            Answered is not an RSVP. Record each person’s function answers in the{' '}
            <button type="button" className={styles.linkBtn} onClick={onProfile}>
              party profile
            </button>
            .
          </p>
        )}
        {outcome === 'declined-contact' && <p className={styles.meta}>The party leaves the queue. This is a contact preference, not a declined RSVP.</p>}
        <ActionError status={record.status} onRetry={record.retry} onNew={record.start} />
        <div className={styles.formActions}>
          <button type="submit" className={styles.btnPrimary} disabled={record.status.phase === 'pending'}>
            <PendingLabel pending={record.status.phase === 'pending'} idle="Record outcome" busy="Recording…" />
          </button>
          <button type="button" className={styles.btnSecondary} onClick={onNext} disabled={position >= total - 1}>
            Next guest <ArrowRight size={14} aria-hidden />
          </button>
          <button type="button" className={styles.btnGhost} onClick={() => setReschedule((v) => !v)} aria-expanded={reschedule}>
            <CalendarClock size={14} aria-hidden /> Reschedule
          </button>
          <button type="button" className={styles.btnGhost} onClick={onProfile}>
            <UserRound size={14} aria-hidden /> View profile
          </button>
        </div>
        {reschedule && (
          <div className={styles.reviewBox}>
            <p>Move the follow-up without recording a call. Choose the new time above, then confirm.</p>
            <ActionError status={move.status} onRetry={move.retry} onNew={move.start} />
            <button type="button" className={styles.btnPrimary} disabled={!next || move.status.phase === 'pending'} onClick={() => void move.start()}>
              <PendingLabel pending={move.status.phase === 'pending'} idle="Confirm new follow-up time" busy="Saving…" />
            </button>
          </div>
        )}
      </form>
    </article>
  );
}
