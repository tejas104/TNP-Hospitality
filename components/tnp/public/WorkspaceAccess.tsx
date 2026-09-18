import Link from 'next/link';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  HeartHandshake,
  UserRound,
} from 'lucide-react';
import { byId } from '@/data/media';
import { accessAudiences } from './access-content';
import styles from './WorkspaceAccess.module.css';

const icons = [UserRound, CalendarDays, BriefcaseBusiness, HeartHandshake];

export default function WorkspaceAccess() {
  const image = byId('tablescape');
  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <section className={styles.heading} aria-labelledby="access-title">
        <div>
          <Link href="/" className={styles.homeLink}>
            TNP / HOME
          </Link>
          <p className={styles.eyebrow}>WORKSPACE / LOGIN ACCESS</p>
          <h1 id="access-title">
            One identity.
            <br />
            <em>Your place in TNP.</em>
          </h1>
          <p>
            The production plan is one shared TNP identity, with workspace
            access based on your role. For now, discover the experience that
            fits you.
          </p>
        </div>
        <figure>
          <img
            src={image.src}
            alt={image.alt}
            width="640"
            height="480"
            decoding="async"
          />
          <figcaption>
            People coming together. Illustrative {image.source} preview
            photography.
          </figcaption>
        </figure>
      </section>
      <section className={styles.access} aria-labelledby="choose-space-title">
        <div className={styles.intro}>
          <p className={styles.eyebrow}>CHOOSE YOUR CONTEXT</p>
          <h2 id="choose-space-title">
            Where would you
            <br />
            <em>like to begin?</em>
          </h2>
          <p>
            Secure production sign-in is not enabled in this local preview. No
            password or personal credentials are needed here.
          </p>
          <div className={styles.notice}>
            <strong>A preview, not a live account</strong>
            <p>
              The actions alongside open synthetic workspaces or an enquiry
              preview. No real bookings, payments or external messages are made.
            </p>
          </div>
        </div>
        <div className={styles.choices}>
          {accessAudiences.map((audience, index) => {
            const Icon = icons[index];
            return (
              <article key={audience.id}>
                <div className={styles.cardTop}>
                  <Icon size={23} strokeWidth={1.5} aria-hidden="true" />
                  <span>{audience.kind}</span>
                </div>
                <h3>{audience.name}</h3>
                <p>{audience.detail}</p>
                <Link href={audience.href} className={styles.action}>
                  {audience.action}
                  <ArrowUpRight size={17} aria-hidden="true" />
                </Link>
              </article>
            );
          })}
        </div>
      </section>
      <aside
        className={styles.staff}
        aria-label="Production and staff access information"
      >
        <h2>Already part of the team?</h2>
        <p>
          TNP Staff access is provisioned separately and is not enabled here.
          Production account invitations and secure sign-in will be available
          after the authentication rollout.
        </p>
        <Link href="/contact">
          Ask about the right workspace{' '}
          <ArrowUpRight size={17} aria-hidden="true" />
        </Link>
      </aside>
      <footer className={styles.footer}>
        <span>TNP HOSPITALITY · LOCAL PREVIEW</span>
        <Link href="/#services">Explore our services →</Link>
      </footer>
    </main>
  );
}
