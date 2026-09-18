'use client';

import { AlertOctagon, CheckCircle2, Circle, Clock3, MinusCircle, RefreshCcw } from 'lucide-react';
import { formatDay, localDate } from './dates';
import { buildCalendar, type CalendarStatus } from './logic';
import type { SectionProps } from './types';
import { Tag, styles } from './ui';

const STATUS: Record<CalendarStatus, { label: string; tone: 'good' | 'bad' | 'warn' | 'info' | 'muted' | 'neutral'; icon: typeof Circle }> = {
  complete: { label: 'Complete', tone: 'good', icon: CheckCircle2 },
  overdue: { label: 'Overdue', tone: 'bad', icon: AlertOctagon },
  'due-today': { label: 'Due today', tone: 'warn', icon: Clock3 },
  'due-soon': { label: 'Due soon', tone: 'info', icon: Clock3 },
  upcoming: { label: 'Upcoming', tone: 'neutral', icon: Circle },
  revised: { label: 'Revised proposal', tone: 'info', icon: RefreshCcw },
  'not-applicable': { label: 'Not applicable', tone: 'muted', icon: MinusCircle },
};

export function CalendarSection({ data, rows, now }: SectionProps) {
  const today = localDate(now, data.event.timezone);
  const { tasks, lateOnboarding } = buildCalendar(data, rows, today);
  return (
    <div className={styles.stack}>
      <div className={styles.sectionHead}>
        <h2>T-30 to after the event</h2>
        <p className={styles.meta}>
          Event-operation dates for {data.event.name}, counted back from {formatDay(data.event.startsOn)}. Status is derived from the current records; milestones never send messages by themselves.
        </p>
      </div>
      {lateOnboarding && (
        <div className={styles.notice} role="note">
          <RefreshCcw size={16} aria-hidden />
          <p>
            <strong>Late onboarding — revised proposed schedule.</strong> This engagement started on {formatDay(data.event.onboardedOn)}, after T-30. Missed milestones are
            re-spread from onboarding as a proposal for staff approval. Overdue invitations or reminders are not sent automatically.
          </p>
        </div>
      )}
      <ol className={styles.timeline}>
        {tasks.map((t) => {
          const s = STATUS[t.status];
          const Icon = s.icon;
          return (
            <li key={t.id} className={`${styles.timelineItem} ${styles[`tl_${t.status}`] ?? ''}`}>
              <span className={styles.timelineMarker} aria-hidden>
                <Icon size={16} />
              </span>
              <div className={styles.timelineBody}>
                <p className={styles.timelineOffset}>
                  {t.offsetLabel} · {t.revisedDue ? (
                    <>
                      <s>{formatDay(t.due)}</s> <span>proposed {formatDay(t.revisedDue)}</span>
                    </>
                  ) : (
                    formatDay(t.due)
                  )}
                </p>
                <h3>{t.title}</h3>
                <div className={styles.timelineTags}>
                  <Tag tone={s.tone}>{s.label}</Tag>
                  {t.escalation !== 'none' && <Tag tone={t.escalation === 'escalated' ? 'bad' : 'warn'}>{t.escalation === 'escalated' ? 'Escalated' : 'Watch'}</Tag>}
                </div>
                <dl className={styles.facts}>
                  <div>
                    <dt>Owner</dt>
                    <dd>{t.owner}</dd>
                  </div>
                  <div>
                    <dt>Related</dt>
                    <dd>
                      {t.related} {t.relatedLabel}
                    </dd>
                  </div>
                  <div>
                    <dt>Prerequisite</dt>
                    <dd>{t.prerequisite}</dd>
                  </div>
                  <div>
                    <dt>Next action</dt>
                    <dd>{t.nextAction}</dd>
                  </div>
                </dl>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
