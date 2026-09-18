'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  Application,
  Assessment,
  Assignment,
  Opportunity,
  PreviewMutationMap,
  PreviewService,
  ScenarioMetadata,
  Worker,
} from '../../../../lib/contracts/preview.ts';
import { getBrowserPreviewService } from '../../../../lib/services/preview.ts';
import {
  actionSlot,
  createRequest,
  mayRespond,
  readRequests,
  samePayload,
  storageKey,
  type FreelancerOperation,
  type FreelancerRequest,
} from './freelancerState.ts';

export type WorkspaceData = {
  generation: number;
  applications: Application[];
  assessments: Assessment[];
  opportunities: Opportunity[];
  assignments: Assignment[];
  metadata: ScenarioMetadata;
  worker: Worker | null;
};
export function useFreelancer(profile: string) {
  const service = useRef<PreviewService | null>(null);
  const epoch = useRef(0);
  const busyRef = useRef(false);
  const dataRef = useRef<WorkspaceData | null>(null);
  const requests = useRef<Record<string, FreelancerRequest>>({});
  const journalKey = useRef('');
  const [data, setData] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [storageWarning, setStorageWarning] = useState('');
  const [pendingRequests, setPendingRequests] = useState<FreelancerRequest[]>(
    [],
  );
  const persist = useCallback(() => {
    setPendingRequests(Object.values(requests.current));
    try {
      window.localStorage.setItem(
        journalKey.current,
        JSON.stringify(requests.current),
      );
    } catch {
      setStorageWarning(
        'Retry identity is kept in memory only. Keep this page open until the action is resolved.',
      );
    }
  }, []);
  const load = useCallback(async () => {
    const token = ++epoch.current;
    setLoading(true);
    setError('');
    try {
      const s = service.current ?? (await getBrowserPreviewService());
      service.current = s;
      const generation = await s.getGeneration();
      const [
        applications,
        assessments,
        opportunities,
        assignments,
        metadata,
        worker,
      ] = await Promise.all([
        s.listApplications(),
        s.listAssessments(profile),
        s.listOpportunities(profile),
        s.listAssignments(profile),
        s.getScenarioMetadata(),
        s.getStanding(profile),
      ]);
      if (epoch.current !== token) return;
      if (!worker.ok && worker.error.code !== 'NOT_FOUND')
        throw new Error(`${worker.error.code}: ${worker.error.message}`);
      for (const result of [
        applications,
        assessments,
        opportunities,
        assignments,
      ])
        if (!result.ok)
          throw new Error(`${result.error.code}: ${result.error.message}`);
      if (
        !applications.ok ||
        !assessments.ok ||
        !opportunities.ok ||
        !assignments.ok
      )
        return;
      if (
        [applications, assessments, opportunities, assignments].some(
          (r) => r.generation !== generation,
        ) ||
        worker.generation !== generation ||
        (await s.getGeneration()) !== generation
      ) {
        throw new Error(
          'Preview changed while loading. Refresh to read current records.',
        );
      }
      if (epoch.current !== token) return;
      const next = {
        generation,
        applications: applications.value.items.filter(
          (a) => a.applicantId === profile,
        ),
        assessments: assessments.value.items,
        opportunities: opportunities.value.items,
        assignments: assignments.value.items,
        metadata,
        worker: worker.ok ? worker.value : null,
      };
      const key = storageKey('requests', profile, generation);
      if (journalKey.current !== key) {
        journalKey.current = key;
        try {
          requests.current = readRequests(
            window.localStorage.getItem(key),
            profile,
            generation,
          );
        } catch {
          requests.current = {};
          setStorageWarning(
            'Saved retry data is unavailable. New retry identities stay in memory; keep this page open until actions are resolved.',
          );
        }
        setPendingRequests(Object.values(requests.current));
      }
      dataRef.current = next;
      setData(next);
    } catch (e) {
      if (epoch.current === token)
        setError(
          e instanceof DOMException &&
            (e.name === 'SecurityError' || e.name === 'QuotaExceededError')
            ? 'Browser storage is unavailable, so the shared preview cannot load. Allow site storage and reload this page. No records were changed.'
            : e instanceof Error
              ? e.message
              : 'Preview unavailable.',
        );
    } finally {
      if (epoch.current === token) setLoading(false);
    }
  }, [profile]);
  useEffect(() => {
    let active = true;
    const sequence = epoch;
    void Promise.resolve().then(() => {
      if (!active) return;
      setData(null);
      dataRef.current = null;
      setNotice('');
      setStorageWarning('');
      setPendingRequests([]);
      journalKey.current = '';
      requests.current = {};
      void load();
    });
    const changed = () => {
      setNotice('Preview changed. Current records have been refreshed.');
      void load();
    };
    const reset = () => {
      busyRef.current = false;
      setBusy(false);
      setNotice(
        'Preview reset. Previous drafts and actions belong to the old generation.',
      );
      void load();
    };
    window.addEventListener('tnp-preview-change', changed);
    window.addEventListener('tnp-preview-reset', reset);
    return () => {
      active = false;
      ++sequence.current;
      window.removeEventListener('tnp-preview-change', changed);
      window.removeEventListener('tnp-preview-reset', reset);
    };
  }, [load]);

  async function run<K extends FreelancerOperation>(
    operation: K,
    payload: PreviewMutationMap[K]['payload'],
    retry?: FreelancerRequest,
  ) {
    const s = service.current,
      current = dataRef.current;
    if (!s || !current || busyRef.current || loading || error) return false;
    const invocationEpoch = epoch.current;
    const slot = actionSlot(operation, payload);
    if (operation === 'registerApplicant' && current.worker) {
      delete requests.current[slot];
      persist();
      setNotice(
        'This sample profile already has a worker record. No new application or profile changes were submitted. Review its current details in Application.',
      );
      return false;
    }
    const saved = requests.current[slot];
    if (!retry && saved && !samePayload(saved.payload, payload)) {
      setNotice(
        'An earlier action is unresolved. Retry it or explicitly discard its retry identity before starting a different action.',
      );
      return false;
    }
    const request =
      retry ??
      saved ??
      createRequest(
        operation,
        payload,
        profile,
        current.generation,
        `freelancer-${crypto.randomUUID()}`,
      );
    if (
      request.actorId !== profile ||
      request.expectedGeneration !== current.generation ||
      !mayRespond(request, current.assignments)
    ) {
      setNotice(
        'This action no longer belongs to the current profile or assignment. Refresh the workspace.',
      );
      return false;
    }
    requests.current[slot] = request as FreelancerRequest;
    persist();
    busyRef.current = true;
    setBusy(true);
    setNotice('Saving your sample action…');
    try {
      if (operation === 'registerApplicant') {
        const worker = await s.getStanding(profile, { variant: 'ready' });
        if (invocationEpoch !== epoch.current) return false;
        if (worker.ok) {
          delete requests.current[slot];
          persist();
          setNotice(
            'A worker record already exists for this profile. No new application or profile changes were submitted.',
          );
          await load();
          return false;
        }
        if (worker.error.code !== 'NOT_FOUND')
          throw new Error(
            'The current worker profile could not be checked. No application was submitted.',
          );
      }
      // The frozen service owns validation, allocation and idempotency.
      const result = await s.mutate(request);
      const now = await s.getGeneration();
      if (invocationEpoch !== epoch.current || now !== current.generation) {
        if (invocationEpoch === epoch.current) {
          setNotice(
            'The preview generation changed. The old result was not applied.',
          );
          await load();
        }
        return false;
      }
      if (!result.ok) {
        setNotice(
          `${result.error.code}: ${result.error.message}${result.error.retryable ? ' Retry the same action below.' : ' Refresh records before explicitly starting a new action.'}`,
        );
        if (result.error.code === 'STALE_GENERATION') await load();
        return false;
      }
      // Query the canonical records after every accepted mutation, even on replay.
      if (request.operation === 'registerApplicant') {
        const applications = await s.listApplications({ variant: 'ready' });
        if (
          !applications.ok ||
          !applications.value.items.some(
            (a) =>
              a.id === result.value.id &&
              a.applicantId === request.payload.applicantId &&
              a.role === request.payload.role,
          )
        )
          throw new Error(
            'Application receipt could not be reconciled with the current service record.',
          );
      }
      if (request.operation === 'submitAssessment') {
        const assessments = await s.listAssessments(profile, {
          variant: 'ready',
        });
        if (
          !assessments.ok ||
          !assessments.value.items.some(
            (a) =>
              a.id === result.value.id &&
              a.applicantId === request.payload.applicantId &&
              a.score === request.payload.score,
          )
        )
          throw new Error(
            'Assessment receipt could not be reconciled with the current service record.',
          );
      }
      if (
        operation === 'claimOpportunity' ||
        operation === 'respondToAssignment'
      ) {
        const value = result.value as Assignment;
        const [roster, assignments] = await Promise.all([
          s.listRoster(value.eventId, { variant: 'ready' }),
          s.listAssignments(profile, { variant: 'ready' }),
        ]);
        const record = assignments.ok
          ? assignments.value.items.find((a) => a.id === value.id)
          : undefined;
        const matches =
          record?.workerId === profile &&
          record.eventId === value.eventId &&
          record.positionId === value.positionId &&
          (request.operation !== 'claimOpportunity' ||
            record.positionId === request.payload.positionId) &&
          (request.operation !== 'respondToAssignment' ||
            (record.id === request.payload.assignmentId &&
              record.response === request.payload.response));
        if (
          !roster.ok ||
          !matches ||
          (record.allocationState === 'active' &&
            !roster.value.items.some(
              (a) => a.id === record.id && a.workerId === profile,
            ))
        )
          throw new Error(
            'Action accepted; assignment and roster could not be reconciled. Retry the same action to reconcile.',
          );
      }
      if (
        invocationEpoch !== epoch.current ||
        (await s.getGeneration()) !== current.generation
      )
        return false;
      delete requests.current[slot];
      persist();
      setNotice(
        `${result.replayed ? 'Recovered the same sample action.' : 'Sample action saved.'} Reference: ${result.value.id}. No external delivery occurred.`,
      );
      await load();
      return true;
    } catch (e) {
      if (invocationEpoch === epoch.current)
        setNotice(
          `${e instanceof Error ? e.message : 'Response unavailable.'} Retry the same action; its identity is preserved.`,
        );
      return false;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  function discard(request: FreelancerRequest) {
    if (
      busyRef.current ||
      !window.confirm(
        'Discard this retry identity? The service may already have accepted the action. Refresh and inspect its records before creating another action.',
      )
    )
      return;
    delete requests.current[actionSlot(request.operation, request.payload)];
    persist();
    void load();
    setNotice(
      'Retry identity discarded. Inspect the refreshed records before a new action.',
    );
  }
  return {
    data,
    loading,
    error,
    notice,
    setNotice,
    busy,
    storageWarning,
    pendingRequests,
    refresh: load,
    run,
    discard,
  };
}
export type FreelancerWorkspace = ReturnType<typeof useFreelancer>;
