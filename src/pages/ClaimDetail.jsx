import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Loader2, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import StatusPill from '@/components/StatusPill';
import EvidenceGrid from '@/components/EvidenceGrid';
import ClaimClock from '@/components/claims/ClaimClock';
import ClaimMoneyCard from '@/components/claims/ClaimMoneyCard';
import ScheduleDialog from '@/components/claims/ScheduleDialog';
import PaymentDialog from '@/components/claims/PaymentDialog';
import ServeDialog from '@/components/claims/ServeDialog';
import useHolidays from '@/hooks/useHolidays';
import { effectiveStatus } from '@/lib/claims';
import { formatAud, formatDate } from '@/lib/format';

const DOC_LABELS = {
  payment_claim: 'Payment claim',
  variation_notice: 'Variation notice',
  notice_of_intention: 'Notice of intention',
  adjudication_preview: 'Adjudication preview',
};

export default function ClaimDetail() {
  const { claimId } = useParams();
  const { toast } = useToast();
  const { holidays } = useHolidays();
  const [claim, setClaim] = useState(null);
  const [job, setJob] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [serveOpen, setServeOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const load = async () => {
    const record = await base44.entities.Claim.get(claimId).catch(() => null);
    setClaim(record);
    if (record) {
      const [jobRecord, evidencePage, documentPage] = await Promise.all([
        base44.entities.Job.get(record.job_id).catch(() => null),
        base44.entities.Evidence.filter({ job_id: record.job_id }, { limit: 400, sort: '-captured_at' }),
        base44.entities.Document.filter({ claim_id: claimId }, { limit: 50, sort: '-generated_at' }),
      ]);
      setJob(jobRecord);
      setEvidence((evidencePage && evidencePage.items) || []);
      setDocuments((documentPage && documentPage.items) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [claimId]);

  const status = claim ? effectiveStatus(claim) : 'draft';

  const appendix = useMemo(() => {
    if (!claim) return [];
    const ids = new Set((claim.lines || []).map((line) => line.scope_line_id));
    return (claim.lines || [])
      .map((line) => ({ line, shots: evidence.filter((item) => item.scope_line_id === line.scope_line_id) }))
      .filter((entry) => entry.shots.length && ids.has(entry.line.scope_line_id));
  }, [claim, evidence]);

  const generate = async (type, extra = {}) => {
    setBusy(type);
    try {
      const response = await base44.functions.invoke('generateClaimDocument', { claim_id: claim.id, type, ...extra });
      const data = response.data || {};
      if (data.error) {
        toast({ title: 'The document could not be generated', description: data.error, variant: 'destructive' });
        return;
      }
      if (data.signed_url) window.open(data.signed_url, '_blank', 'noopener');
      if (extra.email) {
        toast({
          title: data.email_sent ? 'Emailed to the builder' : 'PDF saved, email not sent',
          description: data.email_sent ? (data.claim && data.claim.schedule_due_at && extra.serve ? `Payment schedule due ${formatDate(data.claim.schedule_due_at)}.` : '') : data.email_error,
          variant: data.email_sent ? undefined : 'destructive',
        });
      } else {
        toast({ title: 'Document ready' });
      }
      await load();
    } catch (error) {
      toast({ title: 'The document could not be generated', description: error.message, variant: 'destructive' });
    } finally {
      setBusy('');
    }
  };

  const openDocument = async (fileUri) => {
    try {
      const result = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri, expires_in: 600 });
      if (result && result.signed_url) window.open(result.signed_url, '_blank', 'noopener');
    } catch (error) {
      toast({ title: 'The PDF could not be opened', description: error.message, variant: 'destructive' });
    }
  };

  if (loading) return <p className="py-16 text-center text-sm text-muted-foreground">Loading claim</p>;
  if (!claim) return <p className="py-16 text-center text-sm text-muted-foreground">This claim could not be found.</p>;

  const working = Boolean(busy);

  return (
    <div className="space-y-6">
      <Link to="/claims" className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> All claims
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {job ? job.name : 'Job'}{job && job.job_number ? `  |  Job ${job.job_number}` : ''}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-3xl font-semibold tracking-tight">Claim {claim.claim_number}</h1>
            <StatusPill status={status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatAud(claim.amount_claimed_ex_gst)} excluding GST{job && job.builder_name ? `  |  ${job.builder_name}` : ''}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {status === 'draft' ? (
            <Button className="bg-accent text-accent-foreground" onClick={() => setServeOpen(true)} disabled={working}>
              <Send className="mr-2 h-4 w-4" /> Serve and email
            </Button>
          ) : null}

          {status === 'draft' || status === 'served' || status === 'scheduled_in_full' || status === 'paid' ? (
            <Button variant="outline" onClick={() => generate('payment_claim')} disabled={working}>
              {busy === 'payment_claim' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
              Payment claim PDF
            </Button>
          ) : null}

          {status === 'ignored' ? (
            <>
              <Button className="bg-accent text-accent-foreground" onClick={() => generate('notice_of_intention', { email: true })} disabled={working}>
                {busy === 'notice_of_intention' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Send notice of intention
              </Button>
              <Button variant="outline" onClick={() => setScheduleOpen(true)} disabled={working}>Record a schedule</Button>
            </>
          ) : null}

          {status === 'served' ? (
            <Button variant="outline" onClick={() => setScheduleOpen(true)} disabled={working}>Record payment schedule</Button>
          ) : null}

          {status === 'scheduled_short' ? (
            <>
              <Button className="bg-accent text-accent-foreground" onClick={() => generate('adjudication_preview')} disabled={working}>
                {busy === 'adjudication_preview' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                Open adjudication preview
              </Button>
              <Button variant="outline" onClick={() => setScheduleOpen(true)} disabled={working}>Amend schedule</Button>
            </>
          ) : null}

          {status === 'adjudication_ready' ? (
            <Button variant="outline" onClick={() => generate('adjudication_preview')} disabled={working}>Reopen adjudication preview</Button>
          ) : null}

          {status !== 'paid' && status !== 'draft' ? (
            <Button variant="outline" onClick={() => setPaymentOpen(true)} disabled={working}>Record payment</Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <section className="overflow-hidden rounded-[4px] border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h2 className="font-heading text-sm font-semibold">Scope lines in this claim</h2>
              <span className="text-[11px] text-muted-foreground">
                {formatDate(claim.period_from)} to {formatDate(claim.period_to)}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    <th className="px-5 py-2 font-medium">Scope line</th>
                    <th className="px-3 py-2 text-right font-medium">This claim</th>
                    <th className="px-5 py-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(claim.lines || []).map((line) => (
                    <tr key={line.scope_line_id} className="border-b border-border last:border-b-0">
                      <td className="px-5 py-2.5">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{line.area}</p>
                        <p className="text-[12px] leading-snug">{line.description}</p>
                      </td>
                      <td className="num px-3 py-2.5 text-right text-[12px]">{Math.round(Number(line.percent_this_claim || 0))}%</td>
                      <td className="num px-5 py-2.5 text-right text-[12px]">{formatAud(line.amount_this_claim)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(claim.variations_included || []).length ? (
              <div className="border-t border-border px-5 py-3">
                <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Variations included</p>
                {(claim.variations_included || []).map((variation) => (
                  <div key={variation.variation_id} className="mt-1.5 flex items-start justify-between gap-3 text-[12px]">
                    <span className="flex-1">{variation.description}</span>
                    <span className="num">{formatAud(variation.amount)}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-sm font-semibold">Evidence appendix</h2>
              <span className="text-[11px] text-muted-foreground">{appendix.reduce((total, entry) => total + entry.shots.length, 0)} photos</span>
            </div>
            {appendix.length ? (
              <div className="space-y-4">
                {appendix.map((entry) => (
                  <div key={entry.line.scope_line_id} className="rounded-[4px] border border-border bg-card p-4">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{entry.line.area}</p>
                    <p className="mb-3 text-[13px] leading-snug">{entry.line.description}</p>
                    <EvidenceGrid evidence={entry.shots} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-[4px] border border-dashed border-border bg-card px-4 py-6 text-sm text-muted-foreground">
                No photos recorded against these lines yet. Capture them on site and they appear in the appendix.
              </p>
            )}
          </section>
        </div>

        <div className="space-y-5">
          <ClaimClock claim={claim} status={status} />
          <ClaimMoneyCard claim={claim} />

          <section className="rounded-[4px] border border-border bg-card">
            <div className="border-b border-border px-5 py-3">
              <h2 className="font-heading text-sm font-semibold">Documents</h2>
            </div>
            {documents.length ? (
              <div className="divide-y divide-border">
                {documents.map((document) => (
                  <button
                    key={document.id}
                    type="button"
                    onClick={() => openDocument(document.file_uri)}
                    className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition-colors hover:bg-secondary/60"
                  >
                    <div>
                      <p className="text-[12px]">{DOC_LABELS[document.type] || document.type}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDate(String(document.generated_at || '').slice(0, 10))}
                        {document.emailed_to ? '  |  Emailed' : ''}
                      </p>
                    </div>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="px-5 py-5 text-[12px] text-muted-foreground">No documents generated yet.</p>
            )}
            <p className="border-t border-border px-5 py-2.5 text-[10px] text-muted-foreground">Every document is footed: Draft, for lawyer review.</p>
          </section>
        </div>
      </div>

      <ServeDialog
        open={serveOpen}
        onOpenChange={setServeOpen}
        claim={claim}
        job={job}
        holidays={holidays}
        busy={busy === 'payment_claim'}
        onServe={async (servedAt) => {
          await generate('payment_claim', { serve: true, email: true, served_at: servedAt });
          setServeOpen(false);
        }}
      />

      <ScheduleDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        claim={claim}
        holidays={holidays}
        onSaved={() => {
          toast({ title: 'Payment schedule recorded' });
          load();
        }}
      />

      <PaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        claim={claim}
        onSaved={() => {
          toast({ title: 'Payment recorded' });
          load();
        }}
      />
    </div>
  );
}