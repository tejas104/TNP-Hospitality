import test from 'node:test';
import assert from 'node:assert/strict';

import { PREVIEW_STORAGE_KEY } from '../lib/contracts/preview.ts';
import { PREVIEW_OPERATIONS, DemoPreviewService } from '../lib/demo/service.ts';
import { MemoryPreviewStorage, PreviewStore } from '../lib/demo/store.ts';

async function setup(storage = new MemoryPreviewStorage()) {
  const store = await PreviewStore.create(storage);
  return { storage, store, service: new DemoPreviewService(store) };
}

function request(operation, payload, requestKey, expectedGeneration = 0, actorId = 'tnp-test-actor') {
  return { operation, payload, requestKey, expectedGeneration, actorId };
}

function value(result) {
  assert.equal(result.ok, true, result.ok ? undefined : `${result.error.code}: ${result.error.message}`);
  return result.value;
}

function errorCode(result, code) {
  assert.equal(result.ok, false);
  assert.equal(result.error.code, code);
}

async function arrange(store, key, update) {
  return value(await store.commit(request(`testArrange.${key}`, {}, `arrange-${key}`), (records) => {
    update(records);
    return { ok: true, value: true };
  }));
}

test('canonical scenario joins every consumer view and exposes explicit variants', async () => {
  const { service } = await setup();
  const metadata = await service.getScenarioMetadata();
  assert.equal(metadata.timezone, 'Asia/Kolkata');
  assert.equal(metadata.clock, '2026-09-10T09:00:00.000+05:30');
  assert.equal(metadata.syntheticOnly, true);

  const venues = value(await service.listVenues()).items;
  const planners = value(await service.listPlanners()).items;
  assert.equal(venues.some((item) => item.isOwned), true);
  assert.equal(planners.some((item) => item.verificationState === 'approved-sample'), true);

  const booking = value(await service.getBooking('tnp-demo-booking-001'));
  const events = value(await service.listEvents()).items;
  const requirements = value(await service.listRequirements()).items;
  assert.equal(events.length, 2);
  assert.equal(events.every((item) => item.bookingId === booking.id), true);
  assert.equal(requirements.every((item) => item.bookingId === booking.id && events.some((event) => event.id === item.eventId)), true);

  const positions = value(await service.listPositions()).items;
  assert.deepEqual(positions.slice(0, 2).map((item) => item.quantity), [6, 40]);
  assert.equal(positions.every((item) => Number.isInteger(item.payRatePaise)), true);
  assert.equal(value(await service.getPosition('tnp-demo-position-002')).eventId, 'tnp-demo-event-002');

  const opportunity = value(await service.getOpportunity('tnp-demo-position-001', 'tnp-demo-worker-006'));
  assert.equal(opportunity.eventId, 'tnp-demo-event-001');
  assert.equal(opportunity.requiredQuantity, 6);
  assert.equal(opportunity.eligibilityReason.startsWith('Eligible'), true);
  assert.equal(value(await service.getOpportunity('tnp-demo-position-003', 'tnp-demo-worker-005')).availability, 'full');
  assert.equal(value(await service.getOpportunity('tnp-demo-position-004', 'tnp-demo-worker-003')).availability, 'unavailable');

  const assignments = value(await service.listAssignments()).items;
  assert.deepEqual(new Set(assignments.map((item) => item.response)), new Set(['pending', 'coming', 'not-coming']));
  const denied = value(await service.getAttendanceHistory('tnp-demo-worker-002')).items[0];
  assert.equal(denied.evidence.state, 'gps-denied');
  assert.equal(denied.evidence.distanceMetres, null);

  const quote = value(await service.getQuote('tnp-demo-quote-001'));
  assert.equal(quote.version, 2);
  assert.equal(quote.status, 'revised');
  assert.equal(Number.isInteger(quote.totalPaise), true);

  const collections = value(await service.listCollections('tnp-demo-booking-001')).items;
  assert.deepEqual(new Set(collections.map((item) => item.status)), new Set(['unpaid', 'processing', 'failed', 'uncertain', 'paid']));
  const missingReference = value(await service.listCollections()).items.find((item) => item.reference === null);
  assert.equal(missingReference.status, 'unpaid');

  const applications = value(await service.listApplications()).items;
  assert.deepEqual(new Set(applications.map((item) => item.status)), new Set(['invalid', 'pending', 'rejected', 'approved-sample']));
  assert.equal(value(await service.listGuestSummaries(booking.id)).items[0].eventId, events[0].id);

  assert.equal(value(await service.listEvents({ variant: 'empty' })).items.length, 0);
  errorCode(await service.listEvents({ variant: 'loading' }), 'PREVIEW_LOADING');
  errorCode(await service.listEvents({ variant: 'error' }), 'PREVIEW_QUERY_ERROR');
  errorCode(await service.getEvent('missing'), 'NOT_FOUND');
  const attendanceEvidence = value(await service.getAttendanceHistory('tnp-demo-worker-005')).items[0].evidence;
  assert.equal(attendanceEvidence.state, 'outside-radius');
  assert.equal(attendanceEvidence.distanceMetres, 480);
});

