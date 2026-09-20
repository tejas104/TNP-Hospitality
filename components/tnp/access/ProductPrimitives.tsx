import Link from 'next/link';
import type { ReactNode } from 'react';

export type ActionTone = 'primary' | 'secondary' | 'tertiary' | 'danger';
export type SurfaceLevel = 'panel' | 'raised' | 'selected' | 'critical';

// Adopted by role cards, the workspace next action and access attention links.
// Feature owners can consume these without inheriting a layout or data model.
export function ActionLink({
  href,
  children,
  tone = 'primary',
}: {
  href: string;
  children: ReactNode;
  tone?: ActionTone;
}) {
  return (
    <Link href={href} className={`ux-action ux-action-${tone}`}>
      {children}
      <span aria-hidden="true">↗</span>
    </Link>
  );
}
export function Surface({
  children,
  level = 'panel',
  className = '',
}: {
  children: ReactNode;
  level?: SurfaceLevel;
  className?: string;
}) {
  return (
    <article className={`ux-surface ux-surface-${level} ${className}`}>
      {children}
    </article>
  );
}
export function Orientation({
  title,
  identity,
  state,
  children,
}: {
  title: string;
  identity: string;
  state: string;
  children?: ReactNode;
}) {
  return (
    <section
      className="ux-orientation ux-product"
      aria-label={`${title} orientation`}
    >
      <div>
        <p className="ux-caption">Synthetic workspace · {identity}</p>
        <h2>{title}</h2>
        <p>{state}</p>
      </div>
      {children}
    </section>
  );
}
export function NextAction({
  title,
  reason,
  href,
  action,
}: {
  title: string;
  reason: string;
  href: string;
  action: string;
}) {
  return (
    <Surface level="raised" className="ux-next-action">
      <div>
        <p className="ux-caption">Next action</p>
        <h3>{title}</h3>
        <p>{reason}</p>
      </div>
      <ActionLink href={href}>{action}</ActionLink>
    </Surface>
  );
}
export function AttentionQueue({
  title,
  items,
}: {
  title: string;
  items: readonly {
    id: string;
    title: string;
    detail: string;
    href: string;
    action: string;
  }[];
}) {
  return (
    <section className="ux-attention ux-product" aria-label={title}>
      <h3>{title}</h3>
      {items.length ? (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <Surface level="raised">
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
                <ActionLink href={item.href} tone="tertiary">
                  {item.action}
                </ActionLink>
              </Surface>
            </li>
          ))}
        </ul>
      ) : (
        <p>No items need attention.</p>
      )}
    </section>
  );
}
export function Feedback({
  state,
  title,
  children,
  onRetry,
}: {
  state: 'loading' | 'empty' | 'error' | 'disabled';
  title: string;
  children: ReactNode;
  onRetry?: () => void;
}) {
  return (
    <div
      className={`ux-feedback ux-feedback-${state}`}
      aria-busy={state === 'loading'}
    >
      <strong>{title}</strong>
      <p>{children}</p>
      {state === 'error' && onRetry && (
        <button
          className="ux-action ux-action-secondary"
          type="button"
          onClick={onRetry}
        >
          Try again
        </button>
      )}
    </div>
  );
}
