'use client';

import { AlertCircle, ArrowRight, CalendarDays, RefreshCw, Search, UsersRound } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Metric } from '@/components/tnp/shared/Metric';
import { StatusPill } from '@/components/tnp/shared/StatusPill';
import type {
  Assignment,
  MutationRequest,
  Position,
  PreviewError,
  PreviewEvent,
  PreviewService,
  Requirement,
  Worker,
} from '@/lib/contracts/preview';
import { PREVIEW_OPERATIONS } from '@/lib/demo/service';
import { getBrowserPreviewService } from '@/lib/services/preview';
import styles from './AdminOperations.module.css';

type Panel = 'overview' | 'events' | 'requirements';
type LoadState =
  | { kind: 'loading'; message: string }
  | { kind: 'ready'; message: string }
  | { kind: 'empty'; message: string }
  | { kind: 'error'; message: string };

type DashboardData = {
  events: PreviewEvent[];
  positions: Position[];
  requirements: Requirement[];
  roster: Assignment[];
  workers: Record<string, Worker>;
  metrics: Record<string, number>;
};

const emptyData: DashboardData = {
  events: [],
  positions: [],
  requirements: [],
  roster: [],
  workers: {},
  metrics: {},
};

const workingNavigation: Array<{ id: Panel; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'events', label: 'Events & roster' },
  { id: 'requirements', label: 'Requirements' },
];

const futureNavigation = [
  'Verification review',
  'Attendance exceptions',
  'Ratings',
  'Finance & payouts',
  'RSVP',
  'Reports',
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(value));
}

function errorState(error: PreviewError): LoadState {
  if (error.code === 'PREVIEW_LOADING') {
    return { kind: 'loading', message: 'The synthetic scenario is in its loading state.' };
  }
  return { kind: 'error', message: error.message };
}

function StatePanel({ state, onRetry }: { state: Exclude<LoadState, { kind: 'ready' }>; onRetry: () => void }) {
  const isLoading = state.kind === 'loading';
  return (
    <section className={styles.statePanel} aria-live="polite" aria-busy={isLoading}>
      {isLoading ? <RefreshCw className={styles.spin} aria-hidden="true" /> : <AlertCircle aria-hidden="true" />}
      <div>
        <p className="section-kicker">{state.kind === 'empty' ? 'EMPTY SAMPLE STATE' : 'PREVIEW STATE'}</p>
        <h2>{state.message}</h2>
        <p>
          {state.kind === 'empty'
            ? 'Choose Ready in Preview controls or reset the synthetic scenario to restore the two linked functions.'
            : 'No production system was contacted. Retry after changing the synthetic preview state.'}
        </p>
      </div>
      <button className="magnetic-btn dark" type="button" onClick={onRetry} disabled={isLoading}>
        Retry preview query
      </button>
    </section>
  );
}

