// Task-local browser check for TNP-OPERATIONS-REPORTS-CLAUDE-M2.
// Paste into the console of a fresh `/admin` page on the task dev server (synthetic preview only).
// It drives the real UI, captures the CSV Blob the page builds, parses it and compares stable IDs with the
// rendered rows. The anchor click is stubbed so no file is actually written to disk during the check.
// Returns { passed, failed, results }.
// The IIFE's promise is the console/eval result, and browser methods are saved only to stub and restore them.
// oxlint-disable typescript/no-floating-promises, typescript/unbound-method
(async () => {
  const results = [];
  const check = (name, condition, detail) => results.push({ name, ok: Boolean(condition), detail });
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const until = async (predicate, label, ms = 6000) => {
    const start = Date.now();
    while (Date.now() - start < ms) { const value = predicate(); if (value) return value; await sleep(50); }
    throw new Error(`timeout waiting for ${label}`);
  };
  const qa = (selector, root = document) => [...root.querySelectorAll(selector)];
  const ws = () => document.querySelector('#operations-workspace');
  const byText = (selector, text, root = document) => qa(selector, root).find((el) => el.textContent.trim() === text);
  const setValue = (el, value) => {
    const proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
    el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
  };
  const field = (label) => qa('label', ws()).find((el) => el.querySelector('span')?.textContent.trim() === label)?.querySelector('input,select');
  const visibleIds = () => qa('[data-report-detail] [data-export-id]', ws()).map((el) => el.dataset.exportId);
  const status = () => ws().querySelector('output')?.textContent.trim() ?? '';
  const parseCsv = (text) => {
    const rows = []; let row = []; let cell = ''; let quoted = false;
    for (let i = 0; i < text.length; i += 1) {
      const c = text[i];
      if (quoted) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i += 1; } else if (c === '"') quoted = false; else cell += c; }
      else if (c === '"') quoted = true;
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i += 1; row.push(cell); rows.push(row); row = []; cell = ''; }
      else cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows;
  };
  async function exportAndParse() {
    let blob; let filename = '';
    const create = URL.createObjectURL; const click = HTMLAnchorElement.prototype.click;
    URL.createObjectURL = (value) => { blob = value; return create.call(URL, value); };
    HTMLAnchorElement.prototype.click = function stubbedClick() { filename = this.download; };
    try { byText('button', 'Export CSV', ws()).click(); await sleep(150); } finally { URL.createObjectURL = create; HTMLAnchorElement.prototype.click = click; }
    const [header, ...rows] = parseCsv(await blob.text());
    return { header, rows, filename, column: (name) => rows.map((row) => row[header.indexOf(name)]) };
  }
  const openReports = async () => {
    const rail = byText('aside.admin-sidebar button', 'Reports & audit');
    rail.click();
    await until(() => ws()?.getAttribute('aria-label') === 'Reports & audit workspace', 'reports workspace');
    await sleep(150);
    return rail;
  };

  try {
    await until(() => byText('aside.admin-sidebar button', 'Reports & audit') && ws(), 'operations ready');
    const rail = await openReports();
    check('rail: Reports is enabled and aria-current=page', !rail.disabled && rail.getAttribute('aria-current') === 'page');
    check('rail: exactly one current section', qa('aside.admin-sidebar button[aria-current="page"]').length === 1);
    check('rail: focus moves to the Reports workspace', document.activeElement === ws());
    check('context: generation 0 and in-browser statement shown', /Preview generation 0/.test(ws().textContent) && /derived in this browser/.test(ws().textContent));
    check('context: limitations visible', /No payment execution or provider reconciliation/.test(ws().textContent) && /No immutable server archive/.test(ws().textContent));

    // Staffing: all visible functions.
    let ids = visibleIds();
    check('staffing: all positions grouped by function start then ID', JSON.stringify(ids) === JSON.stringify(['tnp-demo-position-001', 'tnp-demo-position-003', 'tnp-demo-position-002', 'tnp-demo-position-004']), ids);
    let csv = await exportAndParse();
    check('staffing CSV: position IDs equal visible IDs', JSON.stringify(csv.column('position_id')) === JSON.stringify(ids), csv.column('position_id'));
    check('staffing CSV: marker, generation and context columns on every row', csv.header.slice(0, 5).join() === 'preview_marker,generation,snapshot_clock,view,view_scope' && csv.rows.every((row) => row[0].startsWith('SYNTHETIC PREVIEW') && row[1] === '0'));
    check('staffing CSV: no display names exported', !csv.rows.flat().some((cell) => /Rahul|Neha|Amit/.test(cell)));
    check('export: success only after preparation, with filename', /handed to the browser as tnp-synthetic-preview-g0-staffing\.csv/.test(status()), status());

    // Select event-002 by exact ID.
    qa('button[class*=reportRow]', ws()).find((el) => el.getAttribute('aria-label').includes('tnp-demo-event-002')).click();
    await sleep(100);
    check('staffing: selecting a function marks only that row pressed', qa('button[class*=reportRow][aria-pressed="true"]', ws()).map((el) => el.getAttribute('aria-label').split(',')[1].trim()).join() === 'tnp-demo-event-002');
    check('export: previous success message is not shown for the new dataset', !/handed to the browser/.test(status()), status());
    ids = visibleIds();
    check('staffing: selected detail shows only its positions', JSON.stringify(ids) === JSON.stringify(['tnp-demo-position-002', 'tnp-demo-position-004']), ids);
    check('staffing: selected allocations belong to the function', /tnp-demo-assignment-003/.test(ws().textContent) && !/tnp-demo-assignment-001/.test(ws().textContent));
    csv = await exportAndParse();
    check('staffing CSV: selected function only', JSON.stringify(csv.column('position_id')) === JSON.stringify(ids) && csv.column('event_id').every((id) => id === 'tnp-demo-event-002') && csv.filename === 'tnp-synthetic-preview-g0-staffing-tnp-demo-event-002.csv', csv.filename);

    // Filter the selection out.
    setValue(field('Function status'), 'staffing');
    await sleep(100);
    check('staffing: filtered-out selection is cleared with an explicit notice', /tnp-demo-event-002 is hidden by the current filters/.test(ws().textContent.replace(/\s+/g, ' ')) && !qa('button[aria-pressed="true"][class*=reportRow]', ws()).length);
    ids = visibleIds();
    csv = await exportAndParse();
    check('staffing CSV: hidden function excluded', JSON.stringify(csv.column('position_id')) === JSON.stringify(ids) && !csv.column('event_id').includes('tnp-demo-event-002'), ids);
    setValue(field('Search functions or positions'), 'no-such-record');
    await sleep(100);
    check('staffing: filtered-empty state differs from scenario-empty', /No functions match the current filters/.test(ws().textContent) && !/No functions in this snapshot/.test(ws().textContent));
    check('export: disabled when no rows are visible', byText('button', 'Export CSV', ws()).disabled);
    byText('button', 'Clear filters', ws().querySelector('[class*=reportEmpty]')).click();
    await sleep(100);
    check('staffing: clear filters restores all rows without resurrecting the old selection', visibleIds().length === 4 && !qa('button[aria-pressed="true"][class*=reportRow]', ws()).length && !/is hidden by the current filters/.test(ws().textContent));

    // Exceptions view.
    byText('button', 'Attendance & verification', ws()).click();
    await sleep(150);
    check('exceptions: view button pressed', byText('button', 'Attendance & verification', ws()).getAttribute('aria-pressed') === 'true');
    ids = visibleIds();
    check('exceptions: groups keep denied / outside / recorded distinct', JSON.stringify(ids) === JSON.stringify(['tnp-demo-application-001', 'tnp-demo-attendance-001', 'tnp-demo-attendance-003', 'tnp-demo-attendance-002']), ids);
    check('exceptions: GPS missing group absent when the snapshot has none', !qa('h4', ws()).some((el) => el.textContent === 'GPS missing'));
    setValue(field('Group'), 'gps-denied');
    await sleep(100);
    csv = await exportAndParse();
    check('exceptions CSV: equals visible filtered IDs', JSON.stringify(csv.column('record_id')) === JSON.stringify(visibleIds()) && csv.column('evidence_state').every((value) => value === 'gps-denied'), csv.column('record_id'));

    // Export failure is surfaced without success.
    const create = URL.createObjectURL;
    URL.createObjectURL = () => { throw new Error('Synthetic export failure'); };
    try { byText('button', 'Export CSV', ws()).click(); await sleep(100); } finally { URL.createObjectURL = create; }
    check('export failure: recoverable error, no success claim', /could not prepare the CSV \(Synthetic export failure\)/.test(status()) && !/handed to the browser/.test(status()), status());
    csv = await exportAndParse();
    check('export retry after failure succeeds', /handed to the browser/.test(status()));
    setValue(field('Group'), 'all');
    await sleep(100);
    check('export: success message clears when filters change', status() === '');

    // Audit duplicates created through the real preview service.
    const { getBrowserPreviewService } = await import('/lib/services/preview.ts');
    const service = await getBrowserPreviewService();
    const generation = await service.getGeneration();
    for (const attendanceId of ['tnp-demo-attendance-001', 'tnp-demo-attendance-003']) {
      const result = await service.mutate({ requestKey: `browser-check-${attendanceId}-${Date.now()}`, expectedGeneration: generation, actorId: 'tnp-demo-ops-001', operation: 'correctAttendance', payload: { attendanceId, state: 'present', evidenceState: 'recorded', reason: 'Duplicate-looking browser check reason', note: 'Synthetic browser check' } });
      check(`setup: sample correction on ${attendanceId}`, result.ok, result.ok ? '' : result.error.code);
    }
    window.dispatchEvent(new Event('tnp-preview-change'));
    await until(() => ws()?.getAttribute('aria-label') === 'Reports & audit workspace' && /Audit entries\s*3/i.test(ws().textContent), 'refreshed audit');
    byText('button', 'Audit explorer', ws()).click();
    await sleep(150);
    setValue(field('Action'), 'attendance.corrected');
    setValue(field('Search audit text'), 'duplicate-looking');
    await sleep(100);
    ids = visibleIds();
    check('audit: duplicate action/reason rows stay individually addressable', ids.length === 2 && new Set(ids).size === 2, ids);
    csv = await exportAndParse();
    check('audit CSV: equals visible IDs and keeps distinct entity IDs', JSON.stringify(csv.column('audit_id')) === JSON.stringify(ids) && new Set(csv.column('entity_id')).size === 2 && !csv.column('audit_id').includes('tnp-demo-audit-001'), csv.column('entity_id'));
    setValue(field('Entity ID contains'), 'attendance-003');
    await sleep(100);
    check('audit: entity filter narrows to one exact entry', visibleIds().length === 1);

    // Forced race: an older refresh resolves after a newer reset.
    let release;
    const hold = new Promise((resolve) => { release = resolve; });
    const listAudit = service.listAudit.bind(service);
    let delayed = false;
    service.listAudit = async (...args) => { const result = await listAudit(...args); if (!delayed) { delayed = true; await hold; } return result; };
    window.dispatchEvent(new Event('tnp-preview-change'));
    await sleep(100);
    byText('button', 'Reset preview').click();
    await until(() => ws() && /Preview generation 1/.test(ws().textContent), 'generation 1 after reset');
    release();
    await sleep(600);
    service.listAudit = listAudit;
    check('race: late pre-reset refresh is ignored', /Preview generation 1/.test(ws().textContent) && /Audit entries\s*1/i.test(ws().textContent), ws().querySelector('h3')?.textContent);
    check('reset: Reports-local view, filters and export message are discarded', byText('button', 'Staffing coverage', ws()).getAttribute('aria-pressed') === 'true' && field('Search functions or positions').value === '' && status() === '');
    check('reset: Reports stays the current section', byText('aside.admin-sidebar button', 'Reports & audit').getAttribute('aria-current') === 'page');

    // Loading / empty / error / retry through the shared preview control.
    const variant = document.querySelector('select[aria-label="Synthetic preview state"]');
    setValue(variant, 'error');
    await until(() => !ws() && byText('button', 'Retry preview query'), 'error state');
    check('error: deterministic error with retry control', Boolean(byText('button', 'Retry preview query')) && !byText('button', 'Retry preview query').disabled);
    byText('button', 'Retry preview query').click();
    await sleep(300);
    check('error: retry while still failing stays in error, no stale report', !ws() && Boolean(byText('button', 'Retry preview query')));
    setValue(variant, 'empty');
    await until(() => /No sample Operations events are available/.test(document.body.textContent), 'empty state');
    check('empty: scenario-empty state shown, no report rows', !ws());
    setValue(variant, 'loading');
    await until(() => /loading state/.test(document.body.textContent), 'loading state');
    check('loading: busy state with disabled retry', byText('button', 'Retry preview query')?.disabled === true && document.querySelector('[aria-busy="true"]'));
    setValue(variant, 'ready');
    await until(() => ws()?.getAttribute('aria-label') === 'Reports & audit workspace', 'ready again');
    check('ready: Reports returns with current generation', /Preview generation 1/.test(ws().textContent));
    check('layout: no horizontal page overflow', document.documentElement.scrollWidth <= window.innerWidth, `${document.documentElement.scrollWidth} > ${window.innerWidth}`);
  } catch (error) {
    check('script completed', false, String(error));
  }
  const failed = results.filter((item) => !item.ok);
  return { passed: results.length - failed.length, failed: failed.length, results: failed.length ? results : results.map((item) => item.name) };
})();
