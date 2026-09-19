import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const projectRoot = path.resolve(import.meta.dirname, '..');

function productionFiles(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) return productionFiles(target);
    if (/\.test\.[cm]?[jt]sx?$/.test(entry.name)) return [];
    return /\.(?:css|scss|sass|less|[cm]?[jt]sx?)$/.test(entry.name) ? [target] : [];
  });
}

const activePresentationFiles = ['app', 'components', 'data'].flatMap((root) =>
  productionFiles(path.join(projectRoot, root)),
);

function colors(source) {
  return [...source.matchAll(/#[\da-f]{3,8}\b|rgba?\([^)]*\)/gi)].flatMap(([literal]) => {
    if (literal.startsWith('#')) {
      const hex = literal.slice(1);
      if (![3, 4, 6, 8].includes(hex.length)) return [];
      const full = hex.length < 5 ? [...hex].map((digit) => digit + digit).join('') : hex;
      return [{ literal, rgb: [0, 2, 4].map((index) => parseInt(full.slice(index, index + 2), 16)) }];
    }
    const channels = literal.slice(literal.indexOf('(') + 1, -1).trim().split(/[\s,/]+/).slice(0, 3);
    if (channels.length !== 3 || channels.some((channel) => !/^\d*\.?\d+%?$/.test(channel))) return [];
    return [{ literal, rgb: channels.map((channel) => Math.round(parseFloat(channel) * (channel.endsWith('%') ? 2.55 : 1))) }];
  });
}

function unapprovedGreen(rgb) {
  if (['0,128,128', '0,107,107'].includes(rgb.join(','))) return false;
  const [r, g, b] = rgb.map((channel) => channel / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
  if (delta < 0.06) return false;
  const saturation = delta / (1 - Math.abs(max + min - 1));
  const hue = ((max === r ? (g - b) / delta : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4) * 60 + 360) % 360;
  // Low-chroma ink/stone neutrals are not branded green surfaces.
  return saturation >= 0.18 && hue >= 80 && hue <= 190;
}

test('active production presentation sources contain no former green palette literals', () => {
  for (const file of activePresentationFiles) {
    const source = readFileSync(file, 'utf8');
    const forbidden = colors(source).filter(({ rgb }) => unapprovedGreen(rgb));
    assert.deepEqual(forbidden, [], `${path.relative(projectRoot, file)} contains unapproved green colors`);
  }
});

test('semantic primary and legacy brand aliases resolve to exact client teal', () => {
  const globalCss = readFileSync(
    path.join(projectRoot, 'app', 'globals.css'),
    'utf8',
  );
  for (const token of ['primary', 'teal', 'deep', 'dark', 'black-teal']) {
    const declarations = activePresentationFiles.flatMap((file) => [...readFileSync(file, 'utf8').matchAll(new RegExp(`--${token}:\\s*([^;]+);`, 'gi'))]);
    assert.ok(declarations.length > 0, `missing ${token}`);
    for (const declaration of declarations) assert.equal(declaration[1].trim().toLowerCase(), '#008080', token);
  }
  assert.match(globalCss, /--primary-hover:\s*#006b6b;/i);
  assert.match(globalCss, /\.hero-section\s*\{[^}]*background:\s*#008080;/s);
});

test('corrected solid surface text and focus colors retain AA contrast', () => {
  const read = (file) => readFileSync(path.join(projectRoot, file), 'utf8');
  const block = (file, selector) => {
    const source = read(file);
    const start = source.indexOf(`${selector} {`);
    assert.ok(start >= 0, selector);
    return source.slice(start, source.indexOf('}', start) + 1);
  };
  const property = (rule, name) => {
    const value = rule.match(new RegExp(`(?:^|[;{])\\s*${name}:\\s*([^;]+)`))?.[1];
    assert.ok(value, `${name}: ${rule}`);
    const color = colors(value)[0];
    assert.ok(color, `${name} must use a measurable solid color`);
    return color.rgb;
  };
  const luminance = (rgb) => rgb.map((v) => v / 255).map((v) => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, index) => sum + v * [.2126, .7152, .0722][index], 0);
  const ratio = (a, b) => (Math.max(luminance(a), luminance(b)) + .05) / (Math.min(luminance(a), luminance(b)) + .05);
  for (const [file, selector] of [
    ['app/globals.css', '.preview-notice'],
    ['components/tnp/portals/client/ClientStatusHub.module.css', '.viewState'],
    ['components/tnp/portals/planner/PlannerRequirements.module.css', '.state'],
    ['components/tnp/shared/PreviewControls.tsx', '.preview-control-panel'],
    ['app/globals.css', '.assessment-result .status-pill.green'],
  ]) {
    const rule = block(file, selector);
    assert.ok(ratio(property(rule, 'color'), property(rule, 'background')) >= 4.5, selector);
  }
  const teal = property(block('app/globals.css', '.admin-shell'), 'background');
  const focus = property(block('components/tnp/portals/planner/PlannerRequirements.module.css', '.section .state button:focus-visible'), 'outline');
  assert.ok(ratio(focus, teal) >= 3, 'retry focus on teal');
  const clientHubFile = 'components/tnp/portals/client/ClientStatusHub.module.css';
  const hub = block(clientHubFile, '.hub');
  assert.match(hub, /background:\s*var\(--dark\);/);
  const darkToken = read('app/globals.css').match(/--dark:\s*(#[\da-f]+);/i)?.[1];
  assert.ok(darkToken, 'Client hub background token must resolve');
  const kicker = property(block(clientHubFile, '.header :global(.section-kicker)'), 'color');
  assert.ok(ratio(kicker, colors(darkToken)[0].rgb) >= 4.5, 'Client event and finance status kicker on hub background');
});

test('palette detection rejects alternate syntax and unlisted green while accepting brand and neutral ink', () => {
  for (const source of ['#062b29', '#0c3c38', '#13483f', '#a8c4ac', 'rgba(6, 43, 41, .9)', 'rgb(8 61 54)', 'rgb(3.137% 23.922% 21.176% / 50%)']) {
    assert.ok(colors(source).some(({ rgb }) => unapprovedGreen(rgb)), source);
  }
  for (const source of ['#008080', '#006b6b', 'rgba(0,128,128,.1)', '#202423', '#59615f', '#f5f1e7']) {
    assert.ok(colors(source).every(({ rgb }) => !unapprovedGreen(rgb)), source);
  }
});

test('integrated homepage hero and all fallback continuity use exact client teal', () => {
  const homeCss = readFileSync(
    path.join(projectRoot, 'components', 'tnp', 'public', 'Home.module.css'),
    'utf8',
  );
  const destinationMotion = readFileSync(
    path.join(
      projectRoot,
      'components',
      'tnp',
      'public',
      'destination-motion.ts',
    ),
    'utf8',
  );
  assert.match(homeCss, /\.hero\s*\{[^}]*background:\s*#008080;/s);
  assert.match(destinationMotion, /'--hero-surface':\s*'#008080'/);
});
