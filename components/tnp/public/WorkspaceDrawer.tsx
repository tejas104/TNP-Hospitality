'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  HeartHandshake,
  LayoutDashboard,
  UserRound,
  Compass,
  X,
} from 'lucide-react';
import {
  workspaceInteraction,
  type WorkspaceState,
} from './workspace-interaction';
import { accessAudiences } from './access-content';

const icons = [UserRound, CalendarDays, BriefcaseBusiness, LayoutDashboard, HeartHandshake];

// Homepage-only sibling of the existing portal switcher: non-modal navigation,
// no authentication claim and no synthetic data controls on the public page.
export default function WorkspaceDrawer() {
  const [state, setState] = useState<WorkspaceState>('closed');
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const dismissed = useRef(false);
  const open = state !== 'closed';
  useEffect(() => {
    if (!open) return;
    const close = () => {
      dismissed.current = true;
      setState('closed');
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        trigger.current?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (root.current?.contains(event.target as Node)) return;
      if (root.current?.contains(document.activeElement))
        trigger.current?.focus();
      close();
    };
    document.addEventListener('keydown', key);
    document.addEventListener('pointerdown', outside);
    return () => {
      document.removeEventListener('keydown', key);
      document.removeEventListener('pointerdown', outside);
    };
  }, [open]);
  return (
    <div
      ref={root}
      className="workspace-explorer"
      data-open={open}
      onPointerEnter={(event) => {
        if (
          event.pointerType === 'mouse' &&
          matchMedia('(hover: hover) and (pointer: fine)').matches &&
          !dismissed.current
        )
          setState((value) => workspaceInteraction(value, 'enter'));
      }}
      onPointerLeave={() => {
        dismissed.current = false;
        if (!root.current?.contains(document.activeElement))
          setState((value) => workspaceInteraction(value, 'leave'));
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          dismissed.current = true;
          setState('closed');
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        className="workspace-trigger"
        aria-expanded={open}
        aria-controls="public-workspaces"
        aria-label="Your space — find TNP workspace access"
        onClick={() => {
          dismissed.current = open;
          setState((value) => workspaceInteraction(value, 'toggle'));
        }}
      >
        {open ? <X size={20} /> : <Compass size={20} />}
        <span>Your space</span>
      </button>
      <nav
        id="public-workspaces"
        className="workspace-drawer"
        aria-label="Workspace preview pages"
        hidden={!open}
      >
        <p className="workspace-kicker">YOUR TNP · FIND YOUR PLACE</p>
        <h2>Choose your TNP space</h2>
        <p className="workspace-warning">
          Synthetic previews, not production login. No real bookings, payments
          or messages.
        </p>
        {accessAudiences.map(({ name, href, summary }, index) => {
          const Icon = icons[index];
          return (
            <a key={href} href={href}>
              <Icon size={20} aria-hidden="true" />
              <span>
                <strong>{name}</strong>
                <small>{summary}</small>
              </span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          );
        })}
        <Link className="workspace-access-link" href="/login">
          Workspace / login access <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </nav>
    </div>
  );
}
