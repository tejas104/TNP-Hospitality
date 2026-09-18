const PREVIEW_ACTION_IDENTITY_STORAGE_KEY = 'tnp-preview-v1:controls-action-identity';

export type PreviewActionStorage = Pick<Storage, 'getItem' | 'setItem'>;

export type PreviewActionDescriptor = {
  expectedGeneration: number;
  operation: string;
  payload: unknown;
};

export type CapturedPreviewActionIdentity = {
  requestKey: string;
  expectedGeneration: number;
};

type StoredSequence = {
  version: 1;
  lastSequence: number;
};

type RetryIdentity = CapturedPreviewActionIdentity & {
  fingerprint: string;
};

export class PreviewActionIdentityError extends Error {
  readonly code = 'PREVIEW_ACTION_IDENTITY_UNAVAILABLE';

  constructor() {
    super('Preview action identity could not be persisted. No preview change was attempted.');
    this.name = 'PreviewActionIdentityError';
  }
}

function stable(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  const object = value as Record<string, unknown>;
  return `{${Object.keys(object)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stable(object[key])}`)
    .join(',')}}`;
}

function parseSequence(raw: string | null): StoredSequence {
  if (raw === null) return { version: 1, lastSequence: 0 };
  try {
    const parsed = JSON.parse(raw) as Partial<StoredSequence>;
    if (parsed.version === 1 && Number.isSafeInteger(parsed.lastSequence) && (parsed.lastSequence ?? -1) >= 0) {
      return parsed as StoredSequence;
    }
  } catch {
    // The caller receives one truthful identity failure below.
  }
  throw new PreviewActionIdentityError();
}

export class PreviewActionIdentityManager {
  private retryIdentity: RetryIdentity | null = null;
  private readonly storage: PreviewActionStorage;
  private readonly scope: string;

  constructor(storage: PreviewActionStorage, scope = 'preview-controls-action') {
    this.storage = storage;
    this.scope = scope;
  }

  capture(descriptor: PreviewActionDescriptor): CapturedPreviewActionIdentity {
    const fingerprint = stable(descriptor);
    if (this.retryIdentity?.fingerprint === fingerprint) {
      return {
        requestKey: this.retryIdentity.requestKey,
        expectedGeneration: this.retryIdentity.expectedGeneration,
      };
    }

    try {
      const stored = parseSequence(this.storage.getItem(PREVIEW_ACTION_IDENTITY_STORAGE_KEY));
      if (stored.lastSequence >= Number.MAX_SAFE_INTEGER) throw new PreviewActionIdentityError();
      const next: StoredSequence = { version: 1, lastSequence: stored.lastSequence + 1 };
      this.storage.setItem(PREVIEW_ACTION_IDENTITY_STORAGE_KEY, JSON.stringify(next));
      this.retryIdentity = {
        requestKey: `${this.scope}-${descriptor.expectedGeneration}-${next.lastSequence}`,
        expectedGeneration: descriptor.expectedGeneration,
        fingerprint,
      };
      return {
        requestKey: this.retryIdentity.requestKey,
        expectedGeneration: this.retryIdentity.expectedGeneration,
      };
    } catch (error) {
      if (error instanceof PreviewActionIdentityError) throw error;
      throw new PreviewActionIdentityError();
    }
  }

  settle(identity: CapturedPreviewActionIdentity) {
    if (
      this.retryIdentity?.requestKey === identity.requestKey &&
      this.retryIdentity.expectedGeneration === identity.expectedGeneration
    ) {
      this.retryIdentity = null;
    }
  }
}

export function createBrowserPreviewActionIdentityManager() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) throw new PreviewActionIdentityError();
    return new PreviewActionIdentityManager(window.localStorage);
  } catch (error) {
    if (error instanceof PreviewActionIdentityError) throw error;
    throw new PreviewActionIdentityError();
  }
}
