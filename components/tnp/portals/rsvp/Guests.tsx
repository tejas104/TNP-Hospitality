'use client';

import { ArrowLeft, ArrowRight, ChevronDown, ChevronRight, Filter, Search, UserRoundCog, X } from 'lucide-react';
import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import type { Command } from './adapter';
import { formatExact } from './dates';
import {
  activeFilterKeys,
  ATTENTION_LABEL,
  EMPTY_FILTERS,
  filterLabel,
  matchesFilters,
  matchingPeople,
  personStatus,
  reconcileBulk,
  selectionStatus,
  sortRows,
  type GuestFilters,
  type PartyRow,
  type SortKey,
} from './logic';
import {
  CALL_OUTCOME_LABEL,
  CONTACT_LABEL,
  DELIVERY_LABEL,
  DOC_LABEL,
  FUNCTION_RSVP_LABEL,
  INVITATION_LABEL,
  PRIORITY_LABEL,
  STAY_LABEL,
  TRANSFER_LABEL,
  TRAVEL_MODE_LABEL,
  type EventData,
  type FunctionRsvp,
} from './model';
import { displayValue } from './Overview';
import type { SectionProps } from './types';
import { ActionError, CopyRef, Modal, PendingLabel, Stamp, StatePanel, Tag, WhyUnavailable, styles, useEventMutation } from './ui';

const DENSITY_KEY = 'tnp-rsvp-density';

function readDensity(): 'comfortable' | 'compact' {
  try {
    return window.localStorage.getItem(DENSITY_KEY) === 'compact' ? 'compact' : 'comfortable';
  } catch {
    return 'comfortable';
  }
}

