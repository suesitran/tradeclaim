import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import StatusPill from '@/components/StatusPill';
import { effectiveStatus, nextActionFor } from '@/lib/claims';
import { formatDate } from '@/lib/format';

export default function ClaimRow({ claim, job }) {
  const status = effectiveStatus(claim);
  const next = nextActionFor(claim);
  return (
    <Link
      to={`/claims/${claim.id}`}
      className="group grid grid-cols-2 gap-x-4 gap-y-3 border-b border-[#EAE3D4] px-5 py-4 transition-colors duration-200 last:border-b-0 hover:bg-[#F6F1E6] sm:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))_auto] sm:items-center"
    >
      <div className="col-span-2 min-w-0 sm:col-span-1">
        <p className="truncate text-[13px] font-bold leading-snug">{job ? job.name : 'Job'}</p>
        <p className="num mt-1 text-[11px] text-[#6b6457]">
          {job && job.job_number ? `Job ${job.job_number} | ` : ''}Claim {claim.claim_number}
        </p>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.12em] text-[#6b6457]">Served</p>
        <p className="num mt-0.5 text-[12px]">{claim.served_at ? formatDate(claim.served_at) : 'Not served'}</p>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.12em] text-[#6b6457]">
          {status === 'scheduled_short' || status === 'adjudication_ready' ? 'Apply by' : 'Schedule due'}
        </p>
        <p className="num mt-0.5 text-[12px]">
          {status === 'scheduled_short' || status === 'adjudication_ready'
            ? formatDate(claim.apply_by)
            : claim.schedule_due_at
              ? formatDate(claim.schedule_due_at)
              : 'Not set'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <StatusPill status={status} />
      </div>
      <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:justify-end">
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.12em] text-[#9A5B2A]">{next.action}</p>
          <p className="text-[12px] text-[#6b6457]">{next.detail}</p>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-[#6b6457] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}