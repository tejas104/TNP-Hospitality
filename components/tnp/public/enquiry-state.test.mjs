import assert from 'node:assert/strict';
import test from 'node:test';
import {
  matchesEnquiry,
  readEnquiryAction,
  validateEnquiry,
} from './enquiry-state.ts';
import { createPreviewService } from '../../../lib/services/preview.ts';

const payload = {
  name: 'Sample Guest',
  email: 'guest@example.com',
  message: 'Vendor platform interest: sample event.',
};
const request = {
  operation: 'submitEnquiry',
  actorId: 'tnp-public-preview',
  requestKey: 'public-enquiry:test',
  expectedGeneration: 0,
  payload,
};

test('public validation rejects blank, malformed and overlong values', () => {
  assert.deepEqual(validateEnquiry(payload), {});
  assert.deepEqual(
    Object.keys(validateEnquiry({ name: ' ', email: 'a@', message: ' ' })),
    ['name', 'email', 'message'],
  );
  assert.equal(
    Object.keys(
      validateEnquiry({
        name: 'a'.repeat(101),
        email: 'a'.repeat(250) + '@e.com',
        message: 'a'.repeat(2001),
      }),
    ).length,
    3,
  );
});
test('journal refuses malformed identities and payloads before restoring a receipt', () => {
  for (const value of [
    null,
    '{}',
    '{',
    JSON.stringify({
      request: { ...request, payload: { ...payload, email: 4 } },
    }),
    JSON.stringify({ request: { ...request, expectedGeneration: -1 } }),
    JSON.stringify({ request: { ...request, actorId: 'someone-else' } }),
  ])
    assert.equal(readEnquiryAction(value), null);
  assert.deepEqual(readEnquiryAction(JSON.stringify({ request })), { request });
});
test('receipt restoration needs exact stored identity and payload, never just a success flag', () => {
  const record = {
    ...payload,
    id: 'tnp-demo-enquiry-001',
    sentExternally: false,
    createdAt: '2026-09-18',
  };
  const action = { request, receiptId: record.id };
  assert.equal(matchesEnquiry(action, record), true);
  assert.equal(
    matchesEnquiry(action, { ...record, message: 'another event' }),
    false,
  );
  assert.equal(matchesEnquiry({ request }, record), false);
  assert.equal(
    matchesEnquiry(action, { ...record, sentExternally: true }),
    false,
  );
});
test('same enquiry request replays one stored record and reset invalidates the old identity', async () => {
  const service = await createPreviewService();
  const first = await service.mutate(request);
  assert.equal(first.ok, true);
  const replay = await service.mutate(request);
  assert.equal(replay.ok, true);
  assert.equal(replay.replayed, true);
  assert.equal(replay.value.id, first.value.id);
  assert.equal(replay.value.sentExternally, false);
  const list = await service.listEnquiries();
  assert.equal(
    list.value.items.filter((item) => item.id === first.value.id).length,
    1,
  );
  await service.resetPreview({
    actorId: 'tnp-public-preview',
    requestKey: 'reset-test',
    expectedGeneration: 0,
  });
  const stale = await service.mutate(request);
  assert.equal(stale.ok, false);
  assert.equal(stale.error.code, 'STALE_GENERATION');
});
