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

const activePresentationFiles = ['app', 'components', 'data', 'lib'].flatMap((root) =>
  productionFiles(path.join(projectRoot, root)),
);

const namedColors = new Map(Object.entries({
  aqua: [0, 255, 255], aquamarine: [127, 255, 212], cadetblue: [95, 158, 160], chartreuse: [127, 255, 0],
  cyan: [0, 255, 255], darkcyan: [0, 139, 139], darkgreen: [0, 100, 0], darkolivegreen: [85, 107, 47],
  darkseagreen: [143, 188, 143], darkturquoise: [0, 206, 209], forestgreen: [34, 139, 34], green: [0, 128, 0],
  greenyellow: [173, 255, 47], lawngreen: [124, 252, 0], lightgreen: [144, 238, 144], lightseagreen: [32, 178, 170],
  lime: [0, 255, 0], limegreen: [50, 205, 50], mediumaquamarine: [102, 205, 170], mediumseagreen: [60, 179, 113],
  mediumspringgreen: [0, 250, 154], mediumturquoise: [72, 209, 204], olive: [128, 128, 0], olivedrab: [107, 142, 35],
  palegreen: [152, 251, 152], seagreen: [46, 139, 87], springgreen: [0, 255, 127], teal: [0, 128, 128],
  turquoise: [64, 224, 208], yellowgreen: [154, 205, 50],
}));

const byte = (value) => Math.round(Math.min(1, Math.max(0, value)) * 255);

function hueDegrees(value) {
  if (value.endsWith('turn')) return parseFloat(value) * 360;
  if (value.endsWith('rad')) return parseFloat(value) * 180 / Math.PI;
  return parseFloat(value);
}

