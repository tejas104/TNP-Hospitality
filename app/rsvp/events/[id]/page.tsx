import { RsvpWorkspace } from '@/components/tnp/portals/rsvp/RsvpWorkspace';

export default async function RsvpEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RsvpWorkspace eventId={id} />;
}
