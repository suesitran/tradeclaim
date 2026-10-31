import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import ClaimRow from '@/components/claims/ClaimRow';
import { effectiveStatus } from '@/lib/claims';
import { jurisdictionFor } from '@/lib/jurisdictions';
import { formatAud } from '@/lib/format';

const RANK = { ignored: 0, adjudication_ready: 1, scheduled_short: 1, served: 2, draft: 3, scheduled_in_full: 4, paid: 5 };

export default function Claims() {
  const { toast } = useToast();
  const [claims, setClaims] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [holidayCount, setHolidayCount] = useState(0);
  const [loadedStates, setLoadedStates] = useState([]);

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
  const stateCodes = useMemo(() => Array.from(new Set(jobs.map((job) => jurisdictionFor(job.state).code))), [jobs]);

  useEffect(() => {
    if (!stateCodes.length) return undefined;
    let alive = true;
    base44.entities.PublicHoliday.filter({ state: { $in: stateCodes } }, { limit: 500, sort: 'date' })
      .then((page) => {
        if (!alive) return;
        const items = (page && page.items) || [];
        setHolidayCount(items.length);
        setLoadedStates(Array.from(new Set(items.map((holiday) => holiday.state))));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [stateCodes]);

  const sorted = [...claims].sort((a, b) => {
    const rank = (RANK[effectiveStatus(a)] ?? 9) - (RANK[effectiveStatus(b)] ?? 9);
    if (rank !== 0) return rank;
    return String(a.schedule_due_at || a.apply_by || '').localeCompare(String(b.schedule_due_at || b.apply_by || ''));
  });

  const ignored = claims.filter((claim) => effectiveStatus(claim) === 'ignored');
  const short = claims.filter((claim) => effectiveStatus(claim) === 'scheduled_short');
  const unpaid = claims.filter((claim) => !claim.paid_at).reduce((total, claim) => total + Number(claim.amount_claimed_ex_gst || 0), 0);

  const syncingCodes = stateCodes.length ? stateCodes : [jurisdictionFor().code];
  const missing = syncingCodes.filter((code) => !loadedStates.includes(code));

  const syncHolidays = async () => {
    setSyncing(true);
    try {
      const years = [new Date().getFullYear(), new Date().getFullYear() + 1];
      for (const year of years) {
        for (const code of syncingCodes) {
          const response = await base44.functions.invoke('syncPublicHolidays', { year, state: code });
          if (response.data && response.data.error) throw new Error(response.data.error);
        }
      }
      toast({ title: `Public holidays reloaded for ${syncingCodes.map((code) => jurisdictionFor(code).name).join(', ')}` });
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
          Which builder owes a response today. Each claim is counted under the Act for its own state or territory, skipping
          weekends, that state's public holidays and its end of year shutdown.
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
            {loadedStates.length
              ? `${holidayCount} public holidays loaded for ${loadedStates.map((code) => jurisdictionFor(code).name).join(', ')}`
              : 'No public holiday list loaded for the states in use'}
            {missing.length
              ? `${loadedStates.length ? '. Still to load: ' : ': '}${missing.map((code) => jurisdictionFor(code).name).join(', ')}`
              : ''}
            .
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