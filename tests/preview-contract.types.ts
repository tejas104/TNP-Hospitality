import type { Booking, MutationRequest, PreviewService } from '../lib/contracts/preview.ts';

declare const service: PreviewService;

async function positiveInference() {
  const result = await service.mutate({
    requestKey: 'typed-booking',
    expectedGeneration: 0,
    actorId: 'tnp-type-test',
    operation: 'submitBooking',
    payload: {
      venueId: 'tnp-demo-venue-001',
      eventName: 'Typed sample event',
      city: 'Jaipur',
      budgetPaise: 100000,
      status: 'submitted',
    },
  });

  if (result.ok) {
    const bookingId: string = result.value.id;
    const bookingStatus: Booking['status'] = result.value.status;
    void [bookingId, bookingStatus];
  }
}

const typedApproval: MutationRequest<'approveEarning'> = {
  requestKey: 'typed-approval',
  expectedGeneration: 0,
  actorId: 'tnp-type-test-supervisor',
  operation: 'approveEarning',
  payload: { earningId: 'tnp-demo-earning-001', stage: 'supervisor' },
};
void typedApproval;

// @ts-expect-error unknown operations are rejected at the public boundary
void service.mutate({ requestKey: 'unknown', expectedGeneration: 0, actorId: 'actor', operation: 'unknownOperation', payload: {} });

// @ts-expect-error submitBooking requires its complete operation-specific payload
void service.mutate({ requestKey: 'missing', expectedGeneration: 0, actorId: 'actor', operation: 'submitBooking', payload: { venueId: 'venue-only' } });

// @ts-expect-error money fields use integer-number contracts, not strings
void service.mutate({ requestKey: 'wrong-type', expectedGeneration: 0, actorId: 'actor', operation: 'adjustEarning', payload: { earningId: 'earning', grossPaise: '100', deductionsPaise: 0, reason: 'sample' } });

void positiveInference;
