'use client';
import { useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import type {
  Assignment,
  Opportunity,
} from '../../../../lib/contracts/preview.ts';
import { assignmentLabel, filterOpportunities } from './freelancerState.ts';
import type { FreelancerWorkspace } from './useFreelancer.ts';
import styles from './FreelancerPortal.module.css';

export function schedule(opportunity: Opportunity) {
  const format = (value: string, date = false) =>
    new Intl.DateTimeFormat('en-IN', {
      timeZone: opportunity.timezone,
      ...(date
        ? { day: 'numeric', month: 'short', year: 'numeric' }
        : { hour: 'numeric', minute: '2-digit' }),
    }).format(new Date(value));
  return {
    day: format(opportunity.startsAt, true),
    time: `${format(opportunity.startsAt)} – ${format(opportunity.endsAt)}`,
    endDay: format(opportunity.endsAt, true),
  };
}
function money(o: Opportunity) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(o.payRatePaise / 100);
}
export function OpportunityWorkspace({
  workspace: w,
  profile,
  openAssignments,
}: {
  workspace: FreelancerWorkspace;
  profile: string;
  openAssignments: () => void;
}) {
  const [query, setQuery] = useState(''),
    [role, setRole] = useState(''),
    [venue, setVenue] = useState(''),
    [date, setDate] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [openedVersion, setOpenedVersion] = useState('');
  const [compact, setCompact] = useState(false);
  const detail = useRef<HTMLElement>(null);
  const returnButton = useRef<HTMLButtonElement | null>(null);
  const opportunities = w.data!.opportunities;
  const filtered = filterOpportunities(opportunities, query, role, venue, date);
  // Derive selection from the visible service records, never a stale copied record.
  const active = filtered.find((o) => o.positionId === selected) ?? null;
  const assignment = active
    ? w.data!.assignments.find(
        (a) =>
          a.positionId === active.positionId && a.allocationState === 'active',
      )
    : undefined;
  const uniqueRoles = [...new Set(opportunities.map((o) => o.role))];
  const uniqueVenues = [
    ...new Map(opportunities.map((o) => [o.venueId, o.venueName])).entries(),
  ];
  function choose(o: Opportunity, button: HTMLButtonElement) {
    setSelected(o.positionId);
    setOpenedVersion(JSON.stringify(o));
    returnButton.current = button;
    window.setTimeout(() => {
      detail.current?.focus();
      detail.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }, 0);
  }
  function close() {
    setSelected(null);
    returnButton.current?.focus();
  }
  function clearFilters() {
    setQuery('');
    setRole('');
    setVenue('');
    setDate('');
    setSelected(null);
  }
  function changeFilter(fn: () => void) {
    fn();
    setSelected(null);
  }
  return (
    <section aria-labelledby="opportunities-heading">
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>FIND YOUR NEXT CHAPTER</p>
          <h2 id="opportunities-heading">Opportunities with purpose.</h2>
          <p>
            Explore sample roles, understand the details, then decide where you
            fit.
          </p>
        </div>
        <div className={styles.stat}>
          <strong>
            {opportunities
              .filter(
                (o) =>
                  o.availability === 'available' &&
                  o.eligibilityReason.startsWith('Eligible'),
              )
              .length.toString()
              .padStart(2, '0')}
          </strong>
          <span>ELIGIBLE SAMPLE ROLES</span>
        </div>
      </div>
      <div className={styles.filters}>
        <label className={styles.search}>
          <Search size={18} aria-hidden="true" />
          <span className={styles.srOnly}>Search opportunities</span>
          <input
            type="search"
            value={query}
            placeholder="Role, venue or event reference"
            onChange={(e) => changeFilter(() => setQuery(e.target.value))}
          />
          {query && (
            <button
              aria-label="Clear search"
              onClick={() => changeFilter(() => setQuery(''))}
            >
              <X size={16} />
            </button>
          )}
        </label>
        <label>
          Role
          <select
            value={role}
            onChange={(e) => changeFilter(() => setRole(e.target.value))}
          >
            <option value="">All roles</option>
            {uniqueRoles.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <label>
          Location
          <select
            value={venue}
            onChange={(e) => changeFilter(() => setVenue(e.target.value))}
          >
            <option value="">All sample venues</option>
            {uniqueVenues.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Event date
          <select
            value={date}
            onChange={(e) => changeFilter(() => setDate(e.target.value))}
          >
            <option value="">All dates</option>
            {[
              ...new Set(opportunities.map((o) => o.startsAt.slice(0, 10))),
            ].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
      </div>
      <div className={styles.listToolbar}>
        <output aria-live="polite">
          {filtered.length}{' '}
          {filtered.length === 1 ? 'opportunity' : 'opportunities'}
          {query || role || venue || date
            ? ' matching your filters'
            : ' in this scenario'}
        </output>
        <button
          className={styles.textButton}
          aria-pressed={compact}
          onClick={() => setCompact((v) => !v)}
        >
          <SlidersHorizontal size={15} />
          {compact ? 'Comfortable view' : 'Compact view'}
        </button>
      </div>
      {(query || role || venue || date) && (
        <div className={styles.filterChips} aria-label="Active filters">
          {query && (
            <button onClick={() => changeFilter(() => setQuery(''))}>
              Search: {query}
              <X size={13} />
            </button>
          )}
          {role && (
            <button onClick={() => changeFilter(() => setRole(''))}>
              Role: {role}
              <X size={13} />
            </button>
          )}
          {venue && (
            <button onClick={() => changeFilter(() => setVenue(''))}>
              Location: {uniqueVenues.find(([id]) => id === venue)?.[1]}
              <X size={13} />
            </button>
          )}
          {date && (
            <button onClick={() => changeFilter(() => setDate(''))}>
              Date: {date}
              <X size={13} />
            </button>
          )}
          <button onClick={clearFilters}>Clear all filters</button>
        </div>
      )}
      <div
        className={`${styles.opportunityLayout} ${compact ? styles.compact : ''}`}
      >
        <div className={styles.opportunityList}>
          {filtered.length === 0 ? (
            <div className={styles.empty}>
              <Search size={26} />
              <h3>
                {opportunities.length
                  ? 'No roles match these filters.'
                  : 'No sample opportunities are published.'}
              </h3>
              <p>
                {opportunities.length
                  ? 'Try a different role, venue or date.'
                  : 'Refresh when sample records are available.'}
              </p>
              {opportunities.length > 0 && (
                <button className={styles.secondary} onClick={clearFilters}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            filtered.map((o) => {
              const dates = schedule(o);
              const claimed = w.data!.assignments.find(
                (a) =>
                  a.positionId === o.positionId &&
                  a.allocationState === 'active',
              );
              return (
                <article
                  key={o.positionId}
                  className={styles.opportunityRow}
                  data-selected={active?.positionId === o.positionId}
                >
                  <div className={styles.rowTop}>
                    <span className={styles.rowLabel}>
                      {o.availability === 'available'
                        ? 'OPEN SAMPLE ROLE'
                        : o.availability.toUpperCase()}
                    </span>
                    <span className={styles.rate}>
                      {money(o)}
                      <small> / {o.payUnit}</small>
                    </span>
                  </div>
                  <h3>{o.role}</h3>
                  <p className={styles.location}>
                    <MapPin size={14} />
                    {o.venueName}
                  </p>
                  <p className={styles.date}>
                    <CalendarDays size={14} />
                    {dates.day}
                    <span>{dates.time}</span>
                  </p>
                  <div className={styles.rowBottom}>
                    <div className={styles.capacity}>
                      <span>
                        {o.filledQuantity} of {o.requiredQuantity} filled
                      </span>
                      <progress
                        max={o.requiredQuantity}
                        value={o.filledQuantity}
                        aria-label={`${o.role}: ${o.filledQuantity} of ${o.requiredQuantity} sample positions filled`}
                      />
                    </div>
                    <button
                      className={styles.detailButton}
                      aria-label={`View ${o.role} at ${o.venueName}`}
                      aria-expanded={active?.positionId === o.positionId}
                      onClick={(e) => choose(o, e.currentTarget)}
                    >
                      View role <ArrowUpRight size={18} />
                    </button>
                  </div>
                  <p className={styles.eligibility}>
                    {claimed ? assignmentLabel(claimed) : o.eligibilityReason}
                  </p>
                </article>
              );
            })
          )}
        </div>
        <aside
          className={styles.opportunityDetail}
          ref={detail}
          tabIndex={-1}
          aria-label="Opportunity detail"
        >
          {active ? (
            <>
              <div className={styles.detailHeader}>
                <span className={styles.eyebrow}>THE ROLE IN DETAIL</span>
                <button
                  className={styles.iconButton}
                  aria-label="Close role detail"
                  onClick={close}
                >
                  <X size={19} />
                </button>
              </div>
              <h2>{active.role}</h2>
              <p className={styles.detailVenue}>{active.venueName}</p>
              {openedVersion !== JSON.stringify(active) && (
                <p className={styles.updated}>
                  Updated since you opened this role. Details below reflect the
                  latest sample records.
                </p>
              )}
              <dl className={styles.detailFacts}>
                <div>
                  <dt>Event date</dt>
                  <dd>
                    {schedule(active).day}
                    {schedule(active).endDay !== schedule(active).day &&
                      ` – ${schedule(active).endDay}`}
                  </dd>
                </div>
                <div>
                  <dt>Schedule</dt>
                  <dd>
                    {schedule(active).time}
                    <small>{active.timezone}</small>
                  </dd>
                </div>
                <div>
                  <dt>Reporting details</dt>
                  <dd>{active.reportingDetails}</dd>
                </div>
                <div>
                  <dt>Sample rate</dt>
                  <dd>
                    {money(active)} / {active.payUnit}
                  </dd>
                </div>
                <div>
                  <dt>Capacity</dt>
                  <dd>
                    {active.filledQuantity} / {active.requiredQuantity} filled
                  </dd>
                </div>
                <div>
                  <dt>Event / position references</dt>
                  <dd>
                    <code>{active.eventId}</code>
                    <code>{active.positionId}</code>
                  </dd>
                </div>
              </dl>
              <div className={styles.detailEligibility}>
                <CheckCircle2 size={18} />
                <p>{active.eligibilityReason}</p>
              </div>
              {assignment ? (
                <>
                  <p className={styles.note}>
                    This profile already has assignment{' '}
                    <strong>{assignment.id}</strong>.{' '}
                    {assignmentLabel(assignment)}.
                  </p>
                  <button className={styles.primary} onClick={openAssignments}>
                    View your assignment <ArrowRight size={16} />
                  </button>
                </>
              ) : (
                <button
                  className={styles.primary}
                  disabled={
                    w.busy ||
                    active.availability !== 'available' ||
                    !active.eligibilityReason.startsWith('Eligible')
                  }
                  onClick={() =>
                    void w.run('claimOpportunity', {
                      positionId: active.positionId,
                      workerId: profile,
                    })
                  }
                >
                  {w.busy
                    ? 'Saving…'
                    : active.availability === 'full'
                      ? 'All sample positions filled'
                      : active.availability === 'unavailable'
                        ? 'Currently unavailable'
                        : !active.eligibilityReason.startsWith('Eligible')
                          ? 'Profile not eligible'
                          : 'Claim sample opportunity'}
                  <ArrowRight size={16} />
                </button>
              )}
              <p className={styles.note}>
                A claim reserves a sample position. Coming / Not Coming is a
                separate response. Actual eligibility and capacity are checked
                by the preview service.
              </p>
            </>
          ) : (
            <div className={styles.detailEmpty}>
              <BriefcaseBusiness size={34} />
              <h2>A little clarity before you commit.</h2>
              <p>
                Select a role to review its schedule, reporting details and
                sample rate.
              </p>
              <span>
                YOUR NEXT OPPORTUNITY <ArrowDown size={14} />
              </span>
            </div>
          )}
        </aside>
      </div>
      <p className={styles.note}>
        Location and date filters help you explore. They do not enforce
        geographic or availability-based eligibility. All dates use the sample
        event timezone.
      </p>
    </section>
  );
}

export function AssignmentWorkspace({
  workspace: w,
  openOpportunities,
}: {
  workspace: FreelancerWorkspace;
  openOpportunities: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const assignments = w.data!.assignments;
  const active = assignments.find((a) => a.id === selected) ?? null;
  const detailHeading = useRef<HTMLHeadingElement>(null);
  const returnButton = useRef<HTMLButtonElement | null>(null);
  const position = active
    ? w.data!.opportunities.find((o) => o.positionId === active.positionId)
    : null;
  function pick(a: Assignment, button: HTMLButtonElement) {
    setSelected(a.id);
    returnButton.current = button;
    window.setTimeout(() => detailHeading.current?.focus(), 0);
  }
  return (
    <section aria-labelledby="assignments-heading">
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>BE READY TO SHOW UP</p>
          <h2 id="assignments-heading">Your assignments.</h2>
          <p>Your claim, response and allocation state stay separate.</p>
        </div>
        <span className={styles.assignmentCount}>
          {assignments.length} sample{' '}
          {assignments.length === 1 ? 'assignment' : 'assignments'}
        </span>
      </div>
      {assignments.length === 0 ? (
        <div className={styles.empty}>
          <CalendarDays size={28} />
          <h3>Your next event starts with a role.</h3>
          <p>This sample profile has no assignments yet.</p>
          <button className={styles.primary} onClick={openOpportunities}>
            Explore opportunities <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className={styles.assignmentGrid}>
          {assignments.map((a) => {
            const o = w.data!.opportunities.find(
              (o) => o.positionId === a.positionId,
            );
            return (
              <article className={styles.assignmentCard} key={a.id}>
                <span className={styles.badge}>{assignmentLabel(a)}</span>
                <h3>{o?.role ?? 'Sample assignment'}</h3>
                <p>{o?.venueName ?? a.eventId}</p>
                <small>
                  {o
                    ? `${schedule(o).day} · ${o.timezone}`
                    : 'Refresh opportunity details for this event.'}
                </small>
                <code>{a.id}</code>
                <button
                  className={styles.secondary}
                  aria-expanded={a.id === selected}
                  onClick={(e) => pick(a, e.currentTarget)}
                >
                  Review assignment <ArrowRight size={15} />
                </button>
              </article>
            );
          })}
        </div>
      )}
      {active && (
        <section
          className={styles.assignmentDetail}
          aria-labelledby="assignment-detail-heading"
        >
          <button
            className={styles.textButton}
            onClick={() => {
              setSelected(null);
              returnButton.current?.focus();
            }}
          >
            <ArrowLeft size={15} /> Back to your assignments
          </button>
          <h2 id="assignment-detail-heading" tabIndex={-1} ref={detailHeading}>
            {position?.role ?? 'Assignment details'}
          </h2>
          <code>{active.id}</code>
          <dl className={styles.facts}>
            <div>
              <dt>Response</dt>
              <dd>{assignmentLabel(active)}</dd>
            </div>
            <div>
              <dt>Allocation</dt>
              <dd>{active.allocationState}</dd>
            </div>
            <div>
              <dt>Reporting</dt>
              <dd>
                {position?.reportingDetails ??
                  'Reporting details unavailable; refresh to retry.'}
              </dd>
            </div>
            <div>
              <dt>Rate snapshot</dt>
              <dd>
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                }).format(active.payRatePaiseSnapshot / 100)}{' '}
                / {active.payUnitSnapshot}
              </dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>
                <time dateTime={active.createdAt}>
                  {new Intl.DateTimeFormat('en-IN', {
                    timeZone: w.data!.metadata.timezone,
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(active.createdAt))}
                </time>
                <small> {w.data!.metadata.timezone}</small>
              </dd>
            </div>
            <div>
              <dt>Event reference</dt>
              <dd>
                <code>{active.eventId}</code>
              </dd>
            </div>
          </dl>
          {active.allocationState === 'active' ? (
            <>
              <p>
                {active.response === 'pending'
                  ? 'You have a sample reservation. Tell the team whether you are coming.'
                  : active.response === 'not-coming'
                    ? 'Your reservation is released. Choosing Coming again rechecks eligibility, capacity and overlap.'
                    : 'Your sample response is Coming. This is not attendance or check-in.'}
              </p>
              <div className={styles.responseActions}>
                <button
                  className={styles.primary}
                  disabled={w.busy || active.response === 'coming'}
                  onClick={() =>
                    void w.run('respondToAssignment', {
                      assignmentId: active.id,
                      response: 'coming',
                    })
                  }
                >
                  I’m coming <CheckCircle2 size={17} />
                </button>
                <button
                  className={styles.secondary}
                  disabled={w.busy || active.response === 'not-coming'}
                  onClick={() =>
                    void w.run('respondToAssignment', {
                      assignmentId: active.id,
                      response: 'not-coming',
                    })
                  }
                >
                  I’m not coming
                </button>
              </div>
            </>
          ) : (
            <p className={styles.infoBox}>
              This assignment is {active.allocationState}. It cannot be
              reactivated from the freelancer workspace.
            </p>
          )}
          <p className={styles.note}>
            No automatic expiry, live reminders, briefing acknowledgement,
            attendance or payment is recorded here.
          </p>
        </section>
      )}
    </section>
  );
}

export function UpdatesWorkspace({
  workspace: w,
  openAssignments,
  openOpportunities,
}: {
  workspace: FreelancerWorkspace;
  openAssignments: () => void;
  openOpportunities: () => void;
}) {
  const pending = w.data!.assignments.filter(
    (a) => a.allocationState === 'active' && a.response === 'pending',
  );
  const eligible = w.data!.opportunities.filter(
    (o) =>
      o.availability === 'available' &&
      o.eligibilityReason.startsWith('Eligible') &&
      !w.data!.assignments.some(
        (a) => a.positionId === o.positionId && a.allocationState === 'active',
      ),
  );
  return (
    <section aria-labelledby="updates-heading">
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>A MOMENT TO CATCH UP</p>
          <h2 id="updates-heading">What needs your attention.</h2>
          <p>
            Derived from this profile’s current sample records. These are not
            delivered notifications.
          </p>
        </div>
      </div>
      <div className={styles.updatesList}>
        {pending.map((a) => (
          <article key={a.id}>
            <CalendarDays size={23} />
            <div>
              <span className={styles.rowLabel}>RESPONSE NEEDED</span>
              <h3>Your sample event is waiting for your response.</h3>
              <p>{a.id} · Choose Coming or Not Coming in your assignment.</p>
            </div>
            <button className={styles.secondary} onClick={openAssignments}>
              Review assignments <ArrowUpRight size={16} />
            </button>
          </article>
        ))}
        {eligible.length > 0 && (
          <article>
            <BriefcaseBusiness size={24} />
            <div>
              <span className={styles.rowLabel}>AVAILABLE TO EXPLORE</span>
              <h3>
                {eligible.length} eligible sample{' '}
                {eligible.length === 1 ? 'role' : 'roles'} to consider.
              </h3>
              <p>Review the full details before claiming a position.</p>
            </div>
            <button className={styles.secondary} onClick={openOpportunities}>
              Browse roles <ArrowUpRight size={16} />
            </button>
          </article>
        )}
        {!pending.length && !eligible.length && (
          <div className={styles.empty}>
            <CheckCircle2 size={28} />
            <h3>You’re caught up for this sample profile.</h3>
            <p>
              Refresh records after a sample application or assignment changes.
            </p>
          </div>
        )}
      </div>
      <p className={styles.note}>
        No message has been sent. Delivery receipts, push notifications, expiry
        and read tracking need a separate service integration.
      </p>
    </section>
  );
}
