import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import StatusPill from '@/components/StatusPill';
import { effectiveStatus, nextActionFor } from '@/lib/claims';
import { formatAud, formatDate } from '@/lib/format';

export default function JobCard({ job, claims }) {
  const ordered = [...claims].sort((a, b) => {
    const rank = { ignored: 0, adjudication_ready: 1, scheduled_short: 1, served: 2, draft: 3, scheduled_in_full: 4, paid: 5 };
    return (rank[effectiveStatus(a)] ?? 9) - (rank[effectiveStatus(b)] ?? 9);
  });
  const active = ordered[0];
  const next = active ? nextActionFor(active) : null;

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="group flex flex-col justify-between gap-4 rounded-[4px] border border-border bg-card p-5 transition-colors hover:border-[#C9C2B4]"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {job.job_number ? `Job ${job.job_number}` : 'Job'}
              {job.quote_status === 'draft' ? (
                <span className="rounded-full border border-[#F0D6B7] bg-[#FBEDDD] px-1.5 py-0.5 text-[9px] tracking-[0.08em] text-[#8A4B12]">
                  Draft quote
                </span>
              ) : null}
            </p>
            <h3 className="mt-1 truncate font-heading text-lg font-semibold leading-tight">{job.name}</h3>
            <p className="mt-1 truncate text-xs text-muted-foreground">{job.builder_name}</p>
          </div>
          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3">
          <div>
            <dt className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Contract</dt>
            <dd className="num text-[13px]">{formatAud(job.contract_sum_ex_gst)}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Next claim</dt>
            <dd className="num text-[13px]">{job.next_claim_date ? formatDate(job.next_claim_date) : 'Not set'}</dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {active ? <StatusPill status={effectiveStatus(active)} /> : <span className="text-[11px] text-muted-foreground">No claims yet</span>}
        {next ? <span className="text-[11px] text-muted-foreground">{next.action}</span> : null}
      </div>
    </Link>
  );
}