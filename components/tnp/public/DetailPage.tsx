import Link from 'next/link';
import {
  publicDepartments,
  publicServices,
  type PublicDetail,
} from '@/data/public-content';
import styles from './Public.module.css';

export default function DetailPage({ detail }: { detail: PublicDetail }) {
  const related = (
    detail.category === 'service' ? publicDepartments : publicServices
  ).filter((item) => detail.related.includes(item.slug));
  const catalogue =
    detail.category === 'service' ? publicServices : publicDepartments;
  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <section className={`${styles.heading} ${styles.detailHeading}`}>
        <div>
          <Link
            href={detail.category === 'service' ? '/#services' : '/#people'}
          >
            TNP / {detail.category === 'service' ? 'SERVICES' : 'PEOPLE'}
          </Link>
          <p className={styles.eyebrow}>
            {detail.category === 'service'
              ? 'CARE, IN EVERY DETAIL'
              : 'THE PEOPLE BEHIND THE MOMENT'}
          </p>
          <h1>{detail.title}</h1>
          <p>{detail.summary}</p>
          <Link
            className={styles.creamButton}
            href={`/contact?interest=${detail.slug}`}
          >
            Discuss your plans ↗
          </Link>
        </div>
        <figure>
          <img
            src={detail.image.src}
            alt={detail.image.alt}
            width="900"
            height="1000"
          />
          <figcaption>
            Illustrative preview imagery · not verified TNP work
          </figcaption>
        </figure>
      </section>
      <section
        className={styles.detailBody}
        aria-labelledby="detail-introduction"
      >
        <div className={styles.detailIntro}>
          <p className={styles.eyebrow}>THE EXPERIENCE</p>
          <h2 id="detail-introduction">
            Thoughtful support.
            <br />
            <em>A personal approach.</em>
          </h2>
          <p>{detail.introduction}</p>
        </div>
        <div className={styles.discussion}>
          <p className={styles.eyebrow}>LET’S SHAPE THE BRIEF</p>
          <h2>
            Start with
            <br />
            the right questions.
          </h2>
          <ol>
            {detail.discussion.map((question, index) => (
              <li key={question}>
                <span>0{index + 1}</span>
                <p>{question}</p>
              </li>
            ))}
          </ol>
          <p className={styles.smallCopy}>
            These are discussion prompts, not confirmed package inclusions.
            Scope, availability, staffing and commercial terms need individual
            confirmation.
          </p>
        </div>
        {detail.slug === 'rsvp' && (
          <div className={styles.rsvpDetail}>
            <h2>
              One guest journey.
              <br />
              Two ways to explore it.
            </h2>
            <div>
              <h3>TNP-managed service</h3>
              <p>
                Human-led guest communication and hospitality, with customer
                oversight planned through a dedicated portal.
              </p>
              <Link href="/contact?interest=managed-rsvp">
                Enquire about managed RSVP →
              </Link>
            </div>
            <div>
              <h3>Vendor platform interest</h3>
              <p>
                Separate vendor workspaces are planned. Vendor login, WhatsApp
                automation, document handling and exports are in development and
                disabled in this preview.
              </p>
              <Link href="/contact?interest=vendor">
                Register vendor interest →
              </Link>
            </div>
          </div>
        )}
        <aside className={styles.provenance}>
          <p className={styles.eyebrow}>CONTENT & ASSET STATUS</p>
          <p>{detail.provenance}</p>
          <p>
            This page demonstrates the public experience. It does not certify
            approved content, live provider services or production availability.
          </p>
        </aside>
      </section>
      <section className={styles.related} aria-labelledby="related-title">
        <p className={styles.eyebrow}>CONNECTED BY CARE</p>
        <h2 id="related-title">
          {detail.category === 'service'
            ? 'Meet the roles.'
            : 'Explore the service.'}
        </h2>
        {related.map((item) => (
          <Link
            key={item.slug}
            href={`/${item.category === 'service' ? 'services' : 'departments'}/${item.slug}`}
          >
            <span>
              {item.title}
              <small>{item.summary}</small>
            </span>
            <span aria-hidden="true">↗</span>
          </Link>
        ))}
      </section>
      <section className={styles.detailCta}>
        <p className={styles.eyebrow}>A GOOD PLACE TO BEGIN</p>
        <h2>
          Bring your ideas.
          <br />
          <em>We’ll start with the details.</em>
        </h2>
        <Link
          className={styles.creamButton}
          href={`/contact?interest=${detail.slug}`}
        >
          Try a sample enquiry ↗
        </Link>
        <p>Synthetic preview only. No email or external message is sent.</p>
      </section>
      <nav
        className={styles.catalogue}
        aria-label={`More ${detail.category === 'service' ? 'services' : 'departments'}`}
      >
        <p className={styles.eyebrow}>CONTINUE EXPLORING</p>
        {catalogue.map((item) => (
          <Link
            key={item.slug}
            aria-current={item.slug === detail.slug ? 'page' : undefined}
            href={`/${item.category === 'service' ? 'services' : 'departments'}/${item.slug}`}
          >
            {item.title}
          </Link>
        ))}
      </nav>
      <footer className={styles.footer}>
        <span>TNP HOSPITALITY · CONTENT PREVIEW</span>
        <Link href="/">Back to the experience ↑</Link>
      </footer>
    </main>
  );
}
