// The security of payment framework for each Australian state and territory.
// Each Act sets its own response window, adjudication window and business day
// definition, so every deadline is counted under the job's own Act.

export const DEFAULT_JURISDICTION = 'VIC';

export const JURISDICTIONS = [
  {
    code: 'NSW',
    name: 'New South Wales',
    act: 'Building and Construction Industry Security of Payment Act 1999 (NSW)',
    scheduleDays: 10,
    applyDays: 10,
    noticeDays: 0,
    unit: 'business days',
    shutdowns: [['12-27', '12-31']],
  },
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
  {
    code: 'QLD',
    name: 'Queensland',
    act: 'Building Industry Fairness (Security of Payment) Act 2017 (Qld)',
    scheduleDays: 15,
    applyDays: 30,
    noticeDays: 0,
    unit: 'business days',
    shutdowns: [['12-22', '12-24'], ['12-27', '12-31'], ['01-02', '01-10']],
  },
  {
    code: 'WA',
    name: 'Western Australia',
    act: 'Building and Construction Industry (Security of Payment) Act 2021 (WA)',
    scheduleDays: 15,
    applyDays: 20,
    noticeDays: 0,
    unit: 'business days',
    shutdowns: [['12-22', '01-10']],
  },
  {
    code: 'SA',
    name: 'South Australia',
    act: 'Building and Construction Industry Security of Payment Act 2009 (SA)',
    scheduleDays: 15,
    applyDays: 15,
    noticeDays: 0,
    unit: 'business days',
    shutdowns: [['12-27', '12-31']],
  },
  {
    code: 'TAS',
    name: 'Tasmania',
    act: 'Building and Construction Industry Security of Payment Act 2009 (Tas)',
    scheduleDays: 10,
    applyDays: 10,
    noticeDays: 0,
    unit: 'business days',
    shutdowns: [['12-27', '12-31']],
  },
  {
    code: 'ACT',
    name: 'Australian Capital Territory',
    act: 'Building and Construction Industry (Security of Payment) Act 2009 (ACT)',
    scheduleDays: 10,
    applyDays: 10,
    noticeDays: 0,
    unit: 'business days',
    shutdowns: [['12-27', '12-31']],
  },
  {
    code: 'NT',
    name: 'Northern Territory',
    act: 'Construction Contracts (Security of Payments) Act 2004 (NT)',
    scheduleDays: 10,
    applyDays: 65,
    noticeDays: 0,
    unit: 'working days',
    shutdowns: [['12-25', '01-07']],
    note: 'The Northern Territory Act asks for a notice of dispute rather than a payment schedule.',
  },
];

export function jurisdictionFor(code: any) {
  return (
    JURISDICTIONS.find((entry) => entry.code === code) ||
    JURISDICTIONS.find((entry) => entry.code === DEFAULT_JURISDICTION)
  )!;
}

// Annual days the Act does not count as business days, as MM-DD ranges.
export function isShutdownDay(code: any, ymd: any): boolean {
  const jurisdiction = jurisdictionFor(code);
  const monthDay = String(ymd || '').slice(5, 10);
  if (!/^\d{2}-\d{2}$/.test(monthDay)) return false;
  return jurisdiction.shutdowns.some(([start, end]) =>
    start <= end ? monthDay >= start && monthDay <= end : monthDay >= start || monthDay <= end,
  );
}

export function daysLabel(jurisdiction: any, days: number): string {
  return `${days} ${jurisdiction.unit}`;
}