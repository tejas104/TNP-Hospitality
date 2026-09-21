import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  approveApplicant,
  earnings,
  quoteFromRequest,
  quoteTotals,
  seedAdmin,
} from '../components/tnp/portals/admin/adminData.ts';
import {
  crc32,
  safeText,
  toPdf,
  toXlsx,
} from '../components/tnp/portals/admin/exporters.ts';
import {
  checkCompliance,
  eventStats,
  personalize,
  replaceTerm,
  seedRsvpChat,
  suggestFromMessage,
} from '../components/tnp/portals/rsvp/rsvpChatData.ts';
import {
  cubicBezier,
  GENIE_EASE,
  genieAxis,
  genieSliceCount,
  genieSlices,
  LAUNCHER_TIMING,
} from '../components/tnp/public/portal-launcher/motion.ts';

const read = (path) => readFileSync(resolve(path), 'utf8');
const win = { x: 440, y: 150, width: 560, height: 600 };
const dock = { x: 1376, y: 382, width: 48, height: 136 }; // right-middle tab
const header = { x: 300, y: 12, width: 80, height: 44 }; // mobile header

test('genie geometry is identity when settled and collapses into the source', () => {
  const n = genieSliceCount(win, genieAxis(win, dock));
  for (const { from, to } of genieSlices(win, dock, 0, n))
    for (const key of ['x', 'y', 'width', 'height'])
      assert.ok(Math.abs(from[key] - to[key]) < 1e-9, key);
  const closed = genieSlices(win, dock, 1, n);
  assert.ok(closed.every((slice) => slice.hidden));
  const centre = dock.x + dock.width / 2;
  assert.ok(closed.every(({ to }) => Math.abs(to.x - centre) < 1e-6));
});

test('mid-flight the window funnels toward its own source, not a fixed origin', () => {
  const n = genieSliceCount(win, genieAxis(win, dock));
  const mid = genieSlices(win, dock, 0.55, n).filter((s) => !s.hidden);
  const far = mid[0].to;
  const near = mid.at(-1).to;
  // Far edge stays wider than the source-facing edge (curved funnel).
  assert.ok(far.height > near.height * 1.5, `${far.height} vs ${near.height}`);
  // Source-facing strips converge on the dock's vertical centre.
  const dockMid = dock.y + dock.height / 2;
  assert.ok(Math.abs(near.y + near.height / 2 - dockMid) < 60);
  // A different source changes the axis and the direction of travel.
  assert.deepEqual(genieAxis(win, dock), { along: 'x', dir: 1 });
  assert.deepEqual(genieAxis(win, header), { along: 'y', dir: -1 });
  const top = genieSlices(win, header, 1, 30);
  const headerMid = header.y + header.height / 2;
  assert.ok(top.every(({ to }) => Math.abs(to.y - headerMid) < 1e-6));
});

test('genie timing and easing follow the requested ranges', () => {
  assert.equal(LAUNCHER_TIMING.open, 1440); // half-speed open per user
  assert.equal(LAUNCHER_TIMING.close, 1240); // half-speed close per user
  // Close must visibly move early: >= 10% of the way after 20% of the time.
  assert.ok(cubicBezier(GENIE_EASE.close, 0.2) >= 0.1);
  assert.equal(cubicBezier(GENIE_EASE.open, 0), 0);
  assert.equal(cubicBezier(GENIE_EASE.open, 1), 1);
  assert.ok(Math.abs(cubicBezier([0, 0, 1, 1], 0.3) - 0.3) < 1e-3);
});

