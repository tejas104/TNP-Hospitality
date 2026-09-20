export type PartnerEvidence = {
  id: string;
  kind: 'venue' | 'tnp-planner';
  name: string;
  summary?: string;
  location?: { text: string; source: string };
  media?: {
    src: string;
    alt: string;
    source: string;
    relationship: 'partner-photo' | 'destination-context' | 'illustrative';
    rights: string;
  };
  capacity?: { guests: number; qualifier: string; source: string };
  price?: {
    minMinor: number;
    maxMinor?: number;
    qualifier: string;
    unit: string;
    scope: string;
    source: string;
  };
  rating?: {
    value: number;
    scale: number;
    reviewCount: number;
    source: string;
    verifier: string;
  };
  recommendation?: { text: string; source: string };
  qualification?: { label: string; issuer: string };
  availability?: { label: string; source: string };
};

const text = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;
const positive = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;
export function verifiedRating(value: PartnerEvidence['rating']) {
  return (
    !!value &&
    positive(value.value) &&
    positive(value.scale) &&
    value.value <= value.scale &&
    Number.isSafeInteger(value.reviewCount) &&
    value.reviewCount > 0 &&
    text(value.source) &&
    text(value.verifier)
  );
}
export function qualifiedPrice(value: PartnerEvidence['price']) {
  return (
    !!value &&
    Number.isSafeInteger(value.minMinor) &&
    value.minMinor >= 0 &&
    (value.maxMinor === undefined ||
      (Number.isSafeInteger(value.maxMinor) &&
        value.maxMinor >= value.minMinor)) &&
    [value.qualifier, value.unit, value.scope, value.source].every(text)
  );
}
export function attributableMedia(value: PartnerEvidence['media']) {
  return (
    !!value &&
    [value.src, value.alt, value.source, value.rights].every(text) &&
    ['partner-photo', 'destination-context', 'illustrative'].includes(
      value.relationship,
    ) &&
    /^(https:\/\/|\/(?!\/))/.test(value.src)
  );
}
export function inr(minor: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(minor / 100);
}
