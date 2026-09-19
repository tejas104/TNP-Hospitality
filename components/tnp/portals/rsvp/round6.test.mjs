import test from 'node:test';
import { restoredIdentity, intentProjection } from './round6-scenarios.mjs';
for (const kind of ['pickup', 'drop']) {
  test(`${kind} IDs stay unique through three history/clear/restore cycles and exact replay`, () => restoredIdentity(kind));
  test(`${kind} projection tracks only current active intent and cannot resurrect cancellation`, () => intentProjection(kind));
}
