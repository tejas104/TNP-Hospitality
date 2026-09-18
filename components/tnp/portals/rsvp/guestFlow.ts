// Conditional guest RSVP flow. A party that declines everything is never asked
// for travel, transfers, stay or identity documents.

import type { FunctionRsvp, TravelMode } from './model.ts';

export type GuestStep = 'welcome' | 'party' | 'attendance' | 'travel' | 'transfers' | 'stay' | 'requests' | 'review';

export const STEP_LABEL: Record<GuestStep, string> = {
  welcome: 'Welcome',
  party: 'Your party',
  attendance: 'Attendance',
  travel: 'Travel',
  transfers: 'Pickup & drop',
  stay: 'Stay',
  requests: 'Requests',
  review: 'Review',
};

export type GuestDraft = {
  responses: Record<string, Record<string, FunctionRsvp | ''>>;
  arrivalChoice: 'now' | 'later';
  arrivalMode: TravelMode | '';
  arrivalRef: string;
  arrivalFrom: string;
  arrivalAt: string; // datetime-local in the event timezone
  departureChoice: 'now' | 'later';
  departureMode: TravelMode | '';
  departureRef: string;
  departureTo: string;
  departureAt: string;
  pickup: boolean;
  drop: boolean;
  stay: 'needed' | 'not-needed' | '';
  dietary: Record<string, string>;
  accessibility: Record<string, string>;
};

export function anyAttending(draft: Pick<GuestDraft, 'responses'>) {
  return Object.values(draft.responses).some((fns) => Object.values(fns).some((v) => v === 'confirmed' || v === 'tentative'));
}

export function guestSteps(draft: Pick<GuestDraft, 'responses'>, stayOffered: boolean): GuestStep[] {
  const steps: GuestStep[] = ['welcome', 'party', 'attendance'];
  if (anyAttending(draft)) {
    steps.push('travel', 'transfers');
    if (stayOffered) steps.push('stay');
    steps.push('requests');
  }
  steps.push('review');
  return steps;
}

/** Keeps the current step when it still exists, else the nearest earlier step that does. */
export function reconcileStep(current: GuestStep, steps: GuestStep[], order: GuestStep[] = Object.keys(STEP_LABEL) as GuestStep[]) {
  if (steps.includes(current)) return current;
  const idx = order.indexOf(current);
  for (let i = idx; i >= 0; i--) if (steps.includes(order[i])) return order[i];
  return steps[0];
}

export type StepErrors = Array<{ id: string; message: string }>;

export function validateStep(
  step: GuestStep,
  draft: GuestDraft,
  members: Array<{ id: string; name: string; invitedFunctionIds: string[] }>,
  functionName: (id: string) => string,
): StepErrors {
  const errors: StepErrors = [];
  if (step === 'attendance') {
    for (const m of members) {
      for (const fnId of m.invitedFunctionIds) {
        if (!draft.responses[m.id]?.[fnId]) errors.push({ id: `rsvp-${m.id}-${fnId}`, message: `Choose an answer for ${m.name} · ${functionName(fnId)}.` });
      }
    }
  }
  if (step === 'travel') {
    if (draft.arrivalChoice === 'now') {
      if (!draft.arrivalMode) errors.push({ id: 'arrival-mode', message: 'Choose how you are arriving.' });
      if (!draft.arrivalAt) errors.push({ id: 'arrival-at', message: 'Enter your arrival date and time.' });
    }
    if (draft.departureChoice === 'now') {
      if (!draft.departureMode) errors.push({ id: 'departure-mode', message: 'Choose how you are departing.' });
      if (!draft.departureAt) errors.push({ id: 'departure-at', message: 'Enter your departure date and time.' });
    }
    if (draft.arrivalChoice === 'now' && draft.departureChoice === 'now' && draft.arrivalAt && draft.departureAt && draft.departureAt <= draft.arrivalAt) {
      errors.push({ id: 'departure-at', message: 'Departure must be after arrival.' });
    }
  }
  if (step === 'transfers') {
    if (draft.pickup && draft.arrivalChoice === 'now' && draft.arrivalMode === 'self-drive') {
      errors.push({ id: 'pickup', message: 'A pickup is not needed for a self-drive arrival. Clear pickup, or change your arrival.' });
    }
  }
  if (step === 'stay' && !draft.stay) errors.push({ id: 'stay-needed', message: 'Tell us whether you need a stay.' });
  return errors;
}