export function GuestsSection(props: SectionProps) {
  const { data, rows, filters, selectedParty, selectParty, changedIds, can, go, now } = props;
  const [sort, setSort] = useState<SortKey>('attention');
  const [showFilters, setShowFilters] = useState(false);
  // This section renders only after client-side data loads, so reading the preference lazily is hydration-safe.
  const [density, setDensity] = useState<'comfortable' | 'compact'>(readDensity);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [rawBulk, setBulk] = useState<string[]>([]);
  const [bulkScope, setBulkScope] = useState<PartyRow[] | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pendingOpen, setPendingOpen] = useState<string | null | undefined>(undefined);
  const [lastRowId, setLastRowId] = useState<string | null>(null);
  const searchId = useId();

  const visible = useMemo(() => sortRows(rows.filter((r) => matchesFilters(r, filters)), sort), [rows, filters, sort]);
  const visibleIds = useMemo(() => visible.map((r) => r.party.id), [visible]);
  // Bulk selection never includes records hidden by filters or no longer present.
  const bulk = reconcileBulk(rawBulk, visibleIds);
  const peopleShown = matchingPeople(visible, filters);
  const status = selectionStatus(selectedParty, visibleIds, rows.map((r) => r.party.id));
  const selected = rows.find((r) => r.party.id === selectedParty) ?? null;
  const chips = activeFilterKeys(filters);
  const fnName = (id: string) => data.functions.find((f) => f.id === id)?.name ?? id;

  const setFilters = (f: GuestFilters) => {
    // Drop bulk selections that the new filters hide, so they cannot silently reappear later.
    const nextVisible = rows.filter((r) => matchesFilters(r, f)).map((r) => r.party.id);
    setBulk((b) => reconcileBulk(b, nextVisible));
    props.setFilters(f);
  };
  // A selection outside this event context closes rather than lingering.
  useEffect(() => {
    if (status === 'gone') selectParty(null);
  }, [status, selectParty]);

  const setDensityPref = (d: 'comfortable' | 'compact') => {
    setDensity(d);
    try {
      window.localStorage.setItem(DENSITY_KEY, d);
    } catch {
      /* preference only */
    }
  };

  const open = (id: string | null) => {
    if (dirty && id !== selectedParty) {
      setPendingOpen(id);
      return;
    }
    if (id) setLastRowId(id);
    selectParty(id);
  };

  const backToList = () => {
    const id = lastRowId;
    open(null);
    // Return to the prior list position and focus.
    window.setTimeout(() => {
      const btn = id ? document.querySelector<HTMLElement>(`[data-party-open="${id}"]`) : null;
      btn?.scrollIntoView({ block: 'center' });
      btn?.focus();
    }, 30);
  };

  const update = (patch: Partial<GuestFilters>) => setFilters({ ...filters, ...patch });
  const callers = [...new Set(data.parties.map((p) => p.assignedCaller))].sort();
  const allSelected = visible.length > 0 && visible.every((r) => bulk.includes(r.party.id));

  const list = (
    <section className={styles.directory} aria-labelledby="dir-heading">
      <h2 id="dir-heading" className={styles.srOnly}>
        Guest and party directory
      </h2>
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <label htmlFor={searchId} className={styles.srOnly}>
            Search guests by name, reference, phone or email
          </label>
          <Search size={16} aria-hidden />
          <input id={searchId} type="search" value={filters.query} placeholder="Name, reference, phone or email" onChange={(e) => update({ query: e.target.value })} />
          {filters.query && (
            <button type="button" className={styles.iconBtn} onClick={() => update({ query: '' })} aria-label="Clear search">
              <X size={14} aria-hidden />
            </button>
          )}
        </div>
        <button type="button" id="guest-filters-toggle" className={styles.btnSecondary} aria-expanded={showFilters} aria-controls="guest-filters" onClick={() => setShowFilters((v) => !v)}>
          <Filter size={15} aria-hidden /> Filters{chips.length ? ` (${chips.length})` : ''}
        </button>
        <label className={styles.inlineField}>
          <span>Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="attention">Needs attention first</option>
            <option value="follow-up">Follow-up due</option>
            <option value="name">Party name</option>
            <option value="reference">Reference</option>
          </select>
        </label>
        <fieldset className={styles.segmented}>
          <legend className={styles.srOnly}>Row density</legend>
          <button type="button" aria-pressed={density === 'comfortable'} onClick={() => setDensityPref('comfortable')}>
            Comfortable
          </button>
          <button type="button" aria-pressed={density === 'compact'} onClick={() => setDensityPref('compact')}>
            Compact
          </button>
        </fieldset>
      </div>
      <div id="guest-filters" className={styles.filterPanel} hidden={!showFilters}>
        <FilterSelect label="Function" value={filters.functionId} onChange={(v) => update({ functionId: v })} options={[['any', 'Any function'], ...data.functions.map((f) => [f.id, f.name] as [string, string])]} />
        <FilterSelect label="Function RSVP" value={filters.functionRsvp} onChange={(v) => update({ functionRsvp: v as GuestFilters['functionRsvp'] })} options={[['any', 'Any answer'], ...Object.entries(FUNCTION_RSVP_LABEL)]} />
        <FilterSelect label="People status" value={filters.person} onChange={(v) => update({ person: v as GuestFilters['person'] })} options={[['any', 'Any'], ['confirmed', 'Has confirmed people'], ['tentative', 'Has tentative people'], ['declined', 'Has declined people'], ['awaiting', 'Has people awaiting']]} />
        <FilterSelect label="Contact response" value={filters.contact} onChange={(v) => update({ contact: v as GuestFilters['contact'] })} options={[['any', 'Any'], ...Object.entries(CONTACT_LABEL)]} />
        <FilterSelect label="Invitation" value={filters.invitation} onChange={(v) => update({ invitation: v as GuestFilters['invitation'] })} options={[['any', 'Any'], ...Object.entries(INVITATION_LABEL)]} />
        <FilterSelect label="Delivery (synthetic)" value={filters.delivery} onChange={(v) => update({ delivery: v as GuestFilters['delivery'] })} options={[['any', 'Any'], ...Object.entries(DELIVERY_LABEL)]} />
        <FilterSelect label="Priority" value={filters.priority} onChange={(v) => update({ priority: v as GuestFilters['priority'] })} options={[['any', 'Any'], ...Object.entries(PRIORITY_LABEL)]} />
        <FilterSelect label="Assigned caller" value={filters.caller} onChange={(v) => update({ caller: v })} options={[['any', 'Anyone'], ...callers.map((c) => [c, c] as [string, string])]} />
        <FilterSelect label="Follow-up" value={filters.followUp} onChange={(v) => update({ followUp: v as GuestFilters['followUp'] })} options={[['any', 'Any'], ['overdue', 'Overdue'], ['today', 'Due today'], ['upcoming', 'Upcoming'], ['none', 'None scheduled']]} />
        <FilterSelect label="Travel" value={filters.travel} onChange={(v) => update({ travel: v as GuestFilters['travel'] })} options={[['any', 'Any'], ['missing', 'Missing details (attending)'], ['changed', 'Changed after plan'], ['complete', 'Complete'], ['none', 'No travel legs']]} />
        <FilterSelect label="Pickup / drop" value={filters.transfer} onChange={(v) => update({ transfer: v as GuestFilters['transfer'] })} options={[['any', 'Any'], ['awaiting', 'Requested / awaiting details'], ['required', 'Planned or assigned'], ['none', 'Not required']]} />
        <FilterSelect label="Stay" value={filters.stay} onChange={(v) => update({ stay: v as GuestFilters['stay'] })} options={[['any', 'Any'], ...Object.entries(STAY_LABEL)]} />
        <FilterSelect label="Document policy" value={filters.document} onChange={(v) => update({ document: v as GuestFilters['document'] })} options={[['any', 'Any'], ...Object.entries(DOC_LABEL)]} />
        <label className={styles.checkField}>
          <input type="checkbox" checked={filters.assistance === 'yes'} onChange={(e) => update({ assistance: e.target.checked ? 'yes' : 'any' })} /> Special assistance
        </label>
        <label className={styles.checkField}>
          <input type="checkbox" checked={filters.attention === 'yes'} onChange={(e) => update({ attention: e.target.checked ? 'yes' : 'any' })} /> Needs attention
        </label>
      </div>
      {chips.length > 0 && (
        <div className={styles.chips} aria-label="Active filters">
          <ul>
            {chips.map((k, i) => (
              <li key={k} className={styles.chip}>
                <button
                  type="button"
                  data-chip
                  onClick={() => {
                    update({ [k]: EMPTY_FILTERS[k] });
                    // Keep focus in the chip row (next chip, previous chip, or the Filters toggle).
                    window.setTimeout(() => {
                      const rest = document.querySelectorAll<HTMLElement>('[data-chip]');
                      (rest[i] ?? rest[i - 1] ?? document.getElementById('guest-filters-toggle'))?.focus();
                    }, 0);
                  }}
                  aria-label={`Remove filter ${filterLabel(k, filters, fnName)}`}
                >
                  {filterLabel(k, filters, fnName)} <X size={12} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className={styles.linkBtn}
            onClick={() => {
              setFilters({ ...EMPTY_FILTERS, query: filters.query });
              window.setTimeout(() => document.getElementById('guest-filters-toggle')?.focus(), 0);
            }}
          >
            Clear all filters
          </button>
        </div>
      )}
      <output className={styles.resultCount} aria-live="polite">
        {visible.length} of {rows.length} parties · {peopleShown} {filters.person === 'any' ? 'people' : `${filters.person} people`}
      </output>
      {bulk.length > 0 && (
        <section className={styles.bulkBar} aria-label="Bulk actions">
          <span>
            <strong>{bulk.length}</strong> of {visible.length} visible parties selected ({visible.filter((r) => bulk.includes(r.party.id)).reduce((s, r) => s + r.people, 0)} people)
          </span>
          {can('bulk-assign-caller') ? (
            <button type="button" className={styles.btnSecondary} onClick={() => setBulkScope(visible.filter((r) => bulk.includes(r.party.id)))}>
              <UserRoundCog size={15} aria-hidden /> Assign caller…
            </button>
          ) : (
            <WhyUnavailable>Your role cannot reassign callers.</WhyUnavailable>
          )}
          <button type="button" className={styles.btnGhost} onClick={() => setBulk([])}>
            Clear selection
          </button>
        </section>
      )}
      {rows.length === 0 ? (
        <StatePanel
          title="No guests yet"
          headingLevel={3}
          action={
            <>
              <button type="button" className={styles.btnPrimary} onClick={() => go('import')}>
                Import a guest list
              </button>
              <button type="button" className={styles.btnSecondary} onClick={() => go('add')}>
                Add a party
              </button>
            </>
          }
        >
          <p>Start with a CSV import or add a party by hand.</p>
        </StatePanel>
      ) : visible.length === 0 ? (
        <StatePanel
          title="No parties match these filters"
          headingLevel={3}
          action={
            <button type="button" className={styles.btnPrimary} onClick={() => setFilters(EMPTY_FILTERS)}>
              Clear search and filters
            </button>
          }
        >
          <p>{rows.length} parties exist in this event; none match the current combination.</p>
        </StatePanel>
      ) : (
        <section className={styles.tableWrap} aria-label="Guest directory table" data-lenis-prevent>
          <table className={`${styles.table} ${styles.responsiveTable} ${density === 'compact' ? styles.compact : ''}`}>
            <caption className={styles.srOnly}>
              Parties with member counts, function responses, contact, follow-up, travel and stay. {visible.length} rows.
            </caption>
            <thead>
              <tr>
                <th scope="col" className={styles.checkCol}>
                  <input
                    type="checkbox"
                    aria-label={allSelected ? 'Clear selection of visible parties' : `Select all ${visible.length} visible parties`}
                    checked={allSelected}
                    onChange={() => setBulk(allSelected ? [] : visibleIds)}
                  />
                </th>
                <th scope="col">Party</th>
                <th scope="col">People</th>
                {data.functions.map((f) => (
                  <th scope="col" key={f.id} data-wide>
                    {f.name}
                  </th>
                ))}
                <th scope="col" data-wide>
                  Contact
                </th>
                <th scope="col">Follow-up</th>
                <th scope="col" data-wide>
                  Travel
                </th>
                <th scope="col" data-wide>
                  Stay
                </th>
                <th scope="col">Attention</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <PartyRowView
                  key={r.party.id}
                  row={r}
                  data={data}
                  now={now}
                  selected={selectedParty === r.party.id}
                  changed={changedIds.has(r.party.id)}
                  expanded={expanded.has(r.party.id)}
                  onToggle={() =>
                    setExpanded((s) => {
                      const n = new Set(s);
                      if (n.has(r.party.id)) n.delete(r.party.id);
                      else n.add(r.party.id);
                      return n;
                    })
                  }
                  checked={bulk.includes(r.party.id)}
                  onCheck={(v) => setBulk((b) => (v ? [...b, r.party.id] : b.filter((x) => x !== r.party.id)))}
                  onOpen={() => open(r.party.id)}
                />
              ))}
            </tbody>
          </table>
        </section>
      )}
    </section>
  );

  return (
    <div className={`${styles.masterDetail} ${selected ? styles.hasDetail : ''}`}>
      <div className={styles.masterPane}>{list}</div>
      {selected && (
        <div className={styles.detailPane} key={selected.party.id}>
          <button type="button" className={`${styles.btnGhost} ${styles.backBtn}`} onClick={backToList}>
            <ArrowLeft size={15} aria-hidden /> Back to guest list
          </button>
          {status === 'filtered-out' && (
            <div className={styles.notice}>
              <p>This party no longer matches the current filters. It stays open so you can finish; closing it returns you to the filtered list.</p>
              <div className={styles.inlineActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => open(null)}>
                  Close detail
                </button>
                <button type="button" className={styles.btnGhost} onClick={() => setFilters(EMPTY_FILTERS)}>
                  Clear filters
                </button>
              </div>
            </div>
          )}
          <PartyDetail {...props} row={selected} onDirty={setDirty} onClose={() => open(null)} />
        </div>
      )}
      <Modal open={pendingOpen !== undefined} title="Discard unsaved changes?" onClose={() => setPendingOpen(undefined)} description="You have unsaved edits on the open party. Leaving discards them.">
        <div className={styles.inlineActions}>
          <button
            type="button"
            className={styles.btnDanger}
            onClick={() => {
              const next = pendingOpen ?? null;
              setDirty(false);
              setPendingOpen(undefined);
              if (next) setLastRowId(next);
              selectParty(next);
            }}
          >
            Discard and continue
          </button>
          <button type="button" className={styles.btnSecondary} onClick={() => setPendingOpen(undefined)}>
            Keep editing
          </button>
        </div>
      </Modal>
      {bulkScope && <BulkAssign scope={bulkScope} onClose={() => setBulkScope(null)} callers={callers} onDone={() => setBulk([])} />}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: Array<[string, string]> }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}

