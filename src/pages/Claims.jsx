import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import ClaimRow from '@/components/claims/ClaimRow';
import useHolidays from '@/hooks/useHolidays';
import { effectiveStatus } from '@/lib/claims';
import { formatAud } from '@/lib/format';

const RANK = { ignored: 0, adjudication_ready: 1, scheduled_short: 1, served: 2, draft: 3, scheduled_in_full: 4, paid: 5 };

export default function Claims() {
  const { toast } = useToast();
  const { holidays, ready } = useHolidays();
  const [claims, setClaims] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const load = async () => {
    const [claimPage, jobPage] = await Promise.all([
      base44.entities.Claim.filter({}, { limit: 400, sort: '-created_date' }),
      base44.entities.Job.filter({}, { limit: 100, sort: 'created_date' }),
    ]);
    setClaims((claimPage && claimPage.items) || []);
    setJobs((jobPage && jobPage.items) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const jobById = useMemo(() => Object.fromEntries(jobs.map((job) => [job.id, job])), [jobs]);

  const sorted = [...claims].sort((a, b) => {
    const rank = (RANK[effectiveStatus(a)] ?? 9) - (RANK[effectiveStatus(b)] ?? 9);
    if (rank !== 0) return rank;
    return String(a.schedule_due_at || a.apply_by || '').localeCompare(String(b.schedule_due_at || b.apply_by || ''));
  });

  const ignored = claims.filter((claim) => effectiveStatus(claim) === 'ignored');
  const short = claims.filter((claim) => effectiveStatus(claim) === 'scheduled_short');
  const unpaid = claims.filter((claim) => !claim.paid_at).reduce((total, claim) => total + Number(claim.amount_claimed_ex_gst || 0), 0);

  const syncHolidays = async () => {
    setSyncing(true);
    try {
      const years = [new Date().getFullYear(), new Date().getFullYear() + 1];
      for (const year of years) {
        const response = await base44.functions.invoke('syncVictorianHolidays', { year });
        if (response.data && response.data.error) throw new Error(response.data.error);
      }
      toast({ title: 'Victorian public holidays reloaded' });
      window.location.reload();
    } catch (error) {
      toast({ title: 'The holiday list could not be loaded', description: error.message, variant: 'destructive' });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-7">
      <div>
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">The statutory clock</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">Claims</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Which builder owes a response today. Business days skip weekends and Victorian public holidays.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[4px] border border-[#F1CBC5] bg-[#FBE7E4] px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.12em] text-[#8C2A1E]">Ignored, notice to send</p>
          <p className="num mt-1 text-xl text-[#8C2A1E]">{ignored.length}</p>
        </div>
        <div className="rounded-[4px] border border-[#F0D6B7] bg-[#FBEDDD] px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.12em] text-[#8A4B12]">Scheduled short</p>
          <p className="num mt-1 text-xl text-[#8A4B12]">{short.length}</p>
        </div>
        <div className="rounded-[4px] border border-border bg-card px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Claimed and unpaid, ex GST</p>
          <p className="num mt-1 text-xl">{formatAud(unpaid)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[4px] border border-border bg-card">
        <div className="hidden grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))_auto] gap-4 border-b border-border px-5 py-2.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:grid">
          <span>Job and claim</span>
          <span>Served</span>
          <span>Due</span>
          <span>Status</span>
          <span className="text-right">Next action</span>
        </div>
        {loading ? (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">Loading claims</p>
        ) : sorted.length ? (
          sorted.map((claim) => <ClaimRow key={claim.id} claim={claim} job={jobById[claim.job_id]} />)
        ) : (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">No claims yet. Generate one from a job.</p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[4px] border border-border bg-card px-4 py-3">
        <div className="flex items-start gap-2 text-[11px] text-muted-foreground">
          <CalendarClock className="mt-0.5 h-3.5 w-3.5" />
          <span>
            {ready ? `${holidays.size} Victorian public holidays loaded` : 'Loading the Victorian public holiday list'}
            {ready && holidays.has('2026-11-03') ? ', including Melbourne Cup Day on 3 Nov 2026' : ''}.
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={syncHolidays} disabled={syncing}>
          <RefreshCw className={`mr-2 h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Loading' : 'Reload from the government list'}
        </Button>
      </div>
    </div>
  );
}