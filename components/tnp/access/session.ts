import { workspaceById, type WorkspaceId } from './routes.ts';

export type AccessState =
  | 'active'
  | 'invited'
  | 'suspended'
  | 'expired'
  | 'revoked'
  | 'forbidden';
export type DemoProfile = {
  id: string;
  workspace: WorkspaceId;
  name: string;
  role: string;
  state: AccessState;
};
export const demoProfiles: readonly DemoProfile[] = [
  {
    id: 'client-asha',
    workspace: 'client',
    name: 'Asha Shah',
    role: 'Client · sample organization',
    state: 'active',
  },
  {
    id: 'client-representative',
    workspace: 'client',
    name: 'Mira Rao',
    role: 'Client-appointed planner · sample Client representative',
    state: 'active',
  },
  {
    id: 'client-invited',
    workspace: 'client',
    name: 'Dev Shah',
    role: 'Client invitation preview',
    state: 'invited',
  },
  {
    id: 'planner-senior',
    workspace: 'tnp-planner',
    name: 'Riya Mehta',
    role: 'Senior TNP Planner · shell preview',
    state: 'active',
  },
  {
    id: 'planner-suspended',
    workspace: 'tnp-planner',
    name: 'Aman Sethi',
    role: 'TNP Planner access preview',
    state: 'suspended',
  },
  {
    id: 'freelancer-explorer',
    workspace: 'freelancer',
    name: 'Neha Joshi',
    role: 'Freelancer explorer · feature sample profile chosen separately',
    state: 'active',
  },
  {
    id: 'freelancer-revoked',
    workspace: 'freelancer',
    name: 'Rohan Das',
    role: 'Freelancer access preview',
    state: 'revoked',
  },
  {
    id: 'operations-reviewer',
    workspace: 'operations',
    name: 'Kavya Rao',
    role: 'Operations reviewer · shell preview',
    state: 'active',
  },
  {
    id: 'operations-forbidden',
    workspace: 'operations',
    name: 'Arjun Sen',
    role: 'Operations access preview',
    state: 'forbidden',
  },
  {
    id: 'rsvp-team',
    workspace: 'rsvp',
    name: 'Tara Kapoor',
    role: 'RSVP team · adapter pending',
    state: 'active',
  },
  {
    id: 'rsvp-expired',
    workspace: 'rsvp',
    name: 'Ishaan Roy',
    role: 'RSVP entitlement preview',
    state: 'expired',
  },
];
export const DEMO_SESSION_KEY = 'tnp-demo-session-v1';
export type DemoSession = {
  version: 1;
  profileId: string;
  workspace: WorkspaceId;
};
export const resetScope = {
  switchProfile:
    'Changes only the shell demo identity; keeps all preview records.',
  exit: 'Clears only the shell demo identity; keeps all preview records.',
  connected:
    'Resets connected cross-portal preview records. Does not reset demo identity or RSVP-local records.',
} as const;

export function parseDemoSession(raw: string | null): DemoSession | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object' || Array.isArray(value))
      return null;
    const candidate = value as Record<string, unknown>;
    if (
      Object.keys(candidate).sort().join(',') !==
        'profileId,version,workspace' ||
      candidate.version !== 1
    )
      return null;
    const profile = demoProfiles.find(
      (item) =>
        item.id === candidate.profileId &&
        item.workspace === candidate.workspace,
    );
    return profile
      ? { version: 1, profileId: profile.id, workspace: profile.workspace }
      : null;
  } catch {
    return null;
  }
}
export function profileFor(session: DemoSession | null) {
  return demoProfiles.find(
    (profile) =>
      profile.id === session?.profileId &&
      profile.workspace === session.workspace,
  );
}
export function canEnter(session: DemoSession | null, workspace: WorkspaceId) {
  return (
    session?.workspace === workspace &&
    profileFor(session)?.state === 'active' &&
    workspaceById(workspace)?.available === true
  );
}

type StoragePort = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
// The closure belongs to one browser tab. Once storage fails, stale disk identity
// must never overwrite a newer in-memory switch or exit on the next render.
export function createDemoSessionStore(storage: () => StoragePort) {
  let memory: DemoSession | null = null;
  let memoryOnly = false;
  return {
    read() {
      if (!memoryOnly) {
        try {
          memory = parseDemoSession(storage().getItem(DEMO_SESSION_KEY));
        } catch {
          memoryOnly = true;
        }
      }
      return { session: memory, memoryOnly };
    },
    select(profileId: string) {
      const profile = demoProfiles.find((item) => item.id === profileId);
      if (!profile) throw new Error('Unknown synthetic profile.');
      memory = {
        version: 1,
        profileId: profile.id,
        workspace: profile.workspace,
      };
      if (!memoryOnly) {
        try {
          storage().setItem(DEMO_SESSION_KEY, JSON.stringify(memory));
        } catch {
          memoryOnly = true;
        }
      }
      return { session: memory, memoryOnly };
    },
    exit() {
      memory = null;
      if (!memoryOnly) {
        try {
          storage().removeItem(DEMO_SESSION_KEY);
        } catch {
          memoryOnly = true;
        }
      }
      return { session: memory, memoryOnly };
    },
  };
}
