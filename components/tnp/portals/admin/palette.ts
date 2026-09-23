// Search logic for the admin command palette (kept JSX-free so it is testable).
import { quoteTotals, rupees, type AdminState } from './adminData.ts';
import type { Go, Section } from './AdminConsole';

export type Item = { id: string; group: string; label: string; hint: string; run: () => void };

/** Everything an admin might look for, searchable from one box. */
export function paletteItems(state: AdminState, go: Go, labels: Record<Section, string>): Item[] {
  const items: Item[] = [
    ...(Object.entries(labels) as [Section, string][]).map(([id, label]) => ({
      id: `s-${id}`,
      group: 'Go to',
      label,
      hint: 'Section',
      run: () => go(id),
    })),
    ...state.events.map((e) => ({
      id: `e-${e.id}`,
      group: 'Events',
      label: e.name,
      hint: `${e.status} · ${e.city} · ${e.start}`,
      run: () => go('events', e.id),
    })),
    ...state.freelancers.map((f) => ({
      id: `f-${f.id}`,
      group: 'Freelancers',
      label: f.name,
      hint: `${f.role} · ${f.city}${f.rating ? ` · ${f.rating.toFixed(1)}★` : ''}`,
      run: () => go('people', f.id),
    })),
    ...state.requests.map((r) => ({
      id: `r-${r.id}`,
      group: 'Client requests',
      label: r.client,
      hint: `${r.occasion} · ${r.city} · make or open quote`,
      run: () => go('quotations', r.id),
    })),
    ...state.quotations.map((q) => ({
      id: `q-${q.id}`,
      group: 'Quotations',
      label: `${q.id} · ${q.client}`,
      hint: `${rupees(quoteTotals(q).total)} · ${q.status}`,
      run: () => go('quotations', q.requestId),
    })),
    ...state.applications
      .filter((a) => a.status === 'pending')
      .map((a) => ({
        id: `a-${a.id}`,
        group: 'Pending applications',
        label: a.name,
        hint: `${a.role} · ${a.city} · assessment ${a.assessment}`,
        run: () => go('applications'),
      })),
  ];
  return items;
}

export function filterItems(items: Item[], query: string) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return items.filter((i) => i.group === 'Go to' || i.group === 'Pending applications');
  return items.filter((i) => words.every((w) => `${i.label} ${i.hint} ${i.group}`.toLowerCase().includes(w)));
}
