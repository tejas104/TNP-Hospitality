'use client';

import { CheckCircle2, CircleAlert, CircleDot, RefreshCcw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { plannerIllustration } from './illustrative-media';
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
  applicationState: string;
  experience: string;
  cities: string;
  categories: string;
  leadership: string;
  availability: string;
  consent: string;
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
  applicationState: 'saved draft',
  experience: '',
  cities: '',
  categories: '',
  leadership: '',
  availability: '',
  consent: '',
  displayName: 'Aarav Mehta',
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
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(DRAFT_KEY) ?? '{}',
    );
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
      return initialDraft;
    const restored = { ...initialDraft };
    for (const field of Object.keys(initialDraft) as (keyof Draft)[]) {
      const value = (parsed as Record<string, unknown>)[field];
      if (typeof value === 'string') restored[field] = value;
    }
    return restored;
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
  const [draftStorage, setDraftStorage] = useState('Preparing local draft…');
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
  const operationLock = useRef(false);
  const contextEpoch = useRef(0);
  const referenceSequence = useRef(0);
  const [pendingRegistration, setPendingRegistration] =
    useState<MutationRequest<'registerPlanner'> | null>(null);
  const [pendingRequirement, setPendingRequirement] =
    useState<MutationRequest<'submitRequirement'> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const context = contextEpoch;
    const epoch = contextEpoch.current;
    const frame = window.requestAnimationFrame(() => {
      const restoredDraft = readDraft();
      setDraft(restoredDraft);
      void (async () => {
        const service = await getBrowserPreviewService();
        const generation = await service.getGeneration();
        if (cancelled || epoch !== contextEpoch.current) return;
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
            if (cancelled || epoch !== contextEpoch.current) return;
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
            if (cancelled || epoch !== contextEpoch.current) return;
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
      })()
        .catch(() => {
          if (!cancelled && epoch === contextEpoch.current)
            setDraftStorage(
              'Draft is available on this page. Saved action restoration could not be verified.',
            );
        })
        .finally(() => {
          if (!cancelled) setDraftReady(true);
        });
    });
    return () => {
      cancelled = true;
      ++context.current;
      window.cancelAnimationFrame(frame);
    };
  }, []);
  useEffect(() => {
    if (!draftReady) return;
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        setDraftStorage(
          'Draft saved in this browser. Shared preview reset is separate.',
        );
      } catch {
        setDraftStorage(
          'Draft is in memory only. Browser storage is unavailable.',
        );
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [draft, draftReady]);
  const loadReferences = useCallback(async (variant?: PreviewVariant) => {
    const sequence = ++referenceSequence.current;
    setReferenceState('loading');
    setReferenceMessage('Loading connected sample records…');
    try {
      const service = await getBrowserPreviewService();
      const [bookingResult, eventResult] = await Promise.all([
        service.listBookings(variant ? { variant } : undefined),
        service.listEvents(variant ? { variant } : undefined),
      ]);
      if (sequence !== referenceSequence.current) return;
      if (!bookingResult.ok) {
        setReferenceState(
          bookingResult.error.code === 'PREVIEW_LOADING' ? 'loading' : 'error',
        );
        setReferenceMessage(bookingResult.error.message);
        return;
      }
      if (!eventResult.ok) {
        setReferenceState(
          eventResult.error.code === 'PREVIEW_LOADING' ? 'loading' : 'error',
        );
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
    } catch {
      if (sequence !== referenceSequence.current) return;
      setReferenceState('error');
      setReferenceMessage(
        'Connected sample records could not be loaded. Retry to restore the catalogue.',
      );
    }
  }, []);
  useEffect(() => {
    const references = referenceSequence;
    const timer = window.setTimeout(() => void loadReferences(), 0);
    return () => {
      window.clearTimeout(timer);
      ++references.current;
    };
  }, [loadReferences]);
  useEffect(() => {
    const onChange = (event: Event) => {
      const variant = (event as CustomEvent<{ variant: PreviewVariant }>).detail
        .variant;
      void loadReferences(variant);
    };
    const onReset = () => {
      ++contextEpoch.current;
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
  const selectedBooking = bookings.find((item) => item.id === draft.bookingId);
  const selectedEvent = matchingEvents.find(
    (item) => item.id === draft.eventId,
  );
  function focusInvalid(formId: string) {
    window.requestAnimationFrame(() =>
      document
        .querySelector<HTMLElement>(`#${formId} [aria-invalid="true"]`)
        ?.focus(),
    );
  }
  function update<Key extends keyof Draft>(field: Key, value: Draft[Key]) {
    if (operationLock.current) return;
    ++contextEpoch.current;
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
      return tryWriteAction(
        window.localStorage,
        REGISTRATION_ACTION_KEY,
        action,
      );
    } catch {
      return false;
    }
  }

  function persistRequirement(
    action: StoredAction<RequirementRequest, ActionReceipt>,
  ) {
    try {
      return tryWriteAction(
        window.localStorage,
        REQUIREMENT_ACTION_KEY,
        action,
      );
    } catch {
      return false;
    }
  }

  async function exclusively(
    kind: 'registration' | 'requirement',
    action: () => Promise<void>,
  ) {
    if (operationLock.current || !draftReady) return;
    operationLock.current = true;
    setBusy(kind);
    const epoch = contextEpoch.current;
    try {
      await action();
    } catch {
      if (epoch === contextEpoch.current)
        (kind === 'registration'
          ? setRegistrationNotice
          : setRequirementNotice)(
          'The preview service is unavailable. No new receipt was confirmed. Retry the same request if available.',
        );
    } finally {
      operationLock.current = false;
      setBusy('');
    }
  }

  async function runRegistration(request: RegistrationRequest) {
    const epoch = contextEpoch.current;
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
    setRegistrationNotice('Saving sample planner profile…');
    try {
      const result = await (await getBrowserPreviewService()).mutate(request);
      if (epoch !== contextEpoch.current) return;
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
        focusInvalid('planner-registration');
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
    } catch {
      if (epoch !== contextEpoch.current) return;
      setRegistrationNotice(
        'The preview response was unavailable. No receipt is confirmed here. Retry the same registration request to recover its outcome.',
      );
    }
  }
  async function registerPlanner() {
    const epoch = contextEpoch.current;
    const local: Record<string, string> = {};
    if (!draft.displayName.trim())
      local.displayName = 'Planner name is required.';
    if (!draft.city.trim()) local.city = 'City is required.';
    if (Object.keys(local).length) {
      setRegistrationErrors(local);
      setRegistrationNotice('Correct the required fields before saving.');
      focusInvalid('planner-registration');
      return;
    }
    const service = await getBrowserPreviewService();
    const generation = await service.getGeneration();
    if (epoch !== contextEpoch.current) return;
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
          if (epoch !== contextEpoch.current) return;
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
    const epoch = contextEpoch.current;
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
    setRequirementNotice('Saving linked sample requirement…');
    try {
      const result = await (await getBrowserPreviewService()).mutate(request);
      if (epoch !== contextEpoch.current) return;
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
        focusInvalid('planner-requirement');
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
    } catch {
      if (epoch !== contextEpoch.current) return;
      setRequirementNotice(
        'The preview response was unavailable. No receipt is confirmed here. Retry the same requirement request to recover its outcome.',
      );
    }
  }
  async function submitRequirement() {
    const epoch = contextEpoch.current;
    if (referenceState !== 'ready') return;
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
      focusInvalid('planner-requirement');
      return;
    }
    const service = await getBrowserPreviewService();
    const generation = await service.getGeneration();
    if (epoch !== contextEpoch.current) return;
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
          if (epoch !== contextEpoch.current) return;
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

  // Application intake belongs outside an authenticated Planner workspace.
  // Keep the legacy preview branch isolated for later extraction, but never
  // render it after a Planner has entered this demo workspace.
  const showPlannerApplication = false;
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={`portal-page product-page ${styles.plannerRoot}`}
    >
      <a className={styles.skip} href="#planner-requirement">
        Skip to planner tasks
      </a>
      <section className={styles.workspaceHero}>
        <div>
          <p className={styles.eyebrow}>
            PLANNER WORKSPACE · SYNTHETIC PREVIEW
          </p>
          <h1>Your planning workspace</h1>
          <p>
            Review event requirements, connect the workforce brief and inspect
            the current synthetic planning queue.
          </p>
          <small>
            No live verification, staffing or messages. Use sample information
            only.
          </small>
        </div>
        <PlannerImage />
      </section>
      <nav className={styles.localNav} aria-label="Planner workspace sections">
        <span>YOUR WORKSPACE</span>
        <a href="#planner-profile">01 · Planner overview</a>
        <a href="#planner-requirement">02 · Workforce brief</a>
        <a href="#planner-directory">03 · Requirement directory</a>
      </nav>
      <section
        className={styles.entrySection}
        aria-labelledby="planner-entry-title"
      >
        <header className={styles.sectionHeader}>
          <p className="section-kicker">PLANNER ENTRY</p>
          <h2 id="planner-entry-title">
            Planner tasks and workforce requirements
          </h2>
          <p>
            These task controls persist locally in this browser and write only
            to the shared synthetic scenario.
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
        <output className={styles.draftNotice}>{draftStorage}</output>
        <div className={styles.forms}>
          {showPlannerApplication ? (
            <form
              id="planner-registration"
              tabIndex={-1}
              aria-label="Sample planner registration"
              aria-busy={busy === 'registration'}
              className="ops-card registration-card"
              onSubmit={(event) => {
                event.preventDefault();
                void exclusively('registration', registerPlanner);
              }}
              noValidate
            >
              <fieldset
                className={styles.formFields}
                disabled={Boolean(busy) || !draftReady}
              >
                <legend className={styles.visuallyHidden}>
                  Planner profile
                </legend>
                <p className="section-kicker">01 · PLANNER REGISTRATION</p>
                <h2>Introduce yourself.</h2>
                <p className={styles.formCopy}>
                  A saved profile remains pending sample verification; it grants
                  no production authority.
                </p>
                <p className={styles.contextNote}>
                  {registrationId
                    ? `Profile receipt: ${registrationId} · verification pending in the sample`
                    : 'A planner profile is a sample record, not a production account.'}
                </p>
                <label>
                  Planner name
                  <input
                    value={draft.displayName}
                    onChange={(event) =>
                      update('displayName', event.target.value)
                    }
                    aria-invalid={Boolean(registrationErrors.displayName)}
                    aria-describedby={
                      registrationErrors.displayName
                        ? 'planner-name-error'
                        : undefined
                    }
                  />
                  {registrationErrors.displayName && (
                    <span id="planner-name-error" className={styles.fieldError}>
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
                    aria-describedby={
                      registrationErrors.city ? 'planner-city-error' : undefined
                    }
                  />
                  {registrationErrors.city && (
                    <span id="planner-city-error" className={styles.fieldError}>
                      {registrationErrors.city}
                    </span>
                  )}
                </label>
                <details className={styles.applicationEvidence}>
                  <summary>Professional profile details</summary>
                  <p>
                    These details stay in this browser as application
                    preparation. The connected sample registration stores name
                    and city only; it does not approve a senior planner.
                  </p>
                  {(
                    [
                      ['experience', 'Relevant experience'],
                      ['cities', 'Cities you can work in'],
                      ['categories', 'Event categories'],
                      ['leadership', 'Leadership experience'],
                      ['availability', 'Availability'],
                    ] as const
                  ).map(([field, label]) => (
                    <label key={field}>
                      {label}
                      <input
                        maxLength={300}
                        value={draft[field]}
                        onChange={(event) => update(field, event.target.value)}
                      />
                    </label>
                  ))}
                  <label>
                    <input
                      type="checkbox"
                      checked={draft.consent === 'yes'}
                      onChange={(event) =>
                        update('consent', event.target.checked ? 'yes' : '')
                      }
                    />{' '}
                    I understand that this is a synthetic application draft.
                  </label>
                  <label>
                    Application review scenario
                    <select
                      value={draft.applicationState}
                      onChange={(event) =>
                        update('applicationState', event.target.value)
                      }
                    >
                      {[
                        'saved draft',
                        'submitted',
                        'under review',
                        'revision requested',
                        'approved — unassigned',
                        'declined',
                        'suspended',
                      ].map((state) => (
                        <option key={state}>{state}</option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        [
                          'experience',
                          'cities',
                          'categories',
                          'leadership',
                          'availability',
                        ].some(
                          (field) => !draft[field as keyof Draft].trim(),
                        ) ||
                        draft.consent !== 'yes'
                      ) {
                        setRegistrationNotice(
                          'Complete professional details and consent before preparing the local submission.',
                        );
                        return;
                      }
                      update('applicationState', 'submitted');
                      setRegistrationNotice(
                        'Application prepared locally. No review service or assignment was invoked.',
                      );
                    }}
                  >
                    Prepare local application submission
                  </button>
                  <p>
                    Status: {draft.applicationState}.{' '}
                    {draft.applicationState === 'approved — unassigned'
                      ? 'No assigned events. Approval alone does not expose client briefs or workforce resources.'
                      : draft.applicationState === 'revision requested'
                        ? 'Sample revision: add specific leadership evidence before resubmitting.'
                        : draft.applicationState === 'suspended'
                          ? 'Coordination actions are unavailable in this review scenario.'
                          : 'No assignment or fulfilment access is granted.'}
                  </p>
                </details>
                <button
                  type="submit"
                  className="magnetic-btn dark"
                  disabled={Boolean(busy) || !draftReady}
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
                      <strong>
                        {registrationId || 'No planner receipt yet'}
                      </strong>
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
                      onClick={() =>
                        void exclusively('registration', () =>
                          runRegistration(pendingRegistration),
                        )
                      }
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
              </fieldset>
            </form>
          ) : (
            <article
              id="planner-profile"
              tabIndex={-1}
              className="ops-card registration-card"
              aria-labelledby="planner-overview-title"
            >
              <p className="section-kicker">01 · ACTIVE PLANNER</p>
              <h2 id="planner-overview-title">
                Welcome back, {draft.displayName || 'Planner'}.
              </h2>
              <p className={styles.formCopy}>
                You are already inside the Planner workspace. Applicant
                onboarding stays outside this area; continue with the live demo
                tasks and linked event requirements.
              </p>
              <div className={styles.linkedContext}>
                <span>CURRENT DEMO CONTEXT</span>
                <strong>{draft.city || 'TNP planning desk'}</strong>
                <p>
                  Synthetic identity active · no production authentication,
                  assignment authority or client data is granted.
                </p>
              </div>
              <a className="magnetic-btn dark" href="#planner-requirement">
                Review workforce brief
              </a>
            </article>
          )}

          <form
            id="planner-requirement"
            tabIndex={-1}
            aria-label="Sample workforce requirement"
            aria-busy={busy === 'requirement'}
            className="ops-card requirement-card"
            onSubmit={(event) => {
              event.preventDefault();
              void exclusively('requirement', submitRequirement);
            }}
            noValidate
          >
            <fieldset
              className={styles.formFields}
              disabled={Boolean(busy) || !draftReady}
            >
              <legend className={styles.visuallyHidden}>
                Connected workforce brief
              </legend>
              <p className="section-kicker">02 · WORKFORCE REQUIREMENT</p>
              <h2>Connect the ask.</h2>
              <p className={styles.formCopy}>
                Every sample requirement retains the selected booking and event
                identity.
              </p>
              <aside
                className={styles.linkedContext}
                aria-label="Selected requirement context"
              >
                <span>CONNECTED CONTEXT</span>
                <strong>
                  {referenceState === 'ready'
                    ? selectedBooking?.eventName || 'Choose a booking'
                    : 'Sample references unavailable'}
                </strong>
                <p>
                  {referenceState === 'ready'
                    ? selectedEvent
                      ? `${selectedEvent.name} · ${selectedEvent.status} · ${selectedEvent.timezone}`
                      : 'No linked event selected'
                    : 'Restore the reference catalogue before submitting.'}
                </p>
                {referenceState === 'ready' && selectedEvent && (
                  <code>{selectedEvent.id}</code>
                )}
              </aside>
              <label>
                Linked booking
                <select
                  value={draft.bookingId}
                  onChange={(event) => update('bookingId', event.target.value)}
                  aria-invalid={Boolean(requirementErrors.bookingId)}
                  aria-describedby={
                    requirementErrors.bookingId
                      ? 'planner-booking-error'
                      : undefined
                  }
                  disabled={referenceState !== 'ready'}
                >
                  <option value="">Choose booking</option>
                  {bookings.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.id} · {item.eventName}
                    </option>
                  ))}
                </select>
                {requirementErrors.bookingId && (
                  <span
                    id="planner-booking-error"
                    className={styles.fieldError}
                  >
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
                  aria-describedby={
                    requirementErrors.eventId
                      ? 'planner-event-error'
                      : undefined
                  }
                  disabled={referenceState !== 'ready'}
                >
                  <option value="">Choose event</option>
                  {matchingEvents.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.id} · {item.name}
                    </option>
                  ))}
                </select>
                {requirementErrors.eventId && (
                  <span id="planner-event-error" className={styles.fieldError}>
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
                    aria-invalid={Boolean(requirementErrors.role)}
                    aria-describedby={
                      requirementErrors.role ? 'planner-role-error' : undefined
                    }
                  >
                    {roles.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                  {requirementErrors.role && (
                    <span id="planner-role-error" className={styles.fieldError}>
                      {requirementErrors.role}
                    </span>
                  )}
                </label>
                <label>
                  Quantity
                  <input
                    inputMode="numeric"
                    value={draft.quantity}
                    onChange={(event) => update('quantity', event.target.value)}
                    aria-invalid={Boolean(requirementErrors.quantity)}
                    aria-describedby={
                      requirementErrors.quantity
                        ? 'planner-quantity-error'
                        : undefined
                    }
                  />
                  {requirementErrors.quantity && (
                    <span
                      id="planner-quantity-error"
                      className={styles.fieldError}
                    >
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
                disabled={
                  Boolean(busy) || !draftReady || referenceState !== 'ready'
                }
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
                    <strong>
                      {requirementId || 'No requirement receipt yet'}
                    </strong>
                    <p>{requirementNotice}</p>
                  </div>
                </output>
              )}
              {!requirementId &&
                pendingRequirement &&
                busy !== 'requirement' && (
                  <button
                    type="button"
                    className={styles.retry}
                    onClick={() =>
                      void exclusively('requirement', () =>
                        runRequirement(pendingRequirement),
                      )
                    }
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
            </fieldset>
          </form>
        </div>
      </section>
      <PlannerRequirements />
      <section
        className={styles.illustrativeJourney}
        aria-label="Illustrative wider service journey"
      >
        <p className="section-kicker">
          THE WIDER SERVICE JOURNEY · ILLUSTRATIVE ONLY
        </p>
        <p>
          These stages explain a possible wider workflow, not the status of your
          requirement. No verification, approval, publication or staffing is
          performed here. The directory above shows actual sample record
          statuses.
        </p>
        {[
          'Draft',
          'Verification',
          'Approved',
          'Published',
          'Team Filling',
          'Team Confirmed',
          'Completed',
        ].map((step, index) => (
          <span key={step} className={styles.journeyStage}>
            <CircleDot size={16} />
            <small>{String(index + 1).padStart(2, '0')}</small> {step}
          </span>
        ))}
      </section>
    </main>
  );
}

function PlannerImage() {
  const [failed, setFailed] = useState(false);
  const image = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (image.current?.complete && !image.current.naturalWidth)
        setFailed(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  return (
    <figure className={styles.contextImage}>
      {failed ? (
        <div className={styles.imageFallback}>
          {plannerIllustration.fallback}
        </div>
      ) : (
        <img
          ref={image}
          src={plannerIllustration.src}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          alt={plannerIllustration.alt}
          width={1600}
          height={1274}
          style={{ objectPosition: plannerIllustration.position }}
          onError={() => setFailed(true)}
        />
      )}
      <figcaption>
        {plannerIllustration.caption}
        <small>{plannerIllustration.source}</small>
      </figcaption>
    </figure>
  );
}
