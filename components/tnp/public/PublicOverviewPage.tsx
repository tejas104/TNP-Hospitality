import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';
import { publicDepartments, publicServices } from '@/data/public-content';
import { destinations, events } from '@/data/tnp';
import { byId } from '@/data/media';
import OverviewExtras from './OverviewExtras';
import TeamEstimator from './TeamEstimator';
import styles from './Public.module.css';

export type PublicOverviewKind =
  | 'services'
  | 'events'
  | 'destinations'
  | 'people'
  | 'about'
  | 'rsvp';

const introductions = {
  services: {
    eyebrow: 'PEOPLE, PLACES & GUEST CARE',
    title: 'Every part of the event, connected.',
    copy: 'Explore TNP hospitality, event workforce, guest communication and venue discovery. Each page explains the conversation we can start—not a fixed package or live availability promise.',
    home: '/#services',
  },
  events: {
    eyebrow: 'OCCASIONS, THOUGHTFULLY HELD',
    title: 'Different moments. The same attention.',
    copy: 'A visual introduction to the celebrations and event settings TNP can discuss with you. Photography is illustrative preview material, not a verified portfolio of TNP commissions.',
    home: '/#events',
  },
  destinations: {
    eyebrow: 'PLACES TO IMAGINE',
    title: 'Find the setting that feels right.',
    copy: 'Browse destination inspiration, then tell us the guest count, mood and venue needs that matter. TNP will continue the conversation personally.',
    home: '/#destinations',
  },
  people: {
    eyebrow: 'WORK WITH TNP',
    title: 'Hospitality is a people business.',
    copy: 'Understand the event roles clients can request and choose a temporary demo workspace if you are exploring work with TNP.',
    home: '/#people',
  },
  about: {
    eyebrow: 'THE TNP APPROACH',
    title: 'Human care, operational calm.',
    copy: 'TNP brings planning, hospitality people, guest communication and venue conversations into one considered event experience.',
    home: '/#about',
  },
  rsvp: {
    eyebrow: 'RSVP & GUEST HOSPITALITY',
    title: 'Every guest response, made easier to understand.',
    copy: 'Explore the public RSVP service, enquire about TNP-managed support, or open the labelled synthetic team workspace for the client demonstration.',
    home: '/#rsvp',
  },
} satisfies Record<
  PublicOverviewKind,
  { eyebrow: string; title: string; copy: string; home: string }
>;

export default function PublicOverviewPage({
  kind,
}: {
  kind: PublicOverviewKind;
}) {
  const intro = introductions[kind];
  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <section className={[styles.heading, styles.overviewHeading].join(' ')}>
        <div>
          <Link href={intro.home}>TNP / VIEW THIS ON THE HOMEPAGE</Link>
          <p className={styles.eyebrow}>{intro.eyebrow}</p>
          <h1>{intro.title}</h1>
          <p>{intro.copy}</p>
          <div className={styles.overviewActions}>
            <Link className={styles.creamButton} href="/contact">
              Start a conversation <ArrowUpRight size={18} />
            </Link>
            <Link className="link-glow" href={intro.home}>View homepage section ↓</Link>
          </div>
        </div>
      </section>
      <OverviewContent kind={kind} />
      {kind === 'services' && <TeamEstimator />}
      <OverviewExtras kind={kind} />
      <section className={styles.detailCta}>
        <p className={styles.eyebrow}>A GOOD PLACE TO BEGIN</p>
        <h2>
          Tell us what you know.
          <br />
          <em>We’ll help shape the rest.</em>
        </h2>
        <Link className={styles.creamButton} href="/contact">
          Contact TNP <ArrowUpRight size={18} />
        </Link>
        <p>Synthetic frontend preview. No external message is sent.</p>
      </section>
      <footer className={styles.footer}>
        <span>TNP HOSPITALITY · PUBLIC INFORMATION</span>
        <Link href="/">Return home ↑</Link>
      </footer>
    </main>
  );
}

