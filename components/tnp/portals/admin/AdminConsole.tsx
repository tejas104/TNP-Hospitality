'use client';
import { useEffect, useRef, useState } from 'react';
import {
  BadgeIndianRupee,
  BarChart3,
  CalendarDays,
  CalendarCheck2,
  ClipboardCheck,
  FileSpreadsheet,
  FileText,
  History,
  LayoutDashboard,
  MessageCircle,
  Palette,
  ReceiptText,
  RotateCcw,
  Search,
  ShieldCheck,
  Tags,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import {
  ACTOR,
  CAPABILITIES,
  collectionStatus,
  earnings,
  quoteTotals,
  rupees,
  seedAdmin,
  type AdminState,
  type Capability,
} from './adminData';
import { download, toPdf, toXlsx, type Table } from './exporters';
import {
  ApplicationsSection,
  AttendanceSection,
  AuditSection,
  CatalogueSection,
  EventsSection,
  FinanceSection,
  PeopleSection,
  QuotationsSection,
  RsvpAccessSection,
} from './AdminSections';
import { Card, REPORT_NOTE } from './adminUi';
import CommandPalette from './CommandPalette';
import { GenieWindow } from '../../public/portal-launcher/PortalLauncher';
import styles from './AdminConsole.module.css';

export type Section =
  | 'dashboard'
  | 'events'
  | 'applications'
  | 'people'
  | 'attendance'
  | 'quotations'
  | 'finance'
  | 'rsvp'
  | 'team'
  | 'catalogue'
  | 'reports'
  | 'audit';
export type Go = (section: Section, focus?: string) => void;
export type Update = (
  change: (state: AdminState) => AdminState,
  message: string,
) => void;
export type SectionProps = {
  state: AdminState;
  update: Update;
  go: Go;
  focus: string;
};

const NAV: { group: string; items: [Section, string, LucideIcon][] }[] = [
  { group: 'Overview', items: [['dashboard', 'Dashboard', LayoutDashboard]] },
  {
    group: 'Run events',
    items: [
      ['events', 'Events & assignments', CalendarDays],
      ['attendance', 'Attendance', CalendarCheck2],
    ],
  },
  {
    group: 'People',
    items: [
      ['applications', 'Freelancer applications', ClipboardCheck],
      ['people', 'Freelancers & ratings', UsersRound],
    ],
  },
  {
    group: 'Money',
    items: [
      ['quotations', 'Quotations', ReceiptText],
      ['finance', 'Finance & payouts', BadgeIndianRupee],
    ],
  },
  {
    group: 'Setup & access',
    items: [
      ['catalogue', 'Catalogue & rates', Tags],
      ['rsvp', 'RSVP access', MessageCircle],
      ['team', 'Admins & co-admins', ShieldCheck],
    ],
  },
  {
    group: 'Records',
    items: [
      ['reports', 'Reports', BarChart3],
      ['audit', 'Audit log', History],
    ],
  },
];
const LABEL = Object.fromEntries(
  NAV.flatMap((g) => g.items.map(([id, label]) => [id, label])),
) as Record<Section, string>;
const KEY = 'tnp-admin-console-v2';
const today = () => new Date().toISOString().slice(0, 10);

export default function AdminConsole() {
  const [state, setState] = useState<AdminState>(seedAdmin);
  const [section, setSection] = useState<Section>('dashboard');
  const [focus, setFocus] = useState('');
  const [design, setDesign] = useState<'light' | 'teal'>('light');
  const [notice, setNotice] = useState(
    'Sample data only. Nothing here sends messages, pays anyone or creates real logins.',
  );
  const main = useRef<HTMLDivElement>(null);
  const searchButton = useRef<HTMLButtonElement>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  useEffect(() => {
    // Ctrl+K / Cmd+K opens search from anywhere in the console.
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      try {
        const saved = JSON.parse(sessionStorage.getItem(KEY) ?? 'null');
        if (saved?.version === 2) setState(saved);
        const look = sessionStorage.getItem(KEY + '-design');
        if (look === 'teal' || look === 'light') setDesign(look);
      } catch {
        /* Start from the seed. */
      }
    });
    return () => {
      active = false;
    };
  }, []);
  const update: Update = (change, message) => {
    setState((current) => {
      const next = change(current);
      next.log = [
        { at: new Date().toLocaleString('en-IN'), text: message, actor: ACTOR },
        ...next.log,
      ].slice(0, 40);
      try {
        sessionStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* Memory only. */
      }
      return next;
    });
    setNotice(message);
  };
  const go: Go = (next, target = '') => {
    setSection(next);
    setFocus(target);
    requestAnimationFrame(() => {
      main.current?.focus({ preventScroll: true });
      main.current?.scrollIntoView({ block: 'start' });
    });
  };
  const switchDesign = () => {
    const next = design === 'light' ? 'teal' : 'light';
    setDesign(next);
    try {
      sessionStorage.setItem(KEY + '-design', next);
    } catch {
      /* Optional preference. */
    }
  };
  const props: SectionProps = { state, update, go, focus };
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={styles.console}
      data-own-controls
      data-design={design}
    >
      <div className={styles.backdrop} aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <aside className={styles.sidebar} aria-label="Admin sections">
        <div className={styles.brand}>
          <strong>TNP Admin</strong>
          <small>Kavya Rao · Main admin (sample)</small>
        </div>
        <nav>
          {NAV.map((group) => (
            <div key={group.group} className={styles.navGroup}>
              <span>{group.group}</span>
              {group.items.map(([id, label, Icon]) => (
                <button
                  key={id}
                  type="button"
                  aria-current={section === id ? 'page' : undefined}
                  onClick={() => go(id)}
                >
                  <Icon size={18} aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <div className={styles.body}>
        <header className={styles.topbar}>
          <div>
            <p className={styles.crumb}>
              Admin <span aria-hidden="true">/</span> {LABEL[section]}
            </p>
            <h1>{LABEL[section]}</h1>
          </div>
          <div className={styles.topActions}>
            <button
              ref={searchButton}
              type="button"
              className={styles.searchButton}
              aria-haspopup="dialog"
              aria-keyshortcuts="Control+K Meta+K"
              onClick={() => setPaletteOpen(true)}
            >
              <Search size={17} aria-hidden="true" />
              Search
              <kbd>Ctrl K</kbd>
            </button>
            <button type="button" className={styles.ghost} onClick={switchDesign}>
              <Palette size={17} aria-hidden="true" />
              Design {design === 'light' ? 'A · Ivory glass' : 'B · Teal glass'}
            </button>
            <button
              type="button"
              className={styles.ghost}
              onClick={() => {
                const fresh = seedAdmin();
                update(() => fresh, 'Sample data reset to the starting scenario.');
              }}
            >
              <RotateCcw size={17} aria-hidden="true" /> Reset sample data
            </button>
          </div>
        </header>
        <GenieWindow
          sourceRef={searchButton}
          open={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          title="Search the admin console"
          label="Close search"
        >
          {paletteOpen && (
            <CommandPalette state={state} go={go} labels={LABEL} close={() => setPaletteOpen(false)} />
          )}
        </GenieWindow>
        <output className={styles.notice} aria-live="polite">
          {notice}
        </output>
        <nav className={styles.mobileNav} aria-label="Admin sections">
          {NAV.flatMap((g) => g.items).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              aria-current={section === id ? 'page' : undefined}
              onClick={() => go(id)}
            >
              <Icon size={16} aria-hidden="true" /> {label}
            </button>
          ))}
        </nav>
        <div
          ref={main}
          tabIndex={-1}
          className={styles.content}
          aria-label={`${LABEL[section]} content`}
        >
          {section === 'dashboard' && <Dashboard {...props} />}
          {section === 'events' && <EventsSection {...props} />}
          {section === 'applications' && <ApplicationsSection {...props} />}
          {section === 'people' && <PeopleSection {...props} />}
          {section === 'attendance' && <AttendanceSection {...props} />}
          {section === 'quotations' && <QuotationsSection {...props} />}
          {section === 'finance' && <FinanceSection {...props} />}
          {section === 'rsvp' && <RsvpAccessSection {...props} />}
          {section === 'team' && <TeamSection {...props} />}
          {section === 'catalogue' && <CatalogueSection {...props} />}
          {section === 'audit' && <AuditSection {...props} />}
          {section === 'reports' && <ReportsSection {...props} />}
        </div>
      </div>
    </main>
  );
}

function Dashboard({ state, go }: SectionProps) {
  const by = (status: string) => state.events.filter((e) => e.status === status);
  const pending = state.applications.filter((a) => a.status === 'pending');
  const newRequests = state.requests.filter((r) => r.status !== 'quoted');
  const involved = new Set(
    state.assignments
      .filter((a) => by('ongoing').some((e) => e.id === a.eventId))
      .flatMap((a) => a.approved),
  );
  const remaining = state.freelancers.reduce(
    (sum, f) => sum + earnings(state, f.id).remaining,
    0,
  );
  const awaiting = state.freelancers.reduce(
    (sum, f) => sum + earnings(state, f.id).awaitingApproval,
    0,
  );
  const outstanding = state.quotations
    .filter((q) => q.status === 'accepted-sample')
    .reduce((n, q) => n + collectionStatus(state, q).outstanding, 0);
  const drafts = state.quotations.filter((q) => q.status === 'draft');
  const kpis: [string, string, string, Section][] = [
    [String(by('ongoing').length), 'Ongoing events', 'Happening now', 'events'],
    [String(by('upcoming').length), 'Upcoming events', 'Next 90 days', 'events'],
    [String(by('finished').length), 'Finished events', 'Recently closed', 'events'],
    [String(newRequests.length), 'Client requests', 'Waiting for a quote', 'quotations'],
    [String(pending.length), 'Applications', 'Waiting for approval', 'applications'],
    [String(involved.size), 'People on duty', 'In ongoing events', 'people'],
    [rupees(awaiting + remaining), 'Payouts pending', 'Awaiting approval or payment', 'finance'],
  ];
  const todo: [string, Section, boolean][] = [
    [`${pending.length} freelancer applications to review`, 'applications', pending.length > 0],
    [`${newRequests.length} client requests need a quotation`, 'quotations', newRequests.length > 0],
    [`${drafts.length} quotation drafts to finish`, 'quotations', drafts.length > 0],
    [`${rupees(awaiting)} in earnings waiting for approval`, 'finance', awaiting > 0],
    [`${rupees(remaining)} approved and ready to pay`, 'finance', remaining > 0],
    [`${rupees(outstanding)} still to collect from clients`, 'finance', outstanding > 0],
    [
      `${state.assignments.filter((a) => a.approved.length < a.quantity && state.events.find((e) => e.id === a.eventId)?.status !== 'finished').length} assignments still have open places`,
      'events',
      true,
    ],
  ];
  return (
    <div className={styles.stack}>
      <div className={styles.kpiGrid}>
        {kpis.map(([value, label, hint, target]) => (
          <button
            key={label}
            type="button"
            className={`${styles.glass} ${styles.kpi}`}
            onClick={() => go(target)}
          >
            <strong>{value}</strong>
            <span>{label}</span>
            <small>{hint}</small>
          </button>
        ))}
      </div>
      <div className={styles.split}>
        <Card aria-labelledby="todo-title">
          <h2 id="todo-title">Needs your attention</h2>
          <ul className={styles.todo}>
            {todo
              .filter(([, , show]) => show)
              .map(([text, target]) => (
                <li key={text}>
                  <button type="button" onClick={() => go(target)}>
                    {text}
                    <span aria-hidden="true">→</span>
                  </button>
                </li>
              ))}
          </ul>
        </Card>
        <Card aria-labelledby="requests-title">
          <h2 id="requests-title">Latest client requests</h2>
          <ul className={styles.list}>
            {state.requests.map((r) => (
              <li key={r.id}>
                <div>
                  <strong>{r.client}</strong>
                  <small>
                    {r.occasion} · {r.city} · {r.guests} guests ·{' '}
                    {r.lines.reduce((n, l) => n + l.quantity, 0)} people requested
                  </small>
                </div>
                <span className={styles.chip} data-tone={r.status}>
                  {r.status === 'new' ? 'New' : r.status === 'quoting' ? 'Quoting' : 'Quoted'}
                </span>
                <button
                  type="button"
                  className={styles.small}
                  onClick={() => go('quotations', r.id)}
                >
                  Make quotation
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      {(['ongoing', 'upcoming', 'finished'] as const).map((status) => (
        <Card key={status} aria-labelledby={`dash-${status}`}>
          <div className={styles.cardHead}>
            <h2 id={`dash-${status}`}>
              {status === 'ongoing'
                ? 'Ongoing events'
                : status === 'upcoming'
                  ? 'Upcoming events'
                  : 'Finished events'}
            </h2>
            <button type="button" className={styles.small} onClick={() => go('events')}>
              All events
            </button>
          </div>
          <div className={styles.eventGrid}>
            {by(status).map((event) => {
              const assignments = state.assignments.filter((a) => a.eventId === event.id);
              const needed = assignments.reduce((n, a) => n + a.quantity, 0);
              const placed = assignments.reduce((n, a) => n + a.approved.length, 0);
              const marks = Object.values(event.attendance);
              const appeared = marks.filter((m) => m === 'appeared' || m === 'late').length;
              return (
                <button
                  key={event.id}
                  type="button"
                  className={styles.eventCard}
                  onClick={() => go('events', event.id)}
                >
                  <span className={styles.chip} data-tone={event.status}>
                    {event.status}
                  </span>
                  <strong>{event.name}</strong>
                  <small>
                    {event.city} · {event.start}
                    {event.end !== event.start ? ` → ${event.end}` : ''}
                  </small>
                  <span className={styles.meter} aria-hidden="true">
                    <i style={{ width: `${needed ? (placed / needed) * 100 : 0}%` }} />
                  </span>
                  <small>
                    {placed}/{needed} people placed
                    {marks.length ? ` · ${appeared}/${marks.length} appeared` : ''}
                  </small>
                </button>
              );
            })}
          </div>
        </Card>
      ))}
      <Card aria-labelledby="log-title">
        <h2 id="log-title">Recent activity (this browser)</h2>
        <ul className={styles.log}>
          {state.log.slice(0, 6).map((entry, i) => (
            <li key={i}>
              <small>{entry.at}</small> {entry.text}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function TeamSection({ state, update }: SectionProps) {
  const [name, setName] = useState('');
  const toggle = (id: string, cap: Capability) =>
    update(
      (s) => ({
        ...s,
        coAdmins: s.coAdmins.map((a) =>
          a.id !== id || a.main
            ? a
            : {
                ...a,
                capabilities: a.capabilities.includes(cap)
                  ? a.capabilities.filter((c) => c !== cap)
                  : [...a.capabilities, cap],
              },
        ),
      }),
      `Co-admin capability “${cap}” updated (sample).`,
    );
  return (
    <div className={styles.stack}>
      <Card>
        <h2>Who manages the platform</h2>
        <p className={styles.muted}>
          One main admin manages co-admins. Each co-admin only sees the areas
          switched on below. Changes stay in this browser; no login is created.
        </p>
        <div className={styles.teamGrid}>
          {state.coAdmins.map((admin) => (
            <article key={admin.id} className={styles.person}>
              <span className={styles.avatar} aria-hidden="true">
                {admin.name
                  .split(' ')
                  .map((p) => p[0])
                  .join('')}
              </span>
              <div>
                <strong>{admin.name}</strong>
                <small>{admin.main ? 'Main admin · all areas' : 'Co-admin'}</small>
              </div>
              <div className={styles.capList}>
                {CAPABILITIES.map((cap) => (
                  <button
                    key={cap}
                    type="button"
                    aria-pressed={admin.capabilities.includes(cap)}
                    disabled={admin.main}
                    onClick={() => toggle(admin.id, cap)}
                  >
                    {cap}
                  </button>
                ))}
              </div>
              {!admin.main && (
                <button
                  type="button"
                  className={styles.dangerLink}
                  onClick={() =>
                    update(
                      (s) => ({ ...s, coAdmins: s.coAdmins.filter((a) => a.id !== admin.id) }),
                      `${admin.name} removed as co-admin (sample).`,
                    )
                  }
                >
                  Remove co-admin
                </button>
              )}
            </article>
          ))}
        </div>
      </Card>
      <Card>
        <h2>Add a co-admin</h2>
        <form
          className={styles.inlineForm}
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            update(
              (s) => ({
                ...s,
                coAdmins: [
                  ...s.coAdmins,
                  { id: `ca-${Date.now()}`, name: name.trim(), main: false, capabilities: ['Events'] },
                ],
              }),
              `${name.trim()} added as a co-admin with Events access (sample).`,
            );
            setName('');
          }}
        >
          <label>
            Sample name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sample Co-admin" />
          </label>
          <button type="submit" className={styles.primary} disabled={!name.trim()}>
            Add co-admin
          </button>
        </form>
      </Card>
    </div>
  );
}

export function reportTables(state: AdminState): Record<string, Table> {
  const name = (id: string) => state.freelancers.find((f) => f.id === id)?.name ?? id;
  return {
    events: {
      title: 'Events summary',
      head: ['Event', 'Client', 'City', 'Start', 'End', 'Status', 'Guests', 'People needed', 'People placed'],
      rows: state.events.map((e) => {
        const a = state.assignments.filter((x) => x.eventId === e.id);
        return [e.name, e.client, e.city, e.start, e.end, e.status, e.guests,
          a.reduce((n, x) => n + x.quantity, 0), a.reduce((n, x) => n + x.approved.length, 0)];
      }),
    },
    attendance: {
      title: 'Attendance by event',
      head: ['Event', 'Freelancer', 'Role', 'Attendance'],
      rows: state.assignments.flatMap((a) => {
        const event = state.events.find((e) => e.id === a.eventId)!;
        return a.approved.map((id) => [event.name, name(id), a.role, event.attendance[id] ?? 'unmarked']);
      }),
    },
    payouts: {
      title: 'Freelancer payouts',
      head: ['Freelancer', 'Role', 'Earned (INR)', 'Awaiting approval (INR)', 'Paid (INR)', 'Ready to pay (INR)'],
      rows: state.freelancers.map((f) => {
        const e = earnings(state, f.id);
        return [f.name, f.role, e.earned / 100, e.awaitingApproval / 100, e.paid / 100, e.remaining / 100];
      }),
    },
    collections: {
      title: 'Client collections',
      head: ['Quote', 'Client', 'Total (INR)', 'Received (INR)', 'Outstanding (INR)'],
      rows: state.quotations
        .filter((q) => q.status === 'accepted-sample')
        .map((q) => {
          const c = collectionStatus(state, q);
          return [q.id, q.client, c.total / 100, c.received / 100, c.outstanding / 100];
        }),
    },
    audit: {
      title: 'Audit log',
      head: ['When', 'Who', 'What'],
      rows: state.log.map((l) => [l.at, l.actor, l.text]),
    },
    applications: {
      title: 'Freelancer applications',
      head: ['Applicant', 'Role', 'City', 'Experience (yrs)', 'Assessment', 'Status', 'Applied on'],
      rows: state.applications.map((a) => [a.name, a.role, a.city, a.experienceYears, a.assessment, a.status, a.appliedOn]),
    },
    quotations: {
      title: 'Quotations',
      head: ['Quote', 'Client', 'Title', 'Subtotal (INR)', 'Discount (INR)', 'Total (INR)', 'Status'],
      rows: state.quotations.map((q) => {
        const t = quoteTotals(q);
        return [q.id, q.client, q.title, t.subtotal / 100, t.discount / 100, t.total / 100, q.status];
      }),
    },
    freelancers: {
      title: 'Freelancer directory',
      head: ['Name', 'Role', 'City', 'Experience (yrs)', 'Rating', 'Status'],
      rows: state.freelancers.map((f) => [f.name, f.role, f.city, f.experienceYears, f.rating, f.status]),
    },
  };
}

function ReportsSection({ state }: SectionProps) {
  const tables = reportTables(state);
  const stamp = today();
  return (
    <div className={styles.stack}>
      <p className={styles.muted}>
        Download any report as Excel (.xlsx) or PDF. Files are built in this
        browser from the sample data and are marked as synthetic.
      </p>
      <div className={styles.reportGrid}>
        {Object.entries(tables).map(([key, table]) => (
          <Card key={key} className={styles.report}>
            <h2>{table.title}</h2>
            <small>
              {table.rows.length} rows · {table.head.length} columns
            </small>
            <div className={styles.reportActions}>
              <button
                type="button"
                className={styles.primary}
                onClick={() => download(toXlsx([table]), `tnp-${key}-${stamp}.xlsx`)}
              >
                <FileSpreadsheet size={17} aria-hidden="true" /> Excel
              </button>
              <button
                type="button"
                className={styles.ghost}
                onClick={() => download(toPdf([table], REPORT_NOTE), `tnp-${key}-${stamp}.pdf`)}
              >
                <FileText size={17} aria-hidden="true" /> PDF
              </button>
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <h2>Everything in one file</h2>
        <div className={styles.reportActions}>
          <button
            type="button"
            className={styles.primary}
            onClick={() => download(toXlsx(Object.values(tables)), `tnp-all-reports-${stamp}.xlsx`)}
          >
            <FileSpreadsheet size={17} aria-hidden="true" /> All reports · Excel
          </button>
          <button
            type="button"
            className={styles.ghost}
            onClick={() => download(toPdf(Object.values(tables), REPORT_NOTE), `tnp-all-reports-${stamp}.pdf`)}
          >
            <FileText size={17} aria-hidden="true" /> All reports · PDF
          </button>
        </div>
      </Card>
    </div>
  );
}
