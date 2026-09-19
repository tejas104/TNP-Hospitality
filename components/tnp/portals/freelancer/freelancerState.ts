import type {
  Application,
  Assignment,
  MutationRequest,
  Opportunity,
  PreviewMutationMap,
  PreviewOperation,
} from '../../../../lib/contracts/preview.ts';

export const profiles = [
  { id: 'tnp-demo-freelancer-new', name: 'New sample applicant' },
  { id: 'tnp-demo-worker-006', name: 'Sample coordinator · eligible' },
  { id: 'tnp-demo-worker-003', name: 'Sample volunteer · eligible' },
  { id: 'tnp-demo-worker-004', name: 'Sample applicant · pending review' },
  { id: 'tnp-demo-worker-007', name: 'Sample coordinator · response pending' },
  { id: 'tnp-demo-worker-005', name: 'Sample hostess · approved' },
  { id: 'tnp-demo-applicant-rejected', name: 'Sample application · rejected' },
  { id: 'tnp-demo-applicant-invalid', name: 'Sample application · invalid' },
] as const;
export const roles = ['Event Coordinator', 'Volunteer', 'Hostess'] as const;
export const questions = [
  {
    text: 'A guest needs help finding their function. What comes first?',
    options: [
      'Listen and confirm their destination',
      'Send them to the busiest desk',
      'Ask them to return later',
    ],
    answer: 0,
  },
  {
    text: 'Your reporting time may be affected. What should you do?',
    options: [
      'Wait until the event ends',
      'Inform the event contact promptly',
      'Assume someone will cover',
    ],
    answer: 1,
  },
  {
    text: 'You are unsure about an instruction. Your next step?',
    options: [
      'Guess the answer',
      'Ignore the request',
      'Confirm with the coordinator',
    ],
    answer: 2,
  },
];
export type ApplicationDraft = {
  name: string;
  role: string;
  experience: string;
  availability: string;
  skills: string;
  answers: number[];
  step: number;
};
export const freshDraft = (): ApplicationDraft => ({
  name: '',
  role: '',
  experience: '',
  availability: '',
  skills: '',
  answers: [-1, -1, -1],
  step: 0,
});
export function sampleScore(answers: number[]) {
  return Math.round(
    (questions.filter((q, i) => q.answer === answers[i]).length /
      questions.length) *
      100,
  );
}
export function draftErrors(draft: ApplicationDraft, step = draft.step) {
  const errors: Record<string, string> = {};
  if (step === 0 || step === 3) {
    if (!draft.name.trim())
      errors['sample-name'] = 'Choose a sample display name.';
    if (!roles.includes(draft.role as (typeof roles)[number]))
      errors['sample-role'] = 'Choose a preferred role.';
  }
  if (step === 2 || step === 3)
    questions.forEach((q, i) => {
      if (!Number.isInteger(draft.answers[i]) || !q.options[draft.answers[i]])
        errors[`question-${i}`] = `Answer sample question ${i + 1}.`;
    });
  return errors;
}
export function readDraft(raw: string | null): ApplicationDraft {
  if (!raw) return freshDraft();
  const d = JSON.parse(raw) as ApplicationDraft;
  if (
    !d ||
    !['name', 'role', 'experience', 'availability', 'skills'].every(
      (k) => typeof d[k as keyof ApplicationDraft] === 'string',
    ) ||
    !Array.isArray(d.answers) ||
    d.answers.length !== 3 ||
    !d.answers.every((n) => Number.isInteger(n) && n >= -1 && n <= 2) ||
    !Number.isInteger(d.step) ||
    d.step < 0 ||
    d.step > 3
  )
    throw new Error('Saved draft could not be read. A fresh draft is ready.');
  return d;
}
export type FreelancerOperation =
  | 'registerApplicant'
  | 'submitAssessment'
  | 'claimOpportunity'
  | 'respondToAssignment';
