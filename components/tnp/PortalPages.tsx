'use client';

import {
  ArrowUpRight,
  BadgeCheck,
  Bell,
  CalendarDays,
  Check,
  CircleDot,
  MapPin,
  QrCode,
  ShieldCheck,
  Star,
  UserCheck,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { byId } from '@/data/media';

const clientCategories = ['Wedding', 'Corporate', 'Private Celebration', 'Destination'];
const requirementRoles = ['Coordinator', 'Executive', 'Volunteer', 'Hostess', 'RSVP'];

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
            Venue shortlisting, planner introductions, guest coordination and live
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
          <p>Use this demo flow to submit a premium client requirement to TNP Operations.</p>
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
              <Check size={18} /> Requirement submitted to TNP Operations.
            </div>
          )}
        </form>
      </section>
    </main>
  );
}

export function PlannerPortal() {
  const [registered, setRegistered] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  return (
    <main className="portal-page product-page">
      <PortalHero
        label="PLANNER PORTAL"
        title="Plan beautiful events with serious workforce control."
        copy="Register as a verified planner, submit manpower requirements and track the requirement status through TNP Operations."
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
          {registered && <StatusPill tone="green" label="Planner profile sent for verification" />}
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
              <Check size={18} /> Requirement submitted to TNP Operations.
            </div>
          )}
        </form>
      </section>

      <section className="status-timeline ops-card">
        <p className="section-kicker">REQUIREMENT STATUS</p>
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
        copy="Create a profile, complete an assessment, get role matched and start accepting event work as a verified TNP professional."
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
            <p>94% Suitability</p>
            <StatusPill tone="green" label="Recommended Role: Event Coordinator" />
            <small>Verified | Experience: 6 Years</small>
          </div>
        </div>

        <div className="ops-card profile-card">
          <p>GOOD EVENING, RAHUL</p>
          <h2>Verified Event Coordinator</h2>
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
          <p className="section-kicker">FIRST COME FIRST SERVED</p>
          <h2>Royal Wedding Experience</h2>
          <div className="opportunity-meta">
            <span>Jaipur</span>
            <span>14 September 2026</span>
            <span>Reporting: 8:00 AM</span>
            <span>Shift: 8:00 AM - 8:00 PM</span>
            <span>Role: Event Coordinator</span>
            <span>Rate: ₹2,500 / day</span>
          </div>
          <div className="slots" aria-label={`${filled} of 10 positions filled`}>
            {Array.from({ length: 10 }, (_, index) => (
              <i key={index} className={index < filled ? 'filled' : ''} />
            ))}
          </div>
          <p>{filled} / 10 positions filled</p>
          <button
            type="button"
            className="magnetic-btn dark"
            disabled={accepted}
            onClick={() => setAccepted(true)}
          >
            {accepted ? 'Position Reserved' : 'Accept Opportunity'}
          </button>
          {accepted && <StatusPill tone="green" label="Your assignment has been confirmed" />}
        </article>

        <article className="ops-card reminder-card">
          <Bell size={22} />
          <h3>Event Check-In Reminder</h3>
          <p>Royal Wedding - Jaipur</p>
          <strong>Reporting Time: 8:00 AM</strong>
          <div className="reminder-actions">
            <button type="button" onClick={() => setReminder('coming')}>
              I&apos;m Coming
            </button>
            <button type="button" onClick={() => setReminder('no-response')}>
              Simulate No Response
            </button>
          </div>
          {reminder === 'coming' && <StatusPill tone="green" label="Confirmed by Rahul at 6:14 AM" />}
          {reminder === 'no-response' && (
            <StatusPill tone="amber" label="No response after one hour. Replacement workflow initiated." />
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
          <StatusPill tone={checkedIn ? 'green' : 'amber'} label={checkedIn ? 'Checked in | 7:52 AM' : 'Not checked in'} />
          <button className="magnetic-btn dark" type="button" onClick={() => setCheckedIn(true)}>
            Simulate Scan
          </button>
        </div>

        <div className="ops-card map-mini">
          <MapPin size={22} />
          <h3>Venue Status</h3>
          <StatusPill tone="green" label="Inside Event Zone" />
          <div className="map-canvas mini">
            <span className="venue-radius" />
            <i className="marker green m1" />
          </div>
        </div>

        <div className="ops-card ratings-card">
          <p className="section-kicker">RATINGS</p>
          <h2>Overall 4.8</h2>
          {['Professionalism 4.9', 'Punctuality 4.8', 'Guest Handling 4.9', 'Teamwork 4.7'].map((item) => (
            <span key={item}>{item}</span>
          ))}
          <p>
            Performance Policy: three consecutive poor ratings may permanently block
            an account after review.
          </p>
        </div>

        <div className="ops-card earnings-card">
          <p className="section-kicker">EARNINGS</p>
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
          <small>Payouts are processed at month end. Demo values only.</small>
        </div>
      </section>
    </main>
  );
}

