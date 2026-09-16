import type {
  Application,
  Assignment,
  Attendance,
  AuditEntry,
  Booking,
  Collection,
  Earning,
  GuestSummary,
  MutationRequest,
  Opportunity,
  Paginated,
  Planner,
  Position,
  PreviewEvent,
  PreviewOutcome,
  PreviewService,
  PreviewVariant,
  QueryOptions,
  Quote,
  QuoteLine,
  Rating,
  Requirement,
  ResetPreviewRequest,
  ScenarioRecords,
  Venue,
  Worker,
} from '../contracts/preview.ts';
import { PreviewStore, previewError } from './store.ts';

export const PREVIEW_OPERATIONS = {
  submitBooking: 'submitBooking',
  registerPlanner: 'registerPlanner',
  submitRequirement: 'submitRequirement',
  submitEnquiry: 'submitEnquiry',
  registerApplicant: 'registerApplicant',
  submitAssessment: 'submitAssessment',
  claimOpportunity: 'claimOpportunity',
  respondToAssignment: 'respondToAssignment',
  reviewApplication: 'reviewApplication',
  changeRole: 'changeRole',
  recordAttendance: 'recordAttendance',
  correctAttendance: 'correctAttendance',
  markNonresponse: 'markNonresponse',
  adminAssign: 'adminAssign',
  replaceAssignment: 'replaceAssignment',
  clientApproveQuote: 'clientApproveQuote',
  clientRequestQuoteRevision: 'clientRequestQuoteRevision',
  reviseQuote: 'reviseQuote',
  adjustEarning: 'adjustEarning',
  approveEarning: 'approveEarning',
  setPreviewVariant: 'setPreviewVariant',
} as const;

export type PreviewOperation = (typeof PREVIEW_OPERATIONS)[keyof typeof PREVIEW_OPERATIONS];

function page<T>(items: T[]): Paginated<T> {
  return { items, nextCursor: null };
}

function ok<T>(value: T) {
  return { ok: true as const, value };
}

