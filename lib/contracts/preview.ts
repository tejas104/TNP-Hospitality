export const PREVIEW_STORAGE_KEY = 'tnp-preview-v1';

export type IsoTimestamp = string;
export type PreviewVariant = 'ready' | 'loading' | 'empty' | 'error';
export type PayUnit = 'hour' | 'day' | 'event';
export type AssignmentResponse = 'pending' | 'coming' | 'not-coming';
export type EvidenceState = 'recorded' | 'gps-denied' | 'gps-missing' | 'outside-radius';

export type Paginated<T> = { items: T[]; nextCursor: string | null };

export type PreviewError = {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
  retryable: boolean;
};

export type PreviewOutcome<T> =
  | { ok: true; value: T; generation: number; replayed: boolean }
  | { ok: false; error: PreviewError; generation: number; replayed: boolean };

export type QueryOptions = { cursor?: string; variant?: PreviewVariant };

export type StoreMutationRequest = {
  requestKey: string;
  expectedGeneration: number;
  actorId: string;
  operation: string;
  payload: unknown;
};

export type ResetPreviewRequest = {
  requestKey: string;
  expectedGeneration: number;
  actorId: string;
};

export type ResetReceipt = {
  fromGeneration: number;
  toGeneration: number;
  resetId: string;
};

export type Venue = {
  id: string;
  name: string;
  city: string;
  capacity: number;
  budgetBandPaise: { min: number; max: number };
  recommendation: string;
  isOwned: boolean;
};

export type Planner = {
  id: string;
  displayName: string;
  city: string;
  recommendationScore: number;
  verificationState: 'pending' | 'approved-sample' | 'rejected';
};

export type Booking = {
  id: string;
  clientId: string;
  venueId: string;
  eventName: string;
  city: string;
  budgetPaise: number;
  status: 'draft' | 'submitted' | 'confirmed';
  createdAt: IsoTimestamp;
};

export type Requirement = {
  id: string;
  bookingId: string;
  eventId: string;
  role: string;
  quantity: number;
  notes: string;
  status: 'draft' | 'submitted' | 'staffing';
};

export type PreviewEvent = {
  id: string;
  bookingId: string;
  name: string;
  startsAt: IsoTimestamp;
  endsAt: IsoTimestamp;
  timezone: string;
  venueId: string;
  reportingDetails: string;
  status: 'planned' | 'staffing' | 'complete';
};

export type Position = {
  id: string;
  eventId: string;
  role: string;
  quantity: number;
  payRatePaise: number;
  payUnit: PayUnit;
  requiredAssessmentScore: number;
  status: 'open' | 'full' | 'unavailable';
};

export type Worker = {
  id: string;
  displayName: string;
  role: string;
  assessmentScore: number;
  standing: 'good' | 'under-review';
  approved: boolean;
};

export type Opportunity = {
  id: string;
  eventId: string;
  positionId: string;
  role: string;
  startsAt: IsoTimestamp;
  endsAt: IsoTimestamp;
  timezone: string;
  venueId: string;
  venueName: string;
  reportingDetails: string;
  payRatePaise: number;
  payUnit: PayUnit;
  requiredQuantity: number;
  filledQuantity: number;
  availability: 'available' | 'full' | 'unavailable';
  eligibilityReason: string;
};

export type Assignment = {
  id: string;
  eventId: string;
  positionId: string;
  workerId: string;
  response: AssignmentResponse;
  allocationState: 'active' | 'replaced' | 'cancelled';
  payRatePaiseSnapshot: number;
  payUnitSnapshot: PayUnit;
  createdAt: IsoTimestamp;
};

export type AttendanceEvidence = {
  state: EvidenceState;
  capturedAt: IsoTimestamp;
  distanceMetres: number | null;
  note: string;
};

export type AttendanceHistoryEntry = {
  id: string;
  actorId: string;
  reason: string;
  evidence: AttendanceEvidence;
  recordedAt: IsoTimestamp;
};

