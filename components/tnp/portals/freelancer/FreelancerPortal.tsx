'use client';
import { useEffect, useRef, useState } from 'react';
import {
  BadgeIndianRupee,
  Bell,
  BriefcaseBusiness,
  CalendarCheck2,
  ClipboardList,
  Menu,
  RefreshCw,
  Search,
  WalletCards,
  X,
} from 'lucide-react';
import { getBrowserPreviewService } from '@/lib/services/preview';
import type {
  Attendance,
  Earning,
  Payout,
  Rating,
  EventPass,
  Assignment,
  Worker,
  Paginated,
  PreviewOutcome,
  QueryOptions,
} from '@/lib/contracts/preview';
import { ApplicationFlow } from './ApplicationFlow';
import {
  AssignmentWorkspace,
  OpportunityWorkspace,
  UpdatesWorkspace,
} from './OpportunityWorkspace';
import { profiles } from './freelancerState.ts';
import { useFreelancer } from './useFreelancer';
import styles from './FreelancerPortal.module.css';

export function FreelancerPortal() {
  const [profile, setProfile] = useState<string | null>(null);
  useEffect(() => {
    void Promise.resolve().then(() => {
      try {
        const saved = window.sessionStorage.getItem('tnp-freelancer-profile');
        setProfile(
          profiles.some((p) => p.id === saved) ? saved : profiles[0].id,
        );
      } catch {
        setProfile(profiles[0].id);
      }
    });
  }, []);
  if (!profile)
    return (
      <main id="main-content" tabIndex={-1} className={styles.workspace}>
        <output className={styles.loading}>
          Opening the freelancer workspace…
        </output>
      </main>
    );
  function changeProfile(value: string) {
    try {
      window.sessionStorage.setItem('tnp-freelancer-profile', value);
    } catch {
      /* Selection remains available in memory. */
    }
    setProfile(value);
  }
  return (
    <FreelancerWorkspace
      key={profile}
      profile={profile}
      setProfile={changeProfile}
    />
  );
}
function FreelancerWorkspace({
  profile,
  setProfile,
}: {
  profile: string;
  setProfile: (profile: string) => void;
}) {
  const w = useFreelancer(profile);
  const [section, setSection] = useState('application');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const content = useRef<HTMLDivElement>(null);
  const drawerClose = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!drawerOpen) return;
    drawerClose.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [drawerOpen]);
  function navigate(next: string) {
    setSection(next);
    setDrawerOpen(false);
    window.setTimeout(() => {
      content.current?.focus();
      content.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
    }, 0);
  }
  return (
    <main id="main-content" tabIndex={-1} className={styles.workspace}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>
            TNP HOSPITALITY / THE FREELANCER SPACE
          </p>
          <h1>Your freelancer workspace</h1>
          <p>
            A place to introduce yourself, find your next opportunity and show
            up ready.
          </p>
        </div>
        <button
          className={styles.primary}
          onClick={() =>
            navigate(
              w.data?.assignments.length
                ? 'assignments'
                : w.data?.worker?.approved
                  ? 'opportunities'
                  : 'application',
            )
          }
        >
          {w.data?.assignments.length
            ? 'Review your assignments'
            : w.data?.worker?.approved
              ? 'Find your next opportunity'
              : 'Complete your application'}
        </button>
      </header>
      <div className={styles.context}>
        <label htmlFor="freelancer-profile">
          Sample profile
          <select
            id="freelancer-profile"
            value={profile}
            disabled={w.busy}
            onChange={(e) => setProfile(e.target.value)}
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <p>
          <span className={styles.statusDot} /> Synthetic workspace
          <br />
          <small>
            Generation {w.data?.generation ?? '—'} · this browser only
          </small>
        </p>
        <button
          type="button"
          className={styles.secondary}
          disabled={w.busy || w.loading}
          onClick={() => void w.refresh()}
        >
          <RefreshCw size={16} /> Refresh records
        </button>
      </div>
      <output className={styles.feedback} aria-live="polite">
        {w.notice ||
          'Use sample choices only. No real identity checks, tracking or payments.'}
        {w.storageWarning && <p>{w.storageWarning}</p>}
      </output>
      <div className={styles.workspaceTools}>
        <button
          type="button"
          className={styles.menuTrigger}
          aria-expanded={drawerOpen}
          aria-controls="freelancer-workspace-drawer"
          onClick={() => setDrawerOpen(true)}
        >
          <Menu size={21} aria-hidden="true" />
          <span>Workspace</span>
        </button>
        <button
          type="button"
          className={styles.walletTrigger}
          onClick={() => navigate('earnings & standing')}
        >
          <WalletCards size={21} aria-hidden="true" />
          <span>Wallet</span>
        </button>
      </div>
      {drawerOpen && (
        <button
          type="button"
          className={styles.drawerBackdrop}
          aria-label="Close workspace menu"
          onClick={() => setDrawerOpen(false)}
        />
      )}
      <aside
        id="freelancer-workspace-drawer"
        className={styles.workspaceDrawer}
        data-open={drawerOpen}
        aria-hidden={!drawerOpen}
      >
        <header>
          <div>
            <p className={styles.eyebrow}>FREELANCER WORKSPACE</p>
            <h2>Where do you want to go?</h2>
          </div>
          <button
            ref={drawerClose}
            type="button"
            aria-label="Close workspace menu"
            onClick={() => setDrawerOpen(false)}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>
        <button
          type="button"
          className={styles.walletCard}
          onClick={() => navigate('earnings & standing')}
        >
          <span>
            <WalletCards size={22} aria-hidden="true" /> Sample wallet
          </span>
          <strong>₹12,480</strong>
          <small>View earnings, payouts and standing</small>
        </button>
        <nav aria-label="Freelancer pages">
          {[
            ['application', 'Application', ClipboardList],
            ['opportunities', 'Opportunities', Search],
            ['assignments', 'Assignments', BriefcaseBusiness],
            ['pass & attendance', 'Pass & attendance', CalendarCheck2],
            ['earnings & standing', 'Earnings & standing', BadgeIndianRupee],
            ['updates', 'Updates', Bell],
          ].map(([value, label, Icon], index) => (
            <button
              key={String(value)}
              type="button"
              aria-current={section === value ? 'page' : undefined}
              onClick={() => navigate(String(value))}
            >
              <Icon size={19} aria-hidden="true" />
              <span>
                <small>0{index + 1}</small>
                <strong>{String(label)}</strong>
              </span>
              {value === 'assignments' && w.data && (
                <b>{w.data.assignments.length}</b>
              )}
            </button>
          ))}
        </nav>
        <p className={styles.drawerNote}>
          Synthetic navigation and sample balance only. No payment or production
          account is connected.
        </p>
      </aside>
      {w.pendingRequests.length > 0 && (
        <section
          className={styles.recovery}
          aria-label="Unresolved sample actions"
        >
          <h2>Finish an earlier action</h2>
          <p>
            A saved request can be replayed safely with its original identity.
            Inspect the current records before starting over.
          </p>
          {w.pendingRequests.map((r) => (
            <div key={r.requestKey}>
              <code>
                {r.operation} · {r.requestKey}
              </code>
              <button
                className={styles.secondary}
                disabled={w.busy || w.loading || !w.data}
                onClick={() => void w.run(r.operation, r.payload, r)}
              >
                Retry same action
              </button>
              <button
                className={styles.textButton}
                disabled={w.busy}
                onClick={() => w.discard(r)}
              >
                Discard retry identity
              </button>
            </div>
          ))}
        </section>
      )}
      {w.loading && (
        <output className={styles.loading}>
          <span /> Reading your sample workspace…
        </output>
      )}
      {w.error && (
        <section className={styles.error} role="alert">
          <h2>
            {w.error.startsWith('PREVIEW_LOADING')
              ? 'Sample loading state'
              : 'The workspace could not be loaded.'}
          </h2>
          <p>{w.error}</p>
          <button className={styles.secondary} onClick={() => void w.refresh()}>
            Retry loading
          </button>
          <p>
            When using the global preview controls, choose Ready to restore the
            normal scenario.
          </p>
        </section>
      )}
      {w.data && (
        <div
          id="freelancer-content"
          className={styles.workspaceContent}
          ref={content}
          tabIndex={-1}
          inert={w.loading || !!w.error}
          aria-busy={w.loading}
        >
          {w.error && (
            <p className={styles.note}>
              Last-loaded records are shown below. Actions are unavailable until
              refresh succeeds.
            </p>
          )}
          {w.data.opportunities.length === 0 &&
          w.data.applications.length === 0 &&
          w.data.assignments.length === 0 ? (
            <section className={styles.result}>
              <h2>No sample records to show.</h2>
              <p>
                Choose Ready in the preview controls, then refresh records to
                begin.
              </p>
            </section>
          ) : (
            <div key={`${profile}:${w.data.generation}`}>
              <div hidden={section !== 'application'}>
                <ApplicationFlow profile={profile} workspace={w} />
              </div>
              <div hidden={section !== 'opportunities'}>
                <OpportunityWorkspace
                  profile={profile}
                  workspace={w}
                  openAssignments={() => navigate('assignments')}
                />
              </div>
              <div hidden={section !== 'assignments'}>
                <AssignmentWorkspace
                  workspace={w}
                  openOpportunities={() => navigate('opportunities')}
                />
              </div>
              {(section === 'pass & attendance' ||
                section === 'earnings & standing') && (
                <FreelancerRecords
                  key={profile + ':' + w.data.generation + ':' + section}
                  profile={profile}
                  section={section}
                  assignments={w.data.assignments}
                  worker={w.data.worker}
                />
              )}
              <div hidden={section !== 'updates'}>
                <UpdatesWorkspace
                  workspace={w}
                  openOpportunities={() => navigate('opportunities')}
                  openAssignments={() => navigate('assignments')}
                />
              </div>
            </div>
          )}
        </div>
      )}
      <footer className={styles.localFooter}>
        <span>TNP / FREELANCER</span>
        <p>Thoughtful people. Confident teams. Memorable events.</p>
        <small>
          Synthetic records stay in this browser. No live recruitment decision
          is made here.
        </small>
      </footer>
    </main>
  );
}