export function AdminOperations() {
  const service = useRef<PreviewService | null>(null);
  const selectedEventRef = useRef('');
  const claimSequence = useRef(0);
  const pendingClaim = useRef<MutationRequest<'claimOpportunity'> | null>(null);
  const [panel, setPanel] = useState<Panel>('overview');
  const [loadState, setLoadState] = useState<LoadState>({ kind: 'loading', message: 'Loading Operations preview…' });
  const [data, setData] = useState<DashboardData>(emptyData);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PreviewEvent['status']>('all');
  const [claimState, setClaimState] = useState<{ kind: 'idle' | 'busy' | 'success' | 'error'; message: string }>({
    kind: 'idle',
    message: '',
  });

  const loadRoster = useCallback(async (instance: PreviewService, eventId: string) => {
    const rosterResult = await instance.listRoster(eventId);
    if (!rosterResult.ok) return { ok: false, error: rosterResult.error } as const;
    const workerIds = [...new Set(rosterResult.value.items.map((assignment) => assignment.workerId))];
    const workerResults = await Promise.all(workerIds.map((workerId) => instance.getStanding(workerId)));
    const workerFailure = workerResults.find((result) => !result.ok);
    if (workerFailure && !workerFailure.ok) return { ok: false, error: workerFailure.error } as const;
    const workers = workerResults.reduce<Record<string, Worker>>((result, workerResult) => {
      if (workerResult.ok) result[workerResult.value.id] = workerResult.value;
      return result;
    }, {});
    return { ok: true, roster: rosterResult.value.items, workers } as const;
  }, []);

  const refreshAll = useCallback(async () => {
    const instance = service.current;
    if (!instance) return;
    setLoadState({ kind: 'loading', message: 'Refreshing linked Operations records…' });
    const [nextGeneration, eventsResult, positionsResult, requirementsResult, metricsResult] = await Promise.all([
      instance.getGeneration(),
      instance.listEvents(),
      instance.listPositions(),
      instance.listRequirements(),
      instance.getMetrics(),
    ]);
    const failure = [eventsResult, positionsResult, requirementsResult, metricsResult].find((result) => !result.ok);
    if (failure && !failure.ok) {
      setLoadState(errorState(failure.error));
      return;
    }
    if (!eventsResult.ok || !positionsResult.ok || !requirementsResult.ok || !metricsResult.ok) return;
    const events = eventsResult.value.items;
    if (!events.length) {
      selectedEventRef.current = '';
      setSelectedEventId('');
      setData({
        events,
        positions: positionsResult.value.items,
        requirements: requirementsResult.value.items,
        roster: [],
        workers: {},
        metrics: metricsResult.value,
      });
      setLoadState({ kind: 'empty', message: 'No sample Operations events are available.' });
      return;
    }
    const nextSelectedId = events.some((event) => event.id === selectedEventRef.current)
      ? selectedEventRef.current
      : events[0].id;
    selectedEventRef.current = nextSelectedId;
    setSelectedEventId(nextSelectedId);
    const rosterResult = await loadRoster(instance, nextSelectedId);
    if (!rosterResult.ok) {
      setLoadState(errorState(rosterResult.error));
      return;
    }
    setData({
      events,
      positions: positionsResult.value.items,
      requirements: requirementsResult.value.items,
      roster: rosterResult.roster,
      workers: rosterResult.workers,
      metrics: metricsResult.value,
    });
    setLoadState({ kind: 'ready', message: `Preview generation ${nextGeneration}` });
  }, [loadRoster]);

  useEffect(() => {
    let active = true;
    void getBrowserPreviewService().then((instance) => {
      if (!active) return;
      service.current = instance;
      void refreshAll();
    });
    const refreshFromControls = () => void refreshAll();
    window.addEventListener('tnp-preview-change', refreshFromControls);
    window.addEventListener('tnp-preview-reset', refreshFromControls);
    return () => {
      active = false;
      window.removeEventListener('tnp-preview-change', refreshFromControls);
      window.removeEventListener('tnp-preview-reset', refreshFromControls);
    };
  }, [refreshAll]);

  const selectEvent = useCallback(
    async (eventId: string, destination: Panel = 'events') => {
      const instance = service.current;
      selectedEventRef.current = eventId;
      setSelectedEventId(eventId);
      setPanel(destination);
      if (!instance) return;
      const rosterResult = await loadRoster(instance, eventId);
      if (!rosterResult.ok) {
        setLoadState(errorState(rosterResult.error));
        return;
      }
      setData((current) => ({ ...current, roster: rosterResult.roster, workers: rosterResult.workers }));
    },
    [loadRoster],
  );

  async function executeClaim(request: MutationRequest<'claimOpportunity'>) {
    const instance = service.current;
    if (!instance) return;
    setClaimState({ kind: 'busy', message: 'Submitting the synthetic worker claim…' });
    const result = await instance.mutate(request);
    if (!result.ok) {
      setClaimState({
        kind: 'error',
        message:
          result.error.code === 'STALE_GENERATION'
            ? 'The preview was reset after this action began. Reload current records before starting a new claim.'
            : result.error.message,
      });
      return;
    }
    pendingClaim.current = null;
    setClaimState({
      kind: 'success',
      message: `${result.value.id} added to the linked roster${result.replayed ? ' from the retained request receipt' : ''}.`,
    });
    await refreshAll();
  }

  async function startSampleClaim(positionId: string) {
    const instance = service.current;
    if (!instance) return;
    const expectedGeneration = await instance.getGeneration();
    claimSequence.current += 1;
    const request: MutationRequest<'claimOpportunity'> = {
      requestKey: `operations-sample-claim-${expectedGeneration}-${claimSequence.current}`,
      expectedGeneration,
      actorId: 'tnp-demo-worker-006',
      operation: PREVIEW_OPERATIONS.claimOpportunity,
      payload: { positionId, workerId: 'tnp-demo-worker-006' },
    };
    pendingClaim.current = request;
    await executeClaim(request);
  }

  const filteredEvents = useMemo(() => {
    const term = filter.trim().toLowerCase();
    return data.events.filter((event) => {
      const matchesTerm = !term || `${event.name} ${event.id} ${event.status}`.toLowerCase().includes(term);
      return matchesTerm && (statusFilter === 'all' || event.status === statusFilter);
    });
  }, [data.events, filter, statusFilter]);

  const selectedEvent = data.events.find((event) => event.id === selectedEventId) ?? null;
  const selectedPositions = data.positions.filter((position) => position.eventId === selectedEventId);
  const sampleClaimExists = data.roster.some((assignment) => assignment.workerId === 'tnp-demo-worker-006');

  function metricDestination(destination: Panel) {
    setPanel(destination);
    document.getElementById('operations-workspace')?.focus();
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar" aria-label="Operations sections">
        <strong>TNP OPERATIONS</strong>
        {workingNavigation.map((item) => (
          <button
            className={`${styles.navButton} ${panel === item.id ? styles.navButtonActive : ''}`}
            key={item.id}
            type="button"
            aria-current={panel === item.id ? 'page' : undefined}
            onClick={() => setPanel(item.id)}
          >
            {item.label}
          </button>
        ))}
        <span className={styles.navLabel}>Later milestones</span>
        {futureNavigation.map((item) => (
          <button className={styles.navButton} key={item} type="button" disabled title="Unavailable in this milestone">
            {item} <small>Unavailable</small>
          </button>
        ))}
      </aside>

      <section className="admin-main">
        <div className="admin-header">
          <p className="section-kicker">TNP OPERATIONS · SYNTHETIC WORKFORCE PREVIEW</p>
          <h1>Event staffing, linked records and roster intelligence.</h1>
          <div className={styles.headerMeta}>
            <StatusPill tone="green" label={loadState.kind === 'ready' ? loadState.message : 'Synthetic data only'} />
            <span>No live verification, tracking, allocation authority or payments.</span>
          </div>
        </div>

        {loadState.kind === 'ready' ? (
          <>
            <div className="admin-stats" aria-label="Operations metrics">
              <button className={styles.metricButton} type="button" onClick={() => metricDestination('events')}>
                <Metric value={String(data.metrics.events ?? 0)} label="Linked functions" />
              </button>
              <button className={styles.metricButton} type="button" onClick={() => metricDestination('requirements')}>
                <Metric value={String(data.metrics.positions ?? 0)} label="Required positions" />
              </button>
              <button className={styles.metricButton} type="button" onClick={() => metricDestination('events')}>
                <Metric value={String(data.metrics.activeAssignments ?? 0)} label="Active assignments" />
              </button>
              <button className={styles.metricButton} type="button" onClick={() => metricDestination('events')}>
                <Metric value={String(data.metrics.coming ?? 0)} label="Coming" />
              </button>
              <button className={styles.metricButton} type="button" onClick={() => metricDestination('events')}>
                <Metric value={String(data.metrics.attendanceExceptions ?? 0)} label="Attendance exceptions" />
              </button>
            </div>

            <section className={styles.workspace} id="operations-workspace" tabIndex={-1}>
              {panel === 'overview' && (
                <OverviewPanel
                  events={data.events}
                  positions={data.positions}
                  requirements={data.requirements}
                  onSelectEvent={(eventId) => void selectEvent(eventId)}
                />
              )}
              {panel === 'events' && (
                <EventsPanel
                  events={filteredEvents}
                  allEventCount={data.events.length}
                  positions={selectedPositions}
                  roster={data.roster}
                  workers={data.workers}
                  selectedEvent={selectedEvent}
                  selectedEventId={selectedEventId}
                  filter={filter}
                  statusFilter={statusFilter}
                  claimState={claimState}
                  sampleClaimExists={sampleClaimExists}
                  onFilter={setFilter}
                  onStatusFilter={setStatusFilter}
                  onSelectEvent={(eventId) => void selectEvent(eventId)}
                  onClaim={(positionId) => void startSampleClaim(positionId)}
                  onRetryClaim={() => pendingClaim.current && void executeClaim(pendingClaim.current)}
                />
              )}
              {panel === 'requirements' && (
                <RequirementsPanel
                  events={data.events}
                  requirements={data.requirements}
                  positions={data.positions}
                  onSelectEvent={(eventId) => void selectEvent(eventId)}
                />
              )}
            </section>
          </>
        ) : (
          <StatePanel state={loadState} onRetry={() => void refreshAll()} />
        )}
      </section>
    </main>
  );
}