function hslToRgb(hue, saturation, lightness) {
  const h = ((hue % 360) + 360) % 360 / 360;
  const s = saturation / 100;
  const l = lightness / 100;
  const channel = (offset) => {
    const k = (offset + h * 12) % 12;
    return l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [byte(channel(0)), byte(channel(8)), byte(channel(4))];
}

function oklabToRgb(lightness, a, b) {
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return linear.map((value) => byte(value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055));
}

function functionalColor(literal) {
  const name = literal.slice(0, literal.indexOf('(')).toLowerCase();
  const channels = literal.slice(literal.indexOf('(') + 1, -1).trim().split(/[\s,/]+/).filter(Boolean);
  if (name === 'rgb' || name === 'rgba') {
    if (channels.length < 3 || channels.slice(0, 3).some((channel) => !/^[-+]?\d*\.?\d+%?$/.test(channel))) return null;
    return channels.slice(0, 3).map((channel) => Math.round(parseFloat(channel) * (channel.endsWith('%') ? 2.55 : 1)));
  }
  if (name === 'hsl' || name === 'hsla') {
    if (channels.length < 3 || !channels[1].endsWith('%') || !channels[2].endsWith('%')) return null;
    return hslToRgb(hueDegrees(channels[0]), parseFloat(channels[1]), parseFloat(channels[2]));
  }
  if (name === 'oklab' || name === 'oklch') {
    if (channels.length < 3) return null;
    const lightness = parseFloat(channels[0]) / (channels[0].endsWith('%') ? 100 : 1);
    if (name === 'oklab') return oklabToRgb(lightness, parseFloat(channels[1]), parseFloat(channels[2]));
    const chroma = parseFloat(channels[1]);
    const hue = hueDegrees(channels[2]) * Math.PI / 180;
    return oklabToRgb(lightness, chroma * Math.cos(hue), chroma * Math.sin(hue));
  }
  return null;
}

function colors(source) {
  const cssColors = [...source.matchAll(/#[\da-f]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)|okl(?:ab|ch)\([^)]*\)/gi)].flatMap(([literal]) => {
    if (literal.startsWith('#')) {
      const hex = literal.slice(1);
      if (![3, 4, 6, 8].includes(hex.length)) return [];
      const full = hex.length < 5 ? [...hex].map((digit) => digit + digit).join('') : hex;
      return [{ literal, rgb: [0, 2, 4].map((index) => parseInt(full.slice(index, index + 2), 16)) }];
    }
    const rgb = functionalColor(literal);
    return rgb ? [{ literal, rgb }] : [];
  });
  const names = [...namedColors.keys()].join('|');
  const namedPattern = new RegExp(`(?:^|[;{]\\s*)(?:color|background(?:-color)?|border(?:-[a-z]+)?-color|outline-color|fill|stroke)\\s*:\\s*(${names})\\b|(?:^|[,{]\\s*)(?:color|backgroundColor|borderColor|outlineColor|fill|stroke)\\s*:\\s*["'](${names})["']|(?:^|[\\s<{])(?:color|emissive|fill|stroke)\\s*=\\s*["'](${names})["']|(?:new\\s+Color|setStyle)\\(\\s*["'](${names})["']\\s*\\)`, 'gi');
  const named = [...source.matchAll(namedPattern)].map((match) => {
    const literal = match.slice(1).find(Boolean);
    return { literal, rgb: namedColors.get(literal.toLowerCase()) };
  });
  const numeric = [...source.matchAll(/(?:color|emissive)\s*=\s*\{\s*(0x[\da-f]{6}|\d{5,})\s*\}|(?:new\s+Color|setHex|\b[\w$]*light[\w$]*\.color\.set)\(\s*(0x[\da-f]{6}|\d{5,})\s*\)/gi)].map((match) => {
    const value = Number(match[1] ?? match[2]);
    return { literal: match[0], rgb: [value >> 16 & 255, value >> 8 & 255, value & 255] };
  });
  const arrays = [...source.matchAll(/(?:color|emissive)\s*=\s*\{\s*\[\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\s*\]\s*\}|setRGB\(\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\s*\)/gi)].map((match) => {
    const channels = (match[1] ? match.slice(1, 4) : match.slice(4, 7)).map(Number);
    return { literal: match[0], rgb: channels.map((channel) => channel <= 1 ? byte(channel) : Math.round(channel)) };
  });
  const constructorColors = [...source.matchAll(/new\s+(?:AmbientLight|DirectionalLight|HemisphereLight|PointLight|RectAreaLight|SpotLight)\s*\(([^)]*)\)/gi)].flatMap((match) =>
    [...match[1].matchAll(/0x[\da-f]{6}\b/gi)].map(([literal]) => {
      const value = Number(literal);
      return { literal, rgb: [value >> 16 & 255, value >> 8 & 255, value & 255] };
    }),
  );
  return [...cssColors, ...named, ...numeric, ...arrays, ...constructorColors];
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
    const token = value.match(/var\(--([^)]+)\)/)?.[1];
    const tokenValue = token
      ? read('app/globals.css').match(new RegExp(`--${token}:\\s*([^;]+);`, 'i'))?.[1]
      : null;
    const color = colors(value)[0] ?? (tokenValue ? colors(tokenValue)[0] : null);
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
  const operationsFile = 'components/tnp/portals/operations/AdminOperations.module.css';
  const beigeToken = read('app/globals.css').match(/--beige:\s*(#[\da-f]+);/i)?.[1];
  assert.equal(beigeToken?.toLowerCase(), '#e5e1cd', 'Operations beige-card substrate');
  const beige = colors(beigeToken)[0].rgb;
  const cardKicker = property(block(operationsFile, '.decisionCard :global(.section-kicker), .controlForm :global(.section-kicker), .evidenceCard :global(.section-kicker), .auditPanel :global(.section-kicker)'), 'color');
  assert.ok(ratio(cardKicker, beige) >= 4.5, 'Operations beige-card kickers');
  const secondary = property(block(operationsFile, '.queueRow span, .queueRow small, .mutedDark'), 'color');
  assert.ok(ratio(secondary, beige) >= 4.5, 'Operations beige-card secondary text');
  const skipFocus = property(block('components/tnp/portals/client/ClientExperience.module.css', '.clientRoot .skip:focus-visible'), 'outline-color');
  assert.ok(ratio(skipFocus, teal) >= 3, 'Client skip-link focus on teal');
  const livePanelFocus = property(block('app/globals.css', '.admin-shell .live-ops-panel :where(a, button, input, select, textarea):focus-visible'), 'outline-color');
  assert.ok(ratio(livePanelFocus, beige) >= 3, 'Operations live-panel focus on beige');
  const freelancerFile = 'components/tnp/portals/freelancer/FreelancerPortal.module.css';
  const ivory = colors('#f5f1e7')[0].rgb;
  const workspaceFocus = property(block(freelancerFile, '.workspace :is(button, a, input, select):focus-visible'), 'outline');
  assert.ok(ratio(workspaceFocus, ivory) >= 3, 'Freelancer workspace focus on ivory');
  const panelFocusSelector = '.journey :is(button, a, input, select):focus-visible,\n.opportunityDetail :is(button, a, input, select):focus-visible';
  const panelFocus = property(block(freelancerFile, panelFocusSelector), 'outline-color');
  assert.ok(ratio(panelFocus, teal) >= 3, 'Freelancer panel focus on teal');
  for (const selector of [
    '.journey',
    '.journey .eyebrow',
    '.journey > p:not(.eyebrow)',
    '.journey li',
    '.journey li small',
    '.journeyNote',
    '.opportunityDetail',
    '.detailEmpty p',
    '.detailEmpty > span',
    '.detailHeader .eyebrow',
    '.detailVenue',
    '.detailFacts dt',
    '.detailFacts small',
    '.opportunityDetail > .note',
  ]) {
    assert.ok(ratio(property(block(freelancerFile, selector), 'color'), teal) >= 4.5, `${selector} text on teal`);
  }
  for (const [selector, name] of [
    ['.journey li > span', 'border'],
    ['.journeyNote', 'border-top'],
    ['.detailEmpty > svg', 'color'],
    ['.iconButton', 'border'],
    ['.detailFacts > div', 'border-top'],
    ['.detailEligibility svg', 'color'],
    ['.updated', 'border-left'],
  ]) {
    assert.ok(ratio(property(block(freelancerFile, selector), name), teal) >= 3, `${selector} ${name} on teal`);
  }
});