test('A/B/C registration, draft and enquiry operations validate, persist and replay without external sends', async () => {
  const { service, storage } = await setup();
  const bookingRequest = request(PREVIEW_OPERATIONS.submitBooking, {
    clientId: 'tnp-demo-client-new', venueId: 'tnp-demo-venue-002', eventName: 'Sample Sangeet', city: 'Udaipur', budgetPaise: 25000000, status: 'draft',
  }, 'booking-draft');
  const booking = value(await service.mutate(bookingRequest));
  assert.equal(booking.status, 'draft');
  const replay = await service.mutate(bookingRequest);
  assert.equal(replay.ok, true);
  assert.equal(replay.replayed, true);
  assert.equal(value(await service.listBookings()).items.some((item) => item.id === booking.id), true);
  const draftReload = await setup(storage);
  assert.equal(value(await draftReload.service.getBooking(booking.id)).status, 'draft');
  errorCode(await service.mutate(request(PREVIEW_OPERATIONS.submitBooking, { ...bookingRequest.payload, city: 'Changed' }, 'booking-draft')), 'IDEMPOTENCY_CONFLICT');
  errorCode(await service.mutate(request(PREVIEW_OPERATIONS.submitBooking, { venueId: 'missing', eventName: '', city: '', budgetPaise: 2.5 }, 'bad-booking')), 'VALIDATION_ERROR');

  const planner = value(await service.mutate(request(PREVIEW_OPERATIONS.registerPlanner, { displayName: 'Sample New Planner', city: 'Mumbai' }, 'planner')));
  assert.equal(planner.verificationState, 'pending');

  const requirement = value(await service.mutate(request(PREVIEW_OPERATIONS.submitRequirement, { bookingId: 'tnp-demo-booking-001', eventId: 'tnp-demo-event-001', role: 'Event Coordinator', quantity: 3, notes: 'Sample linked requirement' }, 'requirement')));
  assert.equal(requirement.bookingId, 'tnp-demo-booking-001');
  assert.equal(requirement.eventId, 'tnp-demo-event-001');

  const enquiryRequest = request(PREVIEW_OPERATIONS.submitEnquiry, { name: 'Sample Visitor', email: 'sample@example.test', message: 'Synthetic enquiry only' }, 'enquiry');
  const enquiry = value(await service.mutate(enquiryRequest));
  assert.equal(enquiry.sentExternally, false);
  assert.equal((await service.mutate(enquiryRequest)).replayed, true);
  assert.equal(value(await service.listEnquiries()).items.length, 1);
  errorCode(await service.mutate(request(PREVIEW_OPERATIONS.submitEnquiry, { name: '', email: 'bad', message: '' }, 'bad-enquiry')), 'VALIDATION_ERROR');

  const application = value(await service.mutate(request(PREVIEW_OPERATIONS.registerApplicant, { applicantId: 'tnp-demo-applicant-new', displayName: 'Sample Applicant', role: 'Volunteer' }, 'applicant')));
  assert.equal(application.status, 'pending');
  const assessment = value(await service.mutate(request(PREVIEW_OPERATIONS.submitAssessment, { applicantId: 'tnp-demo-applicant-new', score: 82 }, 'assessment')));
  assert.equal(assessment.status, 'passed');
  assert.equal(value(await service.listAssessments('tnp-demo-applicant-new')).items[0].score, 82);
  errorCode(await service.mutate(request(PREVIEW_OPERATIONS.submitAssessment, { applicantId: 'missing', score: 101 }, 'bad-assessment')), 'VALIDATION_ERROR');
});

test('planner requirement to Operations allocation to worker attendance and earning remains connected', async () => {
  const { service } = await setup();
  const requirement = value(await service.mutate(request(PREVIEW_OPERATIONS.submitRequirement, {
    bookingId: 'tnp-demo-booking-001', eventId: 'tnp-demo-event-001', role: 'Event Coordinator', quantity: 1, notes: 'Connected service proof',
  }, 'connected-requirement')));
  assert.equal(value(await service.getRequirement(requirement.id)).eventId, 'tnp-demo-event-001');

  const assignment = value(await service.mutate(request(PREVIEW_OPERATIONS.adminAssign, {
    positionId: 'tnp-demo-position-001', workerId: 'tnp-demo-worker-006', reason: 'Sample Operations allocation',
  }, 'connected-allocation', 0, 'tnp-demo-ops-001')));
  assert.equal(assignment.response, 'coming');
  assert.equal(value(await service.listRoster('tnp-demo-event-001')).items.some((item) => item.id === assignment.id), true);

  const pass = value(await service.getEventPass(assignment.id));
  const attendance = value(await service.mutate(request(PREVIEW_OPERATIONS.recordAttendance, {
    token: pass.token, eventId: pass.eventId, evidenceState: 'gps-missing', note: 'Synthetic check-in; location unavailable',
  }, 'connected-attendance', 0, 'tnp-demo-ops-001')));
  assert.equal(attendance.state, 'exception');
  assert.equal(attendance.evidence.state, 'gps-missing');
  const earning = value(await service.listEarnings('tnp-demo-worker-006')).items[0];
  assert.equal(earning.assignmentId, assignment.id);
  assert.equal(earning.estimatedGrossPaise, 250000);
  assert.equal(earning.grossPaise, 0);
  assert.equal(earning.netPaise, 0);
  assert.equal(earning.amountState, 'estimated');
  assert.equal(earning.status, 'pending-verification');
});

