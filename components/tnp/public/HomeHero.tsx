'use client';

import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { Pause, Play } from 'lucide-react';
import styles from './Home.module.css';

const PavilionScene = lazy(() => import('./PavilionScene'));
const motionQuery = '(prefers-reduced-motion: reduce)';
function subscribeMotion(callback: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}
function subscribeVisibility(callback: () => void) {
  document.addEventListener('visibilitychange', callback);
  return () => document.removeEventListener('visibilitychange', callback);
}
const readMotion = () => window.matchMedia(motionQuery).matches;
const readVisibility = () => document.visibilityState === 'visible';
const serverFalse = () => false;

class SceneBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? <PavilionFallback /> : this.props.children;
  }
}

export function PavilionFallback() {
  return (
    <svg
      className={styles.pavilion}
      viewBox="0 0 600 600"
      fill="none"
      aria-hidden="true"
    >
      <ellipse
        cx="300"
        cy="465"
        rx="215"
        ry="58"
        stroke="#bba879"
        strokeOpacity=".25"
      />
      <ellipse
        cx="300"
        cy="450"
        rx="165"
        ry="43"
        fill="#0a3d39"
        stroke="#bba879"
        strokeOpacity=".65"
      />
      <ellipse
        cx="300"
        cy="438"
        rx="146"
        ry="37"
        fill="#0e5049"
        stroke="#bba879"
      />
      {[
        [-110, 1],
        [-55, 0.7],
        [55, 0.7],
        [110, 1],
      ].map(([offset, opacity]) => (
        <path
          key={offset}
          d={`M${300 + offset} 435 V280 Q${300 + offset} 175 300 170`}
          stroke="#bba879"
          strokeWidth="8"
          opacity={opacity}
        />
      ))}
      <path
        d="M190 435V280Q190 170 300 170Q410 170 410 280V435"
        stroke="#d4c499"
        strokeWidth="10"
      />
      <ellipse
        cx="300"
        cy="170"
        rx="126"
        ry="30"
        stroke="#ddcc9b"
        strokeWidth="5"
      />
      <circle
        cx="300"
        cy="255"
        r="42"
        fill="#c5b17e"
        fillOpacity=".1"
        stroke="#ddcc9b"
      />
      <path d="M275 254h50M300 230v50" stroke="#ddcc9b" strokeWidth="2" />
      <path
        d="M110 348Q300 540 490 348M110 348Q300 200 490 348"
        stroke="#bba879"
        strokeOpacity=".45"
      />
      <circle cx="110" cy="348" r="8" fill="#bba879" />
      <circle cx="490" cy="348" r="8" fill="#bba879" />
    </svg>
  );
}

export default function HomeHero() {
  const container = useRef<HTMLDivElement>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    readMotion,
    serverFalse,
  );
  const visible = useSyncExternalStore(
    subscribeVisibility,
    readVisibility,
    serverFalse,
  );
  const [inView, setInView] = useState(false);
  const [visited, setVisited] = useState(false);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  const handleFailure = useCallback(() => setFailed(true), []);
  useEffect(() => {
    const target = container.current;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
      if (entry.isIntersecting) setVisited(true);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);
  const still = reducedMotion || paused || failed;
  const active = inView && visible && !still;
  return (
    <div ref={container} className={styles.heroArt}>
      <div
        className={styles.scene}
        aria-hidden="true"
        data-scene-state={still ? 'still' : active ? 'running' : 'suspended'}
      >
        {visited && !still ? (
          <SceneBoundary onFailure={handleFailure}>
            <Suspense fallback={<PavilionFallback />}>
              <PavilionScene
                active={active}
                fallback={<PavilionFallback />}
                onFailure={handleFailure}
              />
            </Suspense>
          </SceneBoundary>
        ) : (
          <PavilionFallback />
        )}
      </div>
      <div className={styles.artCaption}>
        <span>THE ART OF COMING TOGETHER</span>
        <p>A place for every detail.</p>
      </div>
      <button
        type="button"
        className={styles.motionControl}
        aria-pressed={still}
        disabled={reducedMotion || failed}
        onClick={() => setPaused((value) => !value)}
      >
        {still ? <Play size={12} /> : <Pause size={12} />}
        {failed
          ? 'Still illustration'
          : reducedMotion
            ? 'Reduced motion'
            : paused
              ? 'Play animation'
              : 'Pause animation'}
      </button>
    </div>
  );
}
