export type WorkspaceId = 'tnp-planner' | 'freelancer' | 'operations' | 'rsvp';
export type Surface = 'marketing' | 'access' | 'workspace' | 'guest-invitation';

// One catalogue feeds navigation, access, active labels and adapter destinations.
export const workspaceRegistry = [
  {
    id: 'tnp-planner',
    label: 'TNP Planner',
    path: '/planner',
    available: true,
    purpose: 'Explore senior TNP planning and workforce requirements.',
  },
  {
    id: 'freelancer',
    label: 'Freelancer',
    path: '/freelancer',
    available: true,
    purpose: 'Explore applications, opportunities and assignments.',
  },
  {
    id: 'operations',
    label: 'Operations',
    path: '/operations',
    available: true,
    purpose: 'Explore review queues and event operations.',
  },
  {
    id: 'rsvp',
    label: 'RSVP',
    path: '/rsvp/workspace',
    available: true,
    purpose: 'Dedicated synthetic WhatsApp response and information workspace.',
  },
] as const satisfies readonly {
  id: WorkspaceId;
  label: string;
  path: string;
  available: boolean;
  purpose: string;
}[];

export const workspaces = workspaceRegistry.filter(
  (item) => item.id === 'tnp-planner' || item.id === 'freelancer',
);

export const publicNavigation = [
  { label: 'Services', href: '/#services' },
  { label: 'Events', href: '/#events' },
  { label: 'Destinations', href: '/#destinations' },
  { label: 'RSVP', href: '/#rsvp' },
  { label: 'Work with TNP', href: '/#people' },
  { label: 'About', href: '/#about' },
] as const;
export const workspaceNavigation = [
  { label: 'Home', href: '/' },
  { label: 'Workspaces', href: '/login' },
] as const;

export function workspaceById(id: unknown) {
  return workspaceRegistry.find((workspace) => workspace.id === id);
}
export function chooserHref(id: WorkspaceId) {
  return id === 'operations'
    ? '/operations'
    : id === 'rsvp'
      ? '/rsvp/login'
      : `/login?workspace=${id}`;
}
export function workspaceHref(id: WorkspaceId) {
  const workspace = workspaceById(id)!;
  return workspace.available ? workspace.path : chooserHref(id);
}
export function routeInfo(path: string): {
  surface: Surface;
  workspace?: WorkspaceId;
  label: string;
} {
  const pathname = path.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  if (/^\/rsvp\/(invite|invitation|guest)(\/|$)/.test(pathname))
    return { surface: 'guest-invitation', label: 'RSVP invitation' };
  if (pathname === '/login' || pathname === '/rsvp/login')
    return {
      surface: 'access',
      label: 'Workspaces',
      ...(pathname === '/rsvp/login' ? { workspace: 'rsvp' as const } : {}),
    };
  if (pathname === '/admin' || pathname.startsWith('/admin/'))
    return {
      surface: 'workspace',
      workspace: 'operations',
      label: 'Operations',
    };
  for (const workspace of workspaceRegistry) {
    const root = workspace.id === 'rsvp' ? '/rsvp' : workspace.path;
    if (pathname === root || pathname.startsWith(`${root}/`))
      return {
        surface: 'workspace',
        workspace: workspace.id,
        label: workspace.label,
      };
  }
  return {
    surface: 'marketing',
    label: pathname === '/' ? 'TNP EXPERIENCE' : 'TNP HOSPITALITY',
  };
}
export function shouldMountCursor(path: string) {
  return path === '/';
}

// Presentation boundary for the later RSVP feature. No guest/staff identity mixing,
// domain records, persistence, calling, allocation or booking semantics live here.
export function rsvpContext(path: string) {
  const info = routeInfo(path);
  if (info.surface === 'guest-invitation') return { kind: 'guest' as const };
  const event = /^\/rsvp\/events\/([^/?#]+)(?:\/|$|[?#])/.exec(path);
  if (event) return { kind: 'event' as const, eventId: event[1] };
  return { kind: 'organization' as const };
}
export function clearRsvpSelectionOnContextChange<T>(
  previous: string,
  next: string,
  selection: T,
): T | null {
  return previous === next ? selection : null;
}
