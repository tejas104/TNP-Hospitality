'use client';

import { Download, FileSpreadsheet, RefreshCw, Upload } from 'lucide-react';
import { useContext, useId, useMemo, useRef, useState } from 'react';
import { newRequestId, type AdapterError, type ImportRowOutcome } from './adapter';
import { IMPORT_FIELDS, previewImport, SAMPLE_TEMPLATE, type ColumnMapping, type ImportField, type PreviewRow, type RowStatus } from './importer';
import type { SectionProps } from './types';
import { EventActionCtx, getAdapter, PendingLabel, StatePanel, Tag, styles, useFeedback } from './ui';

const MAX_BYTES = 1_000_000;

const STATUS_COPY: Record<RowStatus, { label: string; tone: 'good' | 'bad' | 'warn' | 'muted' | 'info' }> = {
  ready: { label: 'Ready', tone: 'good' },
  invalid: { label: 'Invalid', tone: 'bad' },
  duplicate: { label: 'Duplicate in file', tone: 'bad' },
  existing: { label: 'Already imported — skip', tone: 'muted' },
  review: { label: 'Needs review', tone: 'warn' },
};

const RESULT_COPY: Record<ImportRowOutcome['result'], { label: string; tone: 'good' | 'bad' | 'warn' | 'muted' | 'info' }> = {
  accepted: { label: 'Accepted', tone: 'good' },
  rejected: { label: 'Rejected', tone: 'bad' },
  skipped: { label: 'Skipped', tone: 'muted' },
  unresolved: { label: 'Unresolved', tone: 'warn' },
  failed: { label: 'Failed — retryable', tone: 'bad' },
};

function samples(fnNames: string[], existing: { ref: string; name: string; member: string; phone: string } | null) {
  const all = 'all';
  const valid = [
    'guest_ref,party_name,member_name,age_band,phone,email,functions,allowed_accompanying,priority,language',
    `DEMO-201,"Rao, Karthik & family",Karthik Rao,adult,+91 55509 20101,karthik.demo@example.test,${all},2,vip,Tamil`,
    `DEMO-201,"Rao, Karthik & family",Lakshmi Rao,adult,+91 55509 20101,,${all},2,vip,Tamil`,
    `DEMO-201,"Rao, Karthik & family",Anu Rao,child,+91 55509 20101,,${fnNames[fnNames.length - 1]},2,vip,Tamil`,
    `DEMO-202,Ferreira household,Élodie Ferreira,adult,+91 55509 20202,elodie.demo@example.test,${fnNames.slice(0, 2).join(';')},0,standard,English`,
    `DEMO-203,Singh household,ਹਰਪ੍ਰੀਤ ਸਿੰਘ,adult,+91 55509 20303,,${all},0,standard,Punjabi`,
  ];
  const problems = [
    'guest_ref,party_name,member_name,age_band,phone,email,functions,allowed_accompanying,priority,language',
    `DEMO-301,Mistry household,Parth Mistry,adult,+91 55509 30101,parth.demo@example.test,${all},1,standard,Gujarati`,
    `DEMO-301,Mistry household,Parth Mistry,adult,+91 55509 30101,,${all},1,standard,Gujarati`,
    `DEMO-302,Nanda household,,adult,+91 55509 30202,not-an-email,Garden party,1,urgent,English`,
    '',
    `DEMO-303,"Bose, ""Tuku"" family",Tuku Bose,teen,12,,${all},x,standard,Bengali`,
    `DEMO-304,Kurian household,Anna Kurian,adult,+91 55509 30404,,${all},0,standard,Malayalam`,
    `DEMO-305,Shah household,Rhea Shah,adult,+91 55509 30505,,${all},0,standard,English`,
    ...(existing ? [`${existing.ref},${existing.name},${existing.member},adult,${existing.phone},,${all},,,`, `,Another household,${existing.member},adult,${existing.phone},,${all},,,`] : []),
  ];
  return { valid: valid.join('\r\n'), problems: problems.join('\n') };
}

type Step = 'choose' | 'map' | 'preview' | 'confirm' | 'results';

