// Small timezone-aware date helpers built on Intl; no date library needed.

export function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

/** Calendar date (YYYY-MM-DD) of an instant in a named timezone. */
export function localDate(iso: string | number | Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(
    new Date(iso),
  );
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/** Exact, unambiguous timestamp in the event timezone, e.g. "Sat 3 Oct 2026, 00:40 IST". */
export function formatExact(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZoneName: 'short',
  }).format(new Date(iso));
}

export function formatDay(date: string) {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' }).format(
    new Date(`${date}T00:00:00Z`),
  );
}

export function formatTime(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(iso));
}

/** Friendly relative time; always shown next to the exact timestamp. */
export function relativeTime(iso: string, now: number) {
  const diff = Date.parse(iso) - now;
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (abs < 60_000) return 'just now';
  if (abs < 3_600_000) return rtf.format(Math.round(diff / 60_000), 'minute');
  if (abs < 86_400_000) return rtf.format(Math.round(diff / 3_600_000), 'hour');
  return rtf.format(Math.round(diff / 86_400_000), 'day');
}

function offsetMinutes(ms: number, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(ms));
  const n = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return (Date.UTC(n('year'), n('month') - 1, n('day'), n('hour'), n('minute'), n('second')) - Math.floor(ms / 1000) * 1000) / 60000;
}

/** "YYYY-MM-DDTHH:mm" wall-clock in the event timezone -> ISO instant. */
export function zonedToIso(local: string, timeZone: string) {
  const guess = Date.parse(`${local}:00Z`);
  if (Number.isNaN(guess)) return null;
  const first = guess - offsetMinutes(guess, timeZone) * 60000;
  return new Date(guess - offsetMinutes(first, timeZone) * 60000).toISOString();
}

/** ISO instant -> "YYYY-MM-DDTHH:mm" for a datetime-local input in the event timezone. */
export function isoToZonedLocal(iso: string, timeZone: string) {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return '';
  return new Date(ms + offsetMinutes(ms, timeZone) * 60000).toISOString().slice(0, 16);
}

/** ISO instant for a local wall-clock time in a fixed-offset zone such as "+05:30". */
export function at(date: string, time: string, offset: string) {
  return new Date(`${date}T${time}:00${offset}`).toISOString();
}
