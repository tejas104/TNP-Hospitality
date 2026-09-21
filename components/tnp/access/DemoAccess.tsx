'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  demoProfiles,
  canEnter,
  createDemoSessionStore,
  profileFor,
  type DemoSession,
} from './session';
import { chooserHref, routeInfo } from './routes';
import { NextAction, Orientation } from './ProductPrimitives';

type Snapshot = {
  session: DemoSession | null;
  memoryOnly: boolean;
  ready: boolean;
};
type Access = Snapshot & {
  select: (profileId: string) => DemoSession;
  exit: () => void;
};
const Context = createContext<Access | null>(null);

export function DemoAccessProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() =>
    createDemoSessionStore(() => window.sessionStorage),
  );
  const [snapshot, setSnapshot] = useState<Snapshot>({
    session: null,
    memoryOnly: false,
    ready: false,
  });
  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) setSnapshot({ ...store.read(), ready: true });
    });
    return () => {
      active = false;
    };
  }, [store]);
  return (
    <Context.Provider
      value={{
        ...snapshot,
        select(profileId) {
          const next = store.select(profileId);
          setSnapshot({ ...next, ready: true });
          return next.session;
        },
        exit() {
          setSnapshot({ ...store.exit(), ready: true });
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useDemoAccess() {
  const context = useContext(Context);
  if (!context) throw new Error('DemoAccessProvider is required.');
  return context;
}
export function StorageWarning() {
  const access = useDemoAccess();
  return access.memoryOnly ? (
    <output className="ux-storage-warning" aria-live="polite">
      Tab storage is unavailable. Demo identity is held in memory; reloading may
      lose this selection or restore an older saved identity. Preview records
      are separate.
    </output>
  ) : null;
}
export function WorkspaceGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, ready, select } = useDemoAccess();
  const info = routeInfo(pathname);
  const allowed = !!info.workspace && canEnter(session, info.workspace);
  useEffect(() => {
    if (
      ready &&
      info.surface === 'workspace' &&
      info.workspace &&
      !['operations', 'rsvp'].includes(info.workspace) &&
      !allowed
    )
      router.replace(chooserHref(info.workspace));
  }, [ready, allowed, info.surface, info.workspace, router]);
  if (info.surface !== 'workspace') return children;
  if (
    ready &&
    !allowed &&
    (info.workspace === 'operations' || info.workspace === 'rsvp')
  )
    return (
      <main id="main-content" className="ux-access-pending">
        <p className="ux-eyebrow">INTERNAL / DEDICATED SYNTHETIC PREVIEW</p>
        <h1>{info.label} access preview</h1>
        <p>
          No production authentication or authorization is provided. Use only
          named sample identities; no real personal information.
        </p>
        <StorageWarning />
        <div className="ux-actions">
          {demoProfiles
            .filter((p) => p.workspace === info.workspace)
            .map((p) => (
              <button
                key={p.id}
                className="ux-action"
                onClick={() => select(p.id)}
              >
                {p.state === 'active' ? 'Enter as' : 'Preview ' + p.state + ':'}{' '}
                {p.name}
              </button>
            ))}
        </div>
        {session?.workspace === info.workspace && (
          <output aria-live="polite">
            Sample access: {profileFor(session)?.state}. Only an active sample
            identity can open this preview.
          </output>
        )}
        <Link href="/">Return to public website</Link>
      </main>
    );
  if (!ready || !allowed)
    return (
      <main id="main-content" tabIndex={-1} className="ux-access-pending">
        <h1>Choose a demo profile</h1>
        <p>
          {ready
            ? 'Opening the workspace chooser…'
            : 'Checking this tab’s demo selection…'}
        </p>
        <Link href={chooserHref(info.workspace!)}>
          Open {info.label} chooser
        </Link>
      </main>
    );
  return (
    <>
      <StorageWarning />
      <Orientation
        title={`${info.label} workspace`}
        identity={profileFor(session)?.name ?? ''}
        state={`${profileFor(session)?.role}. Shell selection keeps feature-local sample records unchanged; production access is not granted.`}
      >
        <NextAction
          title={
            info.workspace === 'tnp-planner'
              ? 'Review planner requirements'
              : info.workspace === 'freelancer'
                ? 'Review your application or assignment'
                : info.workspace === 'rsvp'
                  ? 'Review your event responses'
                  : 'Review outstanding event decisions'
          }
          reason="Use the labelled sample records below to continue your next task."
          href="#workspace-content"
          action={`Open ${info.label} tasks`}
        />
      </Orientation>
      {children}
    </>
  );
}
