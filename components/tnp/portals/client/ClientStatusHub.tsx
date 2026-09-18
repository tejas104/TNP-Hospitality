'use client';

import {
  BadgeIndianRupee,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  FileClock,
  RefreshCcw,
  Search,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  Booking,
  Collection,
  MutationRequest,
  PreviewEvent,
  PreviewVariant,
  Quote,
} from '@/lib/contracts/preview';
import { getBrowserPreviewService } from '@/lib/services/preview';
import { collectionPresentation } from './localAction';
import styles from './ClientStatusHub.module.css';

const SELECTED_KEY = 'tnp-preview-a-client-selected-booking-v1';

const money = (paise: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);

const date = (value: string) =>
  new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

function requestKey(prefix: string) {
  const suffix =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${suffix}`;
}

type ViewState = 'loading' | 'ready' | 'empty' | 'error';
type QuoteNotice = { kind: 'success' | 'error'; message: string };

export function ClientStatusHub() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [events, setEvents] = useState<PreviewEvent[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [viewMessage, setViewMessage] = useState(
    'Loading connected client records...',
  );
  const [selectedId, setSelectedId] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [lookupNotice, setLookupNotice] = useState('');
  const [revisionReason, setRevisionReason] = useState(
    'Please clarify the sample service scope.',
  );
  const [quoteNotice, setQuoteNotice] = useState<QuoteNotice | null>(null);
  const [quoteBusy, setQuoteBusy] = useState(false);
  const [pendingApproval, setPendingApproval] =
    useState<MutationRequest<'clientApproveQuote'> | null>(null);
  const [pendingRevision, setPendingRevision] =
    useState<MutationRequest<'clientRequestQuoteRevision'> | null>(null);

  const load = useCallback(
    async (variant?: PreviewVariant, preferred?: string) => {
      setViewState('loading');
      setViewMessage('Loading connected client records...');
      const service = await getBrowserPreviewService();
      const options = variant ? { variant } : undefined;
      const [bookingResult, eventResult, quoteResult, collectionResult] =
        await Promise.all([
          service.listBookings(options),
          service.listEvents(options),
          service.listQuotes(undefined, options),
          service.listCollections(undefined, options),
        ]);
      const failure = [
        bookingResult,
        eventResult,
        quoteResult,
        collectionResult,
      ].find((result) => !result.ok);
      if (failure && !failure.ok) {
        const loading = failure.error.code === 'PREVIEW_LOADING';
        setViewState(loading ? 'loading' : 'error');
        setViewMessage(
          loading
            ? 'The synthetic client timeline is in its requested loading state.'
            : `${failure.error.code}: ${failure.error.message}`,
        );
        return;
      }
      if (
        !bookingResult.ok ||
        !eventResult.ok ||
        !quoteResult.ok ||
        !collectionResult.ok
      )
        return;
      const nextBookings = bookingResult.value.items;
      setBookings(nextBookings);
      setEvents(eventResult.value.items);
      setQuotes(quoteResult.value.items);
      setCollections(collectionResult.value.items);
      const empty = !nextBookings.length;
      setViewState(empty ? 'empty' : 'ready');
      setViewMessage(
        empty
          ? 'No client bookings exist in this synthetic preview state.'
          : 'Connected booking, event, quote and collection records ready.',
      );
      setSelectedId((current) => {
        let stored = '';
        try {
          stored = window.localStorage.getItem(SELECTED_KEY) ?? '';
        } catch {
          /* Selection remains available in memory. */
        }
        const candidate = preferred || current || stored;
        return nextBookings.some((item) => item.id === candidate)
          ? candidate
          : nextBookings[0]?.id || '';
      });
    },
    [],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    const onPreview = (event: Event) => {
      const variant = (event as CustomEvent<{ variant: PreviewVariant }>).detail
        .variant;
      void load(variant);
    };
    const onReset = () => {
      setLookupNotice('');
      setQuoteNotice(null);
      setQuoteBusy(false);
      setPendingApproval(null);
      setPendingRevision(null);
      void load();
    };
    const onSaved = (event: Event) =>
      void load(undefined, (event as CustomEvent<{ id: string }>).detail.id);
    window.addEventListener('tnp-preview-change', onPreview);
    window.addEventListener('tnp-preview-reset', onReset);
    window.addEventListener('tnp-a-booking-saved', onSaved);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('tnp-preview-change', onPreview);
      window.removeEventListener('tnp-preview-reset', onReset);
      window.removeEventListener('tnp-a-booking-saved', onSaved);
    };
  }, [load]);

  useEffect(() => {
    if (selectedId) {
      try {
        window.localStorage.setItem(SELECTED_KEY, selectedId);
      } catch {
        /* No persistence claim is made for selection. */
      }
    }
  }, [selectedId]);

  const visibleBookings = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return bookings.filter(
      (item) =>
        (statusFilter === 'all' || item.status === statusFilter) &&
        (!needle ||
          `${item.id} ${item.eventName} ${item.city}`
            .toLowerCase()
            .includes(needle)),
    );
  }, [bookings, search, statusFilter]);
  const booking = bookings.find((item) => item.id === selectedId);
  const linkedEvents = events.filter((item) => item.bookingId === selectedId);
  const linkedQuotes = quotes.filter((item) => item.bookingId === selectedId);
  const linkedCollections = collections.filter(
    (item) => item.bookingId === selectedId,
  );
  const quote = linkedQuotes[0];

  async function findMissingRecord() {
    setLookupNotice('Looking up a deliberately missing sample booking...');
    const result = await (
      await getBrowserPreviewService()
    ).getBooking('tnp-demo-booking-missing');
    setLookupNotice(
      result.ok
        ? `Unexpected record returned: ${result.value.id}`
        : `${result.error.code}: ${result.error.message}`,
    );
  }

  async function runApproval(request: MutationRequest<'clientApproveQuote'>) {
    setQuoteBusy(true);
    setPendingApproval(request);
    try {
      setQuoteNotice({
        kind: 'success',
        message: 'Applying the sample approval with version protection...',
      });
      const result = await (await getBrowserPreviewService()).mutate(request);
      if (!result.ok) {
        setPendingApproval(request);
        setQuoteNotice({
          kind: 'error',
          message: `${result.error.code}: ${result.error.message} No approval was applied.`,
        });
        return;
      }
      setPendingApproval(null);
      setQuotes((current) =>
        current.map((item) =>
          item.id === result.value.id ? result.value : item,
        ),
      );
      setQuoteNotice({
        kind: 'success',
        message: `${result.replayed ? 'Recovered' : 'Applied'} approval to ${result.value.id} version ${result.value.version}.`,
      });
    } catch {
      setQuoteNotice({
        kind: 'error',
        message:
          'The preview response was unavailable. Retry the same approval request to recover its outcome.',
      });
    } finally {
      setQuoteBusy(false);
    }
  }

  async function approve(stale = false) {
    if (!quote) return;
    const service = await getBrowserPreviewService();
    const request: MutationRequest<'clientApproveQuote'> = {
      requestKey: requestKey(stale ? 'a-quote-stale' : 'a-quote-approve'),
      expectedGeneration: await service.getGeneration(),
      actorId: 'tnp-demo-client-preview',
      operation: 'clientApproveQuote',
      payload: {
        quoteId: quote.id,
        expectedVersion: stale ? quote.version + 1 : quote.version,
      },
    };
    await runApproval(request);
  }

  async function runRevision(
    request: MutationRequest<'clientRequestQuoteRevision'>,
  ) {
    setQuoteBusy(true);
    setPendingRevision(request);
    try {
      setQuoteNotice({
        kind: 'success',
        message: 'Sending a version-aware sample revision request...',
      });
      const result = await (await getBrowserPreviewService()).mutate(request);
      if (!result.ok) {
        setPendingRevision(request);
        setQuoteNotice({
          kind: 'error',
          message: `${result.error.code}: ${result.error.message}`,
        });
        return;
      }
      setPendingRevision(null);
      setQuotes((current) =>
        current.map((item) =>
          item.id === result.value.id ? result.value : item,
        ),
      );
      setQuoteNotice({
        kind: 'success',
        message: `${result.replayed ? 'Recovered' : 'Saved'} revision request for ${result.value.id}.`,
      });
    } catch {
      setQuoteNotice({
        kind: 'error',
        message:
          'The preview response was unavailable. Retry the same revision request to recover its outcome.',
      });
    } finally {
      setQuoteBusy(false);
    }
  }

  async function requestRevision() {
    if (!quote) return;
    if (!revisionReason.trim()) {
      setQuoteNotice({
        kind: 'error',
        message: 'VALIDATION_ERROR: Add a reason before requesting revision.',
      });
      return;
    }
    const service = await getBrowserPreviewService();
    const request: MutationRequest<'clientRequestQuoteRevision'> = {
      requestKey: requestKey('a-quote-revision'),
      expectedGeneration: await service.getGeneration(),
      actorId: 'tnp-demo-client-preview',
      operation: 'clientRequestQuoteRevision',
      payload: {
        quoteId: quote.id,
        expectedVersion: quote.version,
        reason: revisionReason.trim(),
      },
    };
    await runRevision(request);
  }

  return (
    <section
      id="client-status"
      tabIndex={-1}
      className={styles.hub}
      aria-labelledby="client-status-title"
    >
      <header className={styles.header}>
        <div>
          <p className="section-kicker">CLIENT EVENT & FINANCE STATUS</p>
          <h2 id="client-status-title">
            Your plans,
            <br />
            <em>in one place.</em>
          </h2>
        </div>
        <p>
          Statuses are simulated. Collection records are client receipts, not
          worker payouts, and no payment is processed here.
        </p>
      </header>

      <output className={styles.viewState} data-state={viewState}>
        <span>{viewMessage}</span>
        {viewState === 'error' && (
          <button type="button" onClick={() => void load()}>
            <RefreshCcw size={15} /> Retry
          </button>
        )}
      </output>
      <p className={styles.recordCount}>
        {viewState === 'ready'
          ? `${visibleBookings.length} of ${bookings.length} sample bookings · select a record to follow its details`
          : 'Your records will appear when the sample data is available.'}
      </p>

      <div className={styles.workspace}>
        <aside className={styles.directory}>
          <div className={styles.filters}>
            <label>
              <span>Search bookings</span>
              <div>
                <Search size={16} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="ID, event or city"
                />
              </div>
            </label>
            <label>
              Status
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">All</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="confirmed">Confirmed</option>
              </select>
            </label>
          </div>
          <div className={styles.records}>
            {viewState === 'ready' &&
              visibleBookings.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={item.id === selectedId ? styles.selected : ''}
                  disabled={quoteBusy}
                  onClick={() => {
                    setSelectedId(item.id);
                    setLookupNotice('');
                    setQuoteNotice(null);
                    setPendingApproval(null);
                    setPendingRevision(null);
                  }}
                  aria-pressed={item.id === selectedId}
                >
                  <strong>{item.eventName}</strong>
                  <span>{item.id}</span>
                  <small>
                    {item.city} - {item.status}
                  </small>
                </button>
              ))}
            {viewState === 'ready' && !visibleBookings.length && (
              <div className={styles.empty}>
                <CircleAlert size={20} />
                <p>No booking matches these local filters.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('all');
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            className={styles.missing}
            onClick={() => void findMissingRecord()}
          >
            Check missing-record state
          </button>
          {lookupNotice && <output>{lookupNotice}</output>}
        </aside>

        <div className={styles.detail}>
          {viewState === 'ready' && booking ? (
            <>
              <div className={styles.bookingHeader}>
                <div>
                  <span className={styles.pill}>{booking.status}</span>
                  <h3>{booking.eventName}</h3>
                  <code>{booking.id}</code>
                </div>
                <strong>{money(booking.budgetPaise)}</strong>
              </div>
              <dl className={styles.meta}>
                <div>
                  <dt>City</dt>
                  <dd>{booking.city}</dd>
                </div>
                <div>
                  <dt>Venue ID</dt>
                  <dd>{booking.venueId}</dd>
                </div>
                <div>
                  <dt>Created</dt>
                  <dd>{date(booking.createdAt)}</dd>
                </div>
              </dl>

              <section className={styles.block}>
                <header>
                  <CalendarDays size={20} />
                  <div>
                    <h4>Linked event status</h4>
                    <p>Event identity remains distinct from the booking.</p>
                  </div>
                </header>
                {linkedEvents.length ? (
                  <div className={styles.eventGrid}>
                    {linkedEvents.map((item) => (
                      <article key={item.id}>
                        <span className={styles.pill}>{item.status}</span>
                        <strong>{item.name}</strong>
                        <code>{item.id}</code>
                        <small>{date(item.startsAt)}</small>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className={styles.inlineEmpty}>
                    No event has been linked to this sample booking yet.
                  </p>
                )}
              </section>

              <section className={styles.block}>
                <header>
                  <FileClock size={20} />
                  <div>
                    <h4>Version-aware quotation</h4>
                    <p>Actions retain the clicked version and generation.</p>
                  </div>
                </header>
                {quote ? (
                  <div className={styles.quote}>
                    <div className={styles.quoteTop}>
                      <div>
                        <span className={styles.pill}>{quote.status}</span>
                        <strong>{quote.issuingEntity}</strong>
                        <code>
                          {quote.id} - version {quote.version}
                        </code>
                      </div>
                      <strong>{money(quote.totalPaise)}</strong>
                    </div>
                    <ul>
                      {quote.lines.map((line) => (
                        <li key={line.id}>
                          <span>
                            {line.label} x {line.quantity}
                          </span>
                          <strong>{money(line.totalPaise)}</strong>
                        </li>
                      ))}
                    </ul>
                    {quote.revisionReason && (
                      <p>Current revision note: {quote.revisionReason}</p>
                    )}
                    <label>
                      Revision reason
                      <textarea
                        value={revisionReason}
                        onChange={(event) =>
                          setRevisionReason(event.target.value)
                        }
                      />
                    </label>
                    <div className={styles.quoteActions}>
                      <button
                        type="button"
                        onClick={() => void approve()}
                        disabled={quoteBusy}
                      >
                        Approve this version
                      </button>
                      <button
                        type="button"
                        onClick={() => void requestRevision()}
                        disabled={quoteBusy}
                      >
                        Request revision
                      </button>
                      <button
                        type="button"
                        className={styles.guard}
                        onClick={() => void approve(true)}
                        disabled={quoteBusy}
                      >
                        Demonstrate stale-version guard
                      </button>
                    </div>
                    {quoteNotice && (
                      <output
                        className={styles.quoteNotice}
                        data-kind={quoteNotice.kind}
                        aria-live="polite"
                      >
                        {quoteNotice.kind === 'error' ? (
                          <CircleAlert size={18} />
                        ) : (
                          <CheckCircle2 size={18} />
                        )}
                        {quoteNotice.message}
                      </output>
                    )}
                    {pendingApproval && !quoteBusy && (
                      <button
                        type="button"
                        className={styles.retry}
                        onClick={() => void runApproval(pendingApproval)}
                      >
                        Retry same approval request
                      </button>
                    )}
                    {pendingRevision && !quoteBusy && (
                      <button
                        type="button"
                        className={styles.retry}
                        onClick={() => void runRevision(pendingRevision)}
                      >
                        Retry same revision request
                      </button>
                    )}
                  </div>
                ) : (
                  <p className={styles.inlineEmpty}>
                    No quotation exists for this sample booking.
                  </p>
                )}
              </section>

              <section className={styles.block}>
                <header>
                  <BadgeIndianRupee size={20} />
                  <div>
                    <h4>Client collections - not worker payouts</h4>
                    <p>
                      A paid label is trusted only when its sample reference is
                      present.
                    </p>
                  </div>
                </header>
                {linkedCollections.length ? (
                  <div className={styles.collections}>
                    {linkedCollections.map((item) => {
                      const presentation = collectionPresentation(item);
                      return (
                        <article key={item.id} data-state={presentation.state}>
                          <div>
                            <span className={styles.pill}>
                              {presentation.label}
                            </span>
                            <strong>{money(item.amountPaise)}</strong>
                          </div>
                          <code>{item.id}</code>
                          <small>{presentation.description}</small>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <p className={styles.inlineEmpty}>
                    No client collection record exists. This does not imply
                    payment.
                  </p>
                )}
              </section>
            </>
          ) : (
            <div className={styles.blank}>
              <CircleAlert />
              <p>Select a sample booking to inspect its connected detail.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
