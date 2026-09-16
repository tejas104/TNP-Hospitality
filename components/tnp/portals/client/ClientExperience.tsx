'use client';

import { ArrowUpRight, Check } from 'lucide-react';
import { useState } from 'react';
import { byId } from '@/data/media';

const clientCategories = ['Wedding', 'Corporate', 'Private Celebration', 'Destination'];

export function ClientExperience() {
  const [category, setCategory] = useState(clientCategories[0]);
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="portal-page client-page">
      <section className="client-hero">
        <img src={byId('palace-courtyard').src} alt={byId('palace-courtyard').alt} />
        <div>
          <p className="eyebrow">CLIENT EXPERIENCE</p>
          <h1>What are you planning?</h1>
          <p>
            Tell us the experience. We&apos;ll connect venues, planners, hospitality
            manpower and RSVP support around one brief.
          </p>
        </div>
      </section>

      <section className="client-discovery">
        <div className="category-stack" aria-label="Event category selection">
          {clientCategories.map((item) => (
            <button
              key={item}
              type="button"
              className={category === item ? 'active' : ''}
              onClick={() => setCategory(item)}
              data-cursor="EXPLORE"
            >
              {item}
              <ArrowUpRight size={18} />
            </button>
          ))}
        </div>
        <div className="concierge-panel">
          <span>{category}</span>
          <h2>A concierge brief, not a ticket.</h2>
          <p>
            Venue shortlisting, planner introductions, guest coordination and sample
            hospitality staffing can be shaped around your event scale.
          </p>
          <div className="concierge-images">
            <img src={byId('tablescape').src} alt={byId('tablescape').alt} />
            <img src={byId('hostess').src} alt={byId('hostess').alt} />
          </div>
        </div>
      </section>

      <section className="requirement-form client-form">
        <div>
          <p className="section-kicker">REQUEST SUPPORT</p>
          <h2>Build the first brief.</h2>
          <p>Use this sample preview flow to prepare a client requirement for TNP Operations.</p>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
          }}
        >
          <label>
            Event type
            <select defaultValue={category} onChange={(event) => setCategory(event.target.value)}>
              {clientCategories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            City
            <input defaultValue="Jaipur" />
          </label>
          <label>
            Estimated guests
            <input defaultValue="300" />
          </label>
          <label>
            Support needed
            <textarea defaultValue="Venue discovery, planner coordination, 10 hospitality professionals and RSVP follow-up." />
          </label>
          <button className="magnetic-btn" type="submit">
            Submit Requirement
          </button>
          {submitted && (
            <div className="success-banner">
              <Check size={18} /> Sample requirement saved for preview.
            </div>
          )}
        </form>
      </section>
    </main>
  );
}
