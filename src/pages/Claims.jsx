import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import ClaimRow from '@/components/claims/ClaimRow';
import { effectiveStatus } from '@/lib/claims';
import { jurisdictionFor } from '@/lib/jurisdictions';
import { formatAud } from '@/lib/format';
import { ensureNoticeDrafts } from '@/lib/notices';

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
      base44.entities.Claim.filter({}, '-created_date', 400),
      base44.entities.Job.filter({}, 'created_date', 100),
    ]);
    setClaims(claimPage || []);
    setJobs(jobPage || []);
    setLoading(false);

    // Any claim the clock has run out on gets its notice drafted in the
    // background, so it is ready by the time the claim is opened.
    ensureNoticeDrafts(claimPage || []).then((drafted) => {
      if (drafted) load();
    });
  };

  useEffect(() => {
    load();
  }, []);

  const jobById = useMemo(() => Object.fromEntries(jobs.map((job) => [job.id, job])), [jobs]);
  const stateCodes = useMemo(() => Array.from(new Set(jobs.map((job) => jurisdictionFor(job.state).code))), [jobs]);

  useEffect(() => {
    if (!stateCodes.length) return undefined;
    let alive = true;
    base44.entities.PublicHoliday.filter({ state: { $in: stateCodes } }, 'date', 500)
      .then((page) => {
        if (!alive) return;
        const items = page || [];
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
  const unpaid = claims
    .filter((claim) => !claim.paid_at && effectiveStatus(claim) !== 'draft')
    .reduce((total, claim) => total + Number(claim.amount_claimed_ex_gst || 0), 0);

  const syncingCodes = stateCodes.length ? stateCodes : [jurisdictionFor().code];

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
      toast({ title: 'Public holidays loaded' });
      window.location.reload();
    } catch (error) {
      toast({ title: 'The holidays could not be loaded', description: error.message, variant: 'destructive' });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b-[3px] border-foreground pb-4">
        <p className="eyebrow">The clock</p>
        <h1 className="text-[44px] font-extrabold leading-none sm:text-[56px]">Claims</h1>
        <p className="mt-2 text-[16px] text-muted-foreground">Who owes you a reply, and by when. Weekends, public holidays and the Christmas shutdown are skipped.</p>
      </div>

      <div className="grid grid-cols-[1fr_1fr_1.5fr] gap-px border-2 border-foreground bg-foreground">
        <div className={`px-3 py-3 sm:px-4 ${ignored.length ? 'bg-destructive text-white' : 'bg-card'}`}>
          <p className={`eyebrow ${ignored.length ? '!text-white' : ''}`}>No reply</p>
          <p className="font-heading text-[32px] font-extrabold leading-none sm:text-[40px]">{ignored.length}</p>
        </div>
        <div className={`px-3 py-3 sm:px-4 ${short.length ? 'bg-accent' : 'bg-card'}`}>
          <p className="eyebrow !text-foreground">Paid less</p>
          <p className="font-heading text-[32px] font-extrabold leading-none sm:text-[40px]">{short.length}</p>
        </div>
        <div className="min-w-0 bg-card px-3 py-3 sm:px-4">
          <p className="eyebrow">Owed</p>
          <p className="font-heading text-[24px] font-extrabold leading-none sm:text-[40px]">{formatAud(unpaid)}</p>
          <p className="legal">Claimed, unpaid, ex GST</p>
        </div>
      </div>

      <div className="sheet">
        <div className="sheet-head">
          <h2 className="text-[20px] font-extrabold">All claims</h2>
          <span className="text-[14px] text-muted-foreground">{sorted.length} tracked</span>
        </div>
        {loading ? (
          <p className="px-4 py-12 text-center text-[16px] text-muted-foreground">Loading claims</p>
        ) : sorted.length ? (
          sorted.map((claim) => <ClaimRow key={claim.id} claim={claim} job={jobById[claim.job_id]} />)
        ) : (
          <p className="px-4 py-12 text-center text-[16px] text-muted-foreground">No claims yet. Open a job to make one.</p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-2 border-foreground bg-card px-4 py-3">
        <p className="flex items-center gap-2 text-[14px]">
          <CalendarClock className="h-4 w-4 shrink-0" />
          {loadedStates.length ? `${holidayCount} Victorian public holidays loaded.` : 'Victorian public holidays not loaded yet, so the clock may be a day out.'}
        </p>
        <button type="button" className="btn-small" onClick={syncHolidays} disabled={syncing}>
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Loading' : 'Load holidays'}
        </button>
      </div>
    </div>
  );
}
