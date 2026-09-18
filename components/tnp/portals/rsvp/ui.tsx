'use client';

import { AlertTriangle, Check, Copy, ImageOff, Info, Loader2, RefreshCw, X } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from 'react';
import { byId } from '@/data/media';
import { createRsvpAdapter, newRequestId, type AdapterError, type Command, type Result, type RsvpAdapter, type StorageLike } from './adapter';
import { formatExact, relativeTime } from './dates';
import { motionPolicy, readMotionEnv, type MotionPolicy } from './motion';
import styles from './rsvp.module.css';

// ---------- Adapter singleton (browser tab scope) ----------

let adapterSingleton: RsvpAdapter | null = null;

function sessionStore(): StorageLike | null {
  try {
    const s = window.sessionStorage;
    const probe = '__tnp_rsvp_probe__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

export function getAdapter() {
  if (!adapterSingleton) adapterSingleton = createRsvpAdapter({ latency: 320, storage: typeof window === 'undefined' ? null : sessionStore() });
  return adapterSingleton;
}

const PERSONA_KEY = 'tnp-rsvp-preview-persona';

const noopSubscribe = () => () => undefined;

// In-route URL state (view, party) is owned here: Back/forward (popstate) and our own pushes both
// notify subscribers, so the UI never disagrees with the address bar.
const URL_EVENT = 'tnp-rsvp-url';
function subscribeUrl(cb: () => void) {
  window.addEventListener('popstate', cb);
  window.addEventListener(URL_EVENT, cb);
  return () => {
    window.removeEventListener('popstate', cb);
    window.removeEventListener(URL_EVENT, cb);
  };
}

export function useUrlSearch() {
  return useSyncExternalStore(subscribeUrl, () => window.location.search, () => '');
}

export function pushSearch(params: Record<string, string | null>, replace = false) {
  const url = new URL(window.location.href);
  for (const [k, v] of Object.entries(params)) {
    if (v === null) url.searchParams.delete(k);
    else url.searchParams.set(k, v);
  }
  window.history[replace ? 'replaceState' : 'pushState'](null, '', `${url.pathname}${url.search}`);
  window.dispatchEvent(new Event(URL_EVENT));
}

/** Hydration-safe read of a tab-scoped value: null on the server, the stored value in the browser. */
export function useStored(read: () => string | null): string | null | undefined {
  return useSyncExternalStore(noopSubscribe, read, () => undefined);
}

/** The synthetic persona id is a non-secret preview selector, never a credential. */
export function readPersona(): string | null {
  try {
    return window.sessionStorage.getItem(PERSONA_KEY);
  } catch {
    return null;
  }
}

export function writePersona(id: string | null) {
  try {
    if (id) window.sessionStorage.setItem(PERSONA_KEY, id);
    else window.sessionStorage.removeItem(PERSONA_KEY);
    return true;
  } catch {
    return false;
  }
}

// ---------- Motion ----------

const MotionContext = createContext<MotionPolicy>(motionPolicy({ reduced: true, coarse: false, saveData: false }));

export function MotionProvider({ children }: { children: ReactNode }) {
  const [policy, setPolicy] = useState(() => motionPolicy({ reduced: true, coarse: false, saveData: false }));
  useEffect(() => {
    const update = () => setPolicy(motionPolicy(readMotionEnv()));
    update();
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return <MotionContext.Provider value={policy}>{children}</MotionContext.Provider>;
}

export const useMotion = () => useContext(MotionContext);

// ---------- Single calm feedback region ----------

type Feedback = { tone: 'info' | 'success' | 'warning' | 'error'; text: string; id: number } | null;
const FeedbackContext = createContext<(tone: NonNullable<Feedback>['tone'], text: string) => void>(() => undefined);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [feedback, setFeedback] = useState<Feedback>(null);
  const counter = useRef(0);
  const announce = useCallback((tone: NonNullable<Feedback>['tone'], text: string) => {
    counter.current += 1;
    setFeedback({ tone, text, id: counter.current });
  }, []);
  useEffect(() => {
    if (!feedback || feedback.tone === 'error') return;
    const t = window.setTimeout(() => setFeedback((f) => (f?.id === feedback.id ? null : f)), 7000);
    return () => window.clearTimeout(t);
  }, [feedback]);
  return (
    <FeedbackContext.Provider value={announce}>
      {children}
      <output className={styles.feedbackRegion} aria-live="polite" aria-atomic="true">
        {feedback && (
          <div key={feedback.id} className={`${styles.feedback} ${styles[`tone_${feedback.tone}`]}`}>
            {feedback.tone === 'success' ? <Check size={16} aria-hidden /> : feedback.tone === 'info' ? <Info size={16} aria-hidden /> : <AlertTriangle size={16} aria-hidden />}
            <span>{feedback.text}</span>
            <button type="button" className={styles.iconBtn} onClick={() => setFeedback(null)} aria-label="Dismiss message">
              <X size={14} aria-hidden />
            </button>
          </div>
        )}
      </output>
    </FeedbackContext.Provider>
  );
}

export const useFeedback = () => useContext(FeedbackContext);

// ---------- Actions with stable request identity ----------

export type ActionStatus = { phase: 'idle' | 'pending' | 'error' | 'done'; error: AdapterError | null; requestId: string | null; replayed: boolean };

/**
 * Runs one logical action. A retry reuses the same request id (safe replay);
 * "new action" deliberately starts a fresh identity. Double activation while
 * pending is ignored, so a double click cannot submit twice.
 */
export function useAction<T>(run: (requestId: string) => Promise<Result<T>>, onDone?: (value: T, replayed: boolean) => void) {
  const [status, setStatus] = useState<ActionStatus>({ phase: 'idle', error: null, requestId: null, replayed: false });
  const pending = useRef(false);
  const mounted = useRef(true);
  const idRef = useRef<string | null>(null);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const execute = useCallback(
    async (mode: 'new' | 'retry') => {
      if (pending.current) return;
      pending.current = true;
      if (mode === 'new' || !idRef.current) idRef.current = newRequestId('rsvp');
      const requestId = idRef.current;
      setStatus({ phase: 'pending', error: null, requestId, replayed: false });
      const result = await run(requestId);
      pending.current = false;
      if (!mounted.current) return;
      if (result.ok) {
        setStatus({ phase: 'done', error: null, requestId, replayed: result.replayed });
        onDone?.(result.value, result.replayed);
      } else setStatus({ phase: 'error', error: result.error, requestId, replayed: false });
    },
    [run, onDone],
  );
  const reset = useCallback(() => {
    idRef.current = null;
    setStatus({ phase: 'idle', error: null, requestId: null, replayed: false });
  }, []);
  return { status, start: () => execute('new'), retry: () => execute('retry'), reset };
}

export function ActionError({ status, onRetry, onNew, onRefresh }: { status: ActionStatus; onRetry: () => void; onNew?: () => void; onRefresh?: () => void }) {
  if (status.phase !== 'error' || !status.error) return null;
  const e = status.error;
  return (
    <div className={styles.actionError} role="alert">
      <AlertTriangle size={16} aria-hidden />
      <div>
        <p>{e.message}</p>
        <div className={styles.inlineActions}>
          {e.retryable && (
            <button type="button" className={styles.btnSecondary} onClick={onRetry}>
              <RefreshCw size={14} aria-hidden /> Retry same action
            </button>
          )}
          {e.code === 'stale-version' && onRefresh && (
            <button type="button" className={styles.btnSecondary} onClick={onRefresh}>
              Load latest details
            </button>
          )}
          {onNew && e.code === 'conflict' && (
            <button type="button" className={styles.btnGhost} onClick={onNew}>
              Start as a new action
            </button>
          )}
        </div>
        {status.requestId && <p className={styles.meta}>Request identity {status.requestId.slice(0, 18)}… is kept for a safe retry.</p>}
      </div>
    </div>
  );
}

export function PendingLabel({ pending, idle, busy }: { pending: boolean; idle: string; busy: string }) {
  return pending ? (
    <>
      <Loader2 size={15} className={styles.spin} aria-hidden /> {busy}
    </>
  ) : (
    <>{idle}</>
  );
}

// ---------- Mutations bound to the current event context ----------

export type EventActionContext = { personaId: string; eventId: string; refresh: () => void };
export const EventActionCtx = createContext<EventActionContext | null>(null);

export function useEventMutation<T>(build: () => Command | null, onDone?: (value: T, replayed: boolean) => void, successText?: (value: T, replayed: boolean) => string) {
  const ctx = useContext(EventActionCtx);
  const announce = useFeedback();
  const buildRef = useRef(build);
  useEffect(() => {
    buildRef.current = build;
  });
  const run = useCallback(
    async (requestId: string): Promise<Result<T>> => {
      if (!ctx) return { ok: false, error: { code: 'forbidden', message: 'No event is selected.', retryable: false } };
      const cmd = buildRef.current();
      if (!cmd) return { ok: false, error: { code: 'validation', message: 'Complete the required details first.', retryable: false } };
      return getAdapter().mutate<T>(ctx.personaId, ctx.eventId, requestId, cmd);
    },
    [ctx],
  );
  const done = useCallback(
    (value: T, replayed: boolean) => {
      onDone?.(value, replayed);
      if (successText) announce('success', successText(value, replayed));
      ctx?.refresh();
    },
    [announce, ctx, onDone, successText],
  );
  return useAction<T>(run, done);
}

// ---------- Presentation primitives ----------

export function Stamp({ iso, timeZone, now }: { iso: string; timeZone: string; now: number }) {
  return (
    <time dateTime={iso} title={formatExact(iso, timeZone)} className={styles.stamp}>
      <span>{relativeTime(iso, now)}</span>
      <span className={styles.stampExact}>{formatExact(iso, timeZone)}</span>
    </time>
  );
}

export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(t);
  }, [intervalMs]);
  return now;
}

