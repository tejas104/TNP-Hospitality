import { PREVIEW_STORAGE_KEY } from '../contracts/preview.ts';
import type { PreviewEnvelope, ScenarioRecords, StoredResetReceipt } from '../contracts/preview.ts';

export const PREVIEW_CLOCK = '2026-09-10T09:00:00.000+05:30';
export const PREVIEW_TIMEZONE = 'Asia/Kolkata';

export function createScenarioRecords(): ScenarioRecords {
  return {
    metadata: {
      label: 'Synthetic TNP connected-preview scenario',
      clock: PREVIEW_CLOCK,
      timezone: PREVIEW_TIMEZONE,
      syntheticOnly: true,
      policyAssumptions: [
        'Preview roles and approvals do not grant production authorization.',
        'Attendance evidence is illustrative and never verifies a real location.',
        'Tax, collection and payout states are proposed display semantics only; no money moves.',
        'Sequential approval actors are synthetic samples; production separation-of-duties policy remains pending.',
      ],
    },
    variants: { global: 'ready', loading: 'loading', empty: 'empty', error: 'error' },
    venues: [
      { id: 'tnp-demo-venue-001', name: 'TNP Heritage Courtyard', city: 'Jaipur', capacity: 650, budgetBandPaise: { min: 25000000, max: 90000000 }, recommendation: 'Recommended for multi-function celebrations', isOwned: true },
      { id: 'tnp-demo-venue-002', name: 'Sample Riverside Lawn', city: 'Udaipur', capacity: 400, budgetBandPaise: { min: 18000000, max: 60000000 }, recommendation: 'Sample partner venue', isOwned: false },
    ],
    planners: [
      { id: 'tnp-demo-planner-001', displayName: 'Mehta Events & Experiences', city: 'Jaipur', recommendationScore: 92, verificationState: 'approved-sample' },
      { id: 'tnp-demo-planner-002', displayName: 'Sample Pending Planner', city: 'Delhi', recommendationScore: 71, verificationState: 'pending' },
    ],
    bookings: [
      { id: 'tnp-demo-booking-001', clientId: 'tnp-demo-client-001', venueId: 'tnp-demo-venue-001', eventName: 'Royal Wedding Experience', city: 'Jaipur', budgetPaise: 48600000, status: 'confirmed', createdAt: PREVIEW_CLOCK },
    ],
    events: [
      { id: 'tnp-demo-event-001', bookingId: 'tnp-demo-booking-001', name: 'Wedding Ceremony', startsAt: '2026-09-14T08:00:00.000+05:30', endsAt: '2026-09-14T20:00:00.000+05:30', timezone: PREVIEW_TIMEZONE, venueId: 'tnp-demo-venue-001', reportingDetails: 'Report at the sample workforce desk, North Gate', status: 'staffing' },
      { id: 'tnp-demo-event-002', bookingId: 'tnp-demo-booking-001', name: 'Reception', startsAt: '2026-09-15T16:00:00.000+05:30', endsAt: '2026-09-16T01:00:00.000+05:30', timezone: PREVIEW_TIMEZONE, venueId: 'tnp-demo-venue-001', reportingDetails: 'Report at the sample ballroom desk', status: 'planned' },
    ],
    requirements: [
      { id: 'tnp-demo-requirement-001', bookingId: 'tnp-demo-booking-001', eventId: 'tnp-demo-event-001', role: 'Event Coordinator', quantity: 6, notes: 'Sample experienced coordinator team', status: 'staffing' },
      { id: 'tnp-demo-requirement-002', bookingId: 'tnp-demo-booking-001', eventId: 'tnp-demo-event-002', role: 'Volunteer', quantity: 40, notes: 'Sample guest-flow support', status: 'submitted' },
    ],
    positions: [
      { id: 'tnp-demo-position-001', eventId: 'tnp-demo-event-001', role: 'Event Coordinator', quantity: 6, payRatePaise: 250000, payUnit: 'day', requiredAssessmentScore: 80, status: 'open' },
      { id: 'tnp-demo-position-002', eventId: 'tnp-demo-event-002', role: 'Volunteer', quantity: 40, payRatePaise: 90000, payUnit: 'event', requiredAssessmentScore: 60, status: 'open' },
      { id: 'tnp-demo-position-003', eventId: 'tnp-demo-event-001', role: 'Hostess', quantity: 1, payRatePaise: 150000, payUnit: 'day', requiredAssessmentScore: 75, status: 'full' },
      { id: 'tnp-demo-position-004', eventId: 'tnp-demo-event-002', role: 'Security', quantity: 2, payRatePaise: 120000, payUnit: 'event', requiredAssessmentScore: 70, status: 'unavailable' },
    ],
    workers: [
      { id: 'tnp-demo-worker-001', displayName: 'Rahul Sharma', role: 'Event Coordinator', assessmentScore: 94, standing: 'good', approved: true },
      { id: 'tnp-demo-worker-002', displayName: 'Neha Verma', role: 'Event Coordinator', assessmentScore: 88, standing: 'under-review', approved: true },
      { id: 'tnp-demo-worker-003', displayName: 'Amit Patel', role: 'Volunteer', assessmentScore: 79, standing: 'good', approved: true },
      { id: 'tnp-demo-worker-004', displayName: 'Sample Ineligible Worker', role: 'Volunteer', assessmentScore: 42, standing: 'good', approved: false },
      { id: 'tnp-demo-worker-005', displayName: 'Sample Hostess', role: 'Hostess', assessmentScore: 90, standing: 'good', approved: true },
      { id: 'tnp-demo-worker-006', displayName: 'Sample Replacement', role: 'Event Coordinator', assessmentScore: 91, standing: 'good', approved: true },
      { id: 'tnp-demo-worker-007', displayName: 'Sample Pending Coordinator', role: 'Event Coordinator', assessmentScore: 86, standing: 'good', approved: true },
    ],
    assignments: [
      { id: 'tnp-demo-assignment-001', eventId: 'tnp-demo-event-001', positionId: 'tnp-demo-position-001', workerId: 'tnp-demo-worker-001', response: 'coming', allocationState: 'active', payRatePaiseSnapshot: 250000, payUnitSnapshot: 'day', createdAt: PREVIEW_CLOCK },
      { id: 'tnp-demo-assignment-002', eventId: 'tnp-demo-event-001', positionId: 'tnp-demo-position-001', workerId: 'tnp-demo-worker-002', response: 'coming', allocationState: 'active', payRatePaiseSnapshot: 250000, payUnitSnapshot: 'day', createdAt: PREVIEW_CLOCK },
      { id: 'tnp-demo-assignment-003', eventId: 'tnp-demo-event-002', positionId: 'tnp-demo-position-002', workerId: 'tnp-demo-worker-003', response: 'not-coming', allocationState: 'active', payRatePaiseSnapshot: 90000, payUnitSnapshot: 'event', createdAt: PREVIEW_CLOCK },
      { id: 'tnp-demo-assignment-004', eventId: 'tnp-demo-event-001', positionId: 'tnp-demo-position-003', workerId: 'tnp-demo-worker-005', response: 'coming', allocationState: 'active', payRatePaiseSnapshot: 150000, payUnitSnapshot: 'day', createdAt: PREVIEW_CLOCK },
      { id: 'tnp-demo-assignment-005', eventId: 'tnp-demo-event-001', positionId: 'tnp-demo-position-001', workerId: 'tnp-demo-worker-007', response: 'pending', allocationState: 'active', payRatePaiseSnapshot: 250000, payUnitSnapshot: 'day', createdAt: PREVIEW_CLOCK },
    ],
    attendances: [
      { id: 'tnp-demo-attendance-001', eventId: 'tnp-demo-event-001', assignmentId: 'tnp-demo-assignment-002', workerId: 'tnp-demo-worker-002', state: 'exception', evidence: { state: 'gps-denied', capturedAt: '2026-09-14T07:55:00.000+05:30', distanceMetres: null, note: 'GPS permission denied in synthetic preview' }, history: [] },
      { id: 'tnp-demo-attendance-002', eventId: 'tnp-demo-event-001', assignmentId: 'tnp-demo-assignment-001', workerId: 'tnp-demo-worker-001', state: 'present', evidence: { state: 'recorded', capturedAt: '2026-09-14T07:52:00.000+05:30', distanceMetres: null, note: 'Sample attendance state; location not verified' }, history: [{ id: 'tnp-demo-attendance-history-001', actorId: 'tnp-demo-ops-001', reason: 'Corrected after sample supervisor roll call', evidence: { state: 'gps-missing', capturedAt: '2026-09-14T07:50:00.000+05:30', distanceMetres: null, note: 'Original sample evidence unavailable' }, recordedAt: '2026-09-14T08:05:00.000+05:30' }] },
      { id: 'tnp-demo-attendance-003', eventId: 'tnp-demo-event-001', assignmentId: 'tnp-demo-assignment-004', workerId: 'tnp-demo-worker-005', state: 'exception', evidence: { state: 'outside-radius', capturedAt: '2026-09-14T07:58:00.000+05:30', distanceMetres: 480, note: 'Synthetic outside-radius evidence; no real location verified' }, history: [] },
    ],
    earnings: [
      { id: 'tnp-demo-earning-001', assignmentId: 'tnp-demo-assignment-001', attendanceId: 'tnp-demo-attendance-002', workerId: 'tnp-demo-worker-001', estimatedGrossPaise: 250000, grossPaise: 250000, deductionsPaise: 25000, netPaise: 225000, proposedTaxLabel: 'Proposed preview deduction', amountState: 'earned', status: 'processing', supervisorApproval: null, financeApproval: null },
      { id: 'tnp-demo-earning-002', assignmentId: 'tnp-demo-assignment-003', attendanceId: null, workerId: 'tnp-demo-worker-003', estimatedGrossPaise: 90000, grossPaise: 0, deductionsPaise: 0, netPaise: 0, proposedTaxLabel: 'No proposed deduction', amountState: 'invalidated', status: 'invalidated', supervisorApproval: null, financeApproval: null },
      { id: 'tnp-demo-earning-003', assignmentId: 'tnp-demo-assignment-002', attendanceId: 'tnp-demo-attendance-001', workerId: 'tnp-demo-worker-002', estimatedGrossPaise: 250000, grossPaise: 0, deductionsPaise: 0, netPaise: 0, proposedTaxLabel: 'Pending attendance verification', amountState: 'estimated', status: 'pending-verification', supervisorApproval: null, financeApproval: null },
      { id: 'tnp-demo-earning-004', assignmentId: 'tnp-demo-assignment-004', attendanceId: 'tnp-demo-attendance-003', workerId: 'tnp-demo-worker-005', estimatedGrossPaise: 150000, grossPaise: 0, deductionsPaise: 0, netPaise: 0, proposedTaxLabel: 'Pending attendance verification', amountState: 'estimated', status: 'pending-verification', supervisorApproval: null, financeApproval: null },
    ],
    payouts: [
      { id: 'tnp-demo-payout-001', workerId: 'tnp-demo-worker-001', month: '2026-09', earningIds: ['tnp-demo-earning-001'], totalPaise: 225000, status: 'processing' },
      { id: 'tnp-demo-payout-002', workerId: 'tnp-demo-worker-003', month: '2026-08', earningIds: [], totalPaise: 0, status: 'uncertain' },
      { id: 'tnp-demo-payout-003', workerId: 'tnp-demo-worker-002', month: '2026-07', earningIds: [], totalPaise: 0, status: 'failed' },
      { id: 'tnp-demo-payout-004', workerId: 'tnp-demo-worker-005', month: '2026-06', earningIds: [], totalPaise: 0, status: 'reversed' },
      { id: 'tnp-demo-payout-005', workerId: 'tnp-demo-worker-001', month: '2026-05', earningIds: [], totalPaise: 180000, status: 'paid' },
    ],
    quotes: [
      { id: 'tnp-demo-quote-001', bookingId: 'tnp-demo-booking-001', version: 2, issuingEntity: 'TNP Hospitality Preview Entity', lines: [{ id: 'tnp-demo-quote-line-001', label: 'Sample workforce package', quantity: 1, unitPaise: 48600000, totalPaise: 48600000 }], totalPaise: 48600000, status: 'revised', revisionReason: 'Sample scope updated' },
    ],
    collections: [
      { id: 'tnp-demo-collection-001', bookingId: 'tnp-demo-booking-001', amountPaise: 10000000, status: 'processing', reference: 'SAMPLE-REF-001' },
      { id: 'tnp-demo-collection-002', bookingId: 'tnp-demo-booking-001', amountPaise: 5000000, status: 'failed', reference: 'SAMPLE-REF-002' },
      { id: 'tnp-demo-collection-003', bookingId: 'tnp-demo-booking-001', amountPaise: 2500000, status: 'uncertain', reference: 'SAMPLE-REF-003' },
      { id: 'tnp-demo-collection-004', bookingId: 'tnp-demo-booking-001', amountPaise: 0, status: 'unpaid', reference: null },
      { id: 'tnp-demo-collection-005', bookingId: 'tnp-demo-booking-001', amountPaise: 2000000, status: 'paid', reference: 'SAMPLE-REF-005' },
    ],
    applications: [
      { id: 'tnp-demo-application-001', applicantId: 'tnp-demo-worker-004', role: 'Volunteer', status: 'pending', reviewReason: null },
      { id: 'tnp-demo-application-002', applicantId: 'tnp-demo-applicant-invalid', role: '', status: 'invalid', reviewReason: 'Role is required' },
      { id: 'tnp-demo-application-003', applicantId: 'tnp-demo-applicant-rejected', role: 'Hostess', status: 'rejected', reviewReason: 'Sample assessment threshold not met' },
      { id: 'tnp-demo-application-004', applicantId: 'tnp-demo-worker-005', role: 'Hostess', status: 'approved-sample', reviewReason: 'Sample human review completed' },
    ],
    assessments: [{ id: 'tnp-demo-assessment-001', applicantId: 'tnp-demo-worker-004', score: 42, status: 'failed' }],
    enquiries: [],
    ratings: [
      { id: 'tnp-demo-rating-001', workerId: 'tnp-demo-worker-001', eventId: 'tnp-demo-event-001', score: 4.8, note: 'Reliable sample performance' },
      { id: 'tnp-demo-rating-002', workerId: 'tnp-demo-worker-002', eventId: 'tnp-demo-event-001', score: 3.1, note: 'Under human review; not permanently blocked' },
    ],
    guestSummaries: [{ id: 'tnp-demo-guests-001', bookingId: 'tnp-demo-booking-001', eventId: 'tnp-demo-event-001', expectedGuests: 450, rsvpYes: 312, rsvpNo: 28, rsvpPending: 110 }],
    passes: [
      { id: 'tnp-demo-pass-001', eventId: 'tnp-demo-event-001', assignmentId: 'tnp-demo-assignment-001', token: 'TNP-SAMPLE-EVENT-001', expiresAt: '2026-09-15T02:00:00.000+05:30' },
      { id: 'tnp-demo-pass-002', eventId: 'tnp-demo-event-001', assignmentId: 'tnp-demo-assignment-002', token: 'TNP-SAMPLE-EVENT-002', expiresAt: '2026-09-15T02:00:00.000+05:30' },
      { id: 'tnp-demo-pass-expired', eventId: 'tnp-demo-event-002', assignmentId: 'tnp-demo-assignment-003', token: 'TNP-SAMPLE-EXPIRED', expiresAt: '2026-09-01T02:00:00.000+05:30' },
    ],
    audit: [{ id: 'tnp-demo-audit-001', actorId: 'tnp-demo-ops-001', action: 'attendance.corrected', reason: 'Corrected after sample supervisor roll call', createdAt: '2026-09-14T08:05:00.000+05:30', entityId: 'tnp-demo-attendance-002' }],
  };
}

export function createPreviewEnvelope(
  generation = 0,
  resetReceipts: Record<string, StoredResetReceipt> = {},
): PreviewEnvelope {
  return {
    storageVersion: PREVIEW_STORAGE_KEY,
    generation,
    records: createScenarioRecords(),
    ordinaryRequestLedger: {},
    resetReceipts: structuredClone(resetReceipts),
  };
}
