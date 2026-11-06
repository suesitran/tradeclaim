import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import StatusPill from '@/components/StatusPill';
import { effectiveStatus, nextActionFor } from '@/lib/claims';
import { formatAud, formatDate } from '@/lib/format';

export default function ClaimRow({ claim, job }) {
  const status = effectiveStatus(claim);
  const next = nextActionFor(claim);
  const dateLabel = status === 'scheduled_short' || status === 'adjudication_ready' ? 'Escalate by' : 'Builder reply due';
  const dateValue =
    status === 'scheduled_short' || status === 'adjudication_ready'
      ? formatDate(claim.apply_by)
      : claim.schedule_due_at
        ? formatDate(claim.schedule_due_at)
        : 'Not set';

  return (
    <Link
      to={`/claims/${claim.id}`}
      className="group grid grid-cols-2 gap-x-4 gap-y-3 border-b-2 border-foreground px-4 py-4 transition-colors last:border-b-0 hover:bg-secondary sm:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))_auto] sm:items-center"
    >
      <div className="col-span-2 min-w-0 sm:col-span-1">
        <p className="eyebrow">{job && job.job_number ? `Job ${job.job_number} | ` : ''}Claim {claim.claim_number}</p>
        <p className="text-[20px] font-bold leading-tight">{job ? job.name : 'Job'}</p>
        <p className="num mt-0.5 text-[14px] text-muted-foreground">{formatAud(claim.amount_claimed_ex_gst)} ex GST</p>
      </div>
      <div>
        <p className="eyebrow">Sent</p>
        <p className="num text-[15px]">{claim.served_at ? formatDate(claim.served_at) : 'Not sent'}</p>
      </div>
      <div>
        <p className="eyebrow">{dateLabel}</p>
        <p className="num text-[15px]">{dateValue}</p>
      </div>
      <div>
        <StatusPill status={status} />
      </div>
      <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:justify-end">
        <div className="sm:text-right">
          <p className="font-heading text-[17px] font-bold uppercase tracking-[0.02em]">{next.action}</p>
          <p className="text-[13px] text-muted-foreground">{next.detail}</p>
        </div>
        <ChevronRight className="h-6 w-6 shrink-0 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
