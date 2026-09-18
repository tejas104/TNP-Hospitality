// Guest import preview: column mapping, row validation, in-file duplicates and
// conflicts with existing guests. Guests are never matched on name alone and a
// shared phone number never merges households.

import { parseCsv } from './csv.ts';
import type { FunctionEvent, Member, Party, Priority } from './model.ts';

export const IMPORT_FIELDS = [
  { key: 'guest_ref', label: 'Guest reference', required: false, hint: 'Stable ID from your source list. Re-importing the same reference is skipped, not duplicated.' },
  { key: 'party_name', label: 'Party / household', required: true, hint: 'Rows with the same party name and reference (or phone) form one household.' },
  { key: 'member_name', label: 'Guest name', required: true, hint: 'One row per person.' },
  { key: 'age_band', label: 'Adult / child', required: false, hint: 'adult or child; blank means adult.' },
  { key: 'phone', label: 'Phone', required: false, hint: 'Include the country code. Households may share one number.' },
  { key: 'email', label: 'Email', required: false, hint: 'Optional.' },
  { key: 'functions', label: 'Invited functions', required: true, hint: 'Function names separated by semicolons, or "all".' },
  { key: 'allowed_accompanying', label: 'Allowed accompanying', required: false, hint: 'Whole number; blank uses party size minus one.' },
  { key: 'priority', label: 'Priority', required: false, hint: 'standard, vip or vvip.' },
  { key: 'language', label: 'Language', required: false, hint: 'Preferred calling language.' },
] as const;

export type ImportField = (typeof IMPORT_FIELDS)[number]['key'];
export type ColumnMapping = Partial<Record<ImportField, number>>;

const SYNONYMS: Record<ImportField, string[]> = {
  guest_ref: ['guest_ref', 'guest reference', 'reference', 'ref', 'guest id', 'id'],
  party_name: ['party_name', 'party', 'household', 'family', 'party name', 'group'],
  member_name: ['member_name', 'guest name', 'name', 'guest', 'member', 'full name'],
  age_band: ['age_band', 'age', 'adult/child', 'age band', 'type'],
  phone: ['phone', 'mobile', 'contact', 'whatsapp', 'phone number'],
  email: ['email', 'e-mail', 'mail'],
  functions: ['functions', 'invited functions', 'events', 'function'],
  allowed_accompanying: ['allowed_accompanying', 'allowed', 'plus ones', 'accompanying'],
  priority: ['priority', 'vip', 'tier'],
  language: ['language', 'lang'],
};

export const SAMPLE_TEMPLATE =
  'guest_ref,party_name,member_name,age_band,phone,email,functions,allowed_accompanying,priority,language\r\n' +
  'SAMPLE-001,Sample household,Sample Guest One,adult,+91 55501 00001,guest.one@example.test,all,1,standard,English\r\n' +
  'SAMPLE-001,Sample household,Sample Guest Two,child,+91 55501 00001,,all,1,standard,English\r\n';

const norm = (s: string) => s.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();

export function autoMap(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  const used = new Set<number>();
  for (const field of IMPORT_FIELDS) {
    const exact = headers.findIndex((h, i) => !used.has(i) && norm(h) === field.key);
    const chosen = exact >= 0 ? exact : headers.findIndex((h, i) => !used.has(i) && SYNONYMS[field.key].includes(norm(h).replace(/_/g, ' ')));
    if (chosen >= 0) {
      mapping[field.key] = chosen;
      used.add(chosen);
    }
  }
  return mapping;
}

export type RowIssue = { field: ImportField | 'row'; reason: string; guidance: string };
export type RowStatus = 'ready' | 'invalid' | 'duplicate' | 'existing' | 'review';

export type PreviewRow = {
  rowNumber: number; // line number in the file, header = 1
  key: string; // stable per file row for retry identity
  values: Record<ImportField, string>;
  partyKey: string;
  status: RowStatus;
  issues: RowIssue[];
  warnings: string[];
  functionIds: string[];
};

export type ImportPreview = {
  headers: string[];
  mapping: ColumnMapping;
  rows: PreviewRow[];
  fileErrors: string[];
  counts: Record<RowStatus, number>;
  plannedParties: number;
};

