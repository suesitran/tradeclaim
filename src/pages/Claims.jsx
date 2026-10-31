import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import ClaimRow from '@/components/claims/ClaimRow';
import { CARD, CARD_HEAD, CARD_META, SMALL_ACTION } from '@/components/jobs/taskStyles';
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
    <div className="border border-[#DED6C7] bg-[#FAF7F1] pb-14 text-[#1B1A17]">
      <header className="bg-[#1B1A17] px-5 pb-10 pt-10 text-[#FAF7F1] sm:px-8">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#E3C9A8]">The statutory clock</p>
        <h1 className="mt-3 text-[34px] font-extrabold leading-[1.08] tracking-[-0.02em] sm:text-[46px]">Claims</h1>
        <p className="mt-3 max-w-2xl text-[14px] leading-[1.5] text-[#DED6C7]">
          Which builder owes a response today. Every claim is counted under the Victorian Act, skipping weekends,
          Victorian public holidays and the end of year shutdown.
        </p>

        <div className="mt-8 grid grid-cols-1 border-t border-[rgba(222,214,199,0.35)] sm:grid-cols-3">
          <div className="pr-3 pt-[14px]">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#E3C9A8]">Ignored, notice to send</p>
            <p className="num mt-[6px] text-[19px] text-[#FAF7F1]">{ignored.length}</p>
          </div>
          <div className="pr-3 pt-[14px]">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#E3C9A8]">Scheduled short</p>
            <p className="num mt-[6px] text-[19px] text-[#FAF7F1]">{short.length}</p>
          </div>
          <div className="pr-3 pt-[14px]">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#E3C9A8]">Claimed and unpaid, ex GST</p>
            <p className="num mt-[6px] text-[19px] text-[#FAF7F1]">{formatAud(unpaid)}</p>
          </div>
        </div>
      </header>

      <div className="px-5 pt-8 sm:px-8">
        <div className={CARD}>
          <div className={CARD_HEAD}>
            <h2 className="text-[14px] font-extrabold">All claims</h2>
            <div className={CARD_META}>
              <span>{sorted.length} tracked</span>
            </div>
          </div>

          <div className="hidden grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))_auto] gap-4 border-b border-[#DED6C7] px-5 py-[11px] text-[10px] uppercase tracking-[0.12em] text-[#6b6457] sm:grid">
            <span>Job and claim</span>
            <span>Served</span>
            <span>Due</span>
            <span>Status</span>
            <span className="text-right">Next action</span>
          </div>

          {loading ? (
            <p className="px-5 py-12 text-center text-[13px] text-[#6b6457]">Loading claims</p>
          ) : sorted.length ? (
            sorted.map((claim) => <ClaimRow key={claim.id} claim={claim} job={jobById[claim.job_id]} />)
          ) : (
            <p className="px-5 py-12 text-center text-[13px] text-[#6b6457]">No claims yet. Generate one from a job.</p>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[6px] border border-[#DED6C7] bg-white px-5 py-[14px]">
          <div className="flex items-start gap-2 text-[11px] leading-[1.5] text-[#6b6457]">
            <CalendarClock className="mt-0.5 h-3.5 w-3.5 flex-none" />
            <span>
              {loadedStates.length
                ? `${holidayCount} public holidays loaded for ${loadedStates.map((code) => jurisdictionFor(code).name).join(', ')}`
                : 'No Victorian public holiday list loaded yet'}
              {missing.length
                ? `${loadedStates.length ? '. Still to load: ' : ': '}${missing.map((code) => jurisdictionFor(code).name).join(', ')}`
                : ''}
              .
            </span>
          </div>
          <button type="button" className={SMALL_ACTION} onClick={syncHolidays} disabled={syncing}>
            <RefreshCw className={`h-3 w-3 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Loading' : 'Reload from the government list'}
          </button>
        </div>
      </div>
    </div>
  );
}