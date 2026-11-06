// The three demo jobs from the build spec, section 3.7. One in each claim state
// the demo needs: scheduled short, ignored, and paid after escalation. Builder
// names and emails are placeholders for the public demo. Photos are not seeded;
// they are captured on a real site through the app.

import { base44 } from '@/api/base44Client';
import { addBusinessDays, addDays, isBusinessDay, todayYmd } from '@/lib/clock';
import { DEFAULT_JURISDICTION, jurisdictionFor } from '@/lib/jurisdictions';

const round2 = (value) => Math.round(Number(value || 0) * 100) / 100;

function line(area, description, quantity, unit, rate) {
  return { area, description, quantity, unit, rate, amount: round2(quantity * rate) };
}

// Walks back one business day at a time, the mirror of addBusinessDays.
function businessDaysAgo(days, holidays, state) {
  let cursor = todayYmd();
  let counted = 0;
  while (counted < days) {
    cursor = addDays(cursor, -1);
    if (isBusinessDay(cursor, holidays, state)) counted += 1;
  }
  return cursor;
}

// Job A: a real sized painting quote, 28 lines. Claim 1 is the six L1 corridor
// and lobby lines, which add up to exactly A$40,000 excluding GST.
const JOB_A = {
  job: {
    job_number: '0447',
    name: 'L1 and L2 apartments, repaint',
    site_address: '18 Cremorne Street, Richmond VIC 3121',
    builder_name: 'Corvus Construction',
    builder_email: 'claims@example.com',
    retention_percent: 5,
  },
  lines: [
    line('L1 Apartments', 'Prepare and paint plasterboard walls PT1 low sheen to schedule', 2650, 'm2', 12.1),
    line('L1 Apartments', 'Prepare and paint ceilings PT4 flat white', 980, 'm2', 13.9),
    line('L1 Apartments', 'Paint doors frames and trims enamel', 168, 'no', 132),
    line('L1 Apartments', 'Paint wet area ceilings moisture resistant', 210, 'm2', 16.4),
    line('L1 Apartments', 'Feature walls two pack finish', 180, 'm2', 24.5),
    line('L1 Apartments', 'Seal and paint skirtings and architraves', 1420, 'lm', 8.4),
    line('L1 Apartments', 'Paint balcony soffits weathershield', 260, 'm2', 18.2),
    line('L1 Corridors', 'Prepare and paint walls PT1 low sheen', 1240, 'm2', 12.5),
    line('L1 Corridors', 'Prepare and paint ceilings PT4 flat', 420, 'm2', 14.8),
    line('L1 Corridors', 'Paint doors and frames enamel', 46, 'no', 145),
    line('L1 Lobby', 'Feature ceiling two pack to detail', 120, 'm2', 32),
    line('L1 Lobby', 'Wall protection clear sealer', 260, 'm2', 11.2),
    line('L1 Lobby', 'Protection of finished surfaces during fitout', 1, 'item', 4862),
    line('L2 Apartments', 'Prepare and paint plasterboard walls PT1 low sheen to schedule', 2650, 'm2', 12.1),
    line('L2 Apartments', 'Prepare and paint ceilings PT4 flat white', 980, 'm2', 13.9),
    line('L2 Apartments', 'Paint doors frames and trims enamel', 168, 'no', 132),
    line('L2 Apartments', 'Paint wet area ceilings moisture resistant', 210, 'm2', 16.4),
    line('L2 Apartments', 'Seal and paint skirtings and architraves', 1420, 'lm', 8.4),
    line('L2 Corridors', 'Prepare and paint walls PT1 low sheen', 980, 'm2', 12.5),
    line('L2 Corridors', 'Prepare and paint ceilings PT4 flat', 360, 'm2', 14.8),
    line('L2 Corridors', 'Paint doors and frames enamel', 38, 'no', 145),
    line('Stair 1', 'Prepare and paint walls and ceilings low sheen', 460, 'm2', 15.6),
    line('Stair 1', 'Paint handrails and balustrades enamel', 96, 'lm', 12),
    line('Stair 2', 'Prepare and paint walls and ceilings low sheen', 460, 'm2', 15.6),
    line('Stair 2', 'Paint handrails and balustrades enamel', 96, 'lm', 12),
    line('External', 'Paint soffits and fascias weathershield', 320, 'm2', 19.8),
    line('Allowance', 'Protection of finished surfaces all levels', 1, 'item', 4800),
    line('Allowance', 'Site clean and touch up before handover', 1, 'item', 6200),
  ],
  claimedAreas: ['L1 Corridors', 'L1 Lobby'],
};

