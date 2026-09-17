'use client';

import { AlertCircle, ArrowRight, CalendarDays, RefreshCw, Search, UsersRound } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Metric } from '@/components/tnp/shared/Metric';
import { StatusPill } from '@/components/tnp/shared/StatusPill';
import type {
  AnyMutationRequest,
  Application,
  Assignment,
  Attendance,
  AuditEntry,
  MutationRequest,
  Position,
  PreviewError,
  PreviewEvent,
  PreviewMutationMap,
  PreviewOperation,
  PreviewOutcome,
  PreviewService,
  Requirement,
  Worker,
} from '@/lib/contracts/preview';
import { PREVIEW_OPERATIONS } from '@/lib/demo/service';
import { getBrowserPreviewService } from '@/lib/services/preview';
import { AttendancePanel, VerificationPanel, type ActionFeedback } from './OperationsDecisionPanels';
import {
  canRetryFeedback,
  filterOperationsEvents,
  isCurrentActionEpoch,
  isCurrentRosterRequest,
  reconcileSelectedId,
  type EventStatusFilter,
} from './operationsState';
import styles from './AdminOperations.module.css';

type Panel = 'overview' | 'events' | 'requirements' | 'verification' | 'attendance';
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
  applications: Application[];
  assignments: Assignment[];
  attendances: Attendance[];
  audit: AuditEntry[];
};

const emptyData: DashboardData = {
  events: [], positions: [], requirements: [], roster: [], workers: {}, metrics: {},
  applications: [], assignments: [], attendances: [], audit: [],
};

const workingNavigation: Array<{ id: Panel; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'events', label: 'Events & roster' },
  { id: 'requirements', label: 'Requirements' },
  { id: 'verification', label: 'Verification review' },
  { id: 'attendance', label: 'Attendance exceptions' },
];
const futureNavigation = ['Ratings', 'Finance & payouts', 'RSVP', 'Reports'];

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata',
  }).format(new Date(value));
}

function errorState(error: PreviewError): LoadState {
  return error.code === 'PREVIEW_LOADING'
    ? { kind: 'loading', message: 'The synthetic scenario is in its loading state.' }
    : { kind: 'error', message: error.message };
}

function StatePanel({ state, onRetry }: { state: Exclude<LoadState, { kind: 'ready' }>; onRetry: () => void }) {
  const loading = state.kind === 'loading';
  return (
    <section className={styles.statePanel} aria-live="polite" aria-busy={loading}>
      {loading ? <RefreshCw className={styles.spin} aria-hidden="true" /> : <AlertCircle aria-hidden="true" />}
      <div>
        <p className="section-kicker">{state.kind === 'empty' ? 'EMPTY SAMPLE STATE' : 'PREVIEW STATE'}</p>
        <h2>{state.message}</h2>
        <p>No production system was contacted. Change or reset the synthetic preview state, then retry.</p>
      </div>
      <button className="magnetic-btn dark" type="button" onClick={onRetry} disabled={loading}>Retry preview query</button>
    </section>
  );
}

