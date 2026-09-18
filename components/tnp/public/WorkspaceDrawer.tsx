'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  LayoutDashboard,
  UserRound,
  Compass,
  X,
} from 'lucide-react';
import {
  workspaceInteraction,
  type WorkspaceState,
} from './workspace-interaction';

const workspaces = [
  { name: 'Client', href: '/client', icon: UserRound },
  { name: 'Planner', href: '/planner', icon: CalendarDays },
  { name: 'Freelancer', href: '/freelancer', icon: BriefcaseBusiness },
  { name: 'Operations preview', href: '/admin', icon: LayoutDashboard },
];

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
        aria-label="Explore TNP workspace previews"
        onClick={() => {
          dismissed.current = open;
          setState((value) => workspaceInteraction(value, 'toggle'));
        }}
      >
        {open ? <X size={20} /> : <Compass size={20} />}
        <span>Explore</span>
      </button>
      <nav
        id="public-workspaces"
        className="workspace-drawer"
        aria-label="Workspace preview pages"
        hidden={!open}
      >
        <p className="workspace-kicker">YOUR TNP · PAGE LINKS</p>
        <h2>Choose your TNP space</h2>
        <p className="workspace-warning">
          Synthetic previews, not production login. No real bookings, payments
          or messages.
        </p>
        {workspaces.map(({ name, href, icon: Icon }) => (
          <a key={href} href={href}>
            <Icon size={20} />
            <span>{name}</span>
            <ArrowUpRight size={16} />
          </a>
        ))}
      </nav>
    </div>
  );
}