export type Attendance = {
  id: string;
  eventId: string;
  assignmentId: string;
  workerId: string;
  state: 'present' | 'absent' | 'exception';
  evidence: AttendanceEvidence;
  history: AttendanceHistoryEntry[];
};

export type Earning = {
  id: string;
  assignmentId: string;
  attendanceId: string | null;
  workerId: string;
  estimatedGrossPaise: number;
  grossPaise: number;
  deductionsPaise: number;
  netPaise: number;
  proposedTaxLabel: string;
  amountState: 'estimated' | 'earned' | 'invalidated' | 'adjustment-review';
  status: 'pending-verification' | 'draft' | 'supervisor-approved' | 'finance-approved' | 'processing' | 'paid' | 'invalidated' | 'adjustment-review';
  supervisorApproval: SampleApprovalEvidence | null;
  financeApproval: SampleApprovalEvidence | null;
};

export type Payout = {
  id: string;
  workerId: string;
  month: string;
  earningIds: string[];
  totalPaise: number;
  status: 'processing' | 'failed' | 'uncertain' | 'reversed' | 'paid';
};

export type QuoteLine = { id: string; label: string; quantity: number; unitPaise: number; totalPaise: number };
export type Quote = {
  id: string;
  bookingId: string;
  version: number;
  issuingEntity: string;
  lines: QuoteLine[];
  totalPaise: number;
  status: 'pending' | 'revision-requested' | 'revised' | 'approved';
  revisionReason: string | null;
};

export type Collection = {
  id: string;
  bookingId: string | null;
  amountPaise: number;
  status: 'unpaid' | 'processing' | 'failed' | 'uncertain' | 'paid';
  reference: string | null;
};

export type Application = {
  id: string;
  applicantId: string;
  role: string;
  status: 'invalid' | 'pending' | 'rejected' | 'approved-sample';
  reviewReason: string | null;
};

export type Assessment = { id: string; applicantId: string; score: number; status: 'pending' | 'passed' | 'failed' };
export type Enquiry = { id: string; name: string; email: string; message: string; createdAt: IsoTimestamp; sentExternally: false };
export type Rating = { id: string; workerId: string; eventId: string; score: number; note: string };
export type GuestSummary = { id: string; bookingId: string; eventId: string; expectedGuests: number; rsvpYes: number; rsvpNo: number; rsvpPending: number };
export type EventPass = { id: string; eventId: string; assignmentId: string; token: string; expiresAt: IsoTimestamp };
export type AuditEntry = { id: string; actorId: string; action: string; reason: string; createdAt: IsoTimestamp; entityId: string };
export type SampleApprovalEvidence = {
  actorId: string;
  stage: 'supervisor' | 'finance';
  approvedAt: IsoTimestamp;
  assumptionLabel: 'Synthetic sample approver; production separation-of-duties policy pending';
};

