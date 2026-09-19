'use client';

import { Download, Search, X } from 'lucide-react';
import { useMemo, useState, type KeyboardEvent } from 'react';
import type {
  Application,
  Assignment,
  Attendance,
  AuditEntry,
  Position,
  PreviewEvent,
  ScenarioMetadata,
} from '@/lib/contracts/preview';
import {
  buildAuditReport,
  buildExceptionsReport,
  buildReportOverview,
  buildStaffingReport,
  EVIDENCE_ORDER,
  EXCEPTION_GROUPS,
  prepareCsvDownload,
  reconcileReportSelection,
  REPORT_VIEWS,
  reportCsv,
  type AuditFilters,
  type DownloadEnvironment,
  type DownloadOutcome,
  type EmptyReason,
  type ExceptionFilters,
  type ExceptionItem,
  type FunctionRow,
  type ReportSource,
  type ReportView,
  type StaffingFilters,
} from './operationsReportsState';
import styles from './AdminOperations.module.css';

type Props = {
  generation: number;
  metadata: ScenarioMetadata;
  events: PreviewEvent[];
  positions: Position[];
  assignments: Assignment[];
  applications: Application[];
  attendances: Attendance[];
  audit: AuditEntry[];
};

const initialStaffing: StaffingFilters = { text: '', status: 'all', selectedEventId: '' };
const initialExceptions: ExceptionFilters = { text: '', group: 'all' };
const initialAudit: AuditFilters = { text: '', action: '', actorId: '', entityId: '' };

const browserDownload: DownloadEnvironment = {
  createObjectURL: (blob) => URL.createObjectURL(blob),
  revokeObjectURL: (url) => URL.revokeObjectURL(url),
  createAnchor: () => {
    const anchor = document.createElement('a');
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    return anchor;
  },
  schedule: (run) => { window.setTimeout(run, 1000); },
};

const notPerformed = [
  'No production authorization or sign-off',
  'No scheduled, emailed or provider-delivered reports',
  'No immutable server archive or report history',
  'No live tracking or location checks',
  'No tax, profitability, balance or pay calculation',
  'No payment execution or provider reconciliation',
];

function escapeClears(clear: () => void) {
  return (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape' && event.currentTarget.value) { event.preventDefault(); clear(); }
  };
}