export function CopyRef({ value, label = 'reference' }: { value: string; label?: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'manual'>('idle');
  const inputId = useId();
  const manualRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    // Manual fallback: move focus to the selectable reference.
    if (state === 'manual') manualRef.current?.focus();
    if (state !== 'copied') return;
    const t = window.setTimeout(() => setState('idle'), 2400);
    return () => window.clearTimeout(t);
  }, [state]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setState('copied');
    } catch {
      setState('manual');
    }
  };
  return (
    <span className={styles.copyRef}>
      <code>{value}</code>
      <button type="button" className={styles.iconBtn} onClick={copy} aria-label={`Copy ${label} ${value}`}>
        {state === 'copied' ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
      </button>
      <span className={styles.srOnly} aria-live="polite">
        {state === 'copied' ? `${label} copied` : ''}
      </span>
      {state === 'manual' && (
        <span className={styles.copyManual}>
          <label htmlFor={inputId}>Copy failed — select and copy manually:</label>
          <input id={inputId} ref={manualRef} readOnly value={value} onFocus={(e) => e.currentTarget.select()} />
        </span>
      )}
    </span>
  );
}

export function StatePanel({
  tone = 'neutral',
  title,
  children,
  action,
  headingLevel = 2,
}: {
  tone?: 'neutral' | 'warning' | 'error' | 'locked';
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  headingLevel?: 2 | 3;
}) {
  const H = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <section className={`${styles.statePanel} ${styles[`state_${tone}`]}`} aria-label={title}>
      <H>{title}</H>
      {children}
      {action && <div className={styles.inlineActions}>{action}</div>}
    </section>
  );
}

