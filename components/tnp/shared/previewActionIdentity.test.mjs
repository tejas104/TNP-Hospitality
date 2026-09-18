import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PreviewActionIdentityError,
  PreviewActionIdentityManager,
} from './previewActionIdentity.ts';

class MemoryActionStorage {
  values = new Map();

  getItem(key) {
    return this.values.get(key) ?? null;
  }

  setItem(key, value) {
    this.values.set(key, value);
  }
}

const variant = (expectedGeneration, value) => ({
  expectedGeneration,
  operation: 'setPreviewVariant',
  payload: { key: 'global', variant: value },
});

test('variant identities stay distinct across actions and reloads in one generation', () => {
  const storage = new MemoryActionStorage();
  const firstMount = new PreviewActionIdentityManager(storage);
  const loading = firstMount.capture(variant(0, 'loading'));
  firstMount.settle(loading);
  const empty = firstMount.capture(variant(0, 'empty'));
  firstMount.settle(empty);

  const reloaded = new PreviewActionIdentityManager(storage);
  const error = reloaded.capture(variant(0, 'error'));

  assert.notEqual(loading.requestKey, empty.requestKey);
  assert.notEqual(empty.requestKey, error.requestKey);
  assert.equal(error.expectedGeneration, 0);
});

test('only a genuine retry reuses its captured request key', () => {
  const manager = new PreviewActionIdentityManager(new MemoryActionStorage());
  const captured = manager.capture(variant(0, 'loading'));
  const retry = manager.capture(variant(0, 'loading'));
  assert.deepEqual(retry, captured);

  const differentPayload = manager.capture(variant(0, 'empty'));
  assert.notEqual(differentPayload.requestKey, captured.requestKey);
  manager.settle(differentPayload);

  const laterSamePayload = manager.capture(variant(0, 'empty'));
  assert.notEqual(laterSamePayload.requestKey, differentPayload.requestKey);
});

test('reset completion starts new-generation action behavior without changing a captured retry', () => {
  const manager = new PreviewActionIdentityManager(new MemoryActionStorage());
  const reset = manager.capture({ expectedGeneration: 0, operation: 'resetPreview', payload: null });
  assert.deepEqual(manager.capture({ expectedGeneration: 0, operation: 'resetPreview', payload: null }), reset);
  manager.settle(reset);

  const afterReset = manager.capture(variant(1, 'loading'));
  assert.equal(afterReset.expectedGeneration, 1);
  assert.notEqual(afterReset.requestKey, reset.requestKey);
});

test('unavailable or corrupt identity persistence fails truthfully', () => {
  const unavailableRead = new PreviewActionIdentityManager({
    getItem() { throw new Error('blocked'); },
    setItem() { throw new Error('unreachable'); },
  });
  assert.throws(() => unavailableRead.capture(variant(0, 'loading')), PreviewActionIdentityError);

  const unavailableWrite = new PreviewActionIdentityManager({
    getItem() { return null; },
    setItem() { throw new Error('quota'); },
  });
  assert.throws(() => unavailableWrite.capture(variant(0, 'loading')), PreviewActionIdentityError);

  const corrupt = new PreviewActionIdentityManager({
    getItem() { return '{not valid'; },
    setItem() { throw new Error('must not overwrite corrupt identity'); },
  });
  assert.throws(() => corrupt.capture(variant(0, 'loading')), PreviewActionIdentityError);
});
