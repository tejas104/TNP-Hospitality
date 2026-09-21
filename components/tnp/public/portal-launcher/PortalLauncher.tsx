'use client';
import {
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { ArrowUpRight, Compass, X } from 'lucide-react';
import { demoWorkspaces, chooserHref } from '../../access/routes';
import {
  cubicBezier,
  GENIE_EASE,
  genieAxis,
  genieSliceCount,
  genieSlices,
  LAUNCHER_TIMING,
  visibleSource,
} from './motion';
import styles from './PortalLauncher.module.css';

/**
 * Reusable source-anchored window. Any element can be the source: pass a ref
 * to it and the window pours out of (and back into) that element's current
 * on-screen rectangle. The deformation is drawn by an aria-hidden stack of
 * cloned strips while the real, focusable panel stays underneath.
 */
export function GenieWindow({
  sourceRef,
  open,
  onClose,
  title,
  label,
  align = 'center',
  children,
}: {
  sourceRef: RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  title: string;
  label: string;
  /** 'end' floats the window beside the right edge instead of centring it. */
  align?: 'center' | 'end';
  children: ReactNode;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const strips = useRef<HTMLDivElement>(null);
  const progress = useRef(1); // 0 = settled window, 1 = inside the source
  const frame = useRef(0);
  const fallback = useRef(0);
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  if (open && !mounted) setMounted(true);
  if (open && closing) setClosing(false);
  if (!open && mounted && !closing) setClosing(true);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Build the strip layer from a clone of the settled panel, then drive
  // progress toward `target` with one rAF loop (interruptible both ways).
  function animate(target: 0 | 1, done: () => void) {
    cancelAnimationFrame(frame.current);
    clearTimeout(fallback.current);
    const node = panel.current;
    const layer = strips.current;
    const source = sourceRef.current?.getBoundingClientRect();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (
      !node ||
      !layer ||
      reduced ||
      !source ||
      !visibleSource(source, innerWidth, innerHeight)
    ) {
      progress.current = target;
      if (node) node.dataset.motion = reduced ? 'reduced' : 'fade';
      done();
      return;
    }
    node.dataset.motion = 'genie';
    const win = node.getBoundingClientRect();
    const axis = genieAxis(win, source);
    const n = genieSliceCount(win, axis);
    const clone = node.cloneNode(true) as HTMLElement;
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
    clone.style.cssText = `position:absolute;left:0;top:0;width:${win.width}px;height:${win.height}px;margin:0;opacity:1;transform:none;animation:none`;
    const base = genieSlices(win, source, 0, n);
    layer.replaceChildren(
      ...base.map(({ from }) => {
        const strip = document.createElement('div');
        strip.className = styles.strip;
        // 2px overlap along the travel axis hides seams from filtered
        // strip edges at fractional device-pixel ratios.
        const pad = 2;
        const [w, h] =
          axis.along === 'x'
            ? [from.width + pad, from.height]
            : [from.width, from.height + pad];
        strip.style.cssText = `left:${from.x}px;top:${from.y}px;width:${w}px;height:${h}px`;
        const inner = clone.cloneNode(true) as HTMLElement;
        inner.style.left = `${win.x - from.x}px`;
        inner.style.top = `${win.y - from.y}px`;
        strip.appendChild(inner);
        return strip;
      }),
    );
    const children = layer.children as HTMLCollectionOf<HTMLElement>;
    node.style.opacity = '0';
    layer.hidden = false;
    const start = progress.current;
    const opening = target === 0;
    const duration =
      (opening ? LAUNCHER_TIMING.open : LAUNCHER_TIMING.close) *
      Math.max(0.35, Math.abs(start - target));
    const ease = opening ? GENIE_EASE.open : GENIE_EASE.close;
    const t0 = performance.now();
    const tick = () => {
      const t = Math.min(1, (performance.now() - t0) / duration);
      const p = start + (target - start) * cubicBezier(ease, t);
      progress.current = p;
      genieSlices(win, source, p, n).forEach(({ from, to, hidden }, i) => {
        const s = children[i].style;
        s.visibility = hidden ? 'hidden' : 'visible';
        s.transform = `translate(${to.x - from.x}px,${to.y - from.y}px) scale(${to.width / from.width},${to.height / from.height})`;
      });
      layer.style.opacity = String(p > 0.9 ? (1 - p) / 0.1 : 1);
      if (t < 1) {
        frame.current = requestAnimationFrame(tick);
        return;
      }
      finish();
    };
    const finish = () => {
      cancelAnimationFrame(frame.current);
      clearTimeout(fallback.current);
      progress.current = target;
      layer.hidden = true;
      layer.replaceChildren();
      node.style.opacity = '';
      done();
    };
    frame.current = requestAnimationFrame(tick);
    // Hidden/throttled tabs may never deliver frames; always settle.
    fallback.current = window.setTimeout(finish, duration + 200);
  }

  const onLifecycle = useEffectEvent(() => {
    const node = dialog.current;
    if (!mounted || !node) return;
    if (closing) {
      node.dataset.state = 'closing';
      animate(1, () => {
        if (node.open) node.close();
        setMounted(false);
        setClosing(false);
        const source = sourceRef.current;
        if (source?.isConnected) {
          source.focus({ preventScroll: true });
          if (!matchMedia('(prefers-reduced-motion: reduce)').matches)
            source.animate(
              // `scale`, not `transform`, so positioned sources keep theirs.
              [{ scale: '1' }, { scale: '1.045' }, { scale: '1' }],
              { duration: 260, easing: 'cubic-bezier(.34,1.4,.64,1)' },
            );
        }
      });
      return;
    }
    node.dataset.state = 'open';
    if (!node.open) node.showModal();
    panel.current
      ?.querySelector<HTMLElement>('button, a[href]')
      ?.focus({ preventScroll: true });
    animate(0, () => {
      if (panel.current?.dataset.motion === 'genie')
        panel.current.animate(
          [{ transform: 'translateY(4px)' }, { transform: 'none' }],
          { duration: 320, easing: 'cubic-bezier(.34,1.35,.64,1)' },
        );
    });
  });
  useEffect(() => onLifecycle(), [mounted, closing]);

  useEffect(() => {
    if (!mounted) return;
    const node = dialog.current;
    const oldOverflow = document.body.style.overflow;
    const oldPadding = document.body.style.paddingRight;
    // Keep the page from shifting when its scrollbar disappears.
    const gutter = innerWidth - document.documentElement.clientWidth;
    if (gutter > 0) document.body.style.paddingRight = `${gutter}px`;
    document.body.style.overflow = 'hidden';
    const back = () => onCloseRef.current();
    window.addEventListener('popstate', back);
    // Clicks that land on the <dialog> box itself are backdrop clicks: the
    // visible window is the inner panel.
    const backdrop = (event: MouseEvent) => {
      if (event.target === node) onCloseRef.current();
    };
    node?.addEventListener('click', backdrop);
    return () => {
      node?.removeEventListener('click', backdrop);
      cancelAnimationFrame(frame.current);
      clearTimeout(fallback.current);
      document.body.style.overflow = oldOverflow;
      document.body.style.paddingRight = oldPadding;
      window.removeEventListener('popstate', back);
      if (node?.open) node.close();
    };
  }, [mounted]);

  if (!mounted) return null;
  return createPortal(
    <dialog
      ref={dialog}
      id={id}
      className={styles.window}
      data-align={align}
      aria-labelledby={`${id}-title`}
      onCancel={(event) => {
        event.preventDefault();
        onCloseRef.current();
      }}
    >
      <div ref={panel} className={styles.panel}>
        <div className={styles.bar}>
          <span id={`${id}-title`}>{title}</span>
          <button
            type="button"
            aria-label={label}
            onClick={() => onCloseRef.current()}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
      <div ref={strips} className={styles.strips} aria-hidden="true" hidden />
    </dialog>,
    document.body,
  );
}

const noSubscribe = () => () => {};

export default function PortalLauncher() {
  const source = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const host = useSyncExternalStore(
    noSubscribe,
    () => document.body,
    () => null,
  );
  const trigger = (placement: 'dock' | 'inline') => (
    <button
      type="button"
      className={placement === 'dock' ? styles.trigger : styles.inlineTrigger}
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={(event) => {
        source.current = event.currentTarget;
        setOpen(true);
      }}
    >
      <Compass size={18} aria-hidden="true" />
      <span>Workspaces</span>
    </button>
  );
  const leave = () => setOpen(false);
  return (
    <>
      {trigger('inline')}
      {/* The header is transformed, so the side dock must live on <body> to
          be fixed to the viewport rather than to the header box. */}
      {host && createPortal(trigger('dock'), host)}
      <GenieWindow
        sourceRef={source}
        open={open}
        onClose={leave}
        title="TNP · Workspaces"
        label="Close workspaces"
      >
        <div className={styles.content}>
          <p className={styles.kicker}>Temporary client demo</p>
          <h2>Open a working space.</h2>
          <p>
            Choose a temporary demo identity and walk through the frontend. No
            real credentials are required.
          </p>
          <nav aria-label="Temporary demo workspaces">
            {demoWorkspaces.map((item, index) => (
              <Link key={item.id} href={chooserHref(item.id)} onClick={leave}>
                <span className={styles.index}>0{index + 1}</span>
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.purpose}</small>
                </span>
                <ArrowUpRight size={22} aria-hidden="true" />
              </Link>
            ))}
          </nav>
          <p className={styles.notice}>
            Synthetic preview only. No live authentication, bookings, payments
            or messages.
          </p>
          <Link className={styles.contact} href="/contact" onClick={leave}>
            Planning an event? Talk to TNP →
          </Link>
        </div>
      </GenieWindow>
    </>
  );
}