const RSVP_TONE: Record<FunctionRsvp, 'good' | 'warn' | 'bad' | 'muted' | 'info'> = { confirmed: 'good', tentative: 'info', declined: 'muted', cancelled: 'muted', awaiting: 'warn' };

function PartyRowView({
  row,
  data,
  now,
  selected,
  changed,
  expanded,
  onToggle,
  checked,
  onCheck,
  onOpen,
}: {
  row: PartyRow;
  data: EventData;
  now: number;
  selected: boolean;
  changed: boolean;
  expanded: boolean;
  onToggle: () => void;
  checked: boolean;
  onCheck: (v: boolean) => void;
  onOpen: () => void;
}) {
  const p = row.party;
  const tz = data.event.timezone;
  return (
    <>
      <tr className={`${selected ? styles.rowSelected : ''} ${changed ? styles.rowChanged : ''}`} aria-selected={selected}>
        <td className={styles.checkCol} data-label="Select">
          <input type="checkbox" checked={checked} onChange={(e) => onCheck(e.target.checked)} aria-label={`Select ${p.displayName}`} />
        </td>
        <th scope="row" data-label="Party">
          <div className={styles.partyCell}>
            <button type="button" className={styles.expandBtn} onClick={onToggle} aria-expanded={expanded} aria-label={`${expanded ? 'Hide' : 'Show'} members of ${p.displayName}`}>
              {expanded ? <ChevronDown size={14} aria-hidden /> : <ChevronRight size={14} aria-hidden />}
            </button>
            <button type="button" className={styles.partyOpen} onClick={onOpen} data-party-open={p.id} aria-current={selected ? 'true' : undefined}>
              <span className={styles.wrap}>{p.displayName}</span>
              <span className={styles.meta}>{p.ref}</span>
            </button>
            {p.priority !== 'standard' && <Tag tone="info">{PRIORITY_LABEL[p.priority]}</Tag>}
          </div>
        </th>
        <td data-label="People">
          {row.people}
          <span className={styles.meta}> / {p.allowedAccompanying + 1} allowed</span>
        </td>
        {data.functions.map((f) => {
          const invited = row.members.filter((m) => m.invitedFunctionIds.includes(f.id));
          const yes = invited.filter((m) => m.responses[f.id] === 'confirmed').length;
          const waiting = invited.filter((m) => (m.responses[f.id] ?? 'awaiting') === 'awaiting').length;
          return (
            <td key={f.id} data-label={f.name} data-wide>
              {invited.length === 0 ? (
                <span className={styles.meta}>Not invited</span>
              ) : (
                <span>
                  {yes}/{invited.length} confirmed{waiting ? <span className={styles.meta}> · {waiting} awaiting</span> : null}
                </span>
              )}
            </td>
          );
        })}
        <td data-label="Contact" data-wide>
          {CONTACT_LABEL[p.contact]}
        </td>
        <td data-label="Follow-up">
          {p.followUpDueAt ? (
            <>
              {row.followUp === 'overdue' && <Tag tone="bad">Overdue</Tag>}
              {row.followUp === 'today' && <Tag tone="warn">Today</Tag>} <Stamp iso={p.followUpDueAt} timeZone={tz} now={now} />
            </>
          ) : (
            <span className={styles.meta}>None</span>
          )}
        </td>
        <td data-label="Travel" data-wide>
          {row.travel === 'none' ? <span className={styles.meta}>—</span> : row.travel === 'complete' ? 'Complete' : row.travel === 'changed' ? <Tag tone="bad">Changed</Tag> : <Tag tone="warn">Missing</Tag>}
        </td>
        <td data-label="Stay" data-wide>
          {row.stay ? STAY_LABEL[row.stay.state] : <span className={styles.meta}>—</span>}
        </td>
        <td data-label="Attention">{row.attention.length ? <span className={styles.reasons}>{row.attention.map((a) => ATTENTION_LABEL[a]).join(' · ')}</span> : <span className={styles.meta}>—</span>}</td>
      </tr>
      {expanded && (
        <tr className={styles.memberRow}>
          <td colSpan={data.functions.length + 8}>
            <ul className={styles.memberList}>
              {row.members.map((m) => (
                <li key={m.id}>
                  <strong className={styles.wrap}>{m.name}</strong>
                  <span className={styles.meta}> {m.ageBand}</span>
                  {data.functions.map((f) =>
                    m.invitedFunctionIds.includes(f.id) ? (
                      <Tag key={f.id} tone={RSVP_TONE[m.responses[f.id] ?? 'awaiting']}>
                        {f.name}: {FUNCTION_RSVP_LABEL[m.responses[f.id] ?? 'awaiting']}
                      </Tag>
                    ) : null,
                  )}
                </li>
              ))}
            </ul>
          </td>
        </tr>
      )}
    </>
  );
}