export function AdminOperations() {
  const [plannerApproved, setPlannerApproved] = useState(false);
  const [incident, setIncident] = useState(false);
  const [replacement, setReplacement] = useState(false);

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <strong>TNP OPERATIONS</strong>
        {[
          'Overview',
          'Events',
          'Planner Verification',
          'Freelancers',
          'Requirements',
          'Attendance',
          'Live Workforce',
          'Ratings',
          'Payouts',
          'RSVP',
          'Reports',
        ].map((item) => (
          <a key={item} href={`#${item.toLowerCase().replaceAll(' ', '-')}`}>
            {item}
          </a>
        ))}
      </aside>

      <section className="admin-main">
        <div className="admin-header">
          <p className="section-kicker">TNP OPERATIONS</p>
          <h1>Live event command, verification and workforce intelligence.</h1>
        </div>

        <div className="admin-stats">
          {[
            ['5,024', 'Freelancers'],
            ['97', 'Verified Planners'],
            ['32', 'Active Events'],
            ['486', 'Professionals Deployed'],
            ['17', 'Attendance Alerts'],
            ['6', 'Replacement Requests'],
          ].map(([value, label]) => (
            <Metric key={label} value={value} label={label} />
          ))}
        </div>

        <section className="admin-grid">
          <div className="ops-card verify-card" id="planner-verification">
            <p className="section-kicker">PLANNER VERIFICATION</p>
            <h2>Mehta Events & Experiences</h2>
            <p>Rohan Mehta | GST Available | 3 Event Executives, 4 Volunteers</p>
            <div className="inline-actions">
              <button type="button">Review</button>
              <button type="button" onClick={() => setPlannerApproved(true)}>
                Approve
              </button>
              <button type="button">Reject</button>
            </div>
            {plannerApproved && <StatusPill tone="green" label="Planner verified" />}
          </div>

          <div className="ops-card verify-card">
            <p className="section-kicker">FREELANCER VERIFICATION</p>
            <h2>Aarav Shah</h2>
            <p>Assessment 91% | 3 years experience | Documents complete</p>
            <div className="inline-actions">
              <button type="button">Approve Role</button>
              <button type="button">Change Role</button>
              <button type="button">Reject</button>
            </div>
          </div>
        </section>

        <section className="live-ops-panel" id="live-workforce">
          <div className="live-copy">
            <p className="section-kicker">LIVE EVENT OPERATIONS</p>
            <h2>Royal Wedding - Jaipur</h2>
            <StatusPill tone="green" label="LIVE" />
            <div className="workforce-lines">
              {[
                'Workforce: 10 / 11 Present',
                'Coordinator: Rahul Sharma',
                'Executives: 3 / 3',
                'Volunteers: 4 / 4',
                'Hostesses: 2 / 2',
                'Issue: Neha Verma outside venue',
              ].map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>
            <button className="magnetic-btn dark" type="button" onClick={() => setIncident(true)}>
              Simulate Geofence Incident
            </button>
          </div>
          <div className={`map-canvas ${incident ? 'incident' : ''}`}>
            <span className="venue-radius" />
            <i className="marker green m1" />
            <i className="marker green m2" />
            <i className="marker green m3" />
            <i className="marker red m4" />
          </div>
        </section>

        {incident && (
          <section className="alert-panel">
            <div>
              <p className="section-kicker">WORKFORCE ALERT</p>
              <h2>Neha Verma has exited the designated event zone.</h2>
              <span>Last detected: 1.2 km from venue</span>
            </div>
            <div className="inline-actions">
              <button type="button">Contact</button>
              <button type="button" onClick={() => setReplacement(true)}>
                Request Replacement
              </button>
            </div>
          </section>
        )}

        {replacement && (
          <section className="replacement-panel">
            <p className="section-kicker">Finding eligible available professionals...</p>
            <div className="candidate-card">
              <UserCheck size={22} />
              <h3>Aarav Shah</h3>
              <span>Volunteer | 4.8 rating | 1.7 km away | Available</span>
              <button type="button">Send Opportunity</button>
            </div>
          </section>
        )}

        <section className="admin-grid">
          <div className="ops-card">
            <p className="section-kicker">RATINGS</p>
            {['Rahul Sharma 4.8 Reliable', 'Neha Verma 3.1 Performance Watch', 'Amit Patel 4.7 Reliable'].map(
              (row) => (
                <span className="table-row" key={row}>
                  {row}
                </span>
              ),
            )}
            <StatusPill tone="amber" label="2 consecutive poor ratings flagged" />
          </div>
          <div className="ops-card">
            <p className="section-kicker">PAYOUTS</p>
            <div className="earning-stats">
              <Metric label="This Month" value="₹4,86,000" />
              <Metric label="Pending Freelancers" value="32" />
              <Metric label="Completed" value="468" />
            </div>
            {['Rahul Sharma ₹18,500 Available', 'Sneha Shah ₹7,500 Pending', 'Amit Patel ₹12,000 Processing'].map(
              (row) => (
                <span className="table-row" key={row}>
                  {row}
                </span>
              ),
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function PortalHero({
  label,
  title,
  copy,
  image,
}: {
  label: string;
  title: string;
  copy: string;
  image: string;
}) {
  const item = byId(image);
  return (
    <section className="portal-hero">
      <img src={item.src} alt={item.alt} />
      <div>
        <p className="eyebrow">{label}</p>
        <h1>{title}</h1>
        <p>{copy}</p>
        <a className="ghost-btn light" href="/admin">
          View Operations Demo
        </a>
      </div>
    </section>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <span className="metric">
      {icon}
      <strong>{value}</strong>
      {label}
    </span>
  );
}

function StatusPill({ tone, label }: { tone: 'green' | 'amber'; label: string }) {
  return (
    <span className={`status-pill ${tone}`}>
      <BadgeCheck size={15} />
      {label}
    </span>
  );
}
