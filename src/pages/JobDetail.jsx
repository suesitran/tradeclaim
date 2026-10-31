import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, FileText, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import StatusPill from '@/components/StatusPill';
import EvidenceGrid from '@/components/EvidenceGrid';
import ScopeLineTable from '@/components/jobs/ScopeLineTable';
import NewClaimDialog from '@/components/claims/NewClaimDialog';
import { effectiveStatus, nextActionFor } from '@/lib/claims';
import { formatAud, formatDate } from '@/lib/format';
import { jurisdictionFor } from '@/lib/jurisdictions';

const VARIATION_TONES = {
  sent: 'bg-[#E7EEF5] text-[#1F4A70] border-[#CBDCEB]',
  approved: 'bg-[#E4F0E8] text-[#245B3B] border-[#C6DFCE]',
  disputed: 'bg-[#FBE7E4] text-[#8C2A1E] border-[#F1CBC5]',
};

export default function JobDetail() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [lines, setLines] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [variations, setVariations] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimOpen, setClaimOpen] = useState(false);

  const load = async () => {
    const [jobRecord, linePage, evidencePage, variationPage, claimPage] = await Promise.all([
      base44.entities.Job.get(jobId).catch(() => null),
      base44.entities.ScopeLine.filter({ job_id: jobId }, { limit: 200, sort: 'sort_order' }),
      base44.entities.Evidence.filter({ job_id: jobId }, { limit: 400, sort: '-captured_at' }),
      base44.entities.Variation.filter({ job_id: jobId }, { limit: 100, sort: '-created_date' }),
      base44.entities.Claim.filter({ job_id: jobId }, { limit: 100, sort: '-claim_number' }),
    ]);
    setJob(jobRecord);
    setLines((linePage && linePage.items) || []);
    setEvidence((evidencePage && evidencePage.items) || []);
    setVariations((variationPage && variationPage.items) || []);
    setClaims((claimPage && claimPage.items) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [jobId]);

  const evidenceByLine = useMemo(() => {
    return evidence.reduce((acc, item) => {
      acc[item.scope_line_id] = acc[item.scope_line_id] || { before: 0, finish: 0, clear: 0 };
      acc[item.scope_line_id][item.stage] = (acc[item.scope_line_id][item.stage] || 0) + 1;
      return acc;
    }, {});
  }, [evidence]);

  if (loading) return <p className="py-16 text-center text-sm text-muted-foreground">Loading job</p>;
  if (!job) return <p className="py-16 text-center text-sm text-muted-foreground">This job could not be found.</p>;

  const jurisdiction = jurisdictionFor(job.state);

  return (
    <div className="space-y-6">
      <Link to="/app" className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> All jobs
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {job.job_number ? `Job ${job.job_number}` : 'Job'}  |  {job.builder_name}
          </p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">{job.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{job.site_address}{job.site_address ? '  |  ' : ''}{jurisdiction.name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to={`/jobs/${job.id}/capture`}>
              <Camera className="mr-2 h-4 w-4" /> Capture
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/jobs/${job.id}/variation`}>
              <Plus className="mr-2 h-4 w-4" /> Variation
            </Link>
          </Button>
          <Button className="bg-primary" onClick={() => setClaimOpen(true)}>
            <FileText className="mr-2 h-4 w-4" /> Generate next claim
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-[4px] border border-border bg-card px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Contract sum</p>
          <p className="num mt-1 text-[15px]">{formatAud(job.contract_sum_ex_gst)}</p>
        </div>
        <div className="rounded-[4px] border border-border bg-card px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Retention</p>
          <p className="num mt-1 text-[15px]">{Number(job.retention_percent || 0)}%</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">DLP ends {formatDate(job.dlp_end_date) || 'not set'}</p>
        </div>
        <div className="rounded-[4px] border border-border bg-card px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Next claim</p>
          <p className="num mt-1 text-[15px]">{formatDate(job.next_claim_date) || 'Not set'}</p>
        </div>
        <div className="rounded-[4px] border border-border bg-card px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Photos on record</p>
          <p className="num mt-1 text-[15px]">{evidence.length}</p>
        </div>
      </div>

      <section className="overflow-hidden rounded-[4px] border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="font-heading text-sm font-semibold">Claims</h2>
          <span className="text-[11px] text-muted-foreground">{claims.length} on this job</span>
        </div>
        {claims.length ? (
          <div className="divide-y divide-border">
            {claims.map((claim) => {
              const next = nextActionFor(claim);
              return (
                <Link
                  key={claim.id}
                  to={`/claims/${claim.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-secondary/60"
                >
                  <div className="flex items-center gap-3">
                    <span className="num w-16 text-[12px] text-muted-foreground">Claim {claim.claim_number}</span>
                    <StatusPill status={effectiveStatus(claim)} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="num text-[12px] text-foreground">{formatAud(claim.amount_claimed_ex_gst)}</span>
                    <span>{claim.served_at ? `Served ${formatDate(claim.served_at)}` : 'Not served'}</span>
                    <span>{next.action}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="px-5 py-8 text-sm text-muted-foreground">No claims yet. Generate the first claim when work is photographed.</p>
        )}
      </section>

      <section className="overflow-hidden rounded-[4px] border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="font-heading text-sm font-semibold">Scope lines</h2>
          <span className="text-[11px] text-muted-foreground">{lines.length} quoted lines</span>
        </div>
        <ScopeLineTable lines={lines} evidenceByLine={evidenceByLine} claims={claims} />
      </section>

      <section className="overflow-hidden rounded-[4px] border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="font-heading text-sm font-semibold">Variations</h2>
          <Link to={`/jobs/${job.id}/variation`} className="text-[11px] text-accent hover:underline">Record a variation</Link>
        </div>
        {variations.length ? (
          <div className="divide-y divide-border">
            {variations.map((variation) => (
              <div key={variation.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="text-[13px] leading-snug">{variation.description}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Instructed by {variation.instructed_by}
                    {variation.sent_at ? `  |  Sent ${formatDate(variation.sent_at)}` : ''}
                    {variation.email_status ? `  |  ${variation.email_status}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="num text-[12px]">{formatAud(variation.estimated_amount)}</span>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] capitalize ${VARIATION_TONES[variation.status] || VARIATION_TONES.sent}`}>
                    {variation.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-8 text-sm text-muted-foreground">No variations recorded. Anything instructed outside the quote should be captured the same day.</p>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-sm font-semibold">Recent evidence</h2>
          <Link to={`/jobs/${job.id}/capture`} className="text-[11px] text-accent hover:underline">Open capture</Link>
        </div>
        <EvidenceGrid evidence={evidence.slice(0, 6)} emptyLabel="No photos yet. Capture the substrate before work starts, then each finish." />
      </section>

      <NewClaimDialog
        open={claimOpen}
        onOpenChange={setClaimOpen}
        job={job}
        scopeLines={lines}
        claims={claims}
        evidence={evidence}
        variations={variations}
        onCreated={() => load()}
      />
    </div>
  );
}