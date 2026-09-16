import Link from 'next/link';
import { byId } from '@/data/media';

export function PortalHero({
  label,
  title,
  copy,
  image,
}: {
  label: string;
  title: string;
  copy: string;
  image: string;
}) {
  const item = byId(image);
  return (
    <section className="portal-hero">
      <img src={item.src} alt={item.alt} />
      <div>
        <p className="eyebrow">{label}</p>
        <h1>{title}</h1>
        <p>{copy}</p>
        <Link className="ghost-btn light" href="/admin">
          View Operations Demo
        </Link>
      </div>
    </section>
  );
}