test('claim, response, roster and Operations allocation are capacity-safe and atomic in the simulation', async () => {
  const { service } = await setup();
  const beforeRoster = value(await service.listRoster('tnp-demo-event-001')).items.length;
  const claimRequest = request(PREVIEW_OPERATIONS.claimOpportunity, { positionId: 'tnp-demo-position-001', workerId: 'tnp-demo-worker-006' }, 'claim-worker-6');
  const claimed = value(await service.mutate(claimRequest));
  assert.equal(claimed.response, 'pending');
  assert.equal(value(await service.listRoster('tnp-demo-event-001')).items.length, beforeRoster + 1);
  assert.equal((await service.mutate(claimRequest)).replayed, true);
  assert.equal(value(await service.getMetrics()).activeAssignments, 6);

  const coming = value(await service.mutate(request(PREVIEW_OPERATIONS.respondToAssignment, { assignmentId: claimed.id, response: 'coming' }, 'response-coming')));
  assert.equal(coming.response, 'coming');
  const declined = value(await service.mutate(request(PREVIEW_OPERATIONS.respondToAssignment, { assignmentId: claimed.id, response: 'not-coming' }, 'response-decline')));
  assert.equal(declined.response, 'not-coming');

  errorCode(await service.mutate(request(PREVIEW_OPERATIONS.claimOpportunity, { positionId: 'tnp-demo-position-002', workerId: 'tnp-demo-worker-004' }, 'claim-ineligible')), 'INELIGIBLE');
  value(await service.mutate(request(PREVIEW_OPERATIONS.changeRole, { workerId: 'tnp-demo-worker-006', role: 'Hostess', reason: 'Test full capacity' }, 'role-hostess')));
  errorCode(await service.mutate(request(PREVIEW_OPERATIONS.claimOpportunity, { positionId: 'tnp-demo-position-003', workerId: 'tnp-demo-worker-006' }, 'claim-full')), 'POSITION_FULL');

  const failedReplacement = await service.mutate(request(PREVIEW_OPERATIONS.replaceAssignment, { assignmentId: 'tnp-demo-assignment-002', replacementWorkerId: 'tnp-demo-worker-004', reason: 'Sample replacement attempt' }, 'replace-fail'));
  errorCode(failedReplacement, 'INELIGIBLE');
  assert.equal(value(await service.listRoster('tnp-demo-event-001')).items.find((item) => item.id === 'tnp-demo-assignment-002').allocationState, 'active');

  const second = await setup();
  const replacement = value(await second.service.mutate(request(PREVIEW_OPERATIONS.replaceAssignment, { assignmentId: 'tnp-demo-assignment-002', replacementWorkerId: 'tnp-demo-worker-006', reason: 'Sample confirmed absence' }, 'replace-success')));
  assert.equal(replacement.original.allocationState, 'replaced');
  assert.equal(replacement.replacement.workerId, 'tnp-demo-worker-006');
  const replacementRoster = value(await second.service.listRoster('tnp-demo-event-001')).items;
  assert.equal(replacementRoster.some((item) => item.id === 'tnp-demo-assignment-002'), false);
  assert.equal(replacementRoster.some((item) => item.workerId === 'tnp-demo-worker-006'), true);
});

test('attendance, human review and audit preserve evidence and distinguish scan failures', async () => {
  const { service } = await setup();
  errorCode(await service.mutate(request(PREVIEW_OPERATIONS.recordAttendance, { token: 'TNP-SAMPLE-EVENT-001', eventId: 'tnp-demo-event-002', evidenceState: 'recorded' }, 'wrong-event')), 'WRONG_EVENT');
  errorCode(await service.mutate(request(PREVIEW_OPERATIONS.recordAttendance, { token: 'TNP-SAMPLE-EXPIRED', eventId: 'tnp-demo-event-002', evidenceState: 'recorded' }, 'expired-pass')), 'EXPIRED_PASS');
  errorCode(await service.mutate(request(PREVIEW_OPERATIONS.recordAttendance, { token: 'TNP-SAMPLE-EVENT-001', eventId: 'tnp-demo-event-001', evidenceState: 'recorded' }, 'duplicate-scan')), 'DUPLICATE_SCAN');

  const corrected = value(await service.mutate(request(PREVIEW_OPERATIONS.correctAttendance, { attendanceId: 'tnp-demo-attendance-001', state: 'present', evidenceState: 'recorded', reason: 'Sample supervisor roll call confirmed presence' }, 'attendance-correction', 0, 'tnp-demo-ops-001')));
  assert.equal(corrected.state, 'present');
  assert.equal(corrected.evidence.state, 'recorded');
  assert.equal(corrected.history.at(-1).evidence.state, 'gps-denied');
  assert.equal(corrected.history.at(-1).reason, 'Sample supervisor roll call confirmed presence');

  errorCode(await service.mutate(request(PREVIEW_OPERATIONS.correctAttendance, { attendanceId: 'tnp-demo-attendance-001', state: 'present', reason: '' }, 'bad-correction')), 'VALIDATION_ERROR');
  const reviewed = value(await service.mutate(request(PREVIEW_OPERATIONS.reviewApplication, { applicationId: 'tnp-demo-application-001', decision: 'approved-sample', reason: 'Sample human reviewer approved' }, 'review-app', 0, 'tnp-demo-ops-001')));
  assert.equal(reviewed.status, 'approved-sample');
  value(await service.mutate(request(PREVIEW_OPERATIONS.markNonresponse, { assignmentId: 'tnp-demo-assignment-002', reason: 'No response in sample window' }, 'nonresponse', 0, 'tnp-demo-ops-001')));
  const audit = value(await service.listAudit()).items;
  assert.equal(audit.some((item) => item.action === 'attendance.corrected'), true);
  assert.equal(audit.some((item) => item.action === 'application.reviewed'), true);
  assert.equal(audit.some((item) => item.action === 'assignment.nonresponse'), true);
  assert.equal(value(await service.getStanding('tnp-demo-worker-002')).standing, 'under-review');
});

