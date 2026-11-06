// The one job the public demo page walks through without an account. The
// seeded jobs for a signed in account live in seedJobs.js.

const round2 = (value) => Math.round(Number(value || 0) * 100) / 100;

export const DEMO_JOB = {
  job_number: '0142',
  name: 'Level 3 apartments repaint',
  site_address: '18 Sturt Street, Southbank VIC 3006',
  builder_name: 'Hutchinson Builders',
  builder_email: 'estimating@example.com',
  retention_percent: 5,
  quote_status: 'final',
};

const RAW_LINES = [
  { area: 'Level 3 apartments', description: 'Set and stop plasterboard to walls and ceilings', quantity: 420, unit: 'm2', rate: 18.5 },
  { area: 'Level 3 apartments', description: 'Three coat paint finish to walls, low sheen', quantity: 640, unit: 'm2', rate: 12.4 },
  { area: 'Level 3 apartments', description: 'Paint ceilings, flat white', quantity: 380, unit: 'm2', rate: 11.2 },
  { area: 'Stair 2', description: 'Cornice, 90mm, set and paint', quantity: 96, unit: 'lm', rate: 14.5 },
  { area: 'Stair 2', description: 'Two pack finish to door frames', quantity: 24, unit: 'no', rate: 85 },
];

export const DEMO_LINES = RAW_LINES.map((line, index) => ({
  ...line,
  amount: round2(line.quantity * line.rate),
  sort_order: index + 1,
}));

export const DEMO_CONTRACT_SUM = round2(DEMO_LINES.reduce((total, line) => total + line.amount, 0));