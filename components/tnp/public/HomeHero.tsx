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
const mobileQuery = '(max-width: 700px)';
function subscribeMobile(callback: () => void) {
  const query = window.matchMedia(mobileQuery);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}
const readMobile = () => window.matchMedia(mobileQuery).matches;

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
      viewBox="0 0 600 500"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="canopy-glow">
          <stop stopColor="#ead5a0" stopOpacity=".18" />
          <stop offset="1" stopColor="#ead5a0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="300" cy="250" rx="165" ry="175" fill="url(#canopy-glow)" />
      <ellipse
        cx="300"
        cy="363"
        rx="120"
        ry="30"
        fill="#13483f"
        stroke="#c7b481"
      />
      <ellipse
        cx="300"
        cy="355"
        rx="103"
        ry="24"
        stroke="#d9c795"
        strokeOpacity=".45"
      />
      <path d="M300 81v252" stroke="#dfc690" strokeOpacity=".6" />
      {[-1, -0.66, -0.33, 0, 0.33, 0.66, 1].map((offset) => (
        <path
          key={offset}
          d={`M300 93C${300 + offset * 35} 144 ${300 + offset * 165} 156 ${300 + offset * 142} 225Q${300 + offset * 140} 252 ${300 + offset * 105} 267`}
          stroke="#ddc48d"
          strokeWidth={Math.abs(offset) === 1 ? 2 : 1.3}
        />
      ))}
      <ellipse
        cx="300"
        cy="225"
        rx="142"
        ry="33"
        stroke="#efdab0"
        strokeWidth="2"
      />
      <ellipse cx="300" cy="267" rx="105" ry="23" stroke="#c9b17d" />
      <ellipse
        cx="300"
        cy="95"
        rx="21"
        ry="6"
        stroke="#efdab0"
        strokeWidth="2"
      />
      {Array.from({ length: 13 }, (_, i) => {
        const angle = (i * Math.PI) / 6;
        const x = 300 + Math.cos(angle) * 107;
        const y = 237 + Math.sin(angle) * 22;
        const end = y + 42 + (i % 2) * 25;
        return (
          <g key={i}>
            <path
              d={`M${x} ${y}v${end - y}`}
              stroke="#ccb884"
              strokeOpacity=".7"
            />
            <ellipse cx={x} cy={end} rx="3.4" ry="11" fill="#f3e4bd" />
          </g>
        );
      })}
      <path d="m300 304 12 17-12 18-12-18Z" fill="#f2dfad" />
      <ellipse
        cx="300"
        cy="300"
        rx="245"
        ry="69"
        transform="rotate(-12 300 300)"
        stroke="#baa575"
        strokeOpacity=".6"
      />
      {[
        [70, 344],
        [211, 244],
        [531, 252],
        [402, 361],
      ].map(([x, y], i) => (
        <g key={x}>
          <circle cx={x} cy={y} r="22" fill="#103e36" stroke="#d7be85" />
          {i === 0 ? (
            <g fill="#eee1bf">
              <circle cx={x - 7} cy={y + 2} r="3" />
              <circle cx={x} cy={y - 5} r="4" />
              <circle cx={x + 7} cy={y + 2} r="3" />
            </g>
          ) : i === 1 ? (
            <rect
              x={x - 6}
              y={y - 9}
              width="12"
              height="18"
              rx="1"
              fill="#a8c4ac"
            />
          ) : i === 2 ? (
            <path d={`m${x} ${y - 11} 9 11-9 11-9-11Z`} fill="#e5bc83" />
          ) : (
            <circle cx={x} cy={y} r="8" stroke="#eadfc3" strokeWidth="4" />
          )}
        </g>
      ))}
    </svg>
  );
}

export default function HomeHero({
  paused,
  onPauseChange,
}: {
  paused: boolean;
  onPauseChange: (paused: boolean) => void;
}) {
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
  const mobile = useSyncExternalStore(subscribeMobile, readMobile, serverFalse);
  const still = reducedMotion || mobile || paused || failed;
  const active = inView && visible && !still;
  return (
    <div ref={container} className={styles.heroArt} data-hero-art>
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
        <p>Celebration, beautifully coordinated.</p>
        <ul
          className={styles.constellationKey}
          aria-label="Illustrative event coordination roles"
        >
          <li>Guests</li>
          <li>Planners</li>
          <li>Vendors</li>
          <li>Operations</li>
        </ul>
      </div>
      <button
        type="button"
        className={styles.motionControl}
        aria-pressed={still}
        disabled={reducedMotion || mobile || failed}
        onClick={() => onPauseChange(!paused)}
      >
        {still ? <Play size={12} /> : <Pause size={12} />}
        {failed
          ? 'Still illustration'
          : mobile
            ? 'Still illustration · mobile'
            : reducedMotion
              ? 'Reduced motion'
              : paused
                ? 'Play animation'
                : 'Pause animation'}
      </button>
    </div>
  );
}