test('palette detection rejects alternate syntax and unlisted green while accepting brand and neutral ink', () => {
  for (const source of ['#062b29', '#0c3c38', '#13483f', '#a8c4ac', 'rgba(6, 43, 41, .9)', 'rgb(8 61 54)', 'rgb(3.137% 23.922% 21.176% / 50%)', 'hsl(170 74% 13%)', 'oklch(32% .06 175)', 'color: darkgreen;', '{ color: "darkgreen" }', '<path fill="forestgreen" />', 'new HemisphereLight(0xffffff, 0x154f44)', 'light.color.set(0x154f44)', 'color={0x062b29}', 'color={[0.024, 0.169, 0.161]}']) {
    assert.ok(colors(source).some(({ rgb }) => unapprovedGreen(rgb)), source);
  }
  for (const source of ['#008080', '#006b6b', 'color: teal;', 'hsl(180 100% 25%)', 'rgba(0,128,128,.1)', '#202423', '#59615f', '#f5f1e7']) {
    assert.ok(colors(source).every(({ rgb }) => !unapprovedGreen(rgb)), source);
  }
  for (const source of ['data-color="limegreen"', 'data-fill="forestgreen"', 'data-stroke="darkgreen"', 'material.color.set(0x13483f)']) {
    assert.deepEqual(colors(source), [], source);
  }
});

test('Operations interaction states distinguish pressed and unavailable controls', () => {
  const operationsCss = readFileSync(path.join(projectRoot, 'components', 'tnp', 'portals', 'operations', 'AdminOperations.module.css'), 'utf8');
  const globalCss = readFileSync(path.join(projectRoot, 'app', 'globals.css'), 'utf8');
  assert.match(operationsCss, /\.navButton:disabled\s*\{[^}]*background:\s*#006b6b;[^}]*border-left-color:\s*#bba879;/s);
  assert.match(operationsCss, /\.navButton:active:not\(:disabled\)\s*\{[^}]*box-shadow:/s);
  assert.match(operationsCss, /\.compactNav button:active\s*\{[^}]*background:\s*#006b6b;/s);
  assert.match(operationsCss, /\.eventTabs > button:active\s*\{[^}]*background:\s*#006b6b;/s);
  assert.match(globalCss, /\.admin-shell \.live-ops-panel \.magnetic-btn:active:not\(:disabled\)\s*\{[^}]*box-shadow:/s);
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
