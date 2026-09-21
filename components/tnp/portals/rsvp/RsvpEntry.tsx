'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDemoAccess, StorageWarning } from '../../access/DemoAccess';
import styles from './RsvpWorkspace.module.css';

export function RsvpEntry() {
  const access = useDemoAccess();
  const router = useRouter();
  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <p className={styles.kicker}>Dedicated team access · synthetic</p>
      <h1>RSVP team workspace</h1>
      <p>
        This dedicated preview is separate from public workspace entry. No real
        guest information, live messages or production authentication.
      </p>
      <StorageWarning />
      <button
        disabled={!access.ready}
        onClick={() => {
          access.select('rsvp-team');
          router.push('/rsvp/workspace');
        }}
      >
        Enter sample RSVP team
      </button>
      <p>
        <Link href="/services/rsvp">Read about the RSVP service →</Link>
      </p>
    </main>
  );
}
