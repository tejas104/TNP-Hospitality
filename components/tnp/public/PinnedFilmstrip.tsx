'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import styles from './Home.module.css';

export type FilmItem = {
  title: string;
  place: string;
  image: { src: string; alt: string };
};

/**
 * Scroll-pinned gallery: while the section is on screen the page stays put and
 * vertical scrolling moves the photographs sideways; once the last photograph
 * is in view, normal scrolling resumes. Transform-only and scrubbed 1:1 with
 * scroll. Reduced motion keeps a native horizontal scroller instead.
 */
export default function PinnedFilmstrip({
  items,
  header,
}: {
  items: FilmItem[];
  header: ReactNode;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const travel = useRef(0);
  useEffect(() => {
    const w = wrap.current;
    const v = viewport.current;
    const t = track.current;
    if (!w || !v || !t) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const update = () => {
      frame = 0;
      if (w.dataset.pinned !== 'true') return;
      const box = w.getBoundingClientRect();
      const range = box.height - innerHeight;
      const p = range > 0 ? Math.min(1, Math.max(0, -box.top / range)) : 0;
      t.style.transform = `translate3d(${-p * travel.current}px, 0, 0)`;
      w.style.setProperty('--film-progress', String(p));
      if (counter.current)
        counter.current.textContent = `${String(Math.min(items.length, 1 + Math.round(p * (items.length - 1)))).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
    };
    const layout = () => {
      if (reduce.matches) {
        w.dataset.pinned = 'false';
        w.style.height = '';
        t.style.transform = '';
        return;
      }
      w.dataset.pinned = 'true';
      travel.current = Math.max(0, t.scrollWidth - v.clientWidth);
      // Vertical scroll distance equals horizontal travel: a 1:1 scrub.
      w.style.height = `${innerHeight + travel.current}px`;
      update();
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    layout();
    const resize = new ResizeObserver(layout);
    resize.observe(v);
    addEventListener('scroll', onScroll, { passive: true });
    reduce.addEventListener('change', layout);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      removeEventListener('scroll', onScroll);
      reduce.removeEventListener('change', layout);
    };
  }, [items.length]);
  const step = (direction: 1 | -1) => {
    const w = wrap.current;
    const t = track.current;
    const card = t?.firstElementChild as HTMLElement | null;
    if (!w || !t || !card) return;
    const distance = card.offsetWidth + 24;
    if (w.dataset.pinned === 'true')
      scrollBy({ top: direction * distance, behavior: 'smooth' });
    else t.parentElement?.scrollBy({ left: direction * distance, behavior: 'smooth' });
  };
  return (
    <div ref={wrap} className={styles.pinWrap} data-pinned="false">
      <div className={styles.pinStage}>
        {header}
        <div className={styles.filmstripControls}>
          <p id="filmstrip-help">
            Keep scrolling to travel through {items.length} settings, or use
            the arrows.
          </p>
          <div>
            <span ref={counter} className={styles.filmCounter} aria-hidden="true">
              01 / {String(items.length).padStart(2, '0')}
            </span>
            <button type="button" aria-label="Previous photographs" onClick={() => step(-1)}>
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <button type="button" aria-label="Next photographs" onClick={() => step(1)}>
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className={styles.filmProgress} aria-hidden="true">
          <i />
        </div>
        <div ref={viewport} className={styles.pinViewport}>
          <ul
            ref={track}
            className={styles.pinTrack}
            aria-label="Illustrative event photography"
            aria-describedby="filmstrip-help"
          >
            {items.map((item, index) => (
              <li key={item.title}>
              <figure>
                <div className={styles.pinFrame}>
                  <img
                    src={item.image.src}
                    alt={item.image.alt}
                    width="800"
                    height="960"
                    loading="eager"
                    decoding="async"
                  />
                </div>
                <figcaption>
                  <span>
                    {String(index + 1).padStart(2, '0')} / {item.place}
                  </span>
                  <h3>{item.title.toLowerCase()}</h3>
                </figcaption>
              </figure>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
