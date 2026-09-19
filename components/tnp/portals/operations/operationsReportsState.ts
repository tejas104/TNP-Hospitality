import type {
  Application,
  Assignment,
  Attendance,
  AuditEntry,
  EvidenceState,
  Position,
  PreviewEvent,
} from '@/lib/contracts/preview';

// Pure Reports view models. Every value is derived from service records passed in by AdminOperations;
// nothing here fetches, persists or invents records. Identity is always a stable record ID.

export type ReportView = 'staffing' | 'exceptions' | 'audit';
export type EmptyReason = 'scenario' | 'filters' | null;

export const REPORT_VIEWS: ReadonlyArray<{ id: ReportView; label: string }> = [
  { id: 'staffing', label: 'Staffing coverage' },
  { id: 'exceptions', label: 'Attendance & verification' },
  { id: 'audit', label: 'Audit explorer' },
];

export type ReportSource = {
  generation: number;
  clock: string;
  events: PreviewEvent[];
  positions: Position[];
  assignments: Assignment[];
  applications: Application[];
  attendances: Attendance[];
  audit: AuditEntry[];
};

export const PREVIEW_MARKER = 'SYNTHETIC PREVIEW - browser-generated, not an official report';

export const EVIDENCE_ORDER: ReadonlyArray<{ state: EvidenceState; label: string }> = [
  { state: 'gps-denied', label: 'GPS permission denied' },
  { state: 'gps-missing', label: 'GPS missing' },
  { state: 'outside-radius', label: 'Outside recorded radius' },
  { state: 'recorded', label: 'Recorded (location not checked)' },
];

export function normalizeText(value: string) {
  return value.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
}

function matches(term: string, fields: Array<string | number | null | undefined>) {
  const needle = normalizeText(term);
  return !needle || normalizeText(fields.filter((field) => field !== null && field !== undefined).join(' ')).includes(needle);
}

const byId = <T extends { id: string }>(a: T, b: T) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

/** A selection survives only while its exact ID is visible; otherwise it is cleared, never re-pointed. */
export function reconcileReportSelection(selectedId: string, visibleIds: string[]) {
  return selectedId && visibleIds.includes(selectedId) ? selectedId : '';
}

/** Allocation still holding capacity: the same rule the preview allocation service applies. */
export function holdsCapacity(assignment: Assignment) {
  return assignment.allocationState === 'active' && assignment.response !== 'not-coming';
}

// ---------- Overview ----------

export function buildReportOverview(source: ReportSource) {
  const staffing = positionRows(source);
  const evidence = Object.fromEntries(EVIDENCE_ORDER.map(({ state }) => [state, 0])) as Record<EvidenceState, number>;
  for (const attendance of source.attendances) evidence[attendance.evidence.state] += 1;
  const latestAudit = source.audit.reduce<string | null>((latest, entry) => (!latest || entry.createdAt > latest ? entry.createdAt : latest), null);
  return {
    eventsByStatus: {
      planned: source.events.filter((event) => event.status === 'planned').length,
      staffing: source.events.filter((event) => event.status === 'staffing').length,
      complete: source.events.filter((event) => event.status === 'complete').length,
    },
    eventCount: source.events.length,
    positionTypes: source.positions.length,
    requiredHeadcount: source.positions.reduce((total, position) => total + position.quantity, 0),
    activeAllocations: source.assignments.filter((assignment) => assignment.allocationState === 'active').length,
    unfilled: staffing.reduce((total, row) => total + row.unfilled, 0),
    openCapacity: staffing.reduce((total, row) => total + row.openCapacity, 0),
    pendingApplications: source.applications.filter((application) => application.status === 'pending').length,
    evidence,
    auditCount: source.audit.length,
    latestAudit,
  };
}

// ---------- Staffing coverage ----------

export type PositionRow = {
  eventId: string;
  positionId: string;
  role: string;
  positionStatus: Position['status'];
  quantity: number;
  activeAllocations: number;
  notComing: number;
  holdingCapacity: number;
  unfilled: number;
  openCapacity: number;
};

