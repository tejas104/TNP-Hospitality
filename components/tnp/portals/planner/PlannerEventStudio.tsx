'use client';

import {
  CalendarDays,
  Check,
  ChevronDown,
  MapPin,
  Plus,
  Trash2,
  UsersRound,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import styles from './PlannerEventStudio.module.css';

const workforceRoles = [
  'Event Coordinator',
  'Event Executive',
  'Volunteer',
  'Hostess',
  'RSVP Executive',
] as const;

type WorkforceRole = (typeof workforceRoles)[number];
type StaffingLine = { id: string; role: WorkforceRole; quantity: number };
type EventPlan = {
  id: string;
  title: string;
  functionName: string;
  city: string;
  date: string;
  notes: string;
  status: 'draft' | 'submitted';
  staffing: StaffingLine[];
};
type RoleDraft = { role: WorkforceRole; quantity: string };

const firstEvent: EventPlan = {
  id: 'planner-event-001',
  title: 'Royal Wedding Experience',
  functionName: 'Reception',
  city: 'Jaipur',
  date: '2026-11-18',
  notes: 'Guest-facing English and Hindi communication.',
  status: 'draft',
  staffing: [],
};

function createId(prefix: string) {
  const suffix =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
  return `${prefix}-${suffix}`;
}

export function PlannerEventStudio() {
  const [events, setEvents] = useState<EventPlan[]>([firstEvent]);
  const [roleDrafts, setRoleDrafts] = useState<Record<string, RoleDraft>>({
    [firstEvent.id]: { role: 'Hostess', quantity: '3' },
  });
  const [notice, setNotice] = useState(
    'Choose a role and quantity, then add as many workforce lines as this event needs.',
  );
  const eventRefs = useRef<Record<string, HTMLElement | null>>({});

  const totalPeople = useMemo(
    () =>
      events.reduce(
        (total, event) =>
          total + event.staffing.reduce((sum, line) => sum + line.quantity, 0),
        0,
      ),
    [events],
  );

  function updateEvent(id: string, field: keyof EventPlan, value: string) {
    setEvents((current) =>
      current.map((event) =>
        event.id === id
          ? { ...event, [field]: value, status: 'draft' as const }
          : event,
      ),
    );
  }

  function setRoleDraft(id: string, patch: Partial<RoleDraft>) {
    setRoleDrafts((current) => ({
      ...current,
      [id]: {
        role: current[id]?.role ?? 'Hostess',
        quantity: current[id]?.quantity ?? '1',
        ...patch,
      },
    }));
  }

  function addRole(eventId: string) {
    const draft = roleDrafts[eventId] ?? {
      role: 'Hostess' as const,
      quantity: '1',
    };
    const quantity = Number(draft.quantity);
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 500) {
      setNotice('Enter a whole-number quantity between 1 and 500.');
      return;
    }
    setEvents((current) =>
      current.map((event) => {
        if (event.id !== eventId) return event;
        const existing = event.staffing.find(
          (line) => line.role === draft.role,
        );
        return {
          ...event,
          status: 'draft',
          staffing: existing
            ? event.staffing.map((line) =>
                line.id === existing.id ? { ...line, quantity } : line,
              )
            : [
                ...event.staffing,
                { id: createId('staffing'), role: draft.role, quantity },
              ],
        };
      }),
    );
    setNotice(
      `${quantity} × ${draft.role} added. Choose another role to build the same event team.`,
    );
    setRoleDraft(eventId, { quantity: '1' });
  }

  function removeRole(eventId: string, lineId: string) {
    setEvents((current) =>
      current.map((event) =>
        event.id === eventId
          ? {
              ...event,
              status: 'draft',
              staffing: event.staffing.filter((line) => line.id !== lineId),
            }
          : event,
      ),
    );
    setNotice('Workforce line removed from this event.');
  }

  function submitEvent(eventId: string) {
    const event = events.find((item) => item.id === eventId);
    if (
      !event?.title.trim() ||
      !event.functionName.trim() ||
      !event.city.trim()
    ) {
      setNotice('Add the event, function and city before final submission.');
      return;
    }
    if (!event.staffing.length) {
      setNotice('Add at least one workforce role before final submission.');
      return;
    }
    setEvents((current) =>
      current.map((item) =>
        item.id === eventId ? { ...item, status: 'submitted' } : item,
      ),
    );
    setNotice(
      `${event.title} is ready in the synthetic demo. Its complete team is shown in the summary card.`,
    );
  }

  function createEvent() {
    const id = createId('planner-event');
    const next: EventPlan = {
      id,
      title: '',
      functionName: '',
      city: '',
      date: '',
      notes: '',
      status: 'draft',
      staffing: [],
    };
    setEvents((current) => [...current, next]);
    setRoleDrafts((current) => ({
      ...current,
      [id]: { role: 'Hostess', quantity: '1' },
    }));
    setNotice('A new empty event has been added below.');
    window.requestAnimationFrame(() =>
      eventRefs.current[id]?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      }),
    );
  }

  function focusEvent(id: string) {
    eventRefs.current[id]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
    window.setTimeout(() => eventRefs.current[id]?.focus(), 260);
  }

  return (
    <section
      className={styles.studio}
      id="planner-requirement"
      aria-labelledby="event-studio-title"
    >
      <header className={styles.studioHeader}>
        <div>
          <p className="section-kicker">EVENT WORKFORCE STUDIO</p>
          <h2 id="event-studio-title">
            Build every event team in one clear place.
          </h2>
          <p>
            Add several roles to an event, review the combined brief, then
            create the next event without losing the first.
          </p>
        </div>
        <button
          type="button"
          className={styles.createButton}
          onClick={createEvent}
        >
          <Plus size={18} aria-hidden="true" /> Create another event
        </button>
      </header>

      <nav className={styles.eventRail} aria-label="Created event shortcuts">
        {events.map((event, index) => {
          const people = event.staffing.reduce(
            (sum, line) => sum + line.quantity,
            0,
          );
          return (
            <button
              key={event.id}
              type="button"
              onClick={() => focusEvent(event.id)}
            >
              <span>0{index + 1}</span>
              <strong>{event.title || `New event ${index + 1}`}</strong>
              <small>
                {event.status} · {people} people
              </small>
              <ChevronDown size={16} aria-hidden="true" />
            </button>
          );
        })}
        <div className={styles.railTotal}>
          <UsersRound size={18} aria-hidden="true" />
          <span>
            <strong>{totalPeople}</strong> across all events
          </span>
        </div>
      </nav>

      <output className={styles.notice} aria-live="polite">
        {notice}
      </output>

      <div className={styles.eventStack}>
        {events.map((event, eventIndex) => {
          const draft = roleDrafts[event.id] ?? {
            role: 'Hostess',
            quantity: '1',
          };
          const total = event.staffing.reduce(
            (sum, line) => sum + line.quantity,
            0,
          );
          return (
            <article
              key={event.id}
              ref={(node) => {
                eventRefs.current[event.id] = node;
              }}
              tabIndex={-1}
              className={styles.eventWorkspace}
              aria-labelledby={`${event.id}-title`}
            >
              <div className={styles.builder}>
                <div className={styles.eventHeading}>
                  <span>EVENT 0{eventIndex + 1}</span>
                  <strong data-status={event.status}>{event.status}</strong>
                </div>
                <h3 id={`${event.id}-title`}>
                  {event.title || `New event ${eventIndex + 1}`}
                </h3>
                <div className={styles.eventFields}>
                  <label>
                    Event name
                    <input
                      value={event.title}
                      placeholder="e.g. Mehta wedding"
                      onChange={(e) =>
                        updateEvent(event.id, 'title', e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Function
                    <input
                      value={event.functionName}
                      placeholder="e.g. Reception"
                      onChange={(e) =>
                        updateEvent(event.id, 'functionName', e.target.value)
                      }
                    />
                  </label>
                  <label>
                    City
                    <input
                      value={event.city}
                      placeholder="e.g. Jaipur"
                      onChange={(e) =>
                        updateEvent(event.id, 'city', e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Date
                    <input
                      type="date"
                      value={event.date}
                      onChange={(e) =>
                        updateEvent(event.id, 'date', e.target.value)
                      }
                    />
                  </label>
                </div>

                <div className={styles.roleComposer}>
                  <label>
                    Freelancer role
                    <select
                      value={draft.role}
                      onChange={(e) =>
                        setRoleDraft(event.id, {
                          role: e.target.value as WorkforceRole,
                        })
                      }
                    >
                      {workforceRoles.map((role) => (
                        <option key={role}>{role}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Quantity
                    <input
                      type="number"
                      min="1"
                      max="500"
                      inputMode="numeric"
                      value={draft.quantity}
                      onChange={(e) =>
                        setRoleDraft(event.id, { quantity: e.target.value })
                      }
                    />
                  </label>
                  <button type="button" onClick={() => addRole(event.id)}>
                    <Plus size={17} aria-hidden="true" /> Add to event
                  </button>
                </div>

                <div
                  className={styles.selectedRoles}
                  aria-label="Selected workforce roles"
                >
                  {event.staffing.length ? (
                    event.staffing.map((line) => (
                      <div key={line.id}>
                        <span>
                          <UsersRound size={17} aria-hidden="true" />
                          <strong>
                            {line.quantity} × {line.role}
                          </strong>
                        </span>
                        <button
                          type="button"
                          aria-label={`Remove ${line.role}`}
                          onClick={() => removeRole(event.id, line.id)}
                        >
                          <Trash2 size={17} aria-hidden="true" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p>
                      No roles added yet. Start with Hostess, then add Volunteer
                      or another role.
                    </p>
                  )}
                </div>

                <label className={styles.notes}>
                  Team instructions
                  <textarea
                    value={event.notes}
                    placeholder="Languages, reporting point, dress code or guest-service notes"
                    onChange={(e) =>
                      updateEvent(event.id, 'notes', e.target.value)
                    }
                  />
                </label>
                <button
                  type="button"
                  className={styles.submitButton}
                  onClick={() => submitEvent(event.id)}
                >
                  <Check size={18} aria-hidden="true" />{' '}
                  {event.status === 'submitted'
                    ? 'Update final submission'
                    : 'Final submit event team'}
                </button>
              </div>

              <aside
                className={styles.summary}
                aria-label={`${event.title || 'New event'} staffing summary`}
              >
                <p className="section-kicker">
                  {event.status === 'submitted'
                    ? 'SUBMITTED EVENT BRIEF'
                    : 'LIVE EVENT SUMMARY'}
                </p>
                <h3>{event.title || 'Name this event'}</h3>
                <div className={styles.summaryMeta}>
                  <span>
                    <CalendarDays size={17} aria-hidden="true" />
                    {event.functionName || 'Function not added'}
                    {event.date ? ` · ${event.date}` : ''}
                  </span>
                  <span>
                    <MapPin size={17} aria-hidden="true" />
                    {event.city || 'City not added'}
                  </span>
                </div>
                <div className={styles.summaryLines}>
                  {event.staffing.length ? (
                    event.staffing.map((line) => (
                      <div key={line.id}>
                        <span>{line.role}</span>
                        <strong>{line.quantity}</strong>
                      </div>
                    ))
                  ) : (
                    <p>
                      Your complete team will appear here as roles are added.
                    </p>
                  )}
                </div>
                <div className={styles.total}>
                  <span>Total team</span>
                  <strong>{total}</strong>
                </div>
                {event.notes && (
                  <p className={styles.summaryNotes}>{event.notes}</p>
                )}
                <small>
                  {event.status === 'submitted'
                    ? 'Synthetic brief complete · no live staffing performed'
                    : 'Draft updates instantly as you build the team'}
                </small>
              </aside>
            </article>
          );
        })}
      </div>
    </section>
  );
}
