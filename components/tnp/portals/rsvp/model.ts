// RSVP-local presentation model for the synthetic frontend milestone.
// These types organize task-local sample records only. They are NOT the
// reviewed platform tenant contract or RSVP service contract; when those are
// integrated, the adapter maps their DTOs onto these view models.

export type OperatingMode = 'tnp-managed' | 'vendor-operated';

export type Role =
  | 'service-manager'
  | 'vendor-owner'
  | 'coordinator'
  | 'calling-agent'
  | 'customer-owner'
  | 'hotel-contact'
  | 'transport-coordinator';

export type Section =
  | 'overview'
  | 'today'
  | 'calendar'
  | 'guests'
  | 'add'
  | 'import'
  | 'calls'
  | 'travel'
  | 'movements'
  | 'rooming'
  | 'messages'
  | 'documents'
  | 'reports';

export type OrgStatus = 'active' | 'suspended';

export type Organization = {
  id: string;
  name: string;
  kind: 'tnp' | 'vendor';
  status: OrgStatus;
  serviceEndsOn: string;
  entitlements: Section[];
};

export type Customer = { id: string; orgId: string; name: string };

export type Engagement = {
  id: string;
  orgId: string;
  customerId: string;
  name: string;
  mode: OperatingMode;
  packageLabel: string;
};

export type RsvpEvent = {
  id: string;
  orgId: string;
  engagementId: string;
  name: string;
  hosts: string;
  city: string;
  timezone: string;
  startsOn: string; // local calendar date of the first function, YYYY-MM-DD
  onboardedOn: string; // when the RSVP engagement started, YYYY-MM-DD
  imageId: string;
  rsvpClosesAt: string;
};

export type FunctionEvent = {
  id: string;
  eventId: string;
  name: string;
  startsAt: string; // ISO with offset
  venue: string;
  dressCode: string;
};

export type FunctionRsvp = 'awaiting' | 'confirmed' | 'tentative' | 'declined' | 'cancelled';
export type InvitationState = 'not-prepared' | 'pending-approval' | 'scheduled' | 'issued';
export type DeliveryState = 'none' | 'queued' | 'submitted' | 'sent' | 'delivered' | 'read' | 'failed' | 'uncertain';
export type ContactState = 'no-response' | 'needs-review' | 'recorded';
export type Priority = 'standard' | 'vip' | 'vvip';
export type Attendance = 'expected' | 'arrived' | 'checked-in' | 'departed' | 'no-show';
export type DocState =
  | 'not-required'
  | 'requested'
  | 'received'
  | 'under-review'
  | 'accepted'
  | 'replacement-required'
  | 'expired'
  | 'deleted'
  | 'download-pending'
  | 'download-failed';

export type CallOutcome = 'answered' | 'no-answer' | 'callback-requested' | 'needs-review' | 'declined-contact' | 'wrong-number';

export type Member = {
  id: string;
  partyId: string;
  name: string;
  ageBand: 'adult' | 'child';
  invitedFunctionIds: string[];
  responses: Record<string, FunctionRsvp>;
  attendance: Attendance;
  dietary: string;
  accessibility: string;
  removed: boolean;
};

export type ChangeEntry = {
  id: string;
  at: string;
  actor: string;
  field: string;
  before: string;
  after: string;
  source: 'staff' | 'guest-form' | 'import' | 'call';
};

export type CallAttempt = {
  id: string;
  at: string;
  actor: string;
  outcome: CallOutcome;
  note: string;
};

export type Party = {
  id: string;
  orgId: string;
  eventId: string;
  ref: string;
  displayName: string;
  primaryMemberId: string;
  phone: string;
  email: string;
  allowedAccompanying: number;
  priority: Priority;
  side: string;
  language: string;
  assignedCaller: string;
  invitation: InvitationState;
  delivery: DeliveryState;
  contact: ContactState;
  followUpDueAt: string | null;
  followUpReason: string;
  calls: CallAttempt[];
  notes: string;
  documentState: DocState;
  version: number;
  updatedAt: string;
  changes: ChangeEntry[];
};

export type TravelMode = 'flight' | 'train' | 'bus' | 'self-drive' | 'local';

export type TravelLeg = {
  id: string;
  partyId: string;
  direction: 'arrival' | 'departure';
  mode: TravelMode;
  reference: string;
  from: string;
  to: string;
  at: string | null; // ISO with offset; null when the guest has not supplied it
  passengerIds: string[];
  luggage: number;
  assistance: string;
  changedFrom: string | null; // previous ISO time when the leg changed after planning
};

export type TransferState =
  | 'not-required'
  | 'requested'
  | 'awaiting-details'
  | 'planned'
  | 'assigned'
  | 'dispatched'
  | 'guest-met'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export type Transfer = {
  id: string;
  partyId: string;
  legId: string | null;
  kind: 'pickup' | 'drop';
  state: TransferState;
  vehicleId: string | null;
  planBasedOn: string | null; // leg time the movement plan was built against
};

export type Vehicle = { id: string; eventId: string; label: string; seats: number; driver: string };

export type StayState =
  | 'not-required'
  | 'requested'
  | 'proposed'
  | 'approval-pending'
  | 'approved'
  | 'communicated'
  | 'checked-in'
  | 'checked-out';

export type Stay = {
  id: string;
  partyId: string;
  state: StayState;
  hotelId: string | null;
  categoryId: string | null;
  roomLabel: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string;
  occupantIds: string[];
  preference: string;
  accessibility: string;
};

export type RoomCategory = { id: string; name: string; inventory: number; maxOccupancy: number };
export type Hotel = { id: string; eventId: string; name: string; categories: RoomCategory[] };

export type GuestDocument = {
  id: string;
  partyId: string;
  memberId: string | null;
  purpose: 'travel-ticket' | 'identity' | 'other';
  state: DocState;
  note: string;
  updatedAt: string;
};

export type TemplateApproval = 'not-submitted' | 'submitted' | 'approved' | 'rejected';

export type MessageTemplate = {
  id: string;
  name: string;
  purpose: string;
  language: string;
  approval: TemplateApproval;
  body: string;
};

export type MessageRecord = {
  id: string;
  partyId: string;
  templateId: string;
  state: DeliveryState;
  at: string;
};

export type ProviderGate = {
  id: 'business-verification' | 'account-connection' | 'sender-approval' | 'template-approval' | 'integration' | 'uat';
  label: string;
  state: 'not-started' | 'in-progress' | 'blocked' | 'complete';
  note: string;
};

export type ReportKind =
  | 'master'
  | 'function-rsvp'
  | 'pending'
  | 'travel'
  | 'transfers'
  | 'rooming'
  | 'changes'
  | 'delivery'
  | 'final';

export type ReportSnapshot = {
  scopeSignature?: string;
  id: string;
  kind: ReportKind;
  eventId: string;
  generatedAt: string;
  revision: number;
  dataRevision: number;
  recordCount: number;
  peopleCount: number;
  partyCount: number;
  filters: string;
  columns: string[];
};

export type EventData = {
  event: RsvpEvent;
  functions: FunctionEvent[];
  parties: Party[];
  members: Member[];
  legs: TravelLeg[];
  transfers: Transfer[];
  vehicles: Vehicle[];
  hotels: Hotel[];
  stays: Stay[];
  documents: GuestDocument[];
  templates: MessageTemplate[];
  messages: MessageRecord[];
  gates: ProviderGate[];
  reports: ReportSnapshot[];
  dataRevision: number;
};

export type Persona = {
  id: string;
  name: string;
  role: Role;
  orgIds: string[];
  customerId: string | null;
  // Special synthetic access scenarios the preview can demonstrate.
  scenario: 'normal' | 'session-revoked' | 'no-entitlement';
};

// ---- Display vocabulary: explicit mapping from values to wording ----

export const FUNCTION_RSVP_LABEL: Record<FunctionRsvp, string> = {
  awaiting: 'Awaiting confirmation',
  confirmed: 'Confirmed',
  tentative: 'Tentative',
  declined: 'Declined',
  cancelled: 'Cancelled',
};

export const INVITATION_LABEL: Record<InvitationState, string> = {
  'not-prepared': 'Not prepared',
  'pending-approval': 'Pending customer approval',
  scheduled: 'Scheduled',
  issued: 'Issued',
};

export const DELIVERY_LABEL: Record<DeliveryState, string> = {
  none: 'No message',
  queued: 'Queued',
  submitted: 'Submitted to provider',
  sent: 'Sent',
  delivered: 'Delivered',
  read: 'Read (provider-reported)',
  failed: 'Failed',
  uncertain: 'Uncertain — reconcile first',
};

export const CONTACT_LABEL: Record<ContactState, string> = {
  'no-response': 'No response',
  'needs-review': 'Replied — needs review',
  recorded: 'Response recorded',
};

export const PRIORITY_LABEL: Record<Priority, string> = { standard: 'Standard', vip: 'VIP', vvip: 'VVIP' };

export const DOC_LABEL: Record<DocState, string> = {
  'not-required': 'Not required',
  requested: 'Requested',
  received: 'Received — not verified',
  'under-review': 'Under review',
  accepted: 'Accepted',
  'replacement-required': 'Rejected — replacement required',
  expired: 'Expired',
  deleted: 'Deleted',
  'download-pending': 'Download pending',
  'download-failed': 'Download failed',
};

export const TRANSFER_LABEL: Record<TransferState, string> = {
  'not-required': 'Not required',
  requested: 'Requested',
  'awaiting-details': 'Awaiting details',
  planned: 'Planned',
  assigned: 'Vehicle / driver assigned',
  dispatched: 'Dispatched',
  'guest-met': 'Guest met',
  completed: 'Completed',
  cancelled: 'Cancelled',
  'no-show': 'No-show',
};

export const STAY_LABEL: Record<StayState, string> = {
  'not-required': 'Not required',
  requested: 'Requested',
  proposed: 'Room proposed',
  'approval-pending': 'Customer approval pending',
  approved: 'Approved — not yet communicated',
  communicated: 'Details communicated',
  'checked-in': 'Checked in',
  'checked-out': 'Checked out',
};

export const CALL_OUTCOME_LABEL: Record<CallOutcome, string> = {
  answered: 'Answered',
  'no-answer': 'No answer',
  'callback-requested': 'Callback requested',
  'needs-review': 'Needs review',
  'declined-contact': 'Declined contact',
  'wrong-number': 'Wrong number',
};

export const TRAVEL_MODE_LABEL: Record<TravelMode, string> = {
  flight: 'Flight',
  train: 'Train',
  bus: 'Bus',
  'self-drive': 'Self-drive',
  local: 'Local / private',
};

export const ROLE_LABEL: Record<Role, string> = {
  'service-manager': 'TNP service manager',
  'vendor-owner': 'Vendor owner',
  coordinator: 'RSVP coordinator',
  'calling-agent': 'Calling agent',
  'customer-owner': 'Customer owner',
  'hotel-contact': 'Hotel contact',
  'transport-coordinator': 'Transport coordinator',
};

export const MODE_LABEL: Record<OperatingMode, string> = {
  'tnp-managed': 'TNP-managed service',
  'vendor-operated': 'Vendor-operated',
};
