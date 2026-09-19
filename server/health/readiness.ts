import type { PlatformEnvironment } from '../config/env.ts';

export interface ReadinessProbe {
  readonly name: string;
  check(): Promise<void>;
}

export interface HealthResult {
  readonly status: 'live';
  readonly checkedAt: string;
}

export interface ReadinessResult {
  readonly status: 'ready' | 'unavailable';
  readonly checkedAt: string;
  readonly checks: readonly {
    readonly name: string;
    readonly status: 'ready' | 'unavailable';
  }[];
}

export function liveness(now = new Date()): HealthResult {
  return Object.freeze({ status: 'live', checkedAt: now.toISOString() });
}

export async function readiness(
  loadEnvironment: () => PlatformEnvironment,
  dependencies: (environment: PlatformEnvironment) => readonly ReadinessProbe[],
  now = new Date(),
): Promise<ReadinessResult> {
  const checkedAt = now.toISOString();
  let environment: PlatformEnvironment;
  try {
    environment = loadEnvironment();
  } catch {
    return Object.freeze({
      status: 'unavailable',
      checkedAt,
      checks: Object.freeze([
        { name: 'configuration', status: 'unavailable' as const },
      ]),
    });
  }

  const checks: { name: string; status: 'ready' | 'unavailable' }[] = [
    { name: 'configuration', status: 'ready' },
  ];
  for (const dependency of dependencies(environment)) {
    try {
      await dependency.check();
      checks.push({ name: dependency.name, status: 'ready' });
    } catch {
      checks.push({ name: dependency.name, status: 'unavailable' });
    }
  }
  return Object.freeze({
    status: checks.every((check) => check.status === 'ready')
      ? 'ready'
      : 'unavailable',
    checkedAt,
    checks: Object.freeze(checks.map((check) => Object.freeze(check))),
  });
}