/** The scope is frozen by the caller when the preview opens, so the confirmed count is exactly what runs. */
function BulkAssign({ scope, onClose, callers, onDone }: { scope: PartyRow[]; onClose: () => void; callers: string[]; onDone: () => void }) {
  const [caller, setCaller] = useState('');
  const [results, setResults] = useState<Array<{ partyId: string; ok: boolean; message: string }> | null>(null);
  const action = useEventMutation<Array<{ partyId: string; ok: boolean; message: string }>>(
    () => (caller ? ({ type: 'bulk-assign-caller', caller, items: scope.map((r) => ({ partyId: r.party.id, baseVersion: r.party.version })) } satisfies Command) : null),
    (value) => setResults(value),
  );
  const ok = results?.filter((r) => r.ok).length ?? 0;
  return (
    <Modal open title="Assign caller to selected parties" onClose={onClose} description={`Exact scope: ${scope.length} parties, ${scope.reduce((s, r) => s + r.people, 0)} people. Only these parties are changed.`}>
      {results ? (
        <div className={styles.stack}>
          <output>
            {ok} of {results.length} parties updated{ok < results.length ? `; ${results.length - ok} not changed` : ''}.
          </output>
          <ul className={styles.plainList}>
            {results.map((r) => (
              <li key={r.partyId}>
                {r.ok ? <Tag tone="good">Assigned</Tag> : <Tag tone="bad">Not changed</Tag>} {scope.find((s) => s.party.id === r.partyId)?.party.displayName} {!r.ok && <span className={styles.meta}>— {r.message}</span>}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => {
              onDone();
              onClose();
            }}
          >
            Done
          </button>
        </div>
      ) : (
        <div className={styles.stack}>
          <ul className={styles.scopeList}>
            {scope.map((r) => (
              <li key={r.party.id}>
                {r.party.displayName} <span className={styles.meta}>{r.party.ref} · now {r.party.assignedCaller}</span>
              </li>
            ))}
          </ul>
          <label className={styles.field}>
            <span>New caller</span>
            <select value={caller} onChange={(e) => setCaller(e.target.value)}>
              <option value="">Choose a caller</option>
              {callers.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <ActionError status={action.status} onRetry={action.retry} onNew={action.start} />
          <div className={styles.inlineActions}>
            <button type="button" className={styles.btnPrimary} disabled={!caller || action.status.phase === 'pending'} onClick={action.start}>
              <PendingLabel pending={action.status.phase === 'pending'} idle={`Assign ${scope.length} parties`} busy="Assigning…" />
            </button>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ---------- Party detail ----------

export function PartyDetail({ row, data, now, can, refresh, onDirty, onClose, org }: SectionProps & { row: PartyRow; onDirty: (d: boolean) => void; onClose: () => void }) {
  const p = row.party;
  const tz = data.event.timezone;
  const legs = data.legs.filter((l) => l.partyId === p.id);
  const transfers = data.transfers.filter((t) => t.partyId === p.id);
  const docs = data.documents.filter((d) => d.partyId === p.id);
  const docsEnabled = org.entitlements.includes('documents') && data.documents.length > 0;
  const nextAction = row.attention.length ? ATTENTION_LABEL[row.attention[0]] : p.followUpReason || (row.statusCounts.awaiting ? 'Confirm awaiting members' : 'No action needed');

  return (
    <article className={styles.detail} aria-labelledby="party-title">
      <header className={styles.detailHead}>
        <div>
          <p className={styles.kickerDark}>
            {p.side} side · {p.language} · {PRIORITY_LABEL[p.priority]}
          </p>
          <h2 id="party-title" tabIndex={-1} className={styles.wrap}>
            {p.displayName}
          </h2>
          <p className={styles.meta}>
            <CopyRef value={p.ref} /> · version {p.version} · updated <Stamp iso={p.updatedAt} timeZone={tz} now={now} />
          </p>
        </div>
        <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Close party detail">
          <X size={18} aria-hidden />
        </button>
      </header>
      <div className={styles.nextAction}>
        <span>Next action</span>
        <strong>{nextAction}</strong>
      </div>
      <Block title="Primary contact">
        <dl className={styles.facts}>
          <div>
            <dt>Phone</dt>
            <dd>{p.phone || <span className={styles.meta}>Hidden for your role</span>}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd className={styles.wrap}>{p.email || '—'}</dd>
          </div>
          <div>
            <dt>Invitation</dt>
            <dd>{INVITATION_LABEL[p.invitation]}</dd>
          </div>
          <div>
            <dt>Delivery (synthetic)</dt>
            <dd>{DELIVERY_LABEL[p.delivery]}</dd>
          </div>
          <div>
            <dt>Contact response</dt>
            <dd>{CONTACT_LABEL[p.contact]}</dd>
          </div>
          <div>
            <dt>Allowed accompanying</dt>
            <dd>
              {p.allowedAccompanying} (party of {row.people}){row.attention.includes('over-allowance') && <Tag tone="warn">Over allowance</Tag>}
            </dd>
          </div>
        </dl>
        {p.delivery === 'failed' && <p className={styles.notice}>Message failure is not a decline. Call the guest or share the web RSVP link manually.</p>}
        {p.delivery === 'uncertain' && <p className={styles.notice}>Delivery is uncertain. Reconcile with the provider before any resend — it is not treated as safe to retry.</p>}
      </Block>
      <ResponsesEditor row={row} data={data} canEdit={can('update-responses')} onDirty={onDirty} refresh={refresh} />
      <NotesEditor row={row} canEdit={can('update-party')} onDirty={onDirty} refresh={refresh} />
      <Block title="Calls and follow-up">
        <p>
          Follow-up owner <strong>{p.assignedCaller}</strong>
          {p.followUpDueAt ? (
            <>
              {' '}
              · due <Stamp iso={p.followUpDueAt} timeZone={tz} now={now} />
            </>
          ) : (
            ' · no follow-up scheduled'
          )}
        </p>
        {p.calls.length === 0 ? (
          <p className={styles.meta}>No calls recorded.</p>
        ) : (
          <ol className={styles.miniTimeline}>
            {p.calls.map((c) => (
              <li key={c.id}>
                <strong>{CALL_OUTCOME_LABEL[c.outcome]}</strong> · {c.actor} · <Stamp iso={c.at} timeZone={tz} now={now} />
                {c.note && <p>{c.note}</p>}
              </li>
            ))}
          </ol>
        )}
      </Block>
      <Block title="Travel, transfers and stay">
        {legs.length === 0 ? (
          <p className={styles.meta}>No travel legs recorded.</p>
        ) : (
          <ul className={styles.plainList}>
            {legs.map((l) => (
              <li key={l.id}>
                <strong>{l.direction === 'arrival' ? 'Arrival' : 'Departure'}</strong> · {TRAVEL_MODE_LABEL[l.mode]} {l.reference} · {l.at ? formatExact(l.at, tz) : <Tag tone="warn">Time not supplied</Tag>}
                {l.changedFrom && <Tag tone="bad">Changed from {formatExact(l.changedFrom, tz)}</Tag>}
              </li>
            ))}
          </ul>
        )}
        {transfers.map((t) => (
          <p key={t.id}>
            {t.kind === 'pickup' ? 'Pickup' : 'Drop'}: {TRANSFER_LABEL[t.state]}
          </p>
        ))}
        {row.stay && (
          <p>
            Stay: {STAY_LABEL[row.stay.state]} {row.stay.roomLabel && `· room ${row.stay.roomLabel}`} · {row.stay.checkIn} to {row.stay.checkOut}
          </p>
        )}
      </Block>
      <Block title="Dietary and accessibility">
        <ul className={styles.plainList}>
          {row.members.map((m) => (
            <li key={m.id}>
              {m.name}: {m.dietary || 'No dietary note'}; {m.accessibility || 'no accessibility need recorded'}
            </li>
          ))}
        </ul>
      </Block>
      <Block title="Documents">
        {!docsEnabled ? (
          <p className={styles.meta}>Document collection is disabled by policy for this event. No identity documents are requested or stored.</p>
        ) : docs.length === 0 ? (
          <p className={styles.meta}>No document is required for this party.</p>
        ) : (
          docs.map((d) => (
            <p key={d.id}>
              Synthetic metadata · {d.purpose.replace('-', ' ')}: {DOC_LABEL[d.state]} {d.note && <span className={styles.meta}>— {d.note}</span>}
            </p>
          ))
        )}
      </Block>
      <Block title="Change history">
        {p.changes.length === 0 ? (
          <p className={styles.meta}>No recorded changes.</p>
        ) : (
          <ol className={styles.miniTimeline}>
            {p.changes.map((c) => (
              <li key={c.id}>
                <strong>{c.field}</strong>
                <p className={styles.beforeAfter}>
                  <span>{displayValue(c.before, tz)}</span> <ArrowRight size={12} aria-hidden /> <span>{displayValue(c.after, tz)}</span>
                </p>
                <p className={styles.meta}>
                  {c.actor} · {c.source} · <Stamp iso={c.at} timeZone={tz} now={now} />
                </p>
              </li>
            ))}
          </ol>
        )}
      </Block>
    </article>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.block}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function ResponsesEditor({ row, data, canEdit, onDirty, refresh }: { row: PartyRow; data: EventData; canEdit: boolean; onDirty: (d: boolean) => void; refresh: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<string, Record<string, FunctionRsvp>>>({});
  const [base, setBase] = useState(row.party.version);
  const [reviewing, setReviewing] = useState(false);
  const changes = row.members.flatMap((m) =>
    m.invitedFunctionIds
      .filter((f) => draft[m.id]?.[f] && draft[m.id][f] !== (m.responses[f] ?? 'awaiting'))
      .map((f) => ({ m, f, before: m.responses[f] ?? 'awaiting', after: draft[m.id][f] })),
  );
  const dirty = editing && changes.length > 0;
  useEffect(() => onDirty(dirty), [dirty, onDirty]);
  const action = useEventMutation(
    () => ({ type: 'update-responses', partyId: row.party.id, baseVersion: base, responses: Object.fromEntries(changes.map((c) => [c.m.id, { ...draft[c.m.id] }])) }) satisfies Command,
    () => {
      setEditing(false);
      setReviewing(false);
      setDraft({});
    },
    (_v, replayed) => (replayed ? 'Responses were already saved — confirmed without duplicating.' : `Saved ${changes.length} response change(s).`),
  );
  const start = () => {
    setBase(row.party.version);
    setDraft(Object.fromEntries(row.members.map((m) => [m.id, { ...m.responses }])));
    setEditing(true);
    action.reset();
  };
  return (
    <section className={styles.block}>
      <div className={styles.blockHead}>
        <h3>Function-wise answers</h3>
        {!editing &&
          (canEdit ? (
            <button type="button" className={styles.btnSecondary} onClick={start}>
              Edit answers
            </button>
          ) : (
            <WhyUnavailable>Your role can view but not change answers.</WhyUnavailable>
          ))}
        {editing && <Tag tone={dirty ? 'warn' : 'muted'}>{dirty ? `${changes.length} unsaved change(s)` : 'No changes yet'}</Tag>}
      </div>
      <section className={styles.tableWrap} aria-label="Function answers per member" data-lenis-prevent>
        <table className={styles.table}>
          <caption className={styles.srOnly}>Answer for each member and function. Declining one function does not decline others.</caption>
          <thead>
            <tr>
              <th scope="col">Member</th>
              {data.functions.map((f) => (
                <th scope="col" key={f.id}>
                  {f.name}
                </th>
              ))}
              <th scope="col">Overall</th>
            </tr>
          </thead>
          <tbody>
            {row.members.map((m) => (
              <tr key={m.id}>
                <th scope="row" className={styles.wrap}>
                  {m.name}
                  <span className={styles.meta}> {m.ageBand}</span>
                </th>
                {data.functions.map((f) => (
                  <td key={f.id}>
                    {!m.invitedFunctionIds.includes(f.id) ? (
                      <span className={styles.meta}>Not invited</span>
                    ) : editing ? (
                      <select
                        aria-label={`${m.name} — ${f.name}`}
                        value={draft[m.id]?.[f.id] ?? 'awaiting'}
                        onChange={(e) => setDraft((d) => ({ ...d, [m.id]: { ...d[m.id], [f.id]: e.target.value as FunctionRsvp } }))}
                      >
                        {Object.entries(FUNCTION_RSVP_LABEL).map(([v, l]) => (
                          <option key={v} value={v}>
                            {l}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Tag tone={RSVP_TONE[m.responses[f.id] ?? 'awaiting']}>{FUNCTION_RSVP_LABEL[m.responses[f.id] ?? 'awaiting']}</Tag>
                    )}
                  </td>
                ))}
                <td>{personStatus(m)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {editing && (
        <div className={styles.stack}>
          {reviewing && changes.length > 0 && (
            <section className={styles.reviewBox} aria-label="Review changes before saving">
              <h4>Before and after</h4>
              <ul className={styles.plainList}>
                {changes.map((c) => (
                  <li key={`${c.m.id}-${c.f}`}>
                    {c.m.name} · {data.functions.find((x) => x.id === c.f)?.name}: {FUNCTION_RSVP_LABEL[c.before]} <ArrowRight size={12} aria-hidden /> <strong>{FUNCTION_RSVP_LABEL[c.after]}</strong>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <ActionError status={action.status} onRetry={action.retry} onNew={action.start} onRefresh={() => { setEditing(false); refresh(); }} />
          <div className={styles.inlineActions}>
            {!reviewing ? (
              <button type="button" className={styles.btnPrimary} disabled={!dirty} onClick={() => setReviewing(true)}>
                Review {changes.length || ''} change(s)
              </button>
            ) : (
              <button type="button" className={styles.btnPrimary} disabled={action.status.phase === 'pending' || !dirty} onClick={action.start}>
                <PendingLabel pending={action.status.phase === 'pending'} idle="Save answers" busy="Saving…" />
              </button>
            )}
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => {
                setEditing(false);
                setReviewing(false);
                setDraft({});
                action.reset();
              }}
            >
              {dirty ? 'Discard changes' : 'Cancel'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function NotesEditor({ row, canEdit, onDirty, refresh }: { row: PartyRow; canEdit: boolean; onDirty: (d: boolean) => void; refresh: () => void }) {
  // null = showing the server note; otherwise an edit started against a specific version.
  const [draft, setDraft] = useState<{ text: string; baseNotes: string; baseVersion: number } | null>(null);
  const id = useId();
  // A clean draft is only kept while its version is current, so newer server notes always show.
  const active = draft && (draft.text !== draft.baseNotes || draft.baseVersion === row.party.version) ? draft : null;
  const text = active ? active.text : row.party.notes;
  const dirty = active !== null && active.text !== active.baseNotes;
  useEffect(() => onDirty(dirty), [dirty, onDirty]);
  const action = useEventMutation(
    () => (active ? ({ type: 'update-party', partyId: row.party.id, baseVersion: active.baseVersion, patch: { notes: active.text } } satisfies Command) : null),
    // Keep showing the saved text; the next version is the one just written.
    () => setDraft((d) => (d ? { text: d.text, baseNotes: d.text, baseVersion: d.baseVersion + 1 } : d)),
    (_v, replayed) => (replayed ? 'Note was already saved — confirmed once.' : 'Internal note saved.'),
  );
  const edit = (value: string) => setDraft({ baseNotes: active?.baseNotes ?? row.party.notes, baseVersion: active?.baseVersion ?? row.party.version, text: value });
  return (
    <section className={styles.block}>
      <div className={styles.blockHead}>
        <h3>
          <label htmlFor={id}>Internal note</label>
        </h3>
        <Tag tone={dirty ? 'warn' : action.status.phase === 'done' ? 'good' : 'muted'}>{dirty ? 'Unsaved' : action.status.phase === 'done' ? 'Saved' : 'No unsaved changes'}</Tag>
      </div>
      <textarea id={id} value={text} onChange={(e) => edit(e.target.value)} rows={3} readOnly={!canEdit} maxLength={600} aria-describedby={`${id}-hint`} />
      <p id={`${id}-hint`} className={styles.meta}>
        Staff-only. Do not record identity-document numbers or sensitive health details here.
      </p>
      <ActionError
        status={action.status}
        onRetry={action.retry}
        onNew={action.start}
        onRefresh={() => {
          // Load latest: drop the stale draft and show the current server note.
          setDraft(null);
          action.reset();
          refresh();
        }}
      />
      {canEdit && (
        <div className={styles.inlineActions}>
          <button type="button" className={styles.btnPrimary} disabled={!dirty || action.status.phase === 'pending'} onClick={action.start}>
            <PendingLabel pending={action.status.phase === 'pending'} idle="Save note" busy="Saving…" />
          </button>
          {dirty && (
            <button type="button" className={styles.btnGhost} onClick={() => setDraft(null)}>
              Discard
            </button>
          )}
        </div>
      )}
    </section>
  );
}
