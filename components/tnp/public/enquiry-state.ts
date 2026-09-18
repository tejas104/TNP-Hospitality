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
