'use client';
import { useState } from 'react';
import { FileSpreadsheet, FileText, Megaphone } from 'lucide-react';
import { download, toPdf, toXlsx, type Table } from '../admin/exporters';
import {
  CATEGORY_LABEL,
  eventStats,
  ORGS,
  TEMPLATES,
  type GuestThread,
  type RsvpChatState,
  type RsvpEvent,
} from './rsvpChatData';
import type { Save } from './RsvpWorkspace';
import styles from './RsvpChat.module.css';

const NOTE = 'TNP RSVP - synthetic demo report. Sample guests and messages only.';

export function TodayPanel({
  state,
  org,
  openEvent,
}: {
  state: RsvpChatState;
  org: 'lotus' | 'marigold';
  openEvent: (id: string, view?: 'chats' | 'reports') => void;
}) {
  const events = state.events.filter((e) => e.org === org);
  const all = eventStats(state.threads.filter((t) => events.some((e) => e.id === t.eventId)));
  return (
    <div className={styles.panel}>
      <h1>Today across {ORGS[org]}</h1>
      <div className={styles.stats}>
        {[
          [all.unread, 'Unread messages'],
          [all.review, 'Replies to review'],
          [all.attendingPeople, 'Guests attending'],
          [all.noReply, 'Parties with no reply'],
          [all.pickups, 'Pickups requested'],
          [all.rooms, 'Room requests'],
        ].map(([value, label]) => (
          <article key={label} className={styles.stat}>
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </div>
      <h2>Events</h2>
      <div className={styles.eventCards}>
        {events.map((e) => {
          const s = eventStats(state.threads.filter((t) => t.eventId === e.id));
          const replied = s.parties - s.noReply;
          return (
            <article key={e.id} className={styles.eventCard}>
              <strong>{e.name}</strong>
              <small>{e.city} · {e.dates} · {e.functions.join(', ')}</small>
              <div className={styles.progress} aria-hidden="true">
                <i data-cat="attending" style={{ width: `${(s.attending / (s.parties || 1)) * 100}%` }} />
                <i data-cat="maybe" style={{ width: `${(s.maybe / (s.parties || 1)) * 100}%` }} />
                <i data-cat="declined" style={{ width: `${(s.declined / (s.parties || 1)) * 100}%` }} />
              </div>
              <small>
                {replied}/{s.parties} replied · {s.attending} attending · {s.review} to review · {s.unread} unread
              </small>
              <div className={styles.actions}>
                <button type="button" className={styles.primary} onClick={() => openEvent(e.id)}>Open chats</button>
                <button type="button" className={styles.secondary} onClick={() => openEvent(e.id, 'reports')}>Report</button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function BroadcastsPanel({ state, event, save }: { state: RsvpChatState; event: RsvpEvent; save: Save }) {
  const threads = state.threads.filter((t) => t.eventId === event.id);
  const audiences: Record<string, GuestThread[]> = {
    'All guests': threads,
    'No reply yet': threads.filter((t) => t.category === 'no-reply'),
    'Attending guests': threads.filter((t) => t.category === 'attending'),
    'Maybe / needs review': threads.filter((t) => t.category === 'maybe' || !t.confirmed),
    'Travel info missing': threads.filter((t) => t.category === 'attending' && t.travel.mode === '—'),
  };
  const [template, setTemplate] = useState('reminder');
  const [audience, setAudience] = useState('No reply yet');
  const text = TEMPLATES[template].text
    .replaceAll('{event}', event.name)
    .replaceAll('{city}', event.city)
    .replaceAll('{dates}', event.dates)
    .replaceAll('{functions}', event.functions.join(', '))
    .replaceAll('{party}', 'there');
  const recipients = audiences[audience];
  return (
    <div className={styles.panel}>
      <h1>Broadcasts · {event.name}</h1>
      <div className={styles.twoCol}>
        <section className={styles.card}>
          <h2>New broadcast</h2>
          <label>Template
            <select value={template} onChange={(e) => setTemplate(e.target.value)}>
              {Object.entries(TEMPLATES).map(([key, t]) => <option key={key} value={key}>{t.label}</option>)}
            </select>
          </label>
          <label>Send to
            <select value={audience} onChange={(e) => setAudience(e.target.value)}>
              {Object.entries(audiences).map(([key, list]) => <option key={key} value={key}>{key} ({list.length})</option>)}
            </select>
          </label>
          <p className={styles.hint}>Template approval and the WhatsApp provider are not connected. “Simulate” only records the broadcast here.</p>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primary}
              disabled={!recipients.length}
              onClick={() =>
                save((s) => ({
                  ...s,
                  broadcasts: [{ id: `bc-${Date.now()}`, eventId: event.id, template, audience, text, status: 'simulated', sent: recipients.length, delivered: recipients.length, read: 0, replied: 0, at: new Date().toLocaleString('en-IN') }, ...s.broadcasts],
                  threads: s.threads.map((t) => (recipients.some((r) => r.id === t.id) ? { ...t, messages: [...t.messages, { id: `b${Date.now()}${t.id}`, from: 'team', template, text: text.replace('there', t.party), at: 'now', quickReplies: TEMPLATES[template].quickReplies, status: 'simulated' }] } : t)),
                }), `Broadcast simulated to ${recipients.length} parties — nothing was sent to WhatsApp.`)
              }
            >
              <Megaphone size={17} aria-hidden="true" /> Simulate broadcast to {recipients.length}
            </button>
          </div>
        </section>
        <section className={styles.phone} aria-label="Message preview">
          <div className={styles.phoneHead}>{event.name}</div>
          <div className={styles.phoneBody}>
            <div className={styles.bubbleRow} data-from="team">
              <div className={styles.bubble}>
                <small className={styles.templateTag}>Template · {TEMPLATES[template].label}</small>
                <p>{text}</p>
                {TEMPLATES[template].quickReplies && (
                  <div className={styles.quick}>
                    {TEMPLATES[template].quickReplies!.map((q) => <span key={q}>{q}</span>)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
      <section className={styles.card}>
        <h2>Sent broadcasts</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>When</th><th>Template</th><th>Audience</th><th>Sent</th><th>Delivered</th><th>Read</th><th>Replied</th></tr></thead>
            <tbody>
              {state.broadcasts.filter((b) => b.eventId === event.id).map((b) => (
                <tr key={b.id}><td>{b.at}</td><td>{TEMPLATES[b.template]?.label}</td><td>{b.audience}</td><td>{b.sent}</td><td>{b.delivered}</td><td>{b.read}</td><td>{b.replied}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.hint}>Counts are sample figures, not provider delivery receipts.</p>
      </section>
    </div>
  );
}

export function GuestsPanel({ state, event, save, openChat }: { state: RsvpChatState; event: RsvpEvent; save: Save; openChat: () => void }) {
  const threads = state.threads.filter((t) => t.eventId === event.id);
  const [csv, setCsv] = useState('party,members\nSample New family,3');
  const [error, setError] = useState('');
  return (
    <div className={styles.panel}>
      <h1>Guests · {event.name}</h1>
      <section className={styles.card}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>Party</th><th>Members</th><th>Response</th>{event.functions.map((f) => <th key={f}>{f}</th>)}<th>Travel</th><th>Pickup</th><th>Stay</th></tr>
            </thead>
            <tbody>
              {threads.map((t) => (
                <tr key={t.id}>
                  <th scope="row">{t.party}</th>
                  <td>{t.members}</td>
                  <td><span className={styles.tag} data-cat={!t.confirmed && t.category !== 'no-reply' ? 'needs-review' : t.category}>{!t.confirmed && t.category !== 'no-reply' ? 'Needs review' : CATEGORY_LABEL[t.category]}</span></td>
                  {event.functions.map((f) => <td key={f}>{t.functions[f] === 'yes' ? 'Yes' : t.functions[f] === 'no' ? 'No' : '—'}</td>)}
                  <td>{t.travel.mode}{t.travel.arrival !== '—' ? ` · ${t.travel.arrival}` : ''}</td>
                  <td>{t.pickup === 'needed' ? 'Needed' : t.pickup === 'not-needed' ? 'No' : '—'}</td>
                  <td>{t.stay || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={openChat}>Open chats</button>
        </div>
      </section>
      <section className={styles.card}>
        <h2>Add sample parties</h2>
        <label>Paste CSV (party,members)
          <textarea rows={4} value={csv} onChange={(e) => setCsv(e.target.value)} />
        </label>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primary}
            onClick={() => {
              const rows = csv.trim().split(/\r?\n/).slice(1).map((line) => line.split(','));
              const bad = rows.find((r) => r.length !== 2 || !r[0].trim() || !(Number(r[1]) >= 1 && Number(r[1]) <= 30));
              if (!rows.length || bad || rows.length > 50) {
                setError('Use “party,members” with 1–50 rows and 1–30 members each. Invented names only.');
                return;
              }
              setError('');
              save((s) => ({
                ...s,
                threads: [
                  ...s.threads,
                  ...rows.map(([party, members], i) => ({
                    id: `${event.id}-n${Date.now()}${i}`,
                    eventId: event.id,
                    party: party.trim(),
                    contact: '+91 ••••• ••••• (sample)',
                    members: Number(members),
                    category: 'no-reply' as const,
                    suggested: 'no-reply' as const,
                    confirmed: false,
                    functions: Object.fromEntries(event.functions.map((f) => [f, 'unknown' as const])),
                    travel: { mode: '—', arrival: '—', reference: '—' },
                    stay: '',
                    pickup: 'unknown' as const,
                    dietary: '',
                    notes: '',
                    unread: 0,
                    messages: [{ id: `sys${Date.now()}${i}`, from: 'system' as const, text: 'Guest added from a sample import. No invitation sent yet.', at: 'now' }],
                  })),
                ],
              }), `${rows.length} sample parties added to ${event.name}.`);
            }}
          >
            Validate and add
          </button>
        </div>
      </section>
    </div>
  );
}

export function rsvpTables(state: RsvpChatState, event: RsvpEvent): Table[] {
  const threads = state.threads.filter((t) => t.eventId === event.id);
  return [
    {
      title: `RSVP responses - ${event.name}`,
      head: ['Party', 'Members', 'Response', 'Confirmed by team', ...event.functions, 'Travel', 'Arrival', 'Reference', 'Pickup', 'Stay', 'Dietary'],
      rows: threads.map((t) => [t.party, t.members, CATEGORY_LABEL[t.category], t.confirmed ? 'Yes' : 'No', ...event.functions.map((f) => t.functions[f]), t.travel.mode, t.travel.arrival, t.travel.reference, t.pickup, t.stay, t.dietary]),
    },
    {
      title: `Function totals - ${event.name}`,
      head: ['Function', 'Parties yes', 'People yes', 'Parties no', 'Unknown'],
      rows: event.functions.map((f) => [
        f,
        threads.filter((t) => t.functions[f] === 'yes').length,
        threads.filter((t) => t.functions[f] === 'yes').reduce((n, t) => n + t.members, 0),
        threads.filter((t) => t.functions[f] === 'no').length,
        threads.filter((t) => t.functions[f] === 'unknown').length,
      ]),
    },
  ];
}

export function ReportsPanel({ state, event }: { state: RsvpChatState; event: RsvpEvent }) {
  const threads = state.threads.filter((t) => t.eventId === event.id);
  const s = eventStats(threads);
  const [responses, functions] = rsvpTables(state, event);
  const stamp = new Date().toISOString().slice(0, 10);
  return (
    <div className={styles.panel}>
      <h1>Reports · {event.name}</h1>
      <div className={styles.stats}>
        {[
          [`${s.parties - s.noReply}/${s.parties}`, 'Parties replied'],
          [s.attendingPeople, 'Guests attending'],
          [s.declined, 'Parties declined'],
          [s.review, 'Awaiting review'],
          [s.pickups, 'Pickups requested'],
          [s.rooms, 'Room requests'],
        ].map(([value, label]) => (
          <article key={label} className={styles.stat}><strong>{value}</strong><span>{label}</span></article>
        ))}
      </div>
      <section className={styles.card}>
        <h2>Function-wise totals</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr>{functions.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>{functions.rows.map((r) => <tr key={String(r[0])}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={() => download(toXlsx([responses, functions]), `rsvp-${event.id}-${stamp}.xlsx`)}>
            <FileSpreadsheet size={17} aria-hidden="true" /> Download Excel
          </button>
          <button type="button" className={styles.secondary} onClick={() => download(toPdf([responses, functions], NOTE), `rsvp-${event.id}-${stamp}.pdf`)}>
            <FileText size={17} aria-hidden="true" /> Download PDF
          </button>
        </div>
        <p className={styles.hint}>Reports include this event only. Spreadsheet cells are protected against formula injection.</p>
      </section>
    </div>
  );
}

export function SettingsPanel({ state, org, save }: { state: RsvpChatState; org: 'lotus' | 'marigold'; save: Save }) {
  return (
    <div className={styles.panel}>
      <h1>Team & settings</h1>
      <div className={styles.twoCol}>
        <section className={styles.card}>
          <h2>Team access</h2>
          <p className={styles.hint}>Access is granted by TNP admins in the Admin console. These are sample records; no login exists.</p>
          <ul className={styles.teamList}>
            {state.team[org].map((m, i) => (
              <li key={m.name}>
                <span className={styles.avatar} aria-hidden="true">{m.name.split(' ').map((p) => p[0]).join('')}</span>
                <div><strong>{m.name}</strong><small>{m.role}</small></div>
                <button type="button" className={styles.secondary} onClick={() => save((s) => ({ ...s, team: { ...s.team, [org]: s.team[org].map((x, j) => (j === i ? { ...x, active: !x.active } : x)) } }), `${m.name} ${m.active ? 'suspended' : 'reactivated'} (sample).`)}>
                  {m.active ? 'Suspend' : 'Reactivate'}
                </button>
              </li>
            ))}
          </ul>
        </section>
        <section className={styles.card}>
          <h2>Connection status</h2>
          <dl className={styles.statusList}>
            <div><dt>WhatsApp Business provider</dt><dd data-state="off">Not connected (demo)</dd></div>
            <div><dt>Message templates</dt><dd data-state="warn">Sample · not submitted for approval</dd></div>
            <div><dt>RSVP entitlement</dt><dd data-state="on">Active · sample</dd></div>
            <div><dt>Guest data</dt><dd data-state="on">Synthetic only</dd></div>
          </dl>
          <p className={styles.hint}>RSVP is message-only: no calls, and no ticket, room or vehicle booking.</p>
        </section>
      </div>
    </div>
  );
}
