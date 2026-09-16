import type { ReactNode } from 'react';

export function Metric({
  icon,
  label,
  value,
}: {
  icon?: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <span className="metric">
      {icon}
      <strong>{value}</strong>
      {label}
    </span>
  );
}
