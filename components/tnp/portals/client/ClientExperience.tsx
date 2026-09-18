'use client';

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  MapPin,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  MutationRequest,
  Planner,
  PreviewVariant,
  Venue,
} from '@/lib/contracts/preview';
import { getBrowserPreviewService } from '@/lib/services/preview';
import {
  clientIllustrations,
  venueIllustration,
  type ClientIllustration,
} from './illustrative-media';
import { ClientStatusHub } from './ClientStatusHub';
import {
  actionFingerprint,
  bookingMatchesRequest,
  clearAction,
  readAction,
  serviceSuccessNotice,
  type StoredAction,
  tryWriteAction,
} from './localAction';
import styles from './ClientExperience.module.css';

const DRAFT_KEY = 'tnp-preview-a-client-booking-draft-v1';
const ACTION_KEY = 'tnp-preview-a-client-booking-action-v1';
const categories = [
  'Wedding',
  'Corporate',
  'Private Celebration',
  'Destination',
];
const steps = ['Venue', 'Planner', 'Details', 'Review'] as const;
type Step = (typeof steps)[number];
type Draft = {
  category: string;
  venueId: string;
  plannerId: string;
  eventName: string;
  city: string;
  budgetRupees: string;
  guestCount: string;
  notes: string;
  location: string;
  maxBudgetRupees: string;
  ownOnly: boolean;
  step: Step;
};
type BookingRequest = MutationRequest<'submitBooking'>;
type BookingReceipt = { id: string; message: string };

const initialDraft: Draft = {
  category: categories[0],
  venueId: '',
  plannerId: '',
  eventName: 'An evening of celebration',
  city: 'Jaipur',
  budgetRupees: '486000',
  guestCount: '300',
  notes:
    'Venue discovery, planner coordination and sample hospitality support.',
  location: 'All locations',
  maxBudgetRupees: '900000',
  ownOnly: false,
  step: 'Venue',
};

function readDraft(): Draft {
  if (typeof window === 'undefined') return initialDraft;
  try {
    const stored = JSON.parse(
      window.localStorage.getItem(DRAFT_KEY) ?? '{}',
    ) as Partial<Draft>;
    return {
      ...initialDraft,
      ...stored,
      step: steps.includes(stored.step as Step)
        ? (stored.step as Step)
        : 'Venue',
    };
  } catch {
    return initialDraft;
  }
}

