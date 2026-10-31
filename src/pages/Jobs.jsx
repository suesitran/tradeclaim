import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Plus, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import JobCard from '@/components/jobs/JobCard';
import ShepherdStrip from '@/components/jobs/ShepherdStrip';
import { effectiveStatus } from '@/lib/claims';
import { createDemoJob } from '@/lib/demoJob';
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
      base44.entities.Job.filter({}, { limit: 100, sort: 'created_date' }),
      base44.entities.Claim.filter({}, { limit: 400, sort: '-created_date' }),
    ])
      .then(([jobPage, claimPage]) => {
        if (!alive) return;
        setJobs((jobPage && jobPage.items) || []);
        setClaims((claimPage && claimPage.items) || []);
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
      const job = await createDemoJob();
      navigate(`/jobs/${job.id}`);
    } finally {
      setDemoLoading(false);
    }
  };

  const attention = claims.filter((claim) => ['ignored', 'scheduled_short', 'draft'].includes(effectiveStatus(claim)));
  const outstanding = claims
    .filter((claim) => !claim.paid_at)
    .reduce((total, claim) => total + Number(claim.amount_claimed_ex_gst || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Victoria, under the Security of Payment Act</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">Jobs</h1>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
            Every quoted scope line, its evidence, and the claim clock. Open a job to serve the next claim.
          </p>
        </div>
        <Button asChild className="bg-primary">
          <Link to="/import">
            <Plus className="mr-2 h-4 w-4" /> Import a quote
          </Link>
        </Button>
      </div>

      <ShepherdStrip />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[4px] border border-border bg-card px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Live jobs</p>
          <p className="num mt-1 text-xl">{jobs.length}</p>
        </div>
        <div className="rounded-[4px] border border-border bg-card px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Claims needing action</p>
          <p className="num mt-1 text-xl">{attention.length}</p>
        </div>
        <div className="rounded-[4px] border border-border bg-card px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Claimed and unpaid, ex GST</p>
          <p className="num mt-1 text-xl">{formatAud(outstanding)}</p>
        </div>
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Loading jobs</p>
      ) : jobs.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} claims={claims.filter((claim) => claim.job_id === job.id)} />
          ))}
        </div>
      ) : (
        <div className="rounded-[4px] border border-dashed border-border bg-card px-6 py-14 text-center">
          <p className="font-heading text-lg">No jobs yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Start with a quote, or open a finished demo job and work the loop from evidence to a served claim.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Button asChild className="bg-primary">
              <Link to="/import">
                Import a quote <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" onClick={startDemo} disabled={demoLoading}>
              {demoLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Building the demo job
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Try the demo job
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}