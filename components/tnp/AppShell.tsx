'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  const label = transitionLabels[pathname] ?? 'TNP HOSPITALITY';

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
  }, []);

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
  }, [router]);

  return (
    <>
      <Preloader active={showPreloader} />
      <CustomCursor />
      <div
        className={`route-curtain ${routeAnimating ? 'active' : ''}`}
        aria-hidden="true"
      >
        <span>{label}</span>
      </div>
      <header className={`site-nav ${scrolled ? 'is-scrolled' : ''}`}>
        <Link className="brand-mark" href="/" data-cursor="OPEN">
          <span>TNP</span>
          <small>Hospitality</small>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <Link className="login-link" href="/planner">
            Login
          </Link>
          <Link
            className="magnetic-btn small"
            href="/client"
            data-cursor="EXPLORE"
          >
            Let&apos;s Talk
          </Link>
          <button
            className="menu-toggle"
            type="button"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>
      <PortalSwitcher key={pathname} pathname={pathname} />
      <MobileMenu open={menuOpen} />
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
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? 'page' : undefined}
            >
              <Icon size={20} strokeWidth={1.5} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function MobileMenu({ open }: { open: boolean }) {
  return (
    <div className={`mobile-menu ${open ? 'open' : ''}`} inert={!open}>
      {[...navLinks, ...portalLinks].map((link) => (
        <Link key={`${link.label}-${link.href}`} href={link.href}>
          {link.label}
        </Link>
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
