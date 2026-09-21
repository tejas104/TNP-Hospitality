import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import styles from './Public.module.css';

// Illustrative, clearly labelled sample context for the public overview pages.
// Figures are planning examples for the client demo, not quotes, availability
// or real event records.
type Extra = {
  statsTitle: string;
  stats: [string, string, string][];
  stepsTitle: string;
  steps: [string, string][];
  chipsTitle?: string;
  chips?: string[];
  table?: { title: string; head: string[]; rows: string[][] };
  faq: [string, string][];
};

const extras: Record<'services' | 'events' | 'destinations' | 'rsvp', Extra> = {
  services: {
    statsTitle: 'Sample team shapes',
    stats: [
      ['4–6', 'people', 'Intimate dinner · about 50 guests'],
      ['18–24', 'people', 'Wedding reception · about 300 guests'],
      ['40+', 'people', 'Conference day · about 800 guests'],
      ['1', 'coordinator', 'Leads every event team on the day'],
    ],
    stepsTitle: 'How a service engagement flows',
    steps: [
      ['Share the brief', 'Occasion, city, dates, guest count and the roles you need.'],
      ['Shape the team', 'TNP suggests roles and quantities and confirms scope with you.'],
      ['Brief the people', 'Reporting point, dress code, languages and guest-care notes.'],
      ['Host the moment', 'A coordinator keeps the team calm, visible and on time.'],
    ],
    faq: [
      ['Can I mix roles in one request?', 'Yes. A single enquiry can include hostesses, volunteers, executives and a coordinator for the same event.'],
      ['Is the team size a quote?', 'No. These are illustrative ratios for the demo. TNP confirms scope and pricing personally.'],
      ['Do you work outside the listed cities?', 'Tell us the destination in your enquiry and TNP will discuss what is possible.'],
    ],
  },
  events: {
    statsTitle: 'A sample event at a glance',
    stats: [
      ['3', 'functions', 'Mehendi, sangeet and reception'],
      ['320', 'guests', 'Across two days in the sample'],
      ['26', 'team members', 'Hosts, volunteers and coordinators'],
      ['1', 'brief', 'Shared by everyone on the team'],
    ],
    chipsTitle: 'Occasions we can discuss',
    chips: ['Weddings', 'Sangeet & mehendi', 'Receptions', 'Corporate offsites', 'Product launches', 'Conferences', 'Private dinners', 'Milestone birthdays'],
    stepsTitle: 'A sample event day',
    steps: [
      ['3:00 PM · Team briefing', 'Roles, entrances, guest priorities and language needs.'],
      ['5:00 PM · Doors open', 'Hostesses welcome and guide arriving guests.'],
      ['8:00 PM · Main function', 'Volunteers support flow between spaces and seating.'],
      ['11:00 PM · Farewell', 'Guests are thanked and escorted; the team debriefs.'],
    ],
    faq: [
      ['Are these photos from TNP events?', 'No. Photography is illustrative preview material, not a verified portfolio.'],
      ['Can one booking cover several functions?', 'Yes. Each function can have its own team and timing within one event conversation.'],
    ],
  },
  destinations: {
    statsTitle: 'Planning at a glance',
    stats: [
      ['6', 'featured cities', 'From palaces to coastlines'],
      ['Oct–Mar', 'popular season', 'For most featured destinations'],
      ['3–6', 'months', 'Typical lead time we suggest'],
      ['1', 'conversation', 'To shortlist the right setting'],
    ],
    table: {
      title: 'Seasons and moods (general guidance)',
      head: ['Destination', 'Often preferred', 'Feels like'],
      rows: [
        ['Jaipur', 'October – March', 'Royal courtyards and heritage palaces'],
        ['Udaipur', 'September – March', 'Lakeside terraces and sunset views'],
        ['Goa', 'November – February', 'Beach evenings and relaxed celebrations'],
        ['Mumbai', 'November – February', 'City ballrooms and seaside venues'],
        ['Delhi', 'October – March', 'Grand hotels and landmark lawns'],
        ['Pune', 'October – February', 'Hill-view resorts and gardens'],
      ],
    },
    stepsTitle: 'From idea to shortlist',
    steps: [
      ['Mood and guest count', 'Tell us the feeling you want and how many guests to host.'],
      ['Shortlist settings', 'TNP suggests destinations and venue types to consider.'],
      ['Plan the people', 'Match the venue with the right hospitality team.'],
    ],
    faq: [
      ['Is venue availability shown here?', 'No. This is general guidance. Availability and pricing are confirmed personally.'],
      ['Can TNP support destinations not listed?', 'Yes—share the place in your enquiry and TNP will continue the conversation.'],
    ],
  },
  rsvp: {
    statsTitle: 'Sample response summary',
    stats: [
      ['240', 'invited', 'Parties in the sample event'],
      ['186', 'replied', '78% response in the sample'],
      ['152', 'attending', 'Confirmed by a person'],
      ['9', 'need review', 'Ambiguous replies held for a human'],
    ],
    stepsTitle: 'How a reply is handled',
    steps: [
      ['Guest replies', 'The original message is kept exactly as received.'],
      ['Suggested category', 'Attending, declined or needs review—never silently final.'],
      ['Human confirms', 'A team member checks ambiguous replies before they count.'],
      ['Report updates', 'Function-wise counts and information are ready for the team.'],
    ],
    faq: [
      ['Are messages sent from this website?', 'No. This is a preview. WhatsApp and providers are not connected.'],
      ['Does RSVP book travel or rooms?', 'No. It collects travel and stay information only; bookings are handled by people outside RSVP.'],
    ],
  },
};

export default function OverviewExtras({
  kind,
}: {
  kind: string;
}) {
  const extra = extras[kind as keyof typeof extras];
  if (!extra) return null;
  return (
    <section className={styles.extras} aria-label="More about this page">
      <p className={styles.sampleTag}>Sample context · illustrative only</p>
      <h2>{extra.statsTitle}</h2>
      <div className={styles.statGrid}>
        {extra.stats.map(([value, unit, note]) => (
          <article key={note} className={styles.statCard}>
            <strong>{value}</strong>
            <span>{unit}</span>
            <small>{note}</small>
          </article>
        ))}
      </div>
      {extra.chips && (
        <>
          <h2>{extra.chipsTitle}</h2>
          <ul className={styles.chipList}>
            {extra.chips.map((chip) => (
              <li key={chip}>
                <Link
                  href={`/contact?interest=event-request&occasion=${encodeURIComponent(chip)}`}
                >
                  {chip}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
      {extra.table && (
        <>
          <h2>{extra.table.title}</h2>
          <div className={styles.tableWrap}>
            <table className={styles.seasonTable}>
              <thead>
                <tr>
                  {extra.table.head.map((cell) => (
                    <th key={cell}>{cell}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {extra.table.rows.map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, index) =>
                      index === 0 ? (
                        <th key={cell} scope="row">
                          {cell}
                        </th>
                      ) : (
                        <td key={cell}>{cell}</td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <h2>{extra.stepsTitle}</h2>
      <ol className={styles.stepList}>
        {extra.steps.map(([title, copy], index) => (
          <li key={title}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{title}</strong>
            <p>{copy}</p>
          </li>
        ))}
      </ol>
      <h2>Questions clients ask</h2>
      <div className={styles.faq}>
        {extra.faq.map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
      <Link className={styles.extraCta} href="/contact">
        Ask TNP about your event <ArrowUpRight size={18} />
      </Link>
    </section>
  );
}
