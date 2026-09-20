'use client';

import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode, type PointerEvent } from 'react';
import { Pause, Play } from 'lucide-react';
import styles from './Home.module.css';
import cube from './HospitalityCube.module.css';
import HospitalityCubeFallback from './HospitalityCubeFallback';
import { SERVICES, advanceMotion, beginDrag, createMotion, cubePolicy, dragTo, endDrag, pointerIntent, selectService, serviceAt } from './hospitality-cube-motion';

const PavilionScene = lazy(() => import('./PavilionScene'));
const motionQuery = '(prefers-reduced-motion: reduce)';
const mobileQuery = '(max-width: 700px)';
function subscribeQuery(query: string, callback: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}
const subscribeMotion = (callback: () => void) => subscribeQuery(motionQuery, callback);
const subscribeMobile = (callback: () => void) => subscribeQuery(mobileQuery, callback);
function subscribeVisibility(callback: () => void) {
  document.addEventListener('visibilitychange', callback);
  return () => document.removeEventListener('visibilitychange', callback);
}
const readMotion = () => window.matchMedia(motionQuery).matches;
const readMobile = () => window.matchMedia(mobileQuery).matches;
const readVisibility = () => document.visibilityState === 'visible';
const serverFalse = () => false;

class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export default function HomeHero({ paused, onPauseChange }: { paused: boolean; onPauseChange: (paused: boolean) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const motion = useRef(createMotion());
  const clock = useRef(0);
  const gesture = useRef<{ id: number; x: number; y: number; angle: number; intent: string } | null>(null);
  const reduced = useSyncExternalStore(subscribeMotion, readMotion, serverFalse);
  const mobile = useSyncExternalStore(subscribeMobile, readMobile, serverFalse);
  const visible = useSyncExternalStore(subscribeVisibility, readVisibility, serverFalse);
  const [inView, setInView] = useState(false);
  const [visited, setVisited] = useState(false);
  const [failed, setFailed] = useState(false);
  const [capability, setCapability] = useState<{ saveData: boolean; cores?: number; memory?: number }>({ saveData: false });
  const [presentation, setPresentation] = useState({ service: 0, turning: false, angle: 0 });
  const [dragging, setDragging] = useState(false);
  const handleFailure = useCallback(() => setFailed(true), []);
  const policy = cubePolicy({ reduced, mobile, ...capability, failed, paused, visible, inView });
  const publish = useCallback(() => {
    const current = motion.current;
    const service = serviceAt(current.angle);
    const turning = current.phase === 'turn';
    setPresentation(previous => previous.service === service && previous.turning === turning && previous.angle === current.angle ? previous : { service, turning, angle: current.angle });
  }, []);
  useEffect(() => {
    const target = container.current;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
      if (entry.isIntersecting) setVisited(true);
    });
    observer.observe(target);
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: EventTarget & { saveData?: boolean } };
    const update = () => setCapability({ saveData: Boolean(nav.connection?.saveData), cores: nav.hardwareConcurrency, memory: nav.deviceMemory });
    update();
    nav.connection?.addEventListener('change', update);
    return () => { observer.disconnect(); nav.connection?.removeEventListener('change', update); };
  }, []);
  useEffect(() => {
    if (!policy.animate) return;
    let frame = 0;
    let previous: number | undefined;
    let lastPublish = 0;
    const tick = (now: number) => {
      const delta = previous === undefined ? 0 : Math.min(now - previous, 50);
      previous = now;
      motion.current = advanceMotion(motion.current, delta);
      clock.current += delta / 1000;
      // Render transforms live in refs; React only receives sparse UI evidence.
      if (now - lastPublish >= 100) { publish(); lastPublish = now; }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [policy.animate, publish]);
  const choose = (index: number) => {
    motion.current = selectService(motion.current, index, !policy.animate);
    publish();
  };
  const start = (event: PointerEvent<HTMLDivElement>) => {
    if (policy.tier === 'static' || !event.isPrimary || event.button !== 0) return;
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, angle: motion.current.angle, intent: 'pending' };
  };
  const move = (event: PointerEvent<HTMLDivElement>) => {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId) return;
    const dx = event.clientX - current.x, dy = event.clientY - current.y;
    if (current.intent === 'pending') {
      current.intent = pointerIntent(dx, dy);
      if (current.intent === 'horizontal') { event.currentTarget.setPointerCapture(event.pointerId); motion.current = beginDrag(motion.current); setDragging(true); }
    }
    if (current.intent !== 'horizontal') return;
    motion.current = dragTo(motion.current, current.angle, dx, event.currentTarget.clientWidth);
    publish();
  };
  const end = (event: PointerEvent<HTMLDivElement>) => {
    if (gesture.current?.id !== event.pointerId) return;
    if (gesture.current.intent === 'horizontal') motion.current = endDrag(motion.current);
    gesture.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    publish();
  };
  const fallback = <HospitalityCubeFallback service={presentation.service} />;
  const still = policy.tier === 'static';
  return <div ref={container} className={`${styles.heroArt} ${cube.art}`} data-hero-art data-cube-tier={policy.tier} data-cube-angle={presentation.angle.toFixed(4)}>
    <div className={cube.heading} data-turning={presentation.turning && policy.animate}>
      <span className={cube.number}>FOUR WORLDS. ONE CELEBRATION.</span>
      <span className={cube.title}>{SERVICES[presentation.service]}</span>
    </div>
    <div className={cube.stage} aria-hidden="true" data-scene-state={still ? 'still' : policy.animate ? 'running' : 'suspended'} data-dragging={dragging} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}>
      {visited && !still ? <SceneBoundary onFailure={handleFailure} fallback={fallback}><Suspense fallback={fallback}>
        <PavilionScene active={policy.animate} fallback={fallback} onFailure={handleFailure} />
      </Suspense></SceneBoundary> : fallback}
    </div>
    <div className={cube.footer}>
      <p className={cube.hint}>{still ? 'Explore our four hospitality services' : 'Drag to explore · a different world on every side'}</p>
      <fieldset className={cube.selectors} aria-label="Choose a hospitality service">
        {SERVICES.map((name, index) => <button key={name} type="button" className={cube.selector} aria-label={`Show ${name}`} aria-pressed={presentation.service === index} onClick={() => choose(index)} />)}
        {!still && <button type="button" className={cube.pause} aria-label={paused ? 'Play cube animation' : 'Pause cube animation'} aria-pressed={paused} onClick={() => onPauseChange(!paused)}>{paused ? <Play size={14}/> : <Pause size={14}/>}</button>}
      </fieldset>
      <p className={cube.sample}>Illustrative service worlds · no live event data</p>
    </div>
  </div>;
}