const rupees = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(
    value / 100,
  );
async function allRecords<T>(
  query: (options: QueryOptions) => Promise<PreviewOutcome<Paginated<T>>>,
) {
  const items: T[] = [];
  let cursor: string | undefined;
  const seen = new Set<string>();
  do {
    const result = await query({ cursor });
    if (!result.ok) throw Error(result.error.message);
    items.push(...result.value.items);
    cursor = result.value.nextCursor ?? undefined;
    if (cursor && seen.has(cursor))
      throw Error('Repeated page cursor. Retry reading records.');
    if (cursor) seen.add(cursor);
  } while (cursor);
  return items;
}
function FreelancerRecords({
  profile,
  section,
  assignments,
  worker,
}: {
  profile: string;
  section: string;
  assignments: Assignment[];
  worker: Worker | null;
}) {
  const [attempt, setAttempt] = useState(0);
  const [rows, setRows] = useState<{
    attendance: Attendance[];
    earnings: Earning[];
    payouts: Payout[];
    ratings: Rating[];
  } | null>(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState('');
  const [pass, setPass] = useState<EventPass | null>(null);
  const [passNotice, setPassNotice] = useState(
    'Select a confirmed assignment to read its sample pass.',
  );
  const passEpoch = useRef({ value: 0 });
  useEffect(() => {
    const epochState = passEpoch.current;
    let active = true;
    void (async () => {
      try {
        const service = await getBrowserPreviewService();
        const [attendance, earnings, payouts, ratings] = await Promise.all([
          allRecords((o) => service.getAttendanceHistory(profile, o)),
          allRecords((o) => service.listEarnings(profile, o)),
          allRecords((o) => service.listPayouts(profile, o)),
          allRecords((o) => service.listRatings(profile, o)),
        ]);
        if (active) {
          setRows({ attendance, earnings, payouts, ratings });
          setError('');
        }
      } catch (e) {
        if (active)
          setError(e instanceof Error ? e.message : 'Records unavailable.');
      }
    })();
    return () => {
      active = false;
      epochState.value++;
    };
  }, [profile, attempt]);
  async function readPass(id: string) {
    const epoch = ++passEpoch.current.value;
    setSelected(id);
    setPass(null);
    setPassNotice(id ? 'Reading sample pass…' : 'Select an assignment.');
    if (!id) return;
    try {
      const result = await (await getBrowserPreviewService()).getEventPass(id);
      if (epoch !== passEpoch.current.value) return;
      if (result.ok) {
        setPass(result.value);
        setPassNotice(
          'Synthetic pass only. It cannot admit anyone to a real event.',
        );
      } else setPassNotice(result.error.message);
    } catch {
      if (epoch === passEpoch.current.value)
        setPassNotice(
          'Pass unavailable. Select the assignment again to retry.',
        );
    }
  }
  if (error)
    return (
      <section className={styles.error} role="alert">
        <h2>Records unavailable</h2>
        <p>{error}</p>
        <button
          onClick={() => {
            setError('');
            setRows(null);
            setAttempt((a) => a + 1);
          }}
        >
          Retry reading records
        </button>
      </section>
    );
  if (!rows)
    return (
      <section aria-busy="true">
        <h2>Reading your sample records…</h2>
      </section>
    );
  return (
    <section className={styles.recordPanel}>
      <p className={styles.eyebrow}>
        YOUR SAMPLE RECORDS / {worker?.displayName ?? 'NEW APPLICANT'}
      </p>
      <h2>
        {section === 'pass & attendance'
          ? 'Pass and attendance'
          : 'Earnings, payouts and standing'}
      </h2>
      {section === 'pass & attendance' ? (
        <>
          <label>
            Confirmed assignment
            <select
              value={selected}
              onChange={(e) => void readPass(e.target.value)}
            >
              <option value="">Select an assignment</option>
              {assignments
                .filter(
                  (a) =>
                    a.response === 'coming' && a.allocationState === 'active',
                )
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.eventId} · {a.id}
                  </option>
                ))}
            </select>
          </label>
          <output aria-live="polite">{passNotice}</output>
          {pass && (
            <article>
              <h3>Sample event pass</h3>
              <p>Event: {pass.eventId}</p>
              <p>Assignment: {pass.assignmentId}</p>
              <p>Expires: {new Date(pass.expiresAt).toLocaleString('en-IN')}</p>
              <code>{pass.token}</code>
              <p>No live QR admission or location tracking is available.</p>
            </article>
          )}
          <h3>Attendance evidence</h3>
          {rows.attendance.length ? (
            rows.attendance.map((a) => (
              <article key={a.id}>
                <strong>
                  {a.state} · {a.eventId}
                </strong>
                <p>
                  Evidence: {a.evidence.state}. {a.evidence.note}
                </p>
                {a.evidence.state === 'gps-denied' && (
                  <p>
                    Location permission was denied. Ask the event supervisor to
                    review the exception; denied GPS is not proof of absence.
                  </p>
                )}
                <details>
                  <summary>Correction history ({a.history.length})</summary>
                  {a.history.map((h) => (
                    <p key={h.id}>
                      {h.reason} · {h.evidence.state} · {h.actorId}
                    </p>
                  ))}
                </details>
              </article>
            ))
          ) : (
            <p>
              No attendance recorded for this sample profile. Confirm an
              assignment and use the labelled Operations attendance workflow.
            </p>
          )}
        </>
      ) : (
        <>
          <p>
            Standing:{' '}
            <strong>{worker?.standing ?? 'Application not approved'}</strong>.
            Estimated earnings are not payable balances.
          </p>
          {rows.earnings.length ? (
            rows.earnings.map((e) => (
              <article key={e.id}>
                <h3>
                  {e.amountState === 'estimated' ? 'Estimate' : 'Earning'} ·{' '}
                  {rupees(
                    e.amountState === 'estimated'
                      ? e.estimatedGrossPaise
                      : e.netPaise,
                  )}
                </h3>
                <p>
                  {e.status} · {e.assignmentId}
                </p>
                <dl>
                  <dt>Gross</dt>
                  <dd>{rupees(e.grossPaise)}</dd>
                  <dt>Deductions</dt>
                  <dd>{rupees(e.deductionsPaise)}</dd>
                  <dt>Net</dt>
                  <dd>{rupees(e.netPaise)}</dd>
                </dl>
                <p>{e.proposedTaxLabel}</p>
              </article>
            ))
          ) : (
            <p>No earnings for this profile yet.</p>
          )}
          <h3>Payout history</h3>
          {rows.payouts.length ? (
            rows.payouts.map((p) => (
              <article key={p.id}>
                <strong>
                  {p.month} · {rupees(p.totalPaise)}
                </strong>
                <p>
                  {p.status} · {p.id}. This is a synthetic ledger status, not a
                  bank transfer.
                </p>
              </article>
            ))
          ) : (
            <p>No payout records.</p>
          )}
          <h3>Feedback</h3>
          {rows.ratings.length ? (
            rows.ratings.map((r) => (
              <article key={r.id}>
                <strong>
                  {r.score} / 5 · {r.eventId}
                </strong>
                <p>{r.note}</p>
              </article>
            ))
          ) : (
            <p>No ratings recorded.</p>
          )}
        </>
      )}
    </section>
  );
}
