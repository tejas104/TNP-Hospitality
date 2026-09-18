'use client';

import { AlertTriangle, Download, FileBarChart, Printer } from 'lucide-react';
import { useState } from 'react';
import { fingerprint, type Command } from './adapter';
import { toCsv } from './csv';
import { formatExact } from './dates';
import { activeFilterKeys, filterLabel, matchesFilters } from './logic';
import type { ReportKind, ReportSnapshot } from './model';
import { buildReport, canExportReport, exportFileName, isStale, REPORT_META } from './reports';
import type { SectionProps } from './types';
import { ActionError, PendingLabel, Stamp, StatePanel, Tag, styles, useEventMutation } from './ui';

const KINDS = Object.keys(REPORT_META) as ReportKind[];

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
}

export function ReportsSection(props: SectionProps) {
  const { data, rows, filters, org, contextLabels, can, now } = props;
  const tz = data.event.timezone;
  const [kind, setKind] = useState<ReportKind>('master');
  const [useFilters, setUseFilters] = useState(false);
  const [snapshot, setSnapshot] = useState<ReportSnapshot | null>(null);
  const [exportNote, setExportNote] = useState<string | null>(null);
  const fnName = (id: string) => data.functions.find((f) => f.id === id)?.name ?? id;
  const filterKeys = activeFilterKeys(filters);
  const filterText = useFilters && (filterKeys.length || filters.query) ? [...(filters.query ? [`Search “${filters.query}”`] : []), ...filterKeys.map((k) => filterLabel(k, filters, fnName))].join('; ') : 'All parties in this event';
  const scoped = useFilters ? rows.filter((r) => matchesFilters(r, filters)) : rows;
  const built = buildReport(kind, data, scoped);
  const previous = data.reports.find((r) => r.kind === kind);
  const meta = REPORT_META[kind];
  const scopeSignature = fingerprint({ kind, useFilters, filterText, filters: useFilters ? filters : null, built, org: org.id, customer: contextLabels.customer, event: data.event });

  const action = useEventMutation<ReportSnapshot>(
    () => ({ type: 'generate-report', kind, filters: filterText, columns: built.columns, scopeSignature, scope: { people: built.people, parties: built.parties, records: built.rows.length } }) satisfies Command,
    (snap) => {
      setSnapshot(snap);
      setExportNote(null);
    },
    (snap, replayed) => (replayed ? `Revision ${snap.revision} was already generated.` : `${meta.title} revision ${snap.revision} generated (synthetic preview).`),
  );

  const current = canExportReport(snapshot, scopeSignature, data) ? snapshot : null;
  const header = current
    ? [
        ['Synthetic export preview — not an externally delivered report'],
        ['Report', meta.title],
        ['Organization', org.name],
        ['Customer', contextLabels.customer ?? '—'],
        ['Event', `${data.event.name} (${tz})`],
        ['Scope', current.filters],
        ['Revision', String(current.revision)],
        ['Generated (synthetic adapter time)', formatExact(current.generatedAt, tz)],
        ['People / parties', `${built.people} / ${built.parties}`],
        ['Records', String(built.rows.length)],
      ]
    : [];

  const downloadCsv = () => {
    if (!current) return;
    const blob = new Blob([toCsv([...header, [], built.columns, ...built.rows])], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFileName(kind, data.event.name, current.revision);
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setExportNote(`Saved ${a.download} to this device. Formula-like cells are neutralized. Nothing was sent to anyone.`);
  };

  const printPreview = () => {
    if (!current) return;
    const table = `<table><thead><tr>${built.columns.map((c) => `<th>${escapeHtml(c)}</th>`).join('')}</tr></thead><tbody>${built.rows
      .map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`)
      .join('')}</tbody></table>`;
    const html =
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(meta.title)} r${current.revision}</title><style>body{font:12px system-ui,sans-serif;margin:24px;color:#172321}h1{font-family:Georgia,serif;font-weight:400}dl{display:grid;grid-template-columns:max-content 1fr;gap:2px 12px}dt{color:#56625f}table{border-collapse:collapse;width:100%;margin-top:16px}th,td{border:1px solid #ccc;padding:4px 6px;text-align:left;vertical-align:top}th{background:#efeadc}</style></head><body><p><strong>Browser print / PDF preview. Printing or saving does not deliver this report to anyone.</strong></p><h1>${escapeHtml(meta.title)}</h1><dl>${header
        .slice(1)
        .map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v ?? '')}</dd>`)
        .join('')}</dl>${table}<script>window.addEventListener('load',function(){window.print()})</script></body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    const w = window.open(url, '_blank');
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    setExportNote(w ? 'Opened a browser print / PDF preview in a new tab. Nothing was delivered to anyone.' : 'The print preview tab was blocked by the browser. Allow pop-ups for this site to print.');
  };

  return (
    <div className={styles.stack}>
      <section className={styles.panel} aria-labelledby="report-kind">
        <h2 id="report-kind">
          <FileBarChart size={18} aria-hidden /> Choose a report
        </h2>
        <ul className={styles.reportKinds}>
          {KINDS.map((k) => {
            const last = data.reports.find((r) => r.kind === k);
            return (
              <li key={k}>
                <label className={styles.templateChoice}>
                  <input
                    type="radio"
                    name="report-kind"
                    checked={k === kind}
                    onChange={() => {
                      setKind(k);
                      setExportNote(null);
                    }}
                  />
                  <span className={styles.wrap}>
                    <strong>{REPORT_META[k].title}</strong>
                    <span className={styles.meta}>{REPORT_META[k].description}</span>
                  </span>
                  {last && (isStale(last, data) ? <Tag tone="warn">r{last.revision} outdated</Tag> : <Tag tone="good">r{last.revision} current</Tag>)}
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.panel} aria-labelledby="report-scope">
        <h2 id="report-scope">Scope before generating</h2>
        <label className={styles.checkField}>
          <input type="checkbox" checked={useFilters} onChange={(e) => setUseFilters(e.target.checked)} /> Use the current guest directory filters
        </label>
        <dl className={styles.facts}>
          <div>
            <dt>Organization</dt>
            <dd>{org.name}</dd>
          </div>
          <div>
            <dt>Customer</dt>
            <dd>{contextLabels.customer ?? '—'}</dd>
          </div>
          <div>
            <dt>Event</dt>
            <dd>
              {data.event.name} · {tz}
            </dd>
          </div>
          <div>
            <dt>Filters</dt>
            <dd>{filterText}</dd>
          </div>
          <div>
            <dt>People / parties</dt>
            <dd>
              {built.people} people · {built.parties} parties · {built.rows.length} rows
            </dd>
          </div>
          <div>
            <dt>Sensitive data</dt>
            <dd>{meta.sensitive}</dd>
          </div>
          <div>
            <dt>Columns</dt>
            <dd>{built.columns.join(', ')}</dd>
          </div>
          <div>
            <dt>Revision context</dt>
            <dd>{previous ? `Last revision ${previous.revision}, ${formatExact(previous.generatedAt, tz)}${isStale(previous, data) ? ' — outdated by later changes' : ''}` : 'No earlier revision'}</dd>
          </div>
        </dl>
        {previous && isStale(previous, data) && (
          <p className={styles.notice}>
            <AlertTriangle size={15} aria-hidden /> Guest or logistics records changed after revision {previous.revision}. Generate a new revision before sharing.
          </p>
        )}
        <ActionError status={action.status} onRetry={action.retry} />
        {can('generate-report') ? (
          <button type="button" className={styles.btnPrimary} disabled={action.status.phase === 'pending'} onClick={action.start}>
            <PendingLabel pending={action.status.phase === 'pending'} idle={`Generate ${meta.title} preview`} busy="Generating…" />
          </button>
        ) : (
          <p className={styles.meta}>Your role cannot generate reports.</p>
        )}
      </section>

      {current ? (
        <section className={`${styles.panel} ${styles.reveal}`} aria-labelledby="report-out">
          <h2 id="report-out">
            {meta.title} · revision {current.revision}
          </h2>
          <p className={styles.previewTag}>Synthetic export preview</p>
          <dl className={styles.facts}>
            {header.slice(1).map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          {isStale(current, data) && (
            <p className={styles.notice}>
              <AlertTriangle size={15} aria-hidden /> Records changed after this revision was generated. It is outdated.
            </p>
          )}
          <div className={styles.inlineActions}>
            <button type="button" className={styles.btnSecondary} onClick={downloadCsv}>
              <Download size={15} aria-hidden /> Download CSV
            </button>
            <button type="button" className={styles.btnSecondary} onClick={printPreview}>
              <Printer size={15} aria-hidden /> Print / PDF preview
            </button>
          </div>
          {exportNote && <output className={styles.receipt}>{exportNote}</output>}
          <section className={styles.tableWrap} aria-label={`${meta.title} preview rows`} data-lenis-prevent>
            <table className={styles.table}>
              <caption className={styles.srOnly}>
                {meta.title}, first {Math.min(built.rows.length, 50)} of {built.rows.length} rows
              </caption>
              <thead>
                <tr>
                  {built.columns.map((c) => (
                    <th key={c} scope="col">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {built.rows.slice(0, 50).map((r, i) => (
                  <tr key={i}>
                    {r.map((c, j) => (
                      <td key={j} className={styles.wrap}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          {built.rows.length > 50 && <p className={styles.meta}>Showing 50 of {built.rows.length} rows; the CSV contains all rows.</p>}
        </section>
      ) : (
        <StatePanel title={snapshot ? 'Generate a new revision' : 'No preview yet'} headingLevel={3}>
          <p>{snapshot ? 'The report scope or records changed. The previous preview and export are disabled; generate a revision for this exact scope. ' : ''}Generate a revision to preview rows and export a CSV. Generated times come from the synthetic adapter and are not audit evidence.</p>
        </StatePanel>
      )}

      <section className={styles.panel} aria-labelledby="report-history">
        <h2 id="report-history">Revision history</h2>
        {data.reports.length === 0 ? (
          <p>No revisions yet.</p>
        ) : (
          <ul className={styles.plainList}>
            {data.reports.map((r) => (
              <li key={r.id} className={styles.transferRow}>
                <span className={styles.wrap}>
                  {REPORT_META[r.kind].title} · r{r.revision} · {r.partyCount} parties, {r.peopleCount} people · {r.filters}
                </span>
                <Stamp iso={r.generatedAt} timeZone={tz} now={now} />
                {isStale(r, data) ? <Tag tone="warn">Outdated</Tag> : <Tag tone="good">Current</Tag>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