function positionRows(source: ReportSource, eventId?: string): PositionRow[] {
  return source.positions
    .filter((position) => eventId === undefined || position.eventId === eventId)
    .sort(byId)
    .map((position) => {
      const active = source.assignments.filter((item) => item.positionId === position.id && item.allocationState === 'active');
      const holding = active.filter(holdsCapacity).length;
      const unfilled = Math.max(0, position.quantity - holding);
      return {
        eventId: position.eventId,
        positionId: position.id,
        role: position.role,
        positionStatus: position.status,
        quantity: position.quantity,
        activeAllocations: active.length,
        notComing: active.length - holding,
        holdingCapacity: holding,
        unfilled,
        // Claimable only while the position itself is open, matching the preview allocation rule.
        openCapacity: position.status === 'open' ? unfilled : 0,
      };
    });
}

export type FunctionRow = {
  eventId: string;
  bookingId: string;
  name: string;
  status: PreviewEvent['status'];
  startsAt: string;
  timezone: string;
  positions: PositionRow[];
  requiredHeadcount: number;
  activeAllocations: number;
  unfilled: number;
  openCapacity: number;
};

export type StaffingFilters = { text: string; status: 'all' | PreviewEvent['status']; selectedEventId: string };

export function buildStaffingReport(source: ReportSource, filters: StaffingFilters) {
  const all: FunctionRow[] = [...source.events]
    .sort((a, b) => (a.startsAt < b.startsAt ? -1 : a.startsAt > b.startsAt ? 1 : byId(a, b)))
    .map((event) => {
      const positions = positionRows(source, event.id);
      return {
        eventId: event.id,
        bookingId: event.bookingId,
        name: event.name,
        status: event.status,
        startsAt: event.startsAt,
        timezone: event.timezone,
        positions,
        requiredHeadcount: positions.reduce((total, row) => total + row.quantity, 0),
        activeAllocations: positions.reduce((total, row) => total + row.activeAllocations, 0),
        unfilled: positions.reduce((total, row) => total + row.unfilled, 0),
        openCapacity: positions.reduce((total, row) => total + row.openCapacity, 0),
      };
    });
  const rows = all.filter((row) => (
    (filters.status === 'all' || row.status === filters.status)
    && matches(filters.text, [row.eventId, row.bookingId, row.name, row.status, ...row.positions.flatMap((p) => [p.positionId, p.role])])
  ));
  const selectedEventId = reconcileReportSelection(filters.selectedEventId, rows.map((row) => row.eventId));
  const selected = rows.find((row) => row.eventId === selectedEventId) ?? null;
  const assignments = selected
    ? source.assignments.filter((item) => item.eventId === selected.eventId).sort(byId)
    : [];
  const exportFunctions = selected ? [selected] : rows;
  const scope = describeScope([
    ['search', filters.text.trim()],
    ['status', filters.status === 'all' ? '' : filters.status],
    ['function', selected?.eventId ?? ''],
  ]);
  const exportRows = exportFunctions.flatMap((row) => (row.positions.length ? row.positions : [null]).map((position) => ({
    event_id: row.eventId,
    event_name: row.name,
    event_status: row.status,
    position_id: position?.positionId ?? '',
    role: position?.role ?? '',
    position_status: position?.positionStatus ?? '',
    required_quantity: position?.quantity ?? '',
    active_allocations: position?.activeAllocations ?? '',
    not_coming: position?.notComing ?? '',
    holding_capacity: position?.holdingCapacity ?? '',
    unfilled: position?.unfilled ?? '',
    open_capacity: position?.openCapacity ?? '',
  })));
  return {
    view: 'staffing' as const,
    rows,
    totalCount: all.length,
    selected,
    assignments,
    hiddenSelectionId: filters.selectedEventId && !selected ? filters.selectedEventId : '',
    empty: emptyReason(all.length, rows.length),
    scope,
    exportColumns: STAFFING_COLUMNS,
    exportRows,
  };
}

const STAFFING_COLUMNS = ['event_id', 'event_name', 'event_status', 'position_id', 'role', 'position_status', 'required_quantity', 'active_allocations', 'not_coming', 'holding_capacity', 'unfilled', 'open_capacity'] as const;

// ---------- Attendance & verification exceptions ----------

export type ExceptionGroupKey = 'pending-applications' | EvidenceState;
export type ExceptionFilters = { text: string; group: 'all' | ExceptionGroupKey };

