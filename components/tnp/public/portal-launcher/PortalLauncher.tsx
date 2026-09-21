'use client';
import { useEffect, useId, useRef } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useState } from 'react';
import { ArrowUpRight, Compass, X } from 'lucide-react';
import { demoWorkspaces, chooserHref } from '../../access/routes';
import { LAUNCHER_TIMING, sourceTransform, visibleSource } from './motion';
import styles from './PortalLauncher.module.css';

export default function PortalLauncher() {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const animation = useRef<Animation | null>(null);
  const closing = useRef(false);
  const [open, setOpen] = useState(false);
  function close() {
    const node = dialog.current;
    if (!node?.open || closing.current) return;
    closing.current = true;
    const current = getComputedStyle(node).transform;
    animation.current?.cancel();
    const source = trigger.current?.getBoundingClientRect();
    const destination = node.getBoundingClientRect();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const target =
      source && visibleSource(source, innerWidth, innerHeight)
        ? sourceTransform(source, destination)
        : null;
    const finish = () => {
      node.close();
      setOpen(false);
      closing.current = false;
      if (trigger.current?.isConnected)
        trigger.current.focus({ preventScroll: true });
    };
    if (reduced) {
      finish();
      return;
    }
    const exit = node.animate(
      [
        { transform: current, opacity: 1 },
        {
          transform: target ?? 'none',
          opacity: 0,
          borderRadius: target ? '22px' : '24px',
        },
      ],
      {
        duration: LAUNCHER_TIMING.close,
        easing: 'cubic-bezier(.65,0,.35,1)',
        fill: 'forwards',
      },
    );
    animation.current = exit;
    exit.finished.then(finish).catch(() => {});
  }
  useEffect(() => {
    if (!open || !dialog.current) return;
    const node = dialog.current;
    closing.current = false;
    node.showModal();
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const destination = node.getBoundingClientRect();
    const source = trigger.current?.getBoundingClientRect();
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches && source) {
      const transform = sourceTransform(source, destination);
      if (transform)
        animation.current = node.animate(
          [
            { transform, opacity: 0.2, borderRadius: '22px' },
            { transform: 'none', opacity: 1, borderRadius: '24px' },
          ],
          {
            duration: LAUNCHER_TIMING.open,
            easing: 'cubic-bezier(.16,1,.3,1)',
          },
        );
    }
    node
      .querySelector<HTMLButtonElement>('button')
      ?.focus({ preventScroll: true });
    const backdrop = (event: MouseEvent) => {
      if (event.target === node) {
        const r = node.getBoundingClientRect();
        if (
          event.clientX < r.left ||
          event.clientX > r.right ||
          event.clientY < r.top ||
          event.clientY > r.bottom
        )
          close();
      }
    };
    node.addEventListener('click', backdrop);
    const back = () => close();
    window.addEventListener('popstate', back);
    return () => {
      node.removeEventListener('click', backdrop);
      animation.current?.cancel();
      document.body.style.overflow = oldOverflow;
      window.removeEventListener('popstate', back);
      if (node.open) node.close();
    };
  }, [open]);
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className={styles.trigger}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen(true)}
      >
        <Compass size={18} aria-hidden="true" />
        <span>Workspaces</span>
      </button>
      {open &&
        createPortal(
          <dialog
            ref={dialog}
            id={id}
            className={styles.window}
            aria-labelledby={`${id}-title`}
            onCancel={(event) => {
              event.preventDefault();
              close();
            }}
          >
            <div className={styles.bar}>
              <span>TNP / YOUR WORKSPACE</span>
              <button
                type="button"
                aria-label="Close workspaces"
                onClick={close}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.content}>
              <p className={styles.kicker}>TEMPORARY CLIENT DEMO</p>
              <h2 id={`${id}-title`}>Open a working space.</h2>
              <p>
                Choose a temporary demo identity and walk through the frontend.
                No real credentials are required.
              </p>
              <nav aria-label="Temporary demo workspaces">
                {demoWorkspaces.map((item, index) => (
                  <Link
                    key={item.id}
                    href={chooserHref(item.id)}
                    onClick={() => {
                      dialog.current?.close();
                      setOpen(false);
                    }}
                  >
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
                Synthetic preview only. No live authentication, bookings,
                payments or messages.
              </p>
              <Link
                className={styles.contact}
                href="/contact"
                onClick={() => {
                  dialog.current?.close();
                  setOpen(false);
                }}
              >
                Planning an event? Talk to TNP →
              </Link>
            </div>
          </dialog>,
          document.body,
        )}
    </>
  );
}
