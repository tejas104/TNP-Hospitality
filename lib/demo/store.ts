import { PREVIEW_STORAGE_KEY } from '../contracts/preview.ts';
import type {
  MutationRequest,
  PreviewEnvelope,
  PreviewError,
  PreviewOutcome,
  ResetPreviewRequest,
  ResetReceipt,
  ScenarioRecords,
  StoredMutationResult,
} from '../contracts/preview.ts';
import { createPreviewEnvelope } from './scenario.ts';

export type PreviewStorage = {
  read(key: string): Promise<string | null>;
  write(key: string, value: string): Promise<void>;
};

export class MemoryPreviewStorage implements PreviewStorage {
  private values = new Map<string, string>();

  async read(key: string) {
    return this.values.get(key) ?? null;
  }

  async write(key: string, value: string) {
    this.values.set(key, value);
  }
}

export class BrowserPreviewStorage implements PreviewStorage {
  async read(key: string) {
    return window.localStorage.getItem(key);
  }

  async write(key: string, value: string) {
    window.localStorage.setItem(key, value);
  }
}

type MutationDecision<T> =
  | { ok: true; value: T }
  | { ok: false; error: PreviewError };

type PreparedMutation<T> = {
  request: MutationRequest<string, unknown>;
  prepared: T;
};

function clone<T>(value: T): T {
  return structuredClone(value);
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

function error(code: string, message: string, retryable = false, fieldErrors?: Record<string, string>): PreviewError {
  return { code, message, retryable, ...(fieldErrors ? { fieldErrors } : {}) };
}

function asStored<T>(decision: MutationDecision<T>): StoredMutationResult {
  return decision.ok ? { ok: true, value: clone(decision.value) } : { ok: false, error: clone(decision.error) };
}

function asOutcome<T>(result: StoredMutationResult, generation: number, replayed: boolean): PreviewOutcome<T> {
  if (result.ok) return { ok: true, value: clone(result.value) as T, generation, replayed };
  return { ok: false, error: clone(result.error), generation, replayed };
}

function parseEnvelope(raw: string | null): PreviewEnvelope | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PreviewEnvelope;
    if (
      parsed.storageVersion !== PREVIEW_STORAGE_KEY ||
      !Number.isInteger(parsed.generation) ||
      !parsed.records ||
      !parsed.ordinaryRequestLedger ||
      !parsed.resetReceipts
    ) return null;
    return parsed;
  } catch {
    return null;
  }
}

export class PreviewStore {
  private envelope: PreviewEnvelope;
  private tail: Promise<void> = Promise.resolve();
  private readonly storage: PreviewStorage;

  private constructor(storage: PreviewStorage, envelope: PreviewEnvelope) {
    this.storage = storage;
    this.envelope = envelope;
  }

  static async create(storage: PreviewStorage = new MemoryPreviewStorage()) {
    const stored = parseEnvelope(await storage.read(PREVIEW_STORAGE_KEY));
    const envelope = stored ?? createPreviewEnvelope();
    if (!stored) await storage.write(PREVIEW_STORAGE_KEY, JSON.stringify(envelope));
    return new PreviewStore(storage, envelope);
  }

  async generation() {
    return this.envelope.generation;
  }

  async snapshot() {
    return clone(this.envelope);
  }

  async prepare<T>(
    request: MutationRequest<string, unknown>,
    work: () => Promise<T>,
  ): Promise<PreparedMutation<T>> {
    return { request, prepared: await work() };
  }

