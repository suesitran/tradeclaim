import { formatAud, formatDate } from './format';
import { todayYmd } from './clock';

export const STATUS_META = {
  draft: { label: 'Draft', tone: 'bg-[#EDEBE4] text-[#4A4F55] border-[#DCD7CB]', dot: 'bg-[#8B8F94]' },
  served: { label: 'Served', tone: 'bg-[#E7EEF5] text-[#1F4A70] border-[#CBDCEB]', dot: 'bg-[#2C6A9B]' },
  scheduled_in_full: { label: 'Scheduled in full', tone: 'bg-[#E4F0E8] text-[#245B3B] border-[#C6DFCE]', dot: 'bg-[#2C7A4B]' },
  scheduled_short: { label: 'Scheduled short', tone: 'bg-[#FBEDDD] text-[#8A4B12] border-[#F0D6B7]', dot: 'bg-[#C7741A]' },
  ignored: { label: 'Ignored', tone: 'bg-[#FBE7E4] text-[#8C2A1E] border-[#F1CBC5]', dot: 'bg-[#B3341F]' },
  adjudication_ready: { label: 'Adjudication ready', tone: 'bg-[#FBE7E4] text-[#8C2A1E] border-[#F1CBC5]', dot: 'bg-[#B3341F]' },
  paid: { label: 'Paid', tone: 'bg-[#E4F0E8] text-[#245B3B] border-[#C6DFCE]', dot: 'bg-[#2C7A4B]' },
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
      return { action: 'Serve the claim', detail: 'Not served yet' };
    case 'served':
      return { action: 'Wait for the payment schedule', detail: `Due ${formatDate(claim.schedule_due_at)}` };
    case 'ignored':
      return { action: 'Send the notice of intention', detail: `Schedule was due ${formatDate(claim.schedule_due_at)}` };
    case 'scheduled_short':
      return { action: 'Adjudication ready to prepare', detail: `Apply by ${formatDate(claim.apply_by)}` };
    case 'scheduled_in_full':
      return { action: 'Record the payment', detail: `${formatAud(claim.scheduled_amount)} scheduled` };
    case 'adjudication_ready':
      return { action: 'Record the payment', detail: 'Preview document ready' };
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