'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Command, PartyDraft } from './adapter';
import { PRIORITY_LABEL, type Party, type Priority } from './model';
import type { SectionProps } from './types';
import { ActionError, CopyRef, ErrorSummary, FieldError, Modal, PendingLabel, StatePanel, Tag, fieldProps, styles, useEventMutation } from './ui';

type Err = Array<{ id: string; message: string }>;

const blankMember = (functionIds: string[]) => ({ name: '', ageBand: 'adult' as const, functionIds, dietary: '', accessibility: '' });

function emptyDraft(functionIds: string[]): PartyDraft {
  return { displayName: '', phone: '', email: '', priority: 'standard', language: 'English', allowedAccompanying: 0, members: [blankMember(functionIds)], duplicateReviewed: false };
}

export function validateDraft(d: PartyDraft): Err {
  const errors: Err = [];
  if (!d.displayName.trim()) errors.push({ id: 'party-name', message: 'Enter the party or household name.' });
  if (!d.phone.trim() && !d.email.trim()) errors.push({ id: 'party-phone', message: 'Enter a phone number or an email for the primary contact.' });
  else if (d.phone.trim() && d.phone.replace(/\D/g, '').length < 8) errors.push({ id: 'party-phone', message: 'Include the country code and full phone number.' });
  if (d.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) errors.push({ id: 'party-email', message: 'Enter a valid email or leave it blank.' });
  d.members.forEach((m, i) => {
    if (!m.name.trim()) errors.push({ id: `member-${i}-name`, message: `Guest ${i + 1}: enter a name.` });
    if (m.functionIds.length === 0) errors.push({ id: `member-${i}-functions`, message: `Guest ${i + 1}: invite to at least one function.` });
  });
  if (d.members.length - 1 > d.allowedAccompanying) errors.push({ id: 'party-allowed', message: `Allowed accompanying (${d.allowedAccompanying}) is less than the ${d.members.length - 1} additional guests entered.` });
  return errors;
}