test('quotes, earnings, approvals and payout states use integer paise and deterministic transitions', async () => {
  const { service } = await setup();
  errorCode(await service.mutate(request(PREVIEW_OPERATIONS.clientApproveQuote, { quoteId: 'tnp-demo-quote-001', expectedVersion: 1 }, 'stale-quote')), 'STALE_VERSION');
  const revisionRequested = value(await service.mutate(request(PREVIEW_OPERATIONS.clientRequestQuoteRevision, { quoteId: 'tnp-demo-quote-001', expectedVersion: 2, reason: 'Please separate sample staffing lines' }, 'client-revision')));
  assert.equal(revisionRequested.status, 'revision-requested');
  const revised = value(
    await service.mutate(
      request(
        PREVIEW_OPERATIONS.reviseQuote,
        {
          quoteId: 'tnp-demo-quote-001',
          expectedVersion: 2,
          issuingEntity: 'TNP Hospitality Preview Entity',
          reason: 'Operations edit after client request',
          lines: [
            { label: 'Sample staffing', quantity: 6, unitPaise: 250000 },
            { label: 'Sample logistics', quantity: 1, unitPaise: 500000 },
          ],
        },
        'ops-revise',
      ),
    ),
  );
  assert.equal(revised.version, 3);
  assert.equal(revised.totalPaise, 2000000);
  assert.equal(revised.lines.every((line) => Number.isInteger(line.totalPaise)), true);
  const approved = value(await service.mutate(request(PREVIEW_OPERATIONS.clientApproveQuote, { quoteId: revised.id, expectedVersion: 3 }, 'approve-quote')));
  assert.equal(approved.status, 'approved');

  errorCode(await service.mutate(request(PREVIEW_OPERATIONS.adjustEarning, { earningId: 'tnp-demo-earning-001', grossPaise: 260000, deductionsPaise: 20000, reason: 'Sample adjustment' }, 'adjust-processing')), 'IMMUTABLE_PROCESSING_BATCH');
  const assignment = value(await service.mutate(request(PREVIEW_OPERATIONS.adminAssign, { positionId: 'tnp-demo-position-001', workerId: 'tnp-demo-worker-006', reason: 'Create verified sample earning' }, 'finance-assignment', 0, 'tnp-demo-ops-001')));
  const pass = value(await service.getEventPass(assignment.id));
  value(await service.mutate(request(PREVIEW_OPERATIONS.recordAttendance, { token: pass.token, eventId: pass.eventId, evidenceState: 'recorded', note: 'Synthetic verified attendance' }, 'finance-attendance', 0, 'tnp-demo-ops-001')));
  const draft = value(await service.listEarnings('tnp-demo-worker-006')).items[0];
  const adjusted = value(await service.mutate(request(PREVIEW_OPERATIONS.adjustEarning, { earningId: draft.id, grossPaise: 90000, deductionsPaise: 5000, reason: 'Sample approved shift' }, 'adjust-earning')));
  assert.deepEqual([adjusted.grossPaise, adjusted.deductionsPaise, adjusted.netPaise], [90000, 5000, 85000]);
  errorCode(await service.mutate(request(PREVIEW_OPERATIONS.approveEarning, { earningId: adjusted.id, stage: 'finance' }, 'finance-too-early')), 'APPROVAL_ORDER');
  const supervisorRequest = request(PREVIEW_OPERATIONS.approveEarning, { earningId: adjusted.id, stage: 'supervisor' }, 'approve-supervisor', 0, 'tnp-demo-supervisor-001');
  const supervisorApproved = value(await service.mutate(supervisorRequest));
  assert.equal(supervisorApproved.status, 'supervisor-approved');
  assert.equal(supervisorApproved.supervisorApproval.actorId, 'tnp-demo-supervisor-001');
  assert.equal((await service.mutate(supervisorRequest)).replayed, true);
  errorCode(await service.mutate(request(PREVIEW_OPERATIONS.approveEarning, { earningId: adjusted.id, stage: 'finance' }, 'same-approver', 0, 'tnp-demo-supervisor-001')), 'SAMPLE_APPROVER_CONFLICT');
  const financeApproved = value(await service.mutate(request(PREVIEW_OPERATIONS.approveEarning, { earningId: adjusted.id, stage: 'finance' }, 'approve-finance', 0, 'tnp-demo-finance-001')));
  assert.equal(financeApproved.status, 'finance-approved');
  assert.equal(financeApproved.financeApproval.actorId, 'tnp-demo-finance-001');
  assert.notEqual(financeApproved.supervisorApproval.actorId, financeApproved.financeApproval.actorId);
  assert.match(financeApproved.financeApproval.assumptionLabel, /production separation-of-duties policy pending/i);
  const payouts = value(await service.listPayouts()).items;
  assert.deepEqual(new Set(payouts.map((item) => item.status)), new Set(['processing', 'failed', 'uncertain', 'reversed', 'paid']));
  errorCode(await service.mutate(request(PREVIEW_OPERATIONS.approveEarning, { earningId: 'tnp-demo-earning-003', stage: 'supervisor' }, 'approve-pending')), 'EARNING_NOT_APPROVABLE');
});