function OverviewPanel({ events, positions, requirements, onSelectEvent }: {
  events: PreviewEvent[];
  positions: Position[];
  requirements: Requirement[];
  onSelectEvent: (eventId: string) => void;
}) {
  return (
    <>
      <div className={styles.panelHeading}>
        <div><p className="section-kicker">OPERATIONS OVERVIEW</p><h2>One booking. Two linked functions.</h2></div>
        <p>Every total below is queried from the shared synthetic scenario, not a local Operations fixture.</p>
      </div>
      <div className="admin-grid">
        {events.map((event) => {
          const eventPositions = positions.filter((position) => position.eventId === event.id);
          const eventRequirements = requirements.filter((requirement) => requirement.eventId === event.id);
          return (
            <article className="ops-card" key={event.id}>
              <p className="section-kicker">{event.status.toUpperCase()} · {event.id}</p>
              <h2>{event.name}</h2>
              <p>{formatDate(event.startsAt)} · {event.timezone}</p>
              <div className={styles.summaryRows}>
                <span><strong>{eventRequirements.length}</strong> linked requirement</span>
                <span><strong>{eventPositions.reduce((total, position) => total + position.quantity, 0)}</strong> required professionals</span>
                <span><strong>{eventPositions.length}</strong> position types</span>
              </div>
              <button className="magnetic-btn dark" type="button" onClick={() => onSelectEvent(event.id)}>
                Open event control <ArrowRight size={17} aria-hidden="true" />
              </button>
            </article>
          );
        })}
      </div>
    </>
  );
}

