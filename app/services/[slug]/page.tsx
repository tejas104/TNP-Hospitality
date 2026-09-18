import { notFound } from 'next/navigation';
import DetailPage from '@/components/tnp/public/DetailPage';
import { findPublicDetail } from '@/data/public-content';

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const detail = findPublicDetail('service', slug);
  if (!detail) notFound();
  return <DetailPage detail={detail} />;
}