test('reservation reactivation reuses capacity, eligibility, overlap and active-state guards', async () => {
  const capacity = await setup();
  await arrange(capacity.store, 'quantity-two', (records) => {
    records.positions.find((item) => item.id === 'tnp-demo-position-001').quantity = 2;
    records.assignments.find((item) => item.id === 'tnp-demo-assignment-002').response = 'not-coming';
  });
  value(await capacity.service.mutate(request(PREVIEW_OPERATIONS.respondToAssignment, { assignmentId: 'tnp-demo-assignment-005', response: 'not-coming' }, 'release-original')));
  const filler = value(await capacity.service.mutate(request(PREVIEW_OPERATIONS.claimOpportunity, { positionId: 'tnp-demo-position-001', workerId: 'tnp-demo-worker-006' }, 'fill-released-capacity')));
  value(await capacity.service.mutate(request(PREVIEW_OPERATIONS.respondToAssignment, { assignmentId: filler.id, response: 'coming' }, 'filler-coming')));
  const repeated = value(await capacity.service.mutate(request(PREVIEW_OPERATIONS.respondToAssignment, { assignmentId: filler.id, response: 'coming' }, 'filler-coming-repeat')));
  assert.equal(repeated.id, filler.id);
  errorCode(await capacity.service.mutate(request(PREVIEW_OPERATIONS.respondToAssignment, { assignmentId: 'tnp-demo-assignment-005', response: 'coming' }, 'reactivate-over-capacity')), 'POSITION_FULL');
  assert.equal(value(await capacity.service.listAssignments('tnp-demo-worker-007')).items[0].response, 'not-coming');

  const ineligible = await setup();
  value(await ineligible.service.mutate(request(PREVIEW_OPERATIONS.respondToAssignment, { assignmentId: 'tnp-demo-assignment-005', response: 'not-coming' }, 'ineligible-release')));
  value(await ineligible.service.mutate(request(PREVIEW_OPERATIONS.changeRole, { workerId: 'tnp-demo-worker-007', role: 'Volunteer', reason: 'Synthetic eligibility regression' }, 'make-ineligible')));
  errorCode(await ineligible.service.mutate(request(PREVIEW_OPERATIONS.respondToAssignment, { assignmentId: 'tnp-demo-assignment-005', response: 'coming' }, 'reactivate-ineligible')), 'INELIGIBLE');

  const overlap = await setup();
  value(await overlap.service.mutate(request(PREVIEW_OPERATIONS.respondToAssignment, { assignmentId: 'tnp-demo-assignment-005', response: 'not-coming' }, 'overlap-release')));
  await arrange(overlap.store, 'overlap', (records) => {
    records.events.push({ id: 'tnp-test-event-overlap', bookingId: 'tnp-demo-booking-001', name: 'Synthetic overlap', startsAt: '2026-09-14T10:00:00.000+05:30', endsAt: '2026-09-14T12:00:00.000+05:30', timezone: 'Asia/Kolkata', venueId: 'tnp-demo-venue-001', reportingDetails: 'Synthetic overlap', status: 'staffing' });
    records.assignments.push({ id: 'tnp-test-assignment-overlap', eventId: 'tnp-test-event-overlap', positionId: 'tnp-test-position-overlap', workerId: 'tnp-demo-worker-007', response: 'coming', allocationState: 'active', payRatePaiseSnapshot: 1, payUnitSnapshot: 'event', createdAt: records.metadata.clock });
  });
  errorCode(await overlap.service.mutate(request(PREVIEW_OPERATIONS.respondToAssignment, { assignmentId: 'tnp-demo-assignment-005', response: 'coming' }, 'reactivate-overlap')), 'OVERLAP');

  const replaced = await setup();
  value(await replaced.service.mutate(request(PREVIEW_OPERATIONS.replaceAssignment, { assignmentId: 'tnp-demo-assignment-005', replacementWorkerId: 'tnp-demo-worker-006', reason: 'Synthetic replacement' }, 'replace-pending')));
  errorCode(await replaced.service.mutate(request(PREVIEW_OPERATIONS.respondToAssignment, { assignmentId: 'tnp-demo-assignment-005', response: 'coming' }, 'reactivate-replaced')), 'ASSIGNMENT_INACTIVE');
});