export function Skeleton({ rows = 4, label }: { rows?: number; label: string }) {
  return (
    <output className={styles.skeleton} aria-label={label}>
      {Array.from({ length: rows }, (_, i) => (
        <span key={i} aria-hidden />
      ))}
      <span className={styles.srOnly}>{label}</span>
    </output>
  );
}

/** Explains why something is unavailable, without hover. */
export function WhyUnavailable({ children, label = 'Why unavailable?' }: { children: ReactNode; label?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span className={styles.why}>
      <button type="button" className={styles.linkBtn} aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
        {label}
      </button>
      <span id={id} hidden={!open} className={styles.whyText}>
        {children}
      </span>
    </span>
  );
}

export function Tag({ tone = 'neutral', children, icon }: { tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'info' | 'muted'; children: ReactNode; icon?: ReactNode }) {
  return (
    <span className={`${styles.tag} ${styles[`tag_${tone}`]}`}>
      {icon}
      {children}
    </span>
  );
}

// ---------- Accessible modal dialog (native <dialog>) ----------

export function Modal({
  open,
  title,
  onClose,
  children,
  description,
  variant = 'center',
  closeFocusRef,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  description?: string;
  variant?: 'center' | 'drawer';
  closeFocusRef?: RefObject<HTMLElement | null>;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      returnTo.current = document.activeElement as HTMLElement | null;
      d.showModal();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const handleClose = () => {
      // Return focus to the control that opened the dialog.
      (closeFocusRef?.current ?? returnTo.current)?.focus?.();
      if (open) onClose();
    };
    d.addEventListener('close', handleClose);
    return () => d.removeEventListener('close', handleClose);
  }, [open, onClose, closeFocusRef]);
  return (
    <dialog
      ref={ref}
      className={`${styles.dialog} ${variant === 'drawer' ? styles.drawer : ''}`}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      data-lenis-prevent
    >
      {open && (
        <div className={styles.dialogInner}>
          <header className={styles.dialogHead}>
            <h2 id={titleId}>{title}</h2>
            <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Close">
              <X size={18} aria-hidden />
            </button>
          </header>
          {description && (
            <p id={descId} className={styles.meta}>
              {description}
            </p>
          )}
          {children}
        </div>
      )}
    </dialog>
  );
}

