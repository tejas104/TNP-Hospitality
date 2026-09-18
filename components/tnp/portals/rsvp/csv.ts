// RFC 4180-style CSV parsing and safe CSV export. Plain CSV only: no Excel or
// PDF library, and a .csv file is never renamed to .xlsx.

export type ParsedCsv = { rows: Array<{ line: number; cells: string[] }>; errors: Array<{ line: number; message: string }> };

export function parseCsv(text: string): ParsedCsv {
  const src = text.replace(/^﻿/, '');
  const rows: ParsedCsv['rows'] = [];
  const errors: ParsedCsv['errors'] = [];
  let cells: string[] = [];
  let cell = '';
  let quoted = false;
  let line = 1;
  let rowLine = 1;
  let quoteStart = 0;
  const endRow = () => {
    cells.push(cell);
    // Blank rows (only empty cells) are skipped, but keep their line numbering.
    if (cells.some((c) => c.trim() !== '')) rows.push({ line: rowLine, cells });
    cells = [];
    cell = '';
  };
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else {
        if (ch === '\n') line++;
        cell += ch;
      }
      continue;
    }
    if (ch === '"' && cell === '') {
      quoted = true;
      quoteStart = line;
    } else if (ch === ',') {
      cells.push(cell);
      cell = '';
    } else if (ch === '\r') {
      if (src[i + 1] === '\n') i++;
      endRow();
      line++;
      rowLine = line;
    } else if (ch === '\n') {
      endRow();
      line++;
      rowLine = line;
    } else cell += ch;
  }
  if (quoted) errors.push({ line: quoteStart, message: 'A quoted value is never closed; the rest of the file could not be read safely.' });
  else if (cell !== '' || cells.length > 0) endRow();
  return { rows, errors };
}

/** Neutralizes spreadsheet formula injection (=, +, -, @, tab, CR prefixes). */
export function neutralizeCell(value: string) {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

export function toCsv(rows: string[][]) {
  return rows
    .map((row) =>
      row
        .map((raw) => {
          const v = neutralizeCell(raw ?? '');
          return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
        })
        .join(','),
    )
    .join('\r\n');
}
