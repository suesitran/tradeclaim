import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import StatusPill from '@/components/StatusPill';
import EvidenceGrid from '@/components/EvidenceGrid';
import ScopeLineTable from '@/components/jobs/ScopeLineTable';
import NewClaimDialog from '@/components/claims/NewClaimDialog';
import EditJobDialog from '@/components/jobs/EditJobDialog';
import ScopeLineDialog from '@/components/jobs/ScopeLineDialog';
import DefectRegister from '@/components/defects/DefectRegister';
import TaskRow from '@/components/jobs/TaskRow';
import {
  CARD,
  CARD_HEAD,
  CARD_META,
  EMPTY,
  HERO_ACTION,
  HERO_ACTION_PRIMARY,
  SMALL_ACTION,
  TASK_ACTION,
  TASK_ACTION_OUTLINE,
} from '@/components/jobs/taskStyles';
import { effectiveStatus, nextActionFor } from '@/lib/claims';
import { formatAud, formatDate } from '@/lib/format';
import { jurisdictionFor } from '@/lib/jurisdictions';

const HERO_IMAGE =
  'https://media.base44.com/images/public/6ae53bfb0bf98c8224ef283d/f475385bc_generated_10d3129d.jpg';

const VARIATION_TONES = {
  sent: 'bg-[#EDE7DA] border-[#DED6C7] text-[#4a4439]',
  approved: 'bg-[#E7EEDD] border-[#C9D6B6] text-[#3d5a24]',
  disputed: 'bg-[#F1E3D1] border-[#E2C7A6] text-[#7a4519]',
};

