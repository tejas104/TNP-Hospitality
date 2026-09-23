'use client';

import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Check, MapPin, Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import { byId, media } from '@/data/media';
import { destinations, events, roles, services } from '@/data/tnp';
import { departmentSlugs, serviceSlugs } from '@/data/public-content';
import PinnedFilmstrip from './public/PinnedFilmstrip';
import ProcessWorkflow from './public/ProcessWorkflow';
import styles from './public/Home.module.css';
import { useHomeMotion } from './public/useHomeMotion';
import { heroSurface } from './public/destination-motion';

// Ten illustrative settings for the pinned gallery (preview photography).
const filmItems = [
  ...events,
  ...(
    [
      ['WEDDING MOMENTS', 'Udaipur', 'wedding-couple'],
      ['FLORAL STORIES', 'Jaipur', 'floral'],
      ['CANDLELIT BANQUET', 'Delhi', 'banquet'],
      ['GUEST EXPERIENCE', 'Goa', 'guest-experience'],
      ['HERITAGE SETTINGS', 'Jaipur', 'architecture'],
    ] as const
  ).map(([title, place, id]) => ({ title, place, image: byId(id) })),
];

export default function HomeExperience() {
  const [serviceIndex, setServiceIndex] = useState(0);
  // Hover opens a service after a short intent delay; a brief lock after each
  // change stops rows shifting under a still cursor from cascading open.
  const hoverTimer = useRef(0);
  const hoverLock = useRef(false);
  const hoverOpen = (pointerType: string, index: number) => {
    if (pointerType !== 'mouse' || index === serviceIndex) return;
    if (hoverLock.current) return;
    clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => {
      hoverLock.current = true;
      window.setTimeout(() => (hoverLock.current = false), 300);
      setServiceIndex(index);
    }, 90);
  };
  const home = useRef<HTMLElement>(null);
  useHomeMotion(home, false);
  return (
    <main ref={home} className={styles.home} id="main-content" tabIndex={-1}>
      <section
        className={styles.hero}
        style={heroSurface}
        id="experience"
        aria-labelledby="home-title"
      >
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow} data-hero-stage data-motion="copy">
            <span /> PEOPLE. PLACES. PERFECTLY TOGETHER.
          </p>
          <h1 id="home-title">
            <span data-hero-stage data-motion="copy">
              Exceptional events.
            </span>
            <em data-hero-stage data-motion="copy">
              Thoughtfully
            </em>
            <span data-hero-stage data-motion="copy">
              human.
            </span>
          </h1>
          <p className={styles.lead} data-hero-stage data-motion="copy">
            From the first invitation to the final farewell, we bring the right
            people and every little detail together.
          </p>
          <div className={styles.actions} data-hero-stage data-motion="control">
            <Link href="/contact" className={styles.primary}>
              Plan with TNP <ArrowUpRight size={18} />
            </Link>
            <a href="#rsvp" className={`${styles.lightLink} link-glow`}>
              Discover RSVP <ArrowUpRight size={17} />
            </a>
          </div>
          <p className={styles.signature}>
            Luxury in Service, Excellence in Care
          </p>
        </div>
        {/* Moving photo background replaces the 3D cube (2026-09-21). */}
        <div className={styles.heroBackdrop} aria-hidden="true">
          {events.slice(0, 4).map((event) => (
            <img
              key={event.title}
              src={event.image.src}
              alt=""
              width="1600"
              height="1000"
              decoding="async"
            />
          ))}
        </div>
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
          <h2 id="about-title" data-motion="copy">
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
            data-motion="image"
          />
          <figcaption>
            Considered details. Warm welcomes. Illustrative preview imagery.
          </figcaption>
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
            <h2 id="services-title" data-motion="copy">
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
            {services.map((service, index) => {
              const open = serviceIndex === index;
              return (
                <article
                  key={service.number}
                  className={styles.serviceItem}
                  data-active={open}
                >
                  <h3>
                    <button
                      type="button"
                      data-motion="control"
                      data-stagger={index}
                      id={`home-service-trigger-${index}`}
                      aria-expanded={open}
                      aria-controls={`home-service-${index}`}
                      onClick={() => setServiceIndex(index)}
                      onPointerMove={(e) => hoverOpen(e.pointerType, index)}
                      onPointerLeave={() => clearTimeout(hoverTimer.current)}
                    >
                      <span>{service.number}</span>
                      {service.title}
                      <Plus size={18} aria-hidden="true" />
                    </button>
                  </h3>
                  <section
                    id={`home-service-${index}`}
                    className={styles.servicePanel}
                    aria-labelledby={`home-service-trigger-${index}`}
                    hidden={!open}
                  >
                    <img
                      src={service.image.src}
                      alt={service.image.alt}
                      width="900"
                      height="620"
                      loading="lazy"
                      decoding="async"
                    />
                    <div>
                      <p className={styles.eyebrow}>
                        THE PEOPLE BEHIND THE EXPERIENCE
                      </p>
                      <h4>{service.title}</h4>
                      <p>{service.copy}</p>
                      <Link
                        href={`/services/${serviceSlugs[index]}`}
                        className={`${styles.textLink} link-glow`}
                      >
                        Explore this service <ArrowUpRight size={16} />
                      </Link>
                    </div>
                  </section>
                </article>
              );
            })}
            <p className={styles.imageNote}>
              Select a service to open its story and illustrative image.
            </p>
            <Link href="/services#estimator-title" className={`${styles.textLink} link-glow`}>
              Not sure how many people you need? Estimate your team <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.rsvp} id="rsvp" aria-labelledby="rsvp-title">
        <div className={styles.rsvpIntro}>
          <p className={styles.eyebrow}>03 / RSVP & GUEST HOSPITALITY</p>
          <h2 id="rsvp-title" data-motion="copy">
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
              TNP-managed guest communication and hospitality, shaped around
              your event through one direct conversation with our team.
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
              className={`${styles.lightLink} link-glow`}
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
            <Link href="/contact?interest=vendor" className={`${styles.lightLink} link-glow`}>
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
        <PinnedFilmstrip
          items={filmItems}
          header={
            <div className={styles.sectionHead}>
              <div>
                <p className={styles.eyebrow}>04 / THE OCCASIONS</p>
                <h2 id="events-title" data-motion="copy">
                  A different setting.
                  <br />
                  <em>The same attention to detail.</em>
                </h2>
              </div>
              <p>
                From intimate gatherings to grand celebrations.
                <br />
                Explore the possibilities. Illustrative preview photography.
              </p>
            </div>
          }
        />
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
        data-destination-journey
        id="destinations"
        aria-labelledby="destinations-title"
      >
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.eyebrow}>05 / DESTINATIONS</p>
            <h2 id="destinations-title" data-motion="copy">
              Where your story
              <br />
              <em>takes you.</em>
            </h2>
          </div>
          <Link
            href="/contact?interest=event-request"
            className={`${styles.textLink} link-glow`}
          >
            Discuss venues for your event <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className={styles.destinationItinerary} aria-hidden="true">
          <span>PLACES TO IMAGINE</span>
          <div>
            <i />
            {destinations.map((destination, index) => (
              <b key={destination.city} style={{ left: `${index * 20}%` }}>
                0{index + 1}
              </b>
            ))}
          </div>
          <span>YOUR STORY, YOUR SETTING</span>
        </div>
        <div className={styles.destinationGrid}>
          {destinations.map((destination, index) => (
            <figure
              key={destination.city}
              data-destination-card
              data-stagger={index}
            >
              <div className={styles.destinationFrame} data-destination-frame>
                <img
                  src={destination.image.src}
                  alt={destination.image.alt}
                  width="600"
                  height="700"
                  data-destination-image
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <figcaption data-destination-label>
                <h3>{destination.city}</h3>
                <span>
                  <MapPin size={13} /> {destination.region}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className={styles.imageNote}>
          Illustrative destination photography. Your place, thoughtfully chosen.
        </p>
      </section>

      <section
        className={`${styles.section} ${styles.process}`}
        aria-labelledby="process-title"
      >
        <p className={styles.eyebrow}>06 / MADE SIMPLE</p>
        <h2 id="process-title" data-motion="copy">
          Consider it <em>taken care of.</em>
        </h2>
        <ProcessWorkflow />
      </section>

      <section
        className={`${styles.section} ${styles.people}`}
        id="people"
        aria-labelledby="people-title"
      >
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.eyebrow}>07 / PEOPLE OF TNP</p>
            <h2 id="people-title" data-motion="copy">
              Professional by nature.
              <br />
              <em>Personal by choice.</em>
            </h2>
          </div>
          <Link
            href="/contact?interest=event-coordinators"
            className={`${styles.textLink} link-glow`}
          >
            Enquire about event teams <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className={styles.peopleGrid}>
          {roles.map((role, index) => (
            <article key={role.role}>
              <img
                src={role.image.src}
                alt={role.image.alt}
                width="600"
                height="720"
                data-motion="image"
                data-stagger={index}
                loading="lazy"
                decoding="async"
              />
              <h3>
                <Link href={`/departments/${departmentSlugs[index]}`}>
                  {role.role} ↗
                </Link>
              </h3>
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
          data-motion="image"
          src={byId('terrace').src}
          alt=""
          loading="lazy"
          decoding="async"
          width="1600"
          height="900"
        />
        <div>
          <p className={styles.eyebrow}>LET&apos;S MAKE IT MEANINGFUL</p>
          <h2 id="contact-title" data-motion="copy">
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
