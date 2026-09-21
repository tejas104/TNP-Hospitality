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
  shouldMountCursor,
  workspaceNavigation,
} from './access/routes';
import { profileFor } from './access/session';
import WorkspaceDrawer from './public/WorkspaceDrawer';

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
  const [showPreloader, setShowPreloader] = useState(false);
  const preloaderChecked = useRef(false);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const publicPage = info.surface === 'marketing';
  const guest = info.surface === 'guest-invitation';
  const links = publicPage ? publicNavigation : workspaceNavigation;
  // Preserve the existing homepage-only presentation during the shared refactor.
  useEffect(() => {
    if (pathname !== '/' || preloaderChecked.current) return;
    preloaderChecked.current = true;
    try {
      if (sessionStorage.getItem('tnp-preloader-seen')) return;
    } catch {
      return;
    }
    const start = window.setTimeout(() => setShowPreloader(true), 0);
    const timer = window.setTimeout(() => {
      try {
        sessionStorage.setItem('tnp-preloader-seen', 'true');
      } catch {
        /* Optional visual preference. */
      }
      setShowPreloader(false);
    }, 1450);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(timer);
      setShowPreloader(false);
    };
  }, [pathname]);
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
      {shouldMountCursor(pathname) && <CustomCursor />}
      {pathname === '/' && (
        <>
          <Preloader active={showPreloader} />
        </>
      )}
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
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        trigger.current?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) {
        if (root.current?.contains(document.activeElement))
          trigger.current?.focus();
        setOpen(false);
      }
    };
    document.addEventListener('keydown', dismiss);
    document.addEventListener('pointerdown', outside);
    return () => {
      document.removeEventListener('keydown', dismiss);
      document.removeEventListener('pointerdown', outside);
    };
  }, [open]);
  return (
    <div
      className="ux-switcher"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        className="ux-workspace-pill"
        ref={trigger}
        type="button"
        disabled={!ready}
        aria-expanded={open}
        aria-controls="workspace-menu"
        onClick={() => setOpen((value) => !value)}
      >
        {`${demoWorkspaces.find((workspace) => workspace.id === current)?.label ?? 'Switch'} workspace`}
        <span aria-hidden="true">⌄</span>
      </button>
      <nav
        id="workspace-menu"
        className="ux-workspace-menu"
        aria-label="Choose workspace"
        hidden={!open}
      >
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
    </div>
  );
}
function CustomCursor() {
  const cursor = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (
      window.matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)')
        .matches
    )
      return;
    const move = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      const cursorTarget = target?.closest?.(
        '[data-cursor]',
      ) as HTMLElement | null;
      if (cursor.current) {
        cursor.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
        cursor.current.style.opacity = '1';
      }
      setLabel(cursorTarget?.dataset.cursor ?? '');
    };
    const hide = () => {
      if (cursor.current) cursor.current.style.opacity = '0';
    };
    window.addEventListener('pointermove', move);
    document.addEventListener('pointerleave', hide);
    window.addEventListener('blur', hide);
    document.body.classList.add('has-custom-cursor');
    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', hide);
      window.removeEventListener('blur', hide);
      document.body.classList.remove('has-custom-cursor');
    };
  }, []);

  return (
    <div
      ref={cursor}
      className={`custom-cursor ${label ? 'active' : ''}`}
      aria-hidden="true"
    >
      <i className="cursor-ring" />
      <span>{label}</span>
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
