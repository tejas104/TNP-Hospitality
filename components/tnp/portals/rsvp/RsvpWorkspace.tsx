'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BarChart3,
  Check,
  CheckCheck,
  Info,
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  Paperclip,
  Search,
  SendHorizontal,
  Settings,
  Sparkles,
  UsersRound,
  X,
  type LucideIcon,
} from 'lucide-react';
import { StorageWarning } from '../../access/DemoAccess';
import {
  CATEGORY_LABEL,
  eventStats,
  fillTemplate,
  ORGS,
  seedRsvpChat,
  suggestFromMessage,
  TEMPLATES,
  type Category,
  type GuestThread,
  type RsvpChatState,
  type RsvpEvent,
} from './rsvpChatData';
import {
  BroadcastsPanel,
  GuestsPanel,
  ReportsPanel,
  SettingsPanel,
  TodayPanel,
} from './RsvpPanels';
import styles from './RsvpChat.module.css';

export type View = 'today' | 'chats' | 'broadcasts' | 'guests' | 'reports' | 'settings';
export type Save = (change: (s: RsvpChatState) => RsvpChatState, message: string) => void;
const KEY = 'tnp-rsvp-chat-v2';
const RAIL: [View, string, LucideIcon][] = [
  ['today', 'Today', LayoutDashboard],
  ['chats', 'Chats', MessageCircle],
  ['broadcasts', 'Broadcasts', Megaphone],
  ['guests', 'Guests', UsersRound],
  ['reports', 'Reports', BarChart3],
  ['settings', 'Team & settings', Settings],
];
type Filter = 'all' | Category | 'review' | 'travel';
const FILTERS: [Filter, string][] = [
  ['all', 'All'],
  ['review', 'Needs review'],
  ['attending', 'Attending'],
  ['declined', 'Declined'],
  ['maybe', 'Maybe'],
  ['no-reply', 'No reply'],
  ['travel', 'Travel info missing'],
];
const now = () =>
  new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
export const initials = (name: string) =>
  name
    .replace(/^Sample\s+/i, '')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
const needsReview = (t: GuestThread) => !t.confirmed && t.category !== 'no-reply';

export default function RsvpWorkspace({
  eventId,
  orgId,
}: {
  eventId?: string;
  orgId?: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<RsvpChatState>(seedRsvpChat);
  const initialEvent = state.events.find((e) => e.id === eventId);
  const [org, setOrg] = useState<'lotus' | 'marigold'>(
    initialEvent?.org ?? (orgId === 'marigold' ? 'marigold' : 'lotus'),
  );
  const [view, setView] = useState<View>(eventId ? 'chats' : 'today');
  const [activeEvent, setActiveEvent] = useState(
    initialEvent?.id ?? state.events.find((e) => e.org === org)!.id,
  );
  const [notice, setNotice] = useState(
    'Demo workspace. Messages are simulated — WhatsApp and any provider are not connected.',
  );
  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      try {
        const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null');
        if (saved?.version === 2) setState(saved);
      } catch {
        /* Seed stays. */
      }
    });
    return () => {
      active = false;
    };
  }, []);
  const save: Save = (change, message) => {
    setState((current) => {
      const next = change(current);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* Memory only. */
      }
      return next;
    });
    setNotice(message);
  };
  if (eventId && !initialEvent)
    return (
      <main id="main-content" className={styles.missing}>
        <h1>Sample event not found</h1>
        <Link href="/rsvp/workspace">Back to RSVP workspace</Link>
      </main>
    );
  const orgEvents = state.events.filter((e) => e.org === org);
  const event = orgEvents.find((e) => e.id === activeEvent) ?? orgEvents[0];
  const unread = eventStats(state.threads.filter((t) => t.eventId === event.id)).unread;
  const openEvent = (id: string, next: View = 'chats') => {
    setActiveEvent(id);
    setView(next);
  };
  return (
    <main id="main-content" tabIndex={-1} className={styles.app}
      data-own-controls>
      <nav className={styles.rail} aria-label="RSVP sections">
        <span className={styles.logo} aria-hidden="true">
          <MessageCircle size={22} />
        </span>
        {RAIL.map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            title={label}
            aria-current={view === id ? 'page' : undefined}
            onClick={() => setView(id)}
          >
            <Icon size={22} aria-hidden="true" />
            <span>{label}</span>
            {id === 'chats' && unread > 0 && (
              <b aria-label={`${unread} unread`}>{unread}</b>
            )}
          </button>
        ))}
      </nav>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <div className={styles.title}>
            <strong>RSVP on WhatsApp</strong>
            <small>{ORGS[org]} · team workspace · simulated messages only</small>
          </div>
          <label>
            <span>Organisation</span>
            <select
              value={org}
              onChange={(e) => {
                const next = e.target.value as 'lotus' | 'marigold';
                setOrg(next);
                setActiveEvent(state.events.find((x) => x.org === next)!.id);
                if (eventId) router.push('/rsvp/workspace?organization=' + next);
              }}
            >
              <option value="lotus">{ORGS.lotus}</option>
              <option value="marigold">{ORGS.marigold}</option>
            </select>
          </label>
          <label>
            <span>Event</span>
            <select value={event.id} onChange={(e) => setActiveEvent(e.target.value)}>
              {orgEvents.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </label>
          <Link href="/rsvp" className={styles.publicLink}>
            Public RSVP page
          </Link>
        </header>
        <output className={styles.notice} aria-live="polite">
          {notice}
        </output>
        <StorageWarning />
        {view === 'chats' ? (
          <Chats key={event.id} state={state} event={event} save={save} />
        ) : (
          <div className={styles.panelArea}>
            {view === 'today' && <TodayPanel state={state} org={org} openEvent={openEvent} />}
            {view === 'broadcasts' && <BroadcastsPanel state={state} event={event} save={save} />}
            {view === 'guests' && <GuestsPanel state={state} event={event} save={save} openChat={() => setView('chats')} />}
            {view === 'reports' && <ReportsPanel state={state} event={event} />}
            {view === 'settings' && <SettingsPanel state={state} org={org} save={save} />}
          </div>
        )}
      </div>
    </main>
  );
}

