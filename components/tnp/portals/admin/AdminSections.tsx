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
  approveApplicant,
  earnings,
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
export function PeopleSection({ state }: SectionProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<Freelancer | null>(null);
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
  const event = state.events.find((e) => e.id === eventId);
  if (!event) return <Card><p className={styles.empty}>No events to show.</p></Card>;
  const rows = state.assignments.filter((a) => a.eventId === event.id).flatMap((a) => a.approved.map((id) => ({ id, role: a.role })));
  const count = (m: Attendance) => rows.filter((r) => (event.attendance[r.id] ?? 'unmarked') === m).length;
  return (
    <div className={styles.stack}>
      <label className={styles.search}>
        Event
        <select value={eventId} onChange={(e) => setEventId(e.target.value)}>
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
        <p className={styles.muted}>Sample attendance marks. Real attendance needs scan evidence; nothing here proves presence.</p>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Freelancer</th><th>Role</th><th>Attendance</th></tr></thead>
            <tbody>
              {rows.map((r) => (
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
                          aria-pressed={(event.attendance[r.id] ?? 'unmarked') === m}
                          aria-label={`Mark ${nameOf(state, r.id)} as ${m}`}
                          onClick={() => update((s) => ({ ...s, events: s.events.map((e) => (e.id === event.id ? { ...e, attendance: { ...e.attendance, [r.id]: m } } : e)) }), `${nameOf(state, r.id)} marked ${m} at ${event.name} (sample).`)}
                        >
                          {m === 'unmarked' ? '—' : m}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
    return existing ?? (request ? quoteFromRequest(request, `QT-${String(state.quotations.length + 8).padStart(4, '0')}`, new Date().toISOString().slice(0, 10)) : null);
  });
  const start = (requestId: string) => {
    const existing = state.quotations.find((q) => q.requestId === requestId);
    const request = state.requests.find((r) => r.id === requestId)!;
    setEditing(existing ?? quoteFromRequest(request, `QT-${String(state.quotations.length + 8).padStart(4, '0')}`, new Date().toISOString().slice(0, 10)));
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
                <span className={styles.chip} data-tone={q.status}>{q.status === 'ready' ? 'Ready to send' : q.status}</span>
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
  const rows = state.freelancers.map((f) => ({ f, ...earnings(state, f.id) })).filter((r) => r.earned > 0);
  const shown = rows.filter((r) => filter === 'all' || (filter === 'remaining' ? r.remaining > 0 : r.remaining === 0));
  const total = (key: 'earned' | 'paid' | 'remaining') => rows.reduce((n, r) => n + r[key], 0);
  return (
    <div className={styles.stack}>
      <div className={styles.kpiGrid}>
        <Card className={styles.kpi}><strong>{rupees(total('earned'))}</strong><span>Earned by freelancers</span><small>Attended days × day rate</small></Card>
        <Card className={styles.kpi}><strong>{rupees(total('paid'))}</strong><span>Disbursed</span><small>Sample payouts recorded</small></Card>
        <Card className={styles.kpi} data-tone="attention"><strong>{rupees(total('remaining'))}</strong><span>Remaining</span><small>Still to be paid</small></Card>
      </div>
      <div className={styles.segmented} aria-label="Payout filter">
        {(['remaining', 'settled', 'all'] as const).map((f) => (
          <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {f === 'remaining' ? 'Payment remaining' : f === 'settled' ? 'Fully paid' : 'Everyone'}
          </button>
        ))}
      </div>
      <Card>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Freelancer</th><th>Role</th><th className={styles.num}>Earned</th><th className={styles.num}>Paid</th><th className={styles.num}>Remaining</th><th>Action</th></tr></thead>
            <tbody>
              {shown.length === 0 && <tr><td colSpan={6} className={styles.empty}>Nobody in this view.</td></tr>}
              {shown.map(({ f, earned, paid, remaining }) => (
                <tr key={f.id}>
                  <th scope="row">{f.name}</th>
                  <td>{f.role}</td>
                  <td className={styles.num}>{rupees(earned)}</td>
                  <td className={styles.num}>{rupees(paid)}</td>
                  <td className={styles.num}><b>{rupees(remaining)}</b></td>
                  <td>
                    {remaining > 0 ? (
                      <button type="button" className={styles.primarySmall} onClick={() => update((s) => ({ ...s, payouts: [...s.payouts, { id: `po-${Date.now()}`, freelancerId: f.id, amountPaise: remaining, paidOn: new Date().toISOString().slice(0, 10), reference: `SAMPLE-PAY-${Date.now().toString().slice(-4)}` }] }), `${rupees(remaining)} recorded as disbursed to ${f.name} (sample — no money moved).`)}>
                        Record payout
                      </button>
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
        <h2>Disbursement history</h2>
        <ul className={styles.list}>
          {[...state.payouts].reverse().map((p) => (
            <li key={p.id}>
              <div><strong>{nameOf(state, p.freelancerId)}</strong><small>{p.paidOn} · {p.reference}</small></div>
              <b>{rupees(p.amountPaise)}</b>
            </li>
          ))}
        </ul>
        <p className={styles.muted}>Sample ledger only. No bank, provider or real payout is connected.</p>
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
