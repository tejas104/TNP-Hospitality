import test from 'node:test';
import assert from 'node:assert/strict';
import { createPreviewService } from '../../../../lib/services/preview.ts';
import {
  actionSlot,
  createRequest,
  currentApplication,
  draftErrors,
  filterOpportunities,
  freshDraft,
  mayRespond,
  readDraft,
  readRequests,
  sampleScore,
  storageKey,
} from './freelancerState.ts';

test('draft validation survives a complete round trip and rejects malformed storage', () => {
  const draft = freshDraft();
  assert.deepEqual(Object.keys(draftErrors(draft)), [
    'sample-name',
    'sample-role',
  ]);
  Object.assign(draft, {
    name: 'Sample Alex',
    role: 'Volunteer',
    experience: 'Getting started',
    answers: [0, 1, 2],
    step: 3,
  });
  assert.deepEqual(draftErrors(draft), {});
  assert.deepEqual(readDraft(JSON.stringify(draft)), draft);
  assert.equal(sampleScore(draft.answers), 100);
  assert.throws(() => readDraft('{"step":99}'));
  assert.notEqual(
    storageKey('draft', 'first', 0),
    storageKey('draft', 'second', 0),
  );
  assert.notEqual(
    storageKey('draft', 'first', 0),
    storageKey('draft', 'first', 1),
  );
});

test('lost application response replays one exact request after journal reload', async () => {
  const service = await createPreviewService();
  const actor = 'tnp-demo-freelancer-new';
  const request = createRequest(
    'registerApplicant',
    { applicantId: actor, displayName: 'Sample Alex', role: 'Volunteer' },
    actor,
    0,
    'sample-register',
  );
  const journal = JSON.stringify({
    [actionSlot(request.operation, request.payload)]: request,
  });
  const first = await service.mutate(request);
  assert.equal(first.ok, true);
  const restored = Object.values(readRequests(journal, actor, 0))[0];
  const replay = await service.mutate(restored);
  assert.equal(replay.replayed, true);
  assert.equal(replay.value.id, first.value.id);
  const applications = (await service.listApplications()).value.items;
  assert.equal(applications.filter((a) => a.applicantId === actor).length, 1);
  assert.equal(currentApplication(applications, actor).id, first.value.id);
  assert.equal(currentApplication(applications, 'different-profile'), null);
  assert.throws(() => readRequests(journal, 'different-profile', 0));
  assert.throws(() => readRequests(journal, actor, 1));
  await service.resetPreview({
    requestKey: 'reset',
    expectedGeneration: 0,
    actorId: actor,
  });
  const stale = await service.mutate(restored);
  assert.equal(stale.ok, false);
  assert.equal(stale.error.code, 'STALE_GENERATION');
});

test('assessment remains separate from approval and restores the service record', async () => {
  const service = await createPreviewService();
  const actor = 'tnp-demo-freelancer-new';
  await service.mutate(
    createRequest(
      'registerApplicant',
      { applicantId: actor, displayName: 'Sample Jordan', role: 'Volunteer' },
      actor,
      0,
      'register',
    ),
  );
  const request = createRequest(
    'submitAssessment',
    { applicantId: actor, score: sampleScore([0, 1, 2]) },
    actor,
    0,
    'assessment',
  );
  const result = await service.mutate(request);
  assert.equal(result.value.status, 'passed');
  assert.equal((await service.mutate(request)).replayed, true);
  assert.equal((await service.listAssessments(actor)).value.items.length, 1);
  assert.equal(
    currentApplication((await service.listApplications()).value.items, actor)
      .status,
    'pending',
  );
});

test('opportunity selection and request targets do not cross two positions or workers', async () => {
  const service = await createPreviewService();
  const items = (await service.listOpportunities('tnp-demo-worker-006')).value
    .items;
  assert.ok(items.some((o) => o.requiredQuantity === 6));
  assert.ok(items.some((o) => o.requiredQuantity === 40));
  const first = items[0],
    second = items.find((o) => o.positionId !== first.positionId);
  assert.equal(
    filterOpportunities(
      items,
      '',
      first.role,
      first.venueId,
      first.startsAt.slice(0, 10),
    ).includes(first),
    true,
  );
  assert.deepEqual(
    filterOpportunities(items, 'nonexistent search', '', '', ''),
    [],
  );
  assert.notEqual(
    actionSlot('claimOpportunity', {
      positionId: first.positionId,
      workerId: 'one',
    }),
    actionSlot('claimOpportunity', {
      positionId: second.positionId,
      workerId: 'one',
    }),
  );
  const response = createRequest(
    'respondToAssignment',
    { assignmentId: 'assignment-one', response: 'coming' },
    'one',
    0,
    'response',
  );
  assert.equal(
    mayRespond(response, [{ id: 'assignment-one', workerId: 'two' }]),
    false,
  );
  assert.equal(
    mayRespond(response, [{ id: 'assignment-two', workerId: 'one' }]),
    false,
  );
  assert.equal(
    mayRespond(response, [{ id: 'assignment-one', workerId: 'one' }]),
    true,
  );
});