export type ExceptionItem = {
  group: ExceptionGroupKey;
  recordType: 'application' | 'attendance';
  recordId: string;
  eventId: string;
  assignmentId: string;
  subjectId: string;
  status: string;
  evidenceState: EvidenceState | '';
  distanceMetres: number | null;
  capturedAt: string;
  detail: string;
  priorEvidenceCount: number;
};

export const EXCEPTION_GROUPS: ReadonlyArray<{ key: ExceptionGroupKey; label: string }> = [
  { key: 'pending-applications', label: 'Pending applications' },
  ...EVIDENCE_ORDER.map(({ state, label }) => ({ key: state, label })),
];

export function buildExceptionsReport(source: ReportSource, filters: ExceptionFilters) {
  const applications: ExceptionItem[] = source.applications
    .filter((application) => application.status === 'pending')
    .sort(byId)
    .map((application) => ({
      group: 'pending-applications', recordType: 'application', recordId: application.id, eventId: '', assignmentId: '',
      subjectId: application.applicantId, status: application.status, evidenceState: '', distanceMetres: null, capturedAt: '',
      detail: application.role ? `Role requested: ${application.role}` : 'No role supplied', priorEvidenceCount: 0,
    }));
  const attendance: ExceptionItem[] = [...source.attendances].sort(byId).map((item) => ({
    group: item.evidence.state, recordType: 'attendance', recordId: item.id, eventId: item.eventId, assignmentId: item.assignmentId,
    subjectId: item.workerId, status: item.state, evidenceState: item.evidence.state, distanceMetres: item.evidence.distanceMetres,
    capturedAt: item.evidence.capturedAt, detail: item.evidence.note, priorEvidenceCount: item.history.length,
  }));
  const all = [...applications, ...attendance];
  const visible = all.filter((item) => (
    (filters.group === 'all' || item.group === filters.group)
    && matches(filters.text, [item.recordId, item.eventId, item.assignmentId, item.subjectId, item.status, item.evidenceState, item.detail, item.group])
  ));
  const groups = EXCEPTION_GROUPS
    .map((group) => ({ ...group, items: visible.filter((item) => item.group === group.key) }))
    .filter((group) => group.items.length);
  const exportRows = groups.flatMap((group) => group.items).map((item) => ({
    group: item.group,
    record_type: item.recordType,
    record_id: item.recordId,
    event_id: item.eventId,
    assignment_id: item.assignmentId,
    subject_id: item.subjectId,
    status: item.status,
    evidence_state: item.evidenceState,
    distance_metres: item.distanceMetres ?? '',
    captured_at: item.capturedAt,
    note_or_reason: item.detail,
    prior_evidence_count: item.recordType === 'attendance' ? item.priorEvidenceCount : '',
  }));
  return {
    view: 'exceptions' as const,
    groups,
    visibleCount: visible.length,
    totalCount: all.length,
    empty: emptyReason(all.length, visible.length),
    scope: describeScope([['search', filters.text.trim()], ['group', filters.group === 'all' ? '' : filters.group]]),
    exportColumns: EXCEPTION_COLUMNS,
    exportRows,
  };
}

const EXCEPTION_COLUMNS = ['group', 'record_type', 'record_id', 'event_id', 'assignment_id', 'subject_id', 'status', 'evidence_state', 'distance_metres', 'captured_at', 'note_or_reason', 'prior_evidence_count'] as const;

// ---------- Audit explorer ----------

export type AuditFilters = { text: string; action: string; actorId: string; entityId: string };

export function buildAuditReport(source: ReportSource, filters: AuditFilters) {
  const all = [...source.audit].sort((a, b) => (a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : byId(a, b)));
  const actions = [...new Set(all.map((entry) => entry.action))].sort();
  const actors = [...new Set(all.map((entry) => entry.actorId))].sort();
  // A select value that no longer exists in this snapshot is treated as "all", never as a hidden filter.
  const action = actions.includes(filters.action) ? filters.action : '';
  const actorId = actors.includes(filters.actorId) ? filters.actorId : '';
  const entityTerm = normalizeText(filters.entityId);
  const rows = all.filter((entry) => (
    (!action || entry.action === action)
    && (!actorId || entry.actorId === actorId)
    && (!entityTerm || normalizeText(entry.entityId).includes(entityTerm))
    && matches(filters.text, [entry.id, entry.action, entry.reason, entry.actorId, entry.entityId, entry.createdAt])
  ));
  return {
    view: 'audit' as const,
    rows,
    actions,
    actors,
    appliedAction: action,
    appliedActorId: actorId,
    totalCount: all.length,
    latest: all[0]?.createdAt ?? null,
    empty: emptyReason(all.length, rows.length),
    scope: describeScope([['search', filters.text.trim()], ['action', action], ['actor', actorId], ['entity', filters.entityId.trim()]]),
    exportColumns: AUDIT_COLUMNS,
    exportRows: rows.map((entry) => ({
      audit_id: entry.id, created_at: entry.createdAt, action: entry.action, actor_id: entry.actorId, entity_id: entry.entityId, reason: entry.reason,
    })),
  };
}

