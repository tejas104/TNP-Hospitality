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
  const hasReceipt = parsed.receipt !== undefined;
  const hasError = parsed.errorMessage !== undefined;
  const payloadIsObject =
    request?.payload !== null &&
    typeof request?.payload === 'object' &&
    !Array.isArray(request.payload);
  const fingerprintMatches =
    request?.operation === operation &&
    payloadIsObject &&
    parsed.fingerprint === actionFingerprint(operation, request.payload);
  const pendingIsValid =
    parsed.status === 'pending' && !hasReceipt && !hasError;
  const errorIsValid =
    parsed.status === 'error' &&
    !hasReceipt &&
    typeof parsed.errorMessage === 'string' &&
    parsed.errorMessage.trim().length > 0;
  const successIsValid =
    parsed.status === 'success' &&
    !hasError &&
    !!receipt &&
    !Array.isArray(receipt) &&
    typeof receipt.id === 'string' &&
    receipt.id.trim().length > 0 &&
    typeof receipt.message === 'string' &&
    receipt.message.trim().length > 0;
  if (
    parsed.storageVersion !== 1 ||
    parsed.operation !== operation ||
    typeof parsed.fingerprint !== 'string' ||
    parsed.fingerprint.trim().length === 0 ||
    !request ||
    request.operation !== operation ||
    typeof request.requestKey !== 'string' ||
    request.requestKey.trim().length === 0 ||
    !Number.isInteger(request.expectedGeneration) ||
    Number(request.expectedGeneration) < 0 ||
    typeof request.actorId !== 'string' ||
    request.actorId.trim().length === 0 ||
    !payloadIsObject ||
    !fingerprintMatches ||
    (!pendingIsValid && !errorIsValid && !successIsValid)
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

export function collectionPresentation(collection: {
  status: string;
  reference?: string | null;
}) {
  if (collection.status === 'paid' && !collection.reference?.trim()) {
    return {
      state: 'unconfirmed',
      label: 'unconfirmed',
      description: 'Reference missing - not treated as paid',
    } as const;
  }
  return {
    state: collection.status,
    label: collection.status,
    description: collection.reference
      ? `Reference ${collection.reference}`
      : 'No sample payment reference',
  };
}
