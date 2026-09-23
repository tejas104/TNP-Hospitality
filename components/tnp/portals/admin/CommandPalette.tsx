'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CornerDownLeft, Search } from 'lucide-react';
import type { AdminState } from './adminData';
import type { Go, Section } from './AdminConsole';
import { filterItems, paletteItems, type Item } from './palette';
import styles from './AdminConsole.module.css';

export default function CommandPalette({
  state,
  go,
  labels,
  close,
}: {
  state: AdminState;
  go: Go;
  labels: Record<Section, string>;
  close: () => void;
}) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const all = useMemo(() => paletteItems(state, go, labels), [state, go, labels]);
  const results = filterItems(all, query).slice(0, 30);
  useEffect(() => {
    // The window focuses its close button first; the search box should win.
    const t = window.setTimeout(() => input.current?.focus(), 0);
    return () => clearTimeout(t);
  }, []);
  const pick = (item: Item | undefined) => {
    if (!item) return;
    close();
    item.run();
  };
  return (
    <div className={styles.palette}>
      <label className={styles.paletteSearch}>
        <Search size={18} aria-hidden="true" />
        <span className={styles.srOnly}>Search the admin console</span>
        <input
          ref={input}
          value={query}
          aria-describedby="palette-count"
          placeholder="Search events, freelancers, requests, quotes…"
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActive((i) => Math.min(results.length - 1, i + 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((i) => Math.max(0, i - 1));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              pick(results[active]);
            }
          }}
        />
      </label>
      <p id="palette-count" className={styles.srOnly} aria-live="polite">
        {results.length} results
      </p>
      <ul aria-label="Results" className={styles.paletteList}>
        {results.length === 0 && <li className={styles.empty}>Nothing matches “{query}”.</li>}
        {results.map((item, index) => {
          const heading = item.group !== results[index - 1]?.group ? item.group : '';
          return (
            <li key={item.id}>
              {heading && <span className={styles.paletteGroup}>{heading}</span>}
              <button
                type="button"
                data-active={index === active}
                className={styles.paletteItem}
                onMouseMove={() => setActive(index)}
                onFocus={() => setActive(index)}
                onClick={() => pick(item)}
              >
                <strong>{item.label}</strong>
                <small>{item.hint}</small>
                {index === active && <CornerDownLeft size={15} aria-hidden="true" />}
              </button>
            </li>
          );
        })}
      </ul>
      <p className={styles.paletteHint}>
        <kbd>↑</kbd> <kbd>↓</kbd> to move · <kbd>Enter</kbd> to open · <kbd>Esc</kbd> to close
      </p>
    </div>
  );
}
