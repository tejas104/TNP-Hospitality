'use client';

import { CheckCircle2, CircleAlert, CircleDot, RefreshCcw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PortalHero } from '@/components/tnp/shared/PortalHero';
import type {
  Booking,
  MutationRequest,
  PreviewEvent,
  PreviewVariant,
} from '@/lib/contracts/preview';
import { getBrowserPreviewService } from '@/lib/services/preview';
import { PlannerRequirements } from './PlannerRequirements';
import {
  actionFingerprint,
  clearAction,
  isValidReferencePair,
  readAction,
  reconcileReferencePair,
  type StoredAction,
  writeAction,
} from './localAction';
import styles from './PlannerPortal.module.css';

const DRAFT_KEY = 'tnp-preview-a-planner-entry-draft-v1';
const REGISTRATION_ACTION_KEY = 'tnp-preview-a-planner-registration-action-v1';
const REQUIREMENT_ACTION_KEY = 'tnp-preview-a-planner-requirement-action-v1';
const roles = [
  'Event Coordinator',
  'Executive',
  'Volunteer',
  'Hostess',
  'RSVP',
];
type Draft = {
  displayName: string;
  city: string;
  bookingId: string;
  eventId: string;
  role: string;
  quantity: string;
  notes: string;
};
type RegistrationRequest = MutationRequest<'registerPlanner'>;
type RequirementRequest = MutationRequest<'submitRequirement'>;
type ActionReceipt = { id: string; message: string };
const initialDraft: Draft = {
  displayName: 'Mehta Events & Experiences',
  city: 'Jaipur',
  bookingId: '',
  eventId: '',
  role: roles[0],
  quantity: '6',
  notes: 'Guest-facing English and Hindi communication.',
};

function key(prefix: string) {
  const value =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
  return `${prefix}-${value}`;
}

function readDraft(): Draft {
  if (typeof window === 'undefined') return initialDraft;
  try {
    return {
      ...initialDraft,
      ...(JSON.parse(
        window.localStorage.getItem(DRAFT_KEY) ?? '{}',
      ) as Partial<Draft>),
    };
  } catch {
    return initialDraft;
  }
}

const registrationPayload = (draft: Draft) => ({
  displayName: draft.displayName.trim(),
  city: draft.city.trim(),
});

const requirementPayload = (draft: Draft) => ({
  bookingId: draft.bookingId,
  eventId: draft.eventId,
  role: draft.role,
  quantity: Number(draft.quantity),
  notes: draft.notes.trim(),
  status: 'submitted' as const,
});

