// Date and business day arithmetic for the statutory clock.
// All values are plain YYYY-MM-DD strings so timezones cannot shift a deadline.
// Public holidays are stored per state, and each Act also leaves out the days of
// its own end of year shutdown, so the state is part of every count.

import { isShutdownDay, jurisdictionFor, DEFAULT_JURISDICTION } from './jurisdictions.ts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function parseYmd(value: string): number[] {
  const parts = String(value || '').slice(0, 10).split('-');
  return [Number(parts[0]), Number(parts[1]), Number(parts[2])];
}

export function toYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDaysYmd(value: string, days: number): string {
  const [y, m, d] = parseYmd(value);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

export function isWeekend(value: string): boolean {
  const [y, m, d] = parseYmd(value);
  const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return day === 0 || day === 6;
}

export function isBusinessDay(value: string, holidays: Set<string>, state?: string): boolean {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(String(value).slice(0, 10))) return false;
  const day = String(value).slice(0, 10);
  if (isWeekend(day) || isShutdownDay(state, day)) return false;
  return !holidays.has(day);
}

export function addBusinessDays(value: string, days: number, holidays: Set<string>, state?: string): string {
  let cursor = String(value).slice(0, 10);
  let added = 0;
  let guard = 0;
  while (added < days && guard < 600) {
    cursor = addDaysYmd(cursor, 1);
    guard += 1;
    if (isBusinessDay(cursor, holidays, state)) added += 1;
  }
  return cursor;
}

export function businessDaysBetween(from: string, to: string, holidays: Set<string>, state?: string): number {
  let cursor = String(from).slice(0, 10);
  const end = String(to).slice(0, 10);
  let count = 0;
  let guard = 0;
  while (cursor < end && guard < 800) {
    cursor = addDaysYmd(cursor, 1);
    guard += 1;
    if (isBusinessDay(cursor, holidays, state)) count += 1;
  }
  return count;
}

export function formatYmdAu(value: string): string {
  if (!value) return '';
  const [y, m, d] = parseYmd(value);
  if (!y || !m || !d) return '';
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function formatAud(value: number): string {
  const n = Number(value || 0);
  const hasCents = Math.round(Math.abs(n) * 100) % 100 !== 0;
  return 'A$' + n.toLocaleString('en-AU', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  });
}

export async function loadHolidaySet(base44: any, state?: string): Promise<Set<string>> {
  const code = state ? jurisdictionFor(state).code : DEFAULT_JURISDICTION;
  const page = await base44.entities.PublicHoliday.filter({ state: code }, { limit: 500, sort: 'date' });
  const items = page && page.items ? page.items : [];
  return new Set(items.map((h: any) => h.date));
}