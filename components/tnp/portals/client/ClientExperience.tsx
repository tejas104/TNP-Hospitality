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
import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  MutationRequest,
  Planner,
  PreviewVariant,
  Venue,
} from '@/lib/contracts/preview';
import { getBrowserPreviewService } from '@/lib/services/preview';
import { byId } from '@/data/media';
import styles from './ClientExperience.module.css';

const DRAFT_KEY = 'tnp-preview-a-client-booking-draft-v1';
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

const money = (paise: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);

export function ClientExperience() {
  const [draft, setDraft] = useState(initialDraft);
  const [draftReady, setDraftReady] = useState(false);
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
    const frame = window.requestAnimationFrame(() => {
      setDraft(readDraft());
      setDraftReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    if (draftReady)
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
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
      setCatalogueState('error');
      setCatalogueMessage(venueResult.error.message);
      return;
    }
    if (!plannerResult.ok) {
      setCatalogueState('error');
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
    const onReset = () => void loadCatalogues();
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
    setNotice('');
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }
  function validate(step: Step) {
    const next: Record<string, string> = {};
    if (step === 'Venue' && !venue)
      next.venueId = 'Choose a sample venue before continuing.';
    if (step === 'Planner' && !planner)
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
    if (direction === 1 && !validate(draft.step)) return;
    update(
      'step',
      steps[Math.max(0, Math.min(steps.length - 1, stepIndex + direction))],
    );
  }
  async function perform(request: MutationRequest<'submitBooking'>) {
    setSubmitting(true);
    setNotice('Saving this labelled synthetic booking…');
    const result = await (await getBrowserPreviewService()).mutate(request);
    setSubmitting(false);
    if (!result.ok) {
      setNotice(`${result.error.code}: ${result.error.message}`);
      setErrors(result.error.fieldErrors ?? {});
      return;
    }
    setBookingId(result.value.id);
    setNotice(
      `${result.replayed ? 'Recovered' : 'Saved'} ${result.value.id}. This is sample preview data, not a live booking.`,
    );
  }
  async function submit() {
    if (!validate('Review') || !venue) return;
    const service = await getBrowserPreviewService();
    const request: MutationRequest<'submitBooking'> = {
      requestKey: newKey('a-booking'),
      expectedGeneration: await service.getGeneration(),
      actorId: 'tnp-demo-client-preview',
      operation: 'submitBooking',
      payload: {
        venueId: venue.id,
        eventName: draft.eventName.trim(),
        city: draft.city.trim(),
        budgetPaise: Number(draft.budgetRupees) * 100,
        status: 'submitted',
      },
    };
    setPending(request);
    await perform(request);
  }
  function clearDraft() {
    window.localStorage.removeItem(DRAFT_KEY);
    setDraft(initialDraft);
    setErrors({});
    setBookingId('');
    setPending(null);
    setNotice(
      'Local A-lane draft cleared. Shared preview records were not reset.',
    );
  }

  return (
    <main className={`portal-page client-page ${styles.clientRoot}`}>
      <section className="client-hero">
        <img
          src={byId('palace-courtyard').src}
          alt={byId('palace-courtyard').alt}
        />
        <div>
          <p className="eyebrow">CLIENT EXPERIENCE · SYNTHETIC PREVIEW</p>
          <h1>Shape the celebration, one considered choice at a time.</h1>
          <p>
            Explore sample venues and planners, keep a local draft, and create a
            connected preview booking. No live reservation, verification,
            tracking, or payment occurs.
          </p>
        </div>
      </section>
      <section className="client-discovery">
        <div className="category-stack" aria-label="Event category selection">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={draft.category === item ? 'active' : ''}
              onClick={() => update('category', item)}
              aria-pressed={draft.category === item}
            >
              {item}
              <ArrowRight size={18} />
            </button>
          ))}
        </div>
        <div className="concierge-panel">
          <span>{draft.category}</span>
          <h2>A concierge brief, not a ticket.</h2>
          <p>
            This guided preview keeps the editorial discovery experience while
            making every primary action testable and linked to the shared
            synthetic service.
          </p>
          <div className="concierge-images">
            <img src={byId('tablescape').src} alt={byId('tablescape').alt} />
            <img src={byId('hostess').src} alt={byId('hostess').alt} />
          </div>
        </div>
      </section>
      <section className={styles.wizard} aria-labelledby="booking-wizard-title">
        <aside className={styles.intro}>
          <p className="section-kicker">FOUR-STEP BOOKING PREVIEW</p>
          <h2 id="booking-wizard-title">
            Build a brief that survives the journey.
          </h2>
          <p>
            Your synthetic draft is stored only in this browser. Shared preview
            reset remains separate.
          </p>
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
                  onClick={() => index <= stepIndex && update('step', step)}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {step}
                </button>
              </li>
            ))}
          </ol>
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
            <div className={styles.content}>
              <header>
                <span>01</span>
                <div>
                  <h3>Choose the setting.</h3>
                  <p>“TNP-owned” follows the frozen sample catalogue flag.</p>
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
                  {visibleVenues.map((item) => (
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
                      <small>
                        <MapPin size={15} /> {item.city} · up to {item.capacity}
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
            <div className={styles.content}>
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
                {planners.map((item) => (
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
                    <small>
                      <Sparkles size={15} /> Preview match{' '}
                      {item.recommendationScore}%
                    </small>
                    <strong>{item.displayName}</strong>
                    <span>{item.city}</span>
                    <em>
                      {item.verificationState.replace('-', ' ')} · sample state
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
            <div className={styles.content}>
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
                  />
                  {errors.eventName && <span>{errors.eventName}</span>}
                </label>
                <label>
                  City
                  <input
                    value={draft.city}
                    onChange={(event) => update('city', event.target.value)}
                    aria-invalid={Boolean(errors.city)}
                  />
                  {errors.city && <span>{errors.city}</span>}
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
                  />
                  {errors.budgetRupees && <span>{errors.budgetRupees}</span>}
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
                  />
                  {errors.guestCount && <span>{errors.guestCount}</span>}
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
            <div className={styles.content}>
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
              <button
                type="button"
                className="magnetic-btn dark"
                onClick={() => void submit()}
                disabled={submitting}
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
                    <strong>{bookingId || 'Booking not saved'}</strong>
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
            <span>Draft saved locally</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