function OverviewContent({ kind }: { kind: PublicOverviewKind }) {
  if (kind === 'services')
    return (
      <section className={styles.overview} aria-labelledby="overview-title">
        <p className={styles.eyebrow}>EXPLORE THE CATALOGUE</p>
        <h2 id="overview-title">Choose the support you need.</h2>
        <div className={styles.overviewGrid}>
          {publicServices.map((item) => (
            <article className={styles.overviewCard} key={item.slug}>
              <img
                src={item.image.src}
                alt={item.image.alt}
                width="760"
                height="520"
              />
              <div>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <Link className="link-glow" href={'/services/' + item.slug}>
                  Explore service <ArrowUpRight size={17} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  if (kind === 'events')
    return (
      <section className={styles.overview} aria-labelledby="overview-title">
        <p className={styles.eyebrow}>ILLUSTRATIVE EVENT INSPIRATION</p>
        <h2 id="overview-title">Picture the experience.</h2>
        <div className={styles.editorialGrid}>
          {events.map((item) => (
            <figure key={item.title}>
              <img
                src={item.image.src}
                alt={item.image.alt}
                width="760"
                height="620"
              />
              <figcaption>
                <span>{item.place}</span>
                <h3>{item.title.toLowerCase()}</h3>
                <Link className="link-glow" href="/contact?interest=event-request">
                  Discuss this direction →
                </Link>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    );
  if (kind === 'destinations')
    return (
      <section className={styles.overview} aria-labelledby="overview-title">
        <p className={styles.eyebrow}>DESTINATION INSPIRATION</p>
        <h2 id="overview-title">Where could your story begin?</h2>
        <div className={styles.editorialGrid}>
          {destinations.map((item) => (
            <figure key={item.city}>
              <img
                src={item.image.src}
                alt={item.image.alt}
                width="760"
                height="620"
              />
              <figcaption>
                <span>{item.region}</span>
                <h3>{item.city}</h3>
                <p>{item.mood}</p>
                <Link className="link-glow" href="/contact?interest=venue-discovery">
                  Discuss venues →
                </Link>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    );
  if (kind === 'people')
    return (
      <section className={styles.overview} aria-labelledby="overview-title">
        <p className={styles.eyebrow}>THE PEOPLE BEHIND THE MOMENT</p>
        <h2 id="overview-title">Roles with a clear purpose.</h2>
        <div className={styles.overviewGrid}>
          {publicDepartments.map((item) => (
            <article className={styles.overviewCard} key={item.slug}>
              <img
                src={item.image.src}
                alt={item.image.alt}
                width="760"
                height="520"
              />
              <div>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <Link className="link-glow" href={'/departments/' + item.slug}>
                  Explore the role →
                </Link>
              </div>
            </article>
          ))}
        </div>
        <div className={styles.demoBand}>
          <div>
            <p className={styles.eyebrow}>TEMPORARY CLIENT DEMO</p>
            <h2>See the working spaces.</h2>
            <p>
              Choose a named synthetic identity. No password or live account is
              involved.
            </p>
          </div>
          <div className={styles.overviewActions}>
            <Link className={styles.button} href="/login?workspace=tnp-planner">
              Planner demo
            </Link>
            <Link className={styles.button} href="/login?workspace=freelancer">
              Freelancer demo
            </Link>
          </div>
        </div>
      </section>
    );
  if (kind === 'rsvp')
    return (
      <section className={styles.overview} aria-labelledby="overview-title">
        <p className={styles.eyebrow}>MESSAGE-ONLY RSVP PREVIEW</p>
        <h2 id="overview-title">From invitation to a clearer guest list.</h2>
        <div className={styles.rsvpOverview}>
          {[
            [
              'Function-wise responses',
              'Keep attendance and guest information grouped by the right celebration.',
            ],
            [
              'Travel and stay information',
              'Collect arrival, pickup and accommodation needs without implying booking or dispatch.',
            ],
            [
              'Human confirmation',
              'Keep ambiguous replies visible for a person to review instead of silently deciding.',
            ],
            [
              'Controlled reports',
              'Give the team a useful event view while preserving the original-message context.',
            ],
          ].map(([title, copy]) => (
            <article key={title}>
              <Check aria-hidden="true" />
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
        <div className={styles.demoBand}>
          <div>
            <p className={styles.eyebrow}>FOR THIS CLIENT WALKTHROUGH</p>
            <h2>Open the RSVP team workspace.</h2>
            <p>
              All guests, events and messages are synthetic. WhatsApp and
              external providers remain disconnected.
            </p>
          </div>
          <div className={styles.overviewActions}>
            <Link className={styles.button} href="/login?workspace=rsvp">
              Open RSVP demo
            </Link>
            <Link
              className={styles.button}
              href="/contact?interest=managed-rsvp"
            >
              Enquire about RSVP
            </Link>
          </div>
        </div>
      </section>
    );
  return (
    <section className={styles.overview} aria-labelledby="overview-title">
      <div className={styles.aboutStory}>
        <div>
          <p className={styles.eyebrow}>ONE CONNECTED EXPERIENCE</p>
          <h2 id="overview-title">
            Warm hospitality with a clear plan behind it.
          </h2>
          <p>
            TNP is presented as one coordinated experience across people,
            venues, planning and guest communication. The frontend demonstrates
            that intended journey using synthetic records.
          </p>
          <ul>
            <li>
              One contact path for a defined event need or a general
              conversation.
            </li>
            <li>Clear public information before any workspace access.</li>
            <li>
              Role-specific demo workspaces that explain current state and next
              action.
            </li>
          </ul>
        </div>
        <img
          src={byId('tablescape').src}
          alt={byId('tablescape').alt}
          width="900"
          height="720"
        />
      </div>
    </section>
  );
}
