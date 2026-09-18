'use client';

import { useEffect, type RefObject } from 'react';
import { journeyProgress, motionPolicy } from './motion-policy';
import { filmstripOffset } from './workspace-interaction';
import {
  destinationMode,
  destinationProgress,
  destinationRange,
} from './destination-motion';

// Progressive enhancement only: base CSS always contains the complete visible
// page. No opacity-zero staging, pinning, scroll interception or layout writes.
export function useHomeMotion(
  root: RefObject<HTMLElement | null>,
  paused: boolean,
) {
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = matchMedia('(max-width: 700px)');
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const animations = new Map<Element, Animation>();
    let observer: IntersectionObserver | null = null;
    let frame = 0;
    let hasRevealedHero = false;
    const seen = new WeakSet<Element>();
    const destination = element.querySelector<HTMLElement>(
      '[data-destination-journey]',
    );
    const nativeTimeline =
      CSS.supports('animation-timeline: scroll(root block)') &&
      CSS.supports('animation-range: 1px 2px');
    const destinationEngine = () =>
      destinationMode(policy().animate, policy().parallax, nativeTimeline);
    const updateDestinationRanges = () => {
      if (!destination) return;
      const bounds = destination.getBoundingClientRect();
      const top = bounds.top + scrollY;
      destination.style.setProperty(
        '--itinerary-start',
        `${Math.max(0, top - innerHeight * 0.85)}px`,
      );
      destination.style.setProperty(
        '--itinerary-end',
        `${top + bounds.height - innerHeight * 0.4}px`,
      );
      destination
        .querySelectorAll<HTMLElement>('[data-destination-card]')
        .forEach((card, index) => {
          const box = card.getBoundingClientRect();
          const range = destinationRange(box.top + scrollY, innerHeight, index);
          card.style.setProperty('--place-start', `${range.start}px`);
          card.style.setProperty('--place-end', `${range.end}px`);
          card.style.setProperty(
            '--place-drift-end',
            `${box.top + scrollY + box.height}px`,
          );
        });
    };
    const policy = () =>
      motionPolicy({
        reduced: reduced.matches,
        mobile: mobile.matches,
        finePointer: fine.matches,
        paused,
        visible: document.visibilityState === 'visible',
      });
    const cancelAll = () => {
      animations.forEach((animation) => animation.cancel());
      animations.clear();
    };
    const animate = (target: HTMLElement, index = 0, hero = false) => {
      if (!policy().animate || target.contains(document.activeElement)) return;
      const kind = target.dataset.motion;
      const stillControl = kind === 'control' || kind === 'marker';
      const media = kind === 'image';
      const from: Keyframe = media
        ? {
            opacity: 0.82,
            transform: 'scale(1.035)',
            clipPath: 'inset(0 5% 0 0)',
          }
        : stillControl
          ? { opacity: 0.75 }
          : { opacity: 0.72, transform: 'translateY(14px)' };
      const to: Keyframe = media
        ? { opacity: 1, transform: 'scale(1)', clipPath: 'inset(0 0% 0 0)' }
        : stillControl
          ? { opacity: 1 }
          : { opacity: 1, transform: 'translateY(0)' };
      const animation = target.animate([from, to], {
        duration: media ? 1050 : 780,
        delay: Math.min(index, 5) * (hero ? 90 : 65),
        easing: 'cubic-bezier(.18,.7,.2,1)',
        fill: 'backwards',
      });
      animations.set(target, animation);
      animation.onfinish = () => {
        animations.delete(target);
      };
    };
    const updateJourney = () => {
      frame = 0;
      if (destination) {
        const bounds = destination.getBoundingClientRect();
        const progress =
          destinationEngine() === 'static'
            ? 1
            : destinationProgress(bounds.top, bounds.height, innerHeight);
        destination.style.setProperty(
          '--destination-progress',
          String(progress),
        );
        destination.style.setProperty(
          '--destination-drift',
          `${destinationEngine() === 'static' ? 0 : 5 - progress * 10}px`,
        );
      }
      const filmstrip = element.querySelector<HTMLElement>('[data-filmstrip]');
      if (
        filmstrip &&
        policy().parallax &&
        !filmstrip.contains(document.activeElement) &&
        !filmstrip.hasAttribute('data-filmstrip-manual')
      ) {
        const bounds = filmstrip.getBoundingClientRect();
        if (bounds.top < innerHeight && bounds.bottom > 0)
          filmstrip.scrollLeft = filmstripOffset(
            bounds.top,
            bounds.height,
            innerHeight,
            filmstrip.scrollWidth - filmstrip.clientWidth,
          );
      }
      const track = element.querySelector<HTMLElement>('[data-journey]');
      if (!track) return;
      if (!policy().animate) {
        track.style.setProperty('--journey-progress', '1');
        return;
      }
      const bounds = track.getBoundingClientRect();
      track.style.setProperty(
        '--journey-progress',
        String(journeyProgress(bounds.top, bounds.height, innerHeight)),
      );
    };
    const scroll = () => {
      if (!frame && policy().animate)
        frame = requestAnimationFrame(updateJourney);
    };
    const configure = () => {
      observer?.disconnect();
      cancelAll();
      element.style.setProperty('--hero-x', '0px');
      element.style.setProperty('--hero-y', '0px');
      element.setAttribute(
        'data-motion-state',
        policy().animate ? 'enabled' : 'static',
      );
      element.setAttribute(
        'data-pointer-motion',
        policy().parallax ? 'fine' : 'none',
      );
      destination?.setAttribute('data-destination-engine', destinationEngine());
      updateDestinationRanges();
      updateJourney();
      if (!policy().animate) return;
      if (!hasRevealedHero) {
        element
          .querySelectorAll<HTMLElement>('[data-hero-stage]')
          .forEach((target, index) => animate(target, index, true));
        hasRevealedHero = true;
      }
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting || seen.has(entry.target)) return;
            seen.add(entry.target);
            observer?.unobserve(entry.target);
            if (entry.target.hasAttribute('data-destination-card')) {
              const card = entry.target;
              const frame = card.querySelector<HTMLElement>(
                '[data-destination-frame]',
              );
              const label = card.querySelector<HTMLElement>(
                '[data-destination-label]',
              );
              if (frame) {
                const animation = frame.animate(
                  [{ clipPath: 'inset(0 3% 4% 0)' }, { clipPath: 'inset(0)' }],
                  {
                    duration: 850,
                    delay: Number((card as HTMLElement).dataset.stagger) * 45,
                    easing: 'cubic-bezier(.18,.7,.2,1)',
                  },
                );
                animations.set(frame, animation);
                animation.onfinish = () => {
                  animations.delete(frame);
                };
              }
              if (label)
                animate(label, Number((card as HTMLElement).dataset.stagger));
              return;
            }
            animate(
              entry.target as HTMLElement,
              Number((entry.target as HTMLElement).dataset.stagger ?? 0),
            );
          });
        },
        { threshold: 0.12 },
      );
      element
        .querySelectorAll<HTMLElement>('[data-motion]:not([data-hero-stage])')
        .forEach((target) => observer?.observe(target));
      if (destinationEngine() === 'fallback')
        destination
          ?.querySelectorAll('[data-destination-card]')
          .forEach((target) => observer?.observe(target));
    };
    const pointer = (event: PointerEvent) => {
      if (!policy().parallax || event.pointerType !== 'mouse') return;
      const hero = element.querySelector<HTMLElement>('[data-hero-art]');
      if (!hero) return;
      const bounds = hero.getBoundingClientRect();
      if (bounds.bottom < 0 || bounds.top > innerHeight) return;
      const x = Math.max(
        -1,
        Math.min(
          1,
          (event.clientX - bounds.left - bounds.width / 2) / bounds.width,
        ),
      );
      const y = Math.max(
        -1,
        Math.min(
          1,
          (event.clientY - bounds.top - bounds.height / 2) / bounds.height,
        ),
      );
      element.style.setProperty('--hero-x', `${x * 9}px`);
      element.style.setProperty('--hero-y', `${y * 7}px`);
    };
    const resetPointer = () => {
      element.style.setProperty('--hero-x', '0px');
      element.style.setProperty('--hero-y', '0px');
    };
    const focus = () =>
      animations.forEach((animation, target) => {
        if (target.contains(document.activeElement)) {
          animation.cancel();
          animations.delete(target);
        }
      });
    configure();
    const resize = new ResizeObserver(() => {
      updateDestinationRanges();
      scroll();
    });
    resize.observe(element);
    reduced.addEventListener('change', configure);
    mobile.addEventListener('change', configure);
    fine.addEventListener('change', configure);
    document.addEventListener('visibilitychange', configure);
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', scroll, { passive: true });
    element.addEventListener('pointermove', pointer, { passive: true });
    element.addEventListener('pointerleave', resetPointer);
    element.addEventListener('focusin', focus);
    return () => {
      observer?.disconnect();
      resize.disconnect();
      cancelAll();
      cancelAnimationFrame(frame);
      resetPointer();
      reduced.removeEventListener('change', configure);
      mobile.removeEventListener('change', configure);
      fine.removeEventListener('change', configure);
      document.removeEventListener('visibilitychange', configure);
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('resize', scroll);
      element.removeEventListener('pointermove', pointer);
      element.removeEventListener('pointerleave', resetPointer);
      element.removeEventListener('focusin', focus);
    };
  }, [root, paused]);
}