const AUDIT_COLUMNS = ['audit_id', 'created_at', 'action', 'actor_id', 'entity_id', 'reason'] as const;

// ---------- Shared helpers ----------

function emptyReason(total: number, visible: number): EmptyReason {
  if (!total) return 'scenario';
  return visible ? null : 'filters';
}

function describeScope(parts: Array<[string, string]>) {
  const active = parts.filter(([, value]) => value);
  return active.length ? active.map(([key, value]) => `${key}=${value}`).join('; ') : 'all records';
}

// ---------- CSV ----------

type CsvValue = string | number;
type ExportableReport = {
  view: ReportView;
  scope: string;
  exportColumns: ReadonlyArray<string>;
  exportRows: Array<Record<string, CsvValue>>;
  selected?: FunctionRow | null;
};

export const CONTEXT_COLUMNS = ['preview_marker', 'generation', 'snapshot_clock', 'view', 'view_scope'] as const;

export function csvField(value: CsvValue) {
  let text = String(value);
  // Spreadsheet formula guard: a leading =, +, -, @, tab or CR is neutralised so a reason cannot execute.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) || text !== text.trim() ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(columns: ReadonlyArray<string>, rows: Array<Record<string, CsvValue>>) {
  return [columns.join(','), ...rows.map((row) => columns.map((column) => csvField(row[column] ?? '')).join(','))].join('\r\n') + '\r\n';
}

export function reportCsv(report: ExportableReport, source: Pick<ReportSource, 'generation' | 'clock'>) {
  const columns = [...CONTEXT_COLUMNS, ...report.exportColumns];
  const rows = report.exportRows.map((row) => ({
    preview_marker: PREVIEW_MARKER, generation: source.generation, snapshot_clock: source.clock, view: report.view, view_scope: report.scope, ...row,
  }));
  const selected = report.view === 'staffing' && report.selected ? `-${report.selected.eventId}` : '';
  return {
    filename: `tnp-synthetic-preview-g${source.generation}-${report.view}${selected}.csv`,
    csv: toCsv(columns, rows),
    rowCount: rows.length,
  };
}

/** Minimal RFC 4180 parser, used by tests and the browser check to compare exported IDs with visible IDs. */
export function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') { field += '"'; index += 1; } else if (char === '"') quoted = false; else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(field); field = ''; } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += char;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

export type DownloadEnvironment = {
  createObjectURL: (blob: Blob) => string;
  revokeObjectURL: (url: string) => void;
  createAnchor: () => { href: string; download: string; click: () => void; remove: () => void };
  schedule: (run: () => void) => void;
};

export type DownloadOutcome = { ok: true; filename: string; rowCount: number } | { ok: false; message: string };

/** Success is returned only after Blob, object URL and anchor click all complete without throwing. */
export function prepareCsvDownload(file: { filename: string; csv: string; rowCount: number }, env: DownloadEnvironment): DownloadOutcome {
  let url = '';
  try {
    const blob = new Blob([file.csv], { type: 'text/csv;charset=utf-8' });
    url = env.createObjectURL(blob);
    const anchor = env.createAnchor();
    anchor.href = url;
    anchor.download = file.filename;
    anchor.click();
    anchor.remove();
    return { ok: true, filename: file.filename, rowCount: file.rowCount };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'The browser could not prepare the file.' };
  } finally {
    // Deferred so the browser can start the download first; always runs, including after a failure.
    if (url) env.schedule(() => env.revokeObjectURL(url));
  }
}
