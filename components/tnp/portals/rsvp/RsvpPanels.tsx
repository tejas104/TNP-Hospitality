'use client';
import { useState } from 'react';
import { Bot, FileSpreadsheet, FileText, ImageIcon, Megaphone, ShieldAlert } from 'lucide-react';
import { download, toPdf, toXlsx, type Table } from '../admin/exporters';
import {
  CATEGORY_LABEL,
  checkCompliance,
  eventStats,
  GROUPS,
  ORGS,
  personalize,
  replaceTerm,
  TEMPLATES,
  type MessageCategory,
  type GuestThread,
  type RsvpChatState,
  type RsvpEvent,
} from './rsvpChatData';
import type { Save, View } from './RsvpWorkspace';
import styles from './RsvpChat.module.css';

const NOTE = 'TNP RSVP - synthetic demo report. Sample guests and messages only.';

export function TodayPanel({
  state,
  org,
  openEvent,
}: {
  state: RsvpChatState;
  org: 'lotus' | 'marigold';
  openEvent: (id: string, view?: View) => void;
}) {
  const events = state.events.filter((e) => e.org === org);
  const threads = state.threads.filter((t) => events.some((e) => e.id === t.eventId));
  const all = eventStats(threads);
  const first = events[0].id;
  const login = state.logins.find((l) => l.id === state.activeLogin);
  const sender = state.senders.find((s) => s.id === login?.senderId);
  const attending = threads.filter((t) => t.category === 'attending');
  // Setup order a new RSVP team follows; each step is derived from live data.
  const steps: { title: string; detail: string; done: boolean; view: View }[] = [
    { title: 'Choose your sending number', detail: sender ? `${sender.displayName} · ${sender.status === 'verified' ? 'verified' : 'pending verification'}` : 'Use “Add number” at the top left', done: sender?.status === 'verified', view: 'settings' },
    { title: 'Add your guests', detail: `${threads.length} parties added`, done: threads.length > 0, view: 'guests' },
    { title: 'Send the invitation', detail: 'Personalised, from your number', done: threads.some((t) => t.messages.some((m) => m.template === 'invitation')), view: 'broadcasts' },
    { title: 'Review unclear replies', detail: all.review ? `${all.review} waiting for a person` : 'Nothing waiting', done: all.review === 0, view: 'chats' },
    { title: 'Collect travel details', detail: `${attending.filter((t) => t.travel.mode !== '—').length} of ${attending.length} attending parties`, done: attending.every((t) => t.travel.mode !== '—'), view: 'chats' },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  return (
    <div className={styles.panel}>
      <h1>Today across {ORGS[org]}</h1>
      <section className={styles.setup} aria-labelledby="setup-title">
        <div className={styles.setupHead}>
          <h2 id="setup-title">{doneCount === steps.length ? 'You’re all set' : 'Get set up'}</h2>
          <span>{doneCount} of {steps.length} done</span>
        </div>
        <div className={styles.setupBar} aria-hidden="true">
          <i style={{ width: `${(doneCount / steps.length) * 100}%` }} />
        </div>
        <ol className={styles.setupSteps}>
          {steps.map((s) => (
            <li key={s.title} data-done={s.done}>
              <div>
                <strong>{s.title}</strong>
                <small>{s.detail}</small>
              </div>
              {!s.done && (
                <button type="button" className={styles.secondary} onClick={() => openEvent(first, s.view)}>
                  Do this
                </button>
              )}
            </li>
          ))}
        </ol>
      </section>
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
    ...Object.fromEntries(GROUPS.map((g) => [`Category: ${g}`, threads.filter((t) => t.group === g)])),
  };
  const [template, setTemplate] = useState('reminder');
  const [audience, setAudience] = useState('No reply yet');
  const [category, setCategory] = useState<MessageCategory>('utility');
  const fill = (key: string) =>
    TEMPLATES[key].text
      .replaceAll('{event}', event.name)
      .replaceAll('{city}', event.city)
      .replaceAll('{dates}', event.dates)
      .replaceAll('{functions}', event.functions.join(', '));
  const [text, setText] = useState(() => fill('reminder'));
  const login = state.logins.find((l) => l.id === state.activeLogin);
  const sender = state.senders.find((x) => x.id === login?.senderId);
  const recipients = audiences[audience] ?? [];
  const eligible = category === 'marketing' ? recipients.filter((t) => t.optIn) : recipients;
  const hits = category === 'utility' ? checkCompliance(text) : [];
  const blocked = !sender ? 'Choose a sending number at the top left.' : sender.status !== 'verified' ? `${sender.number} is pending verification.` : hits.length ? 'Replace the promotional words below or switch to Marketing.' : !eligible.length ? 'Nobody in this audience can receive it.' : '';
  return (
    <div className={styles.panel}>
      <h1>Broadcasts · {event.name}</h1>
      <div className={styles.twoCol}>
        <section className={styles.card}>
          <h2>New broadcast</h2>
          <label>Template
            <select value={template} onChange={(e) => { setTemplate(e.target.value); setText(fill(e.target.value)); }}>
              {Object.entries(TEMPLATES).map(([key, t]) => <option key={key} value={key}>{t.label}</option>)}
            </select>
          </label>
          <label>Message ({'{name}'} becomes each guest’s first name)
            <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} />
          </label>
          <div className={styles.inlineFields}>
            <label>Send to
              <select value={audience} onChange={(e) => setAudience(e.target.value)}>
                {Object.entries(audiences).map(([key, list]) => <option key={key} value={key}>{key} ({list.length})</option>)}
              </select>
            </label>
            <label>Category
              <select value={category} onChange={(e) => setCategory(e.target.value as MessageCategory)}>
                <option value="utility">Utility</option>
                <option value="marketing">Marketing (opted-in guests only)</option>
              </select>
            </label>
          </div>
          <div className={styles.assistant} data-state={blocked ? 'blocked' : 'ok'}>
            <Bot size={18} aria-hidden="true" />
            <div>
              <strong>RSVP assistant</strong>
              <span role={blocked ? 'alert' : undefined}>
                {blocked || `Ready: ${eligible.length} personalised messages from ${sender?.displayName} (${sender?.number}).`}
              </span>
              {hits.length > 0 && (
                <div className={styles.hits}>
                  {hits.map((hit) => (
                    <button key={hit.term} type="button" onClick={() => setText((t) => replaceTerm(t, hit))}>
                      <ShieldAlert size={14} aria-hidden="true" /> “{hit.term}” → {hit.suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primary}
              disabled={!!blocked}
              onClick={() =>
                sender &&
                save((s) => ({
                  ...s,
                  broadcasts: [{ id: `bc-${Date.now()}`, eventId: event.id, senderId: sender.id, category, template, audience, text, status: 'simulated', sent: eligible.length, delivered: eligible.length, read: 0, replied: 0, at: new Date().toLocaleString('en-IN') }, ...s.broadcasts],
                  threads: s.threads.map((t) => (eligible.some((r) => r.id === t.id) ? { ...t, messages: [...t.messages, { id: `b${Date.now()}${t.id}`, from: 'team', senderId: sender.id, category, template, text: personalize(text, t), at: 'now', quickReplies: TEMPLATES[template].quickReplies, status: 'simulated' }] } : t)),
                }), `${eligible.length} personalised messages simulated from ${sender.number} — each guest gets their own name; nothing was sent to WhatsApp.`)
              }
            >
              <Megaphone size={17} aria-hidden="true" /> Simulate {eligible.length} personalised messages
            </button>
          </div>
        </section>
        <section className={styles.phone} aria-label="Personalised preview">
          <div className={styles.phoneHead}>{sender ? `${sender.displayName} · ${sender.number}` : 'No number selected'}</div>
          <div className={styles.phoneBody}>
            {eligible.slice(0, 3).map((t) => (
              <div key={t.id} className={styles.previewRecipient}>
                <small>To {t.contactName} ({t.party.replace(/^Sample\s+/i, '')})</small>
                <div className={styles.bubbleRow} data-from="team">
                  <div className={styles.bubble}>
                    <small className={styles.templateTag}>{category === 'utility' ? 'Utility' : 'Marketing'} · {TEMPLATES[template].label}</small>
                    <p>{personalize(text, t)}</p>
                  </div>
                </div>
              </div>
            ))}
            {eligible.length > 3 && <p className={styles.hint}>…and {eligible.length - 3} more, each with their own name.</p>}
          </div>
        </section>
      </div>
      <section className={styles.card}>
        <h2>Sent broadcasts</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>When</th><th>From</th><th>Category</th><th>Template</th><th>Audience</th><th>Sent</th><th>Delivered</th><th>Read</th><th>Replied</th></tr></thead>
            <tbody>
              {state.broadcasts.filter((b) => b.eventId === event.id).map((b) => (
                <tr key={b.id}><td>{b.at}</td><td>{state.senders.find((x) => x.id === b.senderId)?.displayName ?? '—'}</td><td>{b.category ?? 'utility'}</td><td>{TEMPLATES[b.template]?.label}</td><td>{b.audience}</td><td>{b.sent}</td><td>{b.delivered}</td><td>{b.read}</td><td>{b.replied}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.hint}>Counts are sample figures, not provider delivery receipts.</p>
      </section>
    </div>
  );
}

export function FilesPanel({ state, event }: { state: RsvpChatState; event: RsvpEvent }) {
  const [kind, setKind] = useState<'all' | 'photo' | 'document'>('all');
  const files = state.threads
    .filter((t) => t.eventId === event.id)
    .flatMap((t) => t.media.map((m) => ({ ...m, party: t.party, contactName: t.contactName })))
    .filter((f) => kind === 'all' || f.kind === kind);
  return (
    <div className={styles.panel}>
      <h1>Files · {event.name}</h1>
      <p className={styles.hint}>Photos and documents the assistant collected from guest chats. Sample files only — no real images or IDs are stored.</p>
      <div className={styles.segmentRow}>
        {(['all', 'photo', 'document'] as const).map((k) => (
          <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)}>
            {k === 'all' ? 'All files' : k === 'photo' ? 'Photos' : 'Documents'}
          </button>
        ))}
      </div>
      {files.length === 0 ? (
        <p className={styles.hint}>No files yet. Ask guests for photos and IDs from a chat.</p>
      ) : (
        <div className={styles.fileGrid}>
          {files.map((f) => (
            <article key={f.id} className={styles.fileCard} data-kind={f.kind}>
              <span aria-hidden="true">{f.kind === 'photo' ? <ImageIcon size={34} /> : <FileText size={34} />}</span>
              <strong>{f.name}</strong>
              <small>{f.contactName} · {f.party} · {f.receivedAt}</small>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export function AssistantPanel() {
  const [text, setText] = useState('Hi {name}! Exclusive offer: book now and get 20% off your stay.');
  const hits = checkCompliance(text);
  return (
    <div className={styles.panel}>
      <h1>RSVP assistant</h1>
      <div className={styles.twoCol}>
        <section className={styles.card}>
          <h2>What the assistant does</h2>
          <ul className={styles.ruleList}>
            <li><b>Checks wording before sending.</b> Utility messages that contain promotional words (offer, discount, free, % off…) are blocked until you change them, because WhatsApp can re-categorise or reject them.</li>
            <li><b>Personalises every message.</b> {'{name}'} becomes each guest’s own first name — “Hi Diya” goes only to Diya.</li>
            <li><b>Suggests reply categories.</b> Attending, declined or maybe — a person confirms before counts change.</li>
            <li><b>Collects details and files.</b> Travel, stay, pickup, photos and ID documents are saved to the guest and to Files.</li>
            <li><b>Respects numbers and logins.</b> Messages go out from the number the signed-in team member selected.</li>
          </ul>
        </section>
        <section className={styles.card}>
          <h2>Try the wording check</h2>
          <label>Draft a Utility message
            <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} />
          </label>
          <div className={styles.assistant} data-state={hits.length ? 'blocked' : 'ok'}>
            <Bot size={18} aria-hidden="true" />
            <div>
              <strong>{hits.length ? `${hits.length} promotional word${hits.length > 1 ? 's' : ''} found` : 'Good to send as Utility'}</strong>
              {hits.length > 0 && (
                <div className={styles.hits}>
                  {hits.map((hit) => (
                    <button key={hit.term} type="button" onClick={() => setText((t) => replaceTerm(t, hit))}>
                      <ShieldAlert size={14} aria-hidden="true" /> “{hit.term}” → {hit.suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
      <section className={styles.card}>
        <h2>Recommended WhatsApp setup for the real build</h2>
        <ul className={styles.ruleList}>
          <li><b>WhatsApp Business Platform (Cloud API)</b> from Meta — the official API for business messaging. Each team number is registered to your WhatsApp Business Account, so messages show as sent by that number.</li>
          <li><b>WhatsApp Flows</b> for structured RSVP forms inside the chat — function-wise attendance, travel, stay and pickup — instead of parsing free text.</li>
          <li><b>Media messages</b> for photos and documents guests send; files are downloaded by your server and stored privately with retention rules.</li>
          <li><b>Approved message templates</b> in the right category: Utility for RSVP updates and reminders, Marketing only for opted-in promotional messages.</li>
          <li><b>An official Meta Business Solution Provider</b> if you prefer a managed dashboard and bot builder (for example Gupshup, Interakt, AiSensy or Twilio). Compare pricing, template support and India data handling before choosing.</li>
        </ul>
        <p className={styles.hint}>Recommendation for the backend phase; nothing is connected in this demo.</p>
      </section>
    </div>
  );
}

export function GuestsPanel({ state, event, save, openChat }: { state: RsvpChatState; event: RsvpEvent; save: Save; openChat: () => void }) {
  const threads = state.threads.filter((t) => t.eventId === event.id);
  const [csv, setCsv] = useState('name,party,members,category\nAsha,Sample New family,3,Family');
  const [error, setError] = useState('');
  return (
    <div className={styles.panel}>
      <h1>Guests · {event.name}</h1>
      <section className={styles.card}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>Name</th><th>Party</th><th>Category</th><th>Members</th><th>Response</th>{event.functions.map((f) => <th key={f}>{f}</th>)}<th>Travel</th><th>Pickup</th><th>Stay</th></tr>
            </thead>
            <tbody>
              {threads.map((t) => (
                <tr key={t.id}>
                  <th scope="row">{t.contactName}</th>
                  <td>{t.party}</td>
                  <td>{t.group}</td>
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
        <label>Paste CSV (name,party,members,category)
          <textarea rows={4} value={csv} onChange={(e) => setCsv(e.target.value)} />
        </label>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primary}
            onClick={() => {
              const rows = csv.trim().split(/\r?\n/).slice(1).map((line) => line.split(','));
              const bad = rows.find((r) => r.length !== 4 || !r[0].trim() || !r[1].trim() || !(Number(r[2]) >= 1 && Number(r[2]) <= 30) || !GROUPS.includes(r[3].trim() as (typeof GROUPS)[number]));
              if (!rows.length || bad || rows.length > 50) {
                setError(`Use “name,party,members,category” with 1–50 rows, 1–30 members and a category (${GROUPS.join(', ')}). Invented names only.`);
                return;
              }
              setError('');
              save((s) => ({
                ...s,
                threads: [
                  ...s.threads,
                  ...rows.map(([name, party, members, group], i) => ({
                    id: `${event.id}-n${Date.now()}${i}`,
                    eventId: event.id,
                    party: party.trim(),
                    contactName: name.trim(),
                    group: group.trim() as (typeof GROUPS)[number],
                    media: [],
                    optIn: false,
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
          <h2>Signed in today</h2>
          <p className={styles.hint}>Several team members can use RSVP on the same day. Each one picks the number their messages go out from.</p>
          <ul className={styles.teamList}>
            {state.logins.map((l) => (
              <li key={l.id}>
                <span className={styles.avatar} aria-hidden="true">{l.name.split(' ').map((p) => p[0]).join('')}</span>
                <div>
                  <strong>{l.name}{l.id === state.activeLogin ? ' · you' : ''}</strong>
                  <small>{l.role} · since {l.at} · sends from {state.senders.find((x) => x.id === l.senderId)?.number ?? '—'}</small>
                </div>
              </li>
            ))}
          </ul>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => {
                const pool = ['Lina Fernandes', 'Aman Sethi', 'Zoya Qureshi', 'Rhea Paul'];
                const name = pool.find((n) => !state.logins.some((l) => l.name === n)) ?? `Team member ${state.logins.length + 1}`;
                save((s) => ({ ...s, logins: [...s.logins, { id: `lg-${Date.now()}`, name, role: 'Operator', at: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), senderId: s.senders.find((x) => x.status === 'verified')?.id ?? '' }] }), `${name} signed in to RSVP (sample login).`);
              }}
            >
              Simulate another team login
            </button>
          </div>
        </section>
        <section className={styles.card}>
          <h2>WhatsApp numbers</h2>
          <ul className={styles.teamList}>
            {state.senders.map((x) => (
              <li key={x.id}>
                <div>
                  <strong>{x.displayName}</strong>
                  <small>{x.number} · added by {x.owner}</small>
                </div>
                <span className={styles.tag} data-cat={x.status === 'verified' ? 'attending' : 'maybe'}>{x.status === 'verified' ? 'Verified (sample)' : 'Pending'}</span>
              </li>
            ))}
          </ul>
          <p className={styles.hint}>Add a number from “Add number” at the top left.</p>
        </section>
      </div>
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
