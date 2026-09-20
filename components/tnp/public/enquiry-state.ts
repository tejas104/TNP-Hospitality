import type {
  Enquiry,
  MutationRequest,
} from '../../../lib/contracts/preview.ts';

export const ENQUIRY_JOURNAL = 'tnp-public-enquiry-v1';
export type EnquiryAction = {
  request: MutationRequest<'submitEnquiry'>;
  receiptId?: string;
};
export function validateEnquiry(payload: {
  name: string;
  email: string;
  message: string;
}) {
  const errors: Record<string, string> = {};
  if (!payload.name.trim() || payload.name.length > 100)
    errors.name = 'Enter a sample name of 1–100 characters.';
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email) ||
    payload.email.length > 254
  )
    errors.email = 'Enter a sample email such as guest@example.com.';
  if (!payload.message.trim() || payload.message.length > 2000)
    errors.message = 'Enter a sample message of 1–2,000 characters.';
  return errors;
}
export function readEnquiryAction(raw: string | null): EnquiryAction | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as EnquiryAction;
    const request = value?.request;
    if (
      !request ||
      request.operation !== 'submitEnquiry' ||
      request.actorId !== 'tnp-public-preview' ||
      typeof request.requestKey !== 'string' ||
      !request.requestKey.startsWith('public-enquiry:') ||
      !Number.isInteger(request.expectedGeneration) ||
      request.expectedGeneration < 0
    )
      return null;
    if (
      !request.payload ||
      ['name', 'email', 'message'].some(
        (key) =>
          typeof (request.payload as Record<string, unknown>)[key] !== 'string',
      )
    )
      return null;
    if (
      Object.keys(validateEnquiry(request.payload)).length ||
      (value.receiptId !== undefined && typeof value.receiptId !== 'string')
    )
      return null;
    return value;
  } catch {
    return null;
  }
}
export function matchesEnquiry(action: EnquiryAction, record: Enquiry) {
  return (
    record.id === action.receiptId &&
    record.sentExternally === false &&
    record.name === action.request.payload.name &&
    record.email === action.request.payload.email &&
    record.message === action.request.payload.message
  );
}

export const ENQUIRY_PRODUCTS = [
  'Hospitality workforce',
  'Venue',
  'TNP Planner',
  'RSVP',
] as const;
export const WORKFORCE_ROLES = [
  'Event Coordinator',
  'Event Executive',
  'Hostess',
  'Volunteer',
  'Porter',
] as const;
export type RequestBrief = {
  mode: 'event' | 'talk';
  products: string[];
  occasion: string;
  date: string;
  city: string;
  guests: string;
  requester: string;
  billing: string;
  ownVenue: boolean;
  ownPlanner: boolean;
  quantities: Record<string, string>;
};
export function briefMessage(brief: RequestBrief, message: string) {
  if (brief.mode === 'talk') return 'General conversation\n' + message.trim();
  const roles = brief.products.includes('Hospitality workforce')
    ? WORKFORCE_ROLES.filter((r) => Number(brief.quantities[r]) > 0)
        .map((r) => r + ': ' + brief.quantities[r])
        .join(', ')
    : '';
  return [
    'Event request',
    'Products: ' + (brief.products.join(', ') || 'Discuss with TNP'),
    'Occasion: ' + brief.occasion,
    'Date: ' + (brief.date || 'To discuss'),
    'City: ' + brief.city,
    'Guests: ' + (brief.guests || 'To discuss'),
    'Requesting for: ' + brief.requester,
    'Billing organization (proposed): ' + (brief.billing || 'To discuss'),
    brief.ownVenue ? 'I already have a venue' : '',
    brief.ownPlanner ? 'I have my own planner' : '',
    roles,
    message.trim(),
  ]
    .filter(Boolean)
    .join('\n');
}
export function validateBrief(brief: RequestBrief) {
  const errors: Record<string, string> = {};
  if (brief.mode === 'talk') return errors;
  if (!brief.occasion.trim()) errors.occasion = 'Add a sample occasion.';
  if (!brief.city.trim()) errors.city = 'Add a sample city.';
  if (
    brief.guests &&
    (!/^\d+$/.test(brief.guests) || +brief.guests < 1 || +brief.guests > 100000)
  )
    errors.guests = 'Use a guest estimate from 1 to 100,000.';
  if (brief.products.includes('Hospitality workforce'))
    for (const role of WORKFORCE_ROLES) {
      const n = brief.quantities[role];
      if (n && (!/^\d+$/.test(n) || +n > 10000))
        errors.quantities =
          'Role quantities must be whole numbers from 0 to 10,000.';
    }
  return errors;
}
