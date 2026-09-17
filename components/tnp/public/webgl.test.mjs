import assert from 'node:assert/strict';
import test from 'node:test';
import { probeWebGL2 } from './webgl.ts';

test('WebGL2 unavailability returns false without accepting WebGL1', () => {
  const requests = [];
  assert.equal(
    probeWebGL2(() => ({
      getContext: (type) => {
        requests.push(type);
        return null;
      },
    })),
    false,
  );
  assert.deepEqual(requests, ['webgl2']);
});
test('context-creation exceptions select the still illustration path', () => {
  assert.equal(
    probeWebGL2(() => ({
      getContext() {
        throw new Error('GPU unavailable');
      },
    })),
    false,
  );
});
test('canvas-creation exceptions do not escape the capability boundary', () => {
  assert.equal(
    probeWebGL2(() => {
      throw new Error('Canvas unavailable');
    }),
    false,
  );
});
test('a successful probe releases its temporary GPU context', () => {
  let releases = 0;
  assert.equal(
    probeWebGL2(() => ({
      getContext: () => ({
        getExtension: () => ({ loseContext: () => releases++ }),
      }),
    })),
    true,
  );
  assert.equal(releases, 1);
});
test('WebGL2 still works when the optional context-loss extension is absent', () => {
  assert.equal(
    probeWebGL2(() => ({ getContext: () => ({ getExtension: () => null }) })),
    true,
  );
});
