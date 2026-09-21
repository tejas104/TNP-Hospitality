'use client';

import {
  AlertCircle,
  ArrowRight,
  Banknote,
  CalendarDays,
  ClipboardCheck,
  LayoutDashboard,
  RefreshCw,
  Search,
  UsersRound,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Metric } from '@/components/tnp/shared/Metric';
import { StatusPill } from '@/components/tnp/shared/StatusPill';
import type {
  Quote,
  Earning,
  Payout,
  Collection,
  Paginated,
  QueryOptions,
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
  ScenarioMetadata,
  Worker,
} from '@/lib/contracts/preview';
import { PREVIEW_OPERATIONS } from '@/lib/demo/service';
import { getBrowserPreviewService } from '@/lib/services/preview';
import {
  AttendancePanel,
  VerificationPanel,
  type ActionFeedback,
} from './OperationsDecisionPanels';
import { OperationsReports } from './OperationsReports';
import {
  canRetryFeedback,
  filterOperationsEvents,
  isCurrentActionEpoch,
  isCurrentRosterRequest,
  operationsSectionItems,
  reconcileSelectedId,
  type EventStatusFilter,
  type OperationsSection as Panel,
} from './operationsState';
import styles from './AdminOperations.module.css';

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
  generation: number | null;
  metadata: ScenarioMetadata | null;
};

const emptyData: DashboardData = {
  events: [],
  positions: [],
  requirements: [],
  roster: [],
  workers: {},
  metrics: {},
  applications: [],
  assignments: [],
  attendances: [],
  audit: [],
  generation: null,
  metadata: null,
};

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
  return error.code === 'PREVIEW_LOADING'
    ? {
        kind: 'loading',
        message: 'The synthetic scenario is in its loading state.',
      }
    : { kind: 'error', message: error.message };
}