export function PlannerPortal() {
  const [draft, setDraft] = useState(initialDraft);
  const [draftReady, setDraftReady] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [events, setEvents] = useState<PreviewEvent[]>([]);
  const [referenceState, setReferenceState] = useState<
    'loading' | 'ready' | 'empty' | 'error'
  >('loading');
  const [referenceMessage, setReferenceMessage] = useState(
    'Loading connected sample records…',
  );
  const [registrationId, setRegistrationId] = useState('');
  const [requirementId, setRequirementId] = useState('');
  const [registrationNotice, setRegistrationNotice] = useState('');
  const [requirementNotice, setRequirementNotice] = useState('');
  const [registrationErrors, setRegistrationErrors] = useState<
    Record<string, string>
  >({});
  const [requirementErrors, setRequirementErrors] = useState<
    Record<string, string>
  >({});
  const [busy, setBusy] = useState<'registration' | 'requirement' | ''>('');
  const [pendingRegistration, setPendingRegistration] =
    useState<MutationRequest<'registerPlanner'> | null>(null);
  const [pendingRequirement, setPendingRequirement] =
    useState<MutationRequest<'submitRequirement'> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const frame = window.requestAnimationFrame(() => {
      const restoredDraft = readDraft();
      setDraft(restoredDraft);
      setDraftReady(true);
      void (async () => {
        try {
          const [registrationAction, requirementAction, generation] =
            await Promise.all([
              Promise.resolve(
                readAction<RegistrationRequest, ActionReceipt>(
                  window.localStorage,
                  REGISTRATION_ACTION_KEY,
                  'registerPlanner',
                ),
              ),
              Promise.resolve(
                readAction<RequirementRequest, ActionReceipt>(
                  window.localStorage,
                  REQUIREMENT_ACTION_KEY,
                  'submitRequirement',
                ),
              ),
              getBrowserPreviewService().then((service) =>
                service.getGeneration(),
              ),
            ]);
          if (cancelled) return;
          if (
            registrationAction?.request.expectedGeneration === generation &&
            registrationAction.fingerprint ===
              actionFingerprint(
                'registerPlanner',
                registrationPayload(restoredDraft),
              )
          ) {
            if (
              registrationAction.status === 'success' &&
              registrationAction.receipt
            ) {
              setRegistrationId(registrationAction.receipt.id);
              setRegistrationNotice(
                `Restored ${registrationAction.receipt.id} from this browser's synthetic receipt. No duplicate planner was created.`,
              );
            } else {
              setPendingRegistration(registrationAction.request);
              setRegistrationNotice(
                registrationAction.errorMessage ||
                  'An unfinished planner registration was restored. Retry keeps the same request identity.',
              );
            }
          }
          if (
            requirementAction?.request.expectedGeneration === generation &&
            requirementAction.fingerprint ===
              actionFingerprint(
                'submitRequirement',
                requirementPayload(restoredDraft),
              )
          ) {
            if (
              requirementAction.status === 'success' &&
              requirementAction.receipt
            ) {
              setRequirementId(requirementAction.receipt.id);
              setRequirementNotice(
                `Restored ${requirementAction.receipt.id} from this browser's synthetic receipt. No duplicate requirement was created.`,
              );
            } else {
              setPendingRequirement(requirementAction.request);
              setRequirementNotice(
                requirementAction.errorMessage ||
                  'An unfinished requirement was restored. Retry keeps the same request identity.',
              );
            }
          }
        } catch {
          if (!cancelled) {
            setRegistrationNotice(
              'LOCAL_ACTION_UNAVAILABLE: Saved planner actions could not be read. Nothing was reported as successful.',
            );
            setRequirementNotice(
              'LOCAL_ACTION_UNAVAILABLE: Saved requirement actions could not be read. Nothing was reported as successful.',
            );
          }
        }
      })();
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, []);
  useEffect(() => {
    if (draftReady)
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft, draftReady]);
  const loadReferences = useCallback(async (variant?: PreviewVariant) => {
    const service = await getBrowserPreviewService();
    setReferenceState('loading');
    setReferenceMessage('Loading connected sample records…');
    const [bookingResult, eventResult] = await Promise.all([
      service.listBookings(variant ? { variant } : undefined),
      service.listEvents(variant ? { variant } : undefined),
    ]);
    if (!bookingResult.ok) {
      setReferenceState('error');
      setReferenceMessage(bookingResult.error.message);
      return;
    }
    if (!eventResult.ok) {
      setReferenceState('error');
      setReferenceMessage(eventResult.error.message);
      return;
    }
    setBookings(bookingResult.value.items);
    setEvents(eventResult.value.items);
    const empty =
      !bookingResult.value.items.length || !eventResult.value.items.length;
    setReferenceState(empty ? 'empty' : 'ready');
    setReferenceMessage(
      empty
        ? 'No linked booking/event exists in this sample state.'
        : 'Connected sample records ready.',
    );
    setDraft((current) => ({
      ...current,
      ...reconcileReferencePair(
        bookingResult.value.items,
        eventResult.value.items,
        current,
      ),
    }));
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => void loadReferences(), 0);
    return () => window.clearTimeout(timer);
  }, [loadReferences]);
  useEffect(() => {
    const onChange = (event: Event) => {
      const variant = (event as CustomEvent<{ variant: PreviewVariant }>).detail
        .variant;
      void loadReferences(variant);
    };
    const onReset = () => {
      try {
        clearAction(window.localStorage, REGISTRATION_ACTION_KEY);
        clearAction(window.localStorage, REQUIREMENT_ACTION_KEY);
      } catch {
        // The reset still clears in-memory evidence when storage is unavailable.
      }
      setRegistrationId('');
      setRequirementId('');
      setPendingRegistration(null);
      setPendingRequirement(null);
      setRegistrationErrors({});
      setRequirementErrors({});
      setBusy('');
      setRegistrationNotice(
        'Shared preview reset detected. Prior-generation planner receipts and retries were cleared; your editable draft remains.',
      );
      setRequirementNotice(
        'Shared preview reset detected. Prior-generation requirement receipts and retries were cleared; your editable draft remains.',
      );
      void loadReferences();
    };
    window.addEventListener('tnp-preview-change', onChange);
    window.addEventListener('tnp-preview-reset', onReset);
    return () => {
      window.removeEventListener('tnp-preview-change', onChange);
      window.removeEventListener('tnp-preview-reset', onReset);
    };
  }, [loadReferences]);

  const matchingEvents = useMemo(
    () => events.filter((item) => item.bookingId === draft.bookingId),
    [draft.bookingId, events],
  );
  function update<Key extends keyof Draft>(field: Key, value: Draft[Key]) {
    setDraft((current) => {
      if (field === 'bookingId') {
        const firstEvent = events.find((event) => event.bookingId === value);
        return {
          ...current,
          bookingId: String(value),
          eventId: firstEvent?.id ?? '',
        };
      }
      return { ...current, [field]: value };
    });
    if (field === 'displayName' || field === 'city') {
      setRegistrationId('');
      setPendingRegistration(null);
      setRegistrationNotice('');
    }
    if (['bookingId', 'eventId', 'role', 'quantity', 'notes'].includes(field)) {
      setRequirementId('');
      setPendingRequirement(null);
      setRequirementNotice('');
    }
    setRegistrationErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
    setRequirementErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function persistRegistration(
    action: StoredAction<RegistrationRequest, ActionReceipt>,
  ) {
    try {
      writeAction(window.localStorage, REGISTRATION_ACTION_KEY, action);
      return true;
    } catch {
      setRegistrationNotice(
        'LOCAL_ACTION_UNAVAILABLE: Registration was not submitted because its retry identity could not be saved.',
      );
      return false;
    }
  }

  function persistRequirement(
    action: StoredAction<RequirementRequest, ActionReceipt>,
  ) {
    try {
      writeAction(window.localStorage, REQUIREMENT_ACTION_KEY, action);
      return true;
    } catch {
      setRequirementNotice(
        'LOCAL_ACTION_UNAVAILABLE: Requirement was not submitted because its retry identity could not be saved.',
      );
      return false;
    }
  }

  async function runRegistration(request: RegistrationRequest) {
    const fingerprint = actionFingerprint(request.operation, request.payload);
    if (
      !persistRegistration({
        storageVersion: 1,
        operation: request.operation,
        fingerprint,
        request,
        status: 'pending',
      })
    )
      return;
    setBusy('registration');
    setRegistrationNotice('Saving sample planner profile…');
    const result = await (await getBrowserPreviewService()).mutate(request);
    setBusy('');
    if (!result.ok) {
      const message = `${result.error.code}: ${result.error.message}`;
      persistRegistration({
        storageVersion: 1,
        operation: request.operation,
        fingerprint,
        request,
        status: 'error',
        errorMessage: message,
      });
      setRegistrationId('');
      setRegistrationErrors(result.error.fieldErrors ?? {});
      setRegistrationNotice(message);
      return;
    }
    const message = `${result.replayed ? 'Recovered' : 'Saved'} ${result.value.id}. Verification remains a sample pending state.`;
    persistRegistration({
      storageVersion: 1,
      operation: request.operation,
      fingerprint,
      request,
      status: 'success',
      receipt: { id: result.value.id, message },
    });
    setRegistrationId(result.value.id);
    setPendingRegistration(null);
    setRegistrationNotice(message);
  }
  async function registerPlanner() {
    const local: Record<string, string> = {};
    if (!draft.displayName.trim())
      local.displayName = 'Planner or company name is required.';
    if (!draft.city.trim()) local.city = 'City is required.';
    if (Object.keys(local).length) {
      setRegistrationErrors(local);
      setRegistrationNotice('Correct the required fields before saving.');
      return;
    }
    const service = await getBrowserPreviewService();
    const generation = await service.getGeneration();
    const payload = registrationPayload(draft);
    const fingerprint = actionFingerprint('registerPlanner', payload);
    try {
      const existing = readAction<RegistrationRequest, ActionReceipt>(
        window.localStorage,
        REGISTRATION_ACTION_KEY,
        'registerPlanner',
      );
      if (
        existing?.fingerprint === fingerprint &&
        existing.request.expectedGeneration === generation
      ) {
        if (existing.status === 'success' && existing.receipt) {
          setRegistrationId(existing.receipt.id);
          setPendingRegistration(null);
          setRegistrationNotice(
            `Existing receipt ${existing.receipt.id} matches this unchanged registration. Start a new registration explicitly to create another record.`,
          );
          return;
        }
        setPendingRegistration(existing.request);
        await runRegistration(existing.request);
        return;
      }
    } catch {
      setRegistrationNotice(
        'LOCAL_ACTION_UNAVAILABLE: The saved registration is corrupt or unavailable. Clear it explicitly before starting another submission.',
      );
      return;
    }
    const request: RegistrationRequest = {
      requestKey: key('a-planner'),
      expectedGeneration: generation,
      actorId: 'tnp-demo-planner-preview',
      operation: 'registerPlanner',
      payload,
    };
    setPendingRegistration(request);
    await runRegistration(request);
  }

  async function runRequirement(request: RequirementRequest) {
    const fingerprint = actionFingerprint(request.operation, request.payload);
    if (
      !persistRequirement({
        storageVersion: 1,
        operation: request.operation,
        fingerprint,
        request,
        status: 'pending',
      })
    )
      return;
    setBusy('requirement');
    setRequirementNotice('Saving linked sample requirement…');
    const result = await (await getBrowserPreviewService()).mutate(request);
    setBusy('');
    if (!result.ok) {
      const message = `${result.error.code}: ${result.error.message}`;
      persistRequirement({
        storageVersion: 1,
        operation: request.operation,
        fingerprint,
        request,
        status: 'error',
        errorMessage: message,
      });
      setRequirementId('');
      setRequirementErrors(result.error.fieldErrors ?? {});
      setRequirementNotice(message);
      return;
    }
    const message = `${result.replayed ? 'Recovered' : 'Saved'} ${result.value.id}, linked to ${result.value.bookingId} / ${result.value.eventId}.`;
    persistRequirement({
      storageVersion: 1,
      operation: request.operation,
      fingerprint,
      request,
      status: 'success',
      receipt: { id: result.value.id, message },
    });
    setRequirementId(result.value.id);
    setPendingRequirement(null);
    window.dispatchEvent(
      new CustomEvent('tnp-a-requirement-saved', {
        detail: { id: result.value.id },
      }),
    );
    setRequirementNotice(message);
  }
  async function submitRequirement() {
    const local: Record<string, string> = {};
    if (!draft.bookingId) local.bookingId = 'Choose a linked sample booking.';
    if (!draft.eventId) local.eventId = 'Choose a linked sample event.';
    if (
      draft.bookingId &&
      draft.eventId &&
      !isValidReferencePair(bookings, events, draft.bookingId, draft.eventId)
    ) {
      local.eventId =
        'Choose an event that belongs to the selected sample booking.';
    }
    if (!draft.role) local.role = 'Choose a role.';
    if (!Number.isInteger(Number(draft.quantity)) || Number(draft.quantity) < 1)
      local.quantity = 'Enter a positive whole quantity.';
    if (Object.keys(local).length) {
      setRequirementErrors(local);
      setRequirementNotice('Correct the required fields before saving.');
      return;
    }
    const service = await getBrowserPreviewService();
    const generation = await service.getGeneration();
    const payload = requirementPayload(draft);
    const fingerprint = actionFingerprint('submitRequirement', payload);
    try {
      const existing = readAction<RequirementRequest, ActionReceipt>(
        window.localStorage,
        REQUIREMENT_ACTION_KEY,
        'submitRequirement',
      );
      if (
        existing?.fingerprint === fingerprint &&
        existing.request.expectedGeneration === generation
      ) {
        if (existing.status === 'success' && existing.receipt) {
          setRequirementId(existing.receipt.id);
          setPendingRequirement(null);
          setRequirementNotice(
            `Existing receipt ${existing.receipt.id} matches this unchanged requirement. Start a new requirement explicitly to create another record.`,
          );
          return;
        }
        setPendingRequirement(existing.request);
        await runRequirement(existing.request);
        return;
      }
    } catch {
      setRequirementNotice(
        'LOCAL_ACTION_UNAVAILABLE: The saved requirement is corrupt or unavailable. Clear it explicitly before starting another submission.',
      );
      return;
    }
    const request: RequirementRequest = {
      requestKey: key('a-requirement'),
      expectedGeneration: generation,
      actorId: registrationId || 'tnp-demo-planner-preview',
      operation: 'submitRequirement',
      payload,
    };
    setPendingRequirement(request);
    await runRequirement(request);
  }

  function startNewRegistration() {
    try {
      clearAction(window.localStorage, REGISTRATION_ACTION_KEY);
      setRegistrationId('');
      setPendingRegistration(null);
      setRegistrationNotice(
        'Ready for an explicit new synthetic registration. Your editable draft is unchanged.',
      );
    } catch {
      setRegistrationNotice(
        'LOCAL_ACTION_UNAVAILABLE: The prior registration could not be cleared.',
      );
    }
  }

  function startNewRequirement() {
    try {
      clearAction(window.localStorage, REQUIREMENT_ACTION_KEY);
      setRequirementId('');
      setPendingRequirement(null);
      setRequirementNotice(
        'Ready for an explicit new synthetic requirement. Your editable draft is unchanged.',
      );
    } catch {
      setRequirementNotice(
        'LOCAL_ACTION_UNAVAILABLE: The prior requirement could not be cleared.',
      );
    }
  }

  return (
    <main className={`portal-page product-page ${styles.plannerRoot}`}>
      <PortalHero
        label="PLANNER PORTAL · SYNTHETIC PREVIEW"
        title="Plan beautiful events with serious workforce control."
        copy="Create labelled sample planner and requirement records through the shared preview service. No live verification, staffing or message is sent."
        image="event-hall"
      />
      <section
        className={styles.entrySection}
        aria-labelledby="planner-entry-title"
      >
        <header className={styles.sectionHeader}>
          <p className="section-kicker">PLANNER ENTRY</p>
          <h2 id="planner-entry-title">
            One brief, connected from the first sample ID.
          </h2>
          <p>
            These forms persist locally in this browser and write only to the
            shared synthetic scenario.
          </p>
        </header>
        <output className={styles.referenceState} aria-live="polite">
          <i data-state={referenceState} />
          <span>{referenceMessage}</span>
          {referenceState === 'error' && (
            <button type="button" onClick={() => void loadReferences()}>
              Retry
            </button>
          )}
        </output>
        <div className={styles.forms}>
          <form
            className="ops-card registration-card"
            onSubmit={(event) => {
              event.preventDefault();
              void registerPlanner();
            }}
            noValidate
          >
            <p className="section-kicker">01 · PLANNER REGISTRATION</p>
            <h2>Introduce the studio.</h2>
            <p className={styles.formCopy}>
              A saved profile remains pending sample verification; it grants no
              production authority.
            </p>
            <label>
              Planner or company name
              <input
                value={draft.displayName}
                onChange={(event) => update('displayName', event.target.value)}
                aria-invalid={Boolean(registrationErrors.displayName)}
              />
              {registrationErrors.displayName && (
                <span className={styles.fieldError}>
                  {registrationErrors.displayName}
                </span>
              )}
            </label>
            <label>
              Operating city
              <input
                value={draft.city}
                onChange={(event) => update('city', event.target.value)}
                aria-invalid={Boolean(registrationErrors.city)}
              />
              {registrationErrors.city && (
                <span className={styles.fieldError}>
                  {registrationErrors.city}
                </span>
              )}
            </label>
            <button
              type="submit"
              className="magnetic-btn dark"
              disabled={busy === 'registration'}
            >
              {busy === 'registration'
                ? 'Saving sample…'
                : 'Save sample planner'}
            </button>
            {registrationNotice && (
              <output
                className={registrationId ? styles.success : styles.failure}
              >
                {registrationId ? <CheckCircle2 /> : <CircleAlert />}
                <div>
                  <strong>{registrationId || 'Planner not saved'}</strong>
                  <p>{registrationNotice}</p>
                </div>
              </output>
            )}
            {!registrationId &&
              pendingRegistration &&
              busy !== 'registration' && (
                <button
                  type="button"
                  className={styles.retry}
                  onClick={() => void runRegistration(pendingRegistration)}
                >
                  <RefreshCcw size={15} /> Retry same request
                </button>
              )}
            {registrationId && (
              <button
                type="button"
                className={styles.retry}
                onClick={startNewRegistration}
              >
                Start another synthetic registration
              </button>
            )}
          </form>

          <form
            className="ops-card requirement-card"
            onSubmit={(event) => {
              event.preventDefault();
              void submitRequirement();
            }}
            noValidate
          >
            <p className="section-kicker">02 · WORKFORCE REQUIREMENT</p>
            <h2>Connect the ask.</h2>
            <p className={styles.formCopy}>
              Every sample requirement retains the selected booking and event
              identity.
            </p>
            <label>
              Linked booking
              <select
                value={draft.bookingId}
                onChange={(event) => update('bookingId', event.target.value)}
                aria-invalid={Boolean(requirementErrors.bookingId)}
              >
                <option value="">Choose booking</option>
                {bookings.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.id} · {item.eventName}
                  </option>
                ))}
              </select>
              {requirementErrors.bookingId && (
                <span className={styles.fieldError}>
                  {requirementErrors.bookingId}
                </span>
              )}
            </label>
            <label>
              Linked event
              <select
                value={draft.eventId}
                onChange={(event) => update('eventId', event.target.value)}
                aria-invalid={Boolean(requirementErrors.eventId)}
              >
                <option value="">Choose event</option>
                {matchingEvents.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.id} · {item.name}
                  </option>
                ))}
              </select>
              {requirementErrors.eventId && (
                <span className={styles.fieldError}>
                  {requirementErrors.eventId}
                </span>
              )}
            </label>
            <div className={styles.inlineFields}>
              <label>
                Role
                <select
                  value={draft.role}
                  onChange={(event) => update('role', event.target.value)}
                >
                  {roles.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label>
                Quantity
                <input
                  inputMode="numeric"
                  value={draft.quantity}
                  onChange={(event) => update('quantity', event.target.value)}
                  aria-invalid={Boolean(requirementErrors.quantity)}
                />
                {requirementErrors.quantity && (
                  <span className={styles.fieldError}>
                    {requirementErrors.quantity}
                  </span>
                )}
              </label>
            </div>
            <label>
              Sample instructions
              <textarea
                value={draft.notes}
                onChange={(event) => update('notes', event.target.value)}
              />
            </label>
            <button
              type="submit"
              className="magnetic-btn dark"
              disabled={busy === 'requirement' || referenceState !== 'ready'}
            >
              {busy === 'requirement'
                ? 'Saving sample…'
                : 'Submit sample requirement'}
            </button>
            {requirementNotice && (
              <output
                className={requirementId ? styles.success : styles.failure}
              >
                {requirementId ? <CheckCircle2 /> : <CircleAlert />}
                <div>
                  <strong>{requirementId || 'Requirement not saved'}</strong>
                  <p>{requirementNotice}</p>
                </div>
              </output>
            )}
            {!requirementId && pendingRequirement && busy !== 'requirement' && (
              <button
                type="button"
                className={styles.retry}
                onClick={() => void runRequirement(pendingRequirement)}
              >
                <RefreshCcw size={15} /> Retry same request
              </button>
            )}
            {requirementId && (
              <button
                type="button"
                className={styles.retry}
                onClick={startNewRequirement}
              >
                Start another synthetic requirement
              </button>
            )}
          </form>
        </div>
      </section>
      <PlannerRequirements />
      <section
        className="status-timeline ops-card"
        aria-label="Sample requirement stages"
      >
        <p className="section-kicker">SAMPLE REQUIREMENT STATUS</p>
        {[
          'Draft',
          'Verification',
          'Approved',
          'Published',
          'Team Filling',
          'Team Confirmed',
          'Completed',
        ].map((step, index) => (
          <span
            key={step}
            className={index < (requirementId ? 3 : 1) ? 'done' : ''}
          >
            <CircleDot size={16} />
            {step}
          </span>
        ))}
      </section>
    </main>
  );
}