export function AdminOperations() {
  const service = useRef<PreviewService | null>(null);
  const selectedEventRef = useRef('');
  const filterRef = useRef('');
  const statusFilterRef = useRef<EventStatusFilter>('all');
  const refreshEpoch = useRef(0);
  const rosterRequestEpoch = useRef(0);
  const actionEpoch = useRef(0);
  const retainedAction = useRef<{ actionId: string; run: (epoch: number) => Promise<void> } | null>(null);
  const [panel, setPanel] = useState<Panel>('overview');
  const [loadState, setLoadState] = useState<LoadState>({ kind: 'loading', message: 'Loading Operations preview…' });
  const [data, setData] = useState<DashboardData>(emptyData);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatusFilter>('all');
  const [rosterReadyForEventId, setRosterReadyForEventId] = useState('');
  const [feedback, setFeedback] = useState<ActionFeedback>({ kind: 'idle', message: '' });

  const refreshAll = useCallback(async () => {
    const instance = service.current;
    if (!instance) return;
    const refreshId = ++refreshEpoch.current;
    setLoadState({ kind: 'loading', message: 'Refreshing linked Operations records…' });
    const [generation, events, positions, requirements, metrics, applications, assignments, audit] = await Promise.all([
      instance.getGeneration(), instance.listEvents(), instance.listPositions(), instance.listRequirements(),
      instance.getMetrics(), instance.listApplications(), instance.listAssignments(), instance.listAudit(),
    ]);
    if (refreshId !== refreshEpoch.current) return;
    const results = [events, positions, requirements, metrics, applications, assignments, audit];
    const failure = results.find((result) => !result.ok);
    if (failure && !failure.ok) { setLoadState(errorState(failure.error)); return; }
    if (!events.ok || !positions.ok || !requirements.ok || !metrics.ok || !applications.ok || !assignments.ok || !audit.ok) return;
    if (!events.value.items.length) {
      selectedEventRef.current = ''; setSelectedEventId(''); setRosterReadyForEventId('');
      setData({ ...emptyData, positions: positions.value.items, requirements: requirements.value.items, metrics: metrics.value, applications: applications.value.items, assignments: assignments.value.items, audit: audit.value.items });
      setLoadState({ kind: 'empty', message: 'No sample Operations events are available.' });
      return;
    }
    const visibleEvents = filterOperationsEvents(events.value.items, filterRef.current, statusFilterRef.current);
    const nextSelected = reconcileSelectedId(selectedEventRef.current, visibleEvents.map((event) => event.id));
    selectedEventRef.current = nextSelected; setSelectedEventId(nextSelected);
    setRosterReadyForEventId('');
    const rosterRequestId = ++rosterRequestEpoch.current;
    const roster = nextSelected ? await instance.listRoster(nextSelected) : null;
    if (refreshId !== refreshEpoch.current || !isCurrentRosterRequest(rosterRequestId, rosterRequestEpoch.current, nextSelected, selectedEventRef.current)) return;
    if (roster && !roster.ok) { setLoadState(errorState(roster.error)); return; }
    const workerIds = [...new Set([
      ...assignments.value.items.map((item) => item.workerId),
      ...applications.value.items.map((item) => item.applicantId),
      'tnp-demo-worker-006',
    ])];
    const standings = await Promise.all(workerIds.map(async (id) => ({ id, result: await instance.getStanding(id) })));
    if (refreshId !== refreshEpoch.current || !isCurrentRosterRequest(rosterRequestId, rosterRequestEpoch.current, nextSelected, selectedEventRef.current)) return;
    const standingFailure = standings.find(({ result }) => !result.ok && result.error.code !== 'NOT_FOUND');
    if (standingFailure && !standingFailure.result.ok) { setLoadState(errorState(standingFailure.result.error)); return; }
    const workers = standings.reduce<Record<string, Worker>>((map, item) => {
      if (item.result.ok) map[item.id] = item.result.value;
      return map;
    }, {});
    const attendanceResults = await Promise.all(Object.keys(workers).map((id) => instance.getAttendanceHistory(id)));
    if (refreshId !== refreshEpoch.current || !isCurrentRosterRequest(rosterRequestId, rosterRequestEpoch.current, nextSelected, selectedEventRef.current)) return;
    const attendanceFailure = attendanceResults.find((result) => !result.ok);
    if (attendanceFailure && !attendanceFailure.ok) { setLoadState(errorState(attendanceFailure.error)); return; }
    const attendances = [...new Map(attendanceResults.flatMap((result) => result.ok ? result.value.items : []).map((item) => [item.id, item])).values()];
    setData({
      events: events.value.items, positions: positions.value.items, requirements: requirements.value.items,
      roster: roster?.ok ? roster.value.items : [], workers, metrics: metrics.value, applications: applications.value.items,
      assignments: assignments.value.items, attendances, audit: audit.value.items,
    });
    setRosterReadyForEventId(nextSelected);
    setLoadState({ kind: 'ready', message: `Preview generation ${generation}` });
  }, []);

  useEffect(() => {
    let active = true;
    void getBrowserPreviewService().then((instance) => { if (active) { service.current = instance; void refreshAll(); } });
    const refresh = () => {
      actionEpoch.current += 1;
      rosterRequestEpoch.current += 1;
      retainedAction.current = null;
      setFeedback({ kind: 'idle', message: '' });
      void refreshAll();
    };
    window.addEventListener('tnp-preview-change', refresh);
    window.addEventListener('tnp-preview-reset', refresh);
    return () => { active = false; window.removeEventListener('tnp-preview-change', refresh); window.removeEventListener('tnp-preview-reset', refresh); };
  }, [refreshAll]);

  const reportActionFailure = useCallback((error: PreviewError, actionId: string, epoch: number) => {
    if (!isCurrentActionEpoch(epoch, actionEpoch.current)) return;
    const retryable = canRetryFeedback(
      { actionId, retryable: error.retryable, code: error.code },
      retainedAction.current?.actionId,
    );
    if (!retryable) retainedAction.current = null;
    setFeedback({
      kind: 'error',
      code: error.code,
      actionId,
      retryable,
      message: error.code === 'STALE_GENERATION'
        ? 'Preview generation changed. Current records were not overwritten; refresh before starting a new action.'
        : error.message,
    });
  }, []);

  const executeRequest = useCallback(async (request: AnyMutationRequest, label: string, actionId: string, epoch: number) => {
    const instance = service.current;
    if (!instance || !isCurrentActionEpoch(epoch, actionEpoch.current)) return;
    setFeedback({ kind: 'busy', message: `${label}…`, actionId });
    const result = await instance.mutate(request as MutationRequest<PreviewOperation>) as PreviewOutcome<unknown>;
    if (!isCurrentActionEpoch(epoch, actionEpoch.current)) return;
    if (!result.ok) {
      reportActionFailure(result.error, actionId, epoch);
      return;
    }
    retainedAction.current = null;
    setFeedback({ kind: 'success', actionId, message: `${label} completed${result.replayed ? ' from the retained request receipt' : ''}.` });
    await refreshAll();
  }, [refreshAll, reportActionFailure]);

  const beginOperation = useCallback(async <Operation extends PreviewOperation>(
    operation: Operation, payload: PreviewMutationMap[Operation]['payload'], label: string,
  ) => {
    const instance = service.current;
    if (!instance) return;
    const epoch = ++actionEpoch.current;
    retainedAction.current = null;
    setFeedback({ kind: 'busy', message: `Preparing ${label.toLowerCase()}…` });
    const request: MutationRequest<Operation> = {
      requestKey: `operations-${operation}-${crypto.randomUUID()}`,
      expectedGeneration: await instance.getGeneration(), actorId: 'tnp-demo-ops-001', operation, payload,
    };
    if (!isCurrentActionEpoch(epoch, actionEpoch.current)) return;
    const actionId = `${operation}:${request.requestKey}`;
    const run = (nextEpoch: number) => executeRequest(request as AnyMutationRequest, label, actionId, nextEpoch);
    retainedAction.current = { actionId, run };
    await run(epoch);
  }, [executeRequest]);

  const recordAttendance = useCallback(async (assignmentId: string, evidenceState: 'recorded' | 'gps-denied' | 'gps-missing' | 'outside-radius', note: string, distanceMetres?: number) => {
    const instance = service.current;
    if (!instance) return;
    const requestKey = `operations-recordAttendance-${crypto.randomUUID()}`;
    const actionId = `recordAttendance:${assignmentId}:${requestKey}`;
    const epoch = ++actionEpoch.current;
    retainedAction.current = null;
    setFeedback({ kind: 'busy', actionId, message: 'Reading the selected assignment pass…' });
    const expectedGeneration = await instance.getGeneration();
    if (!isCurrentActionEpoch(epoch, actionEpoch.current)) return;
    const run = async (nextEpoch: number) => {
      if (!isCurrentActionEpoch(nextEpoch, actionEpoch.current)) return;
      setFeedback({ kind: 'busy', actionId, message: 'Reading the selected assignment pass…' });
      const pass = await instance.getEventPass(assignmentId);
      if (!isCurrentActionEpoch(nextEpoch, actionEpoch.current)) return;
      if (!pass.ok) { reportActionFailure(pass.error, actionId, nextEpoch); return; }
      const request: MutationRequest<'recordAttendance'> = {
        requestKey, expectedGeneration,
        actorId: 'tnp-demo-ops-001', operation: PREVIEW_OPERATIONS.recordAttendance,
        payload: { token: pass.value.token, eventId: pass.value.eventId, evidenceState, note, distanceMetres },
      };
      await executeRequest(request, 'Attendance capture', actionId, nextEpoch);
    };
    retainedAction.current = { actionId, run };
    await run(epoch);
  }, [executeRequest, reportActionFailure]);

  const selectEvent = useCallback(async (eventId: string) => {
    const instance = service.current;
    selectedEventRef.current = eventId; setSelectedEventId(eventId); setPanel('events');
    if (!instance) return;
    const requestId = ++rosterRequestEpoch.current;
    setRosterReadyForEventId('');
    setData((current) => ({ ...current, roster: [] }));
    const roster = await instance.listRoster(eventId);
    if (!isCurrentRosterRequest(requestId, rosterRequestEpoch.current, eventId, selectedEventRef.current)) return;
    if (!roster.ok) { setLoadState(errorState(roster.error)); return; }
    setData((current) => ({ ...current, roster: roster.value.items }));
    setRosterReadyForEventId(eventId);
  }, []);

  const updateFilters = useCallback((nextFilter: string, nextStatus: EventStatusFilter) => {
    filterRef.current = nextFilter;
    statusFilterRef.current = nextStatus;
    setFilter(nextFilter);
    setStatusFilter(nextStatus);
    const visible = filterOperationsEvents(data.events, nextFilter, nextStatus);
    const nextSelected = reconcileSelectedId(selectedEventRef.current, visible.map((event) => event.id));
    if (!nextSelected) {
      rosterRequestEpoch.current += 1;
      selectedEventRef.current = '';
      setSelectedEventId('');
      setRosterReadyForEventId('');
      setData((current) => ({ ...current, roster: [] }));
      return;
    }
    if (nextSelected !== selectedEventRef.current) void selectEvent(nextSelected);
  }, [data.events, selectEvent]);

  const retryCurrentAction = useCallback(() => {
    const action = retainedAction.current;
    if (!action || !canRetryFeedback(feedback, action.actionId)) return;
    const epoch = ++actionEpoch.current;
    void action.run(epoch);
  }, [feedback]);

  const filteredEvents = useMemo(() => {
    return filterOperationsEvents(data.events, filter, statusFilter);
  }, [data.events, filter, statusFilter]);
  const selectedEvent = filteredEvents.find((event) => event.id === selectedEventId) ?? null;
  const selectedPositions = selectedEvent ? data.positions.filter((position) => position.eventId === selectedEvent.id) : [];
  const feedbackCanRetry = feedback.kind === 'error' && feedback.retryable === true;

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar" aria-label="Operations sections">
        <strong>TNP OPERATIONS</strong>
        {workingNavigation.map((item) => (
          <button className={`${styles.navButton} ${panel === item.id ? styles.navButtonActive : ''}`} key={item.id} type="button" aria-current={panel === item.id ? 'page' : undefined} onClick={() => setPanel(item.id)}>{item.label}</button>
        ))}
        <span className={styles.navLabel}>Later milestones</span>
        {futureNavigation.map((item) => <button className={styles.navButton} key={item} type="button" disabled>{item} <small>Unavailable</small></button>)}
      </aside>
      <section className="admin-main">
        <div className="admin-header">
          <p className="section-kicker">TNP OPERATIONS · SYNTHETIC WORKFORCE PREVIEW</p>
          <h1>Event staffing, verification and exception decisions.</h1>
          <div className={styles.headerMeta}>
            <StatusPill tone="green" label={loadState.kind === 'ready' ? loadState.message : 'Synthetic data only'} />
            <span>No live tracking, allocation authority, identity decision or payment.</span>
          </div>
        </div>
        {loadState.kind === 'ready' ? <>
          <div className="admin-stats" aria-label="Operations metrics">
            <button className={styles.metricButton} type="button" onClick={() => setPanel('events')}><Metric value={String(data.metrics.events ?? 0)} label="Linked functions" /></button>
            <button className={styles.metricButton} type="button" onClick={() => setPanel('requirements')}><Metric value={String(data.metrics.positions ?? 0)} label="Required positions" /></button>
            <button className={styles.metricButton} type="button" onClick={() => setPanel('events')}><Metric value={String(data.metrics.activeAssignments ?? 0)} label="Active assignments" /></button>
            <button className={styles.metricButton} type="button" onClick={() => setPanel('verification')}><Metric value={String(data.applications.filter((item) => item.status === 'pending').length)} label="Pending reviews" /></button>
            <button className={styles.metricButton} type="button" onClick={() => setPanel('attendance')}><Metric value={String(data.metrics.attendanceExceptions ?? 0)} label="Attendance exceptions" /></button>
          </div>
          <section className={styles.workspace} id="operations-workspace" tabIndex={-1}>
            {panel === 'overview' && <OverviewPanel events={data.events} positions={data.positions} requirements={data.requirements} onSelectEvent={(id) => void selectEvent(id)} />}
            {panel === 'events' && <EventsPanel events={filteredEvents} allEventCount={data.events.length} positions={selectedPositions} roster={data.roster} workers={data.workers} selectedEvent={selectedEvent} selectedEventId={selectedEventId} rosterReady={Boolean(selectedEvent && rosterReadyForEventId === selectedEvent.id)} filter={filter} statusFilter={statusFilter} feedback={feedback} canRetry={feedbackCanRetry} onFilter={(value) => updateFilters(value, statusFilterRef.current)} onStatusFilter={(value) => updateFilters(filterRef.current, value)} onClearFilters={() => updateFilters('', 'all')} onSelectEvent={(id) => void selectEvent(id)} onClaim={(positionId) => void beginOperation('claimOpportunity', { positionId, workerId: 'tnp-demo-worker-006' }, 'Sample worker claim')} onRetry={retryCurrentAction} />}
            {panel === 'requirements' && <RequirementsPanel events={data.events} requirements={data.requirements} positions={data.positions} onSelectEvent={(id) => void selectEvent(id)} />}
            {panel === 'verification' && <VerificationPanel applications={data.applications} workers={data.workers} feedback={feedback} canRetry={feedbackCanRetry} onReview={(payload) => void beginOperation('reviewApplication', payload, 'Application review')} onChangeRole={(payload) => void beginOperation('changeRole', payload, 'Role adjustment')} onRetry={retryCurrentAction} />}
            {panel === 'attendance' && <AttendancePanel attendances={data.attendances} assignments={data.assignments} positions={data.positions} workers={data.workers} audit={data.audit} feedback={feedback} canRetry={feedbackCanRetry} onCorrect={(payload) => void beginOperation('correctAttendance', payload, 'Attendance correction')} onNonresponse={(payload) => void beginOperation('markNonresponse', payload, 'Nonresponse decision')} onAdminAssign={(payload) => void beginOperation('adminAssign', payload, 'Admin assignment')} onReplace={(payload) => void beginOperation('replaceAssignment', payload, 'Assignment replacement')} onRecord={(...args) => void recordAttendance(...args)} onRetry={retryCurrentAction} />}
          </section>
        </> : <StatePanel state={loadState} onRetry={() => void refreshAll()} />}
      </section>
    </main>
  );
}

