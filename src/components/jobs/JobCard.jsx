import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import StatusPill from '@/components/StatusPill';
import { effectiveStatus, nextActionFor } from '@/lib/claims';
import { formatAud } from '@/lib/format';
import { useT } from '@/lib/i18n';

const RANK = { ignored: 0, adjudication_ready: 1, scheduled_short: 1, served: 2, draft: 3, scheduled_in_full: 4, paid: 5 };

// One job as a row on the sheet: name, builder, and the claim that needs you most.
export default function JobCard({ job, claims }) {
  const t = useT();
  const ordered = [...claims].sort((a, b) => (RANK[effectiveStatus(a)] ?? 9) - (RANK[effectiveStatus(b)] ?? 9));
  const active = ordered[0];
  const next = active ? nextActionFor(active) : null;

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="group flex items-center gap-4 border-b-2 border-foreground px-4 py-4 transition-colors last:border-b-0 hover:bg-secondary"
    >
      <div className="min-w-0 flex-1">
        <p className="eyebrow">
          {job.job_number ? t('Job {number}', { number: job.job_number }) : t('Job')}
          {job.quote_status === 'draft' ? ` | ${t('Quote not final')}` : ''}
        </p>
        <h3 className="mt-0.5 text-[26px] font-bold leading-[1.05]">{t(job.name)}</h3>
        <p className="mt-1 text-[15px] text-muted-foreground">{t(job.builder_name)}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          {active ? <StatusPill status={effectiveStatus(active)} /> : <span className="tag bg-secondary">{t('No claims yet')}</span>}
          {next ? <span className="text-[15px] font-semibold">{t(next.action)}</span> : null}
        </div>
      </div>
      <div className="hidden text-right sm:block">
        <p className="eyebrow">{t('Quote')}</p>
        <p className="num text-[18px]">{formatAud(job.contract_sum_ex_gst)}</p>
      </div>
      <ChevronRight className="h-6 w-6 shrink-0 text-foreground transition-transform group-hover:translate-x-1 rtl:rotate-180" />
    </Link>
  );
}
