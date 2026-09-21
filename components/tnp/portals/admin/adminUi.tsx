import type { HTMLAttributes, ReactNode } from 'react';
import styles from './AdminConsole.module.css';

export const REPORT_NOTE =
  'TNP Hospitality - synthetic demo report. Sample data only; not financial, attendance or payroll evidence.';

/** Glass card surface shared by every admin section. */
export function Card({
  children,
  className = '',
  ...rest
}: { children: ReactNode; className?: string } & HTMLAttributes<HTMLElement>) {
  return (
    <section className={`${styles.glass} ${className}`} {...rest}>
      {children}
    </section>
  );
}