function StatePanel({
  state,
  onRetry,
}: {
  state: Exclude<LoadState, { kind: 'ready' }>;
  onRetry: () => void;
}) {
  const loading = state.kind === 'loading';
  return (
    <section
      className={styles.statePanel}
      aria-live="polite"
      aria-busy={loading}
    >
      {loading ? (
        <RefreshCw className={styles.spin} aria-hidden="true" />
      ) : (
        <AlertCircle aria-hidden="true" />
      )}
      <div>
        <p className="section-kicker">
          {state.kind === 'empty' ? 'EMPTY SAMPLE STATE' : 'PREVIEW STATE'}
        </p>
        <h2>{state.message}</h2>
        <p>
          No production system was contacted. Change or reset the synthetic
          preview state, then retry.
        </p>
      </div>
      <button
        className="magnetic-btn dark"
        type="button"
        onClick={onRetry}
        disabled={loading}
      >
        Retry preview query
      </button>
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
  const workspaceRef = useRef<HTMLElement>(null);
  const retainedAction = useRef<{
    actionId: string;
    run: (epoch: number) => Promise<void>;
  } | null>(null);
  const [panel, setPanel] = useState<Panel>('overview');
  const [loadState, setLoadState] = useState<LoadState>({
    kind: 'loading',
    message: 'Loading Operations preview…',
  });
  const [data, setData] = useState<DashboardData>(emptyData);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatusFilter>('all');
  const [rosterReadyForEventId, setRosterReadyForEventId] = useState('');
  const [feedback, setFeedback] = useState<ActionFeedback>({
    kind: 'idle',
    message: '',
  });

  const refreshAll = useCallback(async (retainVisible = false) => {
    const instance = service.current;
    if (!instance) return;
    const refreshId = ++refreshEpoch.current;
    if (!retainVisible)
      setLoadState({
        kind: 'loading',
        message: 'Refreshing linked Operations records…',
      });
    const [
      generation,
      metadata,
      events,
      positions,
      requirements,
      metrics,
      applications,
      assignments,
      audit,
    ] = await Promise.all([
      instance.getGeneration(),
      instance.getScenarioMetadata(),
      instance.listEvents(),
      instance.listPositions(),
      instance.listRequirements(),
      instance.getMetrics(),
      instance.listApplications(),
      instance.listAssignments(),
      instance.listAudit(),
    ]);
    if (!isCurrentActionEpoch(refreshId, refreshEpoch.current)) return;
    const results = [
      events,
      positions,
      requirements,
      metrics,
      applications,
      assignments,
      audit,
    ];
    const failure = results.find((result) => !result.ok);
    if (failure && !failure.ok) {
      setLoadState(errorState(failure.error));
      return;
    }
    if (
      !events.ok ||
      !positions.ok ||
      !requirements.ok ||
      !metrics.ok ||
      !applications.ok ||
      !assignments.ok ||
      !audit.ok
    )
      return;
    if (!events.value.items.length) {
      selectedEventRef.current = '';
      setSelectedEventId('');
      setRosterReadyForEventId('');
      setData({
        ...emptyData,
        generation,
        metadata,
        positions: positions.value.items,
        requirements: requirements.value.items,
        metrics: metrics.value,
        applications: applications.value.items,
        assignments: assignments.value.items,
        audit: audit.value.items,
      });
      setLoadState({
        kind: 'empty',
        message: 'No sample Operations events are available.',
      });
      return;
    }
    const visibleEvents = filterOperationsEvents(
      events.value.items,
      filterRef.current,
      statusFilterRef.current,
    );
    const nextSelected = reconcileSelectedId(
      selectedEventRef.current,
      visibleEvents.map((event) => event.id),
    );
    selectedEventRef.current = nextSelected;
    setSelectedEventId(nextSelected);
    setRosterReadyForEventId('');
    const rosterRequestId = ++rosterRequestEpoch.current;
    const roster = nextSelected
      ? await instance.listRoster(nextSelected)
      : null;
    if (
      refreshId !== refreshEpoch.current ||
      !isCurrentRosterRequest(
        rosterRequestId,
        rosterRequestEpoch.current,
        nextSelected,
        selectedEventRef.current,
      )
    )
      return;
    if (roster && !roster.ok) {
      setLoadState(errorState(roster.error));
      return;
    }
    const workerIds = [
      ...new Set([
        ...assignments.value.items.map((item) => item.workerId),
        ...applications.value.items.map((item) => item.applicantId),
        'tnp-demo-worker-006',
      ]),
    ];
    const standings = await Promise.all(
      workerIds.map(async (id) => ({
        id,
        result: await instance.getStanding(id),
      })),
    );
    if (
      refreshId !== refreshEpoch.current ||
      !isCurrentRosterRequest(
        rosterRequestId,
        rosterRequestEpoch.current,
        nextSelected,
        selectedEventRef.current,
      )
    )
      return;
    const standingFailure = standings.find(
      ({ result }) => !result.ok && result.error.code !== 'NOT_FOUND',
    );
    if (standingFailure && !standingFailure.result.ok) {
      setLoadState(errorState(standingFailure.result.error));
      return;
    }
    const workers = standings.reduce<Record<string, Worker>>((map, item) => {
      if (item.result.ok) map[item.id] = item.result.value;
      return map;
    }, {});
    const attendanceResults = await Promise.all(
      Object.keys(workers).map((id) => instance.getAttendanceHistory(id)),
    );
    if (
      refreshId !== refreshEpoch.current ||
      !isCurrentRosterRequest(
        rosterRequestId,
        rosterRequestEpoch.current,
        nextSelected,
        selectedEventRef.current,
      )
    )
      return;
    const attendanceFailure = attendanceResults.find((result) => !result.ok);
    if (attendanceFailure && !attendanceFailure.ok) {
      setLoadState(errorState(attendanceFailure.error));
      return;
    }
    const attendances = [
      ...new Map(
        attendanceResults
          .flatMap((result) => (result.ok ? result.value.items : []))
          .map((item) => [item.id, item]),
      ).values(),
    ];
    setData({
      events: events.value.items,
      positions: positions.value.items,
      requirements: requirements.value.items,
      roster: roster?.ok ? roster.value.items : [],
      workers,
      metrics: metrics.value,
      applications: applications.value.items,
      assignments: assignments.value.items,
      attendances,
      audit: audit.value.items,
      generation,
      metadata,
    });
    setRosterReadyForEventId(nextSelected);
    setLoadState({
      kind: 'ready',
      message: `Preview generation ${generation}`,
    });
  }, []);

  useEffect(() => {
    let active = true;
    void getBrowserPreviewService().then((instance) => {
      if (active) {
        service.current = instance;
        void refreshAll();
      }
    });
    const refresh = () => {
      actionEpoch.current += 1;
      rosterRequestEpoch.current += 1;
      retainedAction.current = null;
      setFeedback({ kind: 'idle', message: '' });
      void refreshAll();
    };
    window.addEventListener('tnp-preview-change', refresh);
    window.addEventListener('tnp-preview-reset', refresh);
    return () => {
      active = false;
      window.removeEventListener('tnp-preview-change', refresh);
      window.removeEventListener('tnp-preview-reset', refresh);
    };
  }, [refreshAll]);

  const reportActionFailure = useCallback(
    (error: PreviewError, actionId: string, epoch: number) => {
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
        message:
          error.code === 'STALE_GENERATION'
            ? 'Preview generation changed. Current records were not overwritten; refresh before starting a new action.'
            : error.message,
      });
    },
    [],
  );

  const executeRequest = useCallback(
    async (
      request: AnyMutationRequest,
      label: string,
      actionId: string,
      epoch: number,
    ) => {
      const instance = service.current;
      if (!instance || !isCurrentActionEpoch(epoch, actionEpoch.current))
        return;
      setFeedback({ kind: 'busy', message: `${label}…`, actionId });
      const result = (await instance.mutate(
        request as MutationRequest<PreviewOperation>,
      )) as PreviewOutcome<unknown>;
      if (!isCurrentActionEpoch(epoch, actionEpoch.current)) return;
      if (!result.ok) {
        reportActionFailure(result.error, actionId, epoch);
        return;
      }
      retainedAction.current = null;
      setFeedback({
        kind: 'success',
        actionId,
        message: `${label} completed${result.replayed ? ' from the retained request receipt' : ''}.`,
      });
      await refreshAll(true);
    },
    [refreshAll, reportActionFailure],
  );

  const beginOperation = useCallback(
    async <Operation extends PreviewOperation>(
      operation: Operation,
      payload: PreviewMutationMap[Operation]['payload'],
      label: string,
      actorId = 'tnp-demo-ops-001',
    ) => {
      const instance = service.current;
      if (!instance) return;
      const epoch = ++actionEpoch.current;
      retainedAction.current = null;
      setFeedback({
        kind: 'busy',
        message: `Preparing ${label.toLowerCase()}…`,
      });
      const request: MutationRequest<Operation> = {
        requestKey: `operations-${operation}-${crypto.randomUUID()}`,
        expectedGeneration: await instance.getGeneration(),
        actorId,
        operation,
        payload,
      };
      if (!isCurrentActionEpoch(epoch, actionEpoch.current)) return;
      const actionId = `${operation}:${request.requestKey}`;
      const run = (nextEpoch: number) =>
        executeRequest(
          request as AnyMutationRequest,
          label,
          actionId,
          nextEpoch,
        );
      retainedAction.current = { actionId, run };
      await run(epoch);
    },
    [executeRequest],
  );

  const recordAttendance = useCallback(
    async (
      assignmentId: string,
      evidenceState:
        | 'recorded'
        | 'gps-denied'
        | 'gps-missing'
        | 'outside-radius',
      note: string,
      distanceMetres?: number,
    ) => {
      const instance = service.current;
      if (!instance) return;
      const requestKey = `operations-recordAttendance-${crypto.randomUUID()}`;
      const actionId = `recordAttendance:${assignmentId}:${requestKey}`;
      const epoch = ++actionEpoch.current;
      retainedAction.current = null;
      setFeedback({
        kind: 'busy',
        actionId,
        message: 'Reading the selected assignment pass…',
      });
      const expectedGeneration = await instance.getGeneration();
      if (!isCurrentActionEpoch(epoch, actionEpoch.current)) return;
      const run = async (nextEpoch: number) => {
        if (!isCurrentActionEpoch(nextEpoch, actionEpoch.current)) return;
        setFeedback({
          kind: 'busy',
          actionId,
          message: 'Reading the selected assignment pass…',
        });
        const pass = await instance.getEventPass(assignmentId);
        if (!isCurrentActionEpoch(nextEpoch, actionEpoch.current)) return;
        if (!pass.ok) {
          reportActionFailure(pass.error, actionId, nextEpoch);
          return;
        }
        const request: MutationRequest<'recordAttendance'> = {
          requestKey,
          expectedGeneration,
          actorId: 'tnp-demo-ops-001',
          operation: PREVIEW_OPERATIONS.recordAttendance,
          payload: {
            token: pass.value.token,
            eventId: pass.value.eventId,
            evidenceState,
            note,
            distanceMetres,
          },
        };
        await executeRequest(
          request,
          'Attendance capture',
          actionId,
          nextEpoch,
        );
      };
      retainedAction.current = { actionId, run };
      await run(epoch);
    },
    [executeRequest, reportActionFailure],
  );

  const selectEvent = useCallback(async (eventId: string) => {
    const instance = service.current;
    selectedEventRef.current = eventId;
    setSelectedEventId(eventId);
    setPanel('events');
    if (!instance) return;
    const requestId = ++rosterRequestEpoch.current;
    setRosterReadyForEventId('');
    setData((current) => ({ ...current, roster: [] }));
    const roster = await instance.listRoster(eventId);
    if (
      !isCurrentRosterRequest(
        requestId,
        rosterRequestEpoch.current,
        eventId,
        selectedEventRef.current,
      )
    )
      return;
    if (!roster.ok) {
      setLoadState(errorState(roster.error));
      return;
    }
    setData((current) => ({ ...current, roster: roster.value.items }));
    setRosterReadyForEventId(eventId);
  }, []);

  const updateFilters = useCallback(
    (nextFilter: string, nextStatus: EventStatusFilter) => {
      filterRef.current = nextFilter;
      statusFilterRef.current = nextStatus;
      setFilter(nextFilter);
      setStatusFilter(nextStatus);
      const visible = filterOperationsEvents(
        data.events,
        nextFilter,
        nextStatus,
      );
      const nextSelected = reconcileSelectedId(
        selectedEventRef.current,
        visible.map((event) => event.id),
      );
      if (!nextSelected) {
        rosterRequestEpoch.current += 1;
        selectedEventRef.current = '';
        setSelectedEventId('');
        setRosterReadyForEventId('');
        setData((current) => ({ ...current, roster: [] }));
        return;
      }
      if (nextSelected !== selectedEventRef.current)
        void selectEvent(nextSelected);
    },
    [data.events, selectEvent],
  );

  const retryCurrentAction = useCallback(() => {
    const action = retainedAction.current;
    if (!action || !canRetryFeedback(feedback, action.actionId)) return;
    const epoch = ++actionEpoch.current;
    void action.run(epoch);
  }, [feedback]);

  const filteredEvents = useMemo(() => {
    return filterOperationsEvents(data.events, filter, statusFilter);
  }, [data.events, filter, statusFilter]);
  const selectedEvent =
    filteredEvents.find((event) => event.id === selectedEventId) ?? null;
  const selectedPositions = selectedEvent
    ? data.positions.filter((position) => position.eventId === selectedEvent.id)
    : [];
  const feedbackCanRetry =
    feedback.kind === 'error' && feedback.retryable === true;
  const sections = operationsSectionItems(panel);

  const openSection = (id: Panel) => {
    setPanel(id);
    // Focus after the new panel renders. Default focus scrolling can jump past the top of a tall panel,
    // so only align the workspace start when it is not already in view.
    requestAnimationFrame(() => {
      const workspace = workspaceRef.current;
      if (!workspace) return;
      workspace.focus({ preventScroll: true });
      const { top } = workspace.getBoundingClientRect();
      if (top < 0 || top > window.innerHeight * 0.75)
        workspace.scrollIntoView({ block: 'start' });
    });
  };

  return (
    <main id="main-content" tabIndex={-1} className="admin-shell">
      <aside className="admin-sidebar" aria-label="Operations sections">
        <strong>TNP OPERATIONS</strong>
        {sections.map((item, index) => (
          <button
            className={`${styles.navButton} ${item.current ? styles.navButtonActive : ''}`}
            key={item.id}
            type="button"
            aria-current={item.current ? 'page' : undefined}
            aria-controls="operations-workspace"
            onClick={() => openSection(item.id)}
          >
            <small>{String(index + 1).padStart(2, '0')}</small>
            <span>{item.label}</span>
          </button>
        ))}
      </aside>
      <section className="admin-main">
        <div className="admin-header">
          <p className="section-kicker">
            TNP OPERATIONS · SYNTHETIC WORKFORCE PREVIEW
          </p>
          <div className={styles.headerIntro}>
            <div>
              <h1>Today in Operations</h1>
              <p>
                Move from the overview to events, people, attendance and finance
                without losing context.
              </p>
            </div>
            <div className={styles.currentDesk}>
              <span>CURRENT DESK</span>
              <strong>{sections.find((item) => item.current)?.label}</strong>
              <small>All records are synthetic</small>
            </div>
          </div>
          <div className={styles.headerMeta}>
            <StatusPill
              tone="green"
              label={
                loadState.kind === 'ready'
                  ? loadState.message
                  : 'Synthetic data only'
              }
            />
            <span>
              No live tracking, allocation authority, identity decision or
              payment.
            </span>
          </div>
        </div>
        {loadState.kind === 'ready' ? (
          <>
            <div
              className={styles.commandBar}
              aria-label="Operations quick actions"
            >
              <button type="button" onClick={() => openSection('overview')}>
                <LayoutDashboard aria-hidden="true" />
                <span>
                  <strong>Overview</strong>
                  <small>Whole operation at a glance</small>
                </span>
              </button>
              <button type="button" onClick={() => openSection('events')}>
                <CalendarDays aria-hidden="true" />
                <span>
                  <strong>Run events</strong>
                  <small>Functions, positions and roster</small>
                </span>
              </button>
              <button type="button" onClick={() => openSection('verification')}>
                <ClipboardCheck aria-hidden="true" />
                <span>
                  <strong>Review people</strong>
                  <small>Applications and role checks</small>
                </span>
              </button>
              <button type="button" onClick={() => openSection('finance')}>
                <Banknote aria-hidden="true" />
                <span>
                  <strong>Finance desk</strong>
                  <small>Quotes, earnings and payouts</small>
                </span>
              </button>
            </div>
            <div className={styles.metricsHeading}>
              <span>AT A GLANCE</span>
              <small>Click any metric to open its working area</small>
            </div>
            <div className="admin-stats" aria-label="Operations metrics">
              <button
                className={styles.metricButton}
                type="button"
                onClick={() => setPanel('events')}
              >
                <Metric
                  value={String(data.metrics.events ?? 0)}
                  label="Linked functions"
                />
              </button>
              <button
                className={styles.metricButton}
                type="button"
                onClick={() => setPanel('requirements')}
              >
                <Metric
                  value={String(data.metrics.positions ?? 0)}
                  label="Required positions"
                />
              </button>
              <button
                className={styles.metricButton}
                type="button"
                onClick={() => setPanel('events')}
              >
                <Metric
                  value={String(data.metrics.activeAssignments ?? 0)}
                  label="Active assignments"
                />
              </button>
              <button
                className={styles.metricButton}
                type="button"
                onClick={() => setPanel('verification')}
              >
                <Metric
                  value={String(
                    data.applications.filter(
                      (item) => item.status === 'pending',
                    ).length,
                  )}
                  label="Pending reviews"
                />
              </button>
              <button
                className={styles.metricButton}
                type="button"
                onClick={() => setPanel('attendance')}
              >
                <Metric
                  value={String(data.metrics.attendanceExceptions ?? 0)}
                  label="Attendance exceptions"
                />
              </button>
            </div>
            <nav className={styles.compactNav} aria-label="Operations sections">
              <ul>
                {sections.map((item) => (
                  <li key={item.id}>
                    <button
                      className={item.current ? styles.compactNavActive : ''}
                      type="button"
                      aria-current={item.current ? 'page' : undefined}
                      aria-controls="operations-workspace"
                      onClick={() => openSection(item.id)}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            <section
              className={styles.workspace}
              id="operations-workspace"
              ref={workspaceRef}
              tabIndex={-1}
              aria-label={`${sections.find((item) => item.current)?.label} workspace`}
            >
              {panel === 'finance' && (
                <FinancePanel
                  key={data.generation}
                  refreshSignal={feedback.kind + feedback.actionId}
                  feedback={feedback}
                  canRetry={feedbackCanRetry}
                  onRetry={retryCurrentAction}
                  onApprove={(earningId, stage) =>
                    void beginOperation(
                      'approveEarning',
                      { earningId, stage },
                      'Sample ' + stage + ' approval',
                      stage === 'supervisor'
                        ? 'tnp-demo-supervisor-001'
                        : 'tnp-demo-finance-001',
                    )
                  }
                  onAdjust={(payload) =>
                    void beginOperation(
                      'adjustEarning',
                      payload,
                      'Sample earning adjustment',
                      'tnp-demo-finance-001',
                    )
                  }
                  onRevise={(payload) =>
                    void beginOperation(
                      'reviseQuote',
                      payload,
                      'Sample quote revision',
                      'tnp-demo-finance-001',
                    )
                  }
                />
              )}
              {panel === 'catalogue' && <CataloguePanel />}
              {panel === 'overview' && (
                <OverviewPanel
                  events={data.events}
                  positions={data.positions}
                  requirements={data.requirements}
                  onSelectEvent={(id) => void selectEvent(id)}
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
                  rosterReady={Boolean(
                    selectedEvent && rosterReadyForEventId === selectedEvent.id,
                  )}
                  filter={filter}
                  statusFilter={statusFilter}
                  feedback={feedback}
                  canRetry={feedbackCanRetry}
                  onFilter={(value) =>
                    updateFilters(value, statusFilterRef.current)
                  }
                  onStatusFilter={(value) =>
                    updateFilters(filterRef.current, value)
                  }
                  onClearFilters={() => updateFilters('', 'all')}
                  onSelectEvent={(id) => void selectEvent(id)}
                  onClaim={(positionId) =>
                    void beginOperation(
                      'claimOpportunity',
                      { positionId, workerId: 'tnp-demo-worker-006' },
                      'Sample worker claim',
                    )
                  }
                  onRetry={retryCurrentAction}
                />
              )}
              {panel === 'requirements' && (
                <RequirementsPanel
                  events={data.events}
                  requirements={data.requirements}
                  positions={data.positions}
                  onSelectEvent={(id) => void selectEvent(id)}
                />
              )}
              {panel === 'verification' && (
                <VerificationPanel
                  applications={data.applications}
                  workers={data.workers}
                  feedback={feedback}
                  canRetry={feedbackCanRetry}
                  onReview={(payload) =>
                    void beginOperation(
                      'reviewApplication',
                      payload,
                      'Application review',
                    )
                  }
                  onChangeRole={(payload) =>
                    void beginOperation(
                      'changeRole',
                      payload,
                      'Role adjustment',
                    )
                  }
                  onRetry={retryCurrentAction}
                />
              )}
              {panel === 'reports' &&
                data.generation !== null &&
                data.metadata && (
                  <OperationsReports
                    key={`generation-${data.generation}`}
                    generation={data.generation}
                    metadata={data.metadata}
                    events={data.events}
                    positions={data.positions}
                    assignments={data.assignments}
                    applications={data.applications}
                    attendances={data.attendances}
                    audit={data.audit}
                  />
                )}
              {panel === 'attendance' && (
                <AttendancePanel
                  attendances={data.attendances}
                  assignments={data.assignments}
                  positions={data.positions}
                  workers={data.workers}
                  audit={data.audit}
                  feedback={feedback}
                  canRetry={feedbackCanRetry}
                  onCorrect={(payload) =>
                    void beginOperation(
                      'correctAttendance',
                      payload,
                      'Attendance correction',
                    )
                  }
                  onNonresponse={(payload) =>
                    void beginOperation(
                      'markNonresponse',
                      payload,
                      'Nonresponse decision',
                    )
                  }
                  onAdminAssign={(payload) =>
                    void beginOperation(
                      'adminAssign',
                      payload,
                      'Admin assignment',
                    )
                  }
                  onReplace={(payload) =>
                    void beginOperation(
                      'replaceAssignment',
                      payload,
                      'Assignment replacement',
                    )
                  }
                  onRecord={(...args) => void recordAttendance(...args)}
                  onRetry={retryCurrentAction}
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

function OverviewPanel({
  events,
  positions,
  requirements,
  onSelectEvent,
}: {
  events: PreviewEvent[];
  positions: Position[];
  requirements: Requirement[];
  onSelectEvent: (id: string) => void;
}) {
  return (
    <>
      <div className={styles.panelHeading}>
        <div>
          <p className="section-kicker">OPERATIONS OVERVIEW</p>
          <h2>Review event staffing and outstanding decisions</h2>
        </div>
        <p>
          Totals come from the shared synthetic scenario, not a local Operations
          fixture.
        </p>
      </div>
      <div className="admin-grid">
        {events.map((event) => {
          const eventPositions = positions.filter(
            (item) => item.eventId === event.id,
          );
          return (
            <article className="ops-card" key={event.id}>
              <p className="section-kicker">
                {event.status.toUpperCase()} · {event.id}
              </p>
              <h2>{event.name}</h2>
              <p>
                {formatDate(event.startsAt)} · {event.timezone}
              </p>
              <div className={styles.summaryRows}>
                <span>
                  <strong>
                    {
                      requirements.filter((item) => item.eventId === event.id)
                        .length
                    }
                  </strong>{' '}
                  linked requirement
                </span>
                <span>
                  <strong>
                    {eventPositions.reduce(
                      (total, item) => total + item.quantity,
                      0,
                    )}
                  </strong>{' '}
                  required professionals
                </span>
                <span>
                  <strong>{eventPositions.length}</strong> position types
                </span>
              </div>
              <button
                className="magnetic-btn dark"
                type="button"
                onClick={() => onSelectEvent(event.id)}
              >
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
  rosterReady,
  filter,
  statusFilter,
  feedback,
  canRetry,
  onFilter,
  onStatusFilter,
  onClearFilters,
  onSelectEvent,
  onClaim,
  onRetry,
}: {
  events: PreviewEvent[];
  allEventCount: number;
  positions: Position[];
  roster: Assignment[];
  workers: Record<string, Worker>;
  selectedEvent: PreviewEvent | null;
  selectedEventId: string;
  rosterReady: boolean;
  filter: string;
  statusFilter: EventStatusFilter;
  feedback: ActionFeedback;
  canRetry: boolean;
  onFilter: (value: string) => void;
  onStatusFilter: (value: EventStatusFilter) => void;
  onClearFilters: () => void;
  onSelectEvent: (id: string) => void;
  onClaim: (id: string) => void;
  onRetry: () => void;
}) {
  const claimPosition = positions.find(
    (item) => item.role === 'Event Coordinator' && item.status === 'open',
  );
  const claimed = roster.some(
    (item) => item.workerId === 'tnp-demo-worker-006',
  );
  return (
    <>
      <div className={styles.panelHeading}>
        <div>
          <p className="section-kicker">EVENT CONTROL</p>
          <h2>Find a function, then inspect its positions and roster.</h2>
        </div>
        <span>
          {events.length} of {allEventCount} functions shown
        </span>
      </div>
      <div className={styles.filters}>
        <label>
          <span>Search functions</span>
          <div className={styles.inputWithIcon}>
            <Search size={18} aria-hidden="true" />
            <input
              value={filter}
              onChange={(event) => onFilter(event.target.value)}
              placeholder="Name, ID or status"
            />
          </div>
        </label>
        <label>
          <span>Status</span>
          <select
            value={statusFilter}
            onChange={(event) =>
              onStatusFilter(event.target.value as typeof statusFilter)
            }
          >
            <option value="all">All statuses</option>
            <option value="planned">Planned</option>
            <option value="staffing">Staffing</option>
            <option value="complete">Complete</option>
          </select>
        </label>
      </div>
      {events.length ? (
        <div className={styles.eventTabs}>
          {events.map((event) => (
            <button
              className={
                event.id === selectedEventId ? styles.eventTabActive : ''
              }
              key={event.id}
              type="button"
              onClick={() => onSelectEvent(event.id)}
            >
              <CalendarDays size={18} aria-hidden="true" />
              <span>
                <strong>{event.name}</strong>
                <small>{event.id}</small>
              </span>
              <StatusPill
                tone={event.status === 'complete' ? 'green' : 'amber'}
                label={event.status}
              />
            </button>
          ))}
        </div>
      ) : (
        <section className={styles.filteredEmpty}>
          <h3>No filter match.</h3>
          <p>
            The event detail and roster are cleared until a visible function is
            selected.
          </p>
          <button type="button" onClick={onClearFilters}>
            Clear filters
          </button>
        </section>
      )}
      {selectedEvent && (
        <section className="live-ops-panel">
          <div className="live-copy">
            <p className="section-kicker">
              {selectedEvent.id} · {selectedEvent.status.toUpperCase()}
            </p>
            <h2>{selectedEvent.name}</h2>
            <p>{selectedEvent.reportingDetails}</p>
            <div className="workforce-lines">
              {positions.map((position) => (
                <span key={position.id}>
                  <strong>{position.role}</strong>{' '}
                  {rosterReady
                    ? roster.filter((item) => item.positionId === position.id)
                        .length
                    : '…'}{' '}
                  / {position.quantity} active · {position.status} ·{' '}
                  {position.id}
                </span>
              ))}
            </div>
            {claimPosition && (
              <button
                className="magnetic-btn dark"
                type="button"
                disabled={!rosterReady || claimed || feedback.kind === 'busy'}
                onClick={() => onClaim(claimPosition.id)}
              >
                {!rosterReady
                  ? 'Loading linked roster…'
                  : claimed
                    ? 'Sample worker claim reflected'
                    : 'Run sample worker claim'}
              </button>
            )}
            <ActionMessage
              feedback={feedback}
              canRetry={canRetry}
              onRetry={onRetry}
            />
          </div>
          <div className={styles.rosterPanel} aria-busy={!rosterReady}>
            <div className={styles.rosterHeading}>
              <UsersRound aria-hidden="true" />
              <div>
                <p className="section-kicker">LINKED ROSTER</p>
                <h3>
                  {rosterReady
                    ? `${roster.length} active assignments`
                    : 'Loading selected roster…'}
                </h3>
              </div>
            </div>
            {rosterReady && roster.length === 0 ? (
              <p className={styles.muted}>
                No active assignments for this function.
              </p>
            ) : (
              roster.map((assignment) => (
                <article className={styles.rosterRow} key={assignment.id}>
                  <div>
                    <strong>
                      {workers[assignment.workerId]?.displayName ??
                        assignment.workerId}
                    </strong>
                    <span>
                      {workers[assignment.workerId]?.role ?? 'Role unavailable'}{' '}
                      · {assignment.response}
                    </span>
                  </div>
                  <small>
                    {assignment.id}
                    <br />
                    {assignment.workerId}
                  </small>
                </article>
              ))
            )}
          </div>
        </section>
      )}
    </>
  );
}

function RequirementsPanel({
  events,
  requirements,
  positions,
  onSelectEvent,
}: {
  events: PreviewEvent[];
  requirements: Requirement[];
  positions: Position[];
  onSelectEvent: (id: string) => void;
}) {
  return (
    <>
      <div className={styles.panelHeading}>
        <div>
          <p className="section-kicker">LINKED REQUIREMENTS</p>
          <h2>Capacity is read from each position.</h2>
        </div>
        <p>
          Quantities are deliberately 6 and 40—there is no fixed 10+1
          assumption.
        </p>
      </div>
      <div className="admin-grid">
        {requirements.map((requirement) => (
          <article className="ops-card" key={requirement.id}>
            <p className="section-kicker">
              {requirement.status.toUpperCase()} · {requirement.id}
            </p>
            <h2>
              {requirement.quantity} × {requirement.role}
            </h2>
            <p>{requirement.notes}</p>
            <div className={styles.identityBlock}>
              <span>
                Booking <strong>{requirement.bookingId}</strong>
              </span>
              <span>
                Function{' '}
                <strong>
                  {events.find((item) => item.id === requirement.eventId)
                    ?.name ?? requirement.eventId}
                </strong>
              </span>
              <span>
                Position{' '}
                <strong>
                  {positions.find(
                    (item) =>
                      item.eventId === requirement.eventId &&
                      item.role === requirement.role,
                  )?.id ?? 'No linked position'}
                </strong>
              </span>
            </div>
            <button
              className="magnetic-btn dark"
              type="button"
              onClick={() => onSelectEvent(requirement.eventId)}
            >
              View linked roster <ArrowRight size={17} aria-hidden="true" />
            </button>
          </article>
        ))}
      </div>
    </>
  );
}

function ActionMessage({
  feedback,
  canRetry,
  onRetry,
}: {
  feedback: ActionFeedback;
  canRetry: boolean;
  onRetry: () => void;
}) {
  if (feedback.kind === 'idle') return null;
  return (
    <output
      className={`${styles.actionMessage} ${feedback.kind === 'error' ? styles.actionError : ''}`}
      aria-live="polite"
    >
      <span>
        {feedback.code ? `${feedback.code}: ` : ''}
        {feedback.message}
      </span>
      {feedback.kind === 'error' && canRetry && (
        <button type="button" onClick={onRetry}>
          Retry this action
        </button>
      )}
    </output>
  );
}

const money = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(
    value / 100,
  );
async function financePages<T>(
  query: (options: QueryOptions) => Promise<PreviewOutcome<Paginated<T>>>,
) {
  const rows: T[] = [];
  let cursor: string | undefined;
  const seen = new Set<string>();
  do {
    const result = await query({ cursor });
    if (!result.ok) throw Error(result.error.message);
    rows.push(...result.value.items);
    cursor = result.value.nextCursor ?? undefined;
    if (cursor && seen.has(cursor)) throw Error('Repeated page cursor.');
    if (cursor) seen.add(cursor);
  } while (cursor);
  return rows;
}
function FinancePanel({
  refreshSignal,
  feedback,
  canRetry,
  onRetry,
  onApprove,
  onAdjust,
  onRevise,
}: {
  refreshSignal: string;
  feedback: ActionFeedback;
  canRetry: boolean;
  onRetry: () => void;
  onApprove: (id: string, stage: 'supervisor' | 'finance') => void;
  onAdjust: (payload: PreviewMutationMap['adjustEarning']['payload']) => void;
  onRevise: (payload: PreviewMutationMap['reviseQuote']['payload']) => void;
}) {
  const [data, setData] = useState<{
    quotes: Quote[];
    earnings: Earning[];
    payouts: Payout[];
    collections: Collection[];
  } | null>(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [tab, setTab] = useState('Quotes');
  const [selected, setSelected] = useState('');
  const [reason, setReason] = useState('');
  const [gross, setGross] = useState('');
  const [deductions, setDeductions] = useState('');
  const [entity, setEntity] = useState('');
  const [unit, setUnit] = useState('');
  const [validation, setValidation] = useState('');
  const [filter, setFilter] = useState('');
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const service = await getBrowserPreviewService();
        const [quotes, earnings, payouts, collections] = await Promise.all([
          financePages((o) => service.listQuotes(undefined, o)),
          financePages((o) => service.listEarnings(undefined, o)),
          financePages((o) => service.listPayouts(undefined, o)),
          financePages((o) => service.listCollections(undefined, o)),
        ]);
        if (active) {
          setData({ quotes, earnings, payouts, collections });
          setError('');
        }
      } catch (e) {
        if (active)
          setError(
            e instanceof Error ? e.message : 'Finance records unavailable.',
          );
      }
    })();
    return () => {
      active = false;
    };
  }, [retry, refreshSignal]);
  const busy = feedback.kind === 'busy';
  const earning = data?.earnings.find((e) => e.id === selected);
  const quote = data?.quotes.find((q) => q.id === selected);
  const matching = (text: string) =>
    text.toLowerCase().includes(filter.trim().toLowerCase());
  const switchTab = (value: string) => {
    setTab(value);
    setSelected('');
    setReason('');
    setValidation('');
    setFilter('');
  };
  return (
    <div className={styles.finance}>
      {quote && tab === 'Quotes' && (
        <article className={styles.printQuote} data-sample-quote>
          <header>
            <p>SAMPLE — NOT AN OFFICIAL QUOTATION OR INVOICE</p>
            <h1>TNP · Sample quotation</h1>
            <p>{quote.issuingEntity}</p>
          </header>
          <p>
            Reference {quote.id} · Version {quote.version} · {quote.status}
          </p>
          <p>Booking {quote.bookingId}</p>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit rate</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {quote.lines.map((line) => (
                <tr key={line.id}>
                  <td>{line.label}</td>
                  <td>{line.quantity}</td>
                  <td>{money(line.unitPaise)}</td>
                  <td>{money(line.totalPaise)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2>Total {money(quote.totalPaise)}</h2>
          <p>{quote.revisionReason}</p>
          <footer>
            Browser preview only. This document does not issue a commercial
            offer, invoice, tax receipt or payment acknowledgement.
          </footer>
        </article>
      )}
      <div className={styles.panelHeading}>
        <div>
          <p className="section-kicker">INTERNAL FINANCE / SYNTHETIC</p>
          <h2>Quotes and workforce earnings</h2>
        </div>
        <p>
          Separate sample supervisor and finance decisions. No official invoice,
          collection or bank transfer.
        </p>
      </div>
      <div className={styles.eventTabs}>
        {['Quotes', 'Earnings', 'Collections & payouts'].map((t) => (
          <button
            disabled={busy}
            key={t}
            aria-pressed={tab === t}
            onClick={() => switchTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <ActionMessage
        feedback={feedback}
        canRetry={canRetry}
        onRetry={onRetry}
      />
      {validation && <p role="alert">{validation}</p>}
      {error ? (
        <section role="alert">
          <p>{error}</p>
          <button
            onClick={() => {
              setError('');
              setData(null);
              setRetry((r) => r + 1);
            }}
          >
            Retry finance records
          </button>
        </section>
      ) : !data ? (
        <p aria-busy="true">Reading financial records…</p>
      ) : (
        <>
          <label>
            Filter financial records
            <input
              disabled={busy}
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setSelected('');
                setValidation('');
              }}
              placeholder="Record, booking or worker ID"
            />
          </label>
          {tab === 'Quotes' && (
            <div className={styles.financeGrid}>
              <section>
                {data.quotes
                  .filter((q) =>
                    matching(q.id + ' ' + q.bookingId + ' ' + q.status),
                  )
                  .map((q) => (
                    <button
                      className={styles.recordButton}
                      disabled={busy}
                      key={q.id}
                      aria-pressed={selected === q.id}
                      onClick={() => {
                        setSelected(q.id);
                        setEntity(q.issuingEntity);
                        setUnit(String(q.lines[0]?.unitPaise ?? 0));
                        setReason('');
                        setValidation('');
                      }}
                    >
                      <strong>
                        {q.id} · v{q.version}
                      </strong>
                      <span>
                        {q.status} · {money(q.totalPaise)}
                      </span>
                    </button>
                  ))}
                {!data.quotes.some((q) =>
                  matching(q.id + ' ' + q.bookingId + ' ' + q.status),
                ) && <p>No matching quotes.</p>}
              </section>
              <section className="ops-card">
                {quote ? (
                  <>
                    <h3>Sample quote {quote.id}</h3>
                    <p>
                      {quote.issuingEntity} · version {quote.version} ·{' '}
                      {quote.status}
                    </p>
                    {quote.lines.map((l) => (
                      <p key={l.id}>
                        {l.label} · {l.quantity} × {money(l.unitPaise)} ={' '}
                        {money(l.totalPaise)}
                      </p>
                    ))}
                    <strong>Total {money(quote.totalPaise)}</strong>
                    <p>
                      {quote.revisionReason ?? 'No revision reason recorded.'}
                    </p>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (
                          !reason.trim() ||
                          !entity.trim() ||
                          !/^\d+$/.test(unit) ||
                          !Number.isSafeInteger(+unit) ||
                          !quote.lines.length
                        ) {
                          setValidation(
                            'Enter an issuing entity, reason and whole-number paise amount.',
                          );
                          return;
                        }
                        setValidation('');
                        onRevise({
                          quoteId: quote.id,
                          expectedVersion: quote.version,
                          issuingEntity: entity.trim(),
                          reason: reason.trim(),
                          lines: quote.lines.map((l, i) => ({
                            id: l.id,
                            label: l.label,
                            quantity: l.quantity,
                            unitPaise: i === 0 ? +unit : l.unitPaise,
                          })),
                        });
                      }}
                    >
                      <label>
                        Issuing entity
                        <input
                          disabled={busy}
                          value={entity}
                          onChange={(e) => setEntity(e.target.value)}
                        />
                      </label>
                      <label>
                        First line unit rate (paise)
                        <input
                          disabled={busy}
                          inputMode="numeric"
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                        />
                      </label>
                      <label>
                        Revision reason
                        <textarea
                          disabled={busy}
                          maxLength={500}
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                        />
                      </label>
                      <button disabled={busy}>Save sample revision</button>
                    </form>
                    <button disabled={busy} onClick={() => window.print()}>
                      Print sample quote
                    </button>
                    <p>
                      Print output is marked SAMPLE. Official quotation issuance
                      is not connected.
                    </p>
                  </>
                ) : (
                  <p>Select a quote to inspect its version and line items.</p>
                )}
              </section>
            </div>
          )}
          {tab === 'Earnings' && (
            <div className={styles.financeGrid}>
              <section>
                {data.earnings
                  .filter((e) =>
                    matching(e.id + ' ' + e.workerId + ' ' + e.status),
                  )
                  .map((e) => (
                    <button
                      className={styles.recordButton}
                      disabled={busy}
                      key={e.id}
                      aria-pressed={selected === e.id}
                      onClick={() => {
                        setSelected(e.id);
                        setGross(String(e.grossPaise));
                        setDeductions(String(e.deductionsPaise));
                        setReason('');
                        setValidation('');
                      }}
                    >
                      <strong>
                        {e.workerId} · {money(e.netPaise)}
                      </strong>
                      <span>
                        {e.status} · {e.amountState}
                      </span>
                    </button>
                  ))}
                {!data.earnings.some((e) =>
                  matching(e.id + ' ' + e.workerId + ' ' + e.status),
                ) && <p>No matching earnings.</p>}
              </section>
              <section className="ops-card">
                {earning ? (
                  <>
                    <h3>{earning.id}</h3>
                    <p>
                      {earning.status} · {earning.amountState}
                    </p>
                    <p>
                      Gross {money(earning.grossPaise)} · deductions{' '}
                      {money(earning.deductionsPaise)} · net{' '}
                      {money(earning.netPaise)}
                    </p>
                    <p>{earning.proposedTaxLabel}</p>
                    <p>
                      Supervisor:{' '}
                      {earning.supervisorApproval?.actorId ?? 'Pending'}
                      <br />
                      Finance: {earning.financeApproval?.actorId ?? 'Pending'}
                    </p>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (
                          !/^\d+$/.test(gross) ||
                          !/^\d+$/.test(deductions) ||
                          !Number.isSafeInteger(+gross) ||
                          !Number.isSafeInteger(+deductions) ||
                          +deductions > +gross ||
                          !reason.trim()
                        ) {
                          setValidation(
                            'Use whole-number paise amounts, deductions no greater than gross, and a reason.',
                          );
                          return;
                        }
                        setValidation('');
                        onAdjust({
                          earningId: earning.id,
                          grossPaise: +gross,
                          deductionsPaise: +deductions,
                          reason: reason.trim(),
                        });
                      }}
                    >
                      <label>
                        Gross (paise)
                        <input
                          disabled={busy}
                          inputMode="numeric"
                          value={gross}
                          onChange={(e) => setGross(e.target.value)}
                        />
                      </label>
                      <label>
                        Deductions (paise)
                        <input
                          disabled={busy}
                          inputMode="numeric"
                          value={deductions}
                          onChange={(e) => setDeductions(e.target.value)}
                        />
                      </label>
                      <label>
                        Adjustment reason
                        <textarea
                          disabled={busy}
                          value={reason}
                          maxLength={500}
                          onChange={(e) => setReason(e.target.value)}
                        />
                      </label>
                      <button
                        disabled={
                          busy ||
                          earning.amountState !== 'earned' ||
                          ![
                            'draft',
                            'supervisor-approved',
                            'finance-approved',
                          ].includes(earning.status)
                        }
                      >
                        Save sample adjustment
                      </button>
                    </form>
                    <button
                      disabled={
                        busy ||
                        earning.status !== 'draft' ||
                        earning.amountState !== 'earned'
                      }
                      onClick={() => onApprove(earning.id, 'supervisor')}
                    >
                      Approve as sample supervisor
                    </button>
                    <button
                      disabled={
                        busy ||
                        earning.status !== 'supervisor-approved' ||
                        earning.amountState !== 'earned'
                      }
                      onClick={() => onApprove(earning.id, 'finance')}
                    >
                      Approve as sample finance
                    </button>
                    <p>
                      Approval controls require earned amounts and the preceding
                      stage. No payment is initiated.
                    </p>
                  </>
                ) : (
                  <p>
                    Select an earning to inspect its evidence and approval
                    stage.
                  </p>
                )}
              </section>
            </div>
          )}
          {tab === 'Collections & payouts' && (
            <div>
              <h3>Collections</h3>
              {data.collections
                .filter((c) =>
                  matching(c.id + ' ' + c.bookingId + ' ' + c.status),
                )
                .map((c) => (
                  <article className="ops-card" key={c.id}>
                    <strong>
                      {money(c.amountPaise)} · {c.status}
                    </strong>
                    <p>
                      {c.id} · {c.reference ?? 'No provider reference'}
                    </p>
                  </article>
                ))}
              <h3>Payouts</h3>
              {data.payouts
                .filter((p) =>
                  matching(p.id + ' ' + p.workerId + ' ' + p.status),
                )
                .map((p) => (
                  <article className="ops-card" key={p.id}>
                    <strong>
                      {money(p.totalPaise)} · {p.status}
                    </strong>
                    <p>
                      {p.workerId} · {p.month} · {p.id}
                    </p>
                  </article>
                ))}
              <p>
                Failed, uncertain and reversed statuses require reconciliation;
                they are never presented as paid.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
function CataloguePanel() {
  const [category, setCategory] = useState('Workforce role');
  const [label, setLabel] = useState('Event coordinator');
  const [amount, setAmount] = useState('250000');
  const [reason, setReason] = useState('');
  const [records, setRecords] = useState<
    {
      id: string;
      category: string;
      label: string;
      amount: number;
      reason: string;
      status: string;
    }[]
  >([]);
  const [notice, setNotice] = useState(
    'Drafts are kept for this visit only and never change shared service rates.',
  );
  return (
    <section className={styles.finance}>
      <p className="section-kicker">CATALOGUE PREPARATION / LOCAL DRAFTS</p>
      <h2>Prepare a catalogue change</h2>
      <p>
        Shared catalogue, profile, assessment and capability administration are
        not connected. This review sheet does not publish production data.
      </p>
      <form
        className="ops-card"
        onSubmit={(e) => {
          e.preventDefault();
          if (
            !label.trim() ||
            !reason.trim() ||
            !/^\d+$/.test(amount) ||
            !Number.isSafeInteger(+amount)
          ) {
            setNotice(
              'Enter a label, whole-number paise amount and a change reason.',
            );
            return;
          }
          setRecords((r) => [
            ...r,
            {
              id: crypto.randomUUID(),
              category,
              label: label.trim(),
              amount: +amount,
              reason: reason.trim(),
              status: 'Draft',
            },
          ]);
          setReason('');
          setNotice(
            'Local review draft prepared. No shared catalogue was changed.',
          );
        }}
      >
        <label>
          Catalogue type
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {[
              'Workforce role',
              'Event type',
              'Venue',
              'Service package',
              'Assessment',
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Sample label
          <input
            value={label}
            maxLength={100}
            onChange={(e) => setLabel(e.target.value)}
          />
        </label>
        <label>
          Reference rate (paise, 0 when not applicable)
          <input
            value={amount}
            inputMode="numeric"
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <label>
          Change reason
          <textarea
            value={reason}
            maxLength={500}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <button>Prepare local draft</button>
      </form>
      <output aria-live="polite">{notice}</output>
      {records.map((r) => (
        <article className="ops-card" key={r.id}>
          <h3>{r.label}</h3>
          <p>
            {r.category} · {money(r.amount)} · {r.status}
          </p>
          <p>{r.reason}</p>
          <button
            disabled={r.status !== 'Draft'}
            onClick={() =>
              setRecords((rows) =>
                rows.map((row) =>
                  row.id === r.id
                    ? { ...row, status: 'Ready for human review' }
                    : row,
                ),
              )
            }
          >
            Mark ready for review
          </button>
          <button
            onClick={() =>
              setRecords((rows) => rows.filter((row) => row.id !== r.id))
            }
          >
            Discard local draft
          </button>
        </article>
      ))}
      <h3>Access and role boundaries</h3>
      <p>
        Operations, supervisor and finance sample actors are fixed by the
        connected workflow. A public demo identity does not grant production
        permissions.
      </p>
      <dl>
        <dt>Operations</dt>
        <dd>Event, roster and exception review</dd>
        <dt>Supervisor</dt>
        <dd>First-stage earned amount approval</dd>
        <dt>Finance</dt>
        <dd>Second-stage approval and quote revision</dd>
        <dt>Admin owner</dt>
        <dd>Capability management unavailable; no owner can be removed here</dd>
      </dl>
      <button disabled>Manage production capabilities — not connected</button>
    </section>
  );
}