  async commit<T, Prepared = undefined>(
    request: MutationRequest<string, unknown>,
    reducer: (records: ScenarioRecords, prepared: Prepared) => MutationDecision<T>,
    prepared?: Prepared,
  ): Promise<PreviewOutcome<T>> {
    return this.exclusive(async () => {
      const generation = this.envelope.generation;
      if (!request.requestKey.trim()) {
        return { ok: false, error: error('INVALID_REQUEST_KEY', 'requestKey must be nonempty.'), generation, replayed: false };
      }
      if (request.expectedGeneration !== generation) {
        return { ok: false, error: error('STALE_GENERATION', 'The preview generation changed. Retry with the generation captured for a new user action.', true), generation, replayed: false };
      }

      const ledgerKey = `${request.expectedGeneration}:${request.requestKey}`;
      const fingerprint = stable({ operation: request.operation, actorId: request.actorId, payload: request.payload });
      const prior = this.envelope.ordinaryRequestLedger[ledgerKey];
      if (prior) {
        if (prior.fingerprint !== fingerprint) {
          return { ok: false, error: error('IDEMPOTENCY_CONFLICT', 'This request key was already used with different input.'), generation, replayed: false };
        }
        return asOutcome<T>(prior.result, generation, true);
      }

      const records = clone(this.envelope.records);
      let decision: MutationDecision<T>;
      try {
        decision = reducer(records, prepared as Prepared);
      } catch (caught) {
        decision = { ok: false, error: error('PREVIEW_OPERATION_FAILED', caught instanceof Error ? caught.message : 'Preview operation failed.') };
      }
      const storedResult = asStored(decision);
      const candidate: PreviewEnvelope = {
        ...clone(this.envelope),
        records: decision.ok ? records : clone(this.envelope.records),
        ordinaryRequestLedger: {
          ...clone(this.envelope.ordinaryRequestLedger),
          [ledgerKey]: { fingerprint, result: storedResult },
        },
      };

      try {
        await this.storage.write(PREVIEW_STORAGE_KEY, JSON.stringify(candidate));
      } catch {
        return { ok: false, error: error('PERSISTENCE_ERROR', 'The preview change could not be persisted.', true), generation, replayed: false };
      }
      this.envelope = candidate;
      return asOutcome<T>(storedResult, generation, false);
    });
  }

  async reset(request: ResetPreviewRequest): Promise<PreviewOutcome<ResetReceipt>> {
    return this.exclusive(async () => {
      const currentGeneration = this.envelope.generation;
      if (!request.requestKey.trim()) {
        return { ok: false, error: error('INVALID_REQUEST_KEY', 'requestKey must be nonempty.'), generation: currentGeneration, replayed: false };
      }
      const receiptKey = `${request.expectedGeneration}:${request.requestKey}`;
      const fingerprint = stable({ operation: 'resetPreview', actorId: request.actorId });
      const prior = this.envelope.resetReceipts[receiptKey];
      if (prior) {
        if (prior.fingerprint !== fingerprint) {
          return { ok: false, error: error('IDEMPOTENCY_CONFLICT', 'This reset key was already used by a different actor.'), generation: currentGeneration, replayed: false };
        }
        return { ok: true, value: clone(prior.receipt), generation: currentGeneration, replayed: true };
      }
      if (request.expectedGeneration !== currentGeneration) {
        return { ok: false, error: error('STALE_GENERATION', 'The preview generation changed before this reset.', true), generation: currentGeneration, replayed: false };
      }

      const receipt: ResetReceipt = {
        fromGeneration: currentGeneration,
        toGeneration: currentGeneration + 1,
        resetId: `tnp-preview-reset-${currentGeneration + 1}-${request.requestKey}`,
      };
      const receipts = {
        ...clone(this.envelope.resetReceipts),
        [receiptKey]: { fingerprint, receipt },
      };
      const candidate = createPreviewEnvelope(currentGeneration + 1, receipts);
      try {
        await this.storage.write(PREVIEW_STORAGE_KEY, JSON.stringify(candidate));
      } catch {
        return { ok: false, error: error('PERSISTENCE_ERROR', 'The preview reset could not be persisted.', true), generation: currentGeneration, replayed: false };
      }
      this.envelope = candidate;
      return { ok: true, value: receipt, generation: candidate.generation, replayed: false };
    });
  }

  private exclusive<T>(operation: () => Promise<T>): Promise<T> {
    const run = this.tail.then(operation, operation);
    this.tail = run.then(() => undefined, () => undefined);
    return run;
  }
}

export const previewError = error;