const PRIORITIES: Priority[] = ['standard', 'vip', 'vvip'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function previewImport(
  text: string,
  mappingOverride: ColumnMapping | null,
  ctx: { functions: FunctionEvent[]; parties: Party[]; members: Member[] },
): ImportPreview {
  const parsed = parseCsv(text);
  const fileErrors = parsed.errors.map((e) => `Line ${e.line}: ${e.message}`);
  const [header, ...body] = parsed.rows;
  const empty = { ready: 0, invalid: 0, duplicate: 0, existing: 0, review: 0 };
  if (!header) return { headers: [], mapping: {}, rows: [], fileErrors: [...fileErrors, 'The file has no header row.'], counts: empty, plannedParties: 0 };
  const headers = header.cells.map((h) => h.trim());
  const mapping = mappingOverride ?? autoMap(headers);
  for (const f of IMPORT_FIELDS) {
    if (f.required && mapping[f.key] === undefined) fileErrors.push(`Missing column for "${f.label}". Map a column or add a "${f.key}" header.`);
  }
  const fnByName = new Map(ctx.functions.map((f) => [norm(f.name), f.id]));
  const existingRefs = new Map(ctx.parties.map((p) => [norm(p.ref), p]));
  const seenMembers = new Map<string, number>();
  const rows: PreviewRow[] = body.map(({ line, cells }) => {
    const values = Object.fromEntries(IMPORT_FIELDS.map((f) => [f.key, mapping[f.key] === undefined ? '' : (cells[mapping[f.key] as number] ?? '').trim()])) as Record<ImportField, string>;
    const issues: RowIssue[] = [];
    const warnings: string[] = [];
    if (cells.length !== headers.length) warnings.push(`Row has ${cells.length} values but the header has ${headers.length}.`);
    for (const f of IMPORT_FIELDS) {
      if (f.required && mapping[f.key] !== undefined && !values[f.key]) issues.push({ field: f.key, reason: `${f.label} is empty`, guidance: `Enter a value for ${f.label}.` });
    }
    if (values.age_band && !['adult', 'child'].includes(values.age_band.toLowerCase())) {
      issues.push({ field: 'age_band', reason: `"${values.age_band}" is not adult or child`, guidance: 'Use adult or child.' });
    }
    if (values.priority && !PRIORITIES.includes(values.priority.toLowerCase() as Priority)) {
      issues.push({ field: 'priority', reason: `"${values.priority}" is not a known priority`, guidance: 'Use standard, vip or vvip.' });
    }
    if (values.email && !EMAIL.test(values.email)) issues.push({ field: 'email', reason: 'Email address is not valid', guidance: 'Correct the email or leave it blank.' });
    if (values.phone && values.phone.replace(/\D/g, '').length < 8) issues.push({ field: 'phone', reason: 'Phone number is too short', guidance: 'Include the country code and full number.' });
    if (values.allowed_accompanying && !/^\d+$/.test(values.allowed_accompanying)) {
      issues.push({ field: 'allowed_accompanying', reason: 'Allowed accompanying must be a whole number', guidance: 'Enter 0 or a positive whole number.' });
    }
    let functionIds: string[] = [];
    if (values.functions) {
      if (norm(values.functions) === 'all') functionIds = ctx.functions.map((f) => f.id);
      else {
        const names = values.functions.split(';').map((s) => s.trim()).filter(Boolean);
        const unknown = names.filter((n) => !fnByName.has(norm(n)));
        if (unknown.length) {
          issues.push({ field: 'functions', reason: `Unknown function: ${unknown.join(', ')}`, guidance: `Use ${ctx.functions.map((f) => f.name).join('; ')} or "all".` });
        }
        functionIds = names.map((n) => fnByName.get(norm(n))).filter((x): x is string => Boolean(x));
      }
    }
    const partyKey = values.guest_ref ? `ref:${norm(values.guest_ref)}` : `party:${norm(values.party_name)}|${values.phone.replace(/\D/g, '')}`;
    let status: RowStatus = issues.length ? 'invalid' : 'ready';
    if (status === 'ready') {
      const memberKey = `${partyKey}|${norm(values.member_name)}`;
      const first = seenMembers.get(memberKey);
      if (first !== undefined) {
        status = 'duplicate';
        issues.push({ field: 'member_name', reason: `Same guest already appears on row ${first} of this file`, guidance: 'Remove the repeated row, or give each person a distinct name.' });
      } else seenMembers.set(memberKey, line);
    }
    if (status === 'ready' && values.guest_ref && existingRefs.has(norm(values.guest_ref))) {
      status = 'existing';
      warnings.push(`Reference ${existingRefs.get(norm(values.guest_ref))?.ref} already exists — skipped so re-import does not duplicate it.`);
    }
    if (status === 'ready' && !values.guest_ref) {
      const digits = values.phone.replace(/\D/g, '');
      const samePhone = digits ? ctx.parties.filter((p) => p.phone.replace(/\D/g, '') === digits) : [];
      const sameName = samePhone.filter((p) => ctx.members.some((m) => m.partyId === p.id && !m.removed && norm(m.name) === norm(values.member_name)));
      if (sameName.length) {
        status = 'review';
        warnings.push(`Possible existing guest in ${sameName.map((p) => p.ref).join(', ')} (same phone and name). Not merged — staff must review.`);
      } else if (samePhone.length) {
        warnings.push(`Shares a phone with ${samePhone.map((p) => p.ref).join(', ')}. Households may share numbers; imported as a separate party.`);
      }
    }
    return { rowNumber: line, key: `${line}:${values.guest_ref}|${norm(values.party_name)}|${norm(values.member_name)}`, values, partyKey, status, issues, warnings, functionIds };
  });
  const counts = { ...empty };
  for (const r of rows) counts[r.status] += 1;
  const plannedParties = new Set(rows.filter((r) => r.status === 'ready').map((r) => r.partyKey)).size;
  return { headers, mapping, rows, fileErrors, counts, plannedParties };
}