test('attendance requires active eligible confirmed work and snapshots assignment pay', async () => {
  for (const evidenceState of ['gps-missing', 'gps-denied', 'outside-radius']) {
    const current = await setup();
    const assignment = value(await current.service.mutate(request(PREVIEW_OPERATIONS.adminAssign, { positionId: 'tnp-demo-position-001', workerId: 'tnp-demo-worker-006', reason: `Synthetic ${evidenceState} attendance` }, `assign-${evidenceState}`)));
    const pass = value(await current.service.getEventPass(assignment.id));
    value(await current.service.mutate(request(PREVIEW_OPERATIONS.recordAttendance, { token: pass.token, eventId: pass.eventId, evidenceState, distanceMetres: evidenceState === 'outside-radius' ? 500 : undefined }, `attendance-${evidenceState}`)));
    const earning = value(await current.service.listEarnings('tnp-demo-worker-006')).items[0];
    assert.deepEqual([earning.amountState, earning.status, earning.estimatedGrossPaise, earning.grossPaise, earning.netPaise], ['estimated', 'pending-verification', 250000, 0, 0]);
  }

  const declined = await setup();
  const declinedAssignment = value(await declined.service.mutate(request(PREVIEW_OPERATIONS.adminAssign, { positionId: 'tnp-demo-position-001', workerId: 'tnp-demo-worker-006', reason: 'Synthetic declined pass' }, 'declined-assignment')));
  const declinedPass = value(await declined.service.getEventPass(declinedAssignment.id));
  value(await declined.service.mutate(request(PREVIEW_OPERATIONS.respondToAssignment, { assignmentId: declinedAssignment.id, response: 'not-coming' }, 'decline-before-scan')));
  errorCode(await declined.service.mutate(request(PREVIEW_OPERATIONS.recordAttendance, { token: declinedPass.token, eventId: declinedPass.eventId, evidenceState: 'recorded' }, 'scan-declined')), 'ASSIGNMENT_NOT_CONFIRMED');

  const replaced = await setup();
  const replacedAssignment = value(await replaced.service.mutate(request(PREVIEW_OPERATIONS.adminAssign, { positionId: 'tnp-demo-position-001', workerId: 'tnp-demo-worker-006', reason: 'Synthetic replaced pass' }, 'replaced-assignment')));
  const replacedPass = value(await replaced.service.getEventPass(replacedAssignment.id));
  await arrange(replaced.store, 'replacement-worker', (records) => records.workers.push({ id: 'tnp-test-worker-008', displayName: 'Synthetic Replacement Eight', role: 'Event Coordinator', assessmentScore: 90, standing: 'good', approved: true }));
  value(await replaced.service.mutate(request(PREVIEW_OPERATIONS.replaceAssignment, { assignmentId: replacedAssignment.id, replacementWorkerId: 'tnp-test-worker-008', reason: 'Synthetic replacement before scan' }, 'replace-before-scan')));
  errorCode(await replaced.service.mutate(request(PREVIEW_OPERATIONS.recordAttendance, { token: replacedPass.token, eventId: replacedPass.eventId, evidenceState: 'recorded' }, 'scan-replaced')), 'ASSIGNMENT_INACTIVE');

  const snapshot = await setup();
  const snapAssignment = value(await snapshot.service.mutate(request(PREVIEW_OPERATIONS.adminAssign, { positionId: 'tnp-demo-position-001', workerId: 'tnp-demo-worker-006', reason: 'Snapshot rate' }, 'snapshot-assignment')));
  assert.deepEqual([snapAssignment.payRatePaiseSnapshot, snapAssignment.payUnitSnapshot], [250000, 'day']);
  await arrange(snapshot.store, 'rate-change', (records) => { records.positions.find((item) => item.id === 'tnp-demo-position-001').payRatePaise = 999999; });
  const snapPass = value(await snapshot.service.getEventPass(snapAssignment.id));
  value(await snapshot.service.mutate(request(PREVIEW_OPERATIONS.recordAttendance, { token: snapPass.token, eventId: snapPass.eventId, evidenceState: 'recorded' }, 'snapshot-attendance')));
  const snapEarning = value(await snapshot.service.listEarnings('tnp-demo-worker-006')).items[0];
  assert.deepEqual([snapEarning.estimatedGrossPaise, snapEarning.grossPaise], [250000, 250000]);
});

