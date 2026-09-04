'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
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
      <div className={`route-curtain ${routeAnimating ? 'active' : ''}`} aria-hidden="true">
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
          <Link className="magnetic-btn small" href="/client" data-cursor="EXPLORE">
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
      <div className="portal-switcher" aria-label="Portal switcher">
        {portalLinks.map((link) => (
          <Link key={link.label} href={link.href} data-cursor="OPEN">
            {link.label}
          </Link>
        ))}
      </div>
      <MobileMenu open={menuOpen} />
      {children}
    </>
  );
}

function MobileMenu({ open }: { open: boolean }) {
  return (
    <div className={`mobile-menu ${open ? 'open' : ''}`}>
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
    <div className={`preloader ${active ? 'active' : ''}`} aria-hidden={!active}>
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
  const [state, setState] = useState({ x: -100, y: -100, label: '' });
  const isTouch = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
    [],
  );

  useEffect(() => {
    if (isTouch) return;
    const move = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      const cursorTarget = target?.closest?.('[data-cursor]') as HTMLElement | null;
      setState({
        x: event.clientX,
        y: event.clientY,
        label: cursorTarget?.dataset.cursor ?? '',
      });
    };
    window.addEventListener('pointermove', move);
    document.body.classList.add('has-custom-cursor');
    return () => {
      window.removeEventListener('pointermove', move);
      document.body.classList.remove('has-custom-cursor');
    };
  }, [isTouch]);

  if (isTouch) return null;

  return (
    <div
      className={`custom-cursor ${state.label ? 'active' : ''}`}
      style={{ transform: `translate3d(${state.x}px, ${state.y}px, 0)` }}
      aria-hidden="true"
    >
      <span>{state.label}</span>
    </div>
  );
}
