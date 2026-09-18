'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Enquiry, PreviewService } from '@/lib/contracts/preview';
import { getBrowserPreviewService } from '@/lib/services/preview';
import {
  ENQUIRY_JOURNAL,
  matchesEnquiry,
  readEnquiryAction,
  validateEnquiry,
  type EnquiryAction,
} from './enquiry-state';
import styles from './Public.module.css';

export default function EnquiryForm({
  interest = 'Event enquiry',
}: {
  interest?: string;
}) {
  const [fields, setFields] = useState({
    name: '',
    email: '',
    message: `${interest}: `,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('Loading your synthetic enquiry…');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<Enquiry | null>(null);
  const [action, setAction] = useState<EnquiryAction | null>(null);
  const service = useRef<PreviewService | null>(null);
  const locked = useRef(false);
  const notice = useRef<HTMLOutputElement>(null);
  const mounted = useRef(true);

  const restore = useCallback(async () => {
    setReady(false);
    try {
      service.current = await getBrowserPreviewService();
      const saved = readEnquiryAction(localStorage.getItem(ENQUIRY_JOURNAL));
      const generation = await service.current.getGeneration();
      if (!mounted.current) return;
      if (saved && saved.request.expectedGeneration === generation) {
        setAction(saved);
        setFields(saved.request.payload);
        let cursor: string | undefined;
        let record: Enquiry | undefined;
        do {
          const result = await service.current.listEnquiries({ cursor });
          if (!result.ok) throw new Error(result.error.message);
          record = result.value.items.find((item) =>
            matchesEnquiry(saved, item),
          );
          cursor = result.value.nextCursor ?? undefined;
        } while (!record && cursor);
        if (!mounted.current) return;
        setReceipt(record ?? null);
        setStatus(
          record
            ? 'Saved synthetic receipt restored from this browser. No email or external message was sent.'
            : 'An earlier attempt is available. Retry it with the same request identity to check its result safely.',
        );
      } else {
        setAction(null);
        setReceipt(null);
        setStatus(
          saved
            ? 'The preview was reset. Start a new synthetic enquiry; the old receipt is no longer current.'
            : 'Use sample details only. This preview stores the enquiry in this browser.',
        );
      }
      setReady(true);
    } catch {
      setStatus(
        'Could not load browser preview storage. Restore storage access, then reload this preview to retry.',
      );
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void Promise.resolve().then(restore);
    return () => {
      mounted.current = false;
    };
    // The journal is shared by this one public enquiry flow, across entry links.
  }, [restore]);

  useEffect(() => {
    let current = true;
    const checkGeneration = async () => {
      if (!action || !service.current) return;
      const generation = await service.current.getGeneration();
      if (current && generation !== action.request.expectedGeneration) {
        setReceipt(null);
        setStatus(
          'The preview was reset. This earlier receipt is no longer current. Start a new enquiry.',
        );
      }
    };
    window.addEventListener('tnp-preview-reset', checkGeneration);
    window.addEventListener('focus', checkGeneration);
    return () => {
      current = false;
      window.removeEventListener('tnp-preview-reset', checkGeneration);
      window.removeEventListener('focus', checkGeneration);
    };
  }, [action]);

  async function submit() {
    if (locked.current || !service.current) return;
    const payload = {
      name: fields.name.trim(),
      email: fields.email.trim(),
      message: fields.message.trim(),
    };
    const invalid = validateEnquiry(payload);
    if (!action && payload.message === `${interest}:`)
      invalid.message = 'Add a sample description of your plans.';
    setErrors(invalid);
    if (Object.keys(invalid).length) {
      setStatus('Check the highlighted fields.');
      document.getElementById(`enquiry-${Object.keys(invalid)[0]}`)?.focus();
      return;
    }
    locked.current = true;
    setBusy(true);
    setStatus('Saving a synthetic enquiry in this browser…');
    try {
      const generation = await service.current.getGeneration();
      const current = action ?? {
        request: {
          operation: 'submitEnquiry' as const,
          actorId: 'tnp-public-preview',
          requestKey: `public-enquiry:${crypto.randomUUID()}`,
          expectedGeneration: generation,
          payload,
        },
      };
      // Persist the exact request before invoking the shared mutation. Reload and
      // retries must never manufacture a second identity for the same action.
      localStorage.setItem(ENQUIRY_JOURNAL, JSON.stringify(current));
      setAction(current);
      const result = await service.current.mutate(current.request);
      if (!mounted.current) return;
      if (
        (await service.current.getGeneration()) !==
        current.request.expectedGeneration
      ) {
        setReceipt(null);
        setStatus(
          'STALE_GENERATION: The preview was reset during this attempt. Start a new enquiry; no old receipt is current.',
        );
        return;
      }
      if (result.ok) {
        const completed = { ...current, receiptId: result.value.id };
        setAction(completed);
        setReceipt(result.value);
        let journalSaved = true;
        try {
          localStorage.setItem(ENQUIRY_JOURNAL, JSON.stringify(completed));
        } catch {
          journalSaved = false;
        }
        setStatus(
          `${result.replayed ? 'Repeated request recovered the same receipt. No duplicate enquiry was created.' : 'Synthetic enquiry saved in this browser.'} No email or external message was sent.${journalSaved ? '' : ' Receipt shortcut could not be saved; retry the same request after reload to recover it.'}`,
        );
      } else {
        setErrors(result.error.fieldErrors ?? {});
        setStatus(
          `${result.error.code}: ${result.error.message}${result.error.code === 'STALE_GENERATION' ? ' The preview was reset. Start a new enquiry to use the current generation.' : ' Retry this same attempt, or start a new enquiry to edit it.'}`,
        );
        setReceipt(null);
      }
    } catch {
      setStatus(
        'The attempt could not be completed. Check browser storage access, then retry the same enquiry. No delivery is claimed.',
      );
    } finally {
      locked.current = false;
      if (mounted.current) {
        setBusy(false);
        notice.current?.focus();
      }
    }
  }

  function startNew() {
    try {
      localStorage.removeItem(ENQUIRY_JOURNAL);
    } catch {
      setStatus(
        'Could not clear the previous request shortcut. Restore browser storage access before starting a new enquiry.',
      );
      return;
    }
    setAction(null);
    setReceipt(null);
    setErrors({});
    setFields({ name: '', email: '', message: `${interest}: ` });
    setStatus(
      'New synthetic enquiry. Previous saved enquiries remain in the preview scenario.',
    );
    requestAnimationFrame(() =>
      document.getElementById('enquiry-name')?.focus(),
    );
  }

  return (
    <div className={styles.enquiry}>
      <p className={styles.notice}>
        Synthetic preview data. Do not enter real personal information. No live
        verification, tracking or payments. No email is sent.
      </p>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        aria-busy={busy}
      >
        <fieldset disabled={!ready || busy || !!action}>
          <legend className={styles.srOnly}>Sample enquiry details</legend>
          {(['name', 'email', 'message'] as const).map((field) => (
            <div className={styles.field} key={field}>
              <label htmlFor={`enquiry-${field}`}>
                {field === 'name'
                  ? 'Sample name'
                  : field === 'email'
                    ? 'Sample email'
                    : 'Tell us about your plans (sample only)'}{' '}
                <span aria-hidden="true">*</span>
              </label>
              {field === 'message' ? (
                <textarea
                  id={`enquiry-${field}`}
                  rows={5}
                  maxLength={2000}
                  required
                  value={fields[field]}
                  onChange={(event) =>
                    setFields({ ...fields, [field]: event.target.value })
                  }
                  aria-invalid={!!errors[field]}
                  aria-describedby={
                    errors[field] ? `${field}-error` : undefined
                  }
                />
              ) : (
                <input
                  id={`enquiry-${field}`}
                  type={field === 'email' ? 'email' : 'text'}
                  autoComplete="off"
                  maxLength={field === 'name' ? 100 : 254}
                  required
                  value={fields[field]}
                  onChange={(event) =>
                    setFields({ ...fields, [field]: event.target.value })
                  }
                  aria-invalid={!!errors[field]}
                  aria-describedby={
                    errors[field] ? `${field}-error` : undefined
                  }
                  placeholder={
                    field === 'name' ? 'Sample Guest' : 'guest@example.com'
                  }
                />
              )}
              {errors[field] && (
                <p id={`${field}-error`} className={styles.error}>
                  {errors[field]}
                </p>
              )}
            </div>
          ))}
        </fieldset>
        <output
          ref={notice}
          tabIndex={-1}
          aria-live="polite"
          className={styles.status}
        >
          {status}
        </output>
        {receipt && (
          <div className={styles.receipt}>
            <p>YOUR SYNTHETIC RECEIPT</p>
            <strong>{receipt.id}</strong>
            <p>
              Saved for {receipt.name}. Stored only in this browser’s preview
              scenario; not a confirmed booking or delivered message.
            </p>
          </div>
        )}
        <div className={styles.actions}>
          {ready ? (
            <button className={styles.button} type="submit" disabled={busy}>
              {busy
                ? 'Saving…'
                : action
                  ? receipt
                    ? 'Replay same request'
                    : 'Retry same enquiry'
                  : 'Save synthetic enquiry'}
            </button>
          ) : (
            <button
              className={styles.button}
              type="button"
              onClick={() => window.location.reload()}
            >
              Reload preview
            </button>
          )}
          {action && (
            <button
              className={styles.textButton}
              type="button"
              disabled={busy}
              onClick={startNew}
            >
              Start a new enquiry
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
