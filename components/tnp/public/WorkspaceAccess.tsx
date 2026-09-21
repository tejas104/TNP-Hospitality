'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  HeartHandshake,
  LayoutDashboard,
  UserRound,
} from 'lucide-react';
import { productAudiences } from './access-content';
import { StorageWarning, useDemoAccess } from '../access/DemoAccess';
import { demoProfiles, profileFor, resetScope } from '../access/session';
import { demoWorkspaces, workspaceById, workspaceHref } from '../access/routes';
import {
  ActionLink,
  AttentionQueue,
  NextAction,
  Surface,
} from '../access/ProductPrimitives';
import styles from './WorkspaceAccess.module.css';

export default function WorkspaceAccess() {
  const params = useSearchParams();
  const router = useRouter();
  const access = useDemoAccess();
  const workspace = demoWorkspaces.find(
    (item) => item.id === params.get('workspace'),
  );
  const selected = profileFor(access.session);
  const icons = [
    UserRound,
    CalendarDays,
    BriefcaseBusiness,
    LayoutDashboard,
    HeartHandshake,
  ];
  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <section className={styles.heading} aria-labelledby="access-title">
        <div>
          <p className={styles.eyebrow}>TNP · SYNTHETIC WORKSPACES</p>
          <h1 id="access-title">
            Your next step,
            <br />
            <em>in the right space.</em>
          </h1>
          <p>
            Choose a workspace, then a named sample profile. No password, real
            booking, payment or external message is involved.
          </p>
        </div>
      </section>
      <StorageWarning />
      {!workspace &&
        selected?.state === 'active' &&
        demoWorkspaces.some((item) => item.id === selected.workspace) && (
          <div className={styles.resume}>
            <NextAction
              title={`Continue as ${selected.name}`}
              reason={`${workspaceById(selected.workspace)?.label} · selected in this tab. Preview records are unchanged.`}
              href={workspaceHref(selected.workspace)}
              action="Continue demo"
            />
          </div>
        )}
      {workspace ? (
        <section className={styles.access} aria-labelledby="choose-space-title">
          <div className={styles.intro}>
            <Link href="/login">← All workspaces</Link>
            <h2 id="choose-space-title">{workspace.label} demo</h2>
            <p>{workspace.purpose}</p>
            <p className={styles.notice}>
              {resetScope.switchProfile} Names and access states below are
              synthetic shell examples; existing feature records remain their
              own labelled samples.
            </p>
          </div>
          <div className={styles.choices}>
            {demoProfiles
              .filter((profile) => profile.workspace === workspace.id)
              .map((profile) => (
                <article
                  key={profile.id}
                  data-selected={selected?.id === profile.id}
                >
                  <div className={styles.cardTop}>
                    <span>Synthetic · {profile.state}</span>
                    {selected?.id === profile.id && <span>Selected</span>}
                  </div>
                  <h3>{profile.name}</h3>
                  <p>{profile.role}</p>
                  {profile.state !== 'active' && (
                    <p>
                      Workspace access is {profile.state} in this sample.
                      Selecting it demonstrates a blocked state and does not
                      open records.
                    </p>
                  )}
                  {!workspace.available && (
                    <p>
                      RSVP feature routes are not installed in this baseline.
                      This chooser previews access only; no staff workspace
                      opens.
                    </p>
                  )}
                  <button
                    type="button"
                    className={styles.action}
                    disabled={!access.ready}
                    onClick={() => {
                      access.select(profile.id);
                      if (profile.state === 'active' && workspace.available)
                        router.push(workspaceHref(workspace.id));
                    }}
                  >
                    {profile.state === 'active' && workspace.available
                      ? `Enter as ${profile.name}`
                      : `Preview ${profile.state} access`}
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </button>
                </article>
              ))}
            {selected?.workspace === workspace.id &&
              (selected.state !== 'active' || !workspace.available) && (
                <output aria-live="polite">
                  {selected.name}:{' '}
                  {selected.state !== 'active'
                    ? `access ${selected.state}. Choose an active demo profile to continue.`
                    : 'RSVP adapter pending. No workspace records opened.'}
                </output>
              )}
          </div>
        </section>
      ) : (
        <section className={styles.access} aria-labelledby="choose-space-title">
          <div className={styles.intro}>
            <p className={styles.eyebrow}>Choose your context</p>
            <h2 id="choose-space-title">
              Where would you
              <br />
              <em>like to begin?</em>
            </h2>
            <p>
              Demo identity stays in this browser tab. Production sign-in and
              recovery are not enabled by this chooser.
            </p>
            <AttentionQueue
              title="Need a little guidance?"
              items={[
                {
                  id: 'access-help',
                  title: 'Find your workspace',
                  detail: 'Ask TNP about the right access for your role.',
                  href: '/contact',
                  action: 'Ask about access',
                },
              ]}
            />
          </div>
          <div className={styles.choices}>
            {productAudiences.map((audience, index) => {
              const Icon = icons[index];
              return (
                <Surface key={audience.id} level="raised">
                  <div className={styles.cardTop}>
                    <Icon size={24} aria-hidden="true" />
                    <span>{audience.kind}</span>
                  </div>
                  <h3>{audience.name}</h3>
                  <p>{audience.detail}</p>
                  <ActionLink href={audience.href}>
                    {audience.action}
                  </ActionLink>
                </Surface>
              );
            })}
          </div>
        </section>
      )}
      <aside
        className={styles.staff}
        aria-label="Production access information"
      >
        <h2>A preview, not a live account</h2>
        <p>
          Production access requires reviewed authentication and authorization.
          Shell profile selection does not grant either.
        </p>
        <details>
          <summary>Cannot access your workspace?</summary>
          <p>
            This preview has no password or recovery email. Choose an active
            sample profile to test the interface. For real account access,
            contact TNP; do not share passwords or OTPs in an enquiry.
          </p>
          <Link href="/contact?interest=access-help">
            Ask about workspace access →
          </Link>
        </details>
      </aside>
      <footer className={styles.footer}>
        <span>TNP HOSPITALITY · SYNTHETIC PREVIEW</span>
        <Link href="/">Return home →</Link>
      </footer>
    </main>
  );
}