export function AddPartySection({ data, can, go, selectParty }: SectionProps) {
  const fnIds = useMemo(() => data.functions.map((f) => f.id), [data.functions]);
  const storageKey = `tnp-rsvp-draft-${data.event.id}`;
  // Restore an unsaved draft for this event only (context-scoped; synthetic data). This section
  // renders only after client-side data loads, so a lazy read is hydration-safe.
  const [initial] = useState<{ draft: PartyDraft; restored: boolean }>(() => {
    try {
      const raw = window.sessionStorage.getItem(storageKey);
      if (raw) return { draft: JSON.parse(raw) as PartyDraft, restored: true };
    } catch {
      /* draft persistence is optional */
    }
    return { draft: emptyDraft(fnIds), restored: false };
  });
  const restored = initial.restored;
  const [draft, setDraft] = useState<PartyDraft>(initial.draft);
  const [clientErrors, setErrors] = useState<Err>([]);
  const [attempt, setAttempt] = useState(0);
  const [created, setCreated] = useState<Party | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(emptyDraft(fnIds));
  useEffect(() => {
    try {
      if (dirty) window.sessionStorage.setItem(storageKey, JSON.stringify(draft));
      else window.sessionStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
  }, [draft, dirty, storageKey]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const action = useEventMutation<Party>(
    () => ({ type: 'create-party', draft }) satisfies Command,
    (party) => {
      setCreated(party);
      setDraft(emptyDraft(fnIds));
      setErrors([]);
    },
    (party, replayed) => (replayed ? `${party.displayName} was already created (${party.ref}); no duplicate made.` : `Created ${party.displayName} (${party.ref}).`),
  );

  // Service-side field errors map onto the same fields and summary.
  const serverFields = action.status.error?.fields;
  const errors = useMemo<Err>(() => {
    if (!serverFields) return clientErrors;
    const map: Record<string, string> = { displayName: 'party-name', phone: 'party-phone', members: 'member-0-name' };
    return [...clientErrors, ...Object.entries(serverFields).map(([k, message]) => ({ id: map[k] ?? k, message }))];
  }, [clientErrors, serverFields]);

  if (!can('create-party')) {
    return (
      <StatePanel tone="locked" title="Adding parties is not available for your role">
        <p>Ask a coordinator or the customer owner to add guests.</p>
      </StatePanel>
    );
  }

  const submit = (mode: 'new' | 'retry') => {
    const errs = validateDraft(draft);
    setErrors(errs);
    setAttempt((a) => a + 1);
    if (errs.length) return;
    if (mode === 'retry') void action.retry();
    else void action.start();
  };

  const setMember = (i: number, patch: Partial<PartyDraft['members'][number]>) => setDraft((d) => ({ ...d, members: d.members.map((m, j) => (j === i ? { ...m, ...patch } : m)) }));

  if (created) {
    return (
      <StatePanel
        title="Party created"
        action={
          <>
            <button type="button" className={styles.btnPrimary} onClick={() => selectParty(created.id)}>
              Open {created.displayName}
            </button>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => {
                setCreated(null);
                action.reset();
              }}
            >
              Add another party (new action)
            </button>
          </>
        }
      >
        <p>
          {created.displayName} was saved to the synthetic adapter with reference <CopyRef value={created.ref} />. Invitation status: not prepared. No message was sent.
        </p>
      </StatePanel>
    );
  }

  const conflict = action.status.error?.code === 'conflict' && !draft.duplicateReviewed;

  return (
    <form
      className={`${styles.form} ${styles.panel}`}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit('new');
      }}
    >
      <div className={styles.formHead}>
        <h2>New party for {data.event.name}</h2>
        <Tag tone={dirty ? 'warn' : 'muted'}>{dirty ? 'Unsaved draft' : 'Empty'}</Tag>
      </div>
      {restored && dirty && <p className={styles.notice}>Your unsaved draft for this event was restored.</p>}
      <ErrorSummary errors={errors} focusKey={attempt} />
      <fieldset className={styles.fieldset}>
        <legend>Party and primary contact</legend>
        <div className={styles.grid2}>
          <label className={styles.field}>
            <span>Party / household name *</span>
            <input {...fieldProps('party-name', errors)} value={draft.displayName} onChange={(e) => setDraft({ ...draft, displayName: e.target.value })} autoComplete="off" />
            <FieldError id="party-name" errors={errors} />
          </label>
          <label className={styles.field}>
            <span>Phone (with country code)</span>
            <input {...fieldProps('party-phone', errors)} type="tel" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value, duplicateReviewed: false })} autoComplete="off" />
            <FieldError id="party-phone" errors={errors} />
          </label>
          <label className={styles.field}>
            <span>Email</span>
            <input {...fieldProps('party-email', errors)} type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} autoComplete="off" />
            <FieldError id="party-email" errors={errors} />
          </label>
          <label className={styles.field}>
            <span>Priority</span>
            <select value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value as Priority })}>
              {Object.entries(PRIORITY_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>Calling language</span>
            <input value={draft.language} onChange={(e) => setDraft({ ...draft, language: e.target.value })} />
          </label>
          <label className={styles.field}>
            <span>Allowed accompanying guests</span>
            <input {...fieldProps('party-allowed', errors)} type="number" min={0} inputMode="numeric" value={draft.allowedAccompanying} onChange={(e) => setDraft({ ...draft, allowedAccompanying: Math.max(0, Number(e.target.value) || 0) })} />
            <FieldError id="party-allowed" errors={errors} />
          </label>
        </div>
      </fieldset>
      {draft.members.map((m, i) => (
        <fieldset key={i} className={`${styles.fieldset} ${styles.memberFieldset}`}>
          <legend>
            Guest {i + 1}
            {i === 0 ? ' (primary)' : ''}
          </legend>
          <div className={styles.grid2}>
            <label className={styles.field}>
              <span>Full name *</span>
              <input {...fieldProps(`member-${i}-name`, errors)} value={m.name} onChange={(e) => setMember(i, { name: e.target.value })} autoComplete="off" />
              <FieldError id={`member-${i}-name`} errors={errors} />
            </label>
            <label className={styles.field}>
              <span>Adult or child</span>
              <select value={m.ageBand} onChange={(e) => setMember(i, { ageBand: e.target.value as 'adult' | 'child' })}>
                <option value="adult">Adult</option>
                <option value="child">Child</option>
              </select>
            </label>
          </div>
          <fieldset className={styles.checkGroup}>
            <legend>Invited functions *</legend>
            {data.functions.map((f, k) => (
              <label key={f.id} className={styles.checkField}>
                <input
                  type="checkbox"
                  id={k === 0 ? `member-${i}-functions` : undefined}
                  aria-invalid={errors.some((e) => e.id === `member-${i}-functions`) || undefined}
                  checked={m.functionIds.includes(f.id)}
                  onChange={(e) => setMember(i, { functionIds: e.target.checked ? [...m.functionIds, f.id] : m.functionIds.filter((x) => x !== f.id) })}
                />
                {f.name}
              </label>
            ))}
            <FieldError id={`member-${i}-functions`} errors={errors} />
          </fieldset>
          <div className={styles.grid2}>
            <label className={styles.field}>
              <span>Dietary request</span>
              <input value={m.dietary} onChange={(e) => setMember(i, { dietary: e.target.value })} />
            </label>
            <label className={styles.field}>
              <span>Accessibility need</span>
              <input value={m.accessibility} onChange={(e) => setMember(i, { accessibility: e.target.value })} />
            </label>
          </div>
          {i > 0 && (
            <button type="button" className={styles.btnGhost} onClick={() => setDraft((d) => ({ ...d, members: d.members.filter((_, j) => j !== i) }))}>
              <Trash2 size={14} aria-hidden /> Remove guest {i + 1}
            </button>
          )}
        </fieldset>
      ))}
      <button type="button" className={styles.btnSecondary} onClick={() => setDraft((d) => ({ ...d, members: [...d.members, blankMember(fnIds)] }))}>
        <Plus size={15} aria-hidden /> Add another guest to this party
      </button>
      {conflict && (
        <div className={styles.notice} role="alert">
          <p>
            <strong>Possible duplicate — review before saving.</strong> {action.status.error?.message}
          </p>
          <p className={styles.meta}>Guests are never merged automatically. Confirm only if this is a different household.</p>
          <div className={styles.inlineActions}>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => {
                setDraft((d) => ({ ...d, duplicateReviewed: true }));
                action.reset();
              }}
            >
              This is a separate party
            </button>
            <button type="button" className={styles.btnSecondary} onClick={() => go('guests', { filters: { query: draft.phone } })}>
              Check existing parties
            </button>
          </div>
        </div>
      )}
      {!conflict && <ActionError status={action.status} onRetry={() => submit('retry')} />}
      {draft.duplicateReviewed && <p className={styles.meta}>Duplicate reviewed: will be created as a separate party. Submitting starts a new action.</p>}
      <div className={styles.formActions}>
        <button type="submit" className={styles.btnPrimary} disabled={action.status.phase === 'pending'}>
          <PendingLabel pending={action.status.phase === 'pending'} idle="Save party" busy="Saving…" />
        </button>
        <button type="button" className={styles.btnSecondary} disabled={!dirty} onClick={() => setConfirmDiscard(true)}>
          Discard draft
        </button>
      </div>
      <Modal open={confirmDiscard} title="Discard this draft?" onClose={() => setConfirmDiscard(false)} description="All entered party and guest details on this form will be removed.">
        <div className={styles.inlineActions}>
          <button
            type="button"
            className={styles.btnDanger}
            onClick={() => {
              setDraft(emptyDraft(fnIds));
              setErrors([]);
              action.reset();
              setConfirmDiscard(false);
            }}
          >
            Discard draft
          </button>
          <button type="button" className={styles.btnSecondary} onClick={() => setConfirmDiscard(false)}>
            Keep editing
          </button>
        </div>
      </Modal>
    </form>
  );
}
