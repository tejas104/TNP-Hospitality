'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoAccess, StorageWarning } from '../../access/DemoAccess';
import {
  canUseRsvp,
  events,
  initialRsvp,
  readRsvp,
  scopeGuests,
  updateReply,
  importGuests,
  reportCsv,
  type RsvpState,
  type Reply,
} from './rsvp-state';
import styles from './RsvpWorkspace.module.css';
const KEY = 'tnp-rsvp-message-only-v1';
const REPLY_LABEL: Record<Reply, string> = {
  yes: 'Attending',
  no: 'Declined',
  pending: 'Awaiting reply',
  'needs-review': 'Needs review',
};
const REPLY_ORDER: Reply[] = ['yes', 'no', 'pending', 'needs-review'];
type GuestRow = ReturnType<typeof scopeGuests>[number];
/** Response counts with one proportional bar; each count can open that state. */
function ResponseSummary({
  guests,
  onPick,
}: {
  guests: GuestRow[];
  onPick?: (reply: Reply) => void;
}) {
  const total = guests.length || 1;
  return (
    <div className={styles.summary}>
      <div className={styles.bar} aria-hidden="true">
        {REPLY_ORDER.map((r) => (
          <span
            key={r}
            data-reply={r}
            style={{
              width: `${(guests.filter((g) => g.reply === r).length / total) * 100}%`,
            }}
          />
        ))}
      </div>
      <ul>
        {REPLY_ORDER.map((r) => {
          const count = guests.filter((g) => g.reply === r).length;
          const body = (
            <>
              <i data-reply={r} aria-hidden="true" />
              <strong>{count}</strong> {REPLY_LABEL[r]}
            </>
          );
          return (
            <li key={r}>
              {onPick ? (
                <button type="button" onClick={() => onPick(r)}>
                  {body}
                </button>
              ) : (
                <span>{body}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
export function RsvpEntry() {
  const access = useDemoAccess();
  const router = useRouter();
  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <p className={styles.kicker}>Dedicated team access · synthetic</p>
      <h1>RSVP team workspace</h1>
      <p>
        This dedicated preview is separate from public workspace entry. No real
        guest information, live messages or production authentication.
      </p>
      <StorageWarning />
      <button
        disabled={!access.ready}
        onClick={() => {
          access.select('rsvp-team');
          router.push('/rsvp/workspace');
        }}
      >
        Enter sample RSVP team
      </button>
      <p>
        <Link href="/services/rsvp">Read about the RSVP service →</Link>
      </p>
    </main>
  );
}
export default function RsvpWorkspace({
  eventId,
  orgId,
}: {
  eventId?: string;
  orgId?: string;
}) {
  const router = useRouter();
  const event = events.find((e) => e.id === eventId);
  const [org, setOrg] = useState<string>(
    event?.org ?? (orgId === 'marigold' ? 'marigold' : 'lotus'),
  );
  const [tab, setTab] = useState('Overview');
  const [state, setState] = useState<RsvpState>(initialRsvp);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('Loading local sample records…');
  const [selected, setSelected] = useState('');
  const [reply, setReply] = useState<Reply>('yes');
  const [people, setPeople] = useState('2');
  const [csv, setCsv] = useState('name,party,people\nSample Guest,Party C,2');
  const [message, setMessage] = useState(
    'Please share your attendance and travel information for our sample event.',
  );
  const [filter, setFilter] = useState('');
  const [entitlement, setEntitlement] = useState('active');
  const [capabilityRole, setCapabilityRole] = useState('manager');
  const [sampleDate, setSampleDate] = useState('2026-09-24');
  const [mode, setMode] = useState('ready');
  const busy = false;
  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      try {
        setState(readRsvp(localStorage.getItem(KEY)));
        setNotice('Local synthetic records. No WhatsApp message is sent.');
      } catch {
        setNotice(
          'Storage unavailable. Changes will remain in memory for this visit.',
        );
      }
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);
  const currentEvent = event?.org === org ? event : undefined;
  const guests = scopeGuests(state, org, currentEvent?.id);
  const visible = guests.filter((g) =>
    (g.name + ' ' + g.party + ' ' + g.reply + ' ' + REPLY_LABEL[g.reply])
      .toLowerCase()
      .includes(filter.toLowerCase()),
  );
  const guest = guests.find((g) => g.id === selected);
  const writable =
    ready &&
    canUseRsvp(entitlement, capabilityRole, sampleDate, 'review') &&
    mode === 'ready' &&
    !busy;
  const orgEvents = events.filter((e) => e.org === org);
  function save(next: RsvpState, text: string) {
    if (!writable) {
      setNotice('Read-only sample scope: no changes saved.');
      return;
    }
    setState(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      setNotice(text + ' Saved locally; nothing sent externally.');
    } catch {
      setNotice(text + ' Memory only: browser storage unavailable.');
    }
  }
  function chooseTab(next: string) {
    setSelected('');
    setFilter('');
    setTab(next);
  }
  if (eventId && !event)
    return (
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <h1>Sample event not found</h1>
        <Link href="/rsvp/workspace">Return to organization Today</Link>
      </main>
    );
  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>
            RSVP team workspace · {org === 'marigold' ? 'Marigold' : 'Lotus'}{' '}
            sample organization
          </p>
          <h1>{currentEvent?.name ?? 'Today, across your events.'}</h1>
          <p>
            {currentEvent
              ? currentEvent.date
              : 'Review unanswered replies and missing information before your next message.'}
          </p>
        </div>
        <label>
          Sample organization
          <select
            value={org}
            onChange={(e) => {
              setSelected('');
              setFilter('');
              setOrg(e.target.value);
              setTab('Overview');
              if (eventId)
                router.push('/rsvp/workspace?organization=' + e.target.value);
            }}
          >
            <option value="lotus">Lotus events</option>
            <option value="marigold">Marigold events</option>
          </select>
        </label>
      </header>
      <p className={styles.staffNote}>
        Staff workspace for the RSVP team. Guests never see this screen.{' '}
        <Link href="/rsvp">Public RSVP information →</Link>
      </p>
      <p className={styles.warning}>
        Synthetic preview data. Do not enter real personal information. No live
        messaging, verification, tracking or payments.
      </p>
      <StorageWarning />
      <details className={styles.controls}>
        <summary>Sample scenario controls</summary>
      <div className={styles.toolbar}>
        <label>
          Sample capability role
          <select
            value={capabilityRole}
            onChange={(e) => {
              setCapabilityRole(e.target.value);
              setSelected('');
            }}
          >
            <option value="manager">Event manager</option>
            <option value="operator">Message operator</option>
            <option value="viewer">Read-only viewer</option>
          </select>
        </label>
        <label>
          Sample entitlement date
          <input
            type="date"
            value={sampleDate}
            onChange={(e) => {
              setSampleDate(e.target.value);
              setSelected('');
            }}
          />
        </label>
        <label>
          Entitlement preview
          <select
            value={entitlement}
            onChange={(e) => {
              setEntitlement(e.target.value);
              setSelected('');
            }}
          >
            {[
              'active',
              'scheduled',
              'suspended',
              'grace read-only',
              'expired',
              'revoked',
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          View state
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            {['ready', 'loading', 'empty', 'error'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <Link href={'/rsvp/workspace?organization=' + org}>
          Organization Today
        </Link>
      </div>
      </details>
      {!canUseRsvp(entitlement, capabilityRole, sampleDate, 'review') && (
        <p className={styles.warning}>
          Read-only preview: entitlement is {entitlement}, role is{' '}
          {capabilityRole}, and the permitted sample window is 1–30 September
          2026. Provider readiness is separate. No record can be changed in this
          state.
        </p>
      )}
      <output aria-live="polite">{notice}</output>
      {!ready || mode === 'loading' ? (
        <section aria-busy="true">
          <h2>Loading sample workspace…</h2>
          <p>No stale actions are available.</p>
          {ready && (
            <button onClick={() => setMode('ready')}>
              Finish loading preview
            </button>
          )}
        </section>
      ) : mode === 'error' ? (
        <section>
          <h2>Could not read the sample workspace</h2>
          <p>Records are retained. Retry without creating a second message.</p>
          <button onClick={() => setMode('ready')}>
            Retry reading records
          </button>
        </section>
      ) : mode === 'empty' ? (
        <section>
          <h2>No events in this sample view</h2>
          <button onClick={() => setMode('ready')}>
            Restore sample events
          </button>
        </section>
      ) : (
        <>
          {!currentEvent ? (
            <>
              <section className={styles.next}>
                <p className={styles.kicker}>Next action</p>
                <h2>Resolve ambiguous replies.</h2>
                <p>
                  {guests.filter((g) => !g.reviewed).length} parties need a
                  human decision. Original messages remain unchanged.
                </p>
                <Link
                  className={styles.action}
                  href={'/rsvp/events/' + orgEvents[0].id}
                >
                  Open next event →
                </Link>
              </section>
              <div className={styles.events}>
                {orgEvents.map((e) => {
                  const rows = scopeGuests(state, org, e.id);
                  return (
                    <article key={e.id}>
                      <p>{e.date}</p>
                      <h2>{e.name}</h2>
                      <ResponseSummary guests={rows} />
                      <p>
                        {rows.filter((g) => !g.reviewed).length} parties to
                        review
                      </p>
                      <p>Owner: {e.owner} · synthetic</p>
                      <Link
                        className={styles.action}
                        href={'/rsvp/events/' + e.id}
                      >
                        Open event workspace →
                      </Link>
                    </article>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <nav className={styles.tabs} aria-label="Event workspace">
                {[
                  'Overview',
                  'Guests',
                  'WhatsApp inbox',
                  'Campaigns',
                  'Collected information',
                  'Reports',
                  'Team & settings',
                ].map((name) => (
                  <button
                    key={name}
                    aria-pressed={tab === name}
                    onClick={() => chooseTab(name)}
                  >
                    {name}
                  </button>
                ))}
              </nav>
              {tab === 'Overview' && (
                <section className={styles.next}>
                  <p className={styles.kicker}>Next action</p>
                  <h2>
                    {guests.filter((g) => !g.reviewed).length} replies need
                    review
                  </h2>
                  <ResponseSummary
                    guests={guests}
                    onPick={(r) => {
                      chooseTab('Guests');
                      setFilter(REPLY_LABEL[r]);
                    }}
                  />
                  <p>
                    Check the original reply before confirming attendance.
                    Information entries describe preferences, not reservations.
                  </p>
                  <button onClick={() => chooseTab('WhatsApp inbox')}>
                    Review WhatsApp replies
                  </button>
                </section>
              )}
              {['Guests', 'WhatsApp inbox', 'Collected information'].includes(
                tab,
              ) && (
                <>
                  <label className={styles.search}>
                    Filter parties
                    <input
                      value={filter}
                      onChange={(e) => {
                        setFilter(e.target.value);
                        setSelected('');
                      }}
                      placeholder="Name, party or response"
                    />
                  </label>
                  <div className={styles.split}>
                    <section>
                      {visible.length ? (
                        visible.map((g) => (
                          <button
                            className={styles.row}
                            key={g.id}
                            aria-pressed={selected === g.id}
                            onClick={() => {
                              setSelected(g.id);
                              setReply(g.reply);
                              setPeople(String(g.people));
                            }}
                          >
                            <strong>{g.name}</strong>
                            <span>
                              {g.party} · {g.people} people
                            </span>
                            <em data-reply={g.reply}>{REPLY_LABEL[g.reply]}</em>
                          </button>
                        ))
                      ) : (
                        <p>
                          No matching parties.{' '}
                          <button onClick={() => setFilter('')}>
                            Clear filter
                          </button>
                        </p>
                      )}
                    </section>
                    <section className={styles.detail}>
                      {guest ? (
                        <>
                          <h2>{guest.name}</h2>
                          <p>{guest.party}</p>
                          <h3>Original message</h3>
                          <blockquote>{guest.original}</blockquote>
                          {tab === 'Collected information' ? (
                            <dl>
                              <dt>Travel information</dt>
                              <dd>{guest.travel}</dd>
                              <dt>Stay preference</dt>
                              <dd>{guest.stay}</dd>
                              <dt>Pickup information</dt>
                              <dd>{guest.pickup}</dd>
                            </dl>
                          ) : (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                try {
                                  save(
                                    updateReply(
                                      state,
                                      org,
                                      currentEvent.id,
                                      guest.id,
                                      reply,
                                      Number(people),
                                    ),
                                    'Human review recorded.',
                                  );
                                } catch (error) {
                                  setNotice((error as Error).message);
                                }
                              }}
                            >
                              <label>
                                Confirmed response
                                <select
                                  value={reply}
                                  disabled={!writable}
                                  onChange={(e) =>
                                    setReply(e.target.value as Reply)
                                  }
                                >
                                  {['pending', 'yes', 'no', 'needs-review'].map(
                                    (v) => (
                                      <option key={v}>{v}</option>
                                    ),
                                  )}
                                </select>
                              </label>
                              <label>
                                Party size
                                <input
                                  type="number"
                                  min="0"
                                  max="30"
                                  value={people}
                                  disabled={!writable}
                                  onChange={(e) => setPeople(e.target.value)}
                                />
                              </label>
                              <button disabled={!writable}>
                                Save sample review
                              </button>
                              {(guest.reply === 'pending' ||
                                guest.reply === 'needs-review') && (
                                <button
                                  type="button"
                                  className={styles.secondary}
                                  disabled={!writable}
                                  onClick={() =>
                                    save(
                                      {
                                        ...state,
                                        campaigns: [
                                          ...state.campaigns,
                                          {
                                            id: crypto.randomUUID(),
                                            org,
                                            event: currentEvent.id,
                                            text: `Follow-up for ${guest.party}: a gentle reminder to confirm attendance and party size.`,
                                            state: 'draft',
                                          },
                                        ],
                                      },
                                      `Follow-up draft prepared for ${guest.party}. Not sent — see Campaigns.`,
                                    )
                                  }
                                >
                                  Prepare follow-up draft (not sent)
                                </button>
                              )}
                              {!writable && (
                                <p className={styles.hint}>
                                  Editing is off for this sample role or
                                  entitlement. Change it under Sample scenario
                                  controls.
                                </p>
                              )}
                            </form>
                          )}
                        </>
                      ) : (
                        <>
                          <h2>Select a party</h2>
                          <p>
                            Each event keeps its own guest, reply and
                            information selection.
                          </p>
                        </>
                      )}
                    </section>
                  </div>
                  {tab === 'Guests' && (
                    <form
                      className={styles.detail}
                      onSubmit={(e) => {
                        e.preventDefault();
                        try {
                          const rows = importGuests(
                            csv,
                            org,
                            currentEvent.id,
                            crypto.randomUUID(),
                          );
                          save(
                            { ...state, guests: [...state.guests, ...rows] },
                            rows.length + ' sample parties imported.',
                          );
                          setCsv('name,party,people');
                        } catch (error) {
                          setNotice((error as Error).message);
                        }
                      }}
                    >
                      <h2>Add sample parties</h2>
                      <label>
                        Paste simple CSV (name,party,people)
                        <textarea
                          rows={4}
                          value={csv}
                          disabled={!writable}
                          onChange={(e) => setCsv(e.target.value)}
                        />
                      </label>
                      <p>
                        1–50 rows. Use invented values; no commas inside fields.
                      </p>
                      <button disabled={!writable}>
                        Validate and import locally
                      </button>
                    </form>
                  )}
                </>
              )}
              {tab === 'Campaigns' && (
                <section className={styles.detail}>
                  <h2>WhatsApp draft</h2>
                  <p>
                    Provider and template approval are not connected. Queue
                    simulation is local only.
                  </p>
                  <label>
                    Sample message
                    <textarea
                      rows={4}
                      maxLength={1000}
                      value={message}
                      disabled={!writable}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </label>
                  <button
                    disabled={!writable || !message.trim()}
                    onClick={() => {
                      save(
                        {
                          ...state,
                          campaigns: [
                            ...state.campaigns,
                            {
                              id: crypto.randomUUID(),
                              org,
                              event: currentEvent.id,
                              text: message,
                              state: 'draft',
                            },
                          ],
                        },
                        'Draft saved.',
                      );
                    }}
                  >
                    Save draft
                  </button>
                  <button
                    disabled={!writable || !message.trim()}
                    onClick={() => {
                      save(
                        {
                          ...state,
                          campaigns: [
                            ...state.campaigns,
                            {
                              id: crypto.randomUUID(),
                              org,
                              event: currentEvent.id,
                              text: message,
                              state: 'queued-preview',
                            },
                          ],
                        },
                        'Local queue simulated. No provider delivery.',
                      );
                    }}
                  >
                    {busy ? 'Preparing sample queue…' : 'Simulate local queue'}
                  </button>
                  {state.campaigns
                    .filter((c) => c.org === org && c.event === currentEvent.id)
                    .map((c) => (
                      <article key={c.id} className={styles.campaign}>
                        <strong>
                          {c.state === 'draft'
                            ? 'Draft · not sent'
                            : 'Local queue simulation · not delivered'}
                        </strong>
                        <p>{c.text}</p>
                      </article>
                    ))}
                </section>
              )}
              {tab === 'Reports' && (
                <section className={styles.detail}>
                  <h2>Event response report</h2>
                  <p>
                    {guests.length} sample parties. Export includes this event
                    only and protects spreadsheet cells.
                  </p>
                  <button
                    disabled={
                      !writable ||
                      !canUseRsvp(
                        entitlement,
                        capabilityRole,
                        sampleDate,
                        'export',
                      )
                    }
                    onClick={() => {
                      if (
                        !writable ||
                        !canUseRsvp(
                          entitlement,
                          capabilityRole,
                          sampleDate,
                          'export',
                        )
                      ) {
                        setNotice('This sample scope cannot export.');
                        return;
                      }
                      const url = URL.createObjectURL(
                        new Blob([reportCsv(guests)], {
                          type: 'text/csv;charset=utf-8',
                        }),
                      );
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'sample-rsvp-' + currentEvent.id + '.csv';
                      a.click();
                      setTimeout(() => URL.revokeObjectURL(url), 1000);
                      setNotice(
                        'Sample event report downloaded. No external data fetched.',
                      );
                    }}
                  >
                    Download sample CSV
                  </button>
                  <table>
                    <thead>
                      <tr>
                        <th>Party</th>
                        <th>Response</th>
                        <th>People</th>
                      </tr>
                    </thead>
                    <tbody>
                      {guests.map((g) => (
                        <tr key={g.id}>
                          <td>{g.party}</td>
                          <td>{REPLY_LABEL[g.reply]}</td>
                          <td>{g.people}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}
              {tab === 'Team & settings' && (
                <section className={styles.detail}>
                  <h2>Team and entitlement</h2>
                  <p>{currentEvent.owner} · sample event manager</p>
                  <p>
                    Scope: {org} / {currentEvent.id}. Entitlement: {entitlement}
                    .
                  </p>
                  <p>
                    Production invitations and capability administration require
                    reviewed server authorization.
                  </p>
                  <button disabled aria-describedby="rsvp-invite-note">
                    Invite teammate — not connected
                  </button>
                  <p id="rsvp-invite-note" className={styles.hint}>
                    Disabled in this demo: inviting people needs real accounts
                    and server authorization.
                  </p>
                </section>
              )}
            </>
          )}
        </>
      )}
    </main>
  );
}