function newKey(prefix: string) {
  const suffix =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${suffix}`;
}

function bookingPayload(draft: Draft) {
  return {
    venueId: draft.venueId,
    eventName: draft.eventName.trim(),
    city: draft.city.trim(),
    budgetPaise: Number(draft.budgetRupees) * 100,
    status: 'submitted' as const,
  };
}

const money = (paise: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);

export function ClientExperience() {
  const [draft, setDraft] = useState(initialDraft);
  const [draftReady, setDraftReady] = useState(false);
  const [draftStorage, setDraftStorage] = useState('Preparing local draft…');
  const [venues, setVenues] = useState<Venue[]>([]);
  const [planners, setPlanners] = useState<Planner[]>([]);
  const [catalogueState, setCatalogueState] = useState<
    'loading' | 'ready' | 'empty' | 'error'
  >('loading');
  const [catalogueMessage, setCatalogueMessage] = useState(
    'Loading the shared sample catalogue…',
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pending, setPending] =
    useState<MutationRequest<'submitBooking'> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const frame = window.requestAnimationFrame(() => {
      const restoredDraft = readDraft();
      setDraft(restoredDraft);
      setDraftReady(true);
      void (async () => {
        try {
          const action = readAction<BookingRequest, BookingReceipt>(
            window.localStorage,
            ACTION_KEY,
            'submitBooking',
          );
          if (!action) return;
          const service = await getBrowserPreviewService();
          const generation = await service.getGeneration();
          if (cancelled) return;
          const currentFingerprint = actionFingerprint(
            'submitBooking',
            bookingPayload(restoredDraft),
          );
          if (
            action.request.expectedGeneration !== generation ||
            action.fingerprint !== currentFingerprint
          ) {
            let cleared = true;
            try {
              clearAction(window.localStorage, ACTION_KEY);
            } catch {
              cleared = false;
            }
            setBookingId('');
            setPending(null);
            setNotice(
              `LOCAL_ACTION_UNAVAILABLE: The saved booking belongs to a different draft or preview generation and was ${cleared ? 'cleared' : 'quarantined for this page'}. Nothing was restored or replayed.`,
            );
            return;
          }
          if (action.status === 'success' && action.receipt) {
            const bookingResult = await service.getBooking(action.receipt.id);
            if (cancelled) return;
            if (
              !bookingResult.ok ||
              bookingResult.generation !== generation ||
              !bookingMatchesRequest(
                bookingResult.value,
                action.receipt.id,
                action.request.payload,
              )
            ) {
              let cleared = true;
              try {
                clearAction(window.localStorage, ACTION_KEY);
              } catch {
                cleared = false;
              }
              setBookingId('');
              setPending(null);
              setNotice(
                `LOCAL_ACTION_UNAVAILABLE: The saved booking receipt was missing, stale, or did not match its service record and was ${cleared ? 'cleared' : 'quarantined for this page'}. Nothing was restored or replayed.`,
              );
              return;
            }
            setBookingId(action.receipt.id);
            setPending(null);
            setNotice(
              `Restored ${action.receipt.id} from this browser's synthetic receipt. No duplicate booking was created.`,
            );
            return;
          }
          setPending(action.request);
          setNotice(
            action.errorMessage ||
              'An unfinished synthetic booking was restored. Retry keeps the same request identity.',
          );
        } catch {
          if (!cancelled) {
            let cleared = true;
            try {
              clearAction(window.localStorage, ACTION_KEY);
            } catch {
              cleared = false;
            }
            setBookingId('');
            setPending(null);
            setNotice(
              `LOCAL_ACTION_UNAVAILABLE: The saved booking action could not be read and was ${cleared ? 'cleared' : 'quarantined for this page'}. Nothing was submitted, restored, or reported as successful.`,
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
    if (!draftReady) return;
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        setDraftStorage('Draft saved in this browser');
      } catch {
        setDraftStorage(
          'Draft is in memory only. Browser storage is unavailable.',
        );
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [draft, draftReady]);
  const loadCatalogues = useCallback(async (variant?: PreviewVariant) => {
    const service = await getBrowserPreviewService();
    setCatalogueState('loading');
    setCatalogueMessage('Loading the shared sample catalogue…');
    const [venueResult, plannerResult] = await Promise.all([
      service.listVenues(variant ? { variant } : undefined),
      service.listPlanners(variant ? { variant } : undefined),
    ]);
    if (!venueResult.ok) {
      setCatalogueState(
        venueResult.error.code === 'PREVIEW_LOADING' ? 'loading' : 'error',
      );
      setCatalogueMessage(venueResult.error.message);
      return;
    }
    if (!plannerResult.ok) {
      setCatalogueState(
        plannerResult.error.code === 'PREVIEW_LOADING' ? 'loading' : 'error',
      );
      setCatalogueMessage(plannerResult.error.message);
      return;
    }
    setVenues(venueResult.value.items);
    setPlanners(plannerResult.value.items);
    const empty =
      !venueResult.value.items.length || !plannerResult.value.items.length;
    setCatalogueState(empty ? 'empty' : 'ready');
    setCatalogueMessage(
      empty
        ? 'No catalogue records exist in this sample state.'
        : 'Shared sample catalogue ready.',
    );
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => void loadCatalogues(), 0);
    return () => window.clearTimeout(timer);
  }, [loadCatalogues]);
  useEffect(() => {
    const onChange = (event: Event) => {
      const variant = (event as CustomEvent<{ variant: PreviewVariant }>).detail
        .variant;
      void loadCatalogues(variant);
    };
    const onReset = () => {
      try {
        clearAction(window.localStorage, ACTION_KEY);
      } catch {
        // The reset still clears in-memory evidence when storage is unavailable.
      }
      setBookingId('');
      setPending(null);
      setErrors({});
      setSubmitting(false);
      setNotice(
        'Shared preview reset detected. Prior-generation booking receipts and retries were cleared; your editable draft remains.',
      );
      void loadCatalogues();
    };
    window.addEventListener('tnp-preview-change', onChange);
    window.addEventListener('tnp-preview-reset', onReset);
    return () => {
      window.removeEventListener('tnp-preview-change', onChange);
      window.removeEventListener('tnp-preview-reset', onReset);
    };
  }, [loadCatalogues]);

  const locations = useMemo(
    () => ['All locations', ...new Set(venues.map((item) => item.city))],
    [venues],
  );
  const visibleVenues = useMemo(
    () =>
      venues.filter((venue) => {
        const maxPaise = Number(draft.maxBudgetRupees || 0) * 100;
        return (
          (draft.location === 'All locations' ||
            venue.city === draft.location) &&
          (!maxPaise || venue.budgetBandPaise.min <= maxPaise) &&
          (!draft.ownOnly || venue.isOwned)
        );
      }),
    [draft.location, draft.maxBudgetRupees, draft.ownOnly, venues],
  );
  const venue = venues.find((item) => item.id === draft.venueId);
  const planner = planners.find((item) => item.id === draft.plannerId);
  const stepIndex = steps.indexOf(draft.step);

  function update<Key extends keyof Draft>(key: Key, value: Draft[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
    if (
      ['venueId', 'eventName', 'city', 'budgetRupees'].includes(String(key))
    ) {
      setBookingId('');
      setPending(null);
      setNotice('');
    }
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }
  function validate(step: Step) {
    const next: Record<string, string> = {};
    if ((step === 'Venue' || step === 'Review') && !venue)
      next.venueId = 'Choose a sample venue before continuing.';
    if ((step === 'Planner' || step === 'Review') && !planner)
      next.plannerId = 'Choose a sample planner before continuing.';
    if (step === 'Details' || step === 'Review') {
      if (!draft.eventName.trim()) next.eventName = 'Event name is required.';
      if (!draft.city.trim()) next.city = 'City is required.';
      if (
        !Number.isInteger(Number(draft.budgetRupees)) ||
        Number(draft.budgetRupees) < 0
      )
        next.budgetRupees = 'Enter a whole-rupee sample budget.';
      if (
        !Number.isInteger(Number(draft.guestCount)) ||
        Number(draft.guestCount) < 1
      )
        next.guestCount = 'Enter at least one guest.';
    }
    setErrors(next);
    return !Object.keys(next).length;
  }
  function move(direction: -1 | 1) {
    if (direction === 1 && !validate(draft.step)) {
      window.requestAnimationFrame(() => {
        const content = document.getElementById(
          `booking-${draft.step.toLowerCase()}-step`,
        );
        (
          content?.querySelector<HTMLElement>('[aria-invalid="true"]') ??
          content
        )?.focus();
      });
      return;
    }
    moveAndFocus(
      steps[Math.max(0, Math.min(steps.length - 1, stepIndex + direction))],
    );
  }
  function moveAndFocus(step: Step) {
    update('step', step);
    window.requestAnimationFrame(() =>
      document.getElementById(`booking-${step.toLowerCase()}-step`)?.focus(),
    );
  }
  function persistBookingAction(
    action: StoredAction<BookingRequest, BookingReceipt>,
  ) {
    return tryWriteAction(window.localStorage, ACTION_KEY, action);
  }
  async function perform(request: BookingRequest) {
    const fingerprint = actionFingerprint(request.operation, request.payload);
    if (
      !persistBookingAction({
        storageVersion: 1,
        operation: request.operation,
        fingerprint,
        request,
        status: 'pending',
      })
    ) {
      setNotice(
        'LOCAL_ACTION_UNAVAILABLE: This booking was not submitted because its retry identity could not be saved.',
      );
      return;
    }
    setSubmitting(true);
    setNotice('Saving this labelled synthetic booking…');
    try {
      const result = await (await getBrowserPreviewService()).mutate(request);
      if (!result.ok) {
        const message = `${result.error.code}: ${result.error.message}`;
        const persisted = persistBookingAction({
          storageVersion: 1,
          operation: request.operation,
          fingerprint,
          request,
          status: 'error',
          errorMessage: message,
        });
        setNotice(
          persisted
            ? message
            : `${message} LOCAL_ACTION_UNAVAILABLE: The failed action identity could not be persisted; retry only on this page with the displayed same-request control.`,
        );
        setErrors(result.error.fieldErrors ?? {});
        return;
      }
      const message = `${result.replayed ? 'Recovered' : 'Saved'} ${result.value.id}. This is sample preview data, not a live booking.`;
      const persisted = persistBookingAction({
        storageVersion: 1,
        operation: request.operation,
        fingerprint,
        request,
        status: 'success',
        receipt: { id: result.value.id, message },
      });
      setBookingId(result.value.id);
      setPending(null);
      window.dispatchEvent(
        new CustomEvent('tnp-a-booking-saved', {
          detail: { id: result.value.id },
        }),
      );
      setNotice(serviceSuccessNotice(message, persisted));
    } catch {
      setNotice(
        'The preview response was unavailable. No receipt is confirmed here. Retry the same request to recover its outcome.',
      );
    } finally {
      setSubmitting(false);
    }
  }
  async function submit() {
    if (!validate('Review') || !venue || !planner) {
      moveAndFocus(!venue ? 'Venue' : !planner ? 'Planner' : 'Details');
      return;
    }
    const service = await getBrowserPreviewService();
    const generation = await service.getGeneration();
    const payload = bookingPayload(draft);
    const fingerprint = actionFingerprint('submitBooking', payload);
    try {
      const existing = readAction<BookingRequest, BookingReceipt>(
        window.localStorage,
        ACTION_KEY,
        'submitBooking',
      );
      if (
        existing?.fingerprint === fingerprint &&
        existing.request.expectedGeneration === generation
      ) {
        if (existing.status === 'success' && existing.receipt) {
          const bookingResult = await service.getBooking(existing.receipt.id);
          if (
            !bookingResult.ok ||
            bookingResult.generation !== generation ||
            !bookingMatchesRequest(
              bookingResult.value,
              existing.receipt.id,
              existing.request.payload,
            )
          ) {
            let cleared = true;
            try {
              clearAction(window.localStorage, ACTION_KEY);
            } catch {
              cleared = false;
            }
            setBookingId('');
            setPending(null);
            setNotice(
              `LOCAL_ACTION_UNAVAILABLE: The saved booking receipt was missing or mismatched and was ${cleared ? 'cleared' : 'quarantined for this page'}. Submit again only as an explicit new action.`,
            );
            return;
          }
          setBookingId(existing.receipt.id);
          setPending(null);
          setNotice(
            `Existing receipt ${existing.receipt.id} matches this unchanged synthetic booking. Start a new booking explicitly to create another record.`,
          );
          return;
        }
        setPending(existing.request);
        await perform(existing.request);
        return;
      }
      if (existing) {
        let cleared = true;
        try {
          clearAction(window.localStorage, ACTION_KEY);
        } catch {
          cleared = false;
        }
        setBookingId('');
        setPending(null);
        setNotice(
          `LOCAL_ACTION_UNAVAILABLE: The saved booking does not match this draft or preview generation and was ${cleared ? 'cleared' : 'quarantined for this page'}. Nothing was replayed; submit again to start an explicit new action.`,
        );
        return;
      }
    } catch {
      try {
        clearAction(window.localStorage, ACTION_KEY);
      } catch {
        // The unreadable journal remains quarantined in memory for this page.
      }
      setBookingId('');
      setPending(null);
      setNotice(
        'LOCAL_ACTION_UNAVAILABLE: The saved action was corrupt or unavailable and has been cleared or quarantined. Nothing was replayed; submit again to start an explicit new action.',
      );
      return;
    }
    const request: BookingRequest = {
      requestKey: newKey('a-booking'),
      expectedGeneration: generation,
      actorId: 'tnp-demo-client-preview',
      operation: 'submitBooking',
      payload,
    };
    setPending(request);
    await perform(request);
  }
  function clearDraft() {
    try {
      window.localStorage.removeItem(DRAFT_KEY);
      clearAction(window.localStorage, ACTION_KEY);
    } catch {
      setDraftStorage(
        'Local draft could not be cleared. Your current brief is unchanged.',
      );
      return;
    }
    setDraft(initialDraft);
    setErrors({});
    setBookingId('');
    setPending(null);
    setNotice(
      'Local A-lane draft cleared. Shared preview records were not reset.',
    );
  }
  function startNewBooking() {
    try {
      clearAction(window.localStorage, ACTION_KEY);
      setBookingId('');
      setPending(null);
      setNotice(
        'Ready for an explicit new synthetic booking. Your editable draft is unchanged.',
      );
    } catch {
      setNotice(
        'LOCAL_ACTION_UNAVAILABLE: The prior action could not be cleared, so a new submission has not started.',
      );
    }
  }

  return (
    <main className={`portal-page client-page ${styles.clientRoot}`}>
      <a className={styles.skip} href="#client-brief">
        Skip to your brief
      </a>
      <section className={styles.editorialHero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            THE CLIENT EXPERIENCE · SYNTHETIC PREVIEW
          </p>
          <h1>
            A place.
            <br />A partner.
            <br />
            <em>Your celebration.</em>
          </h1>
          <p>
            Begin with a setting that moves you. Bring the right people
            together. Shape the details, one considered choice at a time.
          </p>
          <a href="#client-brief" className={styles.primaryLink}>
            Start your sample brief <ArrowRight size={18} />
          </a>
          <small>
            No live reservation, verification, tracking or payment. Use sample
            information only.
          </small>
        </div>
        <ClientImage slot={clientIllustrations.introduction} hero />
      </section>
      <nav className={styles.localNav} aria-label="Client workspace sections">
        <span>YOUR CELEBRATION, CONSIDERED</span>
        <a href="#client-discovery">01 · Discover</a>
        <a href="#client-brief">02 · Build a brief</a>
        <a href="#client-status">03 · Follow your booking</a>
      </nav>
      <section id="client-discovery" className={styles.discovery}>
        <div>
          <p className={styles.eyebrow}>A LITTLE DIRECTION</p>
          <h2>
            What brings
            <br />
            <em>you together?</em>
          </h2>
          <p>
            Choose the context for your local brief. Your choice does not change
            sample availability or pricing.
          </p>
        </div>
        <div
          className={styles.categories}
          aria-label="Event category selection"
        >
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={draft.category === item ? styles.categoryActive : ''}
              onClick={() => update('category', item)}
              aria-pressed={draft.category === item}
            >
              {item}
              <ArrowRight size={18} />
            </button>
          ))}
        </div>
      </section>
      <section
        id="client-brief"
        tabIndex={-1}
        className={styles.wizard}
        aria-labelledby="booking-wizard-title"
      >
        <aside className={styles.intro}>
          <p className="section-kicker">FOUR-STEP BOOKING PREVIEW</p>
          <h2 id="booking-wizard-title">
            A few choices.
            <br />
            <em>A clearer picture.</em>
          </h2>
          <p>
            Your synthetic draft is stored only in this browser. Shared preview
            reset remains separate.
          </p>
          <dl className={styles.briefSummary}>
            <div>
              <dt>Occasion · local context</dt>
              <dd>{draft.category}</dd>
            </div>
            <div>
              <dt>Your setting</dt>
              <dd>{venue?.name || 'Choose a sample venue'}</dd>
            </div>
            <div>
              <dt>Your partner · local context</dt>
              <dd>{planner?.displayName || 'Choose a sample planner'}</dd>
            </div>
          </dl>
          <button
            type="button"
            className={styles.textButton}
            onClick={clearDraft}
          >
            <RotateCcw size={16} /> Clear local draft
          </button>
        </aside>
        <div className={styles.panel}>
          <ol className={styles.stepper} aria-label="Booking steps">
            {steps.map((step, index) => (
              <li
                key={step}
                className={index <= stepIndex ? styles.active : ''}
              >
                <button
                  type="button"
                  disabled={index > stepIndex}
                  aria-current={index === stepIndex ? 'step' : undefined}
                  onClick={() => index <= stepIndex && moveAndFocus(step)}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {step}
                </button>
              </li>
            ))}
          </ol>
          <p className={styles.stepCaption}>
            Step {stepIndex + 1} of 4 · {draft.step}
          </p>
          <output className={styles.status} aria-live="polite">
            <i data-state={catalogueState} />
            <p>{catalogueMessage}</p>
            {catalogueState === 'error' && (
              <button type="button" onClick={() => void loadCatalogues()}>
                Retry
              </button>
            )}
          </output>

          {draft.step === 'Venue' && (
            <div
              className={styles.content}
              id="booking-venue-step"
              tabIndex={-1}
            >
              <header>
                <span>01</span>
                <div>
                  <h3>Choose the setting.</h3>
                  <p>
                    Browse by city and sample budget. Photographs illustrate the
                    destination, not the named venue.
                  </p>
                </div>
              </header>
              <div className={styles.filters}>
                <label>
                  Location
                  <select
                    value={draft.location}
                    onChange={(event) => update('location', event.target.value)}
                  >
                    {locations.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Maximum sample budget (₹)
                  <input
                    inputMode="numeric"
                    value={draft.maxBudgetRupees}
                    onChange={(event) =>
                      update('maxBudgetRupees', event.target.value)
                    }
                  />
                </label>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={draft.ownOnly}
                    onChange={(event) =>
                      update('ownOnly', event.target.checked)
                    }
                  />{' '}
                  TNP-owned venues only
                </label>
              </div>
              {catalogueState === 'ready' && !visibleVenues.length ? (
                <div className={styles.empty}>
                  <CircleAlert size={22} />
                  <p>No sample venue matches those filters.</p>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((value) => ({
                        ...value,
                        location: 'All locations',
                        maxBudgetRupees: '900000',
                        ownOnly: false,
                      }))
                    }
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className={styles.choices}>
                  {catalogueState === 'ready' &&
                    visibleVenues.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={
                          draft.venueId === item.id
                            ? styles.selected
                            : styles.choice
                        }
                        onClick={() => {
                          update('venueId', item.id);
                          update('city', item.city);
                        }}
                        aria-pressed={draft.venueId === item.id}
                      >
                        {venueIllustration(item.city) && (
                          <ClientImage slot={venueIllustration(item.city)!} />
                        )}
                        <small>
                          <MapPin size={15} /> {item.city} · up to{' '}
                          {item.capacity}
                        </small>
                        <strong>{item.name}</strong>
                        <span>{item.recommendation}</span>
                        <em>
                          {item.isOwned
                            ? 'TNP-owned sample venue'
                            : 'Sample partner venue'}{' '}
                          · from {money(item.budgetBandPaise.min)}
                        </em>
                      </button>
                    ))}
                </div>
              )}
              {errors.venueId && (
                <p className={styles.error}>{errors.venueId}</p>
              )}
            </div>
          )}

          {draft.step === 'Planner' && (
            <div
              className={styles.content}
              id="booking-planner-step"
              tabIndex={-1}
            >
              <header>
                <span>02</span>
                <div>
                  <h3>Select a creative partner.</h3>
                  <p>
                    Scores are synthetic recommendation labels, not production
                    verification.
                  </p>
                </div>
              </header>
              <div className={styles.choices}>
                {catalogueState === 'ready' &&
                  planners.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={
                        draft.plannerId === item.id
                          ? styles.selected
                          : styles.choice
                      }
                      onClick={() => update('plannerId', item.id)}
                      aria-pressed={draft.plannerId === item.id}
                    >
                      <span className={styles.monogram} aria-hidden="true">
                        {item.displayName
                          .split(' ')
                          .slice(0, 2)
                          .map((word) => word[0])
                          .join('')}
                      </span>
                      <small>
                        <Sparkles size={15} /> Preview match{' '}
                        {item.recommendationScore}%
                      </small>
                      <strong>{item.displayName}</strong>
                      <span>{item.city}</span>
                      <em>
                        {item.verificationState.replace('-', ' ')} · sample
                        state
                      </em>
                    </button>
                  ))}
              </div>
              {errors.plannerId && (
                <p className={styles.error}>{errors.plannerId}</p>
              )}
            </div>
          )}

          {draft.step === 'Details' && (
            <div
              className={styles.content}
              id="booking-details-step"
              tabIndex={-1}
            >
              <header>
                <span>03</span>
                <div>
                  <h3>Give the brief its shape.</h3>
                  <p>
                    Use sample information only. Fields are validated before
                    review.
                  </p>
                </div>
              </header>
              <div className={styles.form}>
                <label>
                  Event name
                  <input
                    value={draft.eventName}
                    onChange={(event) =>
                      update('eventName', event.target.value)
                    }
                    aria-invalid={Boolean(errors.eventName)}
                    aria-describedby={
                      errors.eventName ? 'client-event-error' : undefined
                    }
                  />
                  {errors.eventName && (
                    <span id="client-event-error">{errors.eventName}</span>
                  )}
                </label>
                <label>
                  City
                  <input
                    value={draft.city}
                    onChange={(event) => update('city', event.target.value)}
                    aria-invalid={Boolean(errors.city)}
                    aria-describedby={
                      errors.city ? 'client-city-error' : undefined
                    }
                  />
                  {errors.city && (
                    <span id="client-city-error">{errors.city}</span>
                  )}
                </label>
                <label>
                  Sample budget (₹)
                  <input
                    inputMode="numeric"
                    value={draft.budgetRupees}
                    onChange={(event) =>
                      update('budgetRupees', event.target.value)
                    }
                    aria-invalid={Boolean(errors.budgetRupees)}
                    aria-describedby={
                      errors.budgetRupees ? 'client-budget-error' : undefined
                    }
                  />
                  {errors.budgetRupees && (
                    <span id="client-budget-error">{errors.budgetRupees}</span>
                  )}
                </label>
                <label>
                  Estimated guests
                  <input
                    inputMode="numeric"
                    value={draft.guestCount}
                    onChange={(event) =>
                      update('guestCount', event.target.value)
                    }
                    aria-invalid={Boolean(errors.guestCount)}
                    aria-describedby={
                      errors.guestCount ? 'client-guests-error' : undefined
                    }
                  />
                  {errors.guestCount && (
                    <span id="client-guests-error">{errors.guestCount}</span>
                  )}
                </label>
                <label className={styles.wide}>
                  Support notes
                  <textarea
                    value={draft.notes}
                    onChange={(event) => update('notes', event.target.value)}
                  />
                </label>
              </div>
            </div>
          )}

          {draft.step === 'Review' && (
            <div
              className={styles.content}
              id="booking-review-step"
              tabIndex={-1}
            >
              <header>
                <span>04</span>
                <div>
                  <h3>Review before the preview saves.</h3>
                  <p>
                    Planner and guest context stay in the local draft; the
                    frozen service stores the venue and core booking brief.
                  </p>
                </div>
              </header>
              <dl className={styles.review}>
                <div>
                  <dt>Experience</dt>
                  <dd>{draft.category}</dd>
                </div>
                <div>
                  <dt>Venue</dt>
                  <dd>{venue?.name ?? 'Not selected'}</dd>
                </div>
                <div>
                  <dt>Planner</dt>
                  <dd>{planner?.displayName ?? 'Not selected'}</dd>
                </div>
                <div>
                  <dt>Event</dt>
                  <dd>{draft.eventName}</dd>
                </div>
                <div>
                  <dt>City</dt>
                  <dd>{draft.city}</dd>
                </div>
                <div>
                  <dt>Budget / guests</dt>
                  <dd>
                    {money(Number(draft.budgetRupees || 0) * 100)} ·{' '}
                    {draft.guestCount}
                  </dd>
                </div>
              </dl>
              <div className={styles.reviewEdits} aria-label="Edit your brief">
                <button type="button" onClick={() => moveAndFocus('Venue')}>
                  Edit venue
                </button>
                <button type="button" onClick={() => moveAndFocus('Planner')}>
                  Edit planner
                </button>
                <button type="button" onClick={() => moveAndFocus('Details')}>
                  Edit details
                </button>
              </div>
              {(catalogueState !== 'ready' || !venue || !planner) && (
                <div className={styles.blocked} role="alert">
                  <CircleAlert size={20} />
                  <div>
                    <strong>This review cannot be submitted yet.</strong>
                    <p>
                      Restore the sample catalogue and choose both a venue and a
                      planner. Your editable draft is still available.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (catalogueState === 'error') void loadCatalogues();
                        moveAndFocus(!venue ? 'Venue' : 'Planner');
                      }}
                    >
                      Return to required selection
                    </button>
                  </div>
                </div>
              )}
              <button
                type="button"
                className="magnetic-btn dark"
                onClick={() => void submit()}
                disabled={
                  submitting || catalogueState !== 'ready' || !venue || !planner
                }
              >
                {submitting ? 'Saving sample…' : 'Submit synthetic booking'}
              </button>
              {notice && (
                <output
                  className={bookingId ? styles.success : styles.failure}
                  aria-live="polite"
                >
                  {bookingId ? <CheckCircle2 /> : <CircleAlert />}
                  <div>
                    <strong>{bookingId || 'No booking receipt yet'}</strong>
                    <p>{notice}</p>
                  </div>
                </output>
              )}
              {!bookingId && pending && !submitting && (
                <button
                  type="button"
                  className={styles.textButton}
                  onClick={() => void perform(pending)}
                >
                  Retry the same request safely
                </button>
              )}
              {bookingId && (
                <button
                  type="button"
                  className={styles.textButton}
                  onClick={startNewBooking}
                >
                  Start another synthetic booking
                </button>
              )}
            </div>
          )}

          <footer className={styles.actions}>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => move(-1)}
              disabled={!stepIndex}
            >
              <ArrowLeft size={17} /> Back
            </button>
            {stepIndex < steps.length - 1 && (
              <button
                type="button"
                className="magnetic-btn dark"
                onClick={() => move(1)}
              >
                Continue <ArrowRight size={17} />
              </button>
            )}
            <output>{draftStorage}</output>
          </footer>
        </div>
      </section>
      <ClientStatusHub />
    </main>
  );
}

function ClientImage({
  slot,
  hero = false,
}: {
  slot: ClientIllustration;
  hero?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const image = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (image.current?.complete && !image.current.naturalWidth) setFailed(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  return (
    <span className={`${styles.illustration} ${hero ? styles.heroImage : ''}`}>
      {failed ? (
        <span className={styles.imageFallback}>{slot.fallback}</span>
      ) : (
        <img
          ref={image}
          src={slot.src}
          alt={slot.alt}
          width={1600}
          height={900}
          loading={hero ? 'eager' : 'lazy'}
          decoding="async"
          style={{ objectPosition: slot.position }}
          onError={() => setFailed(true)}
        />
      )}
      <span className={styles.imageCaption}>
        {slot.caption}
        <small>{slot.source}</small>
      </span>
    </span>
  );
}
