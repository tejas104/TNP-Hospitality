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
  plannerMatchesRequest,
  readAction,
  reconcileReferencePair,
  requirementMatchesRequest,
  serviceSuccessNotice,
  type StoredAction,
  tryWriteAction,
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

function discardLocalAction(key: string) {
  try {
    clearAction(window.localStorage, key);
    return 'cleared';
  } catch {
    return 'quarantined for this page';
  }
}

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
        const service = await getBrowserPreviewService();
        const generation = await service.getGeneration();
        if (cancelled) return;
        let registrationAction: StoredAction<
          RegistrationRequest,
          ActionReceipt
        > | null = null;
        let requirementAction: StoredAction<
          RequirementRequest,
          ActionReceipt
        > | null = null;
        try {
          registrationAction = readAction<RegistrationRequest, ActionReceipt>(
            window.localStorage,
            REGISTRATION_ACTION_KEY,
            'registerPlanner',
          );
        } catch {
          setRegistrationId('');
          setPendingRegistration(null);
          setRegistrationNotice(
            `LOCAL_ACTION_UNAVAILABLE: The saved planner action could not be read and was ${discardLocalAction(REGISTRATION_ACTION_KEY)}. Nothing was restored or replayed.`,
          );
        }
        try {
          requirementAction = readAction<RequirementRequest, ActionReceipt>(
            window.localStorage,
            REQUIREMENT_ACTION_KEY,
            'submitRequirement',
          );
        } catch {
          setRequirementId('');
          setPendingRequirement(null);
          setRequirementNotice(
            `LOCAL_ACTION_UNAVAILABLE: The saved requirement action could not be read and was ${discardLocalAction(REQUIREMENT_ACTION_KEY)}. Nothing was restored or replayed.`,
          );
        }
        if (registrationAction) {
          const matchesDraft =
            registrationAction.request.expectedGeneration === generation &&
            registrationAction.fingerprint ===
              actionFingerprint(
                'registerPlanner',
                registrationPayload(restoredDraft),
              );
          if (!matchesDraft) {
            setRegistrationId('');
            setPendingRegistration(null);
            setRegistrationNotice(
              `LOCAL_ACTION_UNAVAILABLE: The saved registration belongs to another draft or preview generation and was ${discardLocalAction(REGISTRATION_ACTION_KEY)}. Nothing was restored or replayed.`,
            );
          } else if (
            registrationAction.status === 'success' &&
            registrationAction.receipt
          ) {
            const plannersResult = await service.listPlanners();
            if (cancelled) return;
            const planner = plannersResult.ok
              ? (plannersResult.value.items.find(
                  (item) => item.id === registrationAction.receipt?.id,
                ) ?? null)
              : null;
            if (
              !plannersResult.ok ||
              plannersResult.generation !== generation ||
              !plannerMatchesRequest(
                planner,
                registrationAction.receipt.id,
                registrationAction.request.payload,
              )
            ) {
              setRegistrationId('');
              setPendingRegistration(null);
              setRegistrationNotice(
                `LOCAL_ACTION_UNAVAILABLE: The saved planner receipt was missing, stale, or mismatched and was ${discardLocalAction(REGISTRATION_ACTION_KEY)}. Nothing was restored or replayed.`,
              );
            } else {
              setRegistrationId(registrationAction.receipt.id);
              setPendingRegistration(null);
              setRegistrationNotice(
                `Restored ${registrationAction.receipt.id} after confirming the current synthetic planner record. No duplicate planner was created.`,
              );
            }
          } else {
            setPendingRegistration(registrationAction.request);
            setRegistrationNotice(
              registrationAction.errorMessage ||
                'An unfinished planner registration was restored. Retry keeps the same request identity.',
            );
          }
        }
        if (requirementAction) {
          const matchesDraft =
            requirementAction.request.expectedGeneration === generation &&
            requirementAction.fingerprint ===
              actionFingerprint(
                'submitRequirement',
                requirementPayload(restoredDraft),
              );
          if (!matchesDraft) {
            setRequirementId('');
            setPendingRequirement(null);
            setRequirementNotice(
              `LOCAL_ACTION_UNAVAILABLE: The saved requirement belongs to another draft or preview generation and was ${discardLocalAction(REQUIREMENT_ACTION_KEY)}. Nothing was restored or replayed.`,
            );
          } else if (
            requirementAction.status === 'success' &&
            requirementAction.receipt
          ) {
            const requirementResult = await service.getRequirement(
              requirementAction.receipt.id,
            );
            if (cancelled) return;
            if (
              !requirementResult.ok ||
              requirementResult.generation !== generation ||
              !requirementMatchesRequest(
                requirementResult.value,
                requirementAction.receipt.id,
                requirementAction.request.payload,
              )
            ) {
              setRequirementId('');
              setPendingRequirement(null);
              setRequirementNotice(
                `LOCAL_ACTION_UNAVAILABLE: The saved requirement receipt was missing, stale, or mismatched and was ${discardLocalAction(REQUIREMENT_ACTION_KEY)}. Nothing was restored or replayed.`,
              );
            } else {
              setRequirementId(requirementAction.receipt.id);
              setPendingRequirement(null);
              setRequirementNotice(
                `Restored ${requirementAction.receipt.id} after confirming its current booking/event linkage. No duplicate requirement was created.`,
              );
            }
          } else {
            setPendingRequirement(requirementAction.request);
            setRequirementNotice(
              requirementAction.errorMessage ||
                'An unfinished requirement was restored. Retry keeps the same request identity.',
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
    return tryWriteAction(window.localStorage, REGISTRATION_ACTION_KEY, action);
  }

  function persistRequirement(
    action: StoredAction<RequirementRequest, ActionReceipt>,
  ) {
    return tryWriteAction(window.localStorage, REQUIREMENT_ACTION_KEY, action);
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
    ) {
      setRegistrationNotice(
        'LOCAL_ACTION_UNAVAILABLE: Registration was not submitted because its retry identity could not be saved.',
      );
      return;
    }
    setBusy('registration');
    setRegistrationNotice('Saving sample planner profile…');
    const result = await (await getBrowserPreviewService()).mutate(request);
    setBusy('');
    if (!result.ok) {
      const message = `${result.error.code}: ${result.error.message}`;
      const persisted = persistRegistration({
        storageVersion: 1,
        operation: request.operation,
        fingerprint,
        request,
        status: 'error',
        errorMessage: message,
      });
      setRegistrationId('');
      setRegistrationErrors(result.error.fieldErrors ?? {});
      setRegistrationNotice(
        persisted
          ? message
          : `${message} LOCAL_ACTION_UNAVAILABLE: The failed action identity could not be persisted; retry only on this page with the displayed same-request control.`,
      );
      return;
    }
    const message = `${result.replayed ? 'Recovered' : 'Saved'} ${result.value.id}. Verification remains a sample pending state.`;
    const persisted = persistRegistration({
      storageVersion: 1,
      operation: request.operation,
      fingerprint,
      request,
      status: 'success',
      receipt: { id: result.value.id, message },
    });
    setRegistrationId(result.value.id);
    setPendingRegistration(null);
    setRegistrationNotice(serviceSuccessNotice(message, persisted));
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
          const plannersResult = await service.listPlanners();
          const planner = plannersResult.ok
            ? (plannersResult.value.items.find(
                (item) => item.id === existing.receipt?.id,
              ) ?? null)
            : null;
          if (
            !plannersResult.ok ||
            plannersResult.generation !== generation ||
            !plannerMatchesRequest(
              planner,
              existing.receipt.id,
              existing.request.payload,
            )
          ) {
            setRegistrationId('');
            setPendingRegistration(null);
            setRegistrationNotice(
              `LOCAL_ACTION_UNAVAILABLE: The saved planner receipt was missing or mismatched and was ${discardLocalAction(REGISTRATION_ACTION_KEY)}. Submit again only as an explicit new action.`,
            );
            return;
          }
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
      if (existing) {
        setRegistrationId('');
        setPendingRegistration(null);
        setRegistrationNotice(
          `LOCAL_ACTION_UNAVAILABLE: The saved registration does not match this draft or preview generation and was ${discardLocalAction(REGISTRATION_ACTION_KEY)}. Nothing was replayed; submit again to start an explicit new action.`,
        );
        return;
      }
    } catch {
      discardLocalAction(REGISTRATION_ACTION_KEY);
      setRegistrationId('');
      setPendingRegistration(null);
      setRegistrationNotice(
        'LOCAL_ACTION_UNAVAILABLE: The saved registration was corrupt or unavailable and has been cleared or quarantined. Nothing was replayed; submit again to start an explicit new action.',
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
    ) {
      setRequirementNotice(
        'LOCAL_ACTION_UNAVAILABLE: Requirement was not submitted because its retry identity could not be saved.',
      );
      return;
    }
    setBusy('requirement');
    setRequirementNotice('Saving linked sample requirement…');
    const result = await (await getBrowserPreviewService()).mutate(request);
    setBusy('');
    if (!result.ok) {
      const message = `${result.error.code}: ${result.error.message}`;
      const persisted = persistRequirement({
        storageVersion: 1,
        operation: request.operation,
        fingerprint,
        request,
        status: 'error',
        errorMessage: message,
      });
      setRequirementId('');
      setRequirementErrors(result.error.fieldErrors ?? {});
      setRequirementNotice(
        persisted
          ? message
          : `${message} LOCAL_ACTION_UNAVAILABLE: The failed action identity could not be persisted; retry only on this page with the displayed same-request control.`,
      );
      return;
    }
    const message = `${result.replayed ? 'Recovered' : 'Saved'} ${result.value.id}, linked to ${result.value.bookingId} / ${result.value.eventId}.`;
    const persisted = persistRequirement({
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
    setRequirementNotice(serviceSuccessNotice(message, persisted));
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
          const requirementResult = await service.getRequirement(
            existing.receipt.id,
          );
          if (
            !requirementResult.ok ||
            requirementResult.generation !== generation ||
            !requirementMatchesRequest(
              requirementResult.value,
              existing.receipt.id,
              existing.request.payload,
            )
          ) {
            setRequirementId('');
            setPendingRequirement(null);
            setRequirementNotice(
              `LOCAL_ACTION_UNAVAILABLE: The saved requirement receipt was missing or mismatched and was ${discardLocalAction(REQUIREMENT_ACTION_KEY)}. Submit again only as an explicit new action.`,
            );
            return;
          }
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
      if (existing) {
        setRequirementId('');
        setPendingRequirement(null);
        setRequirementNotice(
          `LOCAL_ACTION_UNAVAILABLE: The saved requirement does not match this draft or preview generation and was ${discardLocalAction(REQUIREMENT_ACTION_KEY)}. Nothing was replayed; submit again to start an explicit new action.`,
        );
        return;
      }
    } catch {
      discardLocalAction(REQUIREMENT_ACTION_KEY);
      setRequirementId('');
      setPendingRequirement(null);
      setRequirementNotice(
        'LOCAL_ACTION_UNAVAILABLE: The saved requirement was corrupt or unavailable and has been cleared or quarantined. Nothing was replayed; submit again to start an explicit new action.',
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
