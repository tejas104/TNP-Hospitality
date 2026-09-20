import RsvpWorkspace from '@/components/tnp/portals/rsvp/RsvpWorkspace';
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RsvpWorkspace key={id} eventId={id} />;
}