export function ImportSection({ data, can, org, refresh }: SectionProps) {
  const ctx = useContext(EventActionCtx);
  const announce = useFeedback();
  const [step, setStep] = useState<Step>('choose');
  const [source, setSource] = useState<{ name: string; text: string } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [statusFilter, setStatusFilter] = useState<RowStatus | 'all'>('all');
  const [batchId, setBatchId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [pending, setPending] = useState(false);
  const [applyError, setApplyError] = useState<AdapterError | null>(null);
  const [outcomes, setOutcomes] = useState<ImportRowOutcome[] | null>(null);
  const [frozen, setFrozen] = useState<PreviewRow[] | null>(null);
  const pendingRef = useRef(false);
  const fileId = useId();

  const preview = useMemo(
    () => (source ? previewImport(source.text, mapping, { functions: data.functions, parties: data.parties, members: data.members }) : null),
    [source, mapping, data],
  );
  const existing = data.parties[0] ? { ref: data.parties[0].ref, name: data.parties[0].displayName, member: data.members.find((m) => m.partyId === data.parties[0].id)?.name ?? '', phone: data.parties[0].phone } : null;
  const demo = samples(data.functions.map((f) => f.name), existing);

  if (!can('create-party')) {
    return (
      <StatePanel tone="locked" title="Import is not available for your role">
        <p>Coordinators and customer owners can import guest lists.</p>
      </StatePanel>
    );
  }

  const load = (name: string, text: string) => {
    setSource({ name, text });
    setMapping(null);
    setOutcomes(null);
    setBatchId(null);
    setConfirmed(false);
    setApplyError(null);
    setStep('map');
  };

  const onFile = async (file: File | undefined) => {
    setFileError(null);
    if (!file) return;
    if (!/\.csv$/i.test(file.name)) return setFileError(`"${file.name}" is not a .csv file. Save the sheet as CSV (UTF-8) and try again. Excel and PDF files are not read.`);
    if (file.size > MAX_BYTES) return setFileError(`"${file.name}" is ${(file.size / 1_000_000).toFixed(1)} MB. The limit is 1 MB (about 5,000 rows).`);
    try {
      load(file.name, await file.text());
    } catch {
      setFileError('The file could not be read. Check that it is plain CSV text.');
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([SAMPLE_TEMPLATE], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rsvp-guest-import-template.csv';
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const apply = async (mode: 'first' | 'retry') => {
    if (!frozen || !ctx || !batchId || pendingRef.current) return;
    pendingRef.current = true;
    setPending(true);
    setApplyError(null);
    // Retry sends only rows that are eligible (failed), from the confirmed snapshot, under the same batch identity.
    const rows: PreviewRow[] = mode === 'retry' && outcomes ? frozen.filter((r) => outcomes.find((o) => o.key === r.key)?.result === 'failed') : frozen;
    const result = await getAdapter().applyImport(ctx.personaId, ctx.eventId, batchId, rows);
    pendingRef.current = false;
    setPending(false);
    if (!result.ok) {
      setApplyError(result.error);
      return;
    }
    const merged = mode === 'retry' && outcomes ? outcomes.map((o) => result.value.find((n) => n.key === o.key) ?? o) : result.value;
    setOutcomes(merged);
    setStep('results');
    const counts = countResults(merged);
    announce(counts.failed || counts.rejected || counts.unresolved ? 'warning' : 'success', `Import ${counts.failed ? 'partially completed' : 'finished'}: ${counts.accepted} accepted, ${counts.rejected} rejected, ${counts.skipped} skipped, ${counts.unresolved} unresolved, ${counts.failed} failed.`);
    refresh();
  };

  const steps: Array<[Step, string]> = [
    ['choose', 'Choose file'],
    ['map', 'Map columns'],
    ['preview', 'Preview & validate'],
    ['confirm', 'Confirm destination'],
    ['results', 'Results'],
  ];
  const stepIndex = steps.findIndex(([s]) => s === step);

  return (
    <div className={styles.stack}>
      <ol className={styles.stepper} aria-label="Import steps">
        {steps.map(([s, label], i) => (
          <li key={s} aria-current={s === step ? 'step' : undefined} className={i < stepIndex ? styles.stepDone : ''}>
            <span>{i + 1}</span> {label}
          </li>
        ))}
      </ol>

      {step === 'choose' && (
        <section className={styles.panel} aria-labelledby="import-choose">
          <h2 id="import-choose">Choose a guest list</h2>
          <p>
            CSV (comma-separated, UTF-8) only, up to 1 MB. One row per person; rows sharing a reference form one household. Guests are never matched on name alone, and shared phone numbers never merge households.
          </p>
          <div className={styles.inlineActions}>
            <button type="button" className={styles.btnSecondary} onClick={downloadTemplate}>
              <Download size={15} aria-hidden /> Download sample template (.csv)
            </button>
          </div>
          <details className={styles.details}>
            <summary>Template columns</summary>
            <ul className={styles.plainList}>
              {IMPORT_FIELDS.map((f) => (
                <li key={f.key}>
                  <code>{f.key}</code> — {f.label}
                  {f.required ? ' (required)' : ''}. {f.hint}
                </li>
              ))}
            </ul>
          </details>
          <div className={styles.dropzone}>
            <Upload size={20} aria-hidden />
            <label htmlFor={fileId}>Choose a CSV file</label>
            <input id={fileId} type="file" accept=".csv,text/csv" onChange={(e) => void onFile(e.target.files?.[0])} aria-describedby={`${fileId}-help`} />
            <p id={`${fileId}-help`} className={styles.meta}>
              Nothing leaves this browser tab. Do not use real guest data in this preview.
            </p>
          </div>
          {fileError && (
            <p className={styles.fieldError} role="alert">
              {fileError}
            </p>
          )}
          <p className={styles.meta}>Or load a synthetic example:</p>
          <div className={styles.inlineActions}>
            <button type="button" className={styles.btnGhost} onClick={() => load('synthetic-valid.csv', demo.valid)}>
              <FileSpreadsheet size={15} aria-hidden /> Valid sample
            </button>
            <button type="button" className={styles.btnGhost} onClick={() => load('synthetic-with-problems.csv', demo.problems)}>
              <FileSpreadsheet size={15} aria-hidden /> Sample with errors and duplicates
            </button>
          </div>
        </section>
      )}

      {step === 'map' && preview && (
        <section className={styles.panel} aria-labelledby="import-map">
          <h2 id="import-map">Map columns from {source?.name}</h2>
          <p className={styles.meta}>
            {preview.headers.length} columns, {preview.rows.length} data rows (blank rows skipped). Columns were matched automatically; adjust if needed.
          </p>
          {preview.fileErrors.length > 0 && (
            <ul className={styles.errorSummary} role="alert">
              {preview.fileErrors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}
          <div className={styles.mapGrid}>
            {IMPORT_FIELDS.map((f) => (
              <label key={f.key} className={styles.field}>
                <span>
                  {f.label}
                  {f.required ? ' *' : ''}
                </span>
                <select
                  value={preview.mapping[f.key] ?? ''}
                  onChange={(e) => {
                    const next: ColumnMapping = { ...preview.mapping };
                    if (e.target.value === '') delete next[f.key as ImportField];
                    else next[f.key as ImportField] = Number(e.target.value);
                    setMapping(next);
                  }}
                >
                  <option value="">Not in file</option>
                  {preview.headers.map((h, i) => (
                    <option key={`${h}-${i}`} value={i}>
                      {h || `(column ${i + 1})`}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div className={styles.formActions}>
            <button type="button" className={styles.btnPrimary} disabled={IMPORT_FIELDS.some((f) => f.required && preview.mapping[f.key] === undefined)} onClick={() => setStep('preview')}>
              Validate rows
            </button>
            <button type="button" className={styles.btnSecondary} onClick={() => setStep('choose')}>
              Choose another file
            </button>
          </div>
        </section>
      )}

      {step === 'preview' && preview && (
        <section className={styles.panel} aria-labelledby="import-preview">
          <h2 id="import-preview">Preview and validation</h2>
          <ul className={styles.countRow}>
            {(Object.keys(STATUS_COPY) as RowStatus[]).map((s) => (
              <li key={s}>
                <button type="button" className={styles.countBtn} aria-pressed={statusFilter === s} onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}>
                  <strong>{preview.counts[s]}</strong> {STATUS_COPY[s].label}
                </button>
              </li>
            ))}
          </ul>
          <output className={styles.meta}>
            {preview.counts.ready} rows ready across {preview.plannedParties} new parties. Showing {statusFilter === 'all' ? 'all rows' : STATUS_COPY[statusFilter].label.toLowerCase()}.
          </output>
          <PreviewTable rows={preview.rows.filter((r) => statusFilter === 'all' || r.status === statusFilter)} />
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.btnPrimary}
              disabled={preview.counts.ready === 0}
              onClick={() => {
                setBatchId(newRequestId('import'));
                setFrozen(preview.rows);
                setConfirmed(false);
                setStep('confirm');
              }}
            >
              Continue with {preview.counts.ready} ready rows
            </button>
            <button type="button" className={styles.btnSecondary} onClick={() => setStep('map')}>
              Back to mapping
            </button>
          </div>
        </section>
      )}

      {step === 'confirm' && preview && (
        <section className={styles.panel} aria-labelledby="import-confirm">
          <h2 id="import-confirm">Confirm destination</h2>
          <dl className={styles.facts}>
            <div>
              <dt>Organization</dt>
              <dd>{org.name}</dd>
            </div>
            <div>
              <dt>Event</dt>
              <dd>
                {data.event.name} ({data.event.timezone})
              </dd>
            </div>
            <div>
              <dt>Will import</dt>
              <dd>
                {preview.counts.ready} people into {preview.plannedParties} parties
              </dd>
            </div>
            <div>
              <dt>Will not import</dt>
              <dd>
                {preview.counts.invalid + preview.counts.duplicate} rejected, {preview.counts.existing} skipped, {preview.counts.review} left for review
              </dd>
            </div>
            <div>
              <dt>Batch identity</dt>
              <dd>
                <code>{batchId?.slice(0, 24)}…</code> — reused for any retry
              </dd>
            </div>
          </dl>
          <label className={styles.checkField}>
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} /> I confirm these guests belong to {org.name} › {data.event.name}.
          </label>
          {applyError && (
            <div className={styles.actionError} role="alert">
              <p>{applyError.message}</p>
              {applyError.retryable && (
                <button type="button" className={styles.btnSecondary} onClick={() => void apply('first')}>
                  <RefreshCw size={14} aria-hidden /> Retry the same batch
                </button>
              )}
            </div>
          )}
          <div className={styles.formActions}>
            <button type="button" className={styles.btnPrimary} disabled={!confirmed || pending} onClick={() => void apply('first')}>
              <PendingLabel pending={pending} idle="Import guests" busy="Importing…" />
            </button>
            <button type="button" className={styles.btnSecondary} disabled={pending} onClick={() => setStep('preview')}>
              Back
            </button>
          </div>
        </section>
      )}

      {step === 'results' && outcomes && (
        <ImportResults
          outcomes={outcomes}
          pending={pending}
          error={applyError}
          batchId={batchId}
          onRetry={() => void apply('retry')}
          onNew={() => {
            setSource(null);
            setOutcomes(null);
            setBatchId(null);
            setStep('choose');
          }}
        />
      )}
    </div>
  );
}

function countResults(outcomes: ImportRowOutcome[]) {
  const c = { accepted: 0, rejected: 0, skipped: 0, unresolved: 0, failed: 0 };
  for (const o of outcomes) c[o.result] += 1;
  return c;
}

function PreviewTable({ rows }: { rows: PreviewRow[] }) {
  if (!rows.length) return <p>No rows in this view.</p>;
  return (
    <section className={styles.tableWrap} aria-label="Import preview rows" data-lenis-prevent>
      <table className={`${styles.table} ${styles.responsiveTable}`}>
        <caption className={styles.srOnly}>Each file row with its status, problems and correction guidance.</caption>
        <thead>
          <tr>
            <th scope="col">Row</th>
            <th scope="col">Party</th>
            <th scope="col">Guest</th>
            <th scope="col">Status</th>
            <th scope="col">Problems and guidance</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <th scope="row" data-label="Row">
                {r.rowNumber}
              </th>
              <td data-label="Party" className={styles.wrap}>
                {r.values.party_name || '—'} <span className={styles.meta}>{r.values.guest_ref}</span>
              </td>
              <td data-label="Guest" className={styles.wrap}>
                {r.values.member_name || <em>missing</em>}
              </td>
              <td data-label="Status">
                <Tag tone={STATUS_COPY[r.status].tone}>{STATUS_COPY[r.status].label}</Tag>
              </td>
              <td data-label="Problems">
                {r.issues.length === 0 && r.warnings.length === 0 && <span className={styles.meta}>None</span>}
                <ul className={styles.issueList}>
                  {r.issues.map((i, k) => (
                    <li key={k}>
                      <strong>{i.field.replace('_', ' ')}:</strong> {i.reason}. <span className={styles.meta}>{i.guidance}</span>
                    </li>
                  ))}
                  {r.warnings.map((w, k) => (
                    <li key={`w${k}`} className={styles.meta}>
                      {w}
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function ImportResults({
  outcomes,
  pending,
  error,
  batchId,
  onRetry,
  onNew,
}: {
  outcomes: ImportRowOutcome[];
  pending: boolean;
  error: AdapterError | null;
  batchId: string | null;
  onRetry: () => void;
  onNew: () => void;
}) {
  const c = countResults(outcomes);
  const headline = c.failed ? 'Partially imported' : c.accepted === 0 ? 'Nothing new was imported' : c.rejected || c.unresolved || c.skipped ? 'Imported with exceptions' : 'All ready rows imported';
  return (
    <section className={styles.panel} aria-labelledby="import-results">
      <h2 id="import-results">{headline}</h2>
      <ul className={styles.countRow}>
        {(Object.keys(RESULT_COPY) as Array<ImportRowOutcome['result']>).map((k) => (
          <li key={k}>
            <Tag tone={RESULT_COPY[k].tone}>
              {c[k]} {RESULT_COPY[k].label}
            </Tag>
          </li>
        ))}
      </ul>
      {c.failed > 0 && (
        <div className={styles.notice} role="alert">
          <p>
            {c.failed} rows failed temporarily and were not imported. Retrying sends only those rows with the same batch identity (<code>{batchId?.slice(0, 20)}…</code>), so rows already accepted are
            confirmed, not duplicated.
          </p>
          {error && <p>{error.message}</p>}
          <button type="button" className={styles.btnPrimary} onClick={onRetry} disabled={pending}>
            <PendingLabel pending={pending} idle={`Retry ${c.failed} eligible rows`} busy="Retrying…" />
          </button>
        </div>
      )}
      <section className={styles.tableWrap} aria-label="Import outcomes" data-lenis-prevent>
        <table className={`${styles.table} ${styles.responsiveTable}`}>
          <caption className={styles.srOnly}>Outcome for every file row</caption>
          <thead>
            <tr>
              <th scope="col">Row</th>
              <th scope="col">Outcome</th>
              <th scope="col">Reason</th>
              <th scope="col">Party reference</th>
            </tr>
          </thead>
          <tbody>
            {outcomes.map((o) => (
              <tr key={o.key}>
                <th scope="row" data-label="Row">
                  {o.rowNumber}
                </th>
                <td data-label="Outcome">
                  <Tag tone={RESULT_COPY[o.result].tone}>{RESULT_COPY[o.result].label}</Tag> {o.replayed && <span className={styles.meta}>confirmed from earlier attempt</span>}
                </td>
                <td data-label="Reason">{o.reason}</td>
                <td data-label="Party">{o.partyRef ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <button type="button" className={styles.btnSecondary} onClick={onNew}>
        Start a new import
      </button>
    </section>
  );
}
