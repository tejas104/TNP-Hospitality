'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { PreviewControls } from './shared/PreviewControls';
import {
  DemoAccessProvider,
  useDemoAccess,
  WorkspaceGate,
} from './access/DemoAccess';
import {
  chooserHref,
  demoWorkspaces,
  publicNavigation,
  routeInfo,
  workspaceNavigation,
} from './access/routes';
import { profileFor } from './access/session';
import WorkspaceDrawer from './public/WorkspaceDrawer';
import { GenieWindow } from './public/portal-launcher/PortalLauncher';

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <DemoAccessProvider>
      <Shell>{children}</Shell>
    </DemoAccessProvider>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const info = routeInfo(pathname);
  const access = useDemoAccess();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const setMenuOpen = (value: boolean | ((previous: boolean) => boolean)) =>
    setMenuPath(
      (typeof value === 'function' ? value(menuOpen) : value) ? pathname : null,
    );
  const [scrolled, setScrolled] = useState(false);
  // Launch loader: rendered on the server so no page content shows first,
  // then held for 2 seconds on the first load of any route (2026-09-21).
  const [showPreloader, setShowPreloader] = useState(true);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const publicPage = info.surface === 'marketing';
  const guest = info.surface === 'guest-invitation';
  const links = publicPage ? publicNavigation : workspaceNavigation;
  useEffect(() => {
    const timer = window.setTimeout(() => setShowPreloader(false), 2000);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuPath(null);
        menuTrigger.current?.focus();
      }
    };
    window.addEventListener('keydown', dismiss);
    return () => window.removeEventListener('keydown', dismiss);
  }, [menuOpen, pathname]);
  function exitDemo() {
    access.exit();
    // On a workspace, the gate owns the redirect to that workspace's chooser.
    // Avoid racing it with a second navigation while the identity is cleared.
    if (info.surface !== 'workspace') router.push('/login');
  }
  return (
    <>
      <a
        className="public-skip"
        href="#main-content"
        onClick={(event) => {
          const main =
            Array.from(
              document.querySelectorAll('main#main-content, main'),
            ).find((element) => element.getClientRects().length > 0) ??
            document.querySelector('h1');
          if (main instanceof HTMLElement) {
            event.preventDefault();
            main.tabIndex = -1;
            main.focus();
            main.scrollIntoView({ block: 'start' });
          }
        }}
      >
        Skip to main content
      </a>
      <Preloader active={showPreloader} />
      {guest ? (
        <header className="ux-guest-header">TNP · RSVP invitation</header>
      ) : (
        <header
          className={`site-nav ${publicPage ? 'public-nav' : 'ux-header'} ${scrolled ? 'is-scrolled' : ''} ${publicPage && menuOpen ? 'public-menu-visible' : ''}`}
        >
          <Link className="brand-mark" href="/" data-cursor="OPEN">
            <span>TNP</span>
            <small>Hospitality</small>
          </Link>
          <nav
            className="desktop-nav"
            aria-label={publicPage ? 'Public pages' : 'Primary navigation'}
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="nav-actions">
            {publicPage ? (
              <>
                <WorkspaceDrawer />
                <Link className="magnetic-btn small" href="/contact">
                  Let&apos;s Talk
                </Link>
              </>
            ) : (
              <>
                <span className="ux-header-identity">
                  {profileFor(access.session)?.name ?? 'Synthetic preview'}
                </span>
                <WorkspaceSwitcher key={pathname} current={info.workspace} />
              </>
            )}
            <button
              ref={menuTrigger}
              className="menu-toggle"
              type="button"
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
              aria-controls="shell-mobile-navigation"
              onClick={() => setMenuOpen((value) => !value)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          {!publicPage && access.session && (
            <div className="ux-profile-actions">
              <Link href={chooserHref(access.session.workspace)}>
                Switch demo profile
              </Link>
              <button type="button" onClick={exitDemo}>
                Exit demo
              </button>
            </div>
          )}
          <nav
            id="shell-mobile-navigation"
            className={`ux-mobile-navigation ${publicPage ? 'ux-public-mobile' : ''}`}
            aria-label="Mobile navigation"
            hidden={!menuOpen}
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {publicPage && (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)}>
                  Workspaces
                </Link>
                <Link href="/contact" onClick={() => setMenuOpen(false)}>
                  Contact
                </Link>
              </>
            )}
          </nav>
        </header>
      )}
      <WorkspaceGate>
        {info.surface === 'workspace' && info.workspace !== 'rsvp' && (
          <PreviewControls />
        )}
        {info.surface === 'workspace' ? (
          <div id="workspace-content" tabIndex={-1}>
            {children}
          </div>
        ) : (
          children
        )}
      </WorkspaceGate>
    </>
  );
}

function WorkspaceSwitcher({ current }: { current?: string }) {
  const { ready } = useDemoAccess();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <div className="ux-switcher">
      <button
        className="ux-workspace-pill"
        ref={trigger}
        type="button"
        disabled={!ready}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        {`${demoWorkspaces.find((workspace) => workspace.id === current)?.label ?? 'Switch'} workspace`}
        <span aria-hidden="true">⌄</span>
      </button>
      {/* Same source-anchored genie window as the launcher (2026-09-21). */}
      <GenieWindow
        sourceRef={trigger}
        open={open}
        onClose={() => setOpen(false)}
        title="Choose workspace"
        label="Close workspace chooser"
        align="end"
      >
        <nav className="genie-workspace-list" aria-label="Choose workspace">
          {demoWorkspaces.map((workspace) => (
            <Link
              key={workspace.id}
              href={chooserHref(workspace.id)}
              aria-current={current === workspace.id ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              <strong>
                {workspace.label}
                {current === workspace.id ? ' · Current' : ''}
              </strong>
              <small>{workspace.purpose}</small>
            </Link>
          ))}
        </nav>
      </GenieWindow>
    </div>
  );
}
function Preloader({ active }: { active: boolean }) {
  return (
    <div
      className={`preloader ${active ? 'active' : ''}`}
      aria-hidden={!active}
    >
      <div className="preloader-mark">
        <span>T</span>
        <span>N</span>
        <span>P</span>
      </div>
      <p>HOSPITALITY</p>
      <i />
    </div>
  );
}