function OverviewPanel({ events, positions, requirements, onSelectEvent }: { events: PreviewEvent[]; positions: Position[]; requirements: Requirement[]; onSelectEvent: (id: string) => void }) {
  return <><div className={styles.panelHeading}><div><p className="section-kicker">OPERATIONS OVERVIEW</p><h2>One booking. Two linked functions.</h2></div><p>Totals come from the shared synthetic scenario, not a local Operations fixture.</p></div><div className="admin-grid">{events.map((event) => {
    const eventPositions = positions.filter((item) => item.eventId === event.id);
    return <article className="ops-card" key={event.id}><p className="section-kicker">{event.status.toUpperCase()} · {event.id}</p><h2>{event.name}</h2><p>{formatDate(event.startsAt)} · {event.timezone}</p><div className={styles.summaryRows}><span><strong>{requirements.filter((item) => item.eventId === event.id).length}</strong> linked requirement</span><span><strong>{eventPositions.reduce((total, item) => total + item.quantity, 0)}</strong> required professionals</span><span><strong>{eventPositions.length}</strong> position types</span></div><button className="magnetic-btn dark" type="button" onClick={() => onSelectEvent(event.id)}>Open event control <ArrowRight size={17} aria-hidden="true" /></button></article>;
  })}</div></>;
}

