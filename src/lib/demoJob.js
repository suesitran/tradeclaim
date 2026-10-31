import { base44 } from '@/api/base44Client';
import { addDays, todayYmd } from '@/lib/clock';

const round2 = (value) => Math.round(Number(value || 0) * 100) / 100;

const DEMO_LINES = [
  { area: 'Level 3 apartments', description: 'Set and stop plasterboard to walls and ceilings', quantity: 420, unit: 'm2', rate: 18.5 },
  { area: 'Level 3 apartments', description: 'Three coat paint finish to walls, low sheen', quantity: 640, unit: 'm2', rate: 12.4 },
  { area: 'Level 3 apartments', description: 'Paint ceilings, flat white', quantity: 380, unit: 'm2', rate: 11.2 },
  { area: 'Stair 2', description: 'Cornice, 90mm, set and paint', quantity: 96, unit: 'lm', rate: 14.5 },
  { area: 'Stair 2', description: 'Two pack finish to door frames', quantity: 24, unit: 'no', rate: 85 },
];

export async function createDemoJob() {
  const today = todayYmd();
  const lines = DEMO_LINES.map((line, index) => ({
    ...line,
    amount: round2(line.quantity * line.rate),
    sort_order: index + 1,
  }));

  const job = await base44.entities.Job.create({
    job_number: '0142',
    name: 'Level 3 apartments repaint',
    site_address: '18 Sturt Street, Southbank VIC 3006',
    state: 'VIC',
    builder_name: 'Hutchinson Builders',
    builder_email: 'estimating@example.com',
    contract_sum_ex_gst: round2(lines.reduce((total, line) => total + line.amount, 0)),
    claim_period: 'monthly',
    retention_percent: 5,
    next_claim_date: today,
    dlp_end_date: addDays(today, 365),
    quote_status: 'final',
  });

  await base44.entities.ScopeLine.bulkCreate(
    lines.map((line) => ({ ...line, job_id: job.id, percent_complete_to_date: 0 })),
  );

  await base44.entities.Variation.create({
    job_id: job.id,
    instructed_by: 'Site manager, Dan Petrov',
    description: 'Extra coat to fire stair walls after new penetration',
    estimated_amount: 1850,
    status: 'sent',
    sent_at: new Date().toISOString(),
  });

  return job;
}