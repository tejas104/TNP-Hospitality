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
    return /\.(?:css|ts|tsx)$/.test(entry.name) ? [target] : [];
  });
}

const activePresentationFiles = [
  path.join(projectRoot, 'app', 'globals.css'),
  ...productionFiles(path.join(projectRoot, 'components', 'tnp', 'public')),
  ...['client', 'planner', 'operations'].flatMap((portal) =>
    productionFiles(
      path.join(projectRoot, 'components', 'tnp', 'portals', portal),
    ).filter((file) => file.endsWith('.module.css')),
  ),
  path.join(projectRoot, 'components', 'three', 'EventOrbit.tsx'),
  path.join(projectRoot, 'data', 'tnp.ts'),
];

const forbiddenHex =
  /#(?:062b29|061c1b|084c49|0f6b68|083d36|073f3d|052b29|071c1b|061615)(?:[0-9a-f]{2})?\b/i;
const forbiddenRgb =
  /rgb\(\s*(?:6\s+43\s+41|6\s+28\s+27|8\s+76\s+73|15\s+107\s+104)(?:\s*\/[^)]*)?\)/i;

test('active production presentation sources contain no former green palette literals', () => {
  for (const file of activePresentationFiles) {
    const source = readFileSync(file, 'utf8');
    assert.doesNotMatch(source, forbiddenHex, path.relative(projectRoot, file));
    assert.doesNotMatch(source, forbiddenRgb, path.relative(projectRoot, file));
  }
});

test('semantic primary and legacy brand aliases resolve to exact client teal', () => {
  const globalCss = readFileSync(
    path.join(projectRoot, 'app', 'globals.css'),
    'utf8',
  );
  for (const token of ['primary', 'teal', 'deep', 'dark', 'black-teal']) {
    assert.match(globalCss, new RegExp(`--${token}:\\s*#008080;`, 'i'));
  }
  assert.match(globalCss, /--primary-hover:\s*#006b6b;/i);
  assert.match(globalCss, /\.hero-section\s*\{[^}]*background:\s*#008080;/s);
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
