// Dependency-free report exporters for the admin demo: a real .xlsx
// (stored ZIP + SpreadsheetML) and a simple text-table .pdf. Synthetic data
// only; files are built in the browser and never uploaded.
export type Cell = string | number;
export type Table = { title: string; head: string[]; rows: Cell[][] };

const encoder = new TextEncoder();
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
export function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const b of bytes) crc = CRC_TABLE[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

/** Minimal ZIP writer (STORED entries) — enough for an Office Open XML file. */
export function zip(files: { name: string; data: string }[]) {
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const file of files) {
    const name = encoder.encode(file.name);
    const data = encoder.encode(file.data);
    const crc = crc32(data);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, data.length, true);
    local.setUint32(22, data.length, true);
    local.setUint16(26, name.length, true);
    const header = new DataView(new ArrayBuffer(46));
    header.setUint32(0, 0x02014b50, true);
    header.setUint16(4, 20, true);
    header.setUint16(6, 20, true);
    header.setUint32(16, crc, true);
    header.setUint32(20, data.length, true);
    header.setUint32(24, data.length, true);
    header.setUint16(28, name.length, true);
    header.setUint32(42, offset, true);
    parts.push(new Uint8Array(local.buffer), name, data);
    central.push(new Uint8Array(header.buffer), name);
    offset += 30 + name.length + data.length;
  }
  const size = central.reduce((n, p) => n + p.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, size, true);
  end.setUint32(16, offset, true);
  return new Blob([...parts, ...central, new Uint8Array(end.buffer)] as BlobPart[], {
    type: 'application/zip',
  });
}

const xml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
const column = (index: number) => {
  let name = '';
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26))
    name = String.fromCharCode(65 + ((n - 1) % 26)) + name;
  return name;
};
// Neutralise spreadsheet formula injection in text cells.
export const safeText = (value: string) =>
  /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;

function sheetXml(table: Table) {
  const rows = [[table.title], [], table.head, ...table.rows].map(
    (row, r) =>
      `<row r="${r + 1}">${row
        .map((cell, c) => {
          const ref = `${column(c)}${r + 1}`;
          return typeof cell === 'number'
            ? `<c r="${ref}"><v>${cell}</v></c>`
            : `<c r="${ref}" t="inlineStr"><is><t>${xml(safeText(String(cell)))}</t></is></c>`;
        })
        .join('')}</row>`,
  );
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows.join('')}</sheetData></worksheet>`;
}

export function toXlsx(tables: Table[]) {
  const sheets = tables.map((t, i) => ({
    name: t.title.replace(/[\\/?*[\]:]/g, ' ').slice(0, 31) || `Sheet ${i + 1}`,
    xml: sheetXml(t),
  }));
  return zip([
    {
      name: '[Content_Types].xml',
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${sheets
        .map(
          (_, i) =>
            `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
        )
        .join('')}</Types>`,
    },
    {
      name: '_rels/.rels',
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    },
    {
      name: 'xl/workbook.xml',
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets
        .map(
          (s, i) =>
            `<sheet name="${xml(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`,
        )
        .join('')}</sheets></workbook>`,
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets
        .map(
          (_, i) =>
            `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`,
        )
        .join('')}</Relationships>`,
    },
    ...sheets.map((s, i) => ({
      name: `xl/worksheets/sheet${i + 1}.xml`,
      data: s.xml,
    })),
  ]);
}

// PDF text must be Latin-1; replace the rupee sign and other symbols.
const pdfText = (value: string) =>
  value
    .replace(/₹/g, 'Rs ')
    .replace(/[–—]/g, '-')
    .replace(/[·•]/g, '-')
    .replace(/[^\x20-\x7e]/g, '')
    .replace(/[\\()]/g, (m) => `\\${m}`);

/** Simple multi-page A4 PDF with a title, a note and fixed-width columns. */
export function toPdf(tables: Table[], note: string) {
  const lines: { text: string; size: number; bold?: boolean }[] = [];
  for (const table of tables) {
    lines.push({ text: table.title, size: 15, bold: true });
    lines.push({ text: note, size: 8 });
    const widths = table.head.map((h, c) =>
      Math.min(
        34,
        Math.max(h.length, ...table.rows.map((r) => String(r[c] ?? '').length)),
      ),
    );
    const format = (row: Cell[]) =>
      row
        .map((cell, c) => String(cell ?? '').slice(0, widths[c]).padEnd(widths[c]))
        .join('  ');
    lines.push({ text: format(table.head), size: 8, bold: true });
    for (const row of table.rows) lines.push({ text: format(row), size: 8 });
    lines.push({ text: '', size: 8 });
  }
  const pages: string[] = [];
  let y = 800;
  let stream = '';
  for (const line of lines) {
    const step = line.size + 6;
    if (y - step < 40) {
      pages.push(stream);
      stream = '';
      y = 800;
    }
    y -= step;
    stream += `BT /${line.bold ? 'F2' : 'F1'} ${line.size} Tf 40 ${y} Td (${pdfText(line.text)}) Tj ET\n`;
  }
  pages.push(stream);
  const objects: string[] = [];
  const add = (body: string) => objects.push(body) + 0;
  add('<< /Type /Catalog /Pages 2 0 R >>');
  add(''); // pages placeholder
  add('<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>');
  add('<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold >>');
  const kids: number[] = [];
  for (const content of pages) {
    add(`<< /Length ${content.length} >>\nstream\n${content}endstream`);
    const contentId = objects.length;
    add(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`,
    );
    kids.push(objects.length);
  }
  objects[1] = `<< /Type /Pages /Kids [${kids.map((k) => `${k} 0 R`).join(' ')}] /Count ${kids.length} >>`;
  let body = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((object, i) => {
    offsets.push(body.length);
    body += `${i + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets
    .map((o) => `${String(o).padStart(10, '0')} 00000 n \n`)
    .join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([body], { type: 'application/pdf' });
}

export function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
