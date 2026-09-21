'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BarChart3,
  Bot,
  Check,
  CheckCheck,
  FileText,
  FolderOpen,
  ImageIcon,
  Phone,
  Plus,
  ShieldAlert,
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
import { GenieWindow } from '../../public/portal-launcher/PortalLauncher';
import {
  CATEGORY_LABEL,
  checkCompliance,
  eventStats,
  fillTemplate,
  GROUPS,
  ORGS,
  replaceTerm,
  seedRsvpChat,
  suggestFromMessage,
  TEMPLATES,
  type Category,
  type Group,
  type GuestThread,
  type MessageCategory,
  type RsvpChatState,
  type RsvpEvent,
} from './rsvpChatData';
import {
  AssistantPanel,
  BroadcastsPanel,
  FilesPanel,
  GuestsPanel,
  ReportsPanel,
  SettingsPanel,
  TodayPanel,
} from './RsvpPanels';
import styles from './RsvpChat.module.css';

export type View = 'today' | 'chats' | 'broadcasts' | 'guests' | 'files' | 'assistant' | 'reports' | 'settings';
export type Save = (change: (s: RsvpChatState) => RsvpChatState, message: string) => void;
const KEY = 'tnp-rsvp-chat-v3';
const RAIL: [View, string, LucideIcon][] = [
  ['today', 'Today', LayoutDashboard],
  ['chats', 'Chats', MessageCircle],
  ['broadcasts', 'Broadcasts', Megaphone],
  ['guests', 'Guests', UsersRound],
  ['files', 'Files', FolderOpen],
  ['assistant', 'Assistant', Bot],
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
        if (saved?.version === 3) setState(saved);
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
          <SenderBar state={state} save={save} />
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
            {view === 'files' && <FilesPanel state={state} event={event} />}
            {view === 'assistant' && <AssistantPanel />}
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
  const [group, setGroup] = useState<Group | 'all'>('all');
  const [category, setCategory] = useState<MessageCategory>('utility');
  const login = state.logins.find((l) => l.id === state.activeLogin);
  const sender = state.senders.find((s) => s.id === login?.senderId);
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
        return (
          match &&
          (group === 'all' || t.group === group) &&
          `${t.party} ${t.contactName}`.toLowerCase().includes(query.toLowerCase())
        );
      }),
    [threads, filter, query, group],
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
  const hits = category === 'utility' ? checkCompliance(draft) : [];
  const blockedReason = !sender
    ? 'Choose a sending number first.'
    : sender.status !== 'verified'
      ? `${sender.number} is still pending verification.`
      : hits.length
        ? 'Replace the promotional words flagged below, or switch to Marketing.'
        : category === 'marketing' && thread && !thread.optIn
          ? `${thread.contactName} has not opted in to marketing messages.`
          : '';
  const send = (text: string, template?: string) => {
    if (!thread || !text.trim() || !sender || sender.status !== 'verified') return;
    if (!template && blockedReason) return;
    setThread(
      thread.id,
      (t) => ({
        ...t,
        messages: [
          ...t.messages,
          {
            id: `m${Date.now()}`,
            from: 'team',
            senderId: sender.id,
            category: template ? 'utility' : category,
            text: text.trim(),
            at: now(),
            template,
            quickReplies: template ? TEMPLATES[template].quickReplies : undefined,
            status: 'simulated',
          },
        ],
      }),
      `Message to ${thread.contactName} (${thread.party}) simulated from ${sender.number} — nothing was sent to WhatsApp.`,
    );
    setDraft('');
    setTemplatesOpen(false);
  };
  const simulateGuestFile = () => {
    if (!thread) return;
    const n = thread.media.length + 1;
    const file = {
      id: `${thread.id}-f${n}-${thread.messages.length}`,
      kind: n % 2 ? ('photo' as const) : ('document' as const),
      name: `${thread.contactName} · ${n % 2 ? 'guest photo' : 'ID document'} ${n} (sample${n % 2 ? '' : ', redacted'})`,
      receivedAt: now(),
    };
    setThread(
      thread.id,
      (t) => ({
        ...t,
        media: [...t.media, file],
        messages: [
          ...t.messages,
          { id: `g${Date.now()}`, from: 'guest', text: file.kind === 'photo' ? 'Photo' : 'Document', at: now(), attachment: file },
          { id: `b${Date.now()}`, from: 'system', text: `Assistant saved “${file.name}” to ${t.party}'s files.`, at: now() },
        ],
      }),
      `Sample ${file.kind} received from ${thread.contactName} and saved to Files.`,
    );
  };
  const simulateGuestReply = (text: string) => {
    if (!thread) return;
    if (/send photos now/i.test(text)) {
      simulateGuestFile();
      return;
    }
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
          <div className={styles.filters} aria-label="Guest category">
            {(['all', ...GROUPS] as const).map((g) => (
              <button key={g} type="button" data-kind="group" aria-pressed={group === g} onClick={() => setGroup(g)}>
                {g === 'all' ? 'Every category' : g}
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
                      <strong>
                        {t.contactName} · {t.party.replace(/^Sample\s+/i, '')}
                      </strong>
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
                <strong>
                  {thread.contactName} · {thread.party}
                </strong>
                <small>
                  {thread.contact} · {thread.members} in party · {thread.group}
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
                    {m.attachment ? (
                      <div className={styles.attachment} data-kind={m.attachment.kind}>
                        {m.attachment.kind === 'photo' ? <ImageIcon size={28} aria-hidden="true" /> : <FileText size={28} aria-hidden="true" />}
                        <span>{m.attachment.name}</span>
                      </div>
                    ) : (
                      <p>{m.text}</p>
                    )}
                    <span className={styles.meta}>
                      {m.from === 'team' && m.senderId && (
                        <span className={styles.via}>
                          via {state.senders.find((s) => s.id === m.senderId)?.displayName ?? 'unknown number'}
                          {m.category === 'marketing' ? ' · marketing' : ''} ·{' '}
                        </span>
                      )}
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
            <div className={styles.assistant} data-state={blockedReason && draft.trim() ? 'blocked' : 'ok'}>
              <Bot size={18} aria-hidden="true" />
              <div>
                <strong>RSVP assistant</strong>
                {!draft.trim() ? (
                  <span>
                    Sending from {sender ? `${sender.displayName} · ${sender.number}` : 'no number'} as{' '}
                    {category === 'utility' ? 'Utility' : 'Marketing'}. I’ll check the wording before it can be sent.
                  </span>
                ) : blockedReason ? (
                  <span role="alert">{blockedReason}</span>
                ) : (
                  <span>Looks good for a {category === 'utility' ? 'Utility' : 'Marketing'} message.</span>
                )}
                {hits.length > 0 && (
                  <div className={styles.hits}>
                    {hits.map((hit) => (
                      <button key={hit.term} type="button" onClick={() => setDraft((d) => replaceTerm(d, hit))}>
                        <ShieldAlert size={14} aria-hidden="true" /> “{hit.term}” → {hit.suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <label className={styles.categorySelect}>
                <span className={styles.srOnly}>Message category</span>
                <select value={category} onChange={(e) => setCategory(e.target.value as MessageCategory)}>
                  <option value="utility">Utility</option>
                  <option value="marketing">Marketing</option>
                </select>
              </label>
            </div>
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
              <input id="rsvp-composer" value={draft} onChange={(e) => setDraft(e.target.value.replaceAll('{name}', thread.contactName))} placeholder={`Message ${thread.contactName} (simulated)`} />
              <button type="submit" className={styles.sendButton} aria-label="Send simulated message" disabled={!draft.trim() || !!blockedReason}>
                <SendHorizontal size={20} aria-hidden="true" />
              </button>
            </form>
          </>
        )}
      </section>
      {thread && info && (
        <GuestInfo
          thread={thread}
          event={event}
          setThread={setThread}
          close={() => setInfo(false)}
          requestFiles={() => send(fillTemplate('documents', thread, event), 'documents')}
          simulateFile={simulateGuestFile}
        />
      )}
    </div>
  );
}

function GuestInfo({
  thread,
  event,
  setThread,
  close,
  requestFiles,
  simulateFile,
}: {
  thread: GuestThread;
  event: RsvpEvent;
  setThread: (id: string, change: (t: GuestThread) => GuestThread, message: string) => void;
  close: () => void;
  requestFiles: () => void;
  simulateFile: () => void;
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
          <h3>Contact & category</h3>
          <label>
            First name used in messages
            <input value={thread.contactName} onChange={(e) => edit((t) => ({ ...t, contactName: e.target.value }), 'First name updated.')} />
          </label>
          <label>
            Guest category
            <select value={thread.group} onChange={(e) => edit((t) => ({ ...t, group: e.target.value as Group }), `${thread.contactName} moved to ${e.target.value}.`)}>
              {GROUPS.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </label>
          <label className={styles.checkRow}>
            <input type="checkbox" checked={thread.optIn} onChange={() => edit((t) => ({ ...t, optIn: !t.optIn }), `Marketing opt-in ${thread.optIn ? 'removed' : 'recorded'} (sample).`)} />
            Opted in to marketing messages (sample)
          </label>
        </section>
        <section className={styles.infoCard}>
          <h3>Documents & photos</h3>
          {thread.media.length === 0 ? (
            <p className={styles.hint}>Nothing received yet.</p>
          ) : (
            <ul className={styles.fileList}>
              {thread.media.map((m) => (
                <li key={m.id}>
                  {m.kind === 'photo' ? <ImageIcon size={18} aria-hidden="true" /> : <FileText size={18} aria-hidden="true" />}
                  <span>{m.name}</span>
                  <small>{m.receivedAt}</small>
                </li>
              ))}
            </ul>
          )}
          <div className={styles.chipRow}>
            <button type="button" onClick={requestFiles}>Ask for photo & ID (bot)</button>
            <button type="button" onClick={simulateFile}>Simulate a guest upload</button>
          </div>
          <p className={styles.hint}>Sample files only. Real ID documents need secure storage and retention rules before launch.</p>
        </section>
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

function SenderBar({ state, save }: { state: RsvpChatState; save: Save }) {
  const login = state.logins.find((l) => l.id === state.activeLogin) ?? state.logins[0];
  const [adding, setAdding] = useState(false);
  const addButton = useRef<HTMLButtonElement>(null);
  return (
    <div className={styles.senderBar}>
      <label>
        <span>
          <Phone size={13} aria-hidden="true" /> Sending from
        </span>
        <select
          value={login?.senderId ?? ''}
          onChange={(e) =>
            save(
              (s) => ({ ...s, logins: s.logins.map((l) => (l.id === login.id ? { ...l, senderId: e.target.value } : l)) }),
              `${login.name} now sends from ${state.senders.find((x) => x.id === e.target.value)?.number}.`,
            )
          }
        >
          {state.senders.map((s) => (
            <option key={s.id} value={s.id}>
              {s.displayName} · {s.number}
              {s.status === 'pending' ? ' · verification pending' : ''}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Signed in as</span>
        <select
          value={login?.id ?? ''}
          onChange={(e) => save((s) => ({ ...s, activeLogin: e.target.value }), `Switched to ${state.logins.find((l) => l.id === e.target.value)?.name} (sample login).`)}
        >
          {state.logins.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name} · {l.role} · since {l.at}
            </option>
          ))}
        </select>
      </label>
      <button ref={addButton} type="button" className={styles.addNumber} onClick={() => setAdding(true)}>
        <Plus size={16} aria-hidden="true" /> Add number
      </button>
      <GenieWindow sourceRef={addButton} open={adding} onClose={() => setAdding(false)} title="Add a WhatsApp number" label="Close add number">
        <AddNumber
          owner={login?.name ?? 'Team member'}
          onDone={(sender) => {
            save(
              (s) => ({
                ...s,
                senders: [...s.senders, sender],
                logins: s.logins.map((l) => (l.id === login.id ? { ...l, senderId: sender.id } : l)),
              }),
              `${sender.displayName} (${sender.number}) verified in the demo and selected for ${login.name}.`,
            );
            setAdding(false);
          }}
        />
      </GenieWindow>
    </div>
  );
}

const NUMBER_RULES = [
  'The number belongs to your business and can receive an SMS or voice call for the one-time code.',
  'It is not active on the personal WhatsApp or WhatsApp Business app (or it is migrated from it first).',
  'The display name matches your business and follows WhatsApp display-name guidelines.',
  'The number is added to your WhatsApp Business Account through the Cloud API or an approved provider.',
  'Guests have agreed to receive messages from you; marketing messages need separate opt-in.',
];

function AddNumber({ owner, onDone }: { owner: string; onDone: (sender: RsvpChatState['senders'][number]) => void }) {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [step, setStep] = useState<'details' | 'code'>('details');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const digits = number.replace(/\D/g, '');
  return (
    <div className={styles.addNumberBody}>
      <p className={styles.hint}>
        Each team member can add the number they will message from today. Messages then show as sent by that number. Demo only — no code is sent and no number is registered.
      </p>
      <h3>WhatsApp requirements</h3>
      <ul className={styles.rules}>
        {NUMBER_RULES.map((rule) => (
          <li key={rule}>
            <Check size={15} aria-hidden="true" /> {rule}
          </li>
        ))}
      </ul>
      {step === 'details' ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim() || digits.length < 10 || digits.length > 13) {
              setError('Enter a display name and a 10–13 digit number (use an invented number).');
              return;
            }
            setError('');
            setStep('code');
          }}
        >
          <label>
            Display name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Lotus Events RSVP" />
          </label>
          <label>
            WhatsApp number
            <input value={number} inputMode="tel" onChange={(e) => setNumber(e.target.value)} placeholder="+91 90000 00000 (invented)" />
          </label>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <button type="submit" className={styles.primary}>Send verification code (simulated)</button>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (code !== '123456') {
              setError('For the demo, the code is 123456.');
              return;
            }
            onDone({
              id: `sd-${Date.now()}`,
              displayName: name.trim(),
              number: `+${digits.slice(0, 2)} ${digits.slice(2, 4)}•• ••• ${digits.slice(-4)} (sample)`,
              owner,
              status: 'verified',
            });
          }}
        >
          <p className={styles.hint}>A 6-digit code would arrive by SMS or voice call. Demo code: 123456.</p>
          <label>
            Verification code
            <input value={code} inputMode="numeric" maxLength={6} onChange={(e) => setCode(e.target.value)} />
          </label>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <button type="submit" className={styles.primary}>Verify and use this number</button>
        </form>
      )}
    </div>
  );
}
