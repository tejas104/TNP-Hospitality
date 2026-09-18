'use client';

import { ArrowLeft, ArrowRight, CheckCircle2, Lock, RefreshCw, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { newRequestId, type AdapterError, type GuestAnswers, type InvitationView } from './adapter';
import { formatExact, isoToZonedLocal, zonedToIso } from './dates';
import { anyAttending, guestSteps, reconcileStep, STEP_LABEL, validateStep, type GuestDraft, type GuestStep } from './guestFlow';
import { FUNCTION_RSVP_LABEL, TRAVEL_MODE_LABEL, type FunctionRsvp, type TravelMode } from './model';
import { ErrorSummary, FieldError, IllustrativeImage, MotionProvider, PendingLabel, Skeleton, StatePanel, fieldProps, getAdapter, styles } from './ui';

type Load = { phase: 'loading' } | { phase: 'error'; error: AdapterError } | { phase: 'ready'; view: InvitationView };

const ANSWERS: Array<[FunctionRsvp, string]> = [
  ['confirmed', 'Attending'],
  ['tentative', 'Maybe'],
  ['declined', 'Not attending'],
];

function draftFrom(view: InvitationView, previous?: GuestDraft | null): GuestDraft {
  const tz = view.event.timezone;
  const responses: GuestDraft['responses'] = {};
  for (const m of view.members) {
    responses[m.id] = {};
    for (const f of m.invitedFunctionIds) {
      const prior = previous?.responses[m.id]?.[f];
      const current = m.responses[f];
      responses[m.id][f] = prior ?? (current && current !== 'awaiting' && current !== 'cancelled' ? current : '');
    }
  }
  const base: GuestDraft = {
    responses,
    arrivalChoice: view.arrival?.at ? 'now' : 'later',
    arrivalMode: view.arrival?.mode ?? '',
    arrivalRef: view.arrival?.reference ?? '',
    arrivalFrom: view.arrival?.from ?? '',
    arrivalAt: view.arrival?.at ? isoToZonedLocal(view.arrival.at, tz) : '',
    departureChoice: view.departure?.at ? 'now' : 'later',
    departureMode: view.departure?.mode ?? '',
    departureRef: view.departure?.reference ?? '',
    departureTo: view.departure?.to ?? '',
    departureAt: view.departure?.at ? isoToZonedLocal(view.departure.at, tz) : '',
    pickup: view.pickup,
    drop: view.drop,
    stay: view.stay ?? '',
    dietary: Object.fromEntries(view.members.map((m) => [m.id, m.dietary])),
    accessibility: Object.fromEntries(view.members.map((m) => [m.id, m.accessibility])),
  };
  if (!previous) return base;
  // Keep the guest's unsent answers for members who are still in the party.
  const keep = (rec: Record<string, string>, prev: Record<string, string>) => Object.fromEntries(Object.keys(rec).map((k) => [k, prev[k] ?? rec[k]]));
  return { ...previous, responses, dietary: keep(base.dietary, previous.dietary), accessibility: keep(base.accessibility, previous.accessibility) };
}

function toAnswers(d: GuestDraft, view: InvitationView): GuestAnswers {
  const tz = view.event.timezone;
  const attending = anyAttending(d);
  return {
    responses: Object.fromEntries(Object.entries(d.responses).map(([m, fns]) => [m, Object.fromEntries(Object.entries(fns).filter(([, v]) => v).map(([f, v]) => [f, v as FunctionRsvp]))])),
    arrival: attending && d.arrivalChoice === 'now' && d.arrivalMode ? { mode: d.arrivalMode, reference: d.arrivalRef.trim(), from: d.arrivalFrom.trim(), at: zonedToIso(d.arrivalAt, tz) ?? '' } : null,
    departure: attending && d.departureChoice === 'now' && d.departureMode ? { mode: d.departureMode, reference: d.departureRef.trim(), to: d.departureTo.trim(), at: zonedToIso(d.departureAt, tz) ?? '' } : null,
    pickup: attending && d.pickup && !(d.arrivalChoice === 'now' && d.arrivalMode === 'self-drive'),
    drop: attending && d.drop,
    stay: attending && view.stayOffered ? (d.stay || null) : null,
    dietary: attending ? d.dietary : {},
    accessibility: attending ? d.accessibility : {},
  };
}

export function GuestInvitation({ token }: { token: string }) {
  return (
    <MotionProvider>
      <GuestFlow token={token} />
    </MotionProvider>
  );
}

function GuestFlow({ token }: { token: string }) {
  const [load, setLoad] = useState<Load>({ phase: 'loading' });
  const [draft, setDraft] = useState<GuestDraft | null>(null);
  const [step, setStep] = useState<GuestStep>('welcome');
  const [errors, setErrors] = useState<Array<{ id: string; message: string }>>([]);
  const [attempt, setAttempt] = useState(0);
  const [save, setSave] = useState<'unsaved' | 'saving' | 'saved' | 'failed'>('unsaved');
  const [submitError, setSubmitError] = useState<AdapterError | null>(null);
  const [done, setDone] = useState<{ view: InvitationView; replayed: boolean } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const requestId = useRef<string | null>(null);
  const pending = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstStep = useRef(true);
  const storageKey = `tnp-rsvp-guest-draft-${token}`;

  const applyView = useCallback((r: Awaited<ReturnType<ReturnType<typeof getAdapter>['loadInvitation']>>, keepDraft: GuestDraft | null) => {
    if (!r.ok) return setLoad({ phase: 'error', error: r.error });
    let restored = keepDraft;
    if (!restored) {
      try {
        const raw = window.sessionStorage.getItem(storageKey);
        restored = raw ? (JSON.parse(raw) as GuestDraft) : null;
      } catch {
        restored = null;
      }
    }
    const removed = restored ? Object.keys(restored.responses).filter((id) => !r.value.members.some((m) => m.id === id)) : [];
    if (removed.length) setNotice(`Your party list was updated by the organizer; ${removed.length} person(s) are no longer included. Please review.`);
    setDraft(draftFrom(r.value, restored));
    setLoad({ phase: 'ready', view: r.value });
  }, [storageKey]);

  useEffect(() => {
    let live = true;
    void getAdapter()
      .loadInvitation(token)
      .then((r) => {
        if (live) applyView(r, null);
      });
    return () => {
      live = false;
    };
  }, [token, applyView]);

  // User-initiated reloads show the loading state first; the initial state is already loading.
  const reload = (keepDraft: GuestDraft | null) => {
    setLoad({ phase: 'loading' });
    void getAdapter()
      .loadInvitation(token)
      .then((r) => applyView(r, keepDraft));
  };

  useEffect(() => {
    if (!draft) return;
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify(draft));
    } catch {
      /* answers stay on screen even when storage is blocked */
    }
  }, [draft, storageKey]);

  const view = load.phase === 'ready' ? load.view : null;
  const steps = useMemo(() => (draft && view ? guestSteps(draft, view.stayOffered) : []), [draft, view]);
  const current = steps.length ? reconcileStep(step, steps) : step;
  const index = steps.indexOf(current);

  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [current, done]);

  if (load.phase === 'loading') {
    return (
      <main className={styles.guestRoot} id="main-content" tabIndex={-1}>
        <div className={styles.guestBand} />
        <div className={styles.guestCard}>
          <Skeleton rows={5} label="Opening your invitation" />
        </div>
      </main>
    );
  }
  if (load.phase === 'error') {
    const e = load.error;
    const title = e.code === 'expired' ? 'This invitation link has expired' : e.code === 'revoked' ? 'This invitation link is no longer active' : e.code === 'not-found' ? 'We could not find this invitation' : 'We could not open your invitation';
    return (
      <main className={styles.guestRoot} id="main-content" tabIndex={-1}>
        <div className={styles.guestBand} />
        <div className={styles.guestCard}>
          <StatePanel
            tone={e.retryable ? 'warning' : 'locked'}
            title={title}
            action={
              e.retryable ? (
                <button type="button" className={styles.btnPrimary} onClick={() => reload(null)}>
                  <RefreshCw size={15} aria-hidden /> Try again
                </button>
              ) : undefined
            }
          >
            <p>{e.retryable ? e.message : 'Please ask the organizer for a new link. For your privacy this page shows no event or guest details.'}</p>
          </StatePanel>
        </div>
      </main>
    );
  }
  if (!view || !draft) return null;
  const tz = view.event.timezone;
  const fnName = (id: string) => view.functions.find((f) => f.id === id)?.name ?? id;
  const update = (patch: Partial<GuestDraft>) => {
    setDraft({ ...draft, ...patch });
    setSave('unsaved');
  };

  const goNext = () => {
    const errs = validateStep(current, draft, view.members, fnName);
    setErrors(errs);
    setAttempt((a) => a + 1);
    if (errs.length) return;
    setStep(steps[index + 1]);
  };
  const goBack = () => {
    setErrors([]);
    setStep(steps[Math.max(index - 1, 0)]);
  };

  const submit = async (mode: 'new' | 'retry') => {
    if (pending.current) return;
    const errs = steps.flatMap((s) => validateStep(s, draft, view.members, fnName));
    if (errs.length) {
      setErrors(errs);
      setAttempt((a) => a + 1);
      return;
    }
    pending.current = true;
    if (mode === 'new' || !requestId.current) requestId.current = newRequestId('guest');
    setSave('saving');
    setSubmitError(null);
    const r = await getAdapter().submitInvitation(token, requestId.current, view.party.version, toAnswers(draft, view));
    pending.current = false;
    if (r.ok) {
      setSave('saved');
      setDone({ view: r.value, replayed: r.replayed });
      requestId.current = null;
      try {
        window.sessionStorage.removeItem(storageKey);
      } catch {
        /* ignore */
      }
    } else {
      setSave('failed');
      setSubmitError(r.error);
    }
  };

  if (done) {
    const d = done.view;
    const attending = d.members.some((m) => Object.values(m.responses).some((v) => v === 'confirmed' || v === 'tentative'));
    return (
      <main className={styles.guestRoot} id="main-content" tabIndex={-1}>
        <div className={styles.guestBand} />
        <div className={`${styles.guestCard} ${styles.reveal}`}>
          <CheckCircle2 size={34} className={styles.doneIcon} aria-hidden />
          <h1 ref={headingRef} tabIndex={-1} className={styles.guestTitle}>
            {done.replayed ? 'Your response was already saved' : 'Thank you — your response is saved'}
          </h1>
          <p>
            {attending ? `We look forward to welcoming ${d.party.displayName} to ${d.event.name}.` : `We’ve noted that ${d.party.displayName} can’t attend. Thank you for letting ${d.event.hosts} know.`}
          </p>
          {view.lateChange && view.submittedBefore && <p className={styles.notice}>Because the event is close, the organizer will review your changes before updating travel or rooms.</p>}
          <ul className={styles.plainList}>
            {d.members.map((m) => (
              <li key={m.id}>
                <strong>{m.name}</strong>: {m.invitedFunctionIds.map((f) => `${d.functions.find((x) => x.id === f)?.name} — ${FUNCTION_RSVP_LABEL[m.responses[f] ?? 'awaiting']}`).join('; ')}
              </li>
            ))}
          </ul>
          <p className={styles.meta}>Synthetic preview: saved to this browser tab only. No email or WhatsApp confirmation was sent.</p>
          {!d.closed && (
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => {
                setDone(null);
                setStep('attendance');
                setSave('unsaved');
                reload(null);
              }}
            >
              Revise my response
            </button>
          )}
        </div>
      </main>
    );
  }

  if (view.closed) {
    return (
      <main className={styles.guestRoot} id="main-content" tabIndex={-1}>
        <div className={styles.guestBand} />
        <div className={styles.guestCard}>
          <Lock size={26} aria-hidden />
          <h1 className={styles.guestTitle}>RSVP for {view.event.name} has closed</h1>
          <p>Responses closed {formatExact(view.event.rsvpClosesAt, tz)}. For changes, please contact {view.organizer.replace(/\.$/, '')}.</p>
          <ul className={styles.plainList}>
            {view.members.map((m) => (
              <li key={m.id}>
                <strong>{m.name}</strong>: {m.invitedFunctionIds.map((f) => `${fnName(f)} — ${FUNCTION_RSVP_LABEL[m.responses[f] ?? 'awaiting']}`).join('; ')}
              </li>
            ))}
          </ul>
        </div>
      </main>
    );
  }

  const attending = anyAttending(draft);

  return (
    <main className={styles.guestRoot} id="main-content" tabIndex={-1}>
      <div className={styles.guestBand}>
        <p className={styles.previewLabel}>Synthetic preview invitation · sample event · do not enter real personal information</p>
        <p className={styles.kicker}>{view.event.hosts}</p>
        <p className={styles.guestEvent}>{view.event.name}</p>
      </div>
      <div className={styles.guestCard}>
        <div className={styles.guestProgress}>
          <p aria-live="polite">
            Step {index + 1} of {steps.length}: <strong>{STEP_LABEL[current]}</strong>
          </p>
          <span className={styles.saveState} data-state={save}>
            {save === 'unsaved' ? 'Not sent yet' : save === 'saving' ? 'Sending…' : save === 'saved' ? 'Saved' : 'Not saved'}
          </span>
          <div className={styles.progressTrack} aria-hidden>
            <span style={{ transform: `scaleX(${(index + 1) / steps.length})` }} />
          </div>
        </div>
        {notice && <p className={styles.notice}>{notice}</p>}
        <ErrorSummary errors={errors} focusKey={attempt} />
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (current === 'review') void submit('new');
            else goNext();
          }}
          className={styles.guestForm}
        >
          <div key={current} className={styles.stepEnter}>
            <h1 ref={headingRef} tabIndex={-1} className={styles.guestTitle}>
              {current === 'welcome' ? `You’re invited, ${view.party.displayName}` : STEP_LABEL[current]}
            </h1>
            {current === 'welcome' && (
              <>
                <IllustrativeImage image={{ id: `rsvp-guest-${view.event.id}`, mediaId: view.event.imageId, alt: `Illustrative setting for ${view.event.name}`, provenance: 'Unsplash preview media via data/media' }} className={styles.guestImage} eager />
                <p className={styles.sender}>
                  <ShieldCheck size={16} aria-hidden /> Sent by <strong>{view.organizer}</strong> on behalf of {view.event.hosts}. Reference <code>{view.party.ref}</code>.
                </p>
                <ul className={styles.fnCards}>
                  {view.functions.map((f) => (
                    <li key={f.id}>
                      <strong>{f.name}</strong>
                      <span>{formatExact(f.startsAt, tz)}</span>
                      <span>
                        {f.venue} · {f.dressCode}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className={styles.meta}>We only ask about travel and stay if someone is attending. This form never asks for identity documents.</p>
              </>
            )}
            {current === 'party' && (
              <>
                <p>This invitation covers these people. It allows up to {view.party.allowedAccompanying} accompanying guest(s).</p>
                <ul className={styles.memberCards}>
                  {view.members.map((m) => (
                    <li key={m.id}>
                      <strong>{m.name}</strong> <span className={styles.meta}>{m.ageBand}</span>
                    </li>
                  ))}
                </ul>
                <p className={styles.meta}>To add or remove someone, please contact {view.organizer}; the form cannot change who is invited.</p>
              </>
            )}
            {current === 'attendance' &&
              view.functions.map((f) => (
                <fieldset key={f.id} className={styles.fnFieldset}>
                  <legend>
                    {f.name} <span className={styles.meta}>{formatExact(f.startsAt, tz)}</span>
                  </legend>
                  {view.members
                    .filter((m) => m.invitedFunctionIds.includes(f.id))
                    .map((m) => {
                      const id = `rsvp-${m.id}-${f.id}`;
                      const err = errors.find((e) => e.id === id);
                      return (
                        <div key={m.id} role="radiogroup" aria-labelledby={`${id}-label`} aria-describedby={err ? `${id}-error` : undefined} aria-invalid={err ? true : undefined} className={styles.answerRow}>
                          <span id={`${id}-label`} className={styles.answerName}>
                            {m.name}
                          </span>
                          <div className={styles.answerOptions}>
                            {ANSWERS.map(([v, label], k) => (
                              <label key={v} className={styles.answerOption}>
                                <input
                                  type="radio"
                                  id={k === 0 ? id : undefined}
                                  name={id}
                                  value={v}
                                  checked={draft.responses[m.id]?.[f.id] === v}
                                  onChange={() => update({ responses: { ...draft.responses, [m.id]: { ...draft.responses[m.id], [f.id]: v } } })}
                                />
                                <span>{label}</span>
                              </label>
                            ))}
                          </div>
                          {err && (
                            <span id={`${id}-error`} className={styles.fieldError}>
                              {err.message}
                            </span>
                          )}
                        </div>
                      );
                    })}
                </fieldset>
              ))}
            {current === 'travel' && (
              <>
                <p className={styles.meta}>Times are in the event’s local time ({tz}). Arrival and departure are separate.</p>
                <TravelFields dir="arrival" draft={draft} update={update} errors={errors} />
                <TravelFields dir="departure" draft={draft} update={update} errors={errors} />
              </>
            )}
            {current === 'transfers' && (
              <fieldset className={styles.fnFieldset}>
                <legend>Would you like transport?</legend>
                <label className={styles.checkField}>
                  <input
                    {...fieldProps('pickup', errors)}
                    type="checkbox"
                    checked={draft.pickup}
                    onChange={(e) => update({ pickup: e.target.checked })}
                    disabled={draft.arrivalChoice === 'now' && draft.arrivalMode === 'self-drive' && !draft.pickup}
                  />
                  Pickup when I arrive
                </label>
                {draft.arrivalChoice === 'now' && draft.arrivalMode === 'self-drive' && <p className={styles.meta}>You’re driving yourself on arrival, so no pickup is needed. You can still request a drop when leaving.</p>}
                <FieldError id="pickup" errors={errors} />
                <label className={styles.checkField}>
                  <input type="checkbox" checked={draft.drop} onChange={(e) => update({ drop: e.target.checked })} /> Drop when I depart
                </label>
              </fieldset>
            )}
            {current === 'stay' && (
              <fieldset className={styles.fnFieldset} aria-describedby={errors.some((e) => e.id === 'stay-needed') ? 'stay-needed-error' : undefined}>
                <legend>Do you need a stay arranged?</legend>
                {(
                  [
                    ['needed', 'Yes, please arrange a stay'],
                    ['not-needed', 'No, we have our own arrangements'],
                  ] as const
                ).map(([v, l], k) => (
                  <label key={v} className={styles.answerOption}>
                    <input type="radio" name="stay" id={k === 0 ? 'stay-needed' : undefined} checked={draft.stay === v} onChange={() => update({ stay: v })} />
                    <span>{l}</span>
                  </label>
                ))}
                <FieldError id="stay-needed" errors={errors} />
                <p className={styles.meta}>Requesting a stay is not a room booking; the organizer will confirm details separately.</p>
              </fieldset>
            )}
            {current === 'requests' &&
              view.members.map((m) => (
                <fieldset key={m.id} className={styles.fnFieldset}>
                  <legend>{m.name}</legend>
                  <label className={styles.field}>
                    <span>Dietary request</span>
                    <input value={draft.dietary[m.id] ?? ''} onChange={(e) => update({ dietary: { ...draft.dietary, [m.id]: e.target.value } })} maxLength={120} />
                  </label>
                  <label className={styles.field}>
                    <span>Accessibility need</span>
                    <input value={draft.accessibility[m.id] ?? ''} onChange={(e) => update({ accessibility: { ...draft.accessibility, [m.id]: e.target.value } })} maxLength={120} />
                  </label>
                </fieldset>
              ))}
            {current === 'review' && (
              <div className={styles.reviewList}>
                <section>
                  <h2>Attendance</h2>
                  <ul className={styles.plainList}>
                    {view.members.map((m) => (
                      <li key={m.id}>
                        <strong>{m.name}</strong>: {m.invitedFunctionIds.map((f) => `${fnName(f)} — ${ANSWERS.find(([v]) => v === draft.responses[m.id]?.[f])?.[1] ?? 'Not answered'}`).join('; ')}
                      </li>
                    ))}
                  </ul>
                  <button type="button" className={styles.linkBtn} onClick={() => setStep('attendance')}>
                    Change attendance
                  </button>
                </section>
                {attending ? (
                  <section>
                    <h2>Travel and stay</h2>
                    <p>
                      Arrival: {draft.arrivalChoice === 'later' ? 'details to follow' : `${TRAVEL_MODE_LABEL[draft.arrivalMode as TravelMode] ?? ''} ${draft.arrivalRef} · ${draft.arrivalAt.replace('T', ' ')}`}
                    </p>
                    <p>
                      Departure: {draft.departureChoice === 'later' ? 'details to follow' : `${TRAVEL_MODE_LABEL[draft.departureMode as TravelMode] ?? ''} ${draft.departureRef} · ${draft.departureAt.replace('T', ' ')}`}
                    </p>
                    <p>
                      Pickup: {draft.pickup && !(draft.arrivalChoice === 'now' && draft.arrivalMode === 'self-drive') ? 'requested' : 'not needed'} · Drop: {draft.drop ? 'requested' : 'not needed'}
                      {view.stayOffered && ` · Stay: ${draft.stay === 'needed' ? 'requested' : 'not needed'}`}
                    </p>
                    <button type="button" className={styles.linkBtn} onClick={() => setStep('travel')}>
                      Change travel
                    </button>
                  </section>
                ) : (
                  <p className={styles.meta}>No one is attending, so we won’t ask about travel, transport or stay.</p>
                )}
                {view.lateChange && view.submittedBefore && <p className={styles.notice}>The event is close: the organizer will review changes before updating travel or rooms.</p>}
              </div>
            )}
          </div>
          {submitError && (
            <div className={styles.actionError} role="alert">
              <p>{submitError.message}</p>
              <div className={styles.inlineActions}>
                {submitError.retryable && (
                  <button type="button" className={styles.btnSecondary} onClick={() => void submit('retry')}>
                    <RefreshCw size={14} aria-hidden /> Try again
                  </button>
                )}
                {submitError.code === 'stale-version' && (
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => {
                      setSubmitError(null);
                      requestId.current = null;
                      reload(draft);
                    }}
                  >
                    Load the latest invitation (keeps your answers)
                  </button>
                )}
              </div>
            </div>
          )}
          <div className={styles.guestNav}>
            {index > 0 && (
              <button type="button" className={styles.btnSecondary} onClick={goBack}>
                <ArrowLeft size={15} aria-hidden /> Back
              </button>
            )}
            {current === 'review' ? (
              <button type="submit" className={styles.btnPrimary} disabled={save === 'saving'}>
                <PendingLabel pending={save === 'saving'} idle="Send my response" busy="Sending…" />
              </button>
            ) : (
              <button type="submit" className={styles.btnPrimary}>
                {current === 'welcome' ? 'Begin' : 'Next'} <ArrowRight size={15} aria-hidden />
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}

function TravelFields({ dir, draft, update, errors }: { dir: 'arrival' | 'departure'; draft: GuestDraft; update: (p: Partial<GuestDraft>) => void; errors: Array<{ id: string; message: string }> }) {
  const choice = dir === 'arrival' ? draft.arrivalChoice : draft.departureChoice;
  const mode = dir === 'arrival' ? draft.arrivalMode : draft.departureMode;
  const ref = dir === 'arrival' ? draft.arrivalRef : draft.departureRef;
  const place = dir === 'arrival' ? draft.arrivalFrom : draft.departureTo;
  const at = dir === 'arrival' ? draft.arrivalAt : draft.departureAt;
  const set = (k: 'Choice' | 'Mode' | 'Ref' | 'At' | 'Place', v: string) => {
    const key = k === 'Place' ? (dir === 'arrival' ? 'arrivalFrom' : 'departureTo') : `${dir}${k}`;
    update({ [key]: v } as Partial<GuestDraft>);
  };
  return (
    <fieldset className={styles.fnFieldset}>
      <legend>{dir === 'arrival' ? 'Arrival' : 'Departure'}</legend>
      <div className={styles.answerOptions}>
        {(
          [
            ['now', 'I’ll share details now'],
            ['later', 'I’ll share them later'],
          ] as const
        ).map(([v, l]) => (
          <label key={v} className={styles.answerOption}>
            <input type="radio" name={`${dir}-choice`} checked={choice === v} onChange={() => set('Choice', v)} />
            <span>{l}</span>
          </label>
        ))}
      </div>
      {choice === 'now' && (
        <div className={styles.grid2}>
          <label className={styles.field}>
            <span>How are you {dir === 'arrival' ? 'arriving' : 'leaving'}? *</span>
            <select {...fieldProps(`${dir}-mode`, errors)} value={mode} onChange={(e) => set('Mode', e.target.value)}>
              <option value="">Choose</option>
              {Object.entries(TRAVEL_MODE_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            <FieldError id={`${dir}-mode`} errors={errors} />
          </label>
          <label className={styles.field}>
            <span>{dir === 'arrival' ? 'Arrival' : 'Departure'} date and time *</span>
            <input {...fieldProps(`${dir}-at`, errors)} type="datetime-local" value={at} onChange={(e) => set('At', e.target.value)} />
            <FieldError id={`${dir}-at`} errors={errors} />
          </label>
          {mode !== 'self-drive' && mode !== 'local' && mode !== '' && (
            <label className={styles.field}>
              <span>Flight / train / bus number</span>
              <input value={ref} onChange={(e) => set('Ref', e.target.value)} autoComplete="off" />
            </label>
          )}
          <label className={styles.field}>
            <span>{dir === 'arrival' ? 'Travelling from' : 'Travelling to'}</span>
            <input value={place} onChange={(e) => set('Place', e.target.value)} />
          </label>
        </div>
      )}
    </fieldset>
  );
}
