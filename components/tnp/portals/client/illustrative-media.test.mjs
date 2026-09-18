import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import {
  clientIllustrations,
  venueIllustration,
} from './illustrative-media.ts';
test('client image slots are local, replaceable and explicitly illustrative', () => {
  for (const slot of Object.values(clientIllustrations)) {
    assert.ok(
      existsSync(new URL('../../../../public' + slot.src, import.meta.url)),
    );
    assert.ok(slot.alt && slot.source && slot.fallback && slot.position);
    assert.match(slot.caption, /not a /);
  }
  assert.equal(venueIllustration('Unknown city'), undefined);
  assert.equal(venueIllustration('Jaipur'), clientIllustrations.Jaipur);
});