test('attendance corrections preserve caller evidence and invalidate or escalate dependent earnings', async () => {
  const draftCase = await setup();
  const assignment = value(await draftCase.service.mutate(request(PREVIEW_OPERATIONS.adminAssign, { positionId: 'tnp-demo-position-001', workerId: 'tnp-demo-worker-006', reason: 'Correction setup' }, 'correction-assignment')));
  const pass = value(await draftCase.service.getEventPass(assignment.id));
  const attendance = value(await draftCase.service.mutate(request(PREVIEW_OPERATIONS.recordAttendance, { token: pass.token, eventId: pass.eventId, evidenceState: 'recorded', note: 'Original recorded evidence' }, 'correction-attendance')));
  const corrected = value(await draftCase.service.mutate(request(PREVIEW_OPERATIONS.correctAttendance, { attendanceId: attendance.id, state: 'absent', evidenceState: 'gps-denied', reason: 'Supervisor confirmed absence', note: 'Caller-supplied denial evidence' }, 'correct-to-absent', 0, 'tnp-demo-supervisor-001')));
  assert.equal(corrected.evidence.state, 'gps-denied');
  assert.equal(corrected.evidence.note, 'Caller-supplied denial evidence');
  assert.equal(corrected.history.at(-1).evidence.state, 'recorded');
  const invalidated = value(await draftCase.service.listEarnings('tnp-demo-worker-006')).items[0];
  assert.deepEqual([invalidated.amountState, invalidated.status, invalidated.grossPaise, invalidated.netPaise], ['invalidated', 'invalidated', 0, 0]);
  errorCode(await draftCase.service.mutate(request(PREVIEW_OPERATIONS.approveEarning, { earningId: invalidated.id, stage: 'supervisor' }, 'approve-invalidated')), 'EARNING_NOT_APPROVABLE');

  const approvedCase = await setup();
  const approvedAssignment = value(await approvedCase.service.mutate(request(PREVIEW_OPERATIONS.adminAssign, { positionId: 'tnp-demo-position-001', workerId: 'tnp-demo-worker-006', reason: 'Approved correction setup' }, 'approved-correction-assignment')));
  const approvedPass = value(await approvedCase.service.getEventPass(approvedAssignment.id));
  const approvedAttendance = value(await approvedCase.service.mutate(request(PREVIEW_OPERATIONS.recordAttendance, { token: approvedPass.token, eventId: approvedPass.eventId, evidenceState: 'recorded' }, 'approved-correction-attendance')));
  const approvedEarning = value(await approvedCase.service.listEarnings('tnp-demo-worker-006')).items[0];
  value(await approvedCase.service.mutate(request(PREVIEW_OPERATIONS.approveEarning, { earningId: approvedEarning.id, stage: 'supervisor' }, 'approved-before-correction', 0, 'tnp-demo-supervisor-001')));
  errorCode(await approvedCase.service.mutate(request(PREVIEW_OPERATIONS.correctAttendance, { attendanceId: approvedAttendance.id, state: 'exception', evidenceState: 'outside-radius', reason: 'Late evidence conflict', distanceMetres: 700 }, 'approved-correction-attempt')), 'EARNING_ADJUSTMENT_REVIEW_REQUIRED');
  assert.equal(value(await approvedCase.service.getAttendanceHistory('tnp-demo-worker-006')).items[0].state, 'present');
});

test('worker payout queries project mixed batches without mutating the operations ledger', async () => {
  const { service, store } = await setup();
  const workerOne = value(await service.listPayouts('tnp-demo-worker-001')).items;
  assert.equal(workerOne.length, 2);
  assert.equal(workerOne.every((item) => item.workerId === 'tnp-demo-worker-001'), true);
  assert.equal(workerOne.some((item) => item.workerId === 'tnp-demo-worker-003'), false);
  const workerThree = value(await service.listPayouts('tnp-demo-worker-003')).items;
  assert.deepEqual(workerThree.map((item) => item.id), ['tnp-demo-payout-002']);
  assert.deepEqual(value(await service.listPayouts('tnp-demo-worker-006')).items, []);
  assert.equal(value(await service.listPayouts()).items.length, 5);

  await arrange(store, 'mixed-worker-payout', (records) => {
    const workerThreeEarning = records.earnings.find((item) => item.id === 'tnp-demo-earning-002');
    workerThreeEarning.grossPaise = 90000;
    workerThreeEarning.netPaise = 90000;
    const mixedBatch = records.payouts.find((item) => item.id === 'tnp-demo-payout-001');
    mixedBatch.earningIds = ['tnp-demo-earning-001', 'tnp-demo-earning-002'];
    mixedBatch.totalPaise = 315000;
  });

  const storedBeforeQueries = (await store.snapshot()).records.payouts;
  const operationsBatch = value(await service.listPayouts()).items.find((item) => item.id === 'tnp-demo-payout-001');
  assert.deepEqual(operationsBatch.earningIds, ['tnp-demo-earning-001', 'tnp-demo-earning-002']);
  assert.equal(operationsBatch.totalPaise, 315000);

  const workerOneMixed = value(await service.listPayouts('tnp-demo-worker-001')).items.find((item) => item.id === operationsBatch.id);
  assert.deepEqual(workerOneMixed.earningIds, ['tnp-demo-earning-001']);
  assert.equal(workerOneMixed.totalPaise, 225000);
  assert.equal(workerOneMixed.earningIds.includes('tnp-demo-earning-002'), false);
  assert.notEqual(workerOneMixed.totalPaise, 315000);

  const workerThreeMixed = value(await service.listPayouts('tnp-demo-worker-003')).items.find((item) => item.id === operationsBatch.id);
  assert.deepEqual(workerThreeMixed.earningIds, ['tnp-demo-earning-002']);
  assert.equal(workerThreeMixed.totalPaise, 90000);
  assert.equal(workerThreeMixed.earningIds.includes('tnp-demo-earning-001'), false);
  assert.notEqual(workerThreeMixed.totalPaise, 315000);

  assert.deepEqual((await store.snapshot()).records.payouts, storedBeforeQueries);
});