function EventsPanel({
  events,
  allEventCount,
  positions,
  roster,
  workers,
  selectedEvent,
  selectedEventId,
  filter,
  statusFilter,
  claimState,
  sampleClaimExists,
  onFilter,
  onStatusFilter,
  onSelectEvent,
  onClaim,
  onRetryClaim,
}: {
  events: PreviewEvent[];
  allEventCount: number;
  positions: Position[];
  roster: Assignment[];
  workers: Record<string, Worker>;
  selectedEvent: PreviewEvent | null;
  selectedEventId: string;
  filter: string;
  statusFilter: 'all' | PreviewEvent['status'];
  claimState: { kind: 'idle' | 'busy' | 'success' | 'error'; message: string };
  sampleClaimExists: boolean;
  onFilter: (value: string) => void;
  onStatusFilter: (value: 'all' | PreviewEvent['status']) => void;
  onSelectEvent: (eventId: string) => void;
  onClaim: (positionId: string) => void;
  onRetryClaim: () => void;
}) {
  const claimPosition = positions.find((position) => position.role === 'Event Coordinator' && position.status === 'open');
  return (
    <>
      <div className={styles.panelHeading}>
        <div><p className="section-kicker">EVENT CONTROL</p><h2>Find a function, then inspect its positions and roster.</h2></div>
        <span>{events.length} of {allEventCount} functions shown</span>
      </div>
      <div className={styles.filters}>
        <label>
          <span>Search functions</span>
          <div className={styles.inputWithIcon}>
            <Search size={18} aria-hidden="true" />
            <input value={filter} onChange={(event) => onFilter(event.target.value)} placeholder="Name, ID or status" />
          </div>
        </label>
        <label>
          <span>Status</span>
          <select value={statusFilter} onChange={(event) => onStatusFilter(event.target.value as typeof statusFilter)}>
            <option value="all">All statuses</option>
            <option value="planned">Planned</option>
            <option value="staffing">Staffing</option>
            <option value="complete">Complete</option>
          </select>
        </label>
      </div>
      {events.length ? (
        <div className={styles.eventTabs} aria-label="Filtered functions">
          {events.map((event) => (
            <button className={event.id === selectedEventId ? styles.eventTabActive : ''} key={event.id} type="button" onClick={() => onSelectEvent(event.id)}>
              <CalendarDays size={18} aria-hidden="true" />
              <span><strong>{event.name}</strong><small>{event.id}</small></span>
              <StatusPill tone={event.status === 'complete' ? 'green' : 'amber'} label={event.status} />
            </button>
          ))}
        </div>
      ) : (
        <section className={styles.filteredEmpty} aria-live="polite">
          <p className="section-kicker">NO FILTER MATCH</p>
          <h3>The two sample functions are still available.</h3>
          <button type="button" onClick={() => { onFilter(''); onStatusFilter('all'); }}>Clear filters</button>
        </section>
      )}

      {selectedEvent && (
        <section className="live-ops-panel" aria-labelledby="selected-event-title">
          <div className="live-copy">
            <p className="section-kicker">{selectedEvent.id} · {selectedEvent.status.toUpperCase()}</p>
            <h2 id="selected-event-title">{selectedEvent.name}</h2>
            <p>{formatDate(selectedEvent.startsAt)} to {formatDate(selectedEvent.endsAt)}</p>
            <p>{selectedEvent.reportingDetails}</p>
            <div className="workforce-lines">
              {positions.map((position) => {
                const filled = roster.filter((assignment) => assignment.positionId === position.id).length;
                return <span key={position.id}><strong>{position.role}</strong> {filled} / {position.quantity} active · {position.status} · {position.id}</span>;
              })}
            </div>
            {claimPosition && (
              <button className="magnetic-btn dark" type="button" disabled={sampleClaimExists || claimState.kind === 'busy'} onClick={() => onClaim(claimPosition.id)}>
                {sampleClaimExists ? 'Sample worker claim reflected' : claimState.kind === 'busy' ? 'Claiming…' : 'Run sample worker claim'}
              </button>
            )}
            {claimState.kind !== 'idle' && (
              <output className={`${styles.actionMessage} ${claimState.kind === 'error' ? styles.actionError : ''}`}>
                <span>{claimState.message}</span>
                {claimState.kind === 'error' && !claimState.message.startsWith('The preview was reset') && <button type="button" onClick={onRetryClaim}>Retry same request</button>}
              </output>
            )}
          </div>
          <div className={styles.rosterPanel}>
            <div className={styles.rosterHeading}>
              <UsersRound aria-hidden="true" />
              <div><p className="section-kicker">LINKED ROSTER</p><h3>{roster.length} active assignments</h3></div>
            </div>
            {roster.length ? roster.map((assignment) => (
              <article className={styles.rosterRow} key={assignment.id}>
                <div>
                  <strong>{workers[assignment.workerId]?.displayName ?? assignment.workerId}</strong>
                  <span>{workers[assignment.workerId]?.role ?? 'Role unavailable'} · {assignment.response}</span>
                </div>
                <small>{assignment.id}<br />{assignment.workerId}</small>
              </article>
            )) : <p className={styles.muted}>No active assignments for this function.</p>}
          </div>
        </section>
      )}
    </>
  );
}

