'use client';

import { Bell, CalendarDays, MapPin, QrCode, ShieldCheck, Star, Users } from 'lucide-react';
import { useState } from 'react';
import { Metric } from '@/components/tnp/shared/Metric';
import { PortalHero } from '@/components/tnp/shared/PortalHero';
import { StatusPill } from '@/components/tnp/shared/StatusPill';

export function FreelancerPortal() {
  const [accepted, setAccepted] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [reminder, setReminder] = useState<'idle' | 'coming' | 'no-response'>('idle');
  const filled = accepted ? 8 : 7;

  return (
    <main className="portal-page product-page">
      <PortalHero
        label="FREELANCER PORTAL"
        title="Your next opportunity starts here."
        copy="Explore sample profile, assessment, role-match and event-work states for a TNP professional."
        image="team-briefing"
      />

      <section className="freelancer-summary">
        <div className="ops-card onboarding-flow">
          {['Create Profile', 'Complete Assessment', 'Get Role Matched', 'Start Accepting Events'].map(
            (step, index) => (
              <span key={step}>
                <strong>{String(index + 1).padStart(2, '0')}</strong>
                {step}
              </span>
            ),
          )}
          <div className="assessment-result">
            <h2>Rahul Sharma</h2>
            <p>94% Sample Suitability</p>
            <StatusPill tone="green" label="Sample recommended role: Event Coordinator" />
            <small>Sample verification state | Experience: 6 Years</small>
          </div>
        </div>

        <div className="ops-card profile-card">
          <p>GOOD EVENING, RAHUL</p>
          <h2>Sample Event Coordinator Profile</h2>
          <div className="metric-row">
            <Metric icon={<Star />} label="Rating" value="4.8" />
            <Metric icon={<ShieldCheck />} label="Reliability" value="97%" />
            <Metric icon={<CalendarDays />} label="Events" value="42" />
            <Metric icon={<Users />} label="Upcoming Earnings" value="₹18,500" />
          </div>
        </div>
      </section>

      <section className="opportunity-section">
        <article className="opportunity-card">
          <p className="section-kicker">SAMPLE OPPORTUNITY</p>
          <h2>Royal Wedding Experience</h2>
          <div className="opportunity-meta">
            <span>Jaipur</span>
            <span>14 September 2026</span>
            <span>Reporting: 8:00 AM</span>
            <span>Shift: 8:00 AM - 8:00 PM</span>
            <span>Role: Event Coordinator</span>
            <span>Rate: ₹2,500 / day</span>
          </div>
          <div className="slots" aria-label={`${filled} of 10 sample positions filled`}>
            {Array.from({ length: 10 }, (_, index) => (
              <i key={index} className={index < filled ? 'filled' : ''} />
            ))}
          </div>
          <p>{filled} / 10 sample positions filled</p>
          <button
            type="button"
            className="magnetic-btn dark"
            disabled={accepted}
            onClick={() => setAccepted(true)}
          >
            {accepted ? 'Sample Position Reserved' : 'Accept Sample Opportunity'}
          </button>
          {accepted && <StatusPill tone="green" label="Sample assignment confirmed in this preview" />}
        </article>

        <article className="ops-card reminder-card">
          <Bell size={22} />
          <h3>Sample Event Check-In Reminder</h3>
          <p>Royal Wedding - Jaipur</p>
          <strong>Reporting Time: 8:00 AM</strong>
          <div className="reminder-actions">
            <button type="button" onClick={() => setReminder('coming')}>
              I&apos;m Coming
            </button>
            <button type="button" onClick={() => setReminder('no-response')}>
              Show No Response
            </button>
          </div>
          {reminder === 'coming' && <StatusPill tone="green" label="Sample response: Coming" />}
          {reminder === 'no-response' && (
            <StatusPill tone="amber" label="Sample nonresponse state; no live replacement sent" />
          )}
        </article>
      </section>

      <section className="freelancer-tools">
        <div className="digital-pass ops-card">
          <p>TNP HOSPITALITY</p>
          <h2>Rahul Sharma</h2>
          <span>Event Coordinator | Royal Wedding | 14 Sep 2026</span>
          <div className="qr-box">
            <QrCode size={116} />
          </div>
          <StatusPill
            tone={checkedIn ? 'green' : 'amber'}
            label={checkedIn ? 'Sample attendance recorded | 7:52 AM' : 'Sample attendance not recorded'}
          />
          <button className="magnetic-btn dark" type="button" onClick={() => setCheckedIn(true)}>
            Show Sample Scan Result
          </button>
        </div>

        <div className="ops-card map-mini">
          <MapPin size={22} />
          <h3>Sample Venue Context</h3>
          <StatusPill tone="amber" label="Sample attendance state - location not verified" />
          <div className="map-canvas mini">
            <span className="venue-radius" />
            <i className="marker green m1" />
          </div>
        </div>

        <div className="ops-card ratings-card">
          <p className="section-kicker">SAMPLE RATINGS</p>
          <h2>Overall 4.8</h2>
          {['Professionalism 4.9', 'Punctuality 4.8', 'Guest Handling 4.9', 'Teamwork 4.7'].map((item) => (
            <span key={item}>{item}</span>
          ))}
          <p>Three consecutive poor sample ratings trigger human review, not automatic permanent blocking.</p>
        </div>

        <div className="ops-card earnings-card">
          <p className="section-kicker">SAMPLE EARNINGS</p>
          <div className="earning-stats">
            <Metric label="Available" value="₹18,500" />
            <Metric label="Pending" value="₹7,500" />
            <Metric label="Lifetime" value="₹1,84,500" />
          </div>
          <div className="bar-chart">
            {[45, 66, 38, 84, 72, 91].map((height, index) => (
              <i key={index} style={{ height: `${height}%` }} />
            ))}
          </div>
          <small>Preview values only. No payment or payout is processed.</small>
        </div>
      </section>
    </main>
  );
}
