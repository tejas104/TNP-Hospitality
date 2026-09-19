'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, RefreshCw, Sparkles } from 'lucide-react';
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
      <main className={styles.workspace}>
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
  const content = useRef<HTMLDivElement>(null);
  function navigate(next: string) {
    setSection(next);
    window.setTimeout(() => {
      content.current?.focus();
      content.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
    }, 0);
  }
  return (
    <main className={styles.workspace}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>
            TNP HOSPITALITY / THE FREELANCER SPACE
          </p>
          <h1>
            Good people.
            <br />
            <em>Remarkable experiences.</em>
          </h1>
          <p>
            A place to introduce yourself, find your next opportunity and show
            up ready.
          </p>
        </div>
        <div className={styles.heroMark} aria-hidden="true">
          <Sparkles size={40} />
          <span>CARE IN EVERY DETAIL</span>
          <ArrowUpRight size={58} />
        </div>
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
      <nav className={styles.workspaceNav} aria-label="Freelancer workspace">
        {['application', 'opportunities', 'assignments', 'updates'].map(
          (item, index) => (
            <button
              key={item}
              aria-current={section === item ? 'page' : undefined}
              onClick={() => navigate(item)}
            >
              <span>0{index + 1}</span>
              {item}
              {item === 'assignments' && w.data && (
                <small>{w.data.assignments.length}</small>
              )}
            </button>
          ),
        )}
      </nav>
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