// Job B: a small stair repaint. Claim 1 of A$10,800 was served 11 business days
// ago and no schedule has arrived, so the clock has run out.
const JOB_B = {
  job: {
    job_number: '0451',
    name: 'Stair 1 and plant room, repaint',
    site_address: '71 Lorimer Street, Docklands VIC 3008',
    builder_name: 'Harbourline Projects',
    builder_email: 'accounts@example.com',
    retention_percent: 5,
  },
  lines: [
    line('Stair 1', 'Prepare and paint walls and ceilings low sheen', 460, 'm2', 15.6),
    line('Stair 1', 'Paint doors and frames enamel', 12, 'no', 145),
    line('Stair 1', 'Paint handrails and balustrades enamel', 157, 'lm', 12),
  ],
  claimedAreas: ['Stair 1'],
};

// Job C: a fitout near the end of its run. Claims 1 to 5 were paid on schedule.
// Claim 6 was scheduled A$6,000 short, taken to adjudication and then paid in
// full, so the fee line reads A$180. Retention is still held, with the defects
// liability period ending two months from today.
const JOB_C = {
  job: {
    job_number: '0432',
    name: 'Ground floor retail fitout, paint',
    site_address: '400 Collins Street, Melbourne VIC 3000',
    builder_name: 'Stonefield Interiors',
    builder_email: 'payments@example.com',
    retention_percent: 5,
  },
  lines: [
    line('Tenancy 1', 'Prepare and paint plasterboard walls low sheen', 1860, 'm2', 12.4),
    line('Tenancy 1', 'Prepare and paint ceilings flat white', 720, 'm2', 13.9),
    line('Tenancy 1', 'Paint doors frames and trims enamel', 64, 'no', 138),
    line('Tenancy 1', 'Feature walls two pack finish', 140, 'm2', 26),
    line('Tenancy 2', 'Prepare and paint plasterboard walls low sheen', 1420, 'm2', 12.4),
    line('Tenancy 2', 'Prepare and paint ceilings flat white', 560, 'm2', 13.9),
    line('Tenancy 2', 'Paint doors frames and trims enamel', 48, 'no', 138),
    line('Back of house', 'Prepare and paint walls and ceilings low sheen', 980, 'm2', 14.2),
    line('Back of house', 'Paint exposed services black', 1, 'item', 6400),
    line('Shopfront', 'Paint bulkheads and signage band two pack', 90, 'm2', 34),
    line('Shopfront', 'Paint steel shopfront frames enamel', 72, 'lm', 45),
    line('Allowance', 'Site clean and touch up before handover', 1, 'item', 3900),
  ],
  claimedAreas: ['Back of house', 'Shopfront', 'Allowance'],
  allComplete: true,
  // Everything outside the claim 6 areas, paid through claims 1 to 5.
  previouslyPaid: 77560,
};

async function loadHolidays() {
  const page = await base44.entities.PublicHoliday.filter({ state: DEFAULT_JURISDICTION }, 'date', 500);
  return new Set((page || []).map((holiday) => holiday.date));
}

async function createJobWithLines(spec, extra) {
  const contractSum = round2(spec.lines.reduce((total, item) => total + item.amount, 0));
  const job = await base44.entities.Job.create({
    ...spec.job,
    ...extra,
    state: DEFAULT_JURISDICTION,
    contract_sum_ex_gst: contractSum,
    claim_period: 'monthly',
    quote_status: 'final',
  });
  const claimed = new Set(spec.claimedAreas);
  const lines = await base44.entities.ScopeLine.bulkCreate(
    spec.lines.map((item, index) => ({
      ...item,
      job_id: job.id,
      sort_order: index + 1,
      percent_complete_to_date: spec.allComplete || claimed.has(item.area) ? 100 : 0,
    })),
  );
  return { job, lines: lines || [] };
}

// The claim covers every line in the claimed areas at 100 percent.
function claimLines(lines, areas) {
  const claimed = new Set(areas);
  return lines
    .filter((item) => claimed.has(item.area))
    .map((item) => ({
      scope_line_id: item.id,
      area: item.area,
      description: item.description,
      percent_this_claim: 100,
      amount_this_claim: round2(item.amount),
    }));
}