export type ReplacementResult = { original: Assignment; replacement: Assignment };
export type PreviewMutationMap = {
  submitBooking: {
    payload: { clientId?: string; venueId: string; eventName: string; city: string; budgetPaise: number; status?: 'draft' | 'submitted' };
    result: Booking;
  };
  registerPlanner: { payload: { displayName: string; city: string }; result: Planner };
  submitRequirement: {
    payload: { bookingId: string; eventId: string; role: string; quantity: number; notes?: string; status?: 'draft' | 'submitted' };
    result: Requirement;
  };
  submitEnquiry: { payload: { name: string; email: string; message: string }; result: Enquiry };
  registerApplicant: { payload: { applicantId: string; displayName?: string; role: string }; result: Application };
  submitAssessment: { payload: { applicantId: string; score: number }; result: Assessment };
  claimOpportunity: { payload: { positionId: string; workerId: string }; result: Assignment };
  respondToAssignment: { payload: { assignmentId: string; response: Exclude<AssignmentResponse, 'pending'> }; result: Assignment };
  reviewApplication: { payload: { applicationId: string; decision: 'approved-sample' | 'rejected'; reason: string }; result: Application };
  changeRole: { payload: { workerId: string; role: string; reason: string }; result: Worker };
  recordAttendance: {
    payload: { token: string; eventId: string; evidenceState: EvidenceState; distanceMetres?: number; note?: string };
    result: Attendance;
  };
  correctAttendance: {
    payload: { attendanceId: string; state: Attendance['state']; evidenceState: EvidenceState; reason: string; distanceMetres?: number; note?: string };
    result: Attendance;
  };
  markNonresponse: { payload: { assignmentId: string; reason: string }; result: Assignment };
  adminAssign: { payload: { positionId: string; workerId: string; reason: string }; result: Assignment };
  replaceAssignment: { payload: { assignmentId: string; replacementWorkerId: string; reason: string }; result: ReplacementResult };
  clientApproveQuote: { payload: { quoteId: string; expectedVersion: number }; result: Quote };
  clientRequestQuoteRevision: { payload: { quoteId: string; expectedVersion: number; reason: string }; result: Quote };
  reviseQuote: {
    payload: { quoteId: string; expectedVersion: number; issuingEntity: string; reason: string; lines: Array<Omit<QuoteLine, 'id' | 'totalPaise'> & { id?: string }> };
    result: Quote;
  };
  adjustEarning: { payload: { earningId: string; grossPaise: number; deductionsPaise: number; reason: string }; result: Earning };
  approveEarning: { payload: { earningId: string; stage: 'supervisor' | 'finance' }; result: Earning };
  setPreviewVariant: { payload: { key: string; variant: PreviewVariant }; result: { key: string; variant: PreviewVariant } };
};

export type PreviewOperation = keyof PreviewMutationMap;
export type MutationRequest<Operation extends PreviewOperation> = Omit<StoreMutationRequest, 'operation' | 'payload'> & {
  operation: Operation;
  payload: PreviewMutationMap[Operation]['payload'];
};
export type MutationResult<Operation extends PreviewOperation> = PreviewMutationMap[Operation]['result'];
export type AnyMutationRequest = { [Operation in PreviewOperation]: MutationRequest<Operation> }[PreviewOperation];

export type ScenarioMetadata = {
  label: string;
  clock: IsoTimestamp;
  timezone: string;
  policyAssumptions: string[];
  syntheticOnly: true;
};

export type ScenarioRecords = {
  metadata: ScenarioMetadata;
  variants: Record<string, PreviewVariant>;
  venues: Venue[];
  planners: Planner[];
  bookings: Booking[];
  requirements: Requirement[];
  events: PreviewEvent[];
  positions: Position[];
  workers: Worker[];
  assignments: Assignment[];
  attendances: Attendance[];
  earnings: Earning[];
  payouts: Payout[];
  quotes: Quote[];
  collections: Collection[];
  applications: Application[];
  assessments: Assessment[];
  enquiries: Enquiry[];
  ratings: Rating[];
  guestSummaries: GuestSummary[];
  passes: EventPass[];
  audit: AuditEntry[];
};

export type StoredMutationResult =
  | { ok: true; value: unknown }
  | { ok: false; error: PreviewError };

export type OrdinaryReceipt = { fingerprint: string; result: StoredMutationResult };
export type StoredResetReceipt = { fingerprint: string; receipt: ResetReceipt };

export type PreviewEnvelope = {
  storageVersion: typeof PREVIEW_STORAGE_KEY;
  generation: number;
  records: ScenarioRecords;
  ordinaryRequestLedger: Record<string, OrdinaryReceipt>;
  resetReceipts: Record<string, StoredResetReceipt>;
};

export type BookingDraft = { venueId: string; eventName: string; city: string; budgetPaise: number; status: 'draft' | 'submitted' };
export type ApplicantDraft = { applicantId: string; role: string };

