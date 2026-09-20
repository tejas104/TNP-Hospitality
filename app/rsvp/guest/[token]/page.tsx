import Link from 'next/link';
export default function Page() {
  return (
    <main id="main-content" tabIndex={-1} className="ux-access-pending">
      <p className="ux-eyebrow">GUEST INVITATION</p>
      <h1>This invitation cannot be opened here.</h1>
      <p>
        This preview does not resolve real invitation links or expose guest
        details. Contact your event organizer using the contact information on
        your original invitation.
      </p>
      <p>Staff workspace access is separate from guest invitations.</p>
      <Link
        className="ux-action ux-action-primary"
        href="/contact?interest=rsvp"
      >
        Ask TNP about RSVP services
      </Link>
    </main>
  );
}
