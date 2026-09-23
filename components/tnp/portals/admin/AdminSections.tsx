'use client';
import { useRef, useState } from 'react';
import {
  Check,
  FileSpreadsheet,
  FileText,
  Plus,
  Star,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import { GenieWindow } from '../../public/portal-launcher/PortalLauncher';
import {
  ACTOR,
  approveApplicant,
  approveEarning,
  collectionStatus,
  COORDINATOR_ACTOR,
  earningLines,
  earnings,
  FINANCE_ACTOR,
  quoteFromRequest,
  quoteTotals,
  RATE_CARD,
  rupees,
  type AdminState,
  type Attendance,
  type EventStatus,
  type Freelancer,
  type Quotation,
  type Role,
} from './adminData';
import { download, toPdf, toXlsx } from './exporters';
import { Card, REPORT_NOTE } from './adminUi';
import type { SectionProps } from './AdminConsole';
import styles from './AdminConsole.module.css';

const ROLES = Object.keys(RATE_CARD) as Role[];
const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);
const nameOf = (state: AdminState, id: string) =>
  state.freelancers.find((f) => f.id === id)?.name ?? id;

function Stars({ value }: { value: number }) {
  return (
    <span className={styles.stars} aria-label={`Sample rating ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          aria-hidden="true"
          fill={n <= Math.round(value) ? 'currentColor' : 'none'}
        />
      ))}
      <b>{value.toFixed(1)}</b>
    </span>
  );
}

/* ---------------- Events & assignments ---------------- */
export function EventsSection({ state, update, focus }: SectionProps) {
  const [filter, setFilter] = useState<EventStatus | 'all'>('all');
  const [selected, setSelected] = useState(focus || state.events[0].id);
  const [draft, setDraft] = useState({ role: 'Hostess' as Role, quantity: '2', days: '1', rate: '2500', notes: '' });
  const [error, setError] = useState('');
  const event = state.events.find((e) => e.id === selected) ?? state.events[0];
  const assignments = state.assignments.filter((a) => a.eventId === event.id);
  const shown = state.events.filter((e) => filter === 'all' || e.status === filter);
  const quote = state.quotations.find((q) => q.client === event.client);
  const setAssignment = (id: string, change: (a: AdminState['assignments'][number]) => AdminState['assignments'][number], message: string) => {
    try {
      const next = change(state.assignments.find((a) => a.id === id)!);
      update((s) => ({ ...s, assignments: s.assignments.map((a) => (a.id === id ? next : a)) }), message);
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <div className={styles.stack}>
      <div className={styles.segmented} aria-label="Filter events">
        {(['all', 'ongoing', 'upcoming', 'finished'] as const).map((f) => (
          <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All events' : f[0].toUpperCase() + f.slice(1)}
            <b>{f === 'all' ? state.events.length : state.events.filter((e) => e.status === f).length}</b>
          </button>
        ))}
      </div>
      <div className={styles.master}>
        <div className={styles.masterList}>
          {shown.map((e) => (
            <button
              key={e.id}
              type="button"
              className={styles.eventCard}
              aria-pressed={e.id === event.id}
              onClick={() => setSelected(e.id)}
            >
              <span className={styles.chip} data-tone={e.status}>{e.status}</span>
              <strong>{e.name}</strong>
              <small>{e.city} · {e.start}</small>
            </button>
          ))}
        </div>
        <div className={styles.stack}>
          <Card aria-labelledby="event-detail">
            <div className={styles.cardHead}>
              <div>
                <span className={styles.chip} data-tone={event.status}>{event.status}</span>
                <h2 id="event-detail">{event.name}</h2>
              </div>
              <small className={styles.muted}>{event.id}</small>
            </div>
            <dl className={styles.facts}>
              <div><dt>Client</dt><dd>{event.client}</dd></div>
              <div><dt>Venue</dt><dd>{event.venue}, {event.city}</dd></div>
              <div><dt>Dates</dt><dd>{event.start}{event.end !== event.start ? ` → ${event.end}` : ''}</dd></div>
              <div><dt>Guests</dt><dd>{event.guests}</dd></div>
              <div><dt>Functions</dt><dd>{event.functions.join(', ')}</dd></div>
              <div><dt>RSVP</dt><dd>{event.rsvpEnabled ? 'Enabled (sample)' : 'Not enabled'}</dd></div>
              <div><dt>Quotation</dt><dd>{quote ? `${quote.id} · ${quote.status}` : 'None yet'}</dd></div>
            </dl>
          </Card>
          <Card aria-labelledby="assign-title">
            <h2 id="assign-title">Assignments freelancers can apply to</h2>
            <p className={styles.muted}>
              Each assignment is a role with a number of places. Freelancers apply;
              you approve up to the number of places.
            </p>
            {error && <p className={styles.error} role="alert">{error}</p>}
            {assignments.length === 0 && <p className={styles.empty}>No assignments yet. Create the first one below.</p>}
            {assignments.map((a) => (
              <article key={a.id} className={styles.assignment}>
                <header>
                  <strong>{a.role}</strong>
                  <span className={styles.chip} data-tone={a.approved.length >= a.quantity ? 'finished' : 'upcoming'}>
                    {a.approved.length}/{a.quantity} approved
                  </span>
                  <small>{rupees(a.dayRatePaise)} / day · {a.days} day{a.days > 1 ? 's' : ''}</small>
                </header>
                {a.notes && <p className={styles.muted}>{a.notes}</p>}
                <ul className={styles.applicants}>
                  {a.applicants.length === 0 && <li className={styles.empty}>No applications yet.</li>}
                  {a.applicants.map((id) => {
                    const f = state.freelancers.find((x) => x.id === id)!;
                    const approved = a.approved.includes(id);
                    return (
                      <li key={id}>
                        <span className={styles.avatar} aria-hidden="true">{initials(f.name)}</span>
                        <div>
                          <strong>{f.name}</strong>
                          <Stars value={f.rating} />
                        </div>
                        {approved ? (
                          <button type="button" className={styles.small} onClick={() => setAssignment(a.id, (x) => ({ ...x, approved: x.approved.filter((y) => y !== id) }), `${f.name} removed from ${a.role} on ${event.name}.`)}>
                            <X size={15} aria-hidden="true" /> Remove
                          </button>
                        ) : (
                          <button type="button" className={styles.primarySmall} disabled={event.status === 'finished'} onClick={() => setAssignment(a.id, (x) => approveApplicant(x, id), `${f.name} approved as ${a.role} for ${event.name}.`)}>
                            <Check size={15} aria-hidden="true" /> Approve
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
                {event.status !== 'finished' && (
                  <button
                    type="button"
                    className={styles.linkButton}
                    onClick={() => {
                      const pool = state.freelancers.filter((f) => f.role === a.role && !a.applicants.includes(f.id));
                      if (!pool.length) {
                        setError(`No more sample ${a.role}s available to apply.`);
                        return;
                      }
                      setAssignment(a.id, (x) => ({ ...x, applicants: [...x.applicants, pool[0].id] }), `${pool[0].name} applied to ${a.role} (simulated).`);
                    }}
                  >
                    Simulate a new application
                  </button>
                )}
              </article>
            ))}
          </Card>
          {event.status !== 'finished' && (
            <Card aria-labelledby="create-assign">
              <h2 id="create-assign">Create an assignment</h2>
              <form
                className={styles.formGrid}
                onSubmit={(e) => {
                  e.preventDefault();
                  const quantity = Number(draft.quantity);
                  const days = Number(draft.days);
                  const rate = Math.round(Number(draft.rate) * 100);
                  if (!(quantity >= 1 && quantity <= 200) || !(days >= 1 && days <= 30) || !(rate > 0)) {
                    setError('Enter places (1–200), days (1–30) and a day rate above ₹0.');
                    return;
                  }
                  update((s) => ({
                    ...s,
                    assignments: [...s.assignments, { id: `as-${Date.now()}`, eventId: event.id, role: draft.role, quantity, days, dayRatePaise: rate, notes: draft.notes.trim(), applicants: [], approved: [] }],
                  }), `${quantity} × ${draft.role} assignment published for ${event.name} (sample — no notifications sent).`);
                  setError('');
                  setDraft({ ...draft, quantity: '2', notes: '' });
                }}
              >
                <label>Role
                  <select value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as Role, rate: String(RATE_CARD[e.target.value as Role] / 100) })}>
                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </label>
                <label>Places<input type="number" min="1" max="200" value={draft.quantity} onChange={(e) => setDraft({ ...draft, quantity: e.target.value })} /></label>
                <label>Days<input type="number" min="1" max="30" value={draft.days} onChange={(e) => setDraft({ ...draft, days: e.target.value })} /></label>
                <label>Day rate (₹)<input type="number" min="1" value={draft.rate} onChange={(e) => setDraft({ ...draft, rate: e.target.value })} /></label>
                <label className={styles.wide}>Instructions for freelancers<input value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} placeholder="Reporting point, dress code, languages" /></label>
                <button type="submit" className={styles.primary}><Plus size={17} aria-hidden="true" /> Publish assignment</button>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Applications ---------------- */
export function ApplicationsSection({ state, update }: SectionProps) {
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [reason, setReason] = useState<Record<string, string>>({});
  const list = state.applications.filter((a) => a.status === tab);
  const decide = (id: string, status: 'approved' | 'rejected') => {
    const app = state.applications.find((a) => a.id === id)!;
    update((s) => {
      const applications = s.applications.map((a) => (a.id === id ? { ...a, status, decisionReason: reason[id] || undefined } : a));
      const freelancers = status === 'approved'
        ? [...s.freelancers, { id: `fl-${id}`, name: app.name, role: app.role, city: app.city, experienceYears: app.experienceYears, languages: ['Hindi', 'English'], rating: 0, ratings: [], status: 'active' as const }]
        : s.freelancers;
      return { ...s, applications, freelancers };
    }, status === 'approved' ? `${app.name} approved — now listed under Freelancers (sample, no message sent).` : `${app.name}'s application rejected (sample).`);
  };
  return (
    <div className={styles.stack}>
      <div className={styles.segmented} aria-label="Application status">
        {(['pending', 'approved', 'rejected'] as const).map((t) => (
          <button key={t} type="button" aria-pressed={tab === t} onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)}
            <b>{state.applications.filter((a) => a.status === t).length}</b>
          </button>
        ))}
      </div>
      {list.length === 0 && <Card><p className={styles.empty}>No {tab} applications.</p></Card>}
      <div className={styles.cardGrid}>
        {list.map((a) => (
          <Card key={a.id} className={styles.appCard}>
            <div className={styles.personHead}>
              <span className={styles.avatar} aria-hidden="true">{initials(a.name)}</span>
              <div>
                <strong>{a.name}</strong>
                <small>{a.role} · {a.city}</small>
              </div>
            </div>
            <dl className={styles.facts}>
              <div><dt>Experience</dt><dd>{a.experienceYears} yrs</dd></div>
              <div><dt>Assessment</dt><dd>{a.assessment}/100</dd></div>
              <div><dt>Applied</dt><dd>{a.appliedOn}</dd></div>
            </dl>
            <span className={styles.meter} aria-hidden="true"><i style={{ width: `${a.assessment}%` }} /></span>
            <p className={styles.muted}>{a.note}</p>
            {a.status === 'pending' ? (
              <>
                <label className={styles.compactLabel}>
                  Note for the decision (optional)
                  <input value={reason[a.id] ?? ''} onChange={(e) => setReason({ ...reason, [a.id]: e.target.value })} placeholder="e.g. Strong guest-facing experience" />
                </label>
                <div className={styles.row}>
                  <button type="button" className={styles.primary} onClick={() => decide(a.id, 'approved')}><Check size={17} aria-hidden="true" /> Approve freelancer</button>
                  <button type="button" className={styles.ghost} onClick={() => decide(a.id, 'rejected')}><X size={17} aria-hidden="true" /> Reject</button>
                </div>
              </>
            ) : (
              <p className={styles.decision}>{a.status === 'approved' ? 'Approved' : 'Rejected'}{a.decisionReason ? ` · ${a.decisionReason}` : ''}</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Freelancers & profiles ---------------- */
export function PeopleSection({ state, focus }: SectionProps) {
  const [query, setQuery] = useState('');
  // Opening from search (focus = freelancer id) shows that profile directly.
  const [open, setOpen] = useState<Freelancer | null>(
    () => state.freelancers.find((f) => f.id === focus) ?? null,
  );
  const source = useRef<HTMLElement | null>(null);
  const list = state.freelancers.filter((f) => `${f.name} ${f.role} ${f.city}`.toLowerCase().includes(query.toLowerCase()));
  const history = (id: string) =>
    state.assignments
      .filter((a) => a.approved.includes(id))
      .map((a) => ({ a, event: state.events.find((e) => e.id === a.eventId)! }));
  return (
    <div className={styles.stack}>
      <label className={styles.search}>
        Search freelancers
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, role or city" />
      </label>
      <div className={styles.cardGrid}>
        {list.map((f) => {
          const h = history(f.id);
          const attended = h.filter(({ event }) => ['appeared', 'late'].includes(event.attendance[f.id] ?? '')).length;
          return (
            <button
              key={f.id}
              type="button"
              className={`${styles.glass} ${styles.personCard}`}
              onClick={(e) => {
                source.current = e.currentTarget;
                setOpen(f);
              }}
            >
              <span className={styles.personHead}>
                <span className={styles.avatar} aria-hidden="true">{initials(f.name)}</span>
                <span>
                  <strong>{f.name}</strong>
                  <small>{f.role} · {f.city}</small>
                </span>
              </span>
              {f.rating ? <Stars value={f.rating} /> : <small>New · not yet rated</small>}
              <small>{h.length} events · {attended} attended · {f.experienceYears} yrs experience</small>
              {f.status === 'under-review' && <span className={styles.chip} data-tone="attention">Under review</span>}
            </button>
          );
        })}
      </div>
      <GenieWindow sourceRef={source} open={!!open} onClose={() => setOpen(null)} title="Freelancer profile" label="Close profile" align="end">
        {open && (
          <div className={styles.profile}>
            <div className={styles.personHead}>
              <span className={styles.avatarLarge} aria-hidden="true"><UserRound size={28} /></span>
              <div>
                <h2>{open.name}</h2>
                <small>{open.role} · {open.city} · {open.experienceYears} yrs</small>
              </div>
            </div>
            {open.rating ? <Stars value={open.rating} /> : <p className={styles.muted}>Not yet rated.</p>}
            <p className={styles.muted}>Languages: {open.languages.join(', ')}</p>
            {(() => {
              const e = earnings(state, open.id);
              return (
                <dl className={styles.facts}>
                  <div><dt>Earned (sample)</dt><dd>{rupees(e.earned)}</dd></div>
                  <div><dt>Paid</dt><dd>{rupees(e.paid)}</dd></div>
                  <div><dt>Remaining</dt><dd>{rupees(e.remaining)}</dd></div>
                </dl>
              );
            })()}
            <h3>Event history</h3>
            <ul className={styles.list}>
              {history(open.id).length === 0 && <li className={styles.empty}>No events yet.</li>}
              {history(open.id).map(({ a, event }) => (
                <li key={a.id}>
                  <div><strong>{event.name}</strong><small>{a.role} · {event.start}</small></div>
                  <span className={styles.chip} data-tone={event.attendance[open.id] ?? 'unmarked'}>{event.attendance[open.id] ?? 'unmarked'}</span>
                </li>
              ))}
            </ul>
            <h3>Ratings</h3>
            <ul className={styles.list}>
              {open.ratings.length === 0 && <li className={styles.empty}>No ratings recorded.</li>}
              {open.ratings.map((r) => (
                <li key={r.eventId}>
                  <div><strong>{state.events.find((e) => e.id === r.eventId)?.name}</strong><small>{r.note}</small></div>
                  <Stars value={r.score} />
                </li>
              ))}
            </ul>
            <p className={styles.muted}>Sample profile. Ratings trigger human review; nothing is decided automatically.</p>
          </div>
        )}
      </GenieWindow>
    </div>
  );
}

/* ---------------- Attendance ---------------- */
const MARKS: Attendance[] = ['appeared', 'late', 'absent', 'unmarked'];
export function AttendanceSection({ state, update }: SectionProps) {
  const candidates = state.events.filter((e) => e.status !== 'upcoming');
  const [eventId, setEventId] = useState(candidates[0]?.id ?? '');
  // A change to an already-marked person needs a reason (append-only history).
  const [pending, setPending] = useState<{ id: string; to: Attendance } | null>(null);
  const [reason, setReason] = useState('');
  const [replacing, setReplacing] = useState('');
  const event = state.events.find((e) => e.id === eventId);
  if (!event) return <Card><p className={styles.empty}>No events to show.</p></Card>;
  const rows = state.assignments
    .filter((a) => a.eventId === event.id)
    .flatMap((a) => a.approved.map((id) => ({ id, role: a.role, assignmentId: a.id })));
  const markOf = (id: string) => event.attendance[id] ?? 'unmarked';
  const count = (m: Attendance) => rows.filter((r) => markOf(r.id) === m).length;
  const setMark = (id: string, to: Attendance, why: string) => {
    const from = markOf(id);
    update(
      (s) => ({
        ...s,
        events: s.events.map((e) => (e.id === event.id ? { ...e, attendance: { ...e.attendance, [id]: to } } : e)),
        attendanceLog:
          from === 'unmarked'
            ? s.attendanceLog
            : [...s.attendanceLog, { id: `al-${Date.now()}`, eventId: event.id, freelancerId: id, from, to, reason: why, actor: ACTOR, at: new Date().toLocaleString('en-IN') }],
      }),
      from === 'unmarked'
        ? `${nameOf(state, id)} marked ${to} at ${event.name} (sample).`
        : `${nameOf(state, id)} corrected from ${from} to ${to} at ${event.name} — reason recorded.`,
    );
    setPending(null);
    setReason('');
  };
  const history = state.attendanceLog.filter((l) => l.eventId === event.id).slice().reverse();
  return (
    <div className={styles.stack}>
      <label className={styles.search}>
        Event
        <select value={eventId} onChange={(e) => { setEventId(e.target.value); setPending(null); setReplacing(''); }}>
          {candidates.map((e) => <option key={e.id} value={e.id}>{e.name} · {e.status}</option>)}
        </select>
      </label>
      <div className={styles.kpiGrid}>
        {MARKS.map((m) => (
          <Card key={m} className={styles.kpi} data-tone={m}>
            <strong>{count(m)}</strong>
            <span>{m === 'unmarked' ? 'Not marked' : m[0].toUpperCase() + m.slice(1)}</span>
          </Card>
        ))}
      </div>
      <Card>
        <h2>Who appeared at {event.name}</h2>
        <p className={styles.muted}>
          First marks save straight away. Changing a mark asks for a reason and keeps the original in the history below. Sample marks only — real attendance needs scan evidence.
        </p>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Freelancer</th><th>Role</th><th>Attendance</th><th>Action</th></tr></thead>
            <tbody>
              {rows.map((r) => {
                const current = markOf(r.id);
                const pool = state.freelancers.filter((f) => f.role === r.role && f.status === 'active' && !rows.some((x) => x.id === f.id));
                return (
                  <tr key={r.id}>
                    <th scope="row">{nameOf(state, r.id)}</th>
                    <td>{r.role}</td>
                    <td>
                      <div className={styles.markGroup}>
                        {MARKS.map((m) => (
                          <button
                            key={m}
                            type="button"
                            data-tone={m}
                            aria-pressed={current === m}
                            aria-label={`Mark ${nameOf(state, r.id)} as ${m}`}
                            onClick={() => {
                              if (m === current) return;
                              if (current === 'unmarked') setMark(r.id, m, '');
                              else setPending({ id: r.id, to: m });
                            }}
                          >
                            {m === 'unmarked' ? '—' : m}
                          </button>
                        ))}
                      </div>
                      {pending?.id === r.id && (
                        <form
                          className={styles.correction}
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (reason.trim().length < 5) return;
                            setMark(r.id, pending.to, reason.trim());
                          }}
                        >
                          <label>
                            Why change {current} → {pending.to}?
                            <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Arrived after briefing; confirmed by coordinator" />
                          </label>
                          <button type="submit" className={styles.primarySmall} disabled={reason.trim().length < 5}>Save correction</button>
                          <button type="button" className={styles.small} onClick={() => { setPending(null); setReason(''); }}>Cancel</button>
                        </form>
                      )}
                    </td>
                    <td>
                      {current === 'absent' && event.status !== 'finished' ? (
                        replacing === r.id ? (
                          <label className={styles.compactLabel}>
                            Replace with
                            <select
                              defaultValue=""
                              onChange={(e) => {
                                const next = e.target.value;
                                if (!next) return;
                                update((s) => ({
                                  ...s,
                                  assignments: s.assignments.map((a) => (a.id === r.assignmentId ? { ...a, approved: a.approved.map((x) => (x === r.id ? next : x)), applicants: a.applicants.includes(next) ? a.applicants : [...a.applicants, next] } : a)),
                                }), `${nameOf(state, next)} replaces ${nameOf(state, r.id)} as ${r.role} at ${event.name} (sample — no message sent).`);
                                setReplacing('');
                              }}
                            >
                              <option value="">Choose a {r.role}</option>
                              {pool.map((f) => <option key={f.id} value={f.id}>{f.name} · {f.city} · {f.rating.toFixed(1)}★</option>)}
                            </select>
                          </label>
                        ) : (
                          <button type="button" className={styles.small} disabled={!pool.length} onClick={() => setReplacing(r.id)}>
                            {pool.length ? 'Find replacement' : 'No one available'}
                          </button>
                        )
                      ) : (
                        <span className={styles.muted}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <Card>
        <h2>Correction history</h2>
        {history.length === 0 ? (
          <p className={styles.empty}>No corrections for this event. Original marks are never overwritten silently.</p>
        ) : (
          <ul className={styles.list}>
            {history.map((l) => (
              <li key={l.id}>
                <div>
                  <strong>{nameOf(state, l.freelancerId)}: {l.from} → {l.to}</strong>
                  <small>{l.reason}</small>
                  <small>{l.actor} · {l.at}</small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

/* ---------------- Quotations ---------------- */
export function QuotationsSection({ state, update, focus }: SectionProps) {
  const [editing, setEditing] = useState<Quotation | null>(() => {
    if (!focus) return null;
    const existing = state.quotations.find((q) => q.requestId === focus);
    const request = state.requests.find((r) => r.id === focus);
    return existing ?? (request ? quoteFromRequest(request, `QT-${String(state.quotations.length + 8).padStart(4, '0')}`, new Date().toISOString().slice(0, 10), state.rateCard) : null);
  });
  const start = (requestId: string) => {
    const existing = state.quotations.find((q) => q.requestId === requestId);
    const request = state.requests.find((r) => r.id === requestId)!;
    setEditing(existing ?? quoteFromRequest(request, `QT-${String(state.quotations.length + 8).padStart(4, '0')}`, new Date().toISOString().slice(0, 10), state.rateCard));
  };
  const save = (status: Quotation['status']) => {
    if (!editing) return;
    const next = { ...editing, status, updatedOn: new Date().toISOString().slice(0, 10) };
    update((s) => ({
      ...s,
      quotations: s.quotations.some((q) => q.id === next.id) ? s.quotations.map((q) => (q.id === next.id ? next : q)) : [...s.quotations, next],
      requests: s.requests.map((r) => (r.id === next.requestId ? { ...r, status: status === 'draft' ? 'quoting' : 'quoted' } : r)),
    }), status === 'draft' ? `${next.id} saved as draft.` : `${next.id} marked ready to send (not emailed — sample).`);
    setEditing(next);
  };
  const table = (q: Quotation) => {
    const t = quoteTotals(q);
    return {
      title: `Quotation ${q.id} · ${q.client}`,
      head: ['Item', 'Qty', 'Days', 'Rate (INR)', 'Amount (INR)'],
      rows: [
        ...q.lines.map((l) => [l.label, l.quantity, l.days, l.ratePaise / 100, (l.quantity * l.days * l.ratePaise) / 100]),
        ['Subtotal', '', '', '', t.subtotal / 100],
        [`Discount (${q.discountPct}%)`, '', '', '', -t.discount / 100],
        ['Adjustment', '', '', '', q.adjustmentPaise / 100],
        ['Total (tax to be confirmed)', '', '', '', t.total / 100],
      ],
    };
  };
  const setLine = (id: string, field: 'label' | 'quantity' | 'days' | 'ratePaise', value: string) =>
    editing && setEditing({ ...editing, lines: editing.lines.map((l) => (l.id === id ? { ...l, [field]: field === 'label' ? value : field === 'ratePaise' ? Math.max(0, Math.round(Number(value) * 100)) : Math.max(0, Math.round(Number(value))) } : l)) });
  return (
    <div className={styles.stack}>
      <div className={styles.split}>
        <Card>
          <h2>Client requests</h2>
          <ul className={styles.list}>
            {state.requests.map((r) => (
              <li key={r.id}>
                <div>
                  <strong>{r.client}</strong>
                  <small>{r.occasion} · {r.city} · {r.date} · {r.guests} guests</small>
                  <small>{r.lines.map((l) => `${l.quantity} × ${l.role} × ${l.days}d`).join(', ')}{r.extras.length ? ` + ${r.extras.join(', ')}` : ''}</small>
                </div>
                <button type="button" className={styles.primarySmall} onClick={() => start(r.id)}>
                  {state.quotations.some((q) => q.requestId === r.id) ? 'Open quote' : 'Make quote'}
                </button>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2>Saved quotations</h2>
          <ul className={styles.list}>
            {state.quotations.length === 0 && <li className={styles.empty}>No quotations yet.</li>}
            {state.quotations.map((q) => (
              <li key={q.id}>
                <div><strong>{q.id} · {q.client}</strong><small>{q.title} · {rupees(quoteTotals(q).total)}</small></div>
                <span className={styles.chip} data-tone={q.status}>{q.status === 'ready' ? 'Ready to send' : q.status === 'accepted-sample' ? 'Accepted (sample)' : q.status}</span>
                {q.status === 'ready' && (
                  <button type="button" className={styles.primarySmall} onClick={() => update((s) => ({ ...s, quotations: s.quotations.map((x) => (x.id === q.id ? { ...x, status: 'accepted-sample' } : x)) }), `${q.id} marked accepted by the client (sample). Collections can now be recorded in Finance.`)}>
                    Mark accepted
                  </button>
                )}
                <button type="button" className={styles.small} onClick={() => setEditing(q)}>Edit</button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      {editing ? (
        <Card aria-labelledby="quote-maker">
          <div className={styles.cardHead}>
            <div>
              <h2 id="quote-maker">Quotation maker · {editing.id}</h2>
              <small className={styles.muted}>{editing.client} · traced from request {editing.requestId}. Rates start from the sample rate card; adjust anything.</small>
            </div>
            <button type="button" className={styles.small} onClick={() => setEditing(null)}>Close</button>
          </div>
          <label className={styles.compactLabel}>Title
            <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          </label>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Item</th><th>Qty</th><th>Days</th><th>Rate (₹)</th><th>Amount</th><th><span className={styles.srOnly}>Remove</span></th></tr></thead>
              <tbody>
                {editing.lines.map((l) => (
                  <tr key={l.id}>
                    <td><input aria-label="Item" value={l.label} onChange={(e) => setLine(l.id, 'label', e.target.value)} /></td>
                    <td><input aria-label={`${l.label} quantity`} type="number" min="0" value={l.quantity} onChange={(e) => setLine(l.id, 'quantity', e.target.value)} /></td>
                    <td><input aria-label={`${l.label} days`} type="number" min="0" value={l.days} onChange={(e) => setLine(l.id, 'days', e.target.value)} /></td>
                    <td><input aria-label={`${l.label} rate`} type="number" min="0" value={l.ratePaise / 100} onChange={(e) => setLine(l.id, 'ratePaise', e.target.value)} /></td>
                    <td className={styles.num}>{rupees(l.quantity * l.days * l.ratePaise)}</td>
                    <td><button type="button" className={styles.iconButton} aria-label={`Remove ${l.label}`} onClick={() => setEditing({ ...editing, lines: editing.lines.filter((x) => x.id !== l.id) })}><Trash2 size={16} aria-hidden="true" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className={styles.linkButton} onClick={() => setEditing({ ...editing, lines: [...editing.lines, { id: `l${Date.now()}`, label: 'New item', quantity: 1, days: 1, ratePaise: 0 }] })}>
            <Plus size={16} aria-hidden="true" /> Add a line
          </button>
          {(() => {
            const t = quoteTotals(editing);
            return (
              <div className={styles.totals}>
                <label>Discount %<input type="number" min="0" max="50" value={editing.discountPct} onChange={(e) => setEditing({ ...editing, discountPct: Math.min(50, Math.max(0, Number(e.target.value))) })} /></label>
                <label>Final adjustment (₹, + or −)<input type="number" value={editing.adjustmentPaise / 100} onChange={(e) => setEditing({ ...editing, adjustmentPaise: Math.round(Number(e.target.value) * 100) })} /></label>
                <dl>
                  <div><dt>Subtotal</dt><dd>{rupees(t.subtotal)}</dd></div>
                  <div><dt>Discount</dt><dd>− {rupees(t.discount)}</dd></div>
                  <div><dt>Adjustment</dt><dd>{rupees(editing.adjustmentPaise)}</dd></div>
                  <div className={styles.grand}><dt>Total</dt><dd>{rupees(t.total)}</dd></div>
                </dl>
                <small className={styles.muted}>Taxes are not calculated — the tax treatment is still a pending business decision.</small>
              </div>
            );
          })()}
          <div className={styles.row}>
            <button type="button" className={styles.ghost} onClick={() => save('draft')}>Save draft</button>
            <button type="button" className={styles.primary} onClick={() => save('ready')}><Check size={17} aria-hidden="true" /> Mark ready to send</button>
            <button type="button" className={styles.ghost} onClick={() => download(toPdf([table(editing)], REPORT_NOTE), `${editing.id}.pdf`)}><FileText size={17} aria-hidden="true" /> PDF</button>
            <button type="button" className={styles.ghost} onClick={() => download(toXlsx([table(editing)]), `${editing.id}.xlsx`)}><FileSpreadsheet size={17} aria-hidden="true" /> Excel</button>
          </div>
          <p className={styles.muted}>“Ready to send” is a status only — no email or message leaves this demo.</p>
        </Card>
      ) : (
        <Card><p className={styles.empty}>Choose a client request and select “Make quote” to build a quotation from its requirements.</p></Card>
      )}
    </div>
  );
}

/* ---------------- Finance ---------------- */
export function FinanceSection({ state, update }: SectionProps) {
  const [filter, setFilter] = useState<'all' | 'remaining' | 'settled'>('remaining');
  const [error, setError] = useState('');
  const [payment, setPayment] = useState<Record<string, string>>({});
  const rows = state.freelancers.map((f) => ({ f, ...earnings(state, f.id) })).filter((r) => r.earned > 0);
  const shown = rows.filter((r) => filter === 'all' || (filter === 'remaining' ? r.remaining > 0 || r.awaitingApproval > 0 : r.remaining === 0 && r.awaitingApproval === 0));
  const total = (key: 'earned' | 'awaitingApproval' | 'paid' | 'remaining') => rows.reduce((n, r) => n + r[key], 0);
  const waiting = earningLines(state).filter((l) => !(l.approval.coordinator && l.approval.finance));
  const approve = (key: string, stage: 'coordinator' | 'finance') => {
    try {
      const next = approveEarning(state.approvals[key] ?? {}, stage, stage === 'coordinator' ? COORDINATOR_ACTOR : FINANCE_ACTOR);
      update((s) => ({ ...s, approvals: { ...s.approvals, [key]: next } }), `${stage === 'coordinator' ? 'Coordinator' : 'Finance'} approval recorded (sample).`);
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const accepted = state.quotations.filter((q) => q.status === 'accepted-sample');
  return (
    <div className={styles.stack}>
      <div className={styles.kpiGrid}>
        <Card className={styles.kpi}><strong>{rupees(total('earned'))}</strong><span>Earned</span><small>Attended days × day rate</small></Card>
        <Card className={styles.kpi} data-tone="attention"><strong>{rupees(total('awaitingApproval'))}</strong><span>Awaiting approval</span><small>Coordinator, then finance</small></Card>
        <Card className={styles.kpi}><strong>{rupees(total('paid'))}</strong><span>Disbursed</span><small>Sample payouts recorded</small></Card>
        <Card className={styles.kpi}><strong>{rupees(total('remaining'))}</strong><span>Ready to pay</span><small>Approved but not paid</small></Card>
      </div>
      <Card>
        <h2>Approve earnings</h2>
        <p className={styles.muted}>Every earned amount needs two approvals by different people — the event coordinator first, then finance — before it can be paid.</p>
        {error && <p className={styles.error} role="alert">{error}</p>}
        {waiting.length === 0 ? (
          <p className={styles.empty}>Nothing waiting for approval.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Freelancer</th><th>Event</th><th className={styles.num}>Amount</th><th>Coordinator</th><th>Finance</th></tr></thead>
              <tbody>
                {waiting.map((l) => (
                  <tr key={l.key}>
                    <th scope="row">{nameOf(state, l.freelancerId)}</th>
                    <td>{l.eventName} · {l.role}</td>
                    <td className={styles.num}>{rupees(l.amountPaise)}</td>
                    <td>{l.approval.coordinator ? <span className={styles.chip} data-tone="finished">Approved</span> : <button type="button" className={styles.primarySmall} onClick={() => approve(l.key, 'coordinator')}>Approve</button>}</td>
                    <td><button type="button" className={styles.primarySmall} disabled={!l.approval.coordinator} title={l.approval.coordinator ? undefined : 'Needs the coordinator first'} onClick={() => approve(l.key, 'finance')}>Approve</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <div className={styles.segmented} aria-label="Payout filter">
        {(['remaining', 'settled', 'all'] as const).map((f) => (
          <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {f === 'remaining' ? 'Still to pay' : f === 'settled' ? 'Fully paid' : 'Everyone'}
          </button>
        ))}
      </div>
      <Card>
        <h2>Freelancer payouts</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Freelancer</th><th>Role</th><th className={styles.num}>Earned</th><th className={styles.num}>Awaiting approval</th><th className={styles.num}>Paid</th><th className={styles.num}>Ready to pay</th><th>Action</th></tr></thead>
            <tbody>
              {shown.length === 0 && <tr><td colSpan={7} className={styles.empty}>Nobody in this view.</td></tr>}
              {shown.map(({ f, earned, awaitingApproval, paid, remaining }) => (
                <tr key={f.id}>
                  <th scope="row">{f.name}</th>
                  <td>{f.role}</td>
                  <td className={styles.num}>{rupees(earned)}</td>
                  <td className={styles.num}>{rupees(awaitingApproval)}</td>
                  <td className={styles.num}>{rupees(paid)}</td>
                  <td className={styles.num}><b>{rupees(remaining)}</b></td>
                  <td>
                    {remaining > 0 ? (
                      <button type="button" className={styles.primarySmall} onClick={() => update((s) => ({ ...s, payouts: [...s.payouts, { id: `po-${Date.now()}`, freelancerId: f.id, amountPaise: remaining, paidOn: new Date().toISOString().slice(0, 10), reference: `SAMPLE-PAY-${Date.now().toString().slice(-4)}` }] }), `${rupees(remaining)} recorded as disbursed to ${f.name} (sample — no money moved).`)}>
                        Record payout
                      </button>
                    ) : awaitingApproval > 0 ? (
                      <span className={styles.chip} data-tone="attention">Needs approval</span>
                    ) : (
                      <span className={styles.chip} data-tone="finished">Settled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card>
        <h2>Client collections</h2>
        <p className={styles.muted}>Money received from clients against accepted quotations. Kept separate from freelancer payouts.</p>
        {accepted.length === 0 ? (
          <p className={styles.empty}>No accepted quotations yet. Mark a ready quotation as accepted in Quotations.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Quote</th><th>Client</th><th className={styles.num}>Total</th><th className={styles.num}>Received</th><th className={styles.num}>Outstanding</th><th>Record a payment</th></tr></thead>
              <tbody>
                {accepted.map((q) => {
                  const c = collectionStatus(state, q);
                  return (
                    <tr key={q.id}>
                      <th scope="row">{q.id}</th>
                      <td>{q.client}</td>
                      <td className={styles.num}>{rupees(c.total)}</td>
                      <td className={styles.num}>{rupees(c.received)}</td>
                      <td className={styles.num}><b>{rupees(c.outstanding)}</b></td>
                      <td>
                        {c.outstanding > 0 ? (
                          <form
                            className={styles.inlinePay}
                            onSubmit={(e) => {
                              e.preventDefault();
                              const amount = Math.round(Number(payment[q.id]) * 100);
                              if (!(amount > 0) || amount > c.outstanding) {
                                setError(`Enter an amount between ₹1 and ${rupees(c.outstanding)}.`);
                                return;
                              }
                              setError('');
                              update((s) => ({ ...s, collections: [...s.collections, { id: `co-${Date.now()}`, quoteId: q.id, amountPaise: amount, receivedOn: new Date().toISOString().slice(0, 10), reference: `SAMPLE-RCPT-${Date.now().toString().slice(-4)}` }] }), `${rupees(amount)} received from ${q.client} against ${q.id} (sample — no bank link).`);
                              setPayment({ ...payment, [q.id]: '' });
                            }}
                          >
                            <input aria-label={`Amount received for ${q.id} in rupees`} type="number" min="1" value={payment[q.id] ?? ''} onChange={(e) => setPayment({ ...payment, [q.id]: e.target.value })} placeholder="₹ amount" />
                            <button type="submit" className={styles.primarySmall}>Record</button>
                          </form>
                        ) : (
                          <span className={styles.chip} data-tone="finished">Paid in full</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Card>
        <h2>Disbursement history</h2>
        <ul className={styles.list}>
          {[...state.payouts].reverse().map((p) => (
            <li key={p.id}>
              <div><strong>{nameOf(state, p.freelancerId)}</strong><small>{p.paidOn} · {p.reference}</small></div>
              <b>{rupees(p.amountPaise)}</b>
            </li>
          ))}
        </ul>
        <p className={styles.muted}>Sample ledgers only. No bank, provider or real payout is connected.</p>
      </Card>
    </div>
  );
}

/* ---------------- Catalogue & rates ---------------- */
export function CatalogueSection({ state, update }: SectionProps) {
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [reason, setReason] = useState<Record<string, string>>({});
  return (
    <div className={styles.stack}>
      <Card>
        <h2>Workforce rate card</h2>
        <p className={styles.muted}>New quotations start from these day rates. Changing a rate needs a reason and creates a revision; quotations already issued keep their own rates.</p>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Role</th><th className={styles.num}>Current day rate</th><th>New rate (₹)</th><th>Reason</th><th>Action</th></tr></thead>
            <tbody>
              {ROLES.map((role) => {
                const value = draft[role] ?? '';
                const why = reason[role] ?? '';
                const next = Math.round(Number(value) * 100);
                const valid = next > 0 && next !== state.rateCard[role] && why.trim().length >= 5;
                return (
                  <tr key={role}>
                    <th scope="row">{role}</th>
                    <td className={styles.num}>{rupees(state.rateCard[role])}</td>
                    <td><input aria-label={`New day rate for ${role}`} type="number" min="1" value={value} placeholder={String(state.rateCard[role] / 100)} onChange={(e) => setDraft({ ...draft, [role]: e.target.value })} /></td>
                    <td><input aria-label={`Reason for the ${role} rate change`} value={why} placeholder="e.g. Wedding season demand" onChange={(e) => setReason({ ...reason, [role]: e.target.value })} /></td>
                    <td>
                      <button
                        type="button"
                        className={styles.primarySmall}
                        disabled={!valid}
                        onClick={() => {
                          update((s) => ({
                            ...s,
                            rateCard: { ...s.rateCard, [role]: next },
                            rateRevisions: [...s.rateRevisions, { rev: s.rateRevisions.length + 1, role, fromPaise: s.rateCard[role], toPaise: next, reason: why.trim(), actor: ACTOR, at: new Date().toLocaleString('en-IN') }],
                          }), `${role} day rate changed to ${rupees(next)} (revision ${state.rateRevisions.length + 1}).`);
                          setDraft({ ...draft, [role]: '' });
                          setReason({ ...reason, [role]: '' });
                        }}
                      >
                        Save revision
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {state.rateRevisions.length > 0 && (
          <ul className={styles.list}>
            {[...state.rateRevisions].reverse().map((r) => (
              <li key={r.rev}>
                <div>
                  <strong>Revision {r.rev} · {r.role}: {rupees(r.fromPaise)} → {rupees(r.toPaise)}</strong>
                  <small>{r.reason} · {r.actor} · {r.at}</small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card>
        <h2>Public service listings</h2>
        <p className={styles.muted}>What visitors see on the website and the “starting at” price shown. Hiding a service takes it off the public pages (sample — the demo website does not read this yet).</p>
        <div className={styles.cardGrid}>
          {state.services.map((svc, i) => (
            <article key={svc.title} className={styles.person} data-inactive={!svc.published}>
              <strong>{svc.title}</strong>
              <small className={styles.muted}>Starting at {rupees(svc.startingPaise)}{svc.title.includes('RSVP') ? ' per event' : ' per person per day'}</small>
              <button
                type="button"
                className={svc.published ? styles.ghost : styles.primary}
                onClick={() => update((s) => ({ ...s, services: s.services.map((x, j) => (j === i ? { ...x, published: !x.published } : x)) }), `${svc.title} ${svc.published ? 'hidden from' : 'published to'} the public catalogue (sample).`)}
              >
                {svc.published ? 'Hide from website' : 'Publish to website'}
              </button>
            </article>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Audit log ---------------- */
export function AuditSection({ state }: SectionProps) {
  const [query, setQuery] = useState('');
  const entries = state.log.filter((l) => `${l.text} ${l.actor}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className={styles.stack}>
      <label className={styles.search}>
        Search the audit log
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, event, quote, payout…" />
      </label>
      <Card>
        <h2>Every change, who made it and when</h2>
        <p className={styles.muted}>Approvals, corrections, rates, payouts, access and quotations are recorded here. Newest first. This browser only (sample).</p>
        <ul className={styles.list}>
          {entries.length === 0 && <li className={styles.empty}>Nothing matches.</li>}
          {entries.map((l, i) => (
            <li key={i}>
              <div>
                <strong>{l.text}</strong>
                <small>{l.actor} · {l.at}</small>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ---------------- RSVP access ---------------- */
export function RsvpAccessSection({ state, update }: SectionProps) {
  const [form, setForm] = useState({ name: '', role: 'operator' as 'manager' | 'operator' | 'viewer' });
  const setMember = (id: string, change: (m: AdminState['rsvpMembers'][number]) => AdminState['rsvpMembers'][number], message: string) =>
    update((s) => ({ ...s, rsvpMembers: s.rsvpMembers.map((m) => (m.id === id ? change(m) : m)) }), message);
  return (
    <div className={styles.stack}>
      <Card>
        <h2>RSVP by event</h2>
        <p className={styles.muted}>Switch RSVP on for an event, then choose who on the RSVP team can work on it.</p>
        <div className={styles.eventGrid}>
          {state.events.map((e) => (
            <div key={e.id} className={styles.eventCard}>
              <span className={styles.chip} data-tone={e.status}>{e.status}</span>
              <strong>{e.name}</strong>
              <small>{state.rsvpMembers.filter((m) => m.active && m.eventIds.includes(e.id)).length} team members with access</small>
              <button type="button" className={e.rsvpEnabled ? styles.small : styles.primarySmall} aria-pressed={e.rsvpEnabled} onClick={() => update((s) => ({ ...s, events: s.events.map((x) => (x.id === e.id ? { ...x, rsvpEnabled: !x.rsvpEnabled } : x)) }), `RSVP ${e.rsvpEnabled ? 'switched off' : 'enabled'} for ${e.name} (sample).`)}>
                {e.rsvpEnabled ? 'RSVP on · switch off' : 'Enable RSVP'}
              </button>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h2>RSVP team logins</h2>
        <p className={styles.muted}>Sample access records. No real account, password or invitation is created.</p>
        <div className={styles.cardGrid}>
          {state.rsvpMembers.map((m) => (
            <article key={m.id} className={styles.person} data-inactive={!m.active}>
              <div className={styles.personHead}>
                <span className={styles.avatar} aria-hidden="true">{initials(m.name)}</span>
                <div><strong>{m.name}</strong><small>{m.email} · {m.role}</small></div>
              </div>
              <fieldset className={styles.checks}>
                <legend>Events this person can open</legend>
                {state.events.filter((e) => e.rsvpEnabled).map((e) => (
                  <label key={e.id}>
                    <input type="checkbox" checked={m.eventIds.includes(e.id)} onChange={() => setMember(m.id, (x) => ({ ...x, eventIds: x.eventIds.includes(e.id) ? x.eventIds.filter((y) => y !== e.id) : [...x.eventIds, e.id] }), `${m.name}'s RSVP access to ${e.name} ${m.eventIds.includes(e.id) ? 'removed' : 'granted'} (sample).`)} />
                    {e.name}
                  </label>
                ))}
              </fieldset>
              <label className={styles.compactLabel}>Role
                <select value={m.role} onChange={(e) => setMember(m.id, (x) => ({ ...x, role: e.target.value as typeof x.role }), `${m.name} is now an RSVP ${e.target.value} (sample).`)}>
                  <option value="manager">Manager — full event access</option>
                  <option value="operator">Operator — replies and follow-ups</option>
                  <option value="viewer">Viewer — read only</option>
                </select>
              </label>
              <button type="button" className={m.active ? styles.ghost : styles.primary} onClick={() => setMember(m.id, (x) => ({ ...x, active: !x.active }), `${m.name}'s RSVP login ${m.active ? 'suspended' : 'reactivated'} (sample).`)}>
                {m.active ? 'Suspend login' : 'Reactivate login'}
              </button>
            </article>
          ))}
        </div>
      </Card>
      <Card>
        <h2>Add an RSVP team member</h2>
        <form className={styles.inlineForm} onSubmit={(e) => {
          e.preventDefault();
          if (!form.name.trim()) return;
          const slug = form.name.trim().toLowerCase().replace(/[^a-z]+/g, '.');
          update((s) => ({ ...s, rsvpMembers: [...s.rsvpMembers, { id: `rm-${Date.now()}`, name: form.name.trim(), email: `${slug}@sample.invalid`, role: form.role, eventIds: [], active: true }] }), `${form.name.trim()} added to the RSVP team (sample — no invitation sent).`);
          setForm({ ...form, name: '' });
        }}>
          <label>Sample name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sample RSVP Operator" /></label>
          <label>Role
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as typeof form.role })}>
              <option value="manager">Manager</option>
              <option value="operator">Operator</option>
              <option value="viewer">Viewer</option>
            </select>
          </label>
          <button type="submit" className={styles.primary} disabled={!form.name.trim()}>Add member</button>
        </form>
      </Card>
    </div>
  );
}
