'use client';

import {
  BedDouble,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  FileBarChart,
  FileLock2,
  FileUp,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  PhoneCall,
  Plane,
  RefreshCw,
  RotateCcw,
  Sun,
  UserPlus,
  Users,
  Van,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { COMMAND_ROLES, ROLE_SECTIONS, type Access, type AdapterError, type Command, type Scenario } from './adapter';
import { daysBetween, formatDay, localDate } from './dates';
import { buildPartyRows, EMPTY_FILTERS, type GuestFilters } from './logic';
import { MODE_LABEL, ROLE_LABEL, type EventData, type Organization, type Section } from './model';
import { CalendarSection } from './Calendar';
import { CallsSection } from './Calls';
import { DocumentsSection } from './Documents';
import { AddPartySection } from './AddParty';
import { GuestsSection } from './Guests';
import { ImportSection } from './ImportGuests';
import { MessagingSection } from './Messaging';
import { MovementsSection, TravelSection } from './Logistics';
import { OverviewSection, TodaySection } from './Overview';
import { ReportsSection } from './ReportCenter';
import { RoomingSection } from './Rooming';
import type { GoOptions, SectionProps } from './types';
import {
  EventActionCtx,
  FeedbackProvider,
  getAdapter,
  IllustrativeImage,
  Modal,
  MotionProvider,
  readPersona,
  Skeleton,
  StatePanel,
  Tag,
  useFeedback,
  pushSearch,
  useNow,
  useStored,
  useUrlSearch,
  writePersona,
  styles,
} from './ui';

const NAV: Array<{ id: Section; label: string; group: string; icon: typeof Users }> = [
  { id: 'overview', label: 'Overview', group: 'Event', icon: LayoutDashboard },
  { id: 'today', label: 'Today', group: 'Event', icon: Sun },
  { id: 'calendar', label: 'Service calendar', group: 'Event', icon: CalendarDays },
  { id: 'guests', label: 'Guests & parties', group: 'Guests', icon: Users },
  { id: 'add', label: 'Add a party', group: 'Guests', icon: UserPlus },
  { id: 'import', label: 'Import CSV', group: 'Guests', icon: FileUp },
  { id: 'calls', label: 'Calling queue', group: 'Guests', icon: PhoneCall },
  { id: 'travel', label: 'Travel', group: 'Hospitality', icon: Plane },
  { id: 'movements', label: 'Pickup & drop', group: 'Hospitality', icon: Van },
  { id: 'rooming', label: 'Stay & rooming', group: 'Hospitality', icon: BedDouble },
  { id: 'messages', label: 'Messages', group: 'Control', icon: MessageSquareText },
  { id: 'documents', label: 'Documents', group: 'Control', icon: FileLock2 },
  { id: 'reports', label: 'Reports & exports', group: 'Control', icon: FileBarChart },
];

export const SECTION_TITLE: Record<Section, string> = Object.fromEntries(NAV.map((n) => [n.id, n.label])) as Record<Section, string>;

export function RsvpWorkspace({ eventId }: { eventId: string | null }) {
  return (
    <MotionProvider>
      <FeedbackProvider>
        <Suspense fallback={<ShellLoading />}>
          <Workspace eventId={eventId} />
        </Suspense>
      </FeedbackProvider>
    </MotionProvider>
  );
}

function ShellLoading() {
  return (
    <main className={styles.root} id="main-content" tabIndex={-1}>
      <div className={styles.loadingShell}>
        <Skeleton rows={5} label="Loading the RSVP workspace" />
      </div>
    </main>
  );
}

type AccessState = { phase: 'checking' } | { phase: 'signed-out' } | { phase: 'loading' } | { phase: 'ready'; value: Access } | { phase: 'error'; error: AdapterError };

function Workspace({ eventId }: { eventId: string | null }) {
  const router = useRouter();
  const search = useSearchParams();
  const personaId = useStored(readPersona);
  const [nonce, setNonce] = useState(0);
  const [result, setResult] = useState<{ key: string; state: AccessState } | null>(null);
  const [switching, setSwitching] = useState<{ label: string; from: string } | null>(null);
  const orgParam = search.get('org');
  const contextKey = `${eventId}|${orgParam}`;
  const requestKey = `${personaId}|${nonce}`;

  useEffect(() => {
    if (!personaId) return;
    let live = true;
    void getAdapter()
      .access(personaId)
      .then((r) => {
        // Results for a superseded persona or retry are ignored.
        if (live) setResult({ key: requestKey, state: r.ok ? { phase: 'ready', value: r.value } : { phase: 'error', error: r.error } });
      });
    return () => {
      live = false;
    };
  }, [personaId, requestKey]);

  const state: AccessState =
    personaId === undefined ? { phase: 'checking' } : personaId === null ? { phase: 'signed-out' } : result?.key === requestKey ? result.state : { phase: 'loading' };
  // A switch is pending until the route context changes.
  const switchingLabel = switching && switching.from === contextKey ? switching.label : null;

  const signOut = () => {
    writePersona(null);
    router.push('/rsvp/login');
  };

  const switchTo = (href: string, label: string) => {
    // Hide current records immediately so a slow switch never shows the previous context.
    setSwitching({ label, from: contextKey });
    router.push(href);
  };

  if (state.phase === 'checking' || state.phase === 'loading') return <ShellLoading />;
  if (state.phase === 'signed-out') {
    return (
      <Frame>
        <StatePanel
          title="You are signed out"
          action={
            <Link className={styles.btnPrimary} href="/rsvp/login">
              Choose a preview persona
            </Link>
          }
        >
          <p>This synthetic preview has no real sign-in. Choose a labelled sample persona to explore the RSVP workspace.</p>
        </StatePanel>
      </Frame>
    );
  }
  if (state.phase === 'error') return <AccessError error={state.error} onRetry={() => setNonce((n) => n + 1)} onSignOut={signOut} />;

  const access = state.value;
  if (switchingLabel) {
    return (
      <Frame>
        <Skeleton rows={6} label={`Switching to ${switchingLabel}`} />
        <p className={styles.meta}>Switching to {switchingLabel.replace(/\.$/, '')}. Previous records are hidden until the new context loads.</p>
      </Frame>
    );
  }
  if (!eventId) {
    const org = access.organizations.find((o) => o.id === orgParam) ?? access.organizations[0];
    return <WorkspaceHome access={access} org={org} onSwitch={switchTo} onSignOut={signOut} />;
  }
  const event = access.events.find((e) => e.id === eventId);
  if (!event) {
    return (
      <Frame>
        <StatePanel
          tone="locked"
          title="This event is not available"
          action={
            <Link className={styles.btnPrimary} href="/rsvp/workspace">
              Go to your events
            </Link>
          }
        >
          <p>It may not exist, or your current access does not include it. For your security we do not say which.</p>
        </StatePanel>
      </Frame>
    );
  }
  const org = access.organizations.find((o) => o.id === event.orgId) as Organization;
  // Keyed remount: every context change starts from clean selection, filters, receipts and data.
  return <EventWorkspace key={`${personaId}|${event.id}`} access={access} org={org} eventId={event.id} personaId={personaId as string} onSwitch={switchTo} onSignOut={signOut} />;
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <main className={styles.root} id="main-content" tabIndex={-1}>
      <div className={styles.frame}>
        <p className={styles.previewLabel}>Synthetic RSVP preview · no real guest data, sign-in, messaging or documents</p>
        {children}
      </div>
    </main>
  );
}

