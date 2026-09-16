import { BadgeCheck } from 'lucide-react';

export function StatusPill({ tone, label }: { tone: 'green' | 'amber'; label: string }) {
  return (
    <span className={`status-pill ${tone}`}>
      <BadgeCheck size={15} />
      {label}
    </span>
  );
}