export default function JobDetail() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [lines, setLines] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [variations, setVariations] = useState([]);
  const [claims, setClaims] = useState([]);
  const [defects, setDefects] = useState([]);
  const [defectVisits, setDefectVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimOpen, setClaimOpen] = useState(false);
  const [editJobOpen, setEditJobOpen] = useState(false);
  const [addLineOpen, setAddLineOpen] = useState(false);

  const load = async () => {
    const [jobRecord, linePage, evidencePage, variationPage, claimPage, defectPage, visitPage] = await Promise.all([
      base44.entities.Job.get(jobId).catch(() => null),
      base44.entities.ScopeLine.filter({ job_id: jobId }, { limit: 200, sort: 'sort_order' }),
      base44.entities.Evidence.filter({ job_id: jobId }, { limit: 400, sort: '-captured_at' }),
      base44.entities.Variation.filter({ job_id: jobId }, { limit: 100, sort: '-created_date' }),
      base44.entities.Claim.filter({ job_id: jobId }, { limit: 100, sort: '-claim_number' }),
      base44.entities.Defect.filter({ job_id: jobId }, { limit: 200, sort: '-raised_at' }),
      base44.entities.DefectVisit.filter({ job_id: jobId }, { limit: 400, sort: '-attended_at' }),
    ]);
    setJob(jobRecord);
    setLines((linePage && linePage.items) || []);
    setEvidence((evidencePage && evidencePage.items) || []);
    setVariations((variationPage && variationPage.items) || []);
    setClaims((claimPage && claimPage.items) || []);
    setDefects((defectPage && defectPage.items) || []);
    setDefectVisits((visitPage && visitPage.items) || []);
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

  const recalcContractSum = async (nextLines) => {
    const sum = Math.round(nextLines.reduce((total, item) => total + Number(item.amount || 0), 0) * 100) / 100;
    await base44.entities.Job.update(job.id, { contract_sum_ex_gst: sum });
  };

  const handleLineSave = async (line, patch) => {
    const quantity = Math.max(0, Number(patch.quantity || 0));
    const amount = Math.max(0, Number(patch.amount || 0));
    const rate = quantity > 0 ? Math.round((amount / quantity) * 100) / 100 : Number(line.rate || 0);
    const saved = { description: patch.description, quantity, amount, rate };
    await base44.entities.ScopeLine.update(line.id, saved);
    await recalcContractSum(lines.map((item) => (item.id === line.id ? { ...item, ...saved } : item)));
    await load();
  };

  const handleLineDelete = async (line) => {
    if (!window.confirm('Remove this scope line from the quote?')) return;
    await base44.entities.ScopeLine.delete(line.id);
    await recalcContractSum(lines.filter((item) => item.id !== line.id));
    await load();
  };

  return (
    <div className="min-h-screen border border-[#DED6C7] bg-[#FAF7F1] px-5 pb-20 pt-9 text-[#1B1A17] sm:px-8 md:pl-[150px] md:pr-12">
      <Link
        to="/app"
        style={{ animationDelay: '0.05s' }}
        className="animate-rise inline-flex text-[12px] tracking-[0.02em] text-[#6b6457] transition-colors duration-200 hover:text-[#9A5B2A]"
      >
        ← All jobs
      </Link>

      <header
        style={{ animationDelay: '0.12s' }}
        className="relative -mx-5 mt-[22px] animate-rise overflow-hidden bg-[#1B1A17] px-5 pb-11 pt-[54px] text-[#FAF7F1] sm:-mx-8 sm:px-8 md:-ml-[150px] md:-mr-12 md:pl-[150px] md:pr-12"
      >
        <img
          src={HERO_IMAGE}
          alt="Painter's workbench with brush, paint tin and swatches"
          className="absolute inset-0 h-full w-full animate-drift object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(27,26,23,0.92)_0%,rgba(27,26,23,0.78)_55%,rgba(27,26,23,0.45)_100%)]" />

        <div className="relative">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#E3C9A8]">
            {job.job_number ? `Job ${job.job_number}` : 'Job'} | {job.builder_name}
          </p>
          <h1 className="mt-[14px] max-w-[620px] text-[34px] font-extrabold leading-[1.08] tracking-[-0.02em] sm:text-[50px]">
            {job.name}
          </h1>
          <p className="mt-[14px] text-[14px] leading-[1.5] text-[#DED6C7]">
            {job.site_address}
            {job.site_address ? ' | ' : ''}
            {jurisdiction.name}
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5">
            <button type="button" className={HERO_ACTION} onClick={() => setEditJobOpen(true)}>
              Edit job
            </button>
            <Link to={`/jobs/${job.id}/capture`} className={HERO_ACTION}>
              Capture
            </Link>
            <Link to={`/jobs/${job.id}/variation`} className={HERO_ACTION}>
              + Variation
            </Link>
            <button type="button" className={HERO_ACTION_PRIMARY} onClick={() => setClaimOpen(true)}>
              Generate next claim
            </button>
          </div>

          <div className="mt-[34px] grid grid-cols-2 border-t border-[rgba(222,214,199,0.35)] sm:grid-cols-4">
            <div className="pr-3 pt-[14px]">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#E3C9A8]">Contract sum</p>
              <p className="num mt-[6px] text-[19px] text-[#FAF7F1]">{formatAud(job.contract_sum_ex_gst)}</p>
            </div>
            <div className="pr-3 pt-[14px]">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#E3C9A8]">Retention</p>
              <p className="num mt-[6px] text-[19px] text-[#FAF7F1]">{Number(job.retention_percent || 0)}%</p>
              <p className="mt-[3px] text-[10px] text-[#DED6C7]">DLP ends {formatDate(job.dlp_end_date) || 'not set'}</p>
            </div>
            <div className="pr-3 pt-[14px]">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#E3C9A8]">Next claim</p>
              <p className="num mt-[6px] text-[19px] text-[#FAF7F1]">{formatDate(job.next_claim_date) || 'Not set'}</p>
            </div>
            <div className="pr-3 pt-[14px]">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#E3C9A8]">Photos on record</p>
              <p className="num mt-[6px] text-[19px] text-[#FAF7F1]">{evidence.length}</p>
            </div>
          </div>
        </div>
      </header>

      <TaskRow
        number="1"
        title="Recent evidence"
        delay={0.35}
        action={
          <Link to={`/jobs/${job.id}/capture`} className={TASK_ACTION_OUTLINE}>
            Open capture
          </Link>
        }
      >
        <EvidenceGrid
          variant="bone"
          evidence={evidence.slice(0, 6)}
          emptyLabel="No photos yet. Capture the substrate before work starts, then each finish."
        />

        <div className={`${CARD} mt-[22px]`}>
          <div className={CARD_HEAD}>
            <h3 className="text-[14px] font-extrabold">Scope lines</h3>
            <div className={CARD_META}>
              <span>{lines.length} quoted lines</span>
              <button type="button" className={SMALL_ACTION} onClick={() => setAddLineOpen(true)}>
                + Add line
              </button>
            </div>
          </div>
          <ScopeLineTable
            lines={lines}
            evidenceByLine={evidenceByLine}
            claims={claims}
            onSave={handleLineSave}
            onDelete={handleLineDelete}
          />
        </div>
      </TaskRow>

      <TaskRow
        number="2"
        title="Claims"
        sub={`${claims.length} on this job`}
        delay={0.5}
        action={
          <button type="button" className={TASK_ACTION} onClick={() => setClaimOpen(true)}>
            Generate next claim
          </button>
        }
      >
        {claims.length ? (
          <div className="space-y-3">
            {claims.map((claim) => (
              <Link key={claim.id} to={`/claims/${claim.id}`} className={`${CARD} block`}>
                <div className={CARD_HEAD}>
                  <h3 className="text-[14px] font-extrabold">Claim {claim.claim_number}</h3>
                  <div className={CARD_META}>
                    <StatusPill status={effectiveStatus(claim)} />
                    <span className="num text-[13px] text-[#1B1A17]">{formatAud(claim.amount_claimed_ex_gst)}</span>
                    <span>{claim.served_at ? `Served ${formatDate(claim.served_at)}` : 'Not served'}</span>
                    <span className="text-[#9A5B2A]">{nextActionFor(claim).action}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className={EMPTY}>No claims yet. Generate the first claim when work is photographed.</p>
        )}
      </TaskRow>

      <TaskRow
        number="3"
        title="Variations"
        delay={0.65}
        action={
          <Link to={`/jobs/${job.id}/variation`} className={TASK_ACTION_OUTLINE}>
            Record a variation
          </Link>
        }
      >
        {variations.length ? (
          <div className="space-y-3">
            {variations.map((variation) => (
              <div
                key={variation.id}
                className="flex items-center justify-between gap-3.5 rounded-[6px] border border-[#DED6C7] bg-white px-[18px] py-[14px]"
              >
                <div className="min-w-0">
                  <p className="text-[13px] leading-snug">{variation.description}</p>
                  <p className="mt-1 text-[11px] text-[#6b6457]">
                    Instructed by {variation.instructed_by}
                    {variation.sent_at ? ` | Sent ${formatDate(variation.sent_at)}` : ''}
                    {variation.email_status ? ` | ${variation.email_status}` : ''}
                  </p>
                </div>
                <div className="flex flex-none items-center gap-3">
                  <span className="num text-[12px]">{formatAud(variation.estimated_amount)}</span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-[2px] text-[10px] capitalize ${
                      VARIATION_TONES[variation.status] || VARIATION_TONES.sent
                    }`}
                  >
                    {variation.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={EMPTY}>
            No variations recorded. Anything instructed outside the quote should be captured the same day.
          </p>
        )}
      </TaskRow>

      <TaskRow number="4" title="Defect register" delay={0.8}>
        <DefectRegister embedded job={job} lines={lines} defects={defects} visits={defectVisits} onChanged={load} />
      </TaskRow>

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

      <EditJobDialog open={editJobOpen} onOpenChange={setEditJobOpen} job={job} onSaved={load} />

      <ScopeLineDialog open={addLineOpen} onOpenChange={setAddLineOpen} job={job} lines={lines} line={null} onSaved={load} />
    </div>
  );
}