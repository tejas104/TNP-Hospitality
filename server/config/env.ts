export const REQUIRED_ENVIRONMENT_NAMES = [
  'MONGODB_URI',
  'MONGODB_DB_NAME',
  'SESSION_SECRET',
  'SESSION_COOKIE_NAME',
  'APP_BASE_URL',
  'TNP_ENVIRONMENT',
] as const;

export type RequiredEnvironmentName =
  (typeof REQUIRED_ENVIRONMENT_NAMES)[number];
export type TnpEnvironment = 'development' | 'staging' | 'production' | 'test';

export interface PlatformEnvironment {
  readonly mongodbUri: string;
  readonly mongodbDatabaseName: string;
  readonly sessionSecret: string;
  readonly sessionCookieName: string;
  readonly appBaseUrl: URL;
  readonly environment: TnpEnvironment;
}

export interface ConfigurationIssue {
  readonly name: RequiredEnvironmentName;
  readonly reason: 'missing' | 'invalid';
}

export class ConfigurationError extends Error {
  readonly code = 'CONFIGURATION_UNAVAILABLE';
  readonly issues: readonly ConfigurationIssue[];

  constructor(issues: readonly ConfigurationIssue[]) {
    super(
      `Required platform configuration is unavailable: ${issues.map((issue) => issue.name).join(', ')}`,
    );
    this.name = 'ConfigurationError';
    this.issues = issues;
  }
}

function isTnpEnvironment(value: string): value is TnpEnvironment {
  return ['development', 'staging', 'production', 'test'].includes(value);
}

export function loadPlatformEnvironment(
  source: Readonly<Record<string, string | undefined>> = process.env,
): PlatformEnvironment {
  const issues: ConfigurationIssue[] = [];
  const values = new Map<RequiredEnvironmentName, string>();

  for (const name of REQUIRED_ENVIRONMENT_NAMES) {
    const value = source[name]?.trim();
    if (!value) issues.push({ name, reason: 'missing' });
    else values.set(name, value);
  }
  if (issues.length > 0) throw new ConfigurationError(issues);

  const mongodbUri = values.get('MONGODB_URI')!;
  if (!/^mongodb(?:\+srv)?:\/\//.test(mongodbUri)) {
    issues.push({ name: 'MONGODB_URI', reason: 'invalid' });
  }

  const mongodbDatabaseName = values.get('MONGODB_DB_NAME')!;
  if (!/^[a-zA-Z0-9_-]{1,63}$/.test(mongodbDatabaseName)) {
    issues.push({ name: 'MONGODB_DB_NAME', reason: 'invalid' });
  }

  const sessionSecret = values.get('SESSION_SECRET')!;
  if (sessionSecret.length < 32)
    issues.push({ name: 'SESSION_SECRET', reason: 'invalid' });

  const sessionCookieName = values.get('SESSION_COOKIE_NAME')!;
  if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]{1,64}$/.test(sessionCookieName)) {
    issues.push({ name: 'SESSION_COOKIE_NAME', reason: 'invalid' });
  }

  let appBaseUrl: URL | undefined;
  try {
    appBaseUrl = new URL(values.get('APP_BASE_URL')!);
    if (
      !['http:', 'https:'].includes(appBaseUrl.protocol) ||
      appBaseUrl.username ||
      appBaseUrl.password
    ) {
      issues.push({ name: 'APP_BASE_URL', reason: 'invalid' });
    }
  } catch {
    issues.push({ name: 'APP_BASE_URL', reason: 'invalid' });
  }

  const environment = values.get('TNP_ENVIRONMENT')!;
  if (!isTnpEnvironment(environment)) {
    issues.push({ name: 'TNP_ENVIRONMENT', reason: 'invalid' });
  }
  if (
    environment === 'production' &&
    appBaseUrl &&
    appBaseUrl.protocol !== 'https:'
  ) {
    issues.push({ name: 'APP_BASE_URL', reason: 'invalid' });
  }

  if (issues.length > 0) throw new ConfigurationError(issues);
  return Object.freeze({
    mongodbUri,
    mongodbDatabaseName,
    sessionSecret,
    sessionCookieName,
    appBaseUrl: appBaseUrl!,
    environment: environment as TnpEnvironment,
  });
}
