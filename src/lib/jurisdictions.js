// The security of payment framework the app works under: Victoria only.
// TradeClaim is limited to Victorian jobs, so every deadline is counted under
// the Building and Construction Industry Security of Payment Act 2002 (Vic).

export const DEFAULT_JURISDICTION = 'VIC';

export const JURISDICTIONS = [
  {
    code: 'VIC',
    name: 'Victoria',
    act: 'Building and Construction Industry Security of Payment Act 2002 (Vic)',
    scheduleDays: 10,
    applyDays: 10,
    noticeDays: 2,
    unit: 'business days',
    shutdowns: [['12-22', '01-10']],
  },
];

export function jurisdictionFor(code) {
  return (
    JURISDICTIONS.find((entry) => entry.code === code) ||
    JURISDICTIONS.find((entry) => entry.code === DEFAULT_JURISDICTION)
  );
}

// Annual days the Act does not count as business days, as MM-DD ranges.
export function isShutdownDay(code, ymd) {
  const jurisdiction = jurisdictionFor(code);
  const monthDay = String(ymd || '').slice(5, 10);
  if (!/^\d{2}-\d{2}$/.test(monthDay)) return false;
  return jurisdiction.shutdowns.some(([start, end]) =>
    start <= end ? monthDay >= start && monthDay <= end : monthDay >= start || monthDay <= end,
  );
}

export function daysLabel(jurisdiction, days) {
  return `${days} ${jurisdiction.unit}`;
}

const STATE_ALIASES = {
  vic: 'VIC',
  victoria: 'VIC',
  melbourne: 'VIC',
};

export function stateCodeFromText(text) {
  const key = String(text || '').trim().toLowerCase();
  if (STATE_ALIASES[key]) return STATE_ALIASES[key];
  const found = JURISDICTIONS.find((entry) => key.includes(entry.name.toLowerCase()) || key.includes(entry.code.toLowerCase()));
  return found ? found.code : DEFAULT_JURISDICTION;
}