const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function todayYmd() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function addDays(ymd, days) {
  const [y, m, d] = String(ymd).slice(0, 10).split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function isWeekend(ymd) {
  const [y, m, d] = String(ymd).slice(0, 10).split('-').map(Number);
  const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return day === 0 || day === 6;
}

export function isBusinessDay(ymd, holidays) {
  const value = String(ymd).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return !isWeekend(value) && !(holidays && holidays.has(value));
}

export function addBusinessDays(ymd, days, holidays) {
  let cursor = String(ymd).slice(0, 10);
  let added = 0;
  let guard = 0;
  while (added < days && guard < 400) {
    cursor = addDays(cursor, 1);
    guard += 1;
    if (isBusinessDay(cursor, holidays)) added += 1;
  }
  return cursor;
}

export function businessDaysUntil(ymd, holidays) {
  const today = todayYmd();
  if (!ymd) return 0;
  const target = String(ymd).slice(0, 10);
  let cursor = today;
  let count = 0;
  while (cursor < target && count < 400) {
    cursor = addDays(cursor, 1);
    if (isBusinessDay(cursor, holidays)) count += 1;
  }
  return cursor > target ? -1 : count;
}

export function formatYmd(ymd) {
  if (!ymd) return '';
  const [y, m, d] = String(ymd).slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return '';
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function firstOfMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

export function nextMonthDate(ymd) {
  const [y, m, d] = String(ymd).slice(0, 10).split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1 + 1, d));
  return date.toISOString().slice(0, 10);
}