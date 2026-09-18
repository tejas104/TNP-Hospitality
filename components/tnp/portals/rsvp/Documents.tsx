'use client';

import { FileLock2, Lock, ShieldCheck } from 'lucide-react';
import { DOC_LABEL, type DocState } from './model';
import type { SectionProps } from './types';
import { StatePanel, Tag, WhyUnavailable, styles } from './ui';

const PREREQUISITES = [
  'Approved list of documents that are genuinely required, and who may review them',
  'Private object storage with encryption and short-lived authorized viewing links',
  'Malware scanning and file-type validation before anything is viewable',
  'Retention and deletion schedule, including post-event deletion',
  'Access audit for every view, download and export',
];

const QUEUES: Array<{ title: string; states: DocState[]; note: string }> = [
  { title: 'Requested', states: ['requested'], note: 'Asked for; nothing received yet.' },
  { title: 'Received — not verified', states: ['received'], note: 'A file arrived. Receiving a file is not identity verification.' },
  { title: 'Under review', states: ['under-review'], note: 'Staff must confirm the right person and event; ambiguous matches are never attached to a guessed guest.' },
  { title: 'Replacement required', states: ['replacement-required'], note: 'Rejected with a reason; guest asked for a replacement.' },
  { title: 'Retrieval problems', states: ['download-pending', 'download-failed'], note: 'Failed media retrieval is not “received”; it stays here until retried.' },
  { title: 'Accepted', states: ['accepted'], note: 'Reviewed and accepted for its stated purpose only.' },
  { title: 'Expired or deleted', states: ['expired', 'deleted'], note: 'Removed under the retention policy.' },
];

export function DocumentsSection({ data, rows }: SectionProps) {
  const partyOf = (id: string) => rows.find((r) => r.party.id === id);

  if (data.documents.length === 0) {
    return (
      <div className={styles.stack}>
        <StatePanel tone="locked" title="Document collection is disabled by policy">
          <p>This event does not collect guest documents. Nothing can be uploaded, requested or stored here, and no guest is asked for identity documents.</p>
        </StatePanel>
        <Prerequisites />
      </div>
    );
  }

  return (
    <div className={styles.stack}>
      <p className={styles.notice}>
        <Lock size={16} aria-hidden /> Synthetic metadata only. No files exist in this preview and none can be uploaded or viewed. Document identifiers never appear in reports, driver or hotel views.
      </p>
      <div className={styles.docQueues}>
        {QUEUES.map((q) => {
          const items = data.documents.filter((d) => q.states.includes(d.state));
          return (
            <section key={q.title} className={styles.panel} aria-labelledby={`dq-${q.title}`}>
              <h2 id={`dq-${q.title}`}>
                <FileLock2 size={17} aria-hidden /> {q.title} ({items.length})
              </h2>
              <p className={styles.meta}>{q.note}</p>
              {items.length > 0 && (
                <ul className={styles.plainList}>
                  {items.map((d) => (
                    <li key={d.id} className={styles.transferRow}>
                      <span className={styles.wrap}>
                        {partyOf(d.partyId)?.party.displayName} · {d.purpose.replace('-', ' ')}
                      </span>
                      <Tag tone={d.state === 'accepted' ? 'good' : d.state === 'download-failed' || d.state === 'replacement-required' ? 'bad' : 'warn'}>{DOC_LABEL[d.state]}</Tag>
                      <WhyUnavailable label="Why no review actions?">Review needs private storage, scanning and access controls that are not implemented. This is metadata only.</WhyUnavailable>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
      <Prerequisites />
    </div>
  );
}

function Prerequisites() {
  return (
    <section className={styles.panel} aria-labelledby="doc-prereq">
      <h2 id="doc-prereq">
        <ShieldCheck size={18} aria-hidden /> Required before real documents
      </h2>
      <ul className={styles.plainList}>
        {PREREQUISITES.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </section>
  );
}