function EventsPanel({ events, allEventCount, positions, roster, workers, selectedEvent, selectedEventId, rosterReady, filter, statusFilter, feedback, canRetry, onFilter, onStatusFilter, onClearFilters, onSelectEvent, onClaim, onRetry }: {
  events: PreviewEvent[]; allEventCount: number; positions: Position[]; roster: Assignment[]; workers: Record<string, Worker>; selectedEvent: PreviewEvent | null; selectedEventId: string; rosterReady: boolean; filter: string; statusFilter: EventStatusFilter; feedback: ActionFeedback; canRetry: boolean; onFilter: (value: string) => void; onStatusFilter: (value: EventStatusFilter) => void; onClearFilters: () => void; onSelectEvent: (id: string) => void; onClaim: (id: string) => void; onRetry: () => void;
}) {
  const claimPosition = positions.find((item) => item.role === 'Event Coordinator' && item.status === 'open');
  const claimed = roster.some((item) => item.workerId === 'tnp-demo-worker-006');
  return <><div className={styles.panelHeading}><div><p className="section-kicker">EVENT CONTROL</p><h2>Find a function, then inspect its positions and roster.</h2></div><span>{events.length} of {allEventCount} functions shown</span></div><div className={styles.filters}><label><span>Search functions</span><div className={styles.inputWithIcon}><Search size={18} aria-hidden="true" /><input value={filter} onChange={(event) => onFilter(event.target.value)} placeholder="Name, ID or status" /></div></label><label><span>Status</span><select value={statusFilter} onChange={(event) => onStatusFilter(event.target.value as typeof statusFilter)}><option value="all">All statuses</option><option value="planned">Planned</option><option value="staffing">Staffing</option><option value="complete">Complete</option></select></label></div>
    {events.length ? <div className={styles.eventTabs}>{events.map((event) => <button className={event.id === selectedEventId ? styles.eventTabActive : ''} key={event.id} type="button" onClick={() => onSelectEvent(event.id)}><CalendarDays size={18} aria-hidden="true" /><span><strong>{event.name}</strong><small>{event.id}</small></span><StatusPill tone={event.status === 'complete' ? 'green' : 'amber'} label={event.status} /></button>)}</div> : <section className={styles.filteredEmpty}><h3>No filter match.</h3><p>The event detail and roster are cleared until a visible function is selected.</p><button type="button" onClick={onClearFilters}>Clear filters</button></section>}
    {selectedEvent && <section className="live-ops-panel"><div className="live-copy"><p className="section-kicker">{selectedEvent.id} · {selectedEvent.status.toUpperCase()}</p><h2>{selectedEvent.name}</h2><p>{selectedEvent.reportingDetails}</p><div className="workforce-lines">{positions.map((position) => <span key={position.id}><strong>{position.role}</strong> {rosterReady ? roster.filter((item) => item.positionId === position.id).length : '…'} / {position.quantity} active · {position.status} · {position.id}</span>)}</div>{claimPosition && <button className="magnetic-btn dark" type="button" disabled={!rosterReady || claimed || feedback.kind === 'busy'} onClick={() => onClaim(claimPosition.id)}>{!rosterReady ? 'Loading linked roster…' : claimed ? 'Sample worker claim reflected' : 'Run sample worker claim'}</button>}<ActionMessage feedback={feedback} canRetry={canRetry} onRetry={onRetry} /></div><div className={styles.rosterPanel} aria-busy={!rosterReady}><div className={styles.rosterHeading}><UsersRound aria-hidden="true" /><div><p className="section-kicker">LINKED ROSTER</p><h3>{rosterReady ? `${roster.length} active assignments` : 'Loading selected roster…'}</h3></div></div>{rosterReady && roster.length === 0 ? <p className={styles.muted}>No active assignments for this function.</p> : roster.map((assignment) => <article className={styles.rosterRow} key={assignment.id}><div><strong>{workers[assignment.workerId]?.displayName ?? assignment.workerId}</strong><span>{workers[assignment.workerId]?.role ?? 'Role unavailable'} · {assignment.response}</span></div><small>{assignment.id}<br />{assignment.workerId}</small></article>)}</div></section>}
  </>;
}

