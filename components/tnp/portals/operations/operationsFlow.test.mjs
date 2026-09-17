import assert from 'node:assert/strict';
import test from 'node:test';

import { PREVIEW_OPERATIONS, DemoPreviewService } from '../../../../lib/demo/service.ts';
import { MemoryPreviewStorage, PreviewStore } from '../../../../lib/demo/store.ts';

async function setup() {
  const store = await PreviewStore.create(new MemoryPreviewStorage());
  return new DemoPreviewService(store);
}

function request(operation, payload, requestKey, expectedGeneration = 0) {
  return { operation, payload, requestKey, expectedGeneration, actorId: 'tnp-demo-ops-001' };
}

function value(result) {
  assert.equal(result.ok, true, result.ok ? undefined : `${result.error.code}: ${result.error.message}`);
  return result.value;
}

test('replacement rejection preserves the original while success refreshes roster and audit exactly once', async () => {
  const rejectedService = await setup();
  const auditBefore = value(await rejectedService.listAudit()).items.length;
  const rejected = await rejectedService.mutate(request(PREVIEW_OPERATIONS.replaceAssignment, {
    assignmentId: 'tnp-demo-assignment-002',
    replacementWorkerId: 'tnp-demo-worker-004',
    reason: 'Synthetic ineligible replacement probe',
  }, 'operations-replacement-rejected'));
  assert.equal(rejected.ok, false);
  assert.equal(rejected.error.code, 'INELIGIBLE');
  assert.equal(rejected.error.retryable, false);
  assert.equal(value(await rejectedService.listRoster('tnp-demo-event-001')).items.some((item) => item.id === 'tnp-demo-assignment-002'), true);
  assert.equal(value(await rejectedService.listAudit()).items.length, auditBefore);

  const successfulService = await setup();
  const replacementRequest = request(PREVIEW_OPERATIONS.replaceAssignment, {
    assignmentId: 'tnp-demo-assignment-002',
    replacementWorkerId: 'tnp-demo-worker-006',
    reason: 'Synthetic accepted replacement probe',
  }, 'operations-replacement-success');
  const replacement = value(await successfulService.mutate(replacementRequest));
  assert.equal(replacement.original.allocationState, 'replaced');
  assert.equal(replacement.replacement.workerId, 'tnp-demo-worker-006');
  const roster = value(await successfulService.listRoster('tnp-demo-event-001')).items;
  assert.equal(roster.some((item) => item.id === 'tnp-demo-assignment-002'), false);
  assert.equal(roster.some((item) => item.id === replacement.replacement.id), true);
  assert.equal((await successfulService.mutate(replacementRequest)).replayed, true);
  const replacementAudit = value(await successfulService.listAudit()).items.filter((entry) => entry.action === 'assignment.replaced');
  assert.equal(replacementAudit.length, 1);
  assert.equal(replacementAudit[0].entityId, replacement.replacement.id);
});

test('attendance recording and correction replay only the exact request and refresh audit evidence', async () => {
  const service = await setup();
  const assignment = value(await service.mutate(request(PREVIEW_OPERATIONS.adminAssign, {
    positionId: 'tnp-demo-position-001',
    workerId: 'tnp-demo-worker-006',
    reason: 'Synthetic attendance flow probe',
  }, 'operations-attendance-assignment')));
  const pass = value(await service.getEventPass(assignment.id));
  const attendanceRequest = request(PREVIEW_OPERATIONS.recordAttendance, {
    token: pass.token,
    eventId: pass.eventId,
    evidenceState: 'recorded',
    note: 'Synthetic desk evidence probe',
  }, 'operations-attendance-record');
  const attendance = value(await service.mutate(attendanceRequest));
  assert.equal((await service.mutate(attendanceRequest)).replayed, true);
  assert.equal(value(await service.listAudit()).items.filter((entry) => entry.action === 'attendance.recorded' && entry.entityId === attendance.id).length, 1);

  const correctionRequest = request(PREVIEW_OPERATIONS.correctAttendance, {
    attendanceId: attendance.id,
    state: 'exception',
    evidenceState: 'gps-denied',
    reason: 'Synthetic correction probe',
    note: 'Permission denial preserved',
  }, 'operations-attendance-correction');
  const corrected = value(await service.mutate(correctionRequest));
  assert.equal(corrected.history.at(-1).evidence.state, 'recorded');
  assert.equal(corrected.evidence.state, 'gps-denied');
  assert.equal((await service.mutate(correctionRequest)).replayed, true);
  const refreshedAudit = value(await service.listAudit()).items;
  assert.equal(refreshedAudit.filter((entry) => entry.action === 'attendance.corrected' && entry.entityId === attendance.id).length, 1);

  const conflict = await service.mutate(request(PREVIEW_OPERATIONS.correctAttendance, {
    ...correctionRequest.payload,
    reason: 'Different action under a reused key',
  }, correctionRequest.requestKey));
  assert.equal(conflict.ok, false);
  assert.equal(conflict.error.code, 'IDEMPOTENCY_CONFLICT');
  assert.equal(conflict.error.retryable, false);
});