// ---------- Replacement-ready illustrative image ----------

export type Illustration = { id: string; mediaId: string; alt: string; provenance: string };

export function IllustrativeImage({ image, className, caption = true, eager = false }: { image: Illustration; className?: string; caption?: boolean; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  const media = useMemo(() => byId(image.mediaId), [image.mediaId]);
  return (
    <figure className={`${styles.illustration} ${className ?? ''}`} data-image-id={image.id}>
      {failed || !media ? (
        <div className={styles.imageFallback}>
          <ImageOff size={22} aria-hidden />
          <span>Image unavailable</span>
          <span className={styles.srOnly}>{image.alt}</span>
        </div>
      ) : (
        <img src={media.src} alt={image.alt} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} />
      )}
      {caption && (
        <figcaption>
          <span>Illustrative image</span>
          <span className={styles.srOnly}> — source: {image.provenance}</span>
        </figcaption>
      )}
    </figure>
  );
}

// ---------- Form error summary with first-invalid focus ----------

export function ErrorSummary({ errors, title = 'Please fix the following', focusKey }: { errors: Array<{ id: string; message: string }>; title?: string; focusKey: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (errors.length && focusKey > 0) {
      // Move focus to the first invalid field; the summary remains available above it.
      const first = document.getElementById(errors[0].id);
      (first ?? ref.current)?.focus();
    }
    // Runs on each validation attempt (and when a new set of errors arrives).
  }, [focusKey, errors]);
  if (!errors.length) return null;
  return (
    <div ref={ref} className={styles.errorSummary} role="alert" tabIndex={-1}>
      <h3>{title}</h3>
      <ul>
        {errors.map((e) => (
          <li key={e.id}>
            <a
              href={`#${e.id}`}
              onClick={(ev) => {
                ev.preventDefault();
                document.getElementById(e.id)?.focus();
              }}
            >
              {e.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function fieldProps(id: string, errors: Array<{ id: string; message: string }>) {
  const err = errors.find((e) => e.id === id);
  return { id, 'aria-invalid': err ? true : undefined, 'aria-describedby': err ? `${id}-error` : undefined } as const;
}

export function FieldError({ id, errors }: { id: string; errors: Array<{ id: string; message: string }> }) {
  const err = errors.find((e) => e.id === id);
  return err ? (
    <span id={`${id}-error`} className={styles.fieldError}>
      {err.message}
    </span>
  ) : null;
}

export { styles };
