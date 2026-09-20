import RsvpWorkspace from '@/components/tnp/portals/rsvp/RsvpWorkspace';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ organization?: string }>;
}) {
  const { organization } = await searchParams;
  return <RsvpWorkspace key={organization ?? 'lotus'} orgId={organization} />;
}
