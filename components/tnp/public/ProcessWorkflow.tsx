'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';
import styles from './Home.module.css';

// Illustrative client journey. Timings are typical examples, not promises.
const STEPS = [
  {
    title: 'Share your vision',
    short: 'Tell us about your occasion, destination and the support you need.',
    who: 'You and a TNP event lead',
    when: 'Day 1 · a 20-minute call or a short form',
    points: ['Occasion, dates and city', 'Guest count and functions', 'Roles you think you need'],
    get: 'A clear brief you both agree on',
  },
  {
    title: 'Shape the experience',
    short: 'Align on the team, guest journey, responsibilities and event details.',
    who: 'TNP planner and coordinator',
    when: 'Within a few days',
    points: ['Team shape: coordinators, hosts, volunteers', 'Guest journey and RSVP needs', 'A quotation to review and adjust'],
    get: 'A quotation and a named team plan',
  },
  {
    title: 'Brief the team',
    short: 'Everyone arrives knowing the plan, the guests and their role.',
    who: 'Your coordinator and the event team',
    when: 'The week before',
    points: ['Reporting point, dress code, languages', 'Function-wise duties', 'Guest list and special requests'],
    get: 'One shared brief for every team member',
  },
  {
    title: 'Welcome the moment',
    short: 'Your hospitality team brings the plan together on the ground.',
    who: 'The full TNP team on site',
    when: 'Event day',
    points: ['Warm welcomes and guest guidance', 'Calm coordination between functions', 'Thank-you and follow-up after'],
    get: 'A celebration you can simply enjoy',
  },
];
const AUTO_MS = 5000;

export default function ProcessWorkflow() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const hover = useRef(0);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!auto || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const node = root.current;
    let visible = false;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    if (node) observer.observe(node);
    const timer = setInterval(() => {
      if (visible) setActive((i) => (i + 1) % STEPS.length);
    }, AUTO_MS);
    return () => {
      clearInterval(timer);
      observer.disconnect();
    };
  }, [auto]);
  const choose = (index: number) => {
    setAuto(false);
    setActive(index);
  };
  const step = STEPS[active];
  return (
    <div
      ref={root}
      className={styles.workflow}
      style={{ '--wf-progress': active / (STEPS.length - 1) } as CSSProperties}
    >
      <div className={styles.wfTrack} aria-hidden="true">
        <i />
      </div>
      <div className={styles.wfSteps} role="tablist" aria-label="How working with TNP flows">
        {STEPS.map((s, index) => (
          <button
            key={s.title}
            type="button"
            role="tab"
            id={`wf-tab-${index}`}
            aria-selected={index === active}
            aria-controls="wf-panel"
            tabIndex={index === active ? 0 : -1}
            data-done={index < active}
            onClick={() => choose(index)}
            onPointerMove={(e) => {
              if (e.pointerType !== 'mouse' || index === active) return;
              clearTimeout(hover.current);
              hover.current = window.setTimeout(() => choose(index), 80);
            }}
            onPointerLeave={() => clearTimeout(hover.current)}
            onKeyDown={(e) => {
              const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
              if (!delta) return;
              e.preventDefault();
              const next = (index + delta + STEPS.length) % STEPS.length;
              choose(next);
              document.getElementById(`wf-tab-${next}`)?.focus();
            }}
          >
            <span className={styles.wfDot}>{index < active ? <Check size={16} aria-hidden="true" /> : String(index + 1).padStart(2, '0')}</span>
            <strong>{s.title}</strong>
            <small>{s.short}</small>
          </button>
        ))}
      </div>
      <div
        id="wf-panel"
        role="tabpanel"
        aria-labelledby={`wf-tab-${active}`}
        className={styles.wfPanel}
        key={active}
      >
        <div>
          <p className={styles.eyebrow}>
            Step {active + 1} of {STEPS.length}
          </p>
          <h3>{step.title}</h3>
          <p>{step.short}</p>
          <dl>
            <div>
              <dt>Who</dt>
              <dd>{step.who}</dd>
            </div>
            <div>
              <dt>When</dt>
              <dd>{step.when}</dd>
            </div>
            <div>
              <dt>You get</dt>
              <dd>{step.get}</dd>
            </div>
          </dl>
        </div>
        <div>
          <ul>
            {step.points.map((point) => (
              <li key={point}>
                <Check size={16} aria-hidden="true" /> {point}
              </li>
            ))}
          </ul>
          <div className={styles.wfActions}>
            {active < STEPS.length - 1 ? (
              <button type="button" onClick={() => choose(active + 1)}>
                Next: {STEPS[active + 1].title} →
              </button>
            ) : (
              <button type="button" onClick={() => choose(0)}>
                Start again ↺
              </button>
            )}
            <Link href="/contact">
              Start with step one <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <small className={styles.wfNote}>Typical example timings, not a commitment.</small>
        </div>
      </div>
    </div>
  );
}
