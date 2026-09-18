import Link from 'next/link';
import EnquiryForm from '@/components/tnp/public/EnquiryForm';
import styles from '@/components/tnp/public/Public.module.css';

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ interest?: string }>;
}) {
  const query = await searchParams;
  const interest =
    query.interest === 'vendor'
      ? 'Vendor platform interest'
      : query.interest === 'managed-rsvp'
        ? 'Managed RSVP enquiry'
        : 'Event enquiry';
  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <section className={styles.heading}>
        <Link href="/">TNP / HOME</Link>
        <p className={styles.eyebrow}>A CONVERSATION, THOUGHTFULLY STARTED</p>
        <h1>
          Tell us what
          <br />
          <em>you have in mind.</em>
        </h1>
        <p>{interest}. Shape your ideas with a sample enquiry.</p>
      </section>
      <section className={styles.contactLayout} aria-label="Enquiry preview">
        <aside>
          <p className={styles.eyebrow}>THE FIRST DETAILS</p>
          <h2>
            People. Place.
            <br />
            Possibility.
          </h2>
          <p>
            Tell us about the occasion, the destination and the support you are
            exploring. Use invented details while this experience is in preview.
          </p>
          <div className={styles.pending}>
            <h3>Before we go live</h3>
            <p>
              Approved contact details, service copy and enquiry routing are
              pending. Phone, email and WhatsApp contact channels will appear
              after client approval.
            </p>
          </div>
          <Link href="/contact?interest=vendor">
            Interested in vendor access? →
          </Link>
        </aside>
        <EnquiryForm key={interest} interest={interest} />
      </section>
      <footer className={styles.footer}>
        <span>TNP HOSPITALITY · CONTENT PREVIEW</span>
        <Link href="/#services">Explore our services →</Link>
      </footer>
    </main>
  );
}
