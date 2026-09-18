'use client';

import { Ban, Eye, MessageSquareText, PhoneCall, Send, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { formatExact } from './dates';
import { DELIVERY_LABEL, type DeliveryState, type MessageTemplate, type ProviderGate } from './model';
import type { SectionProps } from './types';
import { Modal, Tag, WhyUnavailable, styles } from './ui';

const GATE_TONE: Record<ProviderGate['state'], 'good' | 'warn' | 'bad' | 'muted'> = { complete: 'good', 'in-progress': 'warn', blocked: 'bad', 'not-started': 'muted' };
const GATE_LABEL: Record<ProviderGate['state'], string> = { complete: 'Complete', 'in-progress': 'In progress', blocked: 'Blocked', 'not-started': 'Not started' };
const APPROVAL_LABEL: Record<MessageTemplate['approval'], string> = { 'not-submitted': 'Not submitted', submitted: 'Submitted — awaiting', approved: 'Approved (sample)', rejected: 'Rejected (sample)' };
const DELIVERY_ORDER: DeliveryState[] = ['queued', 'submitted', 'sent', 'delivered', 'read', 'failed', 'uncertain'];

type Audience = 'awaiting' | 'no-response' | 'all-issued';

export function MessagingSection({ data, rows, org, go, canView }: SectionProps) {
  const tz = data.event.timezone;
  const [templateId, setTemplateId] = useState(data.templates[0]?.id ?? '');
  const [audience, setAudience] = useState<Audience>('awaiting');
  const [previewOpen, setPreviewOpen] = useState(false);
  const template = data.templates.find((t) => t.id === templateId);
  const liveReady = data.gates.every((g) => g.state === 'complete');

  // Audience and exclusions come from the same records as the directory.
  const candidates = rows.filter((r) => (audience === 'awaiting' ? r.statusCounts.awaiting > 0 : audience === 'no-response' ? r.party.contact === 'no-response' : r.party.invitation === 'issued'));
  const exclusions = [
    { label: 'Declined contact on a call (treated as opt-out)', list: candidates.filter((r) => r.party.calls[0]?.outcome === 'declined-contact') },
    { label: 'No phone number', list: candidates.filter((r) => !r.party.phone) },
    { label: 'Delivery uncertain — reconcile before any resend', list: candidates.filter((r) => r.party.delivery === 'uncertain') },
  ];
  const excluded = new Set(exclusions.flatMap((e) => e.list.map((r) => r.party.id)));
  const eligible = candidates.filter((r) => !excluded.has(r.party.id));
  const failed = rows.filter((r) => r.party.delivery === 'failed' || r.party.delivery === 'uncertain');
  const counts = DELIVERY_ORDER.map((s) => [s, data.messages.filter((m) => m.state === s).length] as const);

  if (!data.templates.length) {
    return (
      <section className={styles.panel}>
        <h2>Messaging details are not shown for your role</h2>
      </section>
    );
  }

  return (
    <div className={styles.stack}>
      <section className={`${styles.panel} ${styles.warnPanel}`} aria-labelledby="provider-h">
        <h2 id="provider-h">
          <ShieldAlert size={18} aria-hidden /> WhatsApp is not connected
        </h2>
        <p>
          Live sending is disabled. These are separate external approvals; each must be complete before anything is sent, and no approval timing is promised. Sender identity would be <strong>{org.name}</strong>.
        </p>
        <ol className={styles.gateList}>
          {data.gates.map((g) => (
            <li key={g.id}>
              <span className={styles.wrap}>
                <strong>{g.label}</strong>
                <span className={styles.meta}> {g.note}</span>
              </span>
              <Tag tone={GATE_TONE[g.state]}>{GATE_LABEL[g.state]}</Tag>
            </li>
          ))}
        </ol>
        <p className={styles.meta}>Manual fallback remains available: calling queue and the web RSVP link.</p>
      </section>

      <div className={styles.twoCol}>
        <section className={styles.panel} aria-labelledby="templates-h">
          <h2 id="templates-h">
            <MessageSquareText size={18} aria-hidden /> Templates
          </h2>
          <ul className={styles.templateList}>
            {data.templates.map((t) => (
              <li key={t.id}>
                <label className={styles.templateChoice}>
                  <input type="radio" name="template" checked={t.id === templateId} onChange={() => setTemplateId(t.id)} />
                  <span className={styles.wrap}>
                    <strong>{t.name}</strong>
                    <span className={styles.meta}>
                      {t.purpose} · {t.language}
                    </span>
                  </span>
                  <Tag tone={t.approval === 'approved' ? 'good' : t.approval === 'rejected' ? 'bad' : t.approval === 'submitted' ? 'warn' : 'muted'}>{APPROVAL_LABEL[t.approval]}</Tag>
                </label>
              </li>
            ))}
          </ul>
          <p className={styles.meta}>Template approval states are synthetic samples, not provider records.</p>
        </section>

        <section className={styles.panel} aria-labelledby="campaign-h">
          <h2 id="campaign-h">Campaign preview</h2>
          <label className={styles.field}>
            <span>Audience</span>
            <select value={audience} onChange={(e) => setAudience(e.target.value as Audience)}>
              <option value="awaiting">Parties with people awaiting confirmation</option>
              <option value="no-response">Parties with no response</option>
              <option value="all-issued">All invited parties</option>
            </select>
          </label>
          <p>
            <strong>{eligible.length}</strong> eligible parties ({eligible.reduce((s, r) => s + r.people, 0)} people) · {excluded.size} excluded
          </p>
          <ul className={styles.plainList}>
            {exclusions.map((e) => (
              <li key={e.label}>
                <Ban size={13} aria-hidden /> {e.list.length} · {e.label}
              </li>
            ))}
          </ul>
          <p className={styles.meta}>Consent and opt-out: no provider opt-out records exist in this synthetic sample. Opted-out or ineligible recipients would always stay excluded.</p>
          <div className={styles.inlineActions}>
            <button type="button" className={styles.btnSecondary} onClick={() => setPreviewOpen(true)} disabled={!template}>
              <Eye size={15} aria-hidden /> Preview message
            </button>
            <button type="button" className={styles.btnPrimary} disabled aria-describedby="send-why">
              <Send size={15} aria-hidden /> Schedule send
            </button>
          </div>
          <p id="send-why" className={styles.meta}>
            {liveReady ? 'Sending requires the reviewed provider integration.' : 'Unavailable: WhatsApp verification, sender, template approval, integration and UAT are not all complete.'}
          </p>
        </section>
      </div>

      <section className={styles.panel} aria-labelledby="timeline-h">
        <h2 id="timeline-h">Delivery timeline (synthetic sample)</h2>
        <p className={styles.meta}>Sample states only — not provider evidence. Delivered or read never means an RSVP was confirmed.</p>
        <ol className={styles.deliveryTrack} aria-label="Messages per delivery state">
          {counts.map(([s, n]) => (
            <li key={s} className={s === 'failed' || s === 'uncertain' ? styles.deliveryBad : ''}>
              <strong>{n}</strong>
              <span>{DELIVERY_LABEL[s]}</span>
            </li>
          ))}
        </ol>
        <p className={styles.meta}>Sample invitation batch dated {data.messages[0] ? formatExact(data.messages[0].at, tz) : '—'}.</p>
      </section>

      <section className={styles.panel} aria-labelledby="fallback-h">
        <h2 id="fallback-h">Failed and uncertain ({failed.length})</h2>
        <p className={styles.meta}>A failure is not a decline, and an uncertain delivery is not treated as safe to retry. Use a manual fallback.</p>
        {failed.length === 0 ? (
          <p>No failed or uncertain deliveries.</p>
        ) : (
          <ul className={styles.plainList}>
            {failed.slice(0, 12).map((r) => (
              <li key={r.party.id} className={styles.transferRow}>
                <span className={styles.wrap}>
                  {r.party.displayName} <span className={styles.meta}>{r.party.ref}</span>
                </span>
                <Tag tone={r.party.delivery === 'failed' ? 'bad' : 'warn'}>{DELIVERY_LABEL[r.party.delivery]}</Tag>
                {canView('calls') ? (
                  <button type="button" className={styles.btnGhost} onClick={() => go('calls', { party: r.party.id })}>
                    <PhoneCall size={14} aria-hidden /> Call instead
                  </button>
                ) : (
                  <WhyUnavailable>Your role does not work the calling queue.</WhyUnavailable>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <Modal open={previewOpen} title={`Preview: ${template?.name ?? ''}`} onClose={() => setPreviewOpen(false)} description="Rendered with sample values. Previewing sends nothing.">
        {template && (
          <div className={styles.stack}>
            <div className={styles.messageBubble} lang={template.language === 'Hindi' ? 'hi' : 'en'}>
              {render(template.body, { guest: eligible[0]?.party.displayName ?? 'Sample guest', hosts: data.event.hosts, event: data.event.name, link: '[restricted RSVP link]', hotel: '[hotel]', room: '[room]', dates: '[dates]' })}
            </div>
            <p className={styles.meta}>
              Sender: {org.name} (not connected). Language: {template.language}. Approval: {APPROVAL_LABEL[template.approval]}.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

function render(body: string, values: Record<string, string>) {
  return body.replace(/\{\{(\w+)\}\}/g, (_, k: string) => values[k] ?? `{{${k}}}`);
}
