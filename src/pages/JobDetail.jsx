import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, FileText, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import StatusPill from '@/components/StatusPill';
import EvidenceGrid from '@/components/EvidenceGrid';
import ScopeLineTable from '@/components/jobs/ScopeLineTable';
import NewClaimDialog from '@/components/claims/NewClaimDialog';
import EditJobDialog from '@/components/jobs/EditJobDialog';
import ScopeLineDialog from '@/components/jobs/ScopeLineDialog';
import DefectRegister from '@/components/defects/DefectRegister';
import TaskRow from '@/components/jobs/TaskRow';
import { CARD, CARD_HEAD, CARD_META, EMPTY, SMALL_ACTION } from '@/components/jobs/taskStyles';
import { effectiveStatus, nextActionFor } from '@/lib/claims';
import { formatAud, formatDate } from '@/lib/format';

const VARIATION_LABEL = { sent: 'Sent to builder', approved: 'Approved', disputed: 'Disputed' };
const VARIATION_TONE = { sent: 'bg-card', approved: 'bg-[#1F7A3F] text-white border-[#1F7A3F]', disputed: 'bg-destructive text-white border-destructive' };

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
      base44.entities.ScopeLine.filter({ job_id: jobId }, 'sort_order', 200),
      base44.entities.Evidence.filter({ job_id: jobId }, '-captured_at', 400),
      base44.entities.Variation.filter({ job_id: jobId }, '-created_date', 100),
      base44.entities.Claim.filter({ job_id: jobId }, '-claim_number', 100),
      base44.entities.Defect.filter({ job_id: jobId }, '-raised_at', 200),
      base44.entities.DefectVisit.filter({ job_id: jobId }, '-attended_at', 400),
    ]);
    setJob(jobRecord);
    setLines(linePage || []);
    setEvidence(evidencePage || []);
    setVariations(variationPage || []);
    setClaims(claimPage || []);
    setDefects(defectPage || []);
    setDefectVisits(visitPage || []);
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

  if (loading) return <p className="py-16 text-center text-[16px] text-muted-foreground">Loading job</p>;
  if (!job) return <p className="py-16 text-center text-[16px] text-muted-foreground">This job could not be found.</p>;

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
    if (!window.confirm('Remove this line from the quote?')) return;
    await base44.entities.ScopeLine.delete(line.id);
    await recalcContractSum(lines.filter((item) => item.id !== line.id));
    await load();
  };

  return (
    <div className="space-y-6">
      <Link to="/app" className="inline-flex items-center gap-1.5 font-heading text-[16px] font-bold uppercase tracking-[0.02em] hover:underline">
        <ArrowLeft className="h-4 w-4" /> All jobs
      </Link>

      <header className="border-b-[3px] border-foreground pb-5">
        <p className="eyebrow">
          {job.job_number ? `Job ${job.job_number}` : 'Job'} | {job.builder_name}
        </p>
        <h1 className="mt-1 max-w-3xl text-[40px] font-extrabold leading-[1] sm:text-[56px]">{job.name}</h1>
        {job.site_address ? <p className="mt-2 text-[16px] text-muted-foreground">{job.site_address}</p> : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <Link to={`/jobs/${job.id}/capture`} className="btn-yellow">
            <Camera className="h-5 w-5" /> Take photos
          </Link>
          <button type="button" className="btn-ink" onClick={() => setClaimOpen(true)}>
            <FileText className="h-5 w-5" /> Make a claim
          </button>
          <Link to={`/jobs/${job.id}/variation`} className="btn-line">
            <Plus className="h-5 w-5" /> Extra work
          </Link>
          <button type="button" className="btn-small self-center" onClick={() => setEditJobOpen(true)}>
            Edit job
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-px border-2 border-foreground bg-foreground sm:grid-cols-4">
        <div className="bg-card px-3 py-3">
          <p className="eyebrow">Quote</p>
          <p className="font-heading text-[26px] font-extrabold leading-none">{formatAud(job.contract_sum_ex_gst)}</p>
          <p className="legal">ex GST</p>
        </div>
        <div className="bg-card px-3 py-3">
          <p className="eyebrow">Retention</p>
          <p className="font-heading text-[26px] font-extrabold leading-none">{Number(job.retention_percent || 0)}%</p>
          <p className="legal">Held until {formatDate(job.dlp_end_date) || 'a date not set'}</p>
        </div>
        <div className="bg-card px-3 py-3">
          <p className="eyebrow">Next claim</p>
          <p className="font-heading text-[26px] font-extrabold leading-none">{formatDate(job.next_claim_date) || 'Not set'}</p>
        </div>
        <div className="bg-card px-3 py-3">
          <p className="eyebrow">Photos</p>
          <p className="font-heading text-[26px] font-extrabold leading-none">{evidence.length}</p>
        </div>
      </div>

      <TaskRow
        number="1"
        title="Photos"
        sub="Proof the work was done, with the date and place on each one."
        action={
          <Link to={`/jobs/${job.id}/capture`} className="btn-line">
            <Camera className="h-5 w-5" /> Take photos
          </Link>
        }
      >
        <EvidenceGrid evidence={evidence.slice(0, 6)} emptyLabel="No photos yet. Take one before you start, and one when each line is done." />

        <div className={`${CARD} mt-5`}>
          <div className={CARD_HEAD}>
            <h3 className="text-[20px] font-extrabold">What you quoted</h3>
            <div className={CARD_META}>
              <span>{lines.length} lines</span>
              <button type="button" className={SMALL_ACTION} onClick={() => setAddLineOpen(true)}>
                <Plus className="h-4 w-4" /> Add a line
              </button>
            </div>
          </div>
          <ScopeLineTable lines={lines} evidenceByLine={evidenceByLine} claims={claims} onSave={handleLineSave} onDelete={handleLineDelete} />
        </div>
      </TaskRow>

      <TaskRow
        number="2"
        title="Claims"
        sub={claims.length ? `${claims.length} on this job` : 'Nothing claimed yet'}
        action={
          <button type="button" className="btn-ink" onClick={() => setClaimOpen(true)}>
            <FileText className="h-5 w-5" /> Make a claim
          </button>
        }
      >
        {claims.length ? (
          <div className={CARD}>
            {claims.map((claim) => (
              <Link
                key={claim.id}
                to={`/claims/${claim.id}`}
                className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-foreground px-4 py-4 transition-colors last:border-b-0 hover:bg-secondary"
              >
                <div>
                  <h3 className="text-[24px] font-extrabold leading-none">Claim {claim.claim_number}</h3>
                  <p className="mt-1 text-[14px] text-muted-foreground">
                    {claim.served_at ? `Sent ${formatDate(claim.served_at)}` : 'Not sent'} | {formatAud(claim.amount_claimed_ex_gst)} ex GST
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusPill status={effectiveStatus(claim)} />
                  <span className="text-[15px] font-semibold">{nextActionFor(claim).action}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className={EMPTY}>No claims yet. Take the photos, then make the first claim.</p>
        )}
      </TaskRow>

      <TaskRow
        number="3"
        title="Extra work"
        sub="Anything the builder asked for that is not in the quote."
        action={
          <Link to={`/jobs/${job.id}/variation`} className="btn-line">
            <Plus className="h-5 w-5" /> Record extra work
          </Link>
        }
      >
        {variations.length ? (
          <div className={CARD}>
            {variations.map((variation) => (
              <div key={variation.id} className="flex items-center justify-between gap-4 border-b-2 border-foreground px-4 py-4 last:border-b-0">
                <div className="min-w-0">
                  <p className="text-[16px] font-semibold leading-snug">{variation.description}</p>
                  <p className="mt-1 text-[14px] text-muted-foreground">
                    Asked for by {variation.instructed_by}
                    {variation.sent_at ? ` | Sent ${formatDate(variation.sent_at)}` : ''}
                  </p>
                </div>
                <div className="flex flex-none flex-col items-end gap-2">
                  <span className="num text-[16px]">{formatAud(variation.estimated_amount)}</span>
                  <span className={`tag ${VARIATION_TONE[variation.status] || VARIATION_TONE.sent}`}>
                    {VARIATION_LABEL[variation.status] || variation.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={EMPTY}>None yet. Record extra work the day it is asked for, so it gets paid.</p>
        )}
      </TaskRow>

      <TaskRow number="4" title="Defects" sub="What the builder says needs fixing, and whose fault it is.">
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
