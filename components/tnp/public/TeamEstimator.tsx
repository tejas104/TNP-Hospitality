'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, UsersRound } from 'lucide-react';
import { encodeTeam, estimateTeam, OCCASIONS, type Occasion } from './team-estimate';
import styles from './Public.module.css';

/**
 * Helps a client who doesn't know how many people to ask for: three inputs,
 * an illustrative team, and a hand-off that pre-fills the contact form.
 */
export default function TeamEstimator() {
  const [occasion, setOccasion] = useState<Occasion>('Wedding');
  const [guests, setGuests] = useState(250);
  const [days, setDays] = useState(2);
  const estimate = estimateTeam(occasion, guests, days);
  const href = `/contact?interest=event-request&occasion=${encodeURIComponent(occasion)}&guests=${guests}&team=${encodeURIComponent(encodeTeam(estimate.roles))}`;
  return (
    <section className={styles.estimator} aria-labelledby="estimator-title">
      <div className={styles.estimatorIntro}>
        <h2 id="estimator-title">How many people will your event need?</h2>
        <p>
          Move the sliders for a starting team. Send it to TNP and we refine it
          with you — illustrative ratios, not a quote.
        </p>
      </div>
      <div className={styles.estimatorBody}>
        <div className={styles.estimatorInputs}>
          <fieldset>
            <legend>Occasion</legend>
            <div className={styles.estimatorChips}>
              {OCCASIONS.map((o) => (
                <button key={o} type="button" aria-pressed={occasion === o} onClick={() => setOccasion(o)}>
                  {o}
                </button>
              ))}
            </div>
          </fieldset>
          <label>
            <span>
              Guests <output>{guests}</output>
            </span>
            <input type="range" min={20} max={1500} step={10} value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
          </label>
          <label>
            <span>
              Function days <output>{days}</output>
            </span>
            <input type="range" min={1} max={5} step={1} value={days} onChange={(e) => setDays(Number(e.target.value))} />
          </label>
        </div>
        <div className={styles.estimatorResult} aria-live="polite">
          <p className={styles.estimatorTotal}>
            <UsersRound size={22} aria-hidden="true" />
            <strong>{estimate.perDay}</strong> people per function day
            <small>{estimate.personDays} person-days across {days} day{days > 1 ? 's' : ''}</small>
          </p>
          <ul>
            {estimate.roles.map((r) => (
              <li key={r.role}>
                <span>{r.role}</span>
                <i style={{ width: `${Math.min(100, (r.people / estimate.perDay) * 100 * 2.2)}%` }} aria-hidden="true" />
                <b>{r.people}</b>
              </li>
            ))}
          </ul>
          <Link className={styles.creamButton} href={href}>
            Send this team to TNP <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
          <small className={styles.estimatorNote}>
            Opens the enquiry form with these numbers filled in. Nothing is sent until you submit.
          </small>
        </div>
      </div>
    </section>
  );
}
