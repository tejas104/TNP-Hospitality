'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowUpRight, ChevronRight, MapPin, Plus } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useState } from 'react';
import { byId, media } from '@/data/media';
import { destinations, events, roles, services } from '@/data/tnp';
import TeamOrbit from './TeamOrbit';

const EventOrbit = dynamic(() => import('@/components/three/EventOrbit'), {
  ssr: false,
});

gsap.registerPlugin(ScrollTrigger);

export default function HomeExperience() {
  const [serviceIndex, setServiceIndex] = useState(0);
  const [destinationIndex, setDestinationIndex] = useState(0);
  const activeService = services[serviceIndex];
  const activeDestination = destinations[destinationIndex];

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
        gsap.fromTo(
          element,
          { y: 48, opacity: 0, filter: 'blur(10px)' },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 1.05,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 82%',
            },
          },
        );
      });

      gsap.to('.hero-title', {
        yPercent: -18,
        opacity: 0.55,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.to('.orbit-wrap', {
        scale: 1.17,
        yPercent: 11,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.utils
        .toArray<HTMLElement>('[data-drift]')
        .forEach((element, index) => {
          const direction = index % 2 === 0 ? -1 : 1;
          gsap.to(element, {
            y: direction * 110,
            x: direction * 28,
            ease: 'none',
            scrollTrigger: {
              trigger: element.parentElement,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          });
        });

      gsap.to('.filmstrip-track', {
        xPercent: -58,
        ease: 'none',
        scrollTrigger: {
          trigger: '.filmstrip-section',
          start: 'top top',
          end: '+=1700',
          scrub: 0.8,
          pin: true,
        },
      });

      gsap.utils.toArray<HTMLElement>('[data-count]').forEach((element) => {
        const target = Number(element.dataset.count ?? '0');
        const counter = { value: 0 };
        gsap.to(counter, {
          value: target,
          duration: 1.4,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
          },
          onUpdate: () => {
            element.textContent = Math.round(counter.value).toLocaleString(
              'en-IN',
            );
          },
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <main className="tnp-site">
      <section className="hero-section">
        <div className="hero-vignette" />
        <div className="orbit-wrap">
          <EventOrbit />
        </div>
        <div className="hero-copy">
          <p className="eyebrow">TNP HOSPITALITY</p>
          <h1 className="hero-title">
            <span>Where exceptional events </span>
            <span>meet exceptional people.</span>
          </h1>
          <p className="hero-support">
            Hospitality manpower, event professionals, planners and venues
            brought together through one seamless experience.
          </p>
          <div className="hero-actions">
            <Link
              className="magnetic-btn"
              href="#services"
              data-cursor="EXPLORE"
            >
              Explore the Experience <ArrowUpRight size={17} />
            </Link>
            <a className="ghost-btn" href="/freelancer" data-cursor="OPEN">
              Join Our Network
            </a>
          </div>
          <p className="tagline">Luxury in Service, Excellence in Care</p>
        </div>
      </section>

      <section className="editorial-intro" id="about">
        <div className="editorial-images">
          {['tablescape', 'floral', 'wedding-couple', 'architecture'].map(
            (id, index) => (
              <img
                key={id}
                data-drift
                className={`intro-photo photo-${index + 1}`}
                src={byId(id).src}
                alt={byId(id).alt}
              />
            ),
          )}
        </div>
        <div className="intro-type" data-reveal>
          <p>Luxury in Service, Excellence in Care</p>
          <h2>
            An event is never just a moment.
            <span>It&apos;s everything that happens around it.</span>
          </h2>
        </div>
      </section>

      <section className="photo-world">
        <p className="section-kicker" data-reveal>
          THE WORLD OF TNP
        </p>
        <div className="photo-columns">
          {[0, 1, 2].map((column) => (
            <div className={`photo-column column-${column + 1}`} key={column}>
              {media.slice(column * 4, column * 4 + 5).map((item, index) => (
                <img
                  key={`${item.id}-${column}`}
                  data-drift
                  src={item.src}
                  alt={item.alt}
                  className={index % 2 ? 'landscape-img' : 'portrait-img'}
                  data-cursor="VIEW"
                />
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="services-showcase" id="services">
        <div className="service-copy" data-reveal>
          <p className="section-kicker">SERVICES</p>
          <h2>People behind perfect experiences.</h2>
          <div className="service-list" aria-label="TNP services">
            {services.map((service, index) => (
              <div
                className={`service-item ${index === serviceIndex ? 'active' : ''}`}
                key={service.title}
                onMouseEnter={() => setServiceIndex(index)}
              >
                <button
                  type="button"
                  onClick={() => setServiceIndex(index)}
                  onFocus={() => setServiceIndex(index)}
                  aria-expanded={index === serviceIndex}
                  aria-controls={`service-detail-${index}`}
                  data-cursor="EXPLORE"
                >
                  <span>{service.number}</span>
                  <b>{service.title}</b>
                  <Plus size={18} />
                </button>
                <div
                  id={`service-detail-${index}`}
                  className="service-detail"
                  aria-hidden={index !== serviceIndex}
                >
                  <div>
                    <p>{service.copy}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          className="service-visual"
          style={{ backgroundColor: activeService.tint }}
        >
          {services.map((service, index) => (
            <img
              key={service.title}
              className={index === serviceIndex ? 'active' : ''}
              src={service.image.src}
              alt={index === serviceIndex ? service.image.alt : ''}
              aria-hidden={index !== serviceIndex}
              loading="lazy"
            />
          ))}
          <div className="service-counter">
            {activeService.number}
            <span>/ 06</span>
          </div>
          <p className="service-image-caption">{activeService.title}</p>
        </div>
      </section>

      <section className="filmstrip-section" id="events">
        <div className="filmstrip-heading">
          <p className="section-kicker">EVENTS</p>
          <h2>Moments that move people.</h2>
        </div>
        <div className="filmstrip-track">
          {events.map((event, index) => (
            <article
              key={event.title}
              className={`film-card width-${(index % 3) + 1}`}
              data-cursor="VIEW"
            >
              <img src={event.image.src} alt={event.image.alt} />
              <div>
                <span>{event.place}</span>
                <h3>{event.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="destination-explorer" id="destinations">
        <div className="destination-copy" data-reveal>
          <p className="section-kicker">DESTINATIONS</p>
          <h2>Wherever the moment takes you.</h2>
        </div>
        <div className="destination-stage">
          <div className="destination-scenes">
            {destinations.map((destination, index) => (
              <img
                key={destination.city}
                className={index === destinationIndex ? 'active' : ''}
                src={destination.image.src}
                alt={index === destinationIndex ? destination.image.alt : ''}
                aria-hidden={index !== destinationIndex}
                loading="eager"
                decoding="async"
              />
            ))}
          </div>
          <div className="destination-meta" key={activeDestination.city}>
            <span>
              <MapPin size={16} /> {activeDestination.region}
            </span>
            <p>{activeDestination.mood}</p>
          </div>
          <div className="destination-list">
            {destinations.map((destination, index) => (
              <button
                key={destination.city}
                type="button"
                onMouseEnter={() => setDestinationIndex(index)}
                onFocus={() => setDestinationIndex(index)}
                onClick={() => setDestinationIndex(index)}
                aria-pressed={index === destinationIndex}
                className={index === destinationIndex ? 'active' : ''}
                data-cursor="EXPLORE"
              >
                <span>{destination.index}</span>
                <b>{destination.city}</b>
                <ArrowUpRight size={24} />
              </button>
            ))}
          </div>
          <div className="destination-stamp" aria-hidden="true">
            <span>{activeDestination.index} / 06</span>
            <b key={activeDestination.city}>{activeDestination.city}</b>
          </div>
        </div>
      </section>

      <section className="people-wall">
        <div className="people-heading" data-reveal>
          <p className="section-kicker">TNP PEOPLE</p>
          <h2>The people make the experience.</h2>
        </div>
        <div className="portrait-row">
          {roles.map((role, index) => (
            <article
              key={role.role}
              className={`portrait-card portrait-${index + 1}`}
            >
              <div className="portrait-image">
                <img
                  src={role.image.src}
                  alt={role.image.alt}
                  data-cursor="VIEW"
                  loading="lazy"
                />
              </div>
              <div className="portrait-title">
                <span>0{index + 1}</span>
                <h3>{role.role}</h3>
              </div>
              <p>{role.caption}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="model-visual">
        <div className="model-copy" data-reveal>
          <p className="section-kicker">THE TNP CONNECTION</p>
          <h2>
            The right people.
            <span>At the right event.</span>
            <span>At the right time.</span>
          </h2>
        </div>
        <TeamOrbit />
      </section>

      <section className="platform-reveal">
        <div className="platform-photos">
          <img src={byId('floral').src} alt={byId('floral').alt} />
          <img
            src={byId('guest-experience').src}
            alt={byId('guest-experience').alt}
          />
        </div>
        <div className="dashboard-preview" data-cursor="OPEN">
          <p className="section-kicker">BEHIND THE EXPERIENCE</p>
          <h2>Behind every seamless event is a system.</h2>
          <div className="ops-grid">
            {[
              'Workforce',
              'Planners',
              'Assignments',
              'Attendance',
              'Ratings',
              'Payouts',
            ].map((item, index) => (
              <span key={item} style={{ animationDelay: `${index * 80}ms` }}>
                {item}
              </span>
            ))}
          </div>
          <a className="magnetic-btn dark" href="/admin">
            Explore the Platform <ChevronRight size={16} />
          </a>
        </div>
      </section>

      <section className="rsvp-preview">
        <div data-reveal>
          <p className="section-kicker">RSVP SERVICE</p>
          <h2>Every guest. Every response. Every detail.</h2>
          <p>
            Advanced RSVP automation is planned as a future extension of the TNP
            ecosystem.
          </p>
        </div>
        <div className="rsvp-board">
          <div className="rsvp-stats">
            {[
              ['300', 'Guests'],
              ['187', 'Confirmed'],
              ['71', 'Awaiting Response'],
              ['42', 'Not Attending'],
              ['143', 'Documents Received'],
            ].map(([value, label]) => (
              <span key={label}>
                <strong>{value}</strong>
                {label}
              </span>
            ))}
          </div>
          <div className="chat-preview">
            <p>
              Hello Mr. Mehta, we&apos;re reaching out on behalf of the Sharma
              family regarding tomorrow&apos;s wedding celebration. May we
              confirm your attendance?
            </p>
            {[
              'Confirmed',
              'Accommodation Required',
              'ID Required',
              'Final Guest List',
            ].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="rsvp-timeline">
            {[
              'Introduction',
              'Confirmation',
              'Follow-up',
              'Documentation',
              'Final Status',
            ].map((step) => (
              <span key={step}>{step}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="scale-section">
        {[
          ['5000', 'FREELANCE PROFESSIONALS'],
          ['100', 'PLANNERS'],
          ['180', 'EVENTS / YEAR'],
        ].map(([value, label]) => (
          <div className="scale-line" key={label}>
            <strong>
              <span data-count={value}>0</span>+
            </strong>
            <p>Designed for a network of {label.toLowerCase()}</p>
          </div>
        ))}
      </section>

      <section className="final-cta">
        <img src={byId('terrace').src} alt={byId('terrace').alt} />
        <div>
          <h2>Your next event deserves more.</h2>
          <p>Let&apos;s create an experience people remember.</p>
          <div className="hero-actions">
            <a className="magnetic-btn" href="/client">
              Plan an Event
            </a>
            <a className="ghost-btn light" href="/freelancer">
              Join TNP
            </a>
          </div>
          <span>Luxury in Service, Excellence in Care</span>
        </div>
      </section>
    </main>
  );
}
