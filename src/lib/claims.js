import { formatAud, formatDate } from './format';
import { todayYmd } from './clock';

// Plain words first, the Act's term underneath. The documents keep the Act's
// wording; these labels are only for the screens.
export const STATUS_META = {
  draft: { label: 'Not sent yet', legal: 'Draft claim', tone: 'bg-secondary text-foreground' },
  served: { label: 'Waiting on builder', legal: 'Payment claim served', tone: 'bg-card text-foreground' },
  scheduled_in_full: { label: 'Builder agreed to pay', legal: 'Payment schedule in full', tone: 'bg-[#1F7A3F] text-white border-[#1F7A3F]' },
  scheduled_short: { label: 'Builder paid less', legal: 'Payment schedule short', tone: 'bg-accent text-foreground' },
  ignored: { label: 'No reply from builder', legal: 'No payment schedule by the due date', tone: 'bg-destructive text-white border-destructive' },
  adjudication_ready: { label: 'Ready to escalate', legal: 'Adjudication application ready', tone: 'bg-foreground text-accent' },
  paid: { label: 'Paid', legal: 'Paid', tone: 'bg-[#1F7A3F] text-white border-[#1F7A3F]' },
};

export function effectiveStatus(claim, today = todayYmd()) {
  if (!claim) return 'draft';
  if (claim.paid_at || claim.status === 'paid') return 'paid';
  if (claim.schedule_received_at) {
    const scheduled = Number(claim.scheduled_amount || 0);
    return scheduled >= Number(claim.amount_claimed_ex_gst || 0) - 0.005 ? 'scheduled_in_full' : 'scheduled_short';
  }
  if (claim.served_at) {
    if (claim.status === 'adjudication_ready') return 'adjudication_ready';
    if (String(claim.schedule_due_at || '').slice(0, 10) < today) return 'ignored';
    return 'served';
  }
  return 'draft';
}

export function nextActionFor(claim) {
  const status = effectiveStatus(claim);
  switch (status) {
    case 'draft':
      return { action: 'Send the claim', detail: 'Not sent yet' };
    case 'served':
      return { action: 'Wait for the builder', detail: `They have until ${formatDate(claim.schedule_due_at)}` };
    case 'ignored':
      return { action: 'Send the notice', detail: `Their reply was due ${formatDate(claim.schedule_due_at)}` };
    case 'scheduled_short':
      return { action: 'Get ready to escalate', detail: `Apply by ${formatDate(claim.apply_by)}` };
    case 'scheduled_in_full':
      return { action: 'Record the payment', detail: `${formatAud(claim.scheduled_amount)} agreed` };
    case 'adjudication_ready':
      return { action: 'Record the payment', detail: 'Escalation paper is ready' };
    case 'paid':
      return { action: 'Paid', detail: `${formatAud(claim.paid_amount)} on ${formatDate(claim.paid_at)}` };
    default:
      return { action: '', detail: '' };
  }
}

export function feeFor(claim) {
  if (!claim || !claim.paid_at || !claim.escalated) return 0;
  const recovered = Math.max(0, Number(claim.paid_amount || 0) - Number(claim.scheduled_amount || 0));
  if (recovered <= 0) return 0;
  return Math.min(Math.round(recovered * 3) / 100, 300);
}

export function recoveredFor(claim) {
  if (!claim || !claim.paid_at) return 0;
  return Math.max(0, Number(claim.paid_amount || 0) - Number(claim.scheduled_amount || 0));
}

export function needsAttention(claim) {
  const status = effectiveStatus(claim);
  return status === 'ignored' || status === 'scheduled_short' || status === 'draft';
}

export function claimedPercentForLine(lineId, claims) {
  return (claims || []).reduce((total, claim) => {
    const lines = claim.lines || [];
    return total + lines.filter((line) => line.scope_line_id === lineId).reduce((sum, line) => sum + Number(line.percent_this_claim || 0), 0);
  }, 0);
}

export function previouslyPaidForJob(claims) {
  return (claims || []).reduce((total, claim) => total + Number(claim.paid_amount || 0), 0);
}

export function nextClaimNumber(claims) {
  return (claims || []).reduce((max, claim) => Math.max(max, Number(claim.claim_number || 0)), 0) + 1;
}