'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { canEnter, createDemoSessionStore, profileFor, type DemoSession } from './session';
import { chooserHref, routeInfo } from './routes';

type Snapshot = { session: DemoSession | null; memoryOnly: boolean; ready: boolean };
type Access = Snapshot & { select: (profileId: string) => DemoSession; exit: () => void };
const Context = createContext<Access | null>(null);

export function DemoAccessProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => createDemoSessionStore(() => window.sessionStorage));
  const [snapshot, setSnapshot] = useState<Snapshot>({ session: null, memoryOnly: false, ready: false });
  useEffect(() => { let active = true; void Promise.resolve().then(() => { if (active) setSnapshot({ ...store.read(), ready: true }); }); return () => { active = false; }; }, [store]);
  return <Context.Provider value={{ ...snapshot,
    select(profileId) { const next = store.select(profileId); setSnapshot({ ...next, ready: true }); return next.session; },
    exit() { setSnapshot({ ...store.exit(), ready: true }); },
  }}>{children}</Context.Provider>;
}
export function useDemoAccess() {
  const context = useContext(Context);
  if (!context) throw new Error('DemoAccessProvider is required.');
  return context;
}
export function StorageWarning() {
  const access = useDemoAccess();
  return access.memoryOnly ? <output className="ux-storage-warning" aria-live="polite">Tab storage is unavailable. Demo identity is held in memory; reloading may lose this selection or restore an older saved identity. Preview records are separate.</output> : null;
}
export function WorkspaceGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, ready } = useDemoAccess();
  const info = routeInfo(pathname);
  const allowed = !!info.workspace && canEnter(session, info.workspace);
  useEffect(() => {
    if (ready && info.surface === 'workspace' && info.workspace && !allowed) router.replace(chooserHref(info.workspace));
  }, [ready, allowed, info.surface, info.workspace, router]);
  if (info.surface !== 'workspace') return children;
  if (!ready || !allowed) return <main id="main-content" tabIndex={-1} className="ux-access-pending"><h1>Choose a demo profile</h1><p>{ready ? 'Opening the workspace chooser…' : 'Checking this tab’s demo selection…'}</p><Link href={chooserHref(info.workspace!)}>Open {info.label} chooser</Link></main>;
  return <><StorageWarning /><section className="ux-identity" aria-label="Shell demo identity"><strong>{profileFor(session)?.name} · Synthetic preview</strong><span>{profileFor(session)?.role}. This shell identity does not grant production access or change feature-local sample records.</span></section>{children}</>;
}
