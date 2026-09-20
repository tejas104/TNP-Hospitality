import test from 'node:test';
import assert from 'node:assert/strict';
import { workspaces, routeInfo, chooserHref, workspaceHref, workspaceById, shouldMountCursor, rsvpContext, clearRsvpSelectionOnContextChange } from '../components/tnp/access/routes.ts';
import { createDemoSessionStore, parseDemoSession, demoProfiles, canEnter, DEMO_SESSION_KEY, resetScope } from '../components/tnp/access/session.ts';

function storage() {
  const values = new Map();
  return { values, getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
}
test('all workspaces have unique destinations and allowlisted chooser links; RSVP never links to missing pages', () => {
  assert.equal(new Set(workspaces.map((x) => x.id)).size, 5);
  assert.equal(new Set(workspaces.map((x) => chooserHref(x.id))).size, 5);
  for (const workspace of workspaces) assert.equal(routeInfo(workspace.path).workspace, workspace.id);
  assert.equal(workspaceHref('rsvp'), '/login?workspace=rsvp');
  assert.equal(workspaceById('//evil.test'), undefined);
  assert.equal(workspaceById('planner'), undefined);
});
test('surface boundaries cover nested workspaces, access, alias and guest routes without substring matches', () => {
  for (const [path, surface, workspace] of [
    ['/', 'marketing'], ['/services/rsvp', 'marketing'], ['/clientele', 'marketing'],
    ['/login?workspace=client', 'access'], ['/rsvp/login', 'access', 'rsvp'],
    ['/admin', 'workspace', 'operations'], ['/operations/reviews', 'workspace', 'operations'],
    ['/rsvp/events/event-a', 'workspace', 'rsvp'], ['/rsvp/invite/token-a', 'guest-invitation'],
  ]) { assert.equal(routeInfo(path).surface, surface); assert.equal(routeInfo(path).workspace, workspace); }
});
test('parser rejects untrusted shape, mismatched workspace, unknown IDs, injected claims and versions', () => {
  for (const raw of [null, '', '{', '[]', 'null', '1', '{}', '{"version":2}', JSON.stringify({ version: 1, profileId: 'client-asha', workspace: 'operations' }), JSON.stringify({ version: 1, profileId: 'client-asha', workspace: 'client', state: 'active' })]) assert.equal(parseDemoSession(raw), null);
  for (const profile of demoProfiles) assert.deepEqual(parseDemoSession(JSON.stringify({ version: 1, profileId: profile.id, workspace: profile.workspace })), { version: 1, profileId: profile.id, workspace: profile.workspace });
});
test('explicit selection persists only fixture identifiers and keeps records and other tabs intact', () => {
  const disk = storage(); disk.setItem('preview-records', 'keep');
  const a = createDemoSessionStore(() => disk);
  const b = createDemoSessionStore(() => storage());
  assert.equal(a.read().session, null);
  a.select('client-asha');
  assert.equal(canEnter(a.read().session, 'client'), true);
  assert.equal(canEnter(a.read().session, 'operations'), false);
  assert.equal(createDemoSessionStore(() => disk).read().session.profileId, 'client-asha');
  a.select('client-invited'); assert.equal(canEnter(a.read().session, 'client'), false);
  a.select('rsvp-team'); assert.equal(canEnter(a.read().session, 'rsvp'), false);
  a.exit(); assert.equal(disk.getItem(DEMO_SESSION_KEY), null);
  assert.equal(disk.getItem('preview-records'), 'keep');
  assert.equal(b.read().session, null);
});
test('read, write and removal failures retain latest memory selection, including exit', () => {
  for (const operation of ['getItem', 'setItem', 'removeItem']) {
    const disk = storage(); const store = createDemoSessionStore(() => disk);
    store.select('client-asha');
    disk[operation] = () => { throw new Error('denied'); };
    if (operation === 'getItem') store.read();
    if (operation === 'removeItem') store.exit();
    else store.select('client-representative');
    assert.equal(store.read().memoryOnly, true);
    assert.equal(store.read().session?.profileId ?? null, operation === 'removeItem' ? null : 'client-representative');
    store.exit(); assert.equal(store.read().session, null);
  }
  const denied = createDemoSessionStore(() => { throw new Error('security'); });
  denied.read(); denied.select('operations-reviewer');
  assert.equal(denied.read().session.profileId, 'operations-reviewer');
});
test('reset and cursor policies do not leak across surfaces', () => {
  assert.match(resetScope.connected, /cross-portal/);
  assert.match(resetScope.exit, /only.*identity/);
  for (const workspace of workspaces) assert.equal(shouldMountCursor(workspace.path), false);
  assert.equal(shouldMountCursor('/'), true);
  assert.equal(shouldMountCursor('/login'), false);
});
test('RSVP adapter separates guest and staff context and invalidates local selection on event or organization switch', () => {
  assert.deepEqual(rsvpContext('/rsvp/invite/token'), { kind: 'guest' });
  assert.deepEqual(rsvpContext('/rsvp/events/a/inbox'), { kind: 'event', eventId: 'a' });
  assert.deepEqual(rsvpContext('/rsvp/workspace'), { kind: 'organization' });
  assert.equal(clearRsvpSelectionOnContextChange('org-a/event-a', 'org-b/event-a', 'guest-1'), null);
  assert.equal(clearRsvpSelectionOnContextChange('org-a/event-a', 'org-a/event-b', 'guest-1'), null);
  assert.equal(clearRsvpSelectionOnContextChange('org-a/event-a', 'org-a/event-a', 'guest-1'), 'guest-1');
});
