'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BriefcaseBusiness,
  CalendarDays,
  LayoutDashboard,
  Menu,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { navLinks, portalLinks } from '@/data/tnp';
import { PreviewControls } from '@/components/tnp/shared/PreviewControls';
import WorkspaceDrawer from './public/WorkspaceDrawer';
import { publicNavigation } from './public/access-content';

gsap.registerPlugin(ScrollTrigger);

const transitionLabels: Record<string, string> = {
  '/': 'TNP EXPERIENCE',
  '/client': 'CLIENT EXPERIENCE',
  '/planner': 'PLANNER PORTAL',
  '/freelancer': 'FREELANCER PORTAL',
  '/admin': 'OPERATIONS DEMO',
};

type TnpModelContextDocument = Document & {
  modelContext?: {
    registerTool?: (
      tool: {
        name: string;
        title: string;
        description: string;
        inputSchema: object;
        annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
        execute: (input: unknown) => { portal: string; path: string };
      },
      options: { signal: AbortSignal },
    ) => void | Promise<void>;
  };
};

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const firstRouteRender = useRef(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showPreloader, setShowPreloader] = useState(false);
  const [routeAnimating, setRouteAnimating] = useState(false);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const label = transitionLabels[pathname] ?? 'TNP HOSPITALITY';
  const publicPage = !['/client', '/planner', '/freelancer', '/admin'].some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const publicLinks = publicNavigation;

  useEffect(() => {
    if (!publicPage || !menuOpen) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuTrigger.current?.focus();
      }
    };
    window.addEventListener('keydown', dismiss);
    return () => window.removeEventListener('keydown', dismiss);
  }, [publicPage, menuOpen]);

  useEffect(() => {
    const seen = sessionStorage.getItem('tnp-preloader-seen');
    if (!seen) {
      setShowPreloader(true);
      const timer = window.setTimeout(() => {
        sessionStorage.setItem('tnp-preloader-seen', 'true');
        setShowPreloader(false);
      }, 1450);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // The public photography narrative follows native scrolling. Keep the
    // existing portal smooth-scroll behavior outside the homepage unchanged.
    if (pathname === '/') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      syncTouch: false,
    });
    lenis.on('scroll', () => ScrollTrigger.update());
    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (firstRouteRender.current) {
      firstRouteRender.current = false;
      return;
    }
    setRouteAnimating(true);
    const timer = window.setTimeout(() => setRouteAnimating(false), 900);
    return () => {
      window.clearTimeout(timer);
    };
  }, [pathname]);

  useEffect(() => {
    if (publicPage) return;
    const context = (document as TnpModelContextDocument).modelContext;
    if (!context?.registerTool) return;
    const controller = new AbortController();
    const portalRoutes: Record<string, string> = {
      client: '/client',
      planner: '/planner',
      freelancer: '/freelancer',
      operations: '/admin',
    };

    void Promise.resolve(
      context.registerTool(
        {
          name: 'open_tnp_portal',
          title: 'Open TNP portal',
          description:
            'Navigate to one of the visible TNP demo portals: client, planner, freelancer or operations.',
          inputSchema: {
            type: 'object',
            properties: {
              portal: {
                type: 'string',
                enum: ['client', 'planner', 'freelancer', 'operations'],
              },
            },
            required: ['portal'],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          execute(input) {
            if (!input || typeof input !== 'object' || !('portal' in input)) {
              throw new Error('A portal value is required.');
            }
            const portal = String(input.portal);
            const path = portalRoutes[portal];
            if (!path) throw new Error('Unsupported TNP portal.');
            router.push(path);
            return { portal, path };
          },
        },
        { signal: controller.signal },
      ),
    ).catch(() => undefined);

    return () => controller.abort();
  }, [router, publicPage]);

  return (
    <>
      {publicPage && (
        <a
          className="public-skip"
          href="#main-content"
          onClick={(event) => {
            const main = document.getElementById('main-content');
            if (main) main.focus();
            else {
              // The framework's invalid-slug page has a heading but no main.
              const heading = document.querySelector('h1');
              if (heading) {
                event.preventDefault();
                heading.tabIndex = -1;
                heading.focus();
              }
            }
          }}
        >
          Skip to main content
        </a>
      )}
      <Preloader active={showPreloader} />
      <CustomCursor />
      <div
        className={`route-curtain ${routeAnimating ? 'active' : ''}`}
        aria-hidden="true"
      >
        <span>{label}</span>
      </div>
      <header
        className={`site-nav ${publicPage ? 'public-nav' : ''} ${scrolled ? 'is-scrolled' : ''} ${publicPage && menuOpen ? 'public-menu-visible' : ''}`}
      >
        <Link className="brand-mark" href="/" data-cursor="OPEN">
          <span>TNP</span>
          <small>Hospitality</small>
        </Link>
        <nav
          className="desktop-nav"
          aria-label={publicPage ? 'Homepage sections' : 'Primary navigation'}
        >
          {(publicPage ? publicLinks : navLinks).map((link) => (
            <a
              key={link.label}
              href={link.href}
              title={
                publicPage ? `${link.label} — homepage section` : undefined
              }
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          {publicPage && (
            <Link
              className="public-access-link"
              href="/login"
              aria-label="Workspace / login access"
            >
              <span className="access-wide">Workspace / Login</span>
              <span className="access-compact">Workspace</span>
            </Link>
          )}
          {!publicPage && (
            <Link className="login-link" href="/planner">
              Login
            </Link>
          )}
          <Link
            className="magnetic-btn small"
            href={publicPage ? '/contact' : '/client'}
            data-cursor="EXPLORE"
          >
            Let&apos;s Talk
          </Link>
          <button
            ref={menuTrigger}
            className="menu-toggle"
            type="button"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls={publicPage ? 'public-mobile-navigation' : undefined}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>
      {!publicPage && <PreviewControls />}
      {pathname === '/' && <WorkspaceDrawer />}
      {!publicPage && <PortalSwitcher key={pathname} pathname={pathname} />}
      <MobileMenu
        publicPage={publicPage}
        open={menuOpen}
        links={
          publicPage
            ? [
                ...publicLinks,
                { label: 'Workspace / Login', href: '/login' },
                { label: 'Enquire', href: '/contact' },
              ]
            : [...navLinks, ...portalLinks]
        }
        onNavigate={() => {
          if (publicPage) setMenuOpen(false);
        }}
      />
      {children}
    </>
  );
}

function PortalSwitcher({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const hoverDismissed = useRef(false);
  const icons = [UserRound, CalendarDays, BriefcaseBusiness, LayoutDashboard];

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        hoverDismissed.current = true;
        setOpen(false);
        trigger.current?.focus();
      }
    };
    window.addEventListener('keydown', dismiss);
    return () => window.removeEventListener('keydown', dismiss);
  }, [open]);

  return (
    <div
      className={`portal-switcher ${open ? 'is-open' : ''}`}
      aria-label="Portal switcher"
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse' && !hoverDismissed.current)
          setOpen(true);
      }}
      onPointerLeave={(event) => {
        hoverDismissed.current = false;
        if (!event.currentTarget.contains(document.activeElement))
          setOpen(false);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        className="portal-trigger"
        type="button"
        aria-label="Switch portal"
        title="Switch portal"
        aria-expanded={open}
        aria-controls="portal-dial"
        onClick={() => {
          hoverDismissed.current = open;
          setOpen((value) => !value);
        }}
      >
        {open ? <X size={22} /> : <UsersRound size={24} />}
      </button>
      <nav
        id="portal-dial"
        className="portal-dial"
        aria-label="Choose your portal"
        inert={!open}
      >
        <p>YOUR TNP</p>
        {portalLinks.map((link, index) => {
          const Icon = icons[index];
          return (
            <a
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? 'page' : undefined}
            >
              <Icon size={20} strokeWidth={1.5} />
              <span>{link.label}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}

function MobileMenu({
  publicPage,
  open,
  links,
  onNavigate,
}: {
  publicPage: boolean;
  open: boolean;
  links: { label: string; href: string }[];
  onNavigate: () => void;
}) {
  return (
    <div
      className={`mobile-menu ${publicPage ? 'public-menu' : ''} ${open ? 'open' : ''}`}
      id={publicPage ? 'public-mobile-navigation' : undefined}
      role={publicPage ? 'navigation' : undefined}
      aria-label={publicPage ? 'Public menu' : undefined}
      inert={!open}
    >
      {links.map((link) => (
        <a
          key={`${link.label}-${link.href}`}
          href={link.href}
          onClick={onNavigate}
        >
          {link.label}
        </a>
      ))}
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

function CustomCursor() {
  const cursor = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
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
