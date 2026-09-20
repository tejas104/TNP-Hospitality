import test from 'node:test';
import assert from 'node:assert/strict';
import {
  attributableMedia,
  qualifiedPrice,
  verifiedRating,
  inr,
} from '../components/tnp/access/partner-evidence.ts';

test('ratings require complete source, verifier, scale and real positive review count', () => {
  const rating = {
    value: 4.5,
    scale: 5,
    reviewCount: 24,
    source: 'Synthetic test source',
    verifier: 'Synthetic test verifier',
  };
  assert.equal(verifiedRating(rating), true);
  for (const patch of [
    { value: 6 },
    { value: NaN },
    { reviewCount: 0 },
    { reviewCount: 1.5 },
    { source: '' },
    { verifier: ' ' },
  ])
    assert.equal(verifiedRating({ ...rating, ...patch }), false);
  assert.equal(verifiedRating(undefined), false);
});
test('prices require safe integer minor units, ordered range and contextual qualifiers', () => {
  const price = {
    minMinor: 100050,
    maxMinor: 200000,
    qualifier: 'Sample budget band',
    unit: 'event',
    scope: 'Space only',
    source: 'Synthetic test',
  };
  assert.equal(qualifiedPrice(price), true);
  assert.equal(inr(100050), '₹1,000.50');
  for (const patch of [
    { minMinor: -1 },
    { minMinor: 1.1 },
    { maxMinor: 1 },
    { scope: '' },
    { qualifier: '' },
    { source: ' ' },
  ])
    assert.equal(qualifiedPrice({ ...price, ...patch }), false);
  assert.equal(qualifiedPrice(undefined), false);
});
test('media requires relationship, provenance, rights, alt and a supported source', () => {
  const media = {
    src: '/test.svg',
    alt: 'Illustrative scene',
    source: 'Synthetic fixture',
    relationship: 'illustrative',
    rights: 'Test-owned',
  };
  assert.equal(attributableMedia(media), true);
  for (const patch of [
    { rights: '' },
    { alt: '' },
    { source: '' },
    { src: 'javascript:alert(1)' },
    { src: '//untrusted.test/a' },
    { relationship: 'verified' },
  ])
    assert.equal(attributableMedia({ ...media, ...patch }), false);
});
