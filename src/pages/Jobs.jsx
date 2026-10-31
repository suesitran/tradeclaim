import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Plus, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import JobCard from '@/components/jobs/JobCard';
import NextStepGuide from '@/components/tutorial/NextStepGuide';
import { effectiveStatus } from '@/lib/claims';
import { createDemoJob } from '@/lib/demoJob';
import { formatAud } from '@/lib/format';
import { TUTORIAL_HIDDEN_KEY, tutorialState } from '@/lib/tutorial';

export default function Jobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [demoLoading, setDemoLoading] = useState(false);
  const [hasEvidence, setHasEvidence] = useState(false);
  const [guideHidden, setGuideHidden] = useState(
    () => sessionStorage.getItem(TUTORIAL_HIDDEN_KEY) === '1',
  );

  useEffect(() => {
    let alive = true;
    Promise.all([
      base44.entities.Job.filter({}, { limit: 100, sort: 'created_date' }),
      base44.entities.Claim.filter({}, { limit: 400, sort: '-created_date' }),
      base44.entities.Evidence.filter({}, { limit: 1 }),
    ])
      .then(([jobPage, claimPage, evidencePage]) => {
        if (!alive) return;
        setJobs((jobPage && jobPage.items) || []);
        setClaims((claimPage && claimPage.items) || []);
        setHasEvidence(Boolean(evidencePage && evidencePage.items && evidencePage.items.length));
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

  const guide = tutorialState({ jobs, hasEvidence, claims });
  const hideGuide = () => {
    sessionStorage.setItem(TUTORIAL_HIDDEN_KEY, '1');
    setGuideHidden(true);
  };

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
        <div className="flex items-center gap-2">
          {!guide.complete && guideHidden ? (
            <Button variant="ghost" size="sm" onClick={() => setGuideHidden(false)}>
              Show the guided start
            </Button>
          ) : null}
          <Button asChild className="bg-primary">
            <Link to="/import">
              <Plus className="mr-2 h-4 w-4" /> Import a quote
            </Link>
          </Button>
        </div>
      </div>

      {!guide.complete && !guideHidden ? (
        <NextStepGuide steps={guide.steps} activeIndex={guide.activeIndex} onHide={hideGuide} />
      ) : null}

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