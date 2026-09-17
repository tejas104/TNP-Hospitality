import type { Application, Assignment, Attendance, PreviewEvent, Worker } from '@/lib/contracts/preview';

export type EventStatusFilter = 'all' | PreviewEvent['status'];

export type RetryIdentity = {
  actionId?: string;
  retryable?: boolean;
  code?: string;
};

export function reconcileSelectedId(currentId: string, optionIds: string[]) {
  return optionIds.includes(currentId) ? currentId : optionIds[0] ?? '';
}

export function filterOperationsEvents(
  events: PreviewEvent[],
  filter: string,
  statusFilter: EventStatusFilter,
) {
  const term = filter.trim().toLowerCase();
  return events.filter((event) => {
    const matchesTerm = !term || `${event.name} ${event.id} ${event.status}`.toLowerCase().includes(term);
    return matchesTerm && (statusFilter === 'all' || event.status === statusFilter);
  });
}

export function reviewableApplications(applications: Application[], workers: Record<string, Worker>) {
  return applications.filter((application) => (
    application.status === 'pending'
    && Boolean(application.role.trim())
    && Boolean(workers[application.applicantId])
  ));
}

export function actionableAttendanceAssignments(assignments: Assignment[], attendances: Attendance[]) {
  const recordedAssignmentIds = new Set(attendances.map((attendance) => attendance.assignmentId));
  return assignments.filter((assignment) => (
    assignment.allocationState === 'active'
    && assignment.response === 'coming'
    && !recordedAssignmentIds.has(assignment.id)
  ));
}

export function canRetryFeedback(feedback: RetryIdentity, retainedActionId: string | undefined) {
  return Boolean(
    feedback.code !== 'STALE_GENERATION'
    && feedback.retryable
    && feedback.actionId
    && feedback.actionId === retainedActionId,
  );
}

export function isCurrentActionEpoch(epoch: number, currentEpoch: number) {
  return epoch === currentEpoch;
}

export function isCurrentRosterRequest(
  requestId: number,
  currentRequestId: number,
  eventId: string,
  selectedEventId: string,
) {
  return requestId === currentRequestId && eventId === selectedEventId;
}