test('launcher dock escapes the transformed header and reuses GenieWindow', () => {
  const launcher = read(
    'components/tnp/public/portal-launcher/PortalLauncher.tsx',
  );
  const css = read(
    'components/tnp/public/portal-launcher/PortalLauncher.module.css',
  );
  assert.match(launcher, /createPortal\(trigger\('dock'\), host\)/);
  assert.match(launcher, /export function GenieWindow/);
  assert.match(css, /\.trigger \{\s*position: fixed;\s*right: 0;\s*top: 50%;/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  const freelancer = read(
    'components/tnp/portals/freelancer/FreelancerPortal.tsx',
  );
  assert.match(freelancer, /<GenieWindow[\s\S]*align="end"/);
  assert.match(freelancer, /not payable or withdrawable/);
  assert.doesNotMatch(freelancer, /workspaceTools/);
});

test('planner cards, admin quick actions, RSVP states and cursor stay wired', () => {
  const planner = read('components/tnp/portals/planner/PlannerEventStudio.tsx');
  assert.match(planner, /className=\{styles\.windowCard\}/);
  assert.match(planner, /role="alert"/);
  assert.doesNotMatch(planner, /alert\(/);
  const admin = read('components/tnp/portals/operations/AdminOperations.tsx');
  for (const id of ['overview', 'events', 'verification', 'finance'])
    assert.match(admin, new RegExp(`id: '${id}',\\s*label:`));
  assert.match(admin, /aria-pressed=\{panel === id\}/);
  const rsvp = read('components/tnp/portals/rsvp/RsvpWorkspace.tsx');
  assert.match(rsvp, /RSVP on WhatsApp/);
  assert.match(rsvp, /nothing was sent to WhatsApp/);
  assert.match(rsvp, /Public RSVP page/);
  const shell = read('components/tnp/AppShell.tsx');
  assert.doesNotMatch(shell, /CustomCursor/);
  assert.match(read('app/globals.css'), /html \{\s*cursor:\s*url\("data:image\/svg\+xml/);
});

test('admin rules: quotes in paise, no overfilled assignments, earnings from attendance', () => {
  const state = seedAdmin();
  const quote = quoteFromRequest(state.requests[0], 'QT-TEST', '2026-09-21');
  assert.equal(quote.lines.length, 4);
  const t = quoteTotals({ ...quote, discountPct: 10, adjustmentPaise: -5000 });
  assert.ok(Number.isInteger(t.subtotal) && Number.isInteger(t.discount));
  assert.equal(t.total, t.subtotal - Math.round(t.subtotal * 0.1) - 5000);
  const full = state.assignments.find((a) => a.approved.length === a.quantity);
  assert.throws(() => approveApplicant(full, 'fl-99'), /places are filled/);
  const open = state.assignments.find((a) => a.approved.length < a.quantity);
  assert.equal(approveApplicant(open, 'fl-99').approved.length, open.approved.length + 1);
  // fl-05 is approved as Hostess on ev-101 but marked absent: earns nothing.
  assert.equal(earnings(state, 'fl-05').earned, 0);
  // fl-10 appears only as absent at ev-099.
  assert.equal(earnings(state, 'fl-10').earned, 0);
  // fl-03 appeared at ev-101 (3 days) and is unmarked at ev-102: 3 × ₹2,500.
  assert.equal(earnings(state, 'fl-03').earned, 250000 * 3);
  assert.equal(earnings(state, 'fl-01').remaining, earnings(state, 'fl-01').earned - 450000);
});

test('exporters build a real xlsx zip and a pdf, and neutralise formulas', async () => {
  assert.equal(crc32(new TextEncoder().encode('123456789')), 0xcbf43926);
  assert.equal(safeText('=SUM(A1)'), "'=SUM(A1)");
  const table = { title: 'Test', head: ['A', 'B'], rows: [['=2+2', 3]] };
  const xlsx = new Uint8Array(await toXlsx([table]).arrayBuffer());
  assert.deepEqual(Array.from(xlsx.subarray(0, 4)), [0x50, 0x4b, 0x03, 0x04]);
  const text = new TextDecoder().decode(xlsx);
  assert.match(text, /xl\/worksheets\/sheet1\.xml/);
  assert.match(text, /'=2\+2/);
  const pdf = await toPdf([table], 'note ₹').text();
  assert.match(pdf, /^%PDF-1\.4/);
  assert.match(pdf, /%%EOF$/);
  assert.doesNotMatch(pdf, /₹/);
});

test('RSVP suggestions never decide: they only suggest and extract', () => {
  const fns = ['Mehendi', 'Sangeet', 'Reception'];
  assert.equal(suggestFromMessage('Yes, 4 of us coming for Sangeet', fns).category, 'attending');
  assert.equal(suggestFromMessage('Yes, 4 of us coming for Sangeet', fns).members, 4);
  assert.equal(suggestFromMessage('Sorry, cannot make it', fns).category, 'declined');
  assert.equal(suggestFromMessage('Maybe, will confirm', fns).category, 'maybe');
  assert.equal(suggestFromMessage('Coming for reception but sorry not sangeet', fns).category, 'needs-review');
  assert.ok(suggestFromMessage('Flight lands, need airport pickup and a room', fns).pickup);
  const state = seedRsvpChat();
  const s = eventStats(state.threads.filter((t) => t.eventId === 'lotus-evening'));
  assert.equal(s.parties, 8);
  assert.ok(s.review >= 1);
});

test('RSVP assistant blocks promotional words in Utility messages and personalises per guest', () => {
  const hits = checkCompliance('Exclusive offer: book now and get 20% off!');
  const terms = hits.map((h) => h.term).sort();
  assert.deepEqual(terms, ['% off', 'book now', 'exclusive', 'offer']);
  assert.deepEqual(checkCompliance('Please share your arrival time and window seat preference.'), []);
  let text = 'Exclusive offer: book now and get 20% off!';
  for (const hit of hits) text = replaceTerm(text, hit);
  assert.deepEqual(checkCompliance(text), []);
  const state = seedRsvpChat();
  const [a, b] = state.threads;
  assert.notEqual(a.contactName, b.contactName);
  assert.equal(personalize('Hi {name}', a), `Hi ${a.contactName}`);
  assert.equal(personalize('Hi {name}', b), `Hi ${b.contactName}`);
  assert.ok(state.logins.length >= 2 && state.senders.some((s) => s.status === 'verified'));
});
