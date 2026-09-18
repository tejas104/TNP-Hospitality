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
      <path
        d="M70 330 290 425 535 290 315 205Z"
        fill="#123f38"
        stroke="#bba879"
      />
      <path
        d="M85 315 190 360 285 306 180 262Z"
        fill="#3e7768"
        stroke="#bba879"
      />
      <path
        d="M185 265 285 309 387 250 287 208Z"
        fill="#527f6c"
        stroke="#bba879"
      />
      <path
        d="M280 235 400 287 515 221 395 170Z"
        fill="#d4c6a0"
        stroke="#ead6a5"
      />
      <path
        d="M85 315v20l105 46v-21M185 265v35l100 44v-35M280 235v63l120 53v-64M400 351l115-66v-64"
        stroke="#bba879"
        fill="#164c42"
      />
      <path
        d="M115 312C150 310 170 331 199 291S248 225 299 245 401 326 455 254 380 203 345 243"
        stroke="#f1d69b"
        strokeWidth="3"
      />
      <path
        d="M135 294v-65l48 21v65M135 229l48 21"
        stroke="#e9d2a0"
        strokeWidth="5"
      />
      <path
        d="m247 246 28 12 23-13v-21l-28-12-23 13Z"
        fill="#e8dfc6"
        stroke="#bba879"
      />
      <ellipse
        cx="390"
        cy="231"
        rx="31"
        ry="15"
        fill="#f1e8d1"
        stroke="#bba879"
      />
      {[
        [350, 232],
        [373, 205],
        [425, 230],
        [402, 259],
      ].map(([x, y]) => (
        <ellipse key={x} cx={x} cy={y} rx="8" ry="5" fill="#315d4f" />
      ))}
      {[
        [122, 312],
        [214, 267],
        [306, 252],
        [448, 263],
      ].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="5" fill="#fff4d5" />
      ))}
      <g
        fill="#d5c595"
        fontFamily="system-ui, sans-serif"
        fontSize="10"
        letterSpacing="2"
      >
        <text x="65" y="385">
          01 ARRIVE
        </text>
        <text x="215" y="185">
          02 WELCOME
        </text>
        <text x="380" y="155">
          03 CELEBRATE
        </text>
      </g>
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
  const mobile = useSyncExternalStore(subscribeMobile, readMobile, serverFalse);
  const still = reducedMotion || mobile || paused || failed;
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
        <p>Arrival. Welcome. Celebration.</p>
      </div>
      <button
        type="button"
        className={styles.motionControl}
        aria-pressed={still}
        disabled={reducedMotion || mobile || failed}
        onClick={() => setPaused((value) => !value)}
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
