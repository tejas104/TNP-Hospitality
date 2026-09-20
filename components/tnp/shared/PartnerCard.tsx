'use client';

import { useState } from 'react';
import {
  attributableMedia,
  inr,
  qualifiedPrice,
  verifiedRating,
  type PartnerEvidence,
} from '../access/partner-evidence';
import styles from './PartnerCard.module.css';

export type PartnerCardProps = {
  partner: PartnerEvidence;
  state?: 'ready' | 'selected' | 'loading' | 'unavailable' | 'error';
  reason?: string;
  actionLabel: string;
  onSelect: (id: string) => void;
  onRetry?: () => void;
};
// Presentation only: no queries, eligibility rules, ratings or availability inferred.
export function PartnerCard({
  partner,
  state = 'ready',
  reason,
  actionLabel,
  onSelect,
  onRetry,
}: PartnerCardProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const media = partner.media;
  const showMedia = attributableMedia(media) && media?.src !== failedSrc;
  return (
    <article
      className={`${styles.card} ux-product`}
      data-state={state}
      aria-busy={state === 'loading'}
    >
      <figure className={styles.media}>
        {showMedia && media ? (
          <img
            src={media.src}
            alt={media.alt}
            width="640"
            height="400"
            loading="lazy"
            decoding="async"
            onError={() => setFailedSrc(media.src)}
          />
        ) : (
          <div className={styles.fallback}>
            <span aria-hidden="true">TNP</span>
            <p>Image unavailable</p>
          </div>
        )}
        <figcaption>
          {showMedia && media
            ? `${media.relationship === 'partner-photo' ? 'Partner photo' : media.relationship === 'destination-context' ? 'Destination context — not a partner photo' : 'Illustrative image — not a partner photo'} · ${media.source} · ${media.rights}`
            : 'No attributable image is available for this preview.'}
        </figcaption>
      </figure>
      <div className={styles.content}>
        <p className="ux-caption">
          {partner.kind === 'venue' ? 'Venue' : 'TNP Planner'}
          {state === 'selected' ? ' · Selected ✓' : ''}
        </p>
        <h3>{partner.name}</h3>
        {partner.summary && <p>{partner.summary}</p>}
        <dl>
          {partner.location?.text && partner.location.source && (
            <>
              <dt>Location / service area</dt>
              <dd>
                {partner.location.text}
                <small>{partner.location.source}</small>
              </dd>
            </>
          )}
          {partner.capacity &&
            Number.isSafeInteger(partner.capacity.guests) &&
            partner.capacity.guests > 0 &&
            partner.capacity.qualifier &&
            partner.capacity.source && (
              <>
                <dt>Capacity</dt>
                <dd>
                  <span className="ux-numeric">{partner.capacity.guests}</span>{' '}
                  guests · {partner.capacity.qualifier}
                  <small>{partner.capacity.source}</small>
                </dd>
              </>
            )}
          {qualifiedPrice(partner.price) && partner.price && (
            <>
              <dt>{partner.price.qualifier}</dt>
              <dd>
                <span className="ux-numeric">
                  {inr(partner.price.minMinor)}
                  {partner.price.maxMinor !== undefined
                    ? ` – ${inr(partner.price.maxMinor)}`
                    : ''}
                </span>{' '}
                / {partner.price.unit}
                <small>
                  {partner.price.scope} · {partner.price.source}
                </small>
              </dd>
            </>
          )}
          {verifiedRating(partner.rating) && partner.rating && (
            <>
              <dt>Verified rating</dt>
              <dd>
                <span className="ux-numeric">
                  {partner.rating.value}/{partner.rating.scale} ·{' '}
                  {partner.rating.reviewCount} reviews
                </span>
                <small>
                  {partner.rating.source} · Verified by{' '}
                  {partner.rating.verifier}
                </small>
              </dd>
            </>
          )}
          {partner.recommendation?.text && partner.recommendation.source && (
            <>
              <dt>Recommendation</dt>
              <dd>
                {partner.recommendation.text}
                <small>{partner.recommendation.source}</small>
              </dd>
            </>
          )}
          {partner.qualification?.label && partner.qualification.issuer && (
            <>
              <dt>Qualification</dt>
              <dd>
                {partner.qualification.label}
                <small>Issued by {partner.qualification.issuer}</small>
              </dd>
            </>
          )}
          {partner.availability?.label && partner.availability.source && (
            <>
              <dt>Availability</dt>
              <dd>
                {partner.availability.label}
                <small>{partner.availability.source}</small>
              </dd>
            </>
          )}
        </dl>
        {(state === 'loading' ||
          state === 'unavailable' ||
          state === 'error') && (
          <p className={styles.status}>
            {reason ??
              (state === 'loading'
                ? 'Loading partner evidence…'
                : state === 'unavailable'
                  ? 'This option is unavailable.'
                  : 'Partner evidence could not be loaded.')}
          </p>
        )}
        {state === 'error' && onRetry ? (
          <button
            className="ux-action ux-action-secondary"
            type="button"
            onClick={onRetry}
          >
            Retry partner evidence
          </button>
        ) : (
          <button
            className="ux-action ux-action-primary"
            type="button"
            aria-pressed={state === 'selected'}
            disabled={
              state === 'loading' ||
              state === 'unavailable' ||
              state === 'error'
            }
            onClick={() => onSelect(partner.id)}
          >
            {state === 'selected' ? `Selected · ${actionLabel}` : actionLabel}
          </button>
        )}
      </div>
    </article>
  );
}
