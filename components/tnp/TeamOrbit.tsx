'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const team = [
  ['Aarav', 'Coordinator'],
  ['Diya', 'Guest relations'],
  ['Kabir', 'Executive'],
  ['Ananya', 'Planner'],
  ['Rohan', 'Operations'],
  ['Isha', 'Hospitality'],
  ['Arjun', 'Volunteer'],
  ['Meera', 'Guest relations'],
];

export default function TeamOrbit() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const nodes = Array.from(
      element.querySelectorAll<HTMLElement>('.orbit-person'),
    );
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let tween: gsap.core.Tween | undefined;
    const phase = { value: 0 };
    const draw = () => {
      const size = element.clientWidth;
      // A full revolution and a smooth inward pulse end at the exact starting positions.
      const pull = Math.pow(Math.sin(Math.PI * phase.value), 8);
      const radius = size * (0.37 - pull * 0.29);
      nodes.forEach((node, index) => {
        node.style.left = '50%';
        node.style.top = '50%';
        const angle =
          (index / nodes.length) * Math.PI * 2 +
          phase.value * Math.PI * 2 -
          Math.PI / 2;
        node.style.transform = `translate(-50%, -50%) translate(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius}px) scale(${1 - pull * 0.62})`;
        node.style.opacity = String(1 - pull * 0.9);
      });
      element.style.setProperty('--pull', String(pull));
    };
    const start = () => {
      tween?.kill();
      phase.value = 0;
      draw();
      if (!motion.matches)
        tween = gsap.to(phase, {
          value: 1,
          duration: 22,
          repeat: -1,
          repeatDelay: 1.6,
          ease: 'power1.inOut',
          onUpdate: draw,
        });
    };
    start();
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !document.hidden) tween?.resume();
      else tween?.pause();
    });
    observer.observe(element);
    const resize = new ResizeObserver(draw);
    resize.observe(element);
    const visibility = () => {
      if (document.hidden) tween?.pause();
      else if (
        element.getBoundingClientRect().top < window.innerHeight &&
        element.getBoundingClientRect().bottom > 0
      )
        tween?.resume();
    };
    document.addEventListener('visibilitychange', visibility);
    motion.addEventListener('change', start);
    return () => {
      tween?.kill();
      observer.disconnect();
      resize.disconnect();
      motion.removeEventListener('change', start);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);

  return (
    <div
      ref={root}
      className="team-orbit"
      aria-label="Illustrative event team with eight named professionals"
    >
      <div className="orbit-track track-outer" aria-hidden="true" />
      <div className="orbit-track track-inner" aria-hidden="true" />
      <div className="orbit-accretion" aria-hidden="true" />
      <div className="event-node">
        <span>1</span>EVENT
      </div>
      {team.map(([name, role], index) => (
        <div
          className="orbit-person"
          key={name}
          style={{
            left: `${50 + Math.cos((index / team.length) * Math.PI * 2 - Math.PI / 2) * 37}%`,
            top: `${50 + Math.sin((index / team.length) * Math.PI * 2 - Math.PI / 2) * 37}%`,
          }}
        >
          <b>{name}</b>
          <span>{role}</span>
        </div>
      ))}
      <strong>ONE CONNECTED TEAM</strong>
    </div>
  );
}