function fail(code: string, message: string, fieldErrors?: Record<string, string>, retryable = false) {
  return { ok: false as const, error: previewError(code, message, retryable, fieldErrors) };
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function stringField(payload: Record<string, unknown>, name: string) {
  return typeof payload[name] === 'string' ? String(payload[name]).trim() : '';
}

function integerField(payload: Record<string, unknown>, name: string) {
  return Number.isInteger(payload[name]) ? Number(payload[name]) : NaN;
}

function queryFailure(code: string, generation: number): PreviewOutcome<never> {
  const loading = code === 'PREVIEW_LOADING';
  return {
    ok: false,
    error: previewError(code, loading ? 'Synthetic preview state is loading.' : 'Synthetic preview error requested.', true),
    generation,
    replayed: false,
  };
}

function activeAssignments(records: ScenarioRecords, positionId: string) {
  return records.assignments.filter((item) => item.positionId === positionId && item.allocationState === 'active' && item.response !== 'not-coming');
}

function overlaps(records: ScenarioRecords, workerId: string, eventId: string) {
  const event = records.events.find((item) => item.id === eventId);
  if (!event) return false;
  return records.assignments.some((assignment) => {
    if (assignment.workerId !== workerId || assignment.allocationState !== 'active' || assignment.response === 'not-coming') return false;
    const assignedEvent = records.events.find((item) => item.id === assignment.eventId);
    return assignedEvent ? assignedEvent.startsAt < event.endsAt && assignedEvent.endsAt > event.startsAt : false;
  });
}

function workerEligibility(worker: Worker | undefined, position: Position | undefined) {
  if (!worker || !position) return 'Worker or position was not found.';
  if (!worker.approved) return 'Worker is not approved in the synthetic scenario.';
  if (worker.assessmentScore < position.requiredAssessmentScore) return 'Assessment threshold is not met.';
  if (worker.role !== position.role) return `Role ${worker.role} does not match ${position.role}.`;
  return 'Eligible in the synthetic scenario.';
}

export class DemoPreviewService implements PreviewService {
  readonly store: PreviewStore;

  constructor(store: PreviewStore) {
    this.store = store;
  }

  getGeneration() {
    return this.store.generation();
  }

  async getScenarioMetadata() {
    return (await this.store.snapshot()).records.metadata;
  }

  private async query<T>(key: string, options: QueryOptions | undefined, ready: (records: ScenarioRecords) => T, empty: T): Promise<PreviewOutcome<T>> {
    const envelope = await this.store.snapshot();
    const variant: PreviewVariant = options?.variant ?? envelope.records.variants[key] ?? envelope.records.variants.global ?? 'ready';
    if (variant === 'loading') return queryFailure('PREVIEW_LOADING', envelope.generation);
    if (variant === 'error') return queryFailure('PREVIEW_QUERY_ERROR', envelope.generation);
    return { ok: true, value: variant === 'empty' ? empty : ready(envelope.records), generation: envelope.generation, replayed: false };
  }

  private async one<T>(key: string, options: QueryOptions | undefined, ready: (records: ScenarioRecords) => T | undefined, missingMessage: string): Promise<PreviewOutcome<T>> {
    const envelope = await this.store.snapshot();
    const variant = options?.variant ?? envelope.records.variants[key] ?? envelope.records.variants.global ?? 'ready';
    if (variant === 'loading') return queryFailure('PREVIEW_LOADING', envelope.generation);
    if (variant === 'error') return queryFailure('PREVIEW_QUERY_ERROR', envelope.generation);
    const value = variant === 'empty' ? undefined : ready(envelope.records);
    if (!value) return { ok: false, error: previewError('NOT_FOUND', missingMessage), generation: envelope.generation, replayed: false };
    return { ok: true, value, generation: envelope.generation, replayed: false };
  }

  listVenues(options?: QueryOptions) { return this.query('venues', options, (r) => page(r.venues), page<Venue>([])); }
  listPlanners(options?: QueryOptions) { return this.query('planners', options, (r) => page(r.planners), page<Planner>([])); }
  listBookings(options?: QueryOptions) { return this.query('bookings', options, (r) => page(r.bookings), page<Booking>([])); }
  getBooking(id: string, options?: QueryOptions) { return this.one('bookings', options, (r) => r.bookings.find((x) => x.id === id), 'Booking not found.'); }
  listRequirements(options?: QueryOptions & { eventId?: string }) { return this.query('requirements', options, (r) => page(r.requirements.filter((x) => !options?.eventId || x.eventId === options.eventId)), page<Requirement>([])); }
  getRequirement(id: string, options?: QueryOptions) { return this.one('requirements', options, (r) => r.requirements.find((x) => x.id === id), 'Requirement not found.'); }
  listEvents(options?: QueryOptions) { return this.query('events', options, (r) => page(r.events), page<PreviewEvent>([])); }
  getEvent(id: string, options?: QueryOptions) { return this.one('events', options, (r) => r.events.find((x) => x.id === id), 'Event not found.'); }
  listPositions(eventId?: string, options?: QueryOptions) { return this.query('positions', options, (r) => page(r.positions.filter((x) => !eventId || x.eventId === eventId)), page<Position>([])); }
  getPosition(id: string, options?: QueryOptions) { return this.one('positions', options, (r) => r.positions.find((x) => x.id === id), 'Position not found.'); }
  getQuote(id: string, options?: QueryOptions) { return this.one('quotes', options, (r) => r.quotes.find((x) => x.id === id), 'Quotation not found.'); }
  listQuotes(bookingId?: string, options?: QueryOptions) { return this.query('quotes', options, (r) => page(r.quotes.filter((x) => !bookingId || x.bookingId === bookingId)), page<Quote>([])); }
  listCollections(bookingId?: string, options?: QueryOptions) { return this.query('collections', options, (r) => page(r.collections.filter((x) => !bookingId || x.bookingId === bookingId)), page<Collection>([])); }
  listApplications(options?: QueryOptions) { return this.query('applications', options, (r) => page(r.applications), page<Application>([])); }
  listAssessments(applicantId?: string, options?: QueryOptions) { return this.query('assessments', options, (r) => page(r.assessments.filter((x) => !applicantId || x.applicantId === applicantId)), page([])); }
  listEnquiries(options?: QueryOptions) { return this.query('enquiries', options, (r) => page(r.enquiries), page([])); }
  listGuestSummaries(bookingId?: string, options?: QueryOptions) { return this.query('guestSummaries', options, (r) => page(r.guestSummaries.filter((x) => !bookingId || x.bookingId === bookingId)), page<GuestSummary>([])); }

  listOpportunities(workerId: string, options?: QueryOptions) {
    return this.query('opportunities', options, (r) => page(r.positions.map((p) => this.opportunity(r, p, workerId))), page<Opportunity>([]));
  }

  getOpportunity(positionId: string, workerId: string, options?: QueryOptions) {
    return this.one('opportunities', options, (r) => {
      const position = r.positions.find((x) => x.id === positionId);
      return position ? this.opportunity(r, position, workerId) : undefined;
    }, 'Opportunity not found.');
  }

  listAssignments(workerId?: string, options?: QueryOptions) { return this.query('assignments', options, (r) => page(r.assignments.filter((x) => !workerId || x.workerId === workerId)), page<Assignment>([])); }
  listRoster(eventId: string, options?: QueryOptions) { return this.query('roster', options, (r) => page(r.assignments.filter((x) => x.eventId === eventId && x.allocationState === 'active')), page<Assignment>([])); }
  getEventPass(assignmentId: string, options?: QueryOptions) { return this.one('passes', options, (r) => r.passes.find((x) => x.assignmentId === assignmentId), 'Event pass not found.'); }
  getAttendanceHistory(workerId: string, options?: QueryOptions) { return this.query('attendance', options, (r) => page(r.attendances.filter((x) => x.workerId === workerId)), page<Attendance>([])); }
  getEarning(id: string, options?: QueryOptions) { return this.one('earnings', options, (r) => r.earnings.find((x) => x.id === id), 'Earning not found.'); }
  listEarnings(workerId?: string, options?: QueryOptions) { return this.query('earnings', options, (r) => page(r.earnings.filter((x) => !workerId || x.workerId === workerId)), page<Earning>([])); }
  listPayouts(_workerId?: string, options?: QueryOptions) { return this.query('payouts', options, (r) => page(r.payouts), page([])); }
  listRatings(workerId: string, options?: QueryOptions) { return this.query('ratings', options, (r) => page(r.ratings.filter((x) => x.workerId === workerId)), page<Rating>([])); }
  getStanding(workerId: string, options?: QueryOptions) { return this.one('workers', options, (r) => r.workers.find((x) => x.id === workerId), 'Worker not found.'); }
  listAudit(options?: QueryOptions) { return this.query('audit', options, (r) => page(r.audit), page<AuditEntry>([])); }

  getMetrics(options?: QueryOptions) {
    return this.query('metrics', options, (r) => ({
      events: r.events.length,
      positions: r.positions.reduce((sum, item) => sum + item.quantity, 0),
      activeAssignments: r.assignments.filter((x) => x.allocationState === 'active').length,
      coming: r.assignments.filter((x) => x.response === 'coming' && x.allocationState === 'active').length,
      attendanceExceptions: r.attendances.filter((x) => x.state === 'exception').length,
    }), { events: 0, positions: 0, activeAssignments: 0, coming: 0, attendanceExceptions: 0 });
  }

  mutate<Operation extends string, Payload>(request: MutationRequest<Operation, Payload>): Promise<PreviewOutcome<unknown>> {
    return this.store.commit<unknown>(request as MutationRequest<string, unknown>, (records) => this.reduce(records, request.operation, record(request.payload), request.actorId));
  }

  resetPreview(request: ResetPreviewRequest) {
    return this.store.reset(request);
  }

  private opportunity(records: ScenarioRecords, position: Position, workerId: string): Opportunity {
    const event = records.events.find((x) => x.id === position.eventId)!;
    const venue = records.venues.find((x) => x.id === event.venueId)!;
    const filledQuantity = activeAssignments(records, position.id).length;
    const availability = position.status === 'unavailable' ? 'unavailable' : filledQuantity >= position.quantity || position.status === 'full' ? 'full' : 'available';
    return {
      id: `tnp-demo-opportunity-${position.id}`,
      eventId: event.id,
      positionId: position.id,
      role: position.role,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      timezone: event.timezone,
      venueId: venue.id,
      venueName: venue.name,
      reportingDetails: event.reportingDetails,
      payRatePaise: position.payRatePaise,
      payUnit: position.payUnit,
      requiredQuantity: position.quantity,
      filledQuantity,
      availability,
      eligibilityReason: workerEligibility(records.workers.find((x) => x.id === workerId), position),
    };
  }

  private reduce(records: ScenarioRecords, operation: string, payload: Record<string, unknown>, actorId: string) {
    switch (operation) {
      case PREVIEW_OPERATIONS.submitBooking: return this.submitBooking(records, payload);
      case PREVIEW_OPERATIONS.registerPlanner: return this.registerPlanner(records, payload);
      case PREVIEW_OPERATIONS.submitRequirement: return this.submitRequirement(records, payload);
      case PREVIEW_OPERATIONS.submitEnquiry: return this.submitEnquiry(records, payload);
      case PREVIEW_OPERATIONS.registerApplicant: return this.registerApplicant(records, payload);
      case PREVIEW_OPERATIONS.submitAssessment: return this.submitAssessment(records, payload);
      case PREVIEW_OPERATIONS.claimOpportunity: return this.allocate(records, payload, actorId, false);
      case PREVIEW_OPERATIONS.adminAssign: return this.allocate(records, payload, actorId, true);
      case PREVIEW_OPERATIONS.respondToAssignment: return this.respond(records, payload);
      case PREVIEW_OPERATIONS.reviewApplication: return this.reviewApplication(records, payload, actorId);
      case PREVIEW_OPERATIONS.changeRole: return this.changeRole(records, payload, actorId);
      case PREVIEW_OPERATIONS.recordAttendance: return this.recordAttendance(records, payload, actorId);
      case PREVIEW_OPERATIONS.correctAttendance: return this.correctAttendance(records, payload, actorId);
      case PREVIEW_OPERATIONS.markNonresponse: return this.markNonresponse(records, payload, actorId);
      case PREVIEW_OPERATIONS.replaceAssignment: return this.replaceAssignment(records, payload, actorId);
      case PREVIEW_OPERATIONS.clientApproveQuote: return this.clientApproveQuote(records, payload);
      case PREVIEW_OPERATIONS.clientRequestQuoteRevision: return this.clientRequestQuoteRevision(records, payload);
      case PREVIEW_OPERATIONS.reviseQuote: return this.reviseQuote(records, payload, actorId);
      case PREVIEW_OPERATIONS.adjustEarning: return this.adjustEarning(records, payload, actorId);
      case PREVIEW_OPERATIONS.approveEarning: return this.approveEarning(records, payload, actorId);
      case PREVIEW_OPERATIONS.setPreviewVariant: return this.setVariant(records, payload);
      default: return fail('UNSUPPORTED_OPERATION', `Unsupported preview operation: ${operation}`);
    }
  }

  private submitBooking(records: ScenarioRecords, payload: Record<string, unknown>) {
    const venueId = stringField(payload, 'venueId');
    const eventName = stringField(payload, 'eventName');
    const city = stringField(payload, 'city');
    const budgetPaise = integerField(payload, 'budgetPaise');
    const fields: Record<string, string> = {};
    if (!records.venues.some((x) => x.id === venueId)) fields.venueId = 'Choose a sample venue.';
    if (!eventName) fields.eventName = 'Event name is required.';
    if (!city) fields.city = 'City is required.';
    if (!Number.isInteger(budgetPaise) || budgetPaise < 0) fields.budgetPaise = 'Budget must be integer paise.';
    if (Object.keys(fields).length) return fail('VALIDATION_ERROR', 'Booking validation failed.', fields);
    const booking: Booking = { id: `tnp-demo-booking-${String(records.bookings.length + 1).padStart(3, '0')}`, clientId: stringField(payload, 'clientId') || 'tnp-demo-client-preview', venueId, eventName, city, budgetPaise, status: payload.status === 'draft' ? 'draft' : 'submitted', createdAt: records.metadata.clock };
    records.bookings.push(booking);
    return ok(booking);
  }

  private registerPlanner(records: ScenarioRecords, payload: Record<string, unknown>) {
    const displayName = stringField(payload, 'displayName');
    const city = stringField(payload, 'city');
    if (!displayName || !city) return fail('VALIDATION_ERROR', 'Planner name and city are required.', { ...(!displayName ? { displayName: 'Required.' } : {}), ...(!city ? { city: 'Required.' } : {}) });
    const planner: Planner = { id: `tnp-demo-planner-${String(records.planners.length + 1).padStart(3, '0')}`, displayName, city, recommendationScore: 0, verificationState: 'pending' };
    records.planners.push(planner);
    return ok(planner);
  }

  private submitRequirement(records: ScenarioRecords, payload: Record<string, unknown>) {
    const bookingId = stringField(payload, 'bookingId');
    const eventId = stringField(payload, 'eventId');
    const role = stringField(payload, 'role');
    const quantity = integerField(payload, 'quantity');
    if (!records.bookings.some((x) => x.id === bookingId) || !records.events.some((x) => x.id === eventId) || !role || quantity < 1) return fail('VALIDATION_ERROR', 'Requirement must link a booking/event and include a role and positive quantity.');
    const requirement: Requirement = { id: `tnp-demo-requirement-${String(records.requirements.length + 1).padStart(3, '0')}`, bookingId, eventId, role, quantity, notes: stringField(payload, 'notes'), status: payload.status === 'draft' ? 'draft' : 'submitted' };
    records.requirements.push(requirement);
    return ok(requirement);
  }

  private submitEnquiry(records: ScenarioRecords, payload: Record<string, unknown>) {
    const name = stringField(payload, 'name');
    const email = stringField(payload, 'email');
    const message = stringField(payload, 'message');
    if (!name || !email.includes('@') || !message) return fail('VALIDATION_ERROR', 'Name, a sample email shape and message are required.', { ...(!name ? { name: 'Required.' } : {}), ...(!email.includes('@') ? { email: 'Use a valid sample email shape.' } : {}), ...(!message ? { message: 'Required.' } : {}) });
    const enquiry = { id: `tnp-demo-enquiry-${String(records.enquiries.length + 1).padStart(3, '0')}`, name, email, message, createdAt: records.metadata.clock, sentExternally: false as const };
    records.enquiries.push(enquiry);
    return ok(enquiry);
  }

  private registerApplicant(records: ScenarioRecords, payload: Record<string, unknown>) {
    const applicantId = stringField(payload, 'applicantId');
    const role = stringField(payload, 'role');
    if (!applicantId || !role) return fail('VALIDATION_ERROR', 'Applicant and role are required.');
    const application: Application = { id: `tnp-demo-application-${String(records.applications.length + 1).padStart(3, '0')}`, applicantId, role, status: 'pending', reviewReason: null };
    records.applications.push(application);
    if (!records.workers.some((x) => x.id === applicantId)) records.workers.push({ id: applicantId, displayName: stringField(payload, 'displayName') || 'Sample Applicant', role, assessmentScore: 0, standing: 'good', approved: false });
    return ok(application);
  }

  private submitAssessment(records: ScenarioRecords, payload: Record<string, unknown>) {
    const applicantId = stringField(payload, 'applicantId');
    const score = integerField(payload, 'score');
    if (!records.applications.some((x) => x.applicantId === applicantId) || score < 0 || score > 100) return fail('VALIDATION_ERROR', 'Assessment requires an applicant and score from 0 to 100.');
    const assessment = { id: `tnp-demo-assessment-${String(records.assessments.length + 1).padStart(3, '0')}`, applicantId, score, status: score >= 60 ? 'passed' as const : 'failed' as const };
    records.assessments.push(assessment);
    const worker = records.workers.find((x) => x.id === applicantId);
    if (worker) worker.assessmentScore = score;
    return ok(assessment);
  }

  private allocate(records: ScenarioRecords, payload: Record<string, unknown>, actorId: string, admin: boolean) {
    const positionId = stringField(payload, 'positionId');
    const workerId = stringField(payload, 'workerId') || actorId;
    const position = records.positions.find((x) => x.id === positionId);
    const worker = records.workers.find((x) => x.id === workerId);
    if (!position || !worker) return fail('NOT_FOUND', 'Worker or position not found.');
    if (records.assignments.some((x) => x.positionId === positionId && x.workerId === workerId && x.allocationState === 'active')) return fail('DUPLICATE_CLAIM', 'This worker already has the position.');
    const reason = workerEligibility(worker, position);
    if (!reason.startsWith('Eligible')) return fail('INELIGIBLE', reason);
    if (position.status === 'unavailable' || activeAssignments(records, position.id).length >= position.quantity || position.status === 'full') return fail('POSITION_FULL', 'The opportunity is full or unavailable.');
    if (overlaps(records, workerId, position.eventId)) return fail('OVERLAP', 'The worker already has an overlapping active assignment.');
    const assignment: Assignment = { id: `tnp-demo-assignment-${String(records.assignments.length + 1).padStart(3, '0')}`, eventId: position.eventId, positionId, workerId, response: admin ? 'coming' : 'pending', allocationState: 'active', createdAt: records.metadata.clock };
    records.assignments.push(assignment);
    if (admin) this.ensureEventPass(records, assignment);
    records.audit.push({ id: `tnp-demo-audit-${records.audit.length + 1}`, actorId, action: admin ? 'assignment.admin-created' : 'opportunity.claimed', reason: admin ? stringField(payload, 'reason') || 'Sample administrator allocation' : 'Worker claimed sample opportunity', createdAt: records.metadata.clock, entityId: assignment.id });
    return ok(assignment);
  }

  private respond(records: ScenarioRecords, payload: Record<string, unknown>) {
    const assignment = records.assignments.find((x) => x.id === stringField(payload, 'assignmentId'));
    const response = payload.response;
    if (!assignment) return fail('NOT_FOUND', 'Assignment not found.');
    if (response !== 'coming' && response !== 'not-coming') return fail('VALIDATION_ERROR', 'Response must be coming or not-coming.');
    assignment.response = response;
    if (response === 'coming') this.ensureEventPass(records, assignment);
    return ok(assignment);
  }

  private reviewApplication(records: ScenarioRecords, payload: Record<string, unknown>, actorId: string) {
    const application = records.applications.find((x) => x.id === stringField(payload, 'applicationId'));
    const decision = payload.decision;
    const reason = stringField(payload, 'reason');
    if (!application) return fail('NOT_FOUND', 'Application not found.');
    if ((decision !== 'approved-sample' && decision !== 'rejected') || !reason) return fail('VALIDATION_ERROR', 'A human decision and reason are required.');
    application.status = decision;
    application.reviewReason = reason;
    const worker = records.workers.find((x) => x.id === application.applicantId);
    if (worker) worker.approved = decision === 'approved-sample';
    records.audit.push({ id: `tnp-demo-audit-${records.audit.length + 1}`, actorId, action: 'application.reviewed', reason, createdAt: records.metadata.clock, entityId: application.id });
    return ok(application);
  }

  private changeRole(records: ScenarioRecords, payload: Record<string, unknown>, actorId: string) {
    const worker = records.workers.find((x) => x.id === stringField(payload, 'workerId'));
    const role = stringField(payload, 'role');
    const reason = stringField(payload, 'reason');
    if (!worker) return fail('NOT_FOUND', 'Worker not found.');
    if (!role || !reason) return fail('VALIDATION_ERROR', 'Role and reason are required.');
    worker.role = role;
    records.audit.push({ id: `tnp-demo-audit-${records.audit.length + 1}`, actorId, action: 'worker.role-changed', reason, createdAt: records.metadata.clock, entityId: worker.id });
    return ok(worker);
  }

  private recordAttendance(records: ScenarioRecords, payload: Record<string, unknown>, actorId: string) {
    const pass = records.passes.find((x) => x.token === stringField(payload, 'token'));
    const eventId = stringField(payload, 'eventId');
    if (!pass || pass.eventId !== eventId) return fail('WRONG_EVENT', 'This sample pass does not belong to the event.');
    if (pass.expiresAt < records.metadata.clock) return fail('EXPIRED_PASS', 'This sample pass is expired.');
    if (records.attendances.some((x) => x.assignmentId === pass.assignmentId)) return fail('DUPLICATE_SCAN', 'Attendance has already been recorded for this assignment.');
    const assignment = records.assignments.find((x) => x.id === pass.assignmentId)!;
    const evidenceState = payload.evidenceState;
    if (!['recorded', 'gps-denied', 'gps-missing', 'outside-radius'].includes(String(evidenceState))) return fail('VALIDATION_ERROR', 'A supported evidence state is required.');
    const attendance: Attendance = { id: `tnp-demo-attendance-${String(records.attendances.length + 1).padStart(3, '0')}`, eventId, assignmentId: assignment.id, workerId: assignment.workerId, state: evidenceState === 'recorded' ? 'present' : 'exception', evidence: { state: evidenceState as Attendance['evidence']['state'], capturedAt: records.metadata.clock, distanceMetres: Number.isInteger(payload.distanceMetres) ? Number(payload.distanceMetres) : null, note: stringField(payload, 'note') || 'Synthetic attendance evidence' }, history: [] };
    records.attendances.push(attendance);
    if (!records.earnings.some((item) => item.assignmentId === assignment.id)) {
      const position = records.positions.find((item) => item.id === assignment.positionId)!;
      records.earnings.push({
        id: `tnp-demo-earning-${String(records.earnings.length + 1).padStart(3, '0')}`,
        assignmentId: assignment.id,
        workerId: assignment.workerId,
        grossPaise: position.payRatePaise,
        deductionsPaise: 0,
        netPaise: position.payRatePaise,
        proposedTaxLabel: 'No proposed preview deduction',
        status: 'draft',
      });
    }
    records.audit.push({ id: `tnp-demo-audit-${records.audit.length + 1}`, actorId, action: 'attendance.recorded', reason: attendance.evidence.note, createdAt: records.metadata.clock, entityId: attendance.id });
    return ok(attendance);
  }

  private correctAttendance(records: ScenarioRecords, payload: Record<string, unknown>, actorId: string) {
    const attendance = records.attendances.find((x) => x.id === stringField(payload, 'attendanceId'));
    const reason = stringField(payload, 'reason');
    const state = payload.state;
    if (!attendance) return fail('NOT_FOUND', 'Attendance not found.');
    if (!reason || (state !== 'present' && state !== 'absent' && state !== 'exception')) return fail('VALIDATION_ERROR', 'A correction state and reason are required.');
    attendance.history.push({ id: `tnp-demo-attendance-history-${attendance.history.length + 1}`, actorId, reason, evidence: structuredClone(attendance.evidence), recordedAt: records.metadata.clock });
    attendance.state = state;
    attendance.evidence = { state: payload.evidenceState === 'outside-radius' ? 'outside-radius' : 'gps-missing', capturedAt: records.metadata.clock, distanceMetres: null, note: `Reasoned preview correction: ${reason}` };
    records.audit.push({ id: `tnp-demo-audit-${records.audit.length + 1}`, actorId, action: 'attendance.corrected', reason, createdAt: records.metadata.clock, entityId: attendance.id });
    return ok(attendance);
  }

  private markNonresponse(records: ScenarioRecords, payload: Record<string, unknown>, actorId: string) {
    const assignment = records.assignments.find((x) => x.id === stringField(payload, 'assignmentId'));
    const reason = stringField(payload, 'reason');
    if (!assignment) return fail('NOT_FOUND', 'Assignment not found.');
    if (!reason) return fail('VALIDATION_ERROR', 'A reason is required.');
    assignment.response = 'not-coming';
    records.audit.push({ id: `tnp-demo-audit-${records.audit.length + 1}`, actorId, action: 'assignment.nonresponse', reason, createdAt: records.metadata.clock, entityId: assignment.id });
    return ok(assignment);
  }

  private replaceAssignment(records: ScenarioRecords, payload: Record<string, unknown>, actorId: string) {
    const original = records.assignments.find((x) => x.id === stringField(payload, 'assignmentId') && x.allocationState === 'active');
    const workerId = stringField(payload, 'replacementWorkerId');
    const reasonText = stringField(payload, 'reason');
    if (!original) return fail('NOT_FOUND', 'Original active assignment not found.');
    if (!reasonText) return fail('VALIDATION_ERROR', 'Replacement reason is required.');
    const position = records.positions.find((x) => x.id === original.positionId)!;
    const worker = records.workers.find((x) => x.id === workerId);
    const eligibility = workerEligibility(worker, position);
    if (!eligibility.startsWith('Eligible')) return fail('INELIGIBLE', eligibility);
    if (overlaps(records, workerId, original.eventId)) return fail('OVERLAP', 'Replacement worker has an overlapping assignment.');
    if (records.assignments.some((x) => x.workerId === workerId && x.positionId === original.positionId && x.allocationState === 'active')) return fail('DUPLICATE_CLAIM', 'Replacement worker is already allocated.');
    const activeExcludingOriginal = activeAssignments(records, position.id).filter((x) => x.id !== original.id).length;
    if (activeExcludingOriginal >= position.quantity || position.status === 'unavailable') return fail('POSITION_FULL', 'Replacement would exceed position capacity.');
    original.allocationState = 'replaced';
    const replacement: Assignment = { id: `tnp-demo-assignment-${String(records.assignments.length + 1).padStart(3, '0')}`, eventId: original.eventId, positionId: original.positionId, workerId, response: 'coming', allocationState: 'active', createdAt: records.metadata.clock };
    records.assignments.push(replacement);
    records.audit.push({ id: `tnp-demo-audit-${records.audit.length + 1}`, actorId, action: 'assignment.replaced', reason: reasonText, createdAt: records.metadata.clock, entityId: replacement.id });
    return ok({ original, replacement });
  }

  private clientApproveQuote(records: ScenarioRecords, payload: Record<string, unknown>) {
    const quote = records.quotes.find((x) => x.id === stringField(payload, 'quoteId'));
    const expectedVersion = integerField(payload, 'expectedVersion');
    if (!quote) return fail('NOT_FOUND', 'Quotation not found.');
    if (quote.version !== expectedVersion) return fail('STALE_VERSION', 'Quotation version changed.');
    quote.status = 'approved';
    return ok(quote);
  }

  private clientRequestQuoteRevision(records: ScenarioRecords, payload: Record<string, unknown>) {
    const quote = records.quotes.find((x) => x.id === stringField(payload, 'quoteId'));
    const expectedVersion = integerField(payload, 'expectedVersion');
    const reason = stringField(payload, 'reason');
    if (!quote) return fail('NOT_FOUND', 'Quotation not found.');
    if (quote.version !== expectedVersion) return fail('STALE_VERSION', 'Quotation version changed.');
    if (!reason) return fail('VALIDATION_ERROR', 'Revision reason is required.');
    quote.status = 'revision-requested';
    quote.revisionReason = reason;
    return ok(quote);
  }

  private reviseQuote(records: ScenarioRecords, payload: Record<string, unknown>, actorId: string) {
    const quote = records.quotes.find((x) => x.id === stringField(payload, 'quoteId'));
    const expectedVersion = integerField(payload, 'expectedVersion');
    const issuingEntity = stringField(payload, 'issuingEntity');
    const lines = Array.isArray(payload.lines) ? payload.lines.map(record) : [];
    if (!quote) return fail('NOT_FOUND', 'Quotation not found.');
    if (quote.version !== expectedVersion) return fail('STALE_VERSION', 'Quotation version changed.');
    if (!issuingEntity || !lines.length) return fail('VALIDATION_ERROR', 'Issuing entity and quotation lines are required.');
    const normalized: QuoteLine[] = [];
    for (const [index, line] of lines.entries()) {
      const quantity = integerField(line, 'quantity');
      const unitPaise = integerField(line, 'unitPaise');
      if (!stringField(line, 'label') || quantity < 1 || unitPaise < 0) return fail('VALIDATION_ERROR', 'Quotation line money must be nonnegative integer paise.');
      normalized.push({ id: stringField(line, 'id') || `tnp-demo-quote-line-${index + 1}`, label: stringField(line, 'label'), quantity, unitPaise, totalPaise: quantity * unitPaise });
    }
    quote.version += 1;
    quote.issuingEntity = issuingEntity;
    quote.lines = normalized;
    quote.totalPaise = normalized.reduce((sum, line) => sum + line.totalPaise, 0);
    quote.status = 'revised';
    records.audit.push({ id: `tnp-demo-audit-${records.audit.length + 1}`, actorId, action: 'quote.revised', reason: stringField(payload, 'reason') || 'Sample Operations revision', createdAt: records.metadata.clock, entityId: quote.id });
    return ok(quote);
  }

  private adjustEarning(records: ScenarioRecords, payload: Record<string, unknown>, actorId: string) {
    const earning = records.earnings.find((x) => x.id === stringField(payload, 'earningId'));
    const grossPaise = integerField(payload, 'grossPaise');
    const deductionsPaise = integerField(payload, 'deductionsPaise');
    const reason = stringField(payload, 'reason');
    if (!earning) return fail('NOT_FOUND', 'Earning not found.');
    if (records.payouts.some((x) => x.earningIds.includes(earning.id) && x.status === 'processing')) return fail('IMMUTABLE_PROCESSING_BATCH', 'Earning is in a processing payout batch.');
    if (grossPaise < 0 || deductionsPaise < 0 || deductionsPaise > grossPaise || !reason) return fail('VALIDATION_ERROR', 'Integer gross/deductions and a reason are required.');
    earning.grossPaise = grossPaise;
    earning.deductionsPaise = deductionsPaise;
    earning.netPaise = grossPaise - deductionsPaise;
    earning.status = 'draft';
    records.audit.push({ id: `tnp-demo-audit-${records.audit.length + 1}`, actorId, action: 'earning.adjusted', reason, createdAt: records.metadata.clock, entityId: earning.id });
    return ok(earning);
  }

  private approveEarning(records: ScenarioRecords, payload: Record<string, unknown>, actorId: string) {
    const earning = records.earnings.find((x) => x.id === stringField(payload, 'earningId'));
    const stage = payload.stage;
    if (!earning) return fail('NOT_FOUND', 'Earning not found.');
    if (stage === 'supervisor') {
      if (earning.status !== 'draft') return fail('APPROVAL_ORDER', 'Supervisor approval requires draft state.');
      earning.status = 'supervisor-approved';
    } else if (stage === 'finance') {
      if (earning.status !== 'supervisor-approved') return fail('APPROVAL_ORDER', 'Finance approval requires supervisor approval first.');
      earning.status = 'finance-approved';
    } else return fail('VALIDATION_ERROR', 'Approval stage must be supervisor or finance.');
    records.audit.push({ id: `tnp-demo-audit-${records.audit.length + 1}`, actorId, action: `earning.${stage}-approved`, reason: 'Sample sequential approval', createdAt: records.metadata.clock, entityId: earning.id });
    return ok(earning);
  }

  private setVariant(records: ScenarioRecords, payload: Record<string, unknown>) {
    const key = stringField(payload, 'key') || 'global';
    const variant = payload.variant;
    if (!['ready', 'loading', 'empty', 'error'].includes(String(variant))) return fail('VALIDATION_ERROR', 'Variant must be ready, loading, empty or error.');
    records.variants[key] = variant as PreviewVariant;
    return ok({ key, variant });
  }

  private ensureEventPass(records: ScenarioRecords, assignment: Assignment) {
    const existing = records.passes.find((item) => item.assignmentId === assignment.id);
    if (existing) return existing;
    const event = records.events.find((item) => item.id === assignment.eventId)!;
    const pass = {
      id: `tnp-demo-pass-${String(records.passes.length + 1).padStart(3, '0')}`,
      eventId: assignment.eventId,
      assignmentId: assignment.id,
      token: `TNP-SAMPLE-${assignment.id.toUpperCase()}`,
      expiresAt: event.endsAt,
    };
    records.passes.push(pass);
    return pass;
  }
}
