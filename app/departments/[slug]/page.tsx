import { notFound } from 'next/navigation';
import DetailPage from '@/components/tnp/public/DetailPage';
import { findPublicDetail } from '@/data/public-content';

export default async function DepartmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const detail = findPublicDetail('department', slug);
  if (!detail) notFound();
  return <DetailPage detail={detail} />;
}