function RequirementsPanel({ events, requirements, positions, onSelectEvent }: {
  events: PreviewEvent[];
  requirements: Requirement[];
  positions: Position[];
  onSelectEvent: (eventId: string) => void;
}) {
  return (
    <>
      <div className={styles.panelHeading}>
        <div><p className="section-kicker">LINKED REQUIREMENTS</p><h2>Capacity is read from each position.</h2></div>
        <p>Quantities are deliberately 6 and 40—there is no fixed 10+1 staffing assumption.</p>
      </div>
      <div className="admin-grid">
        {requirements.map((requirement) => {
          const event = events.find((item) => item.id === requirement.eventId);
          const matchingPositions = positions.filter((position) => position.eventId === requirement.eventId && position.role === requirement.role);
          return (
            <article className="ops-card" key={requirement.id}>
              <p className="section-kicker">{requirement.status.toUpperCase()} · {requirement.id}</p>
              <h2>{requirement.quantity} × {requirement.role}</h2>
              <p>{requirement.notes}</p>
              <div className={styles.identityBlock}>
                <span>Booking <strong>{requirement.bookingId}</strong></span>
                <span>Function <strong>{event?.name ?? requirement.eventId}</strong></span>
                <span>Position <strong>{matchingPositions[0]?.id ?? 'No linked position'}</strong></span>
              </div>
              <button className="magnetic-btn dark" type="button" onClick={() => onSelectEvent(requirement.eventId)}>
                View linked roster <ArrowRight size={17} aria-hidden="true" />
              </button>
            </article>
          );
        })}
      </div>
    </>
  );
}