export type PreviewService = {
  getGeneration(): Promise<number>;
  getScenarioMetadata(): Promise<ScenarioMetadata>;
  listVenues(options?: QueryOptions): Promise<PreviewOutcome<Paginated<Venue>>>;
  listPlanners(options?: QueryOptions): Promise<PreviewOutcome<Paginated<Planner>>>;
  listBookings(options?: QueryOptions): Promise<PreviewOutcome<Paginated<Booking>>>;
  getBooking(id: string, options?: QueryOptions): Promise<PreviewOutcome<Booking>>;
  listRequirements(options?: QueryOptions & { eventId?: string }): Promise<PreviewOutcome<Paginated<Requirement>>>;
  getRequirement(id: string, options?: QueryOptions): Promise<PreviewOutcome<Requirement>>;
  listEvents(options?: QueryOptions): Promise<PreviewOutcome<Paginated<PreviewEvent>>>;
  getEvent(id: string, options?: QueryOptions): Promise<PreviewOutcome<PreviewEvent>>;
  listPositions(eventId?: string, options?: QueryOptions): Promise<PreviewOutcome<Paginated<Position>>>;
  getPosition(id: string, options?: QueryOptions): Promise<PreviewOutcome<Position>>;
  getQuote(id: string, options?: QueryOptions): Promise<PreviewOutcome<Quote>>;
  listQuotes(bookingId?: string, options?: QueryOptions): Promise<PreviewOutcome<Paginated<Quote>>>;
  listCollections(bookingId?: string, options?: QueryOptions): Promise<PreviewOutcome<Paginated<Collection>>>;
  listApplications(options?: QueryOptions): Promise<PreviewOutcome<Paginated<Application>>>;
  listAssessments(applicantId?: string, options?: QueryOptions): Promise<PreviewOutcome<Paginated<Assessment>>>;
  listEnquiries(options?: QueryOptions): Promise<PreviewOutcome<Paginated<Enquiry>>>;
  listGuestSummaries(bookingId?: string, options?: QueryOptions): Promise<PreviewOutcome<Paginated<GuestSummary>>>;
  listOpportunities(workerId: string, options?: QueryOptions): Promise<PreviewOutcome<Paginated<Opportunity>>>;
  getOpportunity(positionId: string, workerId: string, options?: QueryOptions): Promise<PreviewOutcome<Opportunity>>;
  listAssignments(workerId?: string, options?: QueryOptions): Promise<PreviewOutcome<Paginated<Assignment>>>;
  listRoster(eventId: string, options?: QueryOptions): Promise<PreviewOutcome<Paginated<Assignment>>>;
  getEventPass(assignmentId: string, options?: QueryOptions): Promise<PreviewOutcome<EventPass>>;
  getAttendanceHistory(workerId: string, options?: QueryOptions): Promise<PreviewOutcome<Paginated<Attendance>>>;
  getEarning(id: string, options?: QueryOptions): Promise<PreviewOutcome<Earning>>;
  listEarnings(workerId?: string, options?: QueryOptions): Promise<PreviewOutcome<Paginated<Earning>>>;
  listPayouts(workerId?: string, options?: QueryOptions): Promise<PreviewOutcome<Paginated<Payout>>>;
  listRatings(workerId: string, options?: QueryOptions): Promise<PreviewOutcome<Paginated<Rating>>>;
  getStanding(workerId: string, options?: QueryOptions): Promise<PreviewOutcome<Worker>>;
  getMetrics(options?: QueryOptions): Promise<PreviewOutcome<Record<string, number>>>;
  listAudit(options?: QueryOptions): Promise<PreviewOutcome<Paginated<AuditEntry>>>;
  mutate<Operation extends PreviewOperation>(request: MutationRequest<Operation>): Promise<PreviewOutcome<MutationResult<Operation>>>;
  resetPreview(request: ResetPreviewRequest): Promise<PreviewOutcome<ResetReceipt>>;
};
