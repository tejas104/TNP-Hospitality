'use client';

import { useEffect, useRef, useState } from 'react';
import { resetScope } from '../access/session';
import type {
  PreviewService,
  PreviewVariant,
} from '../../../lib/contracts/preview.ts';
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
  const [confirmReset, setConfirmReset] = useState(false);

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
          setStatus(
            error instanceof Error
              ? error.message
              : 'Preview storage is unavailable.',
          );
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function captureAction(
    operation: string,
    payload: unknown,
  ): CapturedPreviewActionIdentity | null {
    if (!actionIdentities.current || generation === null) return null;
    try {
      return actionIdentities.current.capture({
        expectedGeneration: generation,
        operation,
        payload,
      });
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'Preview action identity is unavailable.',
      );
      return null;
    }
  }

  async function changeVariant(nextVariant: PreviewVariant) {
    if (!service.current || generation === null) return;
    const payload = { key: 'global' as const, variant: nextVariant };
    const identity = captureAction(
      PREVIEW_OPERATIONS.setPreviewVariant,
      payload,
    );
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
    window.dispatchEvent(
      new CustomEvent('tnp-preview-change', {
        detail: {
          generation: identity.expectedGeneration,
          variant: nextVariant,
        },
      }),
    );
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
    window.dispatchEvent(
      new CustomEvent('tnp-preview-reset', { detail: result.value }),
    );
    resetButton.current?.focus();
  }

  return (
    <details className="ux-preview-tools ux-product">
      <summary>
        <strong>Synthetic preview</strong>
        <span>Scenario & reset controls</span>
      </summary>
      <div className="ux-preview-body">
        <p>{warning}</p>
        <div
          className="preview-control-panel"
          aria-label="Connected preview controls"
        >
          <label>
            Synthetic preview state
            <select
              aria-label="Synthetic preview state"
              value={variant}
              disabled={busy || generation === null}
              onChange={(event) =>
                void changeVariant(event.target.value as PreviewVariant)
              }
            >
              <option value="ready">Ready</option>
              <option value="loading">Loading</option>
              <option value="empty">Empty</option>
              <option value="error">Error</option>
            </select>
          </label>
          <button
            className="ux-action ux-action-secondary"
            ref={resetButton}
            type="button"
            disabled={busy || generation === null}
            onClick={() => setConfirmReset(true)}
          >
            Reset connected cross-portal preview
          </button>
          <output aria-live="polite">{status}</output>
        </div>
        {confirmReset && (
          <div className="ux-reset-confirm">
            <p>
              {resetScope.connected} This replaces connected sample records with
              their starting state.
            </p>
            <button
              className="ux-action ux-action-danger"
              type="button"
              disabled={busy}
              onClick={() => {
                setConfirmReset(false);
                void reset();
              }}
            >
              Confirm cross-portal reset
            </button>
            <button
              className="ux-action ux-action-tertiary"
              type="button"
              onClick={() => {
                setConfirmReset(false);
                resetButton.current?.focus();
              }}
            >
              Keep preview records
            </button>
          </div>
        )}
      </div>
    </details>
  );
}
