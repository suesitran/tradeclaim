import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Plus, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import JobCard from '@/components/jobs/JobCard';
import { effectiveStatus, needsAttention } from '@/lib/claims';
import { seedDemoJobs } from '@/lib/seedJobs';
import { formatAud } from '@/lib/format';

export default function Jobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [demoLoading, setDemoLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([
      base44.entities.Job.filter({}, 'created_date', 100),
      base44.entities.Claim.filter({}, '-created_date', 400),
    ])
      .then(([jobPage, claimPage]) => {
        if (!alive) return;
        setJobs(jobPage || []);
        setClaims(claimPage || []);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const startDemo = async () => {
    setDemoLoading(true);
    try {
      const job = await seedDemoJobs();
      navigate(`/jobs/${job.id}`);
    } finally {
      setDemoLoading(false);
    }
  };

  const attention = claims.filter((claim) => needsAttention(claim));
  const owed = claims
    .filter((claim) => !claim.paid_at && effectiveStatus(claim) !== 'draft')
    .reduce((total, claim) => total + Number(claim.amount_claimed_ex_gst || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-[3px] border-foreground pb-4">
        <div>
          <p className="eyebrow">Victoria</p>
          <h1 className="text-[44px] font-extrabold leading-none sm:text-[56px]">Jobs</h1>
        </div>
        <Link to="/import" className="btn-ink">
          <Plus className="h-5 w-5" /> Add a quote
        </Link>
      </div>

      <div className="grid grid-cols-[1fr_1fr_1.5fr] gap-px bg-foreground border-2 border-foreground">
        <div className="bg-card px-3 py-3 sm:px-4">
          <p className="eyebrow">Jobs</p>
          <p className="font-heading text-[32px] font-extrabold leading-none sm:text-[40px]">{jobs.length}</p>
        </div>
        <div className={`px-3 py-3 sm:px-4 ${attention.length ? 'bg-accent' : 'bg-card'}`}>
          <p className="eyebrow !text-foreground">Need you</p>
          <p className="font-heading text-[32px] font-extrabold leading-none sm:text-[40px]">{attention.length}</p>
        </div>
        <div className="min-w-0 bg-card px-3 py-3 sm:px-4">
          <p className="eyebrow">Owed</p>
          <p className="font-heading text-[24px] font-extrabold leading-none sm:text-[40px]">{formatAud(owed)}</p>
          <p className="legal">Claimed, unpaid, ex GST</p>
        </div>
      </div>

      {loading ? (
        <p className="py-12 text-center text-[16px] text-muted-foreground">Loading jobs</p>
      ) : jobs.length ? (
        <div className="sheet">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} claims={claims.filter((claim) => claim.job_id === job.id)} />
          ))}
        </div>
      ) : (
        <div className="sheet px-6 py-12 text-center">
          <h2 className="text-[32px] font-extrabold">No jobs yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-[16px] text-muted-foreground">
            Add the quote you sent the builder, or load three demo jobs to see how it works.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/import" className="btn-ink">
              Add a quote
            </Link>
            <button type="button" onClick={startDemo} disabled={demoLoading} className="btn-yellow">
              {demoLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Loading demo jobs
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" /> Load demo jobs
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
