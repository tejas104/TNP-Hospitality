'use client';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  FileCheck2,
  RotateCcw,
} from 'lucide-react';
import {
  currentApplication,
  draftErrors,
  freshDraft,
  questions,
  readDraft,
  roles,
  sampleScore,
  storageKey,
  type ApplicationDraft,
} from './freelancerState.ts';
import type { FreelancerWorkspace } from './useFreelancer.ts';
import styles from './FreelancerPortal.module.css';

const steps = [
  'Your introduction',
  'Your experience',
  'Sample assessment',
  'Review & submit',
];
export function ApplicationFlow({
  workspace: w,
  profile,
}: {
  workspace: FreelancerWorkspace;
  profile: string;
}) {
  const generation = w.data!.generation;
  const key = storageKey('draft', profile, generation);
  const [draft, setDraft] = useState<ApplicationDraft>(freshDraft);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState('Loading your draft…');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const heading = useRef<HTMLHeadingElement>(null);
  const application = currentApplication(w.data!.applications, profile);
  const assessment = w.data!.assessments.at(-1);
  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      try {
        setDraft(readDraft(window.localStorage.getItem(key)));
        setSaved('Draft restored on this browser');
      } catch (e) {
        setDraft(freshDraft());
        setSaved(
          e instanceof Error
            ? e.message
            : 'Storage unavailable. Draft stays in memory.',
        );
      }
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, [key]);
  function saveDraft(next: ApplicationDraft) {
    setDraft(next);
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
      setSaved('Draft saved on this browser');
    } catch {
      setSaved(
        'Unsaved changes · storage unavailable. Draft stays in memory; keep this page open.',
      );
    }
  }
  function update<K extends keyof ApplicationDraft>(
    field: K,
    value: ApplicationDraft[K],
  ) {
    saveDraft({ ...draft, [field]: value });
    setErrors({});
  }
  function validate(step: number) {
    const next = draftErrors(draft, step);
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      if (step === 3)
        setDraft((d) => ({ ...d, step: first.startsWith('question') ? 2 : 0 }));
      window.setTimeout(() => document.getElementById(first)?.focus(), 0);
      return false;
    }
    return true;
  }
  function advance() {
    if (validate(draft.step)) {
      update('step', Math.min(3, draft.step + 1));
      window.setTimeout(() => heading.current?.focus(), 0);
    }
  }
  async function submit() {
    if (!validate(3)) return;
    await w.run('registerApplicant', {
      applicantId: profile,
      displayName: draft.name,
      role: draft.role,
    });
  }
  const score = sampleScore(draft.answers);
  if (!ready) return <output>Restoring your application…</output>;
  if (application)
    return (
      <section className={styles.result} aria-labelledby="application-result">
        <div className={styles.resultIcon}>
          <FileCheck2 size={30} />
        </div>
        <p className={styles.eyebrow}>YOUR SAMPLE APPLICATION</p>
        <h2 id="application-result">
          {application.status === 'approved-sample'
            ? 'Your sample profile is approved.'
            : application.status === 'rejected'
              ? 'This application needs another look.'
              : application.status === 'invalid'
                ? 'Your sample details need attention.'
                : 'A good beginning. Your review is next.'}
        </h2>
        <p>
          {application.status === 'pending'
            ? 'The application is saved in this browser’s synthetic service. A sample assessment does not approve your account or unlock real work.'
            : application.reviewReason}
        </p>
        <div className={styles.receipt}>
          <span>Application reference</span>
          <strong>{application.id}</strong>
          <button
            type="button"
            className={styles.textButton}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(application.id);
                w.setNotice('Application reference copied.');
              } catch {
                w.setNotice(`Copy manually: ${application.id}`);
              }
            }}
          >
            <Copy size={16} /> Copy reference
          </button>
        </div>
        <dl className={styles.facts}>
          <div>
            <dt>Preferred role</dt>
            <dd>{application.role || 'Not supplied'}</dd>
          </div>
          <div>
            <dt>Review status</dt>
            <dd>{application.status}</dd>
          </div>
          <div>
            <dt>Sample assessment</dt>
            <dd>
              {assessment
                ? `${assessment.score}% · ${assessment.status}`
                : 'Not yet submitted'}
            </dd>
          </div>
          <div>
            <dt>Identity checks</dt>
            <dd>Not connected · no documents collected</dd>
          </div>
        </dl>
        {!assessment && application.status === 'pending' && (
          <div className={styles.assessmentResume}>
            <h3>Complete your sample assessment</h3>
            <p>
              Three practice questions. The score is calculated here and saved
              as a synthetic result.
            </p>
            {questions.map((q, i) => (
              <Question
                key={q.text}
                index={i}
                answer={draft.answers[i]}
                error={errors[`question-${i}`]}
                onChange={(n) =>
                  update(
                    'answers',
                    draft.answers.map((v, index) => (index === i ? n : v)),
                  )
                }
              />
            ))}
            <button
              type="button"
              className={styles.primary}
              disabled={w.busy}
              onClick={() => {
                if (validate(2))
                  void w.run('submitAssessment', {
                    applicantId: profile,
                    score,
                  });
              }}
            >
              Save sample assessment <ArrowRight size={17} />
            </button>
          </div>
        )}
        <p className={styles.note}>
          Reference lookup is limited to the selected sample profile. It is not
          secure anonymous tracking. No live KYC or account access has been
          granted.
        </p>
      </section>
    );
  return (
    <div className={styles.applicationLayout}>
      <aside className={styles.journey}>
        <p className={styles.eyebrow}>MAKE YOUR INTRODUCTION</p>
        <h2>
          Great hospitality
          <br />
          starts with you.
        </h2>
        <p>
          Bring your care, curiosity and attention to detail. We’ll help you
          explore the next step.
        </p>
        <ol>
          {steps.map((step, i) => (
            <li key={step} aria-current={draft.step === i ? 'step' : undefined}>
              <span>{i < draft.step ? <Check size={16} /> : `0${i + 1}`}</span>
              <div>
                {step}
                <small>
                  {i === draft.step
                    ? 'You are here'
                    : i < draft.step
                      ? 'Completed'
                      : 'Coming up'}
                </small>
              </div>
            </li>
          ))}
        </ol>
        <div className={styles.journeyNote}>
          <CheckCircle2 size={21} />
          <p>
            Sample choices only. Your real personal information and identity
            documents are not needed.
          </p>
        </div>
      </aside>
      <section className={styles.formPanel} aria-labelledby="application-step">
        <div className={styles.sectionMeta}>
          <span>STEP {draft.step + 1} OF 4</span>
          <output>{saved}</output>
        </div>
        <h2 ref={heading} id="application-step" tabIndex={-1}>
          {steps[draft.step]}
        </h2>
        <p className={styles.muted}>
          {draft.step === 0
            ? 'A simple introduction, using synthetic information.'
            : draft.step === 1
              ? 'Make this draft feel like you. These fields stay local and are not submitted to the service.'
              : draft.step === 2
                ? 'A short practice experience, not an approved hiring assessment.'
                : 'Check what will be saved before you submit.'}
        </p>
        {Object.keys(errors).length > 0 && (
          <div className={styles.error} role="alert">
            <strong>Please check these details</strong>
            {Object.entries(errors).map(([id, message]) => (
              <a href={`#${id}`} key={id}>
                {message}
              </a>
            ))}
          </div>
        )}
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.step === 3) void submit();
            else advance();
          }}
        >
          <div key={draft.step} className={styles.stepContent}>
            {draft.step === 0 && (
              <>
                <label className={styles.field} htmlFor="sample-name">
                  Sample display name{' '}
                  <select
                    id="sample-name"
                    value={draft.name}
                    onChange={(e) => update('name', e.target.value)}
                    aria-invalid={!!errors['sample-name']}
                    aria-describedby="sample-name-help"
                  >
                    <option value="">Choose a sample name</option>
                    <option>Sample Alex</option>
                    <option>Sample Jordan</option>
                    <option>Sample Morgan</option>
                  </select>
                  <small id="sample-name-help">
                    A sample name is saved with your role. No real contact
                    details.
                  </small>
                </label>
                <label className={styles.field} htmlFor="sample-role">
                  Preferred role
                  <select
                    id="sample-role"
                    value={draft.role}
                    onChange={(e) => update('role', e.target.value)}
                    aria-invalid={!!errors['sample-role']}
                  >
                    <option value="">Choose your role</option>
                    {roles.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </label>
                <div className={styles.infoBox}>
                  <span>01</span>
                  <p>
                    Applications begin in <strong>pending review</strong>.
                    Taking the assessment does not automatically approve a
                    freelancer.
                  </p>
                </div>
              </>
            )}
            {draft.step === 1 && (
              <>
                <span className={styles.badge}>LOCAL DRAFT ONLY</span>
                <label className={styles.field} htmlFor="sample-experience">
                  Experience
                  <select
                    id="sample-experience"
                    value={draft.experience}
                    onChange={(e) => update('experience', e.target.value)}
                  >
                    <option value="">Optional sample choice</option>
                    <option>Getting started</option>
                    <option>1–3 years</option>
                    <option>4+ years</option>
                  </select>
                </label>
                <label className={styles.field} htmlFor="sample-skills">
                  Strengths
                  <select
                    id="sample-skills"
                    value={draft.skills}
                    onChange={(e) => update('skills', e.target.value)}
                  >
                    <option value="">Optional sample choice</option>
                    <option>Guest care and communication</option>
                    <option>Organisation and event coordination</option>
                    <option>Team support and problem solving</option>
                  </select>
                </label>
                <label className={styles.field} htmlFor="sample-availability">
                  Availability
                  <select
                    id="sample-availability"
                    value={draft.availability}
                    onChange={(e) => update('availability', e.target.value)}
                  >
                    <option value="">Optional sample choice</option>
                    <option>Weekends</option>
                    <option>Weekdays</option>
                    <option>Flexible</option>
                  </select>
                </label>
                <p className={styles.note}>
                  These preferences are saved only in this browser draft. They
                  do not change opportunity eligibility.
                </p>
              </>
            )}
            {draft.step === 2 &&
              questions.map((q, i) => (
                <Question
                  key={q.text}
                  index={i}
                  answer={draft.answers[i]}
                  error={errors[`question-${i}`]}
                  onChange={(n) =>
                    update(
                      'answers',
                      draft.answers.map((v, index) => (index === i ? n : v)),
                    )
                  }
                />
              ))}
            {draft.step === 3 && (
              <>
                <div className={styles.reviewBlock}>
                  <h3>Saved to the sample service</h3>
                  <dl className={styles.facts}>
                    <div>
                      <dt>Display name</dt>
                      <dd>{draft.name}</dd>
                    </div>
                    <div>
                      <dt>Preferred role</dt>
                      <dd>{draft.role}</dd>
                    </div>
                  </dl>
                </div>
                <div className={styles.reviewBlock}>
                  <h3>Local draft only</h3>
                  <p>
                    {[draft.experience, draft.skills, draft.availability]
                      .filter(Boolean)
                      .join(' · ') || 'No optional preferences added.'}
                  </p>
                </div>
                <div className={styles.reviewBlock}>
                  <h3>Practice assessment ready</h3>
                  <p>
                    Your sample answers are complete. After application
                    registration, save the assessment score separately.
                  </p>
                </div>
                <p className={styles.note}>
                  Submitting saves a synthetic application in this browser. It
                  does not send a message, perform KYC or create a production
                  account.
                </p>
              </>
            )}
          </div>
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.secondary}
              disabled={draft.step === 0 || w.busy}
              onClick={() => {
                update('step', draft.step - 1);
                window.setTimeout(() => heading.current?.focus(), 0);
              }}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              className={styles.primary}
              disabled={w.busy || w.loading}
              type="submit"
            >
              {w.busy
                ? 'Saving…'
                : draft.step === 3
                  ? 'Submit sample application'
                  : 'Continue'}
              <ArrowRight size={17} />
            </button>
          </div>
        </form>
        <button
          type="button"
          className={styles.textButton}
          disabled={w.busy}
          onClick={() => {
            if (
              window.confirm(
                'Discard this local application draft? Submitted service records are unchanged.',
              )
            ) {
              saveDraft(freshDraft());
              setErrors({});
              heading.current?.focus();
            }
          }}
        >
          <RotateCcw size={14} /> Discard local draft
        </button>
      </section>
    </div>
  );
}
function Question({
  index,
  answer,
  error,
  onChange,
}: {
  index: number;
  answer: number;
  error?: string;
  onChange: (n: number) => void;
}) {
  const question = questions[index];
  return (
    <fieldset
      className={styles.question}
      aria-describedby={error ? `question-error-${index}` : undefined}
    >
      <legend>
        {index + 1}. {question.text}
      </legend>
      {question.options.map((option, n) => (
        <label
          key={option}
          className={answer === n ? styles.radioSelected : styles.radio}
        >
          <input
            id={n === 0 ? `question-${index}` : undefined}
            type="radio"
            name={`question-${index}`}
            value={n}
            checked={answer === n}
            onChange={() => onChange(n)}
          />
          {option}
        </label>
      ))}
      {error && (
        <small id={`question-error-${index}`} className={styles.errorText}>
          {error}
        </small>
      )}
    </fieldset>
  );
}
