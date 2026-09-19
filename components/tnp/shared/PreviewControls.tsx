'use client';

import { useEffect, useRef, useState } from 'react';
import type { PreviewService, PreviewVariant } from '../../../lib/contracts/preview.ts';
import { PREVIEW_OPERATIONS } from '../../../lib/demo/service.ts';
import { getBrowserPreviewService } from '../../../lib/services/preview.ts';
import {
  createBrowserPreviewActionIdentityManager,
  type CapturedPreviewActionIdentity,
  type PreviewActionIdentityManager,
} from './previewActionIdentity.ts';

const warning =
  'Synthetic preview data. Do not enter real personal information. No live verification, tracking or payments.';

export function PreviewControls() {
  const service = useRef<PreviewService | null>(null);
  const actionIdentities = useRef<PreviewActionIdentityManager | null>(null);
  const resetButton = useRef<HTMLButtonElement>(null);
  const [generation, setGeneration] = useState<number | null>(null);
  const [variant, setVariant] = useState<PreviewVariant>('ready');
  const [status, setStatus] = useState('Loading preview state…');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        actionIdentities.current = createBrowserPreviewActionIdentityManager();
        const instance = await getBrowserPreviewService();
        service.current = instance;
        const current = await instance.getGeneration();
        if (active) {
          setGeneration(current);
          setStatus(`Preview generation ${current}`);
        }
      } catch (error) {
        if (active) {
          setStatus(error instanceof Error ? error.message : 'Preview storage is unavailable.');
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function captureAction(operation: string, payload: unknown): CapturedPreviewActionIdentity | null {
    if (!actionIdentities.current || generation === null) return null;
    try {
      return actionIdentities.current.capture({ expectedGeneration: generation, operation, payload });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Preview action identity is unavailable.');
      return null;
    }
  }

  async function changeVariant(nextVariant: PreviewVariant) {
    if (!service.current || generation === null) return;
    const payload = { key: 'global' as const, variant: nextVariant };
    const identity = captureAction(PREVIEW_OPERATIONS.setPreviewVariant, payload);
    if (!identity) return;
    setBusy(true);
    const result = await service.current.mutate({
      ...identity,
      actorId: 'tnp-preview-controls',
      operation: PREVIEW_OPERATIONS.setPreviewVariant,
      payload,
    });
    setBusy(false);
    if (!result.ok) {
      if (!result.error.retryable) actionIdentities.current?.settle(identity);
      setStatus(result.error.message);
      return;
    }
    actionIdentities.current?.settle(identity);
    setVariant(nextVariant);
    setStatus(`Global preview state: ${nextVariant}`);
    window.dispatchEvent(new CustomEvent('tnp-preview-change', { detail: { generation: identity.expectedGeneration, variant: nextVariant } }));
  }

  async function reset() {
    if (!service.current || generation === null) return;
    const identity = captureAction('resetPreview', null);
    if (!identity) return;
    setBusy(true);
    const result = await service.current.resetPreview({
      ...identity,
      actorId: 'tnp-preview-controls',
    });
    setBusy(false);
    if (!result.ok) {
      if (!result.error.retryable) actionIdentities.current?.settle(identity);
      setStatus(result.error.message);
      resetButton.current?.focus();
      return;
    }
    actionIdentities.current?.settle(identity);
    setGeneration(result.value.toGeneration);
    setVariant('ready');
    setStatus(`Preview reset to generation ${result.value.toGeneration}`);
    window.dispatchEvent(new CustomEvent('tnp-preview-reset', { detail: result.value }));
    resetButton.current?.focus();
  }

  return (
    <>
      <div className="preview-notice" role="note">
        {warning}
      </div>
      <div
        className="preview-control-panel"
        aria-label="Preview controls"
      >
        <label>
          <span className="sr-only">Synthetic preview state</span>
          <select
            aria-label="Synthetic preview state"
            value={variant}
            disabled={busy || generation === null}
            onChange={(event) => void changeVariant(event.target.value as PreviewVariant)}
          >
            <option value="ready">Ready</option>
            <option value="loading">Loading</option>
            <option value="empty">Empty</option>
            <option value="error">Error</option>
          </select>
        </label>
        <button
          ref={resetButton}
          type="button"
          disabled={busy || generation === null}
          onClick={() => void reset()}
        >
          Reset preview
        </button>
        <output aria-live="polite">{status}</output>
      </div>
      <style>{`
        .preview-control-panel {
          position: fixed;
          z-index: 42;
          right: max(1rem, env(safe-area-inset-right));
          bottom: max(1rem, env(safe-area-inset-bottom));
          display: flex;
          align-items: center;
          gap: 0.5rem;
          max-width: min(32rem, calc(100vw - 2rem));
          padding: 0.45rem;
          color: #fff;
          background: #008080;
          border: 1px solid rgba(210, 188, 133, 0.55);
          font-size: 0.7rem;
        }
        .preview-control-panel select,
        .preview-control-panel button {
          min-height: 2rem;
        }
        .preview-control-panel output {
          line-height: 1.25;
        }
        .preview-control-panel :is(button, select):focus-visible {
          outline: 3px solid #fff;
          outline-offset: 2px;
        }
        @media (max-width: 700px) {
          body {
            padding-bottom: calc(12rem + env(safe-area-inset-bottom));
          }
          .preview-control-panel {
            right: max(1rem, env(safe-area-inset-right));
            bottom: max(5.25rem, calc(env(safe-area-inset-bottom) + 5.25rem));
            left: max(1rem, env(safe-area-inset-left));
            flex-wrap: wrap;
          }
          .preview-control-panel output {
            flex-basis: 100%;
          }
        }
      `}</style>
    </>
  );
}
