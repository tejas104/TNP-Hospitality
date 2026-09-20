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
      </div>
    </section>
  );
}