// Mounted with key=generation by AdminOperations: a reset discards every filter, selection and export message here.
export function OperationsReports({ generation, metadata, events, positions, assignments, applications, attendances, audit }: Props) {
  const source: ReportSource = useMemo(() => ({
    generation, clock: metadata.clock, events, positions, assignments, applications, attendances, audit,
  }), [generation, metadata.clock, events, positions, assignments, applications, attendances, audit]);
  const [view, setView] = useState<ReportView>('staffing');
  const [staffingFilters, setStaffingFilters] = useState(initialStaffing);
  const [clearedSelectionId, setClearedSelectionId] = useState('');
  const [exceptionFilters, setExceptionFilters] = useState(initialExceptions);
  const [auditFilters, setAuditFilters] = useState(initialAudit);
  const [exportResult, setExportResult] = useState<{ csv: string; outcome: DownloadOutcome } | null>(null);

  const formatTime = useMemo(() => {
    const format = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: metadata.timezone });
    return (value: string) => format.format(new Date(value));
  }, [metadata.timezone]);

  const overview = useMemo(() => buildReportOverview(source), [source]);
  const staffing = useMemo(() => buildStaffingReport(source, staffingFilters), [source, staffingFilters]);
  const exceptions = useMemo(() => buildExceptionsReport(source, exceptionFilters), [source, exceptionFilters]);
  const auditReport = useMemo(() => buildAuditReport(source, auditFilters), [source, auditFilters]);
  const current = view === 'staffing' ? staffing : view === 'exceptions' ? exceptions : auditReport;
  // The export is built from the exact view model rendered below, never recomputed separately.
  const file = useMemo(() => reportCsv(current, source), [current, source]);
  const visibleExport = exportResult && exportResult.csv === file.csv ? exportResult.outcome : null;

  function updateStaffing(next: StaffingFilters) {
    const visible = buildStaffingReport(source, { ...next, selectedEventId: '' }).rows.map((row) => row.eventId);
    const kept = reconcileReportSelection(next.selectedEventId, visible);
    setClearedSelectionId(next.selectedEventId && !kept ? next.selectedEventId : '');
    setStaffingFilters({ ...next, selectedEventId: kept });
  }

  function exportCsv() {
    setExportResult({ csv: file.csv, outcome: prepareCsvDownload(file, browserDownload) });
  }

  const hiddenSelectionId = clearedSelectionId || staffing.hiddenSelectionId;

  return (
    <div className={styles.reportReveal}>
      <div className={styles.panelHeading}>
        <div><p className="section-kicker">REPORTS &amp; AUDIT · IN-BROWSER PREVIEW SNAPSHOT</p><h2>Staffing, exceptions and audit from one snapshot.</h2></div>
        <p>Every figure is derived in this browser from the current synthetic preview records each time this page renders. Nothing here is stored, scheduled or sent.</p>
      </div>

      <div className={styles.reportContextGrid}>
        <section className={styles.reportCard} aria-labelledby="report-context-title">
          <p className="section-kicker">SNAPSHOT CONTEXT</p>
          <h3 id="report-context-title">Preview generation {generation}</h3>
          <dl className={styles.reportFacts}>
            <div><dt>Scenario</dt><dd>{metadata.label}</dd></div>
            <div><dt>Scenario clock</dt><dd><time dateTime={metadata.clock}>{formatTime(metadata.clock)}</time> · {metadata.timezone}</dd></div>
            <div><dt>Source</dt><dd>Shared preview service records, not a separate report store</dd></div>
          </dl>
        </section>
        <section className={`${styles.reportCard} ${styles.reportLimits}`} aria-labelledby="report-limits-title">
          <p className="section-kicker">NOT PERFORMED BY THIS REPORT</p>
          <h3 id="report-limits-title">Synthetic preview only</h3>
          <ul>{notPerformed.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      </div>

      <section className={styles.reportOverview} aria-labelledby="report-overview-title">
        <h3 id="report-overview-title" className={styles.reportSectionTitle}>Snapshot totals <small>Not affected by view filters</small></h3>
        <div className={styles.reportTiles}>
          <Tile label="Functions" value={overview.eventCount} note={`${overview.eventsByStatus.planned} planned · ${overview.eventsByStatus.staffing} staffing · ${overview.eventsByStatus.complete} complete`} />
          <Tile label="Required headcount" value={overview.requiredHeadcount} note={`${overview.positionTypes} position types`} />
          <Tile label="Active allocations" value={overview.activeAllocations} note={`${overview.openCapacity} open capacity`} />
          <Tile label="Pending applications" value={overview.pendingApplications} note="Awaiting a human decision" />
          <Tile label="Attendance evidence" value={EVIDENCE_ORDER.reduce((total, { state }) => total + overview.evidence[state], 0)} note={EVIDENCE_ORDER.map(({ state, label }) => `${label}: ${overview.evidence[state]}`).join(' · ')} />
          <Tile label="Audit entries" value={overview.auditCount} note={overview.latestAudit ? `Latest recorded ${formatTime(overview.latestAudit)}` : 'No audit entries recorded'} />
        </div>
      </section>

      <fieldset className={styles.reportTabs}>
        <legend className={styles.srOnly}>Report view</legend>
        {REPORT_VIEWS.map((item) => <button key={item.id} type="button" className={styles.reportTab} aria-pressed={view === item.id} onClick={() => setView(item.id)}>{item.label}</button>)}
      </fieldset>

      <section className={styles.reportReveal} key={view} aria-labelledby="report-view-title">
        <h3 id="report-view-title" className={styles.srOnly}>{REPORT_VIEWS.find((item) => item.id === view)?.label}</h3>
        {view === 'staffing' && <StaffingView report={staffing} filters={staffingFilters} hiddenSelectionId={hiddenSelectionId} formatTime={formatTime} onChange={updateStaffing} onClear={() => { setClearedSelectionId(''); setStaffingFilters(initialStaffing); }} />}
        {view === 'exceptions' && <ExceptionsView report={exceptions} filters={exceptionFilters} formatTime={formatTime} onChange={setExceptionFilters} onClear={() => setExceptionFilters(initialExceptions)} />}
        {view === 'audit' && <AuditView report={auditReport} filters={auditFilters} formatTime={formatTime} onChange={setAuditFilters} onClear={() => setAuditFilters(initialAudit)} />}
      </section>

      <section className={styles.exportBar} aria-labelledby="report-export-title">
        <div>
          <h3 id="report-export-title">Browser CSV of this view</h3>
          <p>{file.rowCount} data row(s) · scope: {current.scope} · <code>{file.filename}</code></p>
          <p className={styles.exportNote}>A browser-generated preview file with stable record IDs and no display names. It is not an official, signed or archived report. PDF, email delivery, scheduled exports, cloud storage and report history are unavailable in this preview.</p>
        </div>
        <button className="magnetic-btn dark" type="button" onClick={exportCsv} disabled={!file.rowCount}><Download size={17} aria-hidden="true" /> Export CSV</button>
        <output className={`${styles.exportStatus} ${visibleExport && !visibleExport.ok ? styles.exportError : ''}`} aria-live="polite">
          {visibleExport?.ok && `CSV handed to the browser as ${visibleExport.filename} (${visibleExport.rowCount} data rows). This preview does not confirm where the browser saved it.`}
          {visibleExport && !visibleExport.ok && `The browser could not prepare the CSV (${visibleExport.message}). No file is confirmed; you can export again.`}
        </output>
      </section>
    </div>
  );
}

function Tile({ label, value, note }: { label: string; value: number; note: string }) {
  return <div className={styles.reportTile}><span>{label}</span><strong>{value}</strong><small>{note}</small></div>;
}

function EmptyState({ reason, noun, onClear }: { reason: EmptyReason; noun: string; onClear: () => void }) {
  if (!reason) return null;
  return reason === 'scenario'
    ? <div className={styles.reportEmpty}><h4>No {noun} in this snapshot.</h4><p>The current synthetic scenario has no records for this view. Filters are not the cause.</p></div>
    : <div className={styles.reportEmpty}><h4>No {noun} match the current filters.</h4><p>Records exist in this snapshot but are hidden by the filters.</p><button type="button" onClick={onClear}>Clear filters</button></div>;
}

function SearchField({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (value: string) => void }) {
  return <label><span>{label}</span><div className={styles.inputWithIcon}><Search size={18} aria-hidden="true" /><input type="search" value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} onKeyDown={escapeClears(() => onChange(''))} /></div></label>;
}

function ClearButton({ active, onClear }: { active: boolean; onClear: () => void }) {
  return <button className={styles.clearFilters} type="button" onClick={onClear} disabled={!active}><X size={16} aria-hidden="true" /> Clear filters</button>;
}

function StaffingView({ report, filters, hiddenSelectionId, formatTime, onChange, onClear }: {
  report: ReturnType<typeof buildStaffingReport>; filters: StaffingFilters; hiddenSelectionId: string; formatTime: (value: string) => string;
  onChange: (next: StaffingFilters) => void; onClear: () => void;
}) {
  const detailFunctions: FunctionRow[] = report.selected ? [report.selected] : report.rows;
  return <>
    <div className={`${styles.filters} ${styles.reportFilters}`}>
      <SearchField label="Search functions or positions" value={filters.text} placeholder="Name, event, position ID or role" onChange={(text) => onChange({ ...filters, text })} />
      <label><span>Function status</span><select value={filters.status} onChange={(event) => onChange({ ...filters, status: event.target.value as StaffingFilters['status'] })}><option value="all">All statuses</option><option value="planned">Planned</option><option value="staffing">Staffing</option><option value="complete">Complete</option></select></label>
      <ClearButton active={Boolean(filters.text || filters.status !== 'all' || filters.selectedEventId || hiddenSelectionId)} onClear={onClear} />
    </div>
    <p className={styles.reportCount}>{report.rows.length} of {report.totalCount} functions shown · open capacity = position quantity minus active allocations not marked “not coming” (the preview allocation rule).</p>
    {hiddenSelectionId && <p className={styles.reportNotice}>Function <code>{hiddenSelectionId}</code> is hidden by the current filters, so its detail was cleared.</p>}
    <EmptyState reason={report.empty} noun="functions" onClear={onClear} />
    {report.rows.length > 0 && <div className={styles.reportMasterDetail}>
      <fieldset className={styles.reportFunctionList}>
        <legend className={styles.srOnly}>Select a function</legend>
        {report.rows.map((row) => (
          <button key={row.eventId} type="button" className={styles.reportRow} aria-label={`${row.name}, ${row.eventId}, ${row.status}: ${row.requiredHeadcount} required, ${row.activeAllocations} active, ${row.openCapacity} open`} aria-pressed={report.selected?.eventId === row.eventId} onClick={() => onChange({ ...filters, selectedEventId: report.selected?.eventId === row.eventId ? '' : row.eventId })}>
            <span className={styles.reportRowTitle}><strong>{row.name}</strong><small>{row.eventId} · {row.status}</small></span>
            <span className={styles.reportRowStats}><span><b>{row.requiredHeadcount}</b> required</span><span><b>{row.activeAllocations}</b> active</span><span><b>{row.openCapacity}</b> open</span></span>
          </button>
        ))}
      </fieldset>
      <div className={styles.reportDetail} data-report-detail="staffing">
        <div className={styles.cardTitle}>
          <div><p className="section-kicker">{report.selected ? `SELECTED FUNCTION · ${report.selected.eventId}` : 'ALL VISIBLE FUNCTIONS'}</p><h4>{report.selected ? report.selected.name : 'Select a function to inspect its allocations'}</h4></div>
          {report.selected && <button className={styles.clearFilters} type="button" onClick={() => onChange({ ...filters, selectedEventId: '' })}>Show all visible</button>}
        </div>
        {detailFunctions.map((row) => (
          <div key={row.eventId} className={styles.reportGroup}>
            {!report.selected && <p className={styles.reportGroupLabel}><strong>{row.name}</strong> <code>{row.eventId}</code> · {formatTime(row.startsAt)}</p>}
            {row.positions.length ? row.positions.map((position) => (
              <article key={position.positionId} className={styles.reportItem} data-export-id={position.positionId}>
                <div><strong>{position.role}</strong><code>{position.positionId}</code></div>
                <dl className={styles.reportNumbers}>
                  <div><dt>Quantity</dt><dd>{position.quantity}</dd></div>
                  <div><dt>Active</dt><dd>{position.activeAllocations}</dd></div>
                  <div><dt>Not coming</dt><dd>{position.notComing}</dd></div>
                  <div><dt>Open</dt><dd>{position.openCapacity}</dd></div>
                  <div><dt>Position status</dt><dd>{position.positionStatus}</dd></div>
                </dl>
              </article>
            )) : <p className={styles.mutedDark} data-export-id={row.eventId}>No positions are defined for this function.</p>}
          </div>
        ))}
        {report.selected && <div className={styles.reportGroup}>
          <p className={styles.reportGroupLabel}><strong>Allocations for {report.selected.eventId}</strong> · every allocation state, including replaced</p>
          {report.assignments.length ? report.assignments.map((item) => (
            <article key={item.id} className={styles.reportItem}>
              <div><strong>{item.response}</strong><code>{item.id}</code></div>
              <p className={styles.reportIds}>worker <code>{item.workerId}</code> · position <code>{item.positionId}</code> · allocation {item.allocationState}</p>
            </article>
          )) : <p className={styles.mutedDark}>No allocations are recorded for this function.</p>}
        </div>}
      </div>
    </div>}
  </>;
}

const evidenceLabel = Object.fromEntries(EXCEPTION_GROUPS.map((group) => [group.key, group.label]));

function ExceptionsView({ report, filters, formatTime, onChange, onClear }: {
  report: ReturnType<typeof buildExceptionsReport>; filters: ExceptionFilters; formatTime: (value: string) => string;
  onChange: (next: ExceptionFilters) => void; onClear: () => void;
}) {
  return <>
    <div className={`${styles.filters} ${styles.reportFilters}`}>
      <SearchField label="Search exceptions" value={filters.text} placeholder="Record, event, assignment or worker ID" onChange={(text) => onChange({ ...filters, text })} />
      <label><span>Group</span><select value={filters.group} onChange={(event) => onChange({ ...filters, group: event.target.value as ExceptionFilters['group'] })}><option value="all">All groups</option>{EXCEPTION_GROUPS.map((group) => <option key={group.key} value={group.key}>{group.label}</option>)}</select></label>
      <ClearButton active={Boolean(filters.text || filters.group !== 'all')} onClear={onClear} />
    </div>
    <p className={styles.reportCount}>{report.visibleCount} of {report.totalCount} records shown. Recorded evidence is a sample state only; no location was checked for any record.</p>
    <EmptyState reason={report.empty} noun="applications or attendance records" onClear={onClear} />
    <div className={styles.reportGroups} data-report-detail="exceptions">
      {report.groups.map((group) => (
        <section key={group.key} className={styles.reportDetail} aria-labelledby={`group-${group.key}`}>
          <div className={styles.cardTitle}><h4 id={`group-${group.key}`}>{group.label}</h4><span className={group.key === 'recorded' ? styles.reviewedBadge : styles.pendingBadge}>{group.items.length}</span></div>
          {group.items.map((item) => <ExceptionRow key={item.recordId} item={item} formatTime={formatTime} />)}
        </section>
      ))}
    </div>
  </>;
}

function ExceptionRow({ item, formatTime }: { item: ExceptionItem; formatTime: (value: string) => string }) {
  return <article className={styles.reportItem} data-export-id={item.recordId}>
    <div><strong>{item.recordType === 'application' ? 'Application' : `Attendance · ${item.status}`}</strong><code>{item.recordId}</code></div>
    <p>{item.recordType === 'attendance' ? `${evidenceLabel[item.group]}. ` : ''}{item.detail}</p>
    {item.distanceMetres !== null && <p><b>{item.distanceMetres} m</b> recorded synthetic distance, not live tracking.</p>}
    <p className={styles.reportIds}>
      {item.recordType === 'application' ? <>applicant <code>{item.subjectId}</code> · status {item.status}</> : <>worker <code>{item.subjectId}</code> · assignment <code>{item.assignmentId}</code> · event <code>{item.eventId}</code> · captured <time dateTime={item.capturedAt}>{formatTime(item.capturedAt)}</time> · {item.priorEvidenceCount} prior evidence record(s)</>}
    </p>
  </article>;
}

function AuditView({ report, filters, formatTime, onChange, onClear }: {
  report: ReturnType<typeof buildAuditReport>; filters: AuditFilters; formatTime: (value: string) => string;
  onChange: (next: AuditFilters) => void; onClear: () => void;
}) {
  return <>
    <div className={`${styles.filters} ${styles.reportFilters} ${styles.auditFilters}`}>
      <SearchField label="Search audit text" value={filters.text} placeholder="Reason, action or any ID" onChange={(text) => onChange({ ...filters, text })} />
      <label><span>Action</span><select value={report.appliedAction} onChange={(event) => onChange({ ...filters, action: event.target.value })}><option value="">All actions</option>{report.actions.map((action) => <option key={action} value={action}>{action}</option>)}</select></label>
      <label><span>Actor ID</span><select value={report.appliedActorId} onChange={(event) => onChange({ ...filters, actorId: event.target.value })}><option value="">All actors</option>{report.actors.map((actor) => <option key={actor} value={actor}>{actor}</option>)}</select></label>
      <label><span>Entity ID contains</span><input value={filters.entityId} placeholder="e.g. attendance-002" onChange={(event) => onChange({ ...filters, entityId: event.target.value })} onKeyDown={escapeClears(() => onChange({ ...filters, entityId: '' }))} /></label>
      <ClearButton active={Boolean(filters.text || report.appliedAction || report.appliedActorId || filters.entityId)} onClear={onClear} />
    </div>
    <p className={styles.reportCount}>{report.rows.length} of {report.totalCount} audit entries shown, newest first. These are preview mutation records in this browser, not a tamper-evident server audit log.</p>
    <EmptyState reason={report.empty} noun="audit entries" onClear={onClear} />
    {report.rows.length > 0 && <div className={styles.reportDetail} data-report-detail="audit">
      {report.rows.map((entry) => (
        <article key={entry.id} className={styles.reportItem} data-export-id={entry.id}>
          <div><strong>{entry.action}</strong><code>{entry.id}</code></div>
          <p>{entry.reason}</p>
          <p className={styles.reportIds}>actor <code>{entry.actorId}</code> · entity <code>{entry.entityId}</code> · <time dateTime={entry.createdAt}>{formatTime(entry.createdAt)}</time></p>
        </article>
      ))}
    </div>}
  </>;
}