function RequirementsPanel({ events, requirements, positions, onSelectEvent }: { events: PreviewEvent[]; requirements: Requirement[]; positions: Position[]; onSelectEvent: (id: string) => void }) {
  return <><div className={styles.panelHeading}><div><p className="section-kicker">LINKED REQUIREMENTS</p><h2>Capacity is read from each position.</h2></div><p>Quantities are deliberately 6 and 40—there is no fixed 10+1 assumption.</p></div><div className="admin-grid">{requirements.map((requirement) => <article className="ops-card" key={requirement.id}><p className="section-kicker">{requirement.status.toUpperCase()} · {requirement.id}</p><h2>{requirement.quantity} × {requirement.role}</h2><p>{requirement.notes}</p><div className={styles.identityBlock}><span>Booking <strong>{requirement.bookingId}</strong></span><span>Function <strong>{events.find((item) => item.id === requirement.eventId)?.name ?? requirement.eventId}</strong></span><span>Position <strong>{positions.find((item) => item.eventId === requirement.eventId && item.role === requirement.role)?.id ?? 'No linked position'}</strong></span></div><button className="magnetic-btn dark" type="button" onClick={() => onSelectEvent(requirement.eventId)}>View linked roster <ArrowRight size={17} aria-hidden="true" /></button></article>)}</div></>;
}

function ActionMessage({ feedback, canRetry, onRetry }: { feedback: ActionFeedback; canRetry: boolean; onRetry: () => void }) {
  if (feedback.kind === 'idle') return null;
  return <output className={`${styles.actionMessage} ${feedback.kind === 'error' ? styles.actionError : ''}`} aria-live="polite"><span>{feedback.code ? `${feedback.code}: ` : ''}{feedback.message}</span>{feedback.kind === 'error' && canRetry && <button type="button" onClick={onRetry}>Retry this action</button>}</output>;
}
