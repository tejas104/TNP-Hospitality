'use client';

import { Check, CircleDot } from 'lucide-react';
import { useState } from 'react';
import { PortalHero } from '@/components/tnp/shared/PortalHero';
import { StatusPill } from '@/components/tnp/shared/StatusPill';

const requirementRoles = ['Coordinator', 'Executive', 'Volunteer', 'Hostess', 'RSVP'];

export function PlannerPortal() {
  const [registered, setRegistered] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  return (
    <main className="portal-page product-page">
      <PortalHero
        label="PLANNER PORTAL"
        title="Plan beautiful events with serious workforce control."
        copy="Prepare a sample planner profile, manpower requirement and status journey for TNP Operations."
        image="event-hall"
      />

      <section className="planner-grid">
        <form
          className="ops-card registration-card"
          onSubmit={(event) => {
            event.preventDefault();
            setRegistered(true);
          }}
        >
          <p className="section-kicker">PLANNER REGISTRATION</p>
          <h2>Mehta Events & Experiences</h2>
          <label>
            Name
            <input defaultValue="Rohan Mehta" />
          </label>
          <label>
            GST status
            <select defaultValue="Available">
              <option>Available</option>
              <option>Pending</option>
            </select>
          </label>
          <label>
            Event requirement
            <textarea defaultValue="3 Event Executives and 4 Volunteers for a destination wedding." />
          </label>
          <button type="submit" className="magnetic-btn dark">
            Submit Verification
          </button>
          {registered && <StatusPill tone="green" label="Sample planner profile saved for preview" />}
        </form>

        <form
          className="ops-card requirement-card"
          onSubmit={(event) => {
            event.preventDefault();
            setRequestSent(true);
          }}
        >
          <p className="section-kicker">WORKFORCE REQUEST</p>
          <div className="step-list">
            {[
              ['01', 'What do you need?', requirementRoles.join(', ')],
              ['02', 'How many?', '10 professionals'],
              ['03', 'Event date', '14 September 2026'],
              ['04', 'Venue', 'Royal Palace, Jaipur'],
              ['05', 'Special instructions', 'Guest-facing English and Hindi communication'],
            ].map(([num, title, value]) => (
              <label key={num}>
                <span>{num}</span>
                {title}
                <input defaultValue={value} />
              </label>
            ))}
          </div>
          <button type="submit" className="magnetic-btn dark">
            Submit Requirement
          </button>
          {requestSent && (
            <div className="success-banner dark">
              <Check size={18} /> Sample requirement saved for preview.
            </div>
          )}
        </form>
      </section>

      <section className="status-timeline ops-card">
        <p className="section-kicker">SAMPLE REQUIREMENT STATUS</p>
        {['Draft', 'Verification', 'Approved', 'Published', 'Team Filling', 'Team Confirmed', 'Completed'].map(
          (step, index) => (
            <span key={step} className={index < (requestSent ? 5 : 2) ? 'done' : ''}>
              <CircleDot size={16} />
              {step}
            </span>
          ),
        )}
      </section>
    </main>
  );
}
