import assert from 'node:assert/strict';
import test from 'node:test';
import {
  actionableAttendanceAssignments,
  canRetryFeedback,
  filterOperationsEvents,
  reconcileSelectedId,
  reviewableApplications,
} from './operationsState.ts';

const eventOne = { id: 'event-1', name: 'Wedding', status: 'staffing' };
const eventTwo = { id: 'event-2', name: 'Reception', status: 'planned' };

test('selection always reconciles to a visible option or an explicit empty value', () => {
  assert.equal(reconcileSelectedId('missing', ['current']), 'current');
  assert.equal(reconcileSelectedId('current', ['current']), 'current');
  assert.equal(reconcileSelectedId('missing', []), '');
});

test('event filtering never treats an excluded event as selected detail', () => {
  const planned = filterOperationsEvents([eventOne, eventTwo], '', 'planned');
  assert.deepEqual(planned.map((event) => event.id), ['event-2']);
  assert.equal(reconcileSelectedId('event-1', planned.map((event) => event.id)), 'event-2');

  const noMatch = filterOperationsEvents([eventOne, eventTwo], 'missing-record', 'all');
  assert.deepEqual(noMatch, []);
  assert.equal(reconcileSelectedId('event-1', []), '');
});

test('verification decisions include only pending records with worker identity and role', () => {
  const applications = [
    { id: 'pending-valid', applicantId: 'worker-1', role: 'Volunteer', status: 'pending', reviewReason: null },
    { id: 'pending-missing-worker', applicantId: 'worker-2', role: 'Volunteer', status: 'pending', reviewReason: null },
    { id: 'pending-missing-role', applicantId: 'worker-1', role: '', status: 'pending', reviewReason: null },
    { id: 'reviewed', applicantId: 'worker-1', role: 'Volunteer', status: 'approved-sample', reviewReason: 'done' },
  ];
  const workers = { 'worker-1': { id: 'worker-1' } };

  assert.deepEqual(reviewableApplications(applications, workers).map((item) => item.id), ['pending-valid']);
});

test('attendance capture exposes only active confirmed work without attendance', () => {
  const assignments = [
    { id: 'already-recorded', allocationState: 'active', response: 'coming' },
    { id: 'pending', allocationState: 'active', response: 'pending' },
    { id: 'not-coming', allocationState: 'active', response: 'not-coming' },
    { id: 'replaced', allocationState: 'replaced', response: 'coming' },
    { id: 'actionable', allocationState: 'active', response: 'coming' },
  ];
  const attendances = [{ assignmentId: 'already-recorded' }];

  assert.deepEqual(actionableAttendanceAssignments(assignments, attendances).map((item) => item.id), ['actionable']);
  assert.deepEqual(actionableAttendanceAssignments(assignments.slice(0, 4), attendances), []);
});

test('retry is offered only for the matching retained transient action', () => {
  assert.equal(canRetryFeedback({ actionId: 'attendance:1', retryable: true }, 'attendance:1'), true);
  assert.equal(canRetryFeedback({ actionId: 'attendance:1', retryable: true }, 'replacement:1'), false);
  assert.equal(canRetryFeedback({ actionId: 'attendance:1', retryable: false }, 'attendance:1'), false);
  assert.equal(canRetryFeedback({ actionId: 'attendance:1', retryable: true }, undefined), false);
  assert.equal(canRetryFeedback({ actionId: 'attendance:1', retryable: true, code: 'STALE_GENERATION' }, 'attendance:1'), false);
});
