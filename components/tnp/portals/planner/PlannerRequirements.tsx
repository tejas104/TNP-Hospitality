'use client';

import {
  BriefcaseBusiness,
  CalendarClock,
  CircleAlert,
  RefreshCcw,
  Search,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  Booking,
  PreviewEvent,
  PreviewVariant,
  Requirement,
} from '@/lib/contracts/preview';
import { getBrowserPreviewService } from '@/lib/services/preview';
import styles from './PlannerRequirements.module.css';

const SELECTED_KEY = 'tnp-preview-a-planner-selected-requirement-v1';
type ViewState = 'loading' | 'ready' | 'empty' | 'error';

export function PlannerRequirements() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [events, setEvents] = useState<PreviewEvent[]>([]);
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [message, setMessage] = useState('Loading workforce requirements...');
  const [selectedId, setSelectedId] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [lookupNotice, setLookupNotice] = useState('');

  const load = useCallback(
    async (variant?: PreviewVariant, preferred?: string) => {
      setViewState('loading');
      setMessage('Loading workforce requirements...');
      const service = await getBrowserPreviewService();
      const options = variant ? { variant } : undefined;
      const [requirementResult, bookingResult, eventResult] = await Promise.all(
        [
          service.listRequirements(options),
          service.listBookings(options),
          service.listEvents(options),
        ],
      );
      const failure = [requirementResult, bookingResult, eventResult].find(
        (result) => !result.ok,
      );
      if (failure && !failure.ok) {
        const loading = failure.error.code === 'PREVIEW_LOADING';
        setViewState(loading ? 'loading' : 'error');
        setMessage(
          loading
            ? 'The synthetic requirement list is in its requested loading state.'
            : `${failure.error.code}: ${failure.error.message}`,
        );
        return;
      }
      if (!requirementResult.ok || !bookingResult.ok || !eventResult.ok) return;
      const next = requirementResult.value.items;
      setRequirements(next);
      setBookings(bookingResult.value.items);
      setEvents(eventResult.value.items);
      setViewState(next.length ? 'ready' : 'empty');
      setMessage(
        next.length
          ? 'Connected requirement records ready.'
          : 'No workforce requirements exist in this synthetic preview state.',
      );
      setSelectedId((current) => {
        const stored = window.localStorage.getItem(SELECTED_KEY) ?? '';
        const candidate = preferred || current || stored;
        return next.some((item) => item.id === candidate)
          ? candidate
          : next[0]?.id || '';
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
    const onReset = () => void load();
    const onSaved = (event: Event) =>
      void load(undefined, (event as CustomEvent<{ id: string }>).detail.id);
    window.addEventListener('tnp-preview-change', onPreview);
    window.addEventListener('tnp-preview-reset', onReset);
    window.addEventListener('tnp-a-requirement-saved', onSaved);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('tnp-preview-change', onPreview);
      window.removeEventListener('tnp-preview-reset', onReset);
      window.removeEventListener('tnp-a-requirement-saved', onSaved);
    };
  }, [load]);

  useEffect(() => {
    if (selectedId) window.localStorage.setItem(SELECTED_KEY, selectedId);
  }, [selectedId]);

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return requirements.filter(
      (item) =>
        (status === 'all' || item.status === status) &&
        (!needle ||
          `${item.id} ${item.role} ${item.bookingId} ${item.eventId}`
            .toLowerCase()
            .includes(needle)),
    );
  }, [requirements, search, status]);
  const requirement = requirements.find((item) => item.id === selectedId);
  const booking = bookings.find((item) => item.id === requirement?.bookingId);
  const event = events.find((item) => item.id === requirement?.eventId);
  const stages = ['draft', 'submitted', 'staffing'] as const;
  const activeStage = requirement ? stages.indexOf(requirement.status) : -1;

  async function findMissingRecord() {
    setLookupNotice('Looking up a deliberately missing sample requirement...');
    const result = await (
      await getBrowserPreviewService()
    ).getRequirement('tnp-demo-requirement-missing');
    setLookupNotice(
      result.ok
        ? `Unexpected record returned: ${result.value.id}`
        : `${result.error.code}: ${result.error.message}`,
    );
  }

  return (
    <section
      className={styles.section}
      aria-labelledby="requirement-list-title"
    >
      <header className={styles.header}>
        <div>
          <p className="section-kicker">REQUIREMENT DIRECTORY</p>
          <h2 id="requirement-list-title">
            Trace every role back to its event.
          </h2>
        </div>
        <p>
          Search and select connected sample requirements. Status here does not
          mean a live team has been staffed.
        </p>
      </header>
      <output className={styles.state} data-state={viewState}>
        <span>{message}</span>
        {viewState === 'error' && (
          <button type="button" onClick={() => void load()}>
            <RefreshCcw size={15} /> Retry
          </button>
        )}
      </output>
      <div className={styles.workspace}>
        <aside className={styles.listPane}>
          <div className={styles.filters}>
            <label>
              <span>Search requirements</span>
              <div>
                <Search size={16} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="ID, role, booking or event"
                />
              </div>
            </label>
            <label>
              Status
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="all">All</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="staffing">Staffing</option>
              </select>
            </label>
          </div>
          <div className={styles.records}>
            {visible.map((item) => (
              <button
                key={item.id}
                type="button"
                className={item.id === selectedId ? styles.selected : ''}
                aria-pressed={item.id === selectedId}
                onClick={() => {
                  setSelectedId(item.id);
                  setLookupNotice('');
                }}
              >
                <span>{item.status}</span>
                <strong>
                  {item.quantity} x {item.role}
                </strong>
                <code>{item.id}</code>
              </button>
            ))}
            {viewState === 'ready' && !visible.length && (
              <div className={styles.empty}>
                <CircleAlert size={20} />
                <p>No requirement matches these local filters.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setStatus('all');
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
          {requirement ? (
            <>
              <div className={styles.title}>
                <div>
                  <span>{requirement.status}</span>
                  <h3>
                    {requirement.quantity} x {requirement.role}
                  </h3>
                  <code>{requirement.id}</code>
                </div>
                <BriefcaseBusiness size={34} />
              </div>
              <div className={styles.links}>
                <article>
                  <CalendarClock size={20} />
                  <div>
                    <small>Booking</small>
                    <strong>{booking?.eventName ?? 'Missing booking'}</strong>
                    <code>{requirement.bookingId}</code>
                  </div>
                </article>
                <article>
                  <CalendarClock size={20} />
                  <div>
                    <small>Event</small>
                    <strong>{event?.name ?? 'Missing event'}</strong>
                    <code>{requirement.eventId}</code>
                  </div>
                </article>
              </div>
              <div className={styles.progress} aria-label="Requirement status">
                {stages.map((stage, index) => (
                  <div
                    key={stage}
                    className={index <= activeStage ? styles.done : ''}
                  >
                    <i />
                    <span>{stage}</span>
                  </div>
                ))}
              </div>
              <dl className={styles.meta}>
                <div>
                  <dt>Quantity</dt>
                  <dd>{requirement.quantity}</dd>
                </div>
                <div>
                  <dt>Booking city</dt>
                  <dd>{booking?.city ?? 'Unavailable'}</dd>
                </div>
                <div>
                  <dt>Event state</dt>
                  <dd>{event?.status ?? 'Unavailable'}</dd>
                </div>
              </dl>
              <section className={styles.notes}>
                <h4>Sample instructions</h4>
                <p>{requirement.notes || 'No sample instructions supplied.'}</p>
              </section>
            </>
          ) : (
            <div className={styles.blank}>
              <CircleAlert />
              <p>Select a sample requirement to inspect its linked IDs.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