test('ordinary and reset ledgers survive reload and enforce the normative generation protocol', async () => {
  const storage = new MemoryPreviewStorage();
  const first = await setup(storage);
  const keyK = request(PREVIEW_OPERATIONS.claimOpportunity, { positionId: 'tnp-demo-position-001', workerId: 'tnp-demo-worker-006' }, 'K');
  value(await first.service.mutate(keyK));
  const reset0 = { requestKey: 'R', expectedGeneration: 0, actorId: 'tnp-test-actor' };
  const receipt0 = value(await first.service.resetPreview(reset0));
  assert.deepEqual([receipt0.fromGeneration, receipt0.toGeneration], [0, 1]);
  const replay0 = await first.service.resetPreview(reset0);
  assert.equal(replay0.ok, true);
  assert.equal(replay0.replayed, true);
  assert.equal(await first.service.getGeneration(), 1);
  errorCode(await first.service.resetPreview({ requestKey: 'R2', expectedGeneration: 0, actorId: 'tnp-test-actor' }), 'STALE_GENERATION');
  errorCode(await first.service.mutate(keyK), 'STALE_GENERATION');

  const reloaded = await setup(storage);
  const resetReloadReplay = await reloaded.service.resetPreview(reset0);
  assert.equal(resetReloadReplay.ok, true);
  assert.equal(resetReloadReplay.replayed, true);
  assert.equal(resetReloadReplay.value.resetId, receipt0.resetId);

  const generation1Claim = { ...keyK, expectedGeneration: 1 };
  value(await reloaded.service.mutate(generation1Claim));
  assert.equal((await reloaded.service.mutate(generation1Claim)).replayed, true);
  const reloadedAgain = await setup(storage);
  assert.equal((await reloadedAgain.service.mutate(generation1Claim)).replayed, true);

  const receipt1 = value(await reloadedAgain.service.resetPreview({ requestKey: 'R', expectedGeneration: 1, actorId: 'tnp-test-actor' }));
  assert.equal(receipt1.toGeneration, 2);
  const originalReplayAtGeneration2 = await reloadedAgain.service.resetPreview(reset0);
  assert.equal(originalReplayAtGeneration2.ok, true);
  assert.equal(originalReplayAtGeneration2.value.toGeneration, 1);
  assert.equal(await reloadedAgain.service.getGeneration(), 2);
});

test('same-generation reset races increment once and stale delayed work cannot overwrite reset data', async () => {
  const sameKey = await setup();
  const reset = { requestKey: 'same', expectedGeneration: 0, actorId: 'tnp-test-actor' };
  const [one, two] = await Promise.all([sameKey.service.resetPreview(reset), sameKey.service.resetPreview(reset)]);
  assert.equal(one.ok && two.ok, true);
  assert.equal([one.replayed, two.replayed].filter(Boolean).length, 1);
  assert.equal(await sameKey.service.getGeneration(), 1);

  const differentKeys = await setup();
  const race = await Promise.all([
    differentKeys.service.resetPreview({ requestKey: 'one', expectedGeneration: 0, actorId: 'tnp-test-actor' }),
    differentKeys.service.resetPreview({ requestKey: 'two', expectedGeneration: 0, actorId: 'tnp-test-actor' }),
  ]);
  assert.equal(race.filter((result) => result.ok).length, 1);
  assert.equal(race.filter((result) => !result.ok && result.error.code === 'STALE_GENERATION').length, 1);

  const delayed = await setup();
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const delayedRequest = request('delayedSyntheticMutation', { marker: 'old-generation' }, 'delayed');
  const preparation = delayed.store.prepare(delayedRequest, async () => {
    await gate;
    return 'prepared';
  });
  value(await delayed.service.resetPreview({ requestKey: 'reset-before-delay', expectedGeneration: 0, actorId: 'tnp-test-actor' }));
  release();
  const prepared = await preparation;
  const delayedResult = await delayed.store.commit(prepared.request, (records) => {
    records.metadata.label = 'SHOULD NOT COMMIT';
    return { ok: true, value: prepared.prepared };
  }, prepared.prepared);
  errorCode(delayedResult, 'STALE_GENERATION');
  assert.notEqual((await delayed.store.snapshot()).records.metadata.label, 'SHOULD NOT COMMIT');
});

test('persistence failures are not reported as success', async () => {
  class FailingStorage extends MemoryPreviewStorage {
    fail = false;
    async write(key, data) {
      if (this.fail) throw new Error('synthetic storage failure');
      await super.write(key, data);
    }
  }
  const storage = new FailingStorage();
  const { service } = await setup(storage);
  storage.fail = true;
  errorCode(await service.mutate(request(PREVIEW_OPERATIONS.submitEnquiry, { name: 'Sample', email: 'sample@example.test', message: 'Will not persist' }, 'persist-fail')), 'PERSISTENCE_ERROR');
  storage.fail = false;
  assert.equal(value(await service.listEnquiries()).items.length, 0);
  assert.equal(await storage.read(PREVIEW_STORAGE_KEY) !== null, true);
});
