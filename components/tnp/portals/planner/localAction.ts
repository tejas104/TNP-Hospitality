export type ActionStatus = 'pending' | 'error' | 'success';

export type StoredAction<Request, Receipt> = {
  storageVersion: 1;
  operation: string;
  fingerprint: string;
  request: Request;
  status: ActionStatus;
  receipt?: Receipt;
  errorMessage?: string;
};

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function stable(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  const object = value as Record<string, unknown>;
  return `{${Object.keys(object)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stable(object[key])}`)
    .join(',')}}`;
}

export function actionFingerprint(operation: string, payload: unknown) {
  return stable({ operation, payload });
}

export function readAction<Request, Receipt>(
  storage: StorageLike,
  key: string,
  operation: string,
): StoredAction<Request, Receipt> | null {
  const raw = storage.getItem(key);
  if (!raw) return null;
  const parsed = JSON.parse(raw) as Partial<StoredAction<Request, Receipt>>;
  const request = parsed.request as Record<string, unknown> | undefined;
  const receipt = parsed.receipt as Record<string, unknown> | undefined;
  if (
    parsed.storageVersion !== 1 ||
    parsed.operation !== operation ||
    typeof parsed.fingerprint !== 'string' ||
    !request ||
    request.operation !== operation ||
    typeof request.requestKey !== 'string' ||
    !Number.isInteger(request.expectedGeneration) ||
    typeof request.actorId !== 'string' ||
    typeof request.payload !== 'object' ||
    !['pending', 'error', 'success'].includes(parsed.status ?? '') ||
    (parsed.status === 'success' &&
      (!receipt || typeof receipt.id !== 'string'))
  ) {
    throw new Error('The saved action journal has an unsupported shape.');
  }
  return parsed as StoredAction<Request, Receipt>;
}

export function writeAction<Request, Receipt>(
  storage: StorageLike,
  key: string,
  action: StoredAction<Request, Receipt>,
) {
  storage.setItem(key, JSON.stringify(action));
}

export function clearAction(storage: StorageLike, key: string) {
  storage.removeItem(key);
}

export function reconcileReferencePair<
  Booking extends { id: string },
  Event extends { id: string; bookingId: string },
>(
  bookings: Booking[],
  events: Event[],
  current: { bookingId: string; eventId: string },
) {
  const bookingId = bookings.some((item) => item.id === current.bookingId)
    ? current.bookingId
    : (bookings[0]?.id ?? '');
  const eventId = events.some(
    (item) => item.id === current.eventId && item.bookingId === bookingId,
  )
    ? current.eventId
    : (events.find((item) => item.bookingId === bookingId)?.id ?? '');
  return { bookingId, eventId };
}

export function isValidReferencePair<
  Booking extends { id: string },
  Event extends { id: string; bookingId: string },
>(bookings: Booking[], events: Event[], bookingId: string, eventId: string) {
  return (
    bookings.some((item) => item.id === bookingId) &&
    events.some((item) => item.id === eventId && item.bookingId === bookingId)
  );
}