function claimTotals(lines, previouslyPaid = 0) {
  const exGst = round2(lines.reduce((total, item) => total + item.amount_this_claim, 0));
  const gst = round2(exGst * 0.1);
  return {
    lines,
    variations_included: [],
    amount_claimed_ex_gst: exGst,
    gst,
    amount_claimed_inc_gst: round2(exGst + gst),
    previously_paid: previouslyPaid,
  };
}

export async function seedDemoJobs() {
  const today = todayYmd();
  const state = DEFAULT_JURISDICTION;
  const jurisdiction = jurisdictionFor(state);
  const holidays = await loadHolidays();
  const user = await base44.auth.me().catch(() => null);
  const claimant = {
    claimant_name: user ? user.full_name || user.email : '',
    claimant_email: user ? user.email : '',
  };

  // Job A: Claim 1 served, then scheduled short two business days ago.
  const a = await createJobWithLines(JOB_A, {
    next_claim_date: addDays(today, 21),
    dlp_end_date: addDays(today, 365),
  });
  const aServed = businessDaysAgo(9, holidays, state);
  const aReceived = businessDaysAgo(2, holidays, state);
  await base44.entities.Claim.create({
    job_id: a.job.id,
    claim_number: 1,
    period_from: addDays(aServed, -30),
    period_to: aServed,
    ...claimTotals(claimLines(a.lines, JOB_A.claimedAreas)),
    ...claimant,
    served_at: aServed,
    schedule_due_at: addBusinessDays(aServed, jurisdiction.scheduleDays, holidays, state),
    schedule_received_at: aReceived,
    scheduled_amount: 34000,
    schedule_reasons: 'Defective finish, L1 corridors',
    apply_by: addBusinessDays(aReceived, jurisdiction.applyDays, holidays, state),
    escalated: true,
    status: 'scheduled_short',
  });

  // Job B: Claim 1 served 11 business days ago, no schedule, so it reads as ignored.
  const b = await createJobWithLines(JOB_B, {
    next_claim_date: addDays(today, 14),
    dlp_end_date: addDays(today, 365),
  });
  const bServed = businessDaysAgo(11, holidays, state);
  const bClaim = await base44.entities.Claim.create({
    job_id: b.job.id,
    claim_number: 1,
    period_from: addDays(bServed, -30),
    period_to: bServed,
    ...claimTotals(claimLines(b.lines, JOB_B.claimedAreas)),
    ...claimant,
    served_at: bServed,
    schedule_due_at: addBusinessDays(bServed, jurisdiction.scheduleDays, holidays, state),
    status: 'served',
  });
  // The notice of intention is drafted and stored, not sent. Sending is the
  // demo's job, from the claim screen.
  await base44.functions.invoke('generateClaimDocument', { claim_id: bClaim.id, type: 'notice_of_intention' });

  // Job C: Claim 6 scheduled short, adjudicated, paid in full after escalation.
  const c = await createJobWithLines(JOB_C, {
    next_claim_date: addDays(today, 28),
    dlp_end_date: addDays(today, 61),
  });
  const cServed = businessDaysAgo(38, holidays, state);
  const cReceived = addBusinessDays(cServed, 7, holidays, state);
  const cPaid = businessDaysAgo(8, holidays, state);
  const cTotals = claimTotals(claimLines(c.lines, JOB_C.claimedAreas), JOB_C.previouslyPaid);
  const cScheduled = round2(cTotals.amount_claimed_ex_gst - 6000);
  await base44.entities.Claim.create({
    job_id: c.job.id,
    claim_number: 6,
    period_from: addDays(cServed, -30),
    period_to: cServed,
    ...cTotals,
    ...claimant,
    served_at: cServed,
    schedule_due_at: addBusinessDays(cServed, jurisdiction.scheduleDays, holidays, state),
    schedule_received_at: cReceived,
    scheduled_amount: cScheduled,
    schedule_reasons: 'Shopfront two pack finish not accepted, back of house incomplete',
    apply_by: addBusinessDays(cReceived, jurisdiction.applyDays, holidays, state),
    escalated: true,
    escalation_stage: 'adjudication_preview',
    paid_at: cPaid,
    paid_amount: cTotals.amount_claimed_ex_gst,
    recovered_amount: 6000,
    fee_amount: 180,
    status: 'paid',
  });

  return a.job;
}
