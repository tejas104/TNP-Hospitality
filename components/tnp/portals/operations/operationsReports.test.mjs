import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { PREVIEW_OPERATIONS, DemoPreviewService } from '../../../../lib/demo/service.ts';
import { MemoryPreviewStorage, PreviewStore } from '../../../../lib/demo/store.ts';
import {
  buildAuditReport,
  buildExceptionsReport,
  buildReportOverview,
  buildStaffingReport,
  csvField,
  parseCsv,
  PREVIEW_MARKER,
  prepareCsvDownload,
  reconcileReportSelection,
  reportCsv,
  toCsv,
} from './operationsReportsState.ts';
import { isCurrentActionEpoch, operationsSectionItems, REPORTS_SECTION } from './operationsState.ts';

const here = (file) => new URL(file, import.meta.url);

function event(id, name, status = 'staffing', startsAt = '2026-09-14T08:00:00.000+05:30') {
  return { id, bookingId: 'booking-1', name, startsAt, endsAt: startsAt, timezone: 'Asia/Kolkata', venueId: 'venue-1', reportingDetails: '', status };
}
function position(id, eventId, quantity, role = 'Volunteer', status = 'open') {
  return { id, eventId, role, quantity, payRatePaise: 1, payUnit: 'day', requiredAssessmentScore: 0, status };
}
function assignment(id, positionId, eventId, response = 'coming', allocationState = 'active', workerId = `w-${id}`) {
  return { id, eventId, positionId, workerId, response, allocationState, payRatePaiseSnapshot: 1, payUnitSnapshot: 'day', createdAt: '' };
}
function attendance(id, state, workerId = `w-${id}`) {
  return { id, eventId: 'event-a', assignmentId: `as-${id}`, workerId, state: state === 'recorded' ? 'present' : 'exception', evidence: { state, capturedAt: '2026-09-14T08:00:00.000+05:30', distanceMetres: state === 'outside-radius' ? 480 : null, note: `note ${id}` }, history: [] };
}
function audit(id, action, reason, entityId, actorId = 'ops-1', createdAt = '2026-09-14T08:00:00.000+05:30') {
  return { id, action, reason, entityId, actorId, createdAt };
}

// Two functions with an identical display name; only the stable ID separates them.
function source(overrides = {}) {
  return {
    generation: 3,
    clock: '2026-09-10T09:00:00.000+05:30',
    events: [event('event-b', 'Reception', 'planned', '2026-09-15T16:00:00.000+05:30'), event('event-a', 'Reception', 'staffing')],
    positions: [position('pos-b1', 'event-b', 40), position('pos-a1', 'event-a', 6, 'Event Coordinator'), position('pos-a2', 'event-a', 1, 'Hostess', 'full')],
    assignments: [
      assignment('as-1', 'pos-a1', 'event-a'),
      assignment('as-2', 'pos-a1', 'event-a', 'pending'),
      assignment('as-3', 'pos-a1', 'event-a', 'not-coming'),
      assignment('as-4', 'pos-a1', 'event-a', 'coming', 'replaced'),
      assignment('as-5', 'pos-b1', 'event-b'),
    ],
    applications: [
      { id: 'app-2', applicantId: 'w-2', role: 'Hostess', status: 'pending', reviewReason: null },
      { id: 'app-1', applicantId: 'w-1', role: 'Volunteer', status: 'rejected', reviewReason: 'x' },
    ],
    attendances: [attendance('att-3', 'outside-radius'), attendance('att-1', 'gps-denied'), attendance('att-2', 'gps-missing'), attendance('att-4', 'recorded')],
    audit: [
      audit('audit-2', 'attendance.corrected', 'Same reason', 'att-1'),
      audit('audit-1', 'attendance.corrected', 'Same reason', 'att-2'),
      audit('audit-3', 'application.reviewed', 'Other', 'app-1', 'ops-2', '2026-09-14T09:00:00.000+05:30'),
    ],
    ...overrides,
  };
}
const reversed = (value) => ({ ...value, events: [...value.events].reverse(), positions: [...value.positions].reverse(), assignments: [...value.assignments].reverse(), attendances: [...value.attendances].reverse(), audit: [...value.audit].reverse(), applications: [...value.applications].reverse() });
const noFilters = { text: '', status: 'all', selectedEventId: '' };

test('staffing counts join by exact IDs, keep same-named functions distinct and ignore input order', () => {
  const report = buildStaffingReport(source(), noFilters);
  assert.deepEqual(report.rows.map((row) => row.eventId), ['event-a', 'event-b'], 'same-named functions stay separate, ordered by start then ID');
  const a = report.rows[0];
  assert.deepEqual(a.positions.map((p) => [p.positionId, p.quantity, p.activeAllocations, p.notComing, p.holdingCapacity, p.openCapacity]), [
    ['pos-a1', 6, 3, 1, 2, 4],
    ['pos-a2', 1, 0, 0, 0, 1],
  ], 'replaced allocations are excluded; not-coming is active but does not hold capacity');
  assert.equal(report.rows[1].openCapacity, 39);
  assert.deepEqual(buildStaffingReport(reversed(source()), noFilters), report, 'reordered source arrays give an identical report');

  const withUnrelated = source();
  withUnrelated.events.push(event('event-c', 'Reception', 'complete', '2026-09-20T08:00:00.000+05:30'));
  withUnrelated.assignments.push(assignment('as-9', 'pos-zz', 'event-c'));
  const next = buildStaffingReport(withUnrelated, noFilters);
  assert.deepEqual(next.rows.find((row) => row.eventId === 'event-a'), a, 'an unrelated record does not change another function');
});

test('overview splits attendance evidence and counts decisions separately from totals', () => {
  const overview = buildReportOverview(source());
  assert.deepEqual(overview.evidence, { 'gps-denied': 1, 'gps-missing': 1, 'outside-radius': 1, recorded: 1 });
  assert.deepEqual(overview.eventsByStatus, { planned: 1, staffing: 1, complete: 0 });
  assert.equal(overview.requiredHeadcount, 47);
  assert.equal(overview.activeAllocations, 4);
  assert.equal(overview.openCapacity, 4 + 1 + 39);
  assert.equal(overview.pendingApplications, 1);
  assert.equal(overview.auditCount, 3);
  assert.equal(overview.latestAudit, '2026-09-14T09:00:00.000+05:30');
});

test('selected function detail shows only that function and clears explicitly when filtered out', () => {
  const selected = buildStaffingReport(source(), { ...noFilters, selectedEventId: 'event-b' });
  assert.equal(selected.selected.eventId, 'event-b');
  assert.deepEqual(selected.assignments.map((item) => item.id), ['as-5']);
  assert.deepEqual(selected.exportRows.map((row) => row.position_id), ['pos-b1']);

  const hidden = buildStaffingReport(source(), { text: '', status: 'staffing', selectedEventId: 'event-b' });
  assert.equal(hidden.selected, null, 'the hidden function is not re-pointed to another visible function');
  assert.equal(hidden.hiddenSelectionId, 'event-b');
  assert.deepEqual(hidden.assignments, []);
  assert.deepEqual(hidden.exportRows.map((row) => row.event_id), ['event-a', 'event-a'], 'export falls back to the visible rows, not the hidden selection');

  assert.equal(reconcileReportSelection('event-b', ['event-a']), '');
  assert.equal(reconcileReportSelection('event-a', ['event-a']), 'event-a');
  assert.equal(reconcileReportSelection('', ['event-a']), '', 'no implicit selection');
});

test('exceptions keep GPS missing, denied, outside radius and recorded as separate groups', () => {
  const report = buildExceptionsReport(source(), { text: '', group: 'all' });
  assert.deepEqual(report.groups.map((group) => [group.key, group.items.map((item) => item.recordId)]), [
    ['pending-applications', ['app-2']],
    ['gps-denied', ['att-1']],
    ['gps-missing', ['att-2']],
    ['outside-radius', ['att-3']],
    ['recorded', ['att-4']],
  ]);
  const missing = buildExceptionsReport(source(), { text: '', group: 'gps-missing' });
  assert.deepEqual(missing.exportRows.map((row) => [row.record_id, row.evidence_state]), [['att-2', 'gps-missing']]);
  assert.equal(missing.exportRows.some((row) => row.evidence_state === 'recorded'), false, 'missing evidence is never exported as recorded');
});

test('audit filters keep duplicate-looking entries individually addressable', () => {
  const byAction = buildAuditReport(source(), { text: 'same reason', action: 'attendance.corrected', actorId: '', entityId: '' });
  assert.deepEqual(byAction.rows.map((row) => row.id), ['audit-1', 'audit-2'], 'identical action/reason rows both remain, in deterministic order');
  const byEntity = buildAuditReport(source(), { text: '', action: 'attendance.corrected', actorId: '', entityId: 'att-1' });
  assert.deepEqual(byEntity.exportRows.map((row) => row.audit_id), ['audit-2']);
  const byActor = buildAuditReport(source(), { text: '', action: '', actorId: 'ops-2', entityId: '' });
  assert.deepEqual(byActor.rows.map((row) => row.id), ['audit-3']);
  const staleOption = buildAuditReport(source(), { text: '', action: 'no.longer.present', actorId: 'gone', entityId: '' });
  assert.equal(staleOption.rows.length, 3, 'a select value missing from this snapshot is not a hidden filter');
  assert.equal(staleOption.appliedAction, '');
});

test('scenario-empty and filtered-empty are distinct', () => {
  const empty = source({ events: [], positions: [], assignments: [], applications: [], attendances: [], audit: [] });
  assert.equal(buildStaffingReport(empty, noFilters).empty, 'scenario');
  assert.equal(buildExceptionsReport(empty, { text: '', group: 'all' }).empty, 'scenario');
  assert.equal(buildAuditReport(empty, { text: '', action: '', actorId: '', entityId: '' }).empty, 'scenario');
  assert.equal(buildStaffingReport(source(), { ...noFilters, text: 'no-such-record' }).empty, 'filters');
  assert.equal(buildExceptionsReport(source(), { text: 'no-such-record', group: 'all' }).empty, 'filters');
  assert.equal(buildAuditReport(source(), { text: 'no-such-record', action: '', actorId: '', entityId: '' }).empty, 'filters');
  assert.equal(buildStaffingReport(source(), noFilters).empty, null);
});

test('CSV quoting, formula guard and deterministic columns', () => {
  assert.equal(csvField('plain'), 'plain');
  assert.equal(csvField('a,b'), '"a,b"');
  assert.equal(csvField('say "hi"'), '"say ""hi"""');
  assert.equal(csvField('line\nbreak'), '"line\nbreak"');
  assert.equal(csvField('=SUM(A1)'), "'=SUM(A1)");
  assert.equal(csvField(' padded '), '" padded "');
  const tricky = [{ a: 'x,"y"\r\nz', b: 7 }];
  assert.deepEqual(parseCsv(toCsv(['a', 'b'], tricky)), [['a', 'b'], ['x,"y"\r\nz', '7']]);

  const first = reportCsv(buildAuditReport(source(), { text: '', action: '', actorId: '', entityId: '' }), source());
  const second = reportCsv(buildAuditReport(reversed(source()), { text: '', action: '', actorId: '', entityId: '' }), source());
  assert.equal(first.csv, second.csv, 'same snapshot in a different order exports byte-identical CSV');
  assert.deepEqual(parseCsv(first.csv)[0], ['preview_marker', 'generation', 'snapshot_clock', 'view', 'view_scope', 'audit_id', 'created_at', 'action', 'actor_id', 'entity_id', 'reason']);
  assert.equal(first.filename, 'tnp-synthetic-preview-g3-audit.csv');
});

test('CSV contains exactly the currently visible stable IDs and excludes hidden ones', () => {
  const report = buildAuditReport(source(), { text: '', action: 'attendance.corrected', actorId: '', entityId: '' });
  const [header, ...rows] = parseCsv(reportCsv(report, source()).csv);
  const idColumn = header.indexOf('audit_id');
  assert.deepEqual(rows.map((row) => row[idColumn]), report.rows.map((row) => row.id));
  assert.equal(rows.some((row) => row[idColumn] === 'audit-3'), false);
  for (const row of rows) {
    assert.equal(row[0], PREVIEW_MARKER);
    assert.equal(row[1], '3');
    assert.equal(row[header.indexOf('view_scope')], 'action=attendance.corrected');
  }
  assert.equal(rows.some((row) => row.join(',').includes('Reception')) , false);

  const staffing = buildStaffingReport(source(), { ...noFilters, selectedEventId: 'event-a' });
  const file = reportCsv(staffing, source());
  const [staffHeader, ...staffRows] = parseCsv(file.csv);
  assert.deepEqual(staffRows.map((row) => row[staffHeader.indexOf('position_id')]), ['pos-a1', 'pos-a2']);
  assert.equal(file.filename, 'tnp-synthetic-preview-g3-staffing-event-a.csv');
});

test('download succeeds only after the browser steps complete, and always revokes the URL', () => {
  const calls = [];
  const env = (failAt) => ({
    createObjectURL: () => { calls.push('create'); if (failAt === 'create') throw new Error('blocked'); return 'blob:1'; },
    revokeObjectURL: (url) => calls.push(`revoke:${url}`),
    createAnchor: () => ({ href: '', download: '', click: () => { calls.push('click'); if (failAt === 'click') throw new Error('click refused'); }, remove: () => calls.push('remove') }),
    schedule: (run) => run(),
  });
  const file = { filename: 'f.csv', csv: 'a\r\n', rowCount: 0 };
  assert.deepEqual(prepareCsvDownload(file, env()), { ok: true, filename: 'f.csv', rowCount: 0 });
  assert.deepEqual(calls.splice(0), ['create', 'click', 'remove', 'revoke:blob:1']);
  assert.deepEqual(prepareCsvDownload(file, env('click')), { ok: false, message: 'click refused' });
  assert.deepEqual(calls.splice(0), ['create', 'click', 'revoke:blob:1'], 'a failed click still revokes');
  assert.deepEqual(prepareCsvDownload(file, env('create')), { ok: false, message: 'blocked' });
  assert.deepEqual(calls.splice(0), ['create'], 'nothing to revoke when no URL was created');
});