function Chats({
  state,
  event,
  save,
}: {
  state: RsvpChatState;
  event: RsvpEvent;
  save: Save;
}) {
  const threads = state.threads.filter((t) => t.eventId === event.id);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState('');
  const [info, setInfo] = useState(true);
  const [draft, setDraft] = useState('');
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const shown = useMemo(
    () =>
      threads.filter((t) => {
        const match =
          filter === 'all' ||
          (filter === 'review'
            ? needsReview(t)
            : filter === 'travel'
              ? t.category === 'attending' && t.travel.mode === '—'
              : t.category === filter);
        return match && t.party.toLowerCase().includes(query.toLowerCase());
      }),
    [threads, filter, query],
  );
  const thread = threads.find((t) => t.id === openId);
  const messageCount = thread?.messages.length ?? 0;
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [openId, messageCount]);
  const setThread = (id: string, change: (t: GuestThread) => GuestThread, message: string) =>
    save((s) => ({ ...s, threads: s.threads.map((t) => (t.id === id ? change(t) : t)) }), message);
  const open = (t: GuestThread) => {
    setOpenId(t.id);
    // The info drawer is a third column on wide screens; on narrow screens it
    // would cover the conversation, so it opens only on request there.
    setInfo(window.matchMedia('(min-width: 1181px)').matches);
    if (t.unread) setThread(t.id, (x) => ({ ...x, unread: 0 }), `Opened chat with ${t.party}.`);
  };
  const send = (text: string, template?: string) => {
    if (!thread || !text.trim()) return;
    setThread(
      thread.id,
      (t) => ({
        ...t,
        messages: [
          ...t.messages,
          {
            id: `m${Date.now()}`,
            from: 'team',
            text: text.trim(),
            at: now(),
            template,
            quickReplies: template ? TEMPLATES[template].quickReplies : undefined,
            status: 'simulated',
          },
        ],
      }),
      `Message to ${thread.party} simulated — nothing was sent to WhatsApp.`,
    );
    setDraft('');
    setTemplatesOpen(false);
  };
  const simulateGuestReply = (text: string) => {
    if (!thread) return;
    const s = suggestFromMessage(text, event.functions);
    setThread(
      thread.id,
      (t) => ({
        ...t,
        suggested: s.category,
        confirmed: false,
        category: t.category === 'no-reply' ? 'needs-review' : t.category,
        members: s.members ?? t.members,
        messages: [...t.messages, { id: `g${Date.now()}`, from: 'guest', text, at: now() }],
      }),
      `Sample guest reply added. Suggested: ${CATEGORY_LABEL[s.category]} — please confirm.`,
    );
  };
  return (
    <div className={styles.chats} data-open={!!thread} data-info={info && !!thread}>
      <section className={styles.list} aria-label="Guest chats">
        <div className={styles.listHead}>
          <h1>{event.name}</h1>
          <small>
            {event.city} · {event.dates} · {threads.length} parties
          </small>
          <label className={styles.searchBox}>
            <Search size={16} aria-hidden="true" />
            <span className={styles.srOnly}>Search chats</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search chats" />
          </label>
          <div className={styles.filters}>
            {FILTERS.map(([id, label]) => (
              <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <ul>
          {shown.length === 0 && <li className={styles.emptyRow}>No chats match this filter.</li>}
          {shown.map((t) => {
            const last = t.messages.at(-1)!;
            return (
              <li key={t.id}>
                <button type="button" aria-current={t.id === openId ? 'true' : undefined} onClick={() => open(t)}>
                  <span className={styles.avatar} aria-hidden="true">
                    {initials(t.party)}
                  </span>
                  <span className={styles.rowMain}>
                    <span className={styles.rowTop}>
                      <strong>{t.party}</strong>
                      <small>{last.at}</small>
                    </span>
                    <span className={styles.rowBottom}>
                      <span className={styles.preview}>
                        {last.from === 'team' && <CheckCheck size={15} aria-hidden="true" className={styles.tick} />}
                        {last.text}
                      </span>
                      {t.unread > 0 && (
                        <b className={styles.unread} aria-label={`${t.unread} unread`}>
                          {t.unread}
                        </b>
                      )}
                    </span>
                    <span className={styles.tag} data-cat={needsReview(t) ? 'needs-review' : t.category}>
                      {needsReview(t) ? 'Needs review' : CATEGORY_LABEL[t.category]}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
      <section className={styles.conversation} aria-label={thread ? `Chat with ${thread.party}` : 'No chat open'}>
        {!thread ? (
          <div className={styles.placeholder}>
            <MessageCircle size={56} aria-hidden="true" />
            <h2>RSVP on WhatsApp</h2>
            <p>
              Pick a chat to read replies, confirm responses and collect travel
              and stay details. Messages here are simulated.
            </p>
          </div>
        ) : (
          <>
            <header className={styles.chatHead}>
              <button type="button" className={styles.back} aria-label="Back to chats" onClick={() => setOpenId('')}>
                <ArrowLeft size={20} aria-hidden="true" />
              </button>
              <span className={styles.avatar} aria-hidden="true">
                {initials(thread.party)}
              </span>
              <div>
                <strong>{thread.party}</strong>
                <small>
                  {thread.contact} · {thread.members} in party
                </small>
              </div>
              <button type="button" className={styles.iconButton} aria-pressed={info} aria-label="Guest info" onClick={() => setInfo((v) => !v)}>
                <Info size={20} aria-hidden="true" />
              </button>
            </header>
            <div className={styles.messages} ref={scroller}>
              <p className={styles.dayChip}>Messages are simulated for the demo · delivery is not connected</p>
              {thread.messages.map((m) => (
                <div key={m.id} className={styles.bubbleRow} data-from={m.from}>
                  <div className={styles.bubble}>
                    {m.template && (
                      <small className={styles.templateTag}>Template · {TEMPLATES[m.template]?.label}</small>
                    )}
                    <p>{m.text}</p>
                    <span className={styles.meta}>
                      {m.at}
                      {m.from === 'team' &&
                        (m.status === 'simulated' ? (
                          <Check size={14} aria-label="Simulated" />
                        ) : (
                          <CheckCheck size={14} aria-label={m.status === 'sample-read' ? 'Sample read' : 'Sample delivered'} data-read={m.status === 'sample-read'} />
                        ))}
                    </span>
                    {m.quickReplies && (
                      <div className={styles.quick}>
                        {m.quickReplies.map((q) => (
                          <button key={q} type="button" onClick={() => simulateGuestReply(q)} title="Simulate the guest tapping this reply">
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {templatesOpen && (
              <div className={styles.templates} aria-label="Message templates">
                {Object.entries(TEMPLATES).map(([key, t]) => (
                  <button key={key} type="button" onClick={() => send(fillTemplate(key, thread, event), key)}>
                    <strong>{t.label}</strong>
                    <small>{fillTemplate(key, thread, event)}</small>
                  </button>
                ))}
              </div>
            )}
            <form
              className={styles.composer}
              onSubmit={(e) => {
                e.preventDefault();
                send(draft);
              }}
            >
              <button type="button" className={styles.iconButton} aria-pressed={templatesOpen} aria-label="Message templates" onClick={() => setTemplatesOpen((v) => !v)}>
                <Sparkles size={20} aria-hidden="true" />
              </button>
              <button type="button" className={styles.iconButton} aria-label="Attachments are disabled in the demo" disabled>
                <Paperclip size={20} aria-hidden="true" />
              </button>
              <label className={styles.srOnly} htmlFor="rsvp-composer">
                Type a message
              </label>
              <input id="rsvp-composer" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message (simulated)" />
              <button type="submit" className={styles.sendButton} aria-label="Send simulated message" disabled={!draft.trim()}>
                <SendHorizontal size={20} aria-hidden="true" />
              </button>
            </form>
          </>
        )}
      </section>
      {thread && info && (
        <GuestInfo thread={thread} event={event} setThread={setThread} close={() => setInfo(false)} />
      )}
    </div>
  );
}

function GuestInfo({
  thread,
  event,
  setThread,
  close,
}: {
  thread: GuestThread;
  event: RsvpEvent;
  setThread: (id: string, change: (t: GuestThread) => GuestThread, message: string) => void;
  close: () => void;
}) {
  const lastGuest = [...thread.messages].reverse().find((m) => m.from === 'guest');
  const edit = (change: (t: GuestThread) => GuestThread, message: string) =>
    setThread(thread.id, change, message);
  return (
    <aside className={styles.info} aria-label="Guest info">
      <header>
        <button type="button" className={styles.iconButton} aria-label="Close guest info" onClick={close}>
          <X size={20} aria-hidden="true" />
        </button>
        <strong>Guest info</strong>
      </header>
      <div className={styles.infoBody}>
        <div className={styles.infoHero}>
          <span className={styles.avatarLarge} aria-hidden="true">
            {initials(thread.party)}
          </span>
          <h2>{thread.party}</h2>
          <small>{thread.contact}</small>
        </div>
        <section className={styles.infoCard}>
          <h3>Response</h3>
          {lastGuest && (
            <blockquote>
              “{lastGuest.text}”
              <small>Original message kept exactly as received</small>
            </blockquote>
          )}
          {needsReview(thread) ? (
            <div className={styles.suggest}>
              <p>
                Suggested: <b>{CATEGORY_LABEL[thread.suggested]}</b>. A person
                confirms before it counts.
              </p>
              <div className={styles.chipRow}>
                {(['attending', 'declined', 'maybe'] as Category[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    data-primary={c === thread.suggested}
                    onClick={() => edit((t) => ({ ...t, category: c, confirmed: true }), `${thread.party} confirmed as ${CATEGORY_LABEL[c]} by a team member (sample).`)}
                  >
                    Confirm {CATEGORY_LABEL[c]}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className={styles.confirmed}>
              <span className={styles.tag} data-cat={thread.category}>
                {CATEGORY_LABEL[thread.category]}
              </span>
              {thread.confirmed && ' · confirmed by team'}
              {thread.confirmed && (
                <button type="button" className={styles.textButton} onClick={() => edit((t) => ({ ...t, confirmed: false, category: 'needs-review' }), `${thread.party} sent back to review.`)}>
                  Re-open review
                </button>
              )}
            </p>
          )}
          <label>
            Party size
            <input type="number" min="0" max="30" value={thread.members} onChange={(e) => edit((t) => ({ ...t, members: Math.max(0, Math.min(30, Number(e.target.value))) }), `Party size updated for ${thread.party}.`)} />
          </label>
        </section>
        <section className={styles.infoCard}>
          <h3>Function-wise</h3>
          {event.functions.map((f) => (
            <div key={f} className={styles.fnRow}>
              <span>{f}</span>
              <div className={styles.segment}>
                {(['yes', 'no', 'unknown'] as const).map((v) => (
                  <button key={v} type="button" aria-pressed={thread.functions[f] === v} aria-label={`${f}: ${v}`} onClick={() => edit((t) => ({ ...t, functions: { ...t.functions, [f]: v } }), `${thread.party}: ${f} set to ${v}.`)}>
                    {v === 'unknown' ? '?' : v === 'yes' ? 'Yes' : 'No'}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>
        <section className={styles.infoCard}>
          <h3>Travel & stay (information only)</h3>
          <label>
            Travel mode
            <select value={thread.travel.mode} onChange={(e) => edit((t) => ({ ...t, travel: { ...t.travel, mode: e.target.value } }), 'Travel mode updated.')}>
              {['—', 'Flight', 'Train', 'Road', 'Local'].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
          <label>
            Arrival
            <input value={thread.travel.arrival} onChange={(e) => edit((t) => ({ ...t, travel: { ...t.travel, arrival: e.target.value } }), 'Arrival updated.')} />
          </label>
          <label>
            Flight / train reference
            <input value={thread.travel.reference} onChange={(e) => edit((t) => ({ ...t, travel: { ...t.travel, reference: e.target.value } }), 'Travel reference updated.')} />
          </label>
          <label>
            Pickup
            <select value={thread.pickup} onChange={(e) => edit((t) => ({ ...t, pickup: e.target.value as GuestThread['pickup'] }), 'Pickup need updated.')}>
              <option value="unknown">Not known</option>
              <option value="needed">Pickup needed</option>
              <option value="not-needed">Not needed</option>
            </select>
          </label>
          <label>
            Stay
            <input value={thread.stay} placeholder="e.g. Need 2 rooms" onChange={(e) => edit((t) => ({ ...t, stay: e.target.value }), 'Stay preference updated.')} />
          </label>
          <label>
            Dietary notes
            <input value={thread.dietary} onChange={(e) => edit((t) => ({ ...t, dietary: e.target.value }), 'Dietary notes updated.')} />
          </label>
          <p className={styles.hint}>
            Collected details only — RSVP never books tickets, rooms or vehicles.
          </p>
        </section>
      </div>
    </aside>
  );
}
