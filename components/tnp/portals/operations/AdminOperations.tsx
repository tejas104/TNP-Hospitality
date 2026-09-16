'use client';

import { UserCheck } from 'lucide-react';
import { useState } from 'react';
import { Metric } from '@/components/tnp/shared/Metric';
import { StatusPill } from '@/components/tnp/shared/StatusPill';

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
          'Sample Workforce Preview',
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
          <h1>Sample event overview, verification and workforce intelligence.</h1>
        </div>

        <div className="admin-stats">
          {[
            ['5,024', 'Freelancers'],
            ['97', 'Sample Verified Planners'],
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
            <p className="section-kicker">SAMPLE PLANNER VERIFICATION</p>
            <h2>Mehta Events & Experiences</h2>
            <p>Rohan Mehta | GST Available | 3 Event Executives, 4 Volunteers</p>
            <div className="inline-actions">
              <button type="button">Review</button>
              <button type="button" onClick={() => setPlannerApproved(true)}>
                Approve
              </button>
              <button type="button">Reject</button>
            </div>
            {plannerApproved && <StatusPill tone="green" label="Sample planner status: approved" />}
          </div>

          <div className="ops-card verify-card">
            <p className="section-kicker">SAMPLE FREELANCER VERIFICATION</p>
            <h2>Aarav Shah</h2>
            <p>Assessment 91% | 3 years experience | Sample documents state: complete</p>
            <div className="inline-actions">
              <button type="button">Approve Role</button>
              <button type="button">Change Role</button>
              <button type="button">Reject</button>
            </div>
          </div>
        </section>

        <section className="live-ops-panel" id="live-workforce">
          <div className="live-copy">
            <p className="section-kicker">SAMPLE EVENT OPERATIONS</p>
            <h2>Royal Wedding - Jaipur</h2>
            <StatusPill tone="green" label="DEMO" />
            <div className="workforce-lines">
              {[
                'Workforce: 10 / 11 Present',
                'Coordinator: Rahul Sharma',
                'Executives: 3 / 3',
                'Volunteers: 4 / 4',
                'Hostesses: 2 / 2',
                'Sample issue: location evidence unavailable',
              ].map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>
            <button className="magnetic-btn dark" type="button" onClick={() => setIncident(true)}>
              Show Sample Location Exception
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
              <p className="section-kicker">SAMPLE WORKFORCE ALERT</p>
              <h2>Neha Verma has a sample location exception.</h2>
              <span>Location unavailable in preview</span>
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
            <p className="section-kicker">Showing sample eligible professionals...</p>
            <div className="candidate-card">
              <UserCheck size={22} />
              <h3>Aarav Shah</h3>
              <span>Volunteer | 4.8 sample rating | Location unavailable in preview | Available</span>
              <button type="button">Send Opportunity</button>
            </div>
          </section>
        )}

        <section className="admin-grid">
          <div className="ops-card">
            <p className="section-kicker">SAMPLE RATINGS</p>
            {['Rahul Sharma 4.8 Reliable', 'Neha Verma 3.1 Performance Watch', 'Amit Patel 4.7 Reliable'].map(
              (row) => (
                <span className="table-row" key={row}>
                  {row}
                </span>
              ),
            )}
            <StatusPill tone="amber" label="2 consecutive poor sample ratings flagged for review" />
          </div>
          <div className="ops-card">
            <p className="section-kicker">SAMPLE PAYOUT STATES</p>
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
