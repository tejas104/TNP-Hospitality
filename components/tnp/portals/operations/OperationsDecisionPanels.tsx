'use client';

import { useMemo, useState } from 'react';
import type {
  Application,
  Assignment,
  Attendance,
  AuditEntry,
  EvidenceState,
  Position,
  PreviewMutationMap,
  Worker,
} from '@/lib/contracts/preview';
import styles from './AdminOperations.module.css';

export type ActionFeedback = {
  kind: 'idle' | 'busy' | 'success' | 'error';
  message: string;
  code?: string;
};

function Feedback({ feedback, onRetry }: { feedback: ActionFeedback; onRetry: () => void }) {
  if (feedback.kind === 'idle') return null;
  const reviewRequired = feedback.code === 'EARNING_ADJUSTMENT_REVIEW_REQUIRED';
  return (
    <output className={`${styles.actionMessage} ${feedback.kind === 'error' ? styles.actionError : ''}`} aria-live="polite">
      <strong>{reviewRequired ? 'Review needed — ledger unchanged' : feedback.code ?? feedback.kind}</strong>
      <span>{feedback.message}</span>
      {feedback.kind === 'error' && feedback.code !== 'STALE_GENERATION' && <button type="button" onClick={onRetry}>Retry same request</button>}
    </output>
  );
}

export function VerificationPanel({ applications, workers, feedback, onReview, onChangeRole, onRetry }: {
  applications: Application[];
  workers: Record<string, Worker>;
  feedback: ActionFeedback;
  onReview: (payload: PreviewMutationMap['reviewApplication']['payload']) => void;
  onChangeRole: (payload: PreviewMutationMap['changeRole']['payload']) => void;
  onRetry: () => void;
}) {
  const pending = applications.filter((item) => item.status === 'pending');
  const reviewed = applications.filter((item) => item.status !== 'pending');
  const [applicationId, setApplicationId] = useState(pending[0]?.id ?? applications[0]?.id ?? '');
  const [decision, setDecision] = useState<'approved-sample' | 'rejected'>('approved-sample');
  const [reviewReason, setReviewReason] = useState('Human review of synthetic application evidence');
  const workerList = Object.values(workers);
  const [workerId, setWorkerId] = useState('tnp-demo-worker-006');
  const [role, setRole] = useState('Hostess');
  const [roleReason, setRoleReason] = useState('Human-approved synthetic role adjustment');

  return (
    <>
      <div className={styles.panelHeading}>
        <div><p className="section-kicker">F14 · VERIFICATION REVIEW</p><h2>Human decisions stay visible and reasoned.</h2></div>
        <p>Approval is sample-only. A role change never auto-deactivates a worker or substitutes for production identity checks.</p>
      </div>
      <div className={styles.decisionGrid}>
        <section className={styles.decisionCard}>
          <div className={styles.cardTitle}><div><p className="section-kicker">PENDING QUEUE</p><h3>{pending.length} awaiting review</h3></div><span className={styles.pendingBadge}>Pending</span></div>
          {pending.length ? pending.map((application) => <ApplicationRow application={application} worker={workers[application.applicantId]} key={application.id} />) : <p className={styles.mutedDark}>No pending sample applications.</p>}
        </section>
        <section className={styles.decisionCard}>
          <div className={styles.cardTitle}><div><p className="section-kicker">REVIEWED QUEUE</p><h3>{reviewed.length} resolved records</h3></div><span className={styles.reviewedBadge}>Reviewed</span></div>
          {reviewed.map((application) => <ApplicationRow application={application} worker={workers[application.applicantId]} key={application.id} />)}
        </section>
      </div>
      <div className={styles.formGrid}>
        <form className={styles.controlForm} onSubmit={(event) => { event.preventDefault(); onReview({ applicationId, decision, reason: reviewReason }); }}>
          <div><p className="section-kicker">DECISION CONTROL</p><h3>Review an application</h3></div>
          <label>Application<select value={applicationId} onChange={(event) => setApplicationId(event.target.value)}>{applications.map((item) => <option value={item.id} key={item.id}>{item.id} · {item.status}</option>)}</select></label>
          <label>Human decision<select value={decision} onChange={(event) => setDecision(event.target.value as typeof decision)}><option value="approved-sample">Approve sample</option><option value="rejected">Reject</option></select></label>
          <label>Required reason<textarea required value={reviewReason} onChange={(event) => setReviewReason(event.target.value)} /></label>
          <button className="magnetic-btn dark" type="submit" disabled={!applicationId || !reviewReason.trim() || feedback.kind === 'busy'}>Record human decision</button>
        </form>
        <form className={styles.controlForm} onSubmit={(event) => { event.preventDefault(); onChangeRole({ workerId, role, reason: roleReason }); }}>
          <div><p className="section-kicker">ROLE CONTROL</p><h3>Reasoned role adjustment</h3></div>
          <label>Worker<select value={workerId} onChange={(event) => setWorkerId(event.target.value)}>{workerList.map((worker) => <option value={worker.id} key={worker.id}>{worker.displayName} · {worker.role}</option>)}</select></label>
          <label>New role<input required value={role} onChange={(event) => setRole(event.target.value)} /></label>
          <label>Required reason<textarea required value={roleReason} onChange={(event) => setRoleReason(event.target.value)} /></label>
          <p className={styles.policyNote}>This changes a synthetic role only. Standing remains a separate human-reviewed record; there is no automatic permanent deactivation.</p>
          <button className="magnetic-btn dark" type="submit" disabled={!workerId || !role.trim() || !roleReason.trim() || feedback.kind === 'busy'}>Change sample role</button>
        </form>
      </div>
      <Feedback feedback={feedback} onRetry={onRetry} />
    </>
  );
}

