'use client';

import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Check, MapPin, Plus } from 'lucide-react';
import { useState } from 'react';
import { byId, media } from '@/data/media';
import { destinations, events, roles, services } from '@/data/tnp';
import HomeHero from './public/HomeHero';
import styles from './public/Home.module.css';

export default function HomeExperience() {
  const [serviceIndex, setServiceIndex] = useState(0);
  return (
    <main className={styles.home} id="main-content" tabIndex={-1}>
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            <span /> PEOPLE. PLACES. PERFECTLY TOGETHER.
          </p>
          <h1 id="home-title">
            Exceptional events.
            <br />
            <em>Thoughtfully</em>
            <br />
            human.
          </h1>
          <p className={styles.lead}>
            From the first invitation to the final farewell, we bring the right
            people and every little detail together.
          </p>
          <div className={styles.actions}>
            <Link href="/contact" className={styles.primary}>
              Plan with TNP <ArrowUpRight size={18} />
            </Link>
            <a href="#rsvp" className={styles.lightLink}>
              Discover RSVP <ArrowUpRight size={17} />
            </a>
          </div>
          <p className={styles.signature}>
            Luxury in Service, Excellence in Care
          </p>
        </div>
        <HomeHero />
        <div className={styles.heroFoot}>
          <span>HOSPITALITY, WITH INTENTION</span>
          <a href="#services">
            Explore the experience <ArrowDown size={16} />
          </a>
          <span>INDIA · WHEREVER YOU CELEBRATE</span>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.intro}`}
        id="about"
        aria-labelledby="about-title"
      >
        <p className={styles.eyebrow}>01 / THE TNP APPROACH</p>
        <div>
          <h2 id="about-title">
            You remember the moment.
            <br />
            <em>We care for everything around it.</em>
          </h2>
          <p>
            Welcoming your guests. Guiding the team. Keeping the celebration
            flowing. TNP brings hospitality, event professionals and thoughtful
            coordination into one experience.
          </p>
        </div>
        <figure>
          <img
            src={byId('tablescape').src}
            alt={byId('tablescape').alt}
            loading="lazy"
            decoding="async"
            width="640"
            height="480"
          />
          <figcaption>Considered details. Warm welcomes.</figcaption>
        </figure>
      </section>

      <section
        className={`${styles.section} ${styles.services}`}
        id="services"
        aria-labelledby="services-title"
      >
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.eyebrow}>02 / OUR SERVICES</p>
            <h2 id="services-title">
              Good people.
              <br />
              <em>Extraordinary care.</em>
            </h2>
          </div>
          <p>
            One celebration or a full event calendar.
            <br />
            Find the support that fits your plans.
          </p>
        </div>
        <div className={styles.serviceLayout}>
          <div className={styles.serviceList}>
            {services.map((service, index) => (
              <div
                key={service.number}
                className={styles.serviceItem}
                data-active={serviceIndex === index}
              >
                <h3>
                  <button
                    type="button"
                    aria-expanded={serviceIndex === index}
                    aria-controls={`home-service-${index}`}
                    onClick={() => setServiceIndex(index)}
                  >
                    <span>{service.number}</span>
                    {service.title}
                    <Plus size={18} />
                  </button>
                </h3>
                <div
                  id={`home-service-${index}`}
                  hidden={serviceIndex !== index}
                >
                  <p>{service.copy}</p>
                  <Link
                    href={index === 4 ? '#rsvp' : '/client'}
                    className={styles.textLink}
                  >
                    {index === 4
                      ? 'Explore RSVP services'
                      : 'Explore the client experience'}{' '}
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.servicePhoto}>
            {services.map((service, index) => (
              <img
                key={service.number}
                hidden={serviceIndex !== index}
                src={service.image.src}
                alt={service.image.alt}
                width="900"
                height="1100"
                loading="lazy"
                decoding="async"
              />
            ))}
            <div className={styles.photoLabel}>
              <span>THE PEOPLE BEHIND THE EXPERIENCE</span>
              <p>{services[serviceIndex].title}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.rsvp} id="rsvp" aria-labelledby="rsvp-title">
        <div className={styles.rsvpIntro}>
          <p className={styles.eyebrow}>03 / RSVP & GUEST HOSPITALITY</p>
          <h2 id="rsvp-title">
            Every guest matters.
            <br />
            <em>Every detail belongs.</em>
          </h2>
          <p>
            Responses, arrivals, stays and special requests. A thoughtful
            service for hosts, and a dedicated workspace being built for event
            businesses.
          </p>
        </div>
        <div className={styles.rsvpOffers}>
          <article>
            <span className={styles.offerNumber}>FOR HOSTS & FAMILIES</span>
            <h3>
              Your guests.
              <br />
              Our personal attention.
            </h3>
            <p>
              TNP-managed guest communication and hospitality, with a dedicated
              client portal planned for oversight of your event.
            </p>
            <ul>
              <li>
                <Check size={16} /> Function-wise responses & follow-ups
              </li>
              <li>
                <Check size={16} /> Arrival, pickup & accommodation needs
              </li>
              <li>
                <Check size={16} /> Guest forms & organised event reports
              </li>
            </ul>
            <Link
              href="/contact?interest=managed-rsvp"
              className={styles.lightLink}
            >
              Enquire about managed RSVP <ArrowUpRight size={17} />
            </Link>
            <img
              src={byId('floral').src}
              alt={byId('floral').alt}
              loading="lazy"
              decoding="async"
              width="800"
              height="450"
            />
          </article>
          <article>
            <span className={styles.offerNumber}>
              FOR VENDORS & EVENT BUSINESSES
            </span>
            <h3>
              Your events.
              <br />A workspace of your own.
            </h3>
            <p>
              A planned workspace for managing RSVP across customers and events,
              with vendor access provisioned by TNP. Register your interest
              below.
            </p>
            <ul>
              <li>
                <Check size={16} /> Separate vendor & event workspaces
              </li>
              <li>
                <Check size={16} /> Guest categories, forms & logistics
              </li>
              <li>
                <Check size={16} /> Planned WhatsApp, documents & exports
              </li>
            </ul>
            <Link href="/contact?interest=vendor" className={styles.lightLink}>
              Register vendor interest <ArrowUpRight size={17} />
            </Link>
            <img
              src={byId('guest-experience').src}
              alt={byId('guest-experience').alt}
              loading="lazy"
              decoding="async"
              width="800"
              height="450"
            />
          </article>
        </div>
        <p className={styles.previewNote}>
          Platform in development. Vendor login, WhatsApp automation and private
          document storage are planned and disabled. Enquiries are synthetic
          previews; no external message is sent.
        </p>
      </section>

      <section
        className={`${styles.section} ${styles.events}`}
        id="events"
        aria-labelledby="events-title"
      >
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.eyebrow}>04 / THE OCCASIONS</p>
            <h2 id="events-title">
              A different setting.
              <br />
              <em>The same attention to detail.</em>
            </h2>
          </div>
          <p>
            From intimate gatherings to grand celebrations.
            <br />
            Explore the possibilities.
          </p>
        </div>
        <div className={styles.eventGrid}>
          {events.map((event, index) => (
            <figure key={event.title}>
              <img
                src={event.image.src}
                alt={event.image.alt}
                width="800"
                height="960"
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                <span>
                  0{index + 1} / {event.place}
                </span>
                <h3>{event.title.toLowerCase()}</h3>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className={styles.imageNote}>
          Illustrative imagery for event inspiration; not a verified portfolio
          of TNP commissions.
        </p>
        <details className={styles.gallery}>
          <summary>
            Explore the inspiration gallery{' '}
            <span>
              13 photographs <Plus size={18} />
            </span>
          </summary>
          <div className={styles.galleryGrid}>
            {media.slice(0, 13).map((item) => (
              <img
                key={item.id}
                src={item.src}
                alt={item.alt}
                width="600"
                height="450"
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
        </details>
      </section>

      <section
        className={`${styles.section} ${styles.destinations}`}
        id="destinations"
        aria-labelledby="destinations-title"
      >
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.eyebrow}>05 / DESTINATIONS</p>
            <h2 id="destinations-title">
              Where your story
              <br />
              <em>takes you.</em>
            </h2>
          </div>
          <Link href="/client" className={styles.textLink}>
            Explore venues in the client preview <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className={styles.destinationGrid}>
          {destinations.map((destination) => (
            <figure key={destination.city}>
              <img
                src={destination.image.src}
                alt={destination.image.alt}
                width="600"
                height="700"
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                <h3>{destination.city}</h3>
                <span>
                  <MapPin size={13} /> {destination.region}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.process}`}
        aria-labelledby="process-title"
      >
        <p className={styles.eyebrow}>06 / MADE SIMPLE</p>
        <h2 id="process-title">
          Consider it <em>taken care of.</em>
        </h2>
        <ol>
          {[
            [
              'Share your vision',
              'Tell us about your occasion, destination and the support you need.',
            ],
            [
              'Shape the experience',
              'Align on the team, guest journey, responsibilities and event details.',
            ],
            [
              'Welcome the moment',
              'Your hospitality team brings the plan together on the ground.',
            ],
          ].map(([title, copy], index) => (
            <li key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        className={`${styles.section} ${styles.people}`}
        aria-labelledby="people-title"
      >
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.eyebrow}>07 / PEOPLE OF TNP</p>
            <h2 id="people-title">
              Professional by nature.
              <br />
              <em>Personal by choice.</em>
            </h2>
          </div>
          <Link href="/freelancer" className={styles.textLink}>
            Join the network <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className={styles.peopleGrid}>
          {roles.map((role) => (
            <article key={role.role}>
              <img
                src={role.image.src}
                alt={role.image.alt}
                width="600"
                height="720"
                loading="lazy"
                decoding="async"
              />
              <h3>{role.role}</h3>
              <p>{role.caption}</p>
            </article>
          ))}
        </div>
        <p className={styles.imageNote}>
          Role illustrations using preview imagery.
        </p>
      </section>

      <section className={styles.finalCta} aria-labelledby="contact-title">
        <img
          src={byId('terrace').src}
          alt=""
          loading="lazy"
          decoding="async"
          width="1600"
          height="900"
        />
        <div>
          <p className={styles.eyebrow}>LET&apos;S MAKE IT MEANINGFUL</p>
          <h2 id="contact-title">
            A beautiful event begins
            <br />
            <em>with a conversation.</em>
          </h2>
          <Link href="/contact" className={styles.primary}>
            Plan with TNP <ArrowUpRight size={18} />
          </Link>
          <p>Try a synthetic enquiry. No external message is sent.</p>
        </div>
      </section>
      <footer className={styles.footer}>
        <span>
          TNP <small>HOSPITALITY</small>
        </span>
        <p>Luxury in Service, Excellence in Care</p>
        <a href="#main-content">Back to top ↑</a>
      </footer>
    </main>
  );
}