function AccessError({ error, onRetry, onSignOut }: { error: AdapterError; onRetry: () => void; onSignOut: () => void }) {
  const copy: Record<string, { title: string; body: string; tone: 'error' | 'locked' | 'warning' }> = {
    suspended: { title: 'Organization suspended', body: 'New sessions and actions are blocked while this organization is suspended. Contact TNP administration to reactivate it.', tone: 'locked' },
    expired: { title: 'Service period expired', body: 'This organization’s RSVP service period has ended. Renewal and data export are handled by TNP administration.', tone: 'locked' },
    revoked: { title: 'Session revoked', body: 'This session was ended by an administrator. Sign in again to continue.', tone: 'locked' },
    offline: { title: 'You appear to be offline', body: 'Nothing is shown rather than out-of-date records. Retry when connected.', tone: 'warning' },
    unavailable: { title: 'Service unavailable', body: 'The RSVP service did not respond. Nothing was changed.', tone: 'error' },
    'not-found': { title: 'Persona not found', body: 'Choose another preview persona.', tone: 'error' },
    forbidden: { title: 'Access denied', body: 'No active membership grants access to an RSVP workspace.', tone: 'locked' },
  };
  const c = copy[error.code] ?? { title: 'Something went wrong', body: error.message, tone: 'error' as const };
  return (
    <Frame>
      <StatePanel
        tone={c.tone}
        title={c.title}
        action={
          <>
            {error.retryable && (
              <button type="button" className={styles.btnPrimary} onClick={onRetry}>
                <RefreshCw size={15} aria-hidden /> Retry
              </button>
            )}
            <button type="button" className={styles.btnSecondary} onClick={onSignOut}>
              Choose another persona
            </button>
          </>
        }
      >
        <p>{c.body}</p>
        <p className={styles.meta}>{error.message}</p>
      </StatePanel>
    </Frame>
  );
}

