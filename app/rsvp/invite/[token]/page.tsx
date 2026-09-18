import { GuestInvitation } from '@/components/tnp/portals/rsvp/GuestInvitation';

export default async function RsvpInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <GuestInvitation token={token} />;
}