function ApplicationRow({ application, worker }: { application: Application; worker?: Worker }) {
  return <article className={styles.queueRow}><div><strong>{worker?.displayName ?? application.applicantId}</strong><span>{application.role} · {application.id}</span></div><div><b>{application.status}</b><small>{application.reviewReason ?? 'Awaiting a human reason'}</small></div></article>;
}

export function AttendancePanel({ attendances, assignments, positions, workers, audit, feedback, onCorrect, onNonresponse, onAdminAssign, onReplace, onRecord, onRetry }: {
  attendances: Attendance[];
  assignments: Assignment[];
  positions: Position[];
  workers: Record<string, Worker>;
  audit: AuditEntry[];
  feedback: ActionFeedback;
  onCorrect: (payload: PreviewMutationMap['correctAttendance']['payload']) => void;
  onNonresponse: (payload: PreviewMutationMap['markNonresponse']['payload']) => void;
  onAdminAssign: (payload: PreviewMutationMap['adminAssign']['payload']) => void;
  onReplace: (payload: PreviewMutationMap['replaceAssignment']['payload']) => void;
  onRecord: (assignmentId: string, evidenceState: EvidenceState, note: string, distanceMetres?: number) => void;
  onRetry: () => void;
}) {
  const activeAssignments = assignments.filter((item) => item.allocationState === 'active');
  const [attendanceId, setAttendanceId] = useState('tnp-demo-attendance-001');
  const [correctionState, setCorrectionState] = useState<'present' | 'absent' | 'exception'>('present');
  const [correctionEvidence, setCorrectionEvidence] = useState<EvidenceState>('recorded');
  const [correctionReason, setCorrectionReason] = useState('Supervisor verified synthetic arrival evidence');
  const [nonresponseId, setNonresponseId] = useState('tnp-demo-assignment-005');
  const [nonresponseReason, setNonresponseReason] = useState('No response after documented synthetic follow-up');
  const [positionId, setPositionId] = useState('tnp-demo-position-001');
  const [adminWorkerId, setAdminWorkerId] = useState('tnp-demo-worker-006');
  const [adminReason, setAdminReason] = useState('Human-approved synthetic staffing exception');
  const [recordAssignmentId, setRecordAssignmentId] = useState('tnp-demo-assignment-006');
  const [recordEvidence, setRecordEvidence] = useState<EvidenceState>('recorded');
  const [recordNote, setRecordNote] = useState('Synthetic pass checked at event desk');
  const [replacementAssignmentId, setReplacementAssignmentId] = useState('tnp-demo-assignment-002');
  const [replacementWorkerId, setReplacementWorkerId] = useState('tnp-demo-worker-006');
  const [replacementReason, setReplacementReason] = useState('Human-approved replacement after attendance exception');

  const attendanceById = useMemo(() => new Map(attendances.map((item) => [item.id, item])), [attendances]);
  const missingAttendanceAssignments = activeAssignments.filter((item) => !attendances.some((attendance) => attendance.assignmentId === item.id));

  function submitCorrection() {
    const exception = correctionState !== 'present';
    onCorrect({ attendanceId, state: correctionState, evidenceState: correctionEvidence, reason: correctionReason,
      note: exception ? 'Synthetic correction retained for human review' : 'Synthetic desk evidence verified' });
  }

  return (
    <>
      <div className={styles.panelHeading}>
        <div><p className="section-kicker">F15 · ATTENDANCE EXCEPTIONS</p><h2>Evidence, correction and replacement controls.</h2></div>
        <p>Distances shown are recorded synthetic evidence only. This page does not claim live location or auto-allocate a replacement.</p>
      </div>
      <section className={styles.evidenceGrid} aria-label="Attendance evidence records">
        {attendances.map((attendance) => <EvidenceCard attendance={attendance} worker={workers[attendance.workerId]} key={attendance.id} />)}
      </section>
      <div className={styles.formGrid}>
        <form className={styles.controlForm} onSubmit={(event) => { event.preventDefault(); submitCorrection(); }}>
          <div><p className="section-kicker">CORRECTION</p><h3>Preserve original evidence</h3></div>
          <label>Attendance<select value={attendanceId} onChange={(event) => setAttendanceId(event.target.value)}>{attendances.map((item) => <option value={item.id} key={item.id}>{item.id} · {item.evidence.state}</option>)}</select></label>
          <label>Corrected state<select value={correctionState} onChange={(event) => { const state = event.target.value as typeof correctionState; setCorrectionState(state); setCorrectionEvidence(state === 'present' ? 'recorded' : 'gps-missing'); }}><option value="present">Present</option><option value="exception">Exception</option><option value="absent">Absent</option></select></label>
          <label>Evidence state<select value={correctionEvidence} onChange={(event) => setCorrectionEvidence(event.target.value as EvidenceState)}><option value="recorded">Recorded</option><option value="gps-missing">GPS missing</option><option value="gps-denied">GPS denied</option><option value="outside-radius">Outside radius</option></select></label>
          <label>Required reason<textarea required value={correctionReason} onChange={(event) => setCorrectionReason(event.target.value)} /></label>
          <p className={styles.policyNote}>{attendanceById.get(attendanceId)?.history.length ?? 0} prior evidence record(s). Processing/approved ledgers reject invalidating correction and remain unchanged with explicit review-needed status.</p>
          <button className="magnetic-btn dark" type="submit" disabled={!correctionReason.trim() || feedback.kind === 'busy'}>Submit correction</button>
        </form>

        <form className={styles.controlForm} onSubmit={(event) => { event.preventDefault(); onReplace({ assignmentId: replacementAssignmentId, replacementWorkerId, reason: replacementReason }); }}>
          <div><p className="section-kicker">REPLACEMENT</p><h3>Validate before replacing</h3></div>
          <label>Original active assignment<select value={replacementAssignmentId} onChange={(event) => setReplacementAssignmentId(event.target.value)}>{activeAssignments.map((item) => <option value={item.id} key={item.id}>{item.id} · {workers[item.workerId]?.displayName ?? item.workerId}</option>)}</select></label>
          <label>Replacement worker<select value={replacementWorkerId} onChange={(event) => setReplacementWorkerId(event.target.value)}>{Object.values(workers).map((worker) => <option value={worker.id} key={worker.id}>{worker.displayName} · {worker.role}</option>)}</select></label>
          <label>Required reason<textarea required value={replacementReason} onChange={(event) => setReplacementReason(event.target.value)} /></label>
          <p className={styles.policyNote}>Try worker 004 for ineligible, worker 001 for overlap, or worker 006 for a valid coordinator replacement. A rejection leaves the original assignment active.</p>
          <button className="magnetic-btn dark" type="submit" disabled={!replacementReason.trim() || feedback.kind === 'busy'}>Validate and replace</button>
        </form>

        <form className={styles.controlForm} onSubmit={(event) => { event.preventDefault(); onNonresponse({ assignmentId: nonresponseId, reason: nonresponseReason }); }}>
          <div><p className="section-kicker">NONRESPONSE</p><h3>Reasoned response update</h3></div>
          <label>Assignment<select value={nonresponseId} onChange={(event) => setNonresponseId(event.target.value)}>{activeAssignments.map((item) => <option value={item.id} key={item.id}>{item.id} · {item.response}</option>)}</select></label>
          <label>Required reason<textarea required value={nonresponseReason} onChange={(event) => setNonresponseReason(event.target.value)} /></label>
          <button className="magnetic-btn dark" type="submit" disabled={!nonresponseReason.trim() || feedback.kind === 'busy'}>Mark not coming</button>
        </form>

        <form className={styles.controlForm} onSubmit={(event) => { event.preventDefault(); onAdminAssign({ positionId, workerId: adminWorkerId, reason: adminReason }); }}>
          <div><p className="section-kicker">ADMIN ASSIGN</p><h3>Human-authorized sample allocation</h3></div>
          <label>Position<select value={positionId} onChange={(event) => setPositionId(event.target.value)}>{positions.map((item) => <option value={item.id} key={item.id}>{item.id} · {item.role} · {item.status}</option>)}</select></label>
          <label>Worker<select value={adminWorkerId} onChange={(event) => setAdminWorkerId(event.target.value)}>{Object.values(workers).map((worker) => <option value={worker.id} key={worker.id}>{worker.displayName} · {worker.role}</option>)}</select></label>
          <label>Required reason<textarea required value={adminReason} onChange={(event) => setAdminReason(event.target.value)} /></label>
          <button className="magnetic-btn dark" type="submit" disabled={!adminReason.trim() || feedback.kind === 'busy'}>Create sample assignment</button>
        </form>

        <form className={styles.controlForm} onSubmit={(event) => { event.preventDefault(); onRecord(recordAssignmentId, recordEvidence, recordNote, recordEvidence === 'outside-radius' ? 480 : undefined); }}>
          <div><p className="section-kicker">PASS ATTENDANCE</p><h3>Record linked evidence</h3></div>
          <label>Confirmed assignment<select value={recordAssignmentId} onChange={(event) => setRecordAssignmentId(event.target.value)}>{missingAttendanceAssignments.map((item) => <option value={item.id} key={item.id}>{item.id} · {workers[item.workerId]?.displayName ?? item.workerId}</option>)}</select></label>
          <label>Evidence<select value={recordEvidence} onChange={(event) => setRecordEvidence(event.target.value as EvidenceState)}><option value="recorded">Recorded</option><option value="gps-missing">GPS missing</option><option value="gps-denied">GPS denied</option><option value="outside-radius">Outside radius · 480 m synthetic</option></select></label>
          <label>Evidence note<textarea required value={recordNote} onChange={(event) => setRecordNote(event.target.value)} /></label>
          <button className="magnetic-btn dark" type="submit" disabled={!recordAssignmentId || !recordNote.trim() || feedback.kind === 'busy'}>Read pass and record</button>
        </form>
      </div>
      <Feedback feedback={feedback} onRetry={onRetry} />
      <section className={styles.auditPanel}>
        <div className={styles.cardTitle}><div><p className="section-kicker">AUDIT FEED</p><h3>Reasoned Operations mutations</h3></div><span>{audit.length} entries</span></div>
        <div className={styles.auditList}>{[...audit].reverse().map((entry) => <article key={entry.id}><strong>{entry.action}</strong><span>{entry.reason}</span><small>{entry.entityId} · {entry.actorId}</small></article>)}</div>
      </section>
    </>
  );
}

function EvidenceCard({ attendance, worker }: { attendance: Attendance; worker?: Worker }) {
  const label: Record<EvidenceState, string> = {
    recorded: 'Recorded evidence', 'gps-missing': 'GPS missing', 'gps-denied': 'GPS permission denied', 'outside-radius': 'Outside recorded radius',
  };
  return <article className={styles.evidenceCard}><div className={styles.cardTitle}><div><p className="section-kicker">{attendance.id}</p><h3>{worker?.displayName ?? attendance.workerId}</h3></div><span className={attendance.evidence.state === 'recorded' ? styles.reviewedBadge : styles.pendingBadge}>{attendance.state}</span></div><strong>{label[attendance.evidence.state]}</strong><p>{attendance.evidence.note}</p>{attendance.evidence.distanceMetres !== null && <p><b>{attendance.evidence.distanceMetres} m</b> recorded synthetic distance — not live tracking.</p>}<small>{attendance.history.length} preserved prior evidence record(s) · {attendance.assignmentId}</small>{attendance.history.map((item) => <details key={item.id}><summary>Original evidence · {item.evidence.state}</summary><p>{item.reason}</p><small>{item.evidence.note} · {item.actorId}</small></details>)}</article>;
}