// ---------- Organization home: event list ----------

function WorkspaceHome({ access, org, onSwitch, onSignOut }: { access: Access; org: Organization; onSwitch: (href: string, label: string) => void; onSignOut: () => void }) {
  const events = access.events.filter((e) => e.orgId === org.id);
  const now = useNow();
  return (
    <main className={styles.root} id="main-content" tabIndex={-1}>
      <div className={`${styles.homeBand} ${styles.reveal}`}>
        <p className={styles.previewLabel}>Synthetic RSVP preview · no real guest data, sign-in, messaging or documents</p>
        <p className={styles.kicker}>{ROLE_LABEL[access.persona.role]} · {access.persona.name}</p>
        <h1>Your RSVP events</h1>
        <div className={styles.homeControls}>
          <OrgSwitcher access={access} current={org.id} onSwitch={onSwitch} />
          <button type="button" className={styles.btnGhostLight} onClick={onSignOut}>
            <LogOut size={15} aria-hidden /> Sign out
          </button>
        </div>
        {access.blocked.length > 0 && (
          <p className={styles.bandNote}>
            {access.blocked.map((b) => `${b.org.name}: ${b.reason === 'suspended' ? 'suspended' : 'service period expired'}`).join(' · ')} — not selectable.
          </p>
        )}
      </div>
      <div className={styles.homeSurface}>
        {events.length === 0 ? (
          <StatePanel title="No events yet">
            <p>{org.name} has no RSVP events you can access. A vendor owner or TNP service manager creates events and grants access.</p>
          </StatePanel>
        ) : (
          <ul className={styles.eventCards}>
            {events.map((e, i) => {
              const eng = access.engagements.find((x) => x.id === e.engagementId);
              const cust = access.customers.find((c) => c.id === eng?.customerId);
              const t = daysBetween(localDate(now, e.timezone), e.startsOn);
              return (
                <li key={e.id} className={styles.eventCard} style={{ '--i': i } as CSSProperties}>
                  <IllustrativeImage image={{ id: `rsvp-event-${e.id}`, mediaId: e.imageId, alt: `Illustrative setting for ${e.name}`, provenance: 'Unsplash preview media via data/media' }} />
                  <div>
                    <p className={styles.kickerDark}>{eng ? MODE_LABEL[eng.mode] : ''} · {cust?.name}</p>
                    <h2>{e.name}</h2>
                    <p>
                      {e.city} · starts {formatDay(e.startsOn)} · {e.timezone}
                    </p>
                    <p className={styles.meta}>{t > 0 ? `T-${t} days` : t === 0 ? 'Function day' : `${-t} days after start`}</p>
                    <button type="button" className={styles.btnPrimary} onClick={() => onSwitch(`/rsvp/events/${e.id}`, e.name)}>
                      Open event workspace
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}

function OrgSwitcher({ access, current, onSwitch }: { access: Access; current: string; onSwitch: (href: string, label: string) => void }) {
  if (access.organizations.length < 2) {
    return <p className={styles.orgName}>{access.organizations[0]?.name}</p>;
  }
  return (
    <label className={styles.switcher}>
      <span>Organization</span>
      <select
        value={current}
        onChange={(e) => {
          const org = access.organizations.find((o) => o.id === e.target.value);
          if (org) onSwitch(`/rsvp/workspace?org=${org.id}`, org.name);
        }}
      >
        {access.organizations.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </label>
  );
}

// ---------- Event workspace ----------

type DataState = { phase: 'loading' } | { phase: 'ready'; data: EventData; loadedAt: number; changedIds: Set<string> } | { phase: 'error'; error: AdapterError };

function EventWorkspace({
  access,
  org,
  eventId,
  personaId,
  onSwitch,
  onSignOut,
}: {
  access: Access;
  org: Organization;
  eventId: string;
  personaId: string;
  onSwitch: (href: string, label: string) => void;
  onSignOut: () => void;
}) {
  const urlSearch = useUrlSearch();
  const search = useMemo(() => new URLSearchParams(urlSearch), [urlSearch]);
  const announce = useFeedback();
  const now = useNow();
  const [state, setState] = useState<DataState>({ phase: 'loading' });
  const [refreshError, setRefreshError] = useState<AdapterError | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [externalRevision, setExternalRevision] = useState<number | null>(null);
  const [loadKey, setLoadKey] = useState(0);
  const [filters, setFilters] = useState<GuestFilters>(EMPTY_FILTERS);
  const [drawer, setDrawer] = useState(false);
  const [scenario, setScenarioState] = useState<Scenario>('none');
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstView = useRef(true);
  const persona = access.persona;
  const event = access.events.find((e) => e.id === eventId);
  const engagement = access.engagements.find((e) => e.id === event?.engagementId);
  const customer = access.customers.find((c) => c.id === engagement?.customerId);

  const allowed = ROLE_SECTIONS[persona.role];
  const entitled = (s: Section) => org.entitlements.includes(s);
  const visibleNav = NAV.filter((n) => allowed.includes(n.id));
  const requested = search.get('view') as Section | null;
  const view: Section = requested && allowed.includes(requested) ? requested : visibleNav[0].id;
  const selectedParty = search.get('party');

  // Every load (initial, refresh, retry, reset) is keyed; cleanup discards superseded results,
  // so a stale read never overwrites newer state.
  useEffect(() => {
    let live = true;
    void getAdapter()
      .loadEvent(personaId, eventId)
      .then((r) => {
        if (!live) return;
        setRefreshing(false);
        if (r.ok) {
          setRefreshError(null);
          setExternalRevision(null);
          setState((prev) => {
            const before = prev.phase === 'ready' ? new Map(prev.data.parties.map((p) => [p.id, p.version])) : null;
            const changedIds = new Set(before ? r.value.parties.filter((p) => before.get(p.id) !== p.version).map((p) => p.id) : []);
            return { phase: 'ready', data: r.value, loadedAt: Date.now(), changedIds };
          });
        } else {
          // Visible data stays (labelled possibly out of date); an error never becomes an empty list.
          setRefreshError(r.error);
          setState((prev) => (prev.phase === 'ready' ? prev : { phase: 'error', error: r.error }));
        }
      });
    return () => {
      live = false;
    };
  }, [personaId, eventId, loadKey]);

  // "Updated since you opened this": compare the service revision with the loaded one.
  const loadedRevision = state.phase === 'ready' ? state.data.dataRevision : null;
  useEffect(() => {
    if (loadedRevision === null) return;
    const t = window.setInterval(() => {
      if (refreshing) return;
      const rev = getAdapter().revision(personaId, eventId);
      setExternalRevision(rev !== null && rev > loadedRevision ? rev : null);
    }, 2500);
    return () => window.clearInterval(t);
  }, [loadedRevision, refreshing, personaId, eventId]);

  const setUrl = pushSearch;

  const go = useCallback((next: Section, opts?: GoOptions) => {
    if (opts?.filters) setFilters({ ...EMPTY_FILTERS, ...opts.filters });
    pushSearch({ view: next, party: opts?.party ?? null });
    setDrawer(false);
  }, []);

  const selectParty = useCallback((id: string | null) => pushSearch({ view: 'guests', party: id }), []);

  useEffect(() => {
    if (firstView.current) {
      firstView.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: false });
  }, [view]);

  const can = useCallback((type: Command['type']) => {
    const map: Record<Command['type'], Section> = {
      'record-call': 'calls',
      reschedule: 'calls',
      'update-responses': 'guests',
      'update-party': 'guests',
      'bulk-assign-caller': 'guests',
      'create-party': 'add',
      'change-leg': 'travel',
      transfer: 'movements',
      'assign-vehicle': 'movements',
      'replan-transfer': 'movements',
      stay: 'rooming',
      'generate-report': 'reports',
    };
    // Presentation hint only; the adapter re-checks every command.
    return COMMAND_ROLES[type].includes(persona.role) && org.entitlements.includes(map[type]);
  }, [persona.role, org.entitlements]);

  const rows = useMemo(() => (state.phase === 'ready' ? buildPartyRows(state.data, now) : []), [state, now]);
  const refresh = useCallback(() => {
    setRefreshing(true);
    setLoadKey((k) => k + 1);
  }, []);
  const actionContext = useMemo(() => ({ personaId, eventId, refresh }), [personaId, eventId, refresh]);
  const reloadInitial = () => {
    // Loading (not ready) state also resets the changed-row baseline.
    setState({ phase: 'loading' });
    setRefreshError(null);
    setLoadKey((k) => k + 1);
  };

  const setScenario = (s: Scenario) => {
    getAdapter().setScenario(s);
    setScenarioState(s);
    announce('info', s === 'none' ? 'Preview conditions cleared.' : `Next request will simulate: ${s.replace('-', ' ')}.`);
  };

  const resetData = () => {
    getAdapter().reset();
    setScenarioState('none');
    setFilters(EMPTY_FILTERS);
    setUrl({ view, party: null }, true);
    reloadInitial();
    announce('info', 'Synthetic data reset for this browser tab.');
  };

  const eventsForOrg = access.events.filter((e) => e.orgId === org.id);
  const today = event ? localDate(now, event.timezone) : '';
  const tMinus = event ? daysBetween(today, event.startsOn) : 0;

  const sidebar = (
    <SidebarNav
      nav={visibleNav}
      view={view}
      entitled={entitled}
      onGo={(s) => go(s)}
      footer={
        <PreviewConditions
          scenario={scenario}
          onScenario={setScenario}
          onReset={resetData}
          onExternalEdit={
            selectedParty
              ? () => {
                  getAdapter().simulateExternalEdit(eventId, selectedParty);
                  announce('info', 'Simulated another coordinator editing the selected party.');
                }
              : null
          }
          storage={getAdapter().storageStatus}
        />
      }
    />
  );

  const sectionProps: SectionProps | null =
    state.phase === 'ready'
      ? { data: state.data, rows, now, persona, org, contextLabels: { customer: customer?.name ?? null, engagement: engagement?.name ?? null }, can, canView: (s: Section) => allowed.includes(s) && entitled(s), refresh, go, filters, setFilters, selectedParty, selectParty, changedIds: state.changedIds }
      : null;

  // Rendered in the desktop sidebar and in the compact drawer, so every destination stays reachable.
  const contextBlock = (
    <div className={styles.sideContext}>
      <p className={styles.kicker}>{engagement ? MODE_LABEL[engagement.mode] : 'RSVP'}</p>
      <OrgSwitcher access={access} current={org.id} onSwitch={onSwitch} />
      {eventsForOrg.length > 1 ? (
        <label className={styles.switcher}>
          <span>Event</span>
          <select value={eventId} onChange={(e) => onSwitch(`/rsvp/events/${e.target.value}`, eventsForOrg.find((x) => x.id === e.target.value)?.name ?? 'event')}>
            {eventsForOrg.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p className={styles.sideEvent}>{event?.name}</p>
      )}
      {(customer || engagement) && <p className={styles.sideRole}>{[customer?.name, engagement?.name].filter(Boolean).join(' · ')}</p>}
      <p className={styles.sideRole}>
        {ROLE_LABEL[persona.role]} · {persona.name}
      </p>
    </div>
  );
  const signOutButton = (
    <button type="button" className={styles.signOut} onClick={onSignOut}>
      <LogOut size={15} aria-hidden /> Sign out of preview
    </button>
  );

  return (
    <main className={styles.root} id="main-content" tabIndex={-1}>
      <div className={styles.shell}>
        <aside className={styles.sidebar} aria-label="RSVP workspace">
          {contextBlock}
          {sidebar}
          {signOutButton}
        </aside>
        <div className={styles.main}>
          <header className={styles.header}>
            <p className={styles.previewLabel}>Synthetic preview · sample records in this browser tab only · no live messaging, documents, inventory or audit evidence</p>
            <nav aria-label="Context" className={styles.breadcrumb}>
              <ol>
                <li>{org.name}</li>
                {customer && <li className={styles.crumbWide}>{customer.name}</li>}
                {engagement && <li className={styles.crumbWide}>{engagement.name}</li>}
                <li aria-current="page">
                  {event?.name} <span className={styles.tz}>({event?.timezone})</span>
                </li>
              </ol>
            </nav>
            <div className={styles.headerRow}>
              <div>
                <p className={styles.kicker}>
                  {SECTION_TITLE[view]} · {tMinus > 0 ? `T-${tMinus}` : tMinus === 0 ? 'Function day' : 'After event'}
                </p>
                <h1 ref={headingRef} tabIndex={-1} key={view} className={styles.viewTitle}>
                  {SECTION_TITLE[view]}
                </h1>
              </div>
              <div className={styles.headerTools}>
                <Tag tone="muted">{ROLE_LABEL[persona.role]}</Tag>
                <button type="button" className={styles.compactNavBtn} onClick={() => setDrawer(true)} aria-haspopup="dialog">
                  <Menu size={16} aria-hidden /> Sections
                </button>
              </div>
            </div>
            {externalRevision !== null && (
              <output className={styles.updatedBanner}>
                <CalendarClock size={16} aria-hidden />
                <span>Updated since you opened this. Refresh to see the latest records; your filters and selection are kept.</span>
                <button type="button" className={styles.btnSecondary} onClick={refresh}>
                  Refresh
                </button>
              </output>
            )}
            {refreshError && state.phase === 'ready' && (
              <div className={styles.updatedBanner} role="alert">
                <span>
                  Refresh failed ({refreshError.message}). Showing records loaded at {new Date(state.loadedAt).toLocaleTimeString()} — they may be out of date.
                </span>
                <button type="button" className={styles.btnSecondary} onClick={refresh}>
                  Retry refresh
                </button>
              </div>
            )}
          </header>
          <div className={styles.surface} aria-busy={state.phase === 'loading' || refreshing}>
            {state.phase === 'loading' && <Skeleton rows={7} label="Loading event records" />}
            {state.phase === 'error' && (
              <StatePanel
                tone="error"
                title="The event could not be loaded"
                action={
                  <button type="button" className={styles.btnPrimary} onClick={reloadInitial}>
                    <RefreshCw size={15} aria-hidden /> Retry
                  </button>
                }
              >
                <p>{state.error.message}</p>
                <p className={styles.meta}>No records are shown rather than possibly wrong ones.</p>
              </StatePanel>
            )}
            {sectionProps && (
              <EventActionCtx.Provider value={actionContext}>
                <div key={view} className={styles.sectionEnter}>
                  {!entitled(view) ? (
                    <StatePanel tone="locked" title="Not included in this organization’s package">
                      <p>{org.name}’s current entitlement does not include {SECTION_TITLE[view].toLowerCase()}. TNP administration manages packages; nothing here changes billing.</p>
                    </StatePanel>
                  ) : (
                    <SectionView view={view} props={sectionProps} />
                  )}
                </div>
              </EventActionCtx.Provider>
            )}
          </div>
        </div>
      </div>
      <Modal open={drawer} title="Workspace sections" onClose={() => setDrawer(false)} variant="drawer">
        <div className={styles.drawerDark}>{contextBlock}</div>
        <SidebarNav nav={visibleNav} view={view} entitled={entitled} onGo={(s) => go(s)} compact />
        <div className={styles.drawerDark}>
          <PreviewConditions scenario={scenario} onScenario={setScenario} onReset={resetData} onExternalEdit={null} storage={getAdapter().storageStatus} />
          {signOutButton}
        </div>
      </Modal>
    </main>
  );
}

function SectionView({ view, props }: { view: Section; props: SectionProps }) {
  switch (view) {
    case 'overview':
      return <OverviewSection {...props} />;
    case 'today':
      return <TodaySection {...props} />;
    case 'calendar':
      return <CalendarSection {...props} />;
    case 'guests':
      return <GuestsSection {...props} />;
    case 'add':
      return <AddPartySection {...props} />;
    case 'import':
      return <ImportSection {...props} />;
    case 'calls':
      return <CallsSection {...props} />;
    case 'travel':
      return <TravelSection {...props} />;
    case 'movements':
      return <MovementsSection {...props} />;
    case 'rooming':
      return <RoomingSection {...props} />;
    case 'messages':
      return <MessagingSection {...props} />;
    case 'documents':
      return <DocumentsSection {...props} />;
    case 'reports':
      return <ReportsSection {...props} />;
  }
}

function SidebarNav({
  nav,
  view,
  entitled,
  onGo,
  footer,
  compact = false,
}: {
  nav: typeof NAV;
  view: Section;
  entitled: (s: Section) => boolean;
  onGo: (s: Section) => void;
  footer?: ReactNode;
  compact?: boolean;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<{ top: number; height: number } | null>(null);
  useEffect(() => {
    const active = listRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    if (active) setIndicator({ top: active.offsetTop, height: active.offsetHeight });
  }, [view]);
  const groups = [...new Set(nav.map((n) => n.group))];
  return (
    <nav aria-label={compact ? 'Sections' : 'RSVP sections'} className={compact ? styles.navCompact : styles.nav}>
      <div ref={listRef} className={styles.navList}>
        {indicator && <span className={styles.navIndicator} style={{ transform: `translateY(${indicator.top}px)`, height: indicator.height }} aria-hidden />}
        {groups.map((g) => (
          <div key={g} className={styles.navGroup}>
            <p className={styles.navGroupLabel}>{g}</p>
            {nav
              .filter((n) => n.group === g)
              .map((n) => {
                const Icon = n.icon;
                return (
                  <button key={n.id} type="button" className={styles.navItem} aria-current={view === n.id ? 'page' : undefined} onClick={() => onGo(n.id)}>
                    <Icon size={16} aria-hidden />
                    <span>{n.label}</span>
                    {!entitled(n.id) && <small>Not in package</small>}
                  </button>
                );
              })}
          </div>
        ))}
      </div>
      {footer}
    </nav>
  );
}

function PreviewConditions({
  scenario,
  onScenario,
  onReset,
  onExternalEdit,
  storage,
}: {
  scenario: Scenario;
  onScenario: (s: Scenario) => void;
  onReset: () => void;
  onExternalEdit: (() => void) | null;
  storage: string;
}) {
  const [confirmReset, setConfirmReset] = useState(false);
  return (
    <details className={styles.conditions}>
      <summary>
        <ClipboardList size={15} aria-hidden /> Preview conditions
      </summary>
      <p className={styles.metaLight}>Synthetic controls for testing states. They affect only this browser tab.</p>
      <label className={styles.switcher}>
        <span>Next request simulates</span>
        <select value={scenario} onChange={(e) => onScenario(e.target.value as Scenario)}>
          <option value="none">Normal response</option>
          <option value="error">Service failure (before applying)</option>
          <option value="offline">Offline</option>
          <option value="lost-response">Lost response after success</option>
          <option value="partial-import">Partial import failure</option>
        </select>
      </label>
      {onExternalEdit && (
        <button type="button" className={styles.btnGhostLight} onClick={onExternalEdit}>
          Simulate another coordinator editing the open party
        </button>
      )}
      {confirmReset ? (
        <div className={styles.confirmRow}>
          <span>Reset all synthetic changes in this tab?</span>
          <button type="button" className={styles.btnDangerLight} onClick={() => { setConfirmReset(false); onReset(); }}>
            Reset
          </button>
          <button type="button" className={styles.btnGhostLight} onClick={() => setConfirmReset(false)}>
            Keep changes
          </button>
        </div>
      ) : (
        <button type="button" className={styles.btnGhostLight} onClick={() => setConfirmReset(true)}>
          <RotateCcw size={14} aria-hidden /> Reset synthetic data
        </button>
      )}
      <p className={styles.metaLight}>
        Storage: {storage === 'session' ? 'this tab’s session storage' : storage === 'memory' ? 'memory only' : 'unavailable — changes last until reload'}
      </p>
    </details>
  );
}