async function realSource(service) {
  const [generation, metadata, events, positions, assignments, applications, auditResult] = await Promise.all([
    service.getGeneration(), service.getScenarioMetadata(), service.listEvents(), service.listPositions(), service.listAssignments(), service.listApplications(), service.listAudit(),
  ]);
  return { generation, clock: metadata.clock, events: events.value.items, positions: positions.value.items, assignments: assignments.value.items, applications: applications.value.items, attendances: [], audit: auditResult.value.items };
}

test('reset changes the generation, and a late older refresh cannot replace the newer report', async () => {
  const service = new DemoPreviewService(await PreviewStore.create(new MemoryPreviewStorage()));
  const claim = await service.mutate({ requestKey: 'reports-claim', expectedGeneration: 0, actorId: 'tnp-demo-ops-001', operation: PREVIEW_OPERATIONS.claimOpportunity, payload: { positionId: 'tnp-demo-position-001', workerId: 'tnp-demo-worker-006' } });
  assert.equal(claim.ok, true);

  // Same epoch gate AdminOperations.refreshAll uses for every await.
  let epoch = 0;
  let accepted = null;
  let releaseOld;
  const gate = new Promise((resolve) => { releaseOld = resolve; });
  const oldId = ++epoch;
  const oldLoad = realSource(service).then(async (snapshot) => { await gate; if (isCurrentActionEpoch(oldId, epoch)) accepted = snapshot; });

  const reset = await service.resetPreview({ requestKey: 'reports-reset', expectedGeneration: 0, actorId: 'tnp-preview-controls' });
  assert.equal(reset.ok, true);
  const newId = ++epoch;
  const fresh = await realSource(service);
  if (isCurrentActionEpoch(newId, epoch)) accepted = fresh;
  releaseOld();
  await oldLoad;

  assert.equal(accepted.generation, 1);
  const staffing = buildStaffingReport(accepted, { ...noFilters, selectedEventId: 'tnp-demo-event-001' });
  assert.equal(staffing.assignments.some((item) => item.workerId === 'tnp-demo-worker-006'), false, 'the pre-reset claim is not resurrected');
  assert.equal(reportCsv(staffing, accepted).filename.includes('-g1-'), true);
});

test('Reports is a registered section and remounts per generation (source policy)', () => {
  assert.equal(REPORTS_SECTION.id, 'reports');
  const items = operationsSectionItems('reports');
  assert.deepEqual(items.filter((item) => item.current).map((item) => item.id), ['reports']);
  assert.equal(items.some((item) => item.id === 'overview'), true);

  const admin = readFileSync(here('./AdminOperations.tsx'), 'utf8');
  assert.match(admin, /<OperationsReports key=\{`generation-\$\{data\.generation\}`\}/, 'a generation change discards Reports-local selection, filters and export state');
  assert.doesNotMatch(admin, /futureNavigation = \[[^\]]*'Reports'/, 'Reports is no longer a disabled future destination');
  assert.match(admin, /getScenarioMetadata\(\)/);
});

test('reduced motion removes every Reports transition (source policy)', () => {
  const css = readFileSync(here('./AdminOperations.module.css'), 'utf8');
  const reducedSelectors = [...css.matchAll(/@media \(prefers-reduced-motion: reduce\) \{([^{}]*)\{([^{}]*)\}/g)]
    .filter((match) => /animation: none/.test(match[2]) && /transition: none/.test(match[2]))
    .map((match) => match[1]).join(' ');
  for (const name of ['reportReveal', 'reportRow', 'reportTab', 'reportItem']) {
    assert.match(css, new RegExp(`\\.${name} \\{[^}]*(animation|transition):`), `${name} has motion`);
    assert.match(reducedSelectors, new RegExp(`\\.${name}\\b`), `${name} is disabled for reduced motion`);
  }
});

test('Reports copy avoids unsupported outcome claims (adversarial copy audit)', () => {
  const ui = readFileSync(here('./OperationsReports.tsx'), 'utf8');
  const text = [...ui.matchAll(/>([^<>{}]+)</g), ...ui.matchAll(/'([^'\n]{6,})'/g), ...ui.matchAll(/`([^`\n]{6,})`/g)].map((match) => match[1]).join('\n');
  for (const word of ['verified', 'approved', 'paid', 'sent', 'saved', 'official', 'secure', 'real-time', 'live', 'downloaded', 'successfully']) {
    const lines = text.split('\n').filter((line) => new RegExp(`\\b${word}\\b`, 'i').test(line));
    const allowed = lines.filter((line) => /\bnot\b|\bno\b|nothing|never|unavailable|n't/i.test(line));
    assert.deepEqual(lines, allowed, `"${word}" appears only in negated or limitation copy`);
  }
});