export type FreelancerRequest = {
  [K in FreelancerOperation]: MutationRequest<K>;
}[FreelancerOperation];
export function actionSlot(
  operation: FreelancerOperation,
  payload: PreviewMutationMap[FreelancerOperation]['payload'],
) {
  const p = payload as unknown as Record<string, unknown>;
  return `${operation}:${String(p.applicantId ?? p.positionId ?? p.assignmentId)}`;
}
export function validateRequest(
  raw: unknown,
  profile: string,
  generation: number,
): raw is FreelancerRequest {
  if (!raw || typeof raw !== 'object') return false;
  const r = raw as FreelancerRequest;
  if (
    r.actorId !== profile ||
    r.expectedGeneration !== generation ||
    typeof r.requestKey !== 'string' ||
    !r.requestKey.trim() ||
    !r.payload ||
    typeof r.payload !== 'object'
  )
    return false;
  const p = r.payload as unknown as Record<string, unknown>;
  if (r.operation === 'registerApplicant')
    return (
      p.applicantId === profile &&
      typeof p.displayName === 'string' &&
      !!p.displayName.trim() &&
      roles.includes(p.role as (typeof roles)[number])
    );
  if (r.operation === 'submitAssessment')
    return (
      p.applicantId === profile &&
      Number.isInteger(p.score) &&
      Number(p.score) >= 0 &&
      Number(p.score) <= 100
    );
  if (r.operation === 'claimOpportunity')
    return (
      p.workerId === profile &&
      typeof p.positionId === 'string' &&
      !!p.positionId
    );
  if (r.operation === 'respondToAssignment')
    return (
      typeof p.assignmentId === 'string' &&
      !!p.assignmentId &&
      (p.response === 'coming' || p.response === 'not-coming')
    );
  return false;
}
export function readRequests(
  raw: string | null,
  profile: string,
  generation: number,
): Record<string, FreelancerRequest> {
  if (!raw) return {};
  const entries = JSON.parse(raw) as Record<string, unknown>;
  if (!entries || typeof entries !== 'object' || Array.isArray(entries))
    throw new Error(
      'Saved retry data is invalid. Refresh service records before a new action.',
    );
  for (const [key, value] of Object.entries(entries))
    if (
      !validateRequest(value, profile, generation) ||
      key !== actionSlot(value.operation, value.payload)
    )
      throw new Error(
        'Saved retry data does not match this profile and generation.',
      );
  return entries as Record<string, FreelancerRequest>;
}
export function samePayload(a: unknown, b: unknown) {
  const stable = (x: unknown): string =>
    x && typeof x === 'object' && !Array.isArray(x)
      ? JSON.stringify(
          Object.fromEntries(
            Object.entries(x).sort(([a], [b]) => a.localeCompare(b)),
          ),
        )
      : JSON.stringify(x);
  return stable(a) === stable(b);
}
export function createRequest<K extends FreelancerOperation>(
  operation: K,
  payload: PreviewMutationMap[K]['payload'],
  profile: string,
  generation: number,
  key: string,
): MutationRequest<K> {
  return {
    operation,
    payload,
    actorId: profile,
    expectedGeneration: generation,
    requestKey: key,
  };
}
export function mayRespond(
  request: FreelancerRequest,
  assignments: Assignment[],
) {
  return (
    request.operation !== 'respondToAssignment' ||
    assignments.some(
      (a) =>
        a.id === request.payload.assignmentId && a.workerId === request.actorId,
    )
  );
}
export function currentApplication(
  applications: Application[],
  profile: string,
) {
  return applications.filter((a) => a.applicantId === profile).at(-1) ?? null;
}
export function filterOpportunities(
  items: Opportunity[],
  query: string,
  role: string,
  venue: string,
  date: string,
) {
  const q = query.trim().toLowerCase();
  return items.filter(
    (o) =>
      (!q ||
        `${o.role} ${o.venueName} ${o.reportingDetails} ${o.eventId}`
          .toLowerCase()
          .includes(q)) &&
      (!role || o.role === role) &&
      (!venue || o.venueId === venue) &&
      (!date || o.startsAt.slice(0, 10) === date),
  );
}
export function assignmentLabel(a: Assignment) {
  return a.allocationState !== 'active'
    ? a.allocationState
    : a.response === 'pending'
      ? 'Response pending'
      : a.response === 'coming'
        ? 'Coming'
        : 'Not coming · reservation released';
}
export function storageKey(kind: string, profile: string, generation: number) {
  return `tnp-freelancer-v1:${kind}:${generation}:${profile}`;
}
export type ActionInput<K extends PreviewOperation> =
  PreviewMutationMap[K]['payload'];
