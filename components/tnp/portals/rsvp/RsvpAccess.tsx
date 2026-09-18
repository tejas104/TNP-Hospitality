'use client';

import { ArrowRight, Building2, Handshake, KeyRound, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ROLE_LABEL } from './model';
import { getAdapter, IllustrativeImage, MotionProvider, readPersona, useStored, writePersona, styles } from './ui';

const GROUPS: Array<{ title: string; icon: typeof Building2; note: string; ids: string[] }> = [
  { title: 'TNP-managed RSVP service', icon: Building2, note: 'TNP operates RSVP and hospitality; the customer sees a scoped portal.', ids: ['tnp-manager', 'tnp-caller', 'customer-mehra', 'hotel-contact', 'transport-lead'] },
  { title: 'Vendor-operated RSVP', icon: Handshake, note: 'An RSVP vendor manages its own customers and events in an isolated organization.', ids: ['marigold-owner', 'marigold-co-owner', 'multi-coordinator'] },
  { title: 'Access states', icon: KeyRound, note: 'See how blocked access is presented.', ids: ['saffron-owner', 'juniper-owner', 'revoked-session'] },
];

const INVITES: Array<[string, string]> = [
  ['mrw-guest-0101', 'Mehra–Rao Wedding · household invitation'],
  ['mrw-guest-0107', 'Mehra–Rao Wedding · second household'],
  ['ksw-guest-0104', 'Kapoor–Sethi Wedding (vendor) · household'],
  ['ksd-guest-0102', 'Kapoor–Seth Wedding · RSVP already closed'],
  ['mrw-expired', 'Expired invitation link'],
  ['mrw-revoked', 'Withdrawn invitation link'],
];

export function RsvpAccess() {
  return (
    <MotionProvider>
      <Access />
    </MotionProvider>
  );
}

function Access() {
  const router = useRouter();
  const current = useStored(readPersona);
  const [storageError, setStorageError] = useState(false);
  const personas = getAdapter().personas();

  const choose = (id: string) => {
    if (!writePersona(id)) {
      setStorageError(true);
      return;
    }
    router.push('/rsvp/workspace');
  };

  return (
    <main className={styles.root} id="main-content" tabIndex={-1}>
      <section className={`${styles.accessHero} ${styles.reveal}`} aria-labelledby="rsvp-access-title">
        <div className={styles.accessCopy}>
          <p className={styles.kicker}>TNP Hospitality · RSVP and guest hospitality</p>
          <h1 id="rsvp-access-title">Every guest, every function, every arrival — accounted for.</h1>
          <p>
            One workspace for invitations, function-wise responses, calling, travel, transfers, rooming and controlled reports. Sold as a TNP-managed service or as access for RSVP vendors, each working in
            its own organization.
          </p>
        </div>
        <IllustrativeImage image={{ id: 'rsvp-access-hero', mediaId: 'guest-experience', alt: 'Illustrative guest welcome at a celebration', provenance: 'Unsplash preview media via data/media' }} className={styles.accessImage} eager />
      </section>
      <div className={styles.accessBody}>
        <section className={styles.panel} aria-labelledby="preview-signin">
          <h2 id="preview-signin">Preview sign-in</h2>
          <p className={styles.notice}>
            Synthetic preview. Real sign-in is not integrated, so there is no password field. Choose a labelled sample persona; its access is simulated in this browser tab and is not server-enforced
            security.
          </p>
          {current && (
            <p>
              You are using a sample persona.{' '}
              <Link className={styles.linkBtn} href="/rsvp/workspace">
                Continue to the workspace <ArrowRight size={13} aria-hidden />
              </Link>
            </p>
          )}
          {storageError && (
            <p className={styles.fieldError} role="alert">
              This browser blocked session storage, so the preview cannot remember a persona. Allow site data for this tab and try again.
            </p>
          )}
          <div className={styles.personaGroups}>
            {GROUPS.map((g) => {
              const Icon = g.icon;
              return (
                <section key={g.title} className={styles.personaGroup} aria-labelledby={`pg-${g.title}`}>
                  <h3 id={`pg-${g.title}`}>
                    <Icon size={17} aria-hidden /> {g.title}
                  </h3>
                  <p className={styles.meta}>{g.note}</p>
                  <ul>
                    {g.ids.map((id) => {
                      const p = personas.find((x) => x.id === id);
                      if (!p) return null;
                      return (
                        <li key={id}>
                          <button type="button" className={styles.personaBtn} onClick={() => choose(id)} aria-current={current === id ? 'true' : undefined}>
                            <strong>{p.name}</strong>
                            <span>{ROLE_LABEL[p.role]}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
        </section>
        <section className={styles.panel} aria-labelledby="guest-links">
          <h2 id="guest-links">
            <Mail size={18} aria-hidden /> Sample guest invitation links
          </h2>
          <p className={styles.meta}>Restricted, per-household links. In production they would expire and be revocable; here they open synthetic households.</p>
          <ul className={styles.linkList}>
            {INVITES.map(([token, label]) => (
              <li key={token}>
                <Link href={`/rsvp/invite/${token}`}>
                  {label} <ArrowRight size={13} aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
