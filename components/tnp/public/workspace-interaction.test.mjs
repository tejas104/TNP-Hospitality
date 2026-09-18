import test from 'node:test';
import assert from 'node:assert/strict';
import {
  workspaceInteraction,
  canPreviewService,
  filmstripOffset,
} from './workspace-interaction.ts';
test('hover is transient while an explicitly opened drawer survives pointer leave', () => {
  assert.equal(workspaceInteraction('closed', 'enter'), 'hover');
  assert.equal(workspaceInteraction('hover', 'leave'), 'closed');
  assert.equal(workspaceInteraction('closed', 'toggle'), 'pinned');
  assert.equal(workspaceInteraction('pinned', 'leave'), 'pinned');
  assert.equal(workspaceInteraction('hover', 'toggle'), 'closed');
  assert.equal(workspaceInteraction('pinned', 'toggle'), 'closed');
});
test('dismissal always closes both pointer and explicit drawer states', () => {
  for (const state of ['closed', 'hover', 'pinned'])
    assert.equal(workspaceInteraction(state, 'dismiss'), 'closed');
});
test('service hover cannot override touch or keyboard-focused content', () => {
  assert.equal(canPreviewService('mouse', true, false), true);
  for (const input of [
    ['touch', true, false],
    ['pen', true, false],
    ['mouse', false, false],
    ['mouse', true, true],
  ])
    assert.equal(canPreviewService(...input), false);
});
test('filmstrip native-scroll offset stays finite and within its available travel', () => {
  assert.equal(filmstripOffset(2000, 500, 900, 1000), 0);
  assert.equal(filmstripOffset(-1000, 500, 900, 1000), 1000);
  assert.ok(
    filmstripOffset(200, 500, 900, 1000) > filmstripOffset(500, 500, 900, 1000),
  );
  for (const value of [NaN, Infinity, -Infinity])
    assert.equal(filmstripOffset(value, 500, 900, 1000), 0);
});
