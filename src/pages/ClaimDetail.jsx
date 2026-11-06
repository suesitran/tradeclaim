import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Loader2, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import StatusPill from '@/components/StatusPill';
import EvidenceGrid from '@/components/EvidenceGrid';
import ClaimClock from '@/components/claims/ClaimClock';
import ClaimMoneyCard from '@/components/claims/ClaimMoneyCard';
import ScheduleDialog from '@/components/claims/ScheduleDialog';
import PaymentDialog from '@/components/claims/PaymentDialog';
import ServeDialog from '@/components/claims/ServeDialog';
import DocumentList from '@/components/claims/DocumentList';
import useHolidays from '@/hooks/useHolidays';
import { effectiveStatus } from '@/lib/claims';
import { formatAud, formatDate } from '@/lib/format';
import { ensureNoticeDrafts, noticeDraftFor } from '@/lib/notices';
import { useT } from '@/lib/i18n';

// One line under the buttons that says what to do now and why.
function nowWhat(t, status, claim) {
  switch (status) {
    case 'draft':
      return t('Check the lines and photos, then send it. Sending starts the clock.');
    case 'served':
      return t('The builder has until {date} to say what they will pay.', { date: formatDate(claim.schedule_due_at) });
    case 'ignored':
      return t('The builder missed the date. Send the notice, then record whatever they come back with.');
    case 'scheduled_short':
      return t('They are paying less than you claimed. Open the escalation paper and apply by {date}.', { date: formatDate(claim.apply_by) });
    case 'scheduled_in_full':
      return t('The builder agreed to the full amount. Record the payment when it lands.');
    case 'adjudication_ready':
      return t('The escalation paper is ready. Record the payment when it lands.');
    default:
      return '';
  }
}

export default function ClaimDetail() {
  const t = useT();
  const { claimId } = useParams();
  const { toast } = useToast();
  const [claim, setClaim] = useState(null);
  const [job, setJob] = useState(null);
  const { holidays } = useHolidays(job?.state);
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
        base44.entities.Evidence.filter({ job_id: record.job_id }, '-captured_at', 400),
        base44.entities.Document.filter({ claim_id: claimId }, '-generated_at', 50),
      ]);
      setJob(jobRecord);
      setEvidence(evidencePage || []);
      setDocuments(documentPage || []);
    }
    setLoading(false);

    // The clock has run out: make sure the notice is waiting as a draft.
    if (record && effectiveStatus(record) === 'ignored') {
      const drafted = await ensureNoticeDrafts([record]);
      if (drafted) {
        const refreshed = await base44.entities.Document.filter({ claim_id: claimId }, '-generated_at', 50);
        setDocuments(refreshed || []);
        setClaim(await base44.entities.Claim.get(claimId).catch(() => record));
      }
    }
  };

  useEffect(() => {
    load();
  }, [claimId]);

  const status = claim ? effectiveStatus(claim) : 'draft';
  const noticeDraft = noticeDraftFor(documents);

  const claimLines = useMemo(() => {
    if (!claim) return [];
    const base = claim.lines || [];
    const extra = (claim.variations_included || [])
      .filter((variation) => !base.some((line) => line.variation_id === variation.variation_id))
      .map((variation) => ({
        scope_line_id: null,
        variation_id: variation.variation_id,
        area: t('Extra work'),
        description: variation.description,
        percent_this_claim: 100,
        amount_this_claim: Number(variation.amount || 0),
      }));
    return [...base, ...extra];
  }, [claim]);

  const appendix = useMemo(() => {
    if (!claim) return [];
    const ids = new Set((claim.lines || []).map((line) => line.scope_line_id));
    return (claim.lines || [])
      .map((line) => ({ line, shots: evidence.filter((item) => item.scope_line_id === line.scope_line_id) }))
      .filter((entry) => entry.shots.length && ids.has(entry.line.scope_line_id));
  }, [claim, evidence]);

  const generate = async (type, extra = {}) => {
    setBusy(type);
    // Claim the tab on the tap itself: iPad Safari blocks a window opened after the await below.
    const pdfTab = window.open('', '_blank');
    try {
      const response = await base44.functions.invoke('generateClaimDocument', { claim_id: claim.id, type, ...extra });
      const data = response.data || {};
      if (data.error) {
        if (pdfTab) pdfTab.close();
        toast({ title: t('The PDF could not be made'), description: data.error, variant: 'destructive' });
        return;
      }
      if (data.signed_url) {
        if (pdfTab) {
          pdfTab.opener = null;
          pdfTab.location.href = data.signed_url;
        } else {
          window.open(data.signed_url, '_blank', 'noopener');
        }
      } else if (pdfTab) {
        pdfTab.close();
      }
      if (extra.email) {
        toast({
          title: data.email_sent ? t('Emailed to the builder') : t('PDF saved, but the email did not go'),
          description: data.email_sent ? (data.claim && data.claim.schedule_due_at && extra.serve ? t('They must reply by {date}.', { date: formatDate(data.claim.schedule_due_at) }) : '') : data.email_error,
          variant: data.email_sent ? undefined : 'destructive',
        });
      } else {
        toast({ title: t('PDF ready') });
      }
      await load();
    } catch (error) {
      if (pdfTab) pdfTab.close();
      toast({ title: t('The PDF could not be made'), description: error.message, variant: 'destructive' });
    } finally {
      setBusy('');
    }
  };

  if (loading) return <p className="py-16 text-center text-[16px] text-muted-foreground">{t('Loading claim')}</p>;
  if (!claim) return <p className="py-16 text-center text-[16px] text-muted-foreground">{t('This claim could not be found.')}</p>;

  const working = Boolean(busy);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link to="/claims" className="inline-flex items-center gap-1.5 font-heading text-[16px] font-bold uppercase tracking-[0.02em] hover:underline">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t('All claims')}
        </Link>
        {claim.job_id ? (
          <Link to={`/jobs/${claim.job_id}`} className="inline-flex items-center gap-1.5 font-heading text-[16px] font-bold uppercase tracking-[0.02em] hover:underline">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t('The job')}
          </Link>
        ) : null}
      </div>

      <header className="border-b-[3px] border-foreground pb-5">
        <p className="eyebrow">
          {job ? job.name : t('Job')}
          {job && job.job_number ? ` | ${t('Job {number}', { number: job.job_number })}` : ''}
          {job && job.builder_name ? ` | ${job.builder_name}` : ''}
        </p>
        <div className="mt-1 flex flex-wrap items-end gap-x-5 gap-y-3">
          <h1 className="text-[44px] font-extrabold leading-none sm:text-[56px]">{t('Claim {number}', { number: claim.claim_number })}</h1>
          <StatusPill status={status} legal />
        </div>
        <p className="num mt-2 text-[18px]">{formatAud(claim.amount_claimed_ex_gst)} {t('ex GST')}</p>

        <div className="mt-5 flex flex-wrap gap-3">
          {status === 'draft' ? (
            <button type="button" className="btn-yellow" onClick={() => setServeOpen(true)} disabled={working}>
              <Send className="h-5 w-5" /> {t('Send the claim')}
            </button>
          ) : null}

          {status === 'draft' || status === 'served' || status === 'scheduled_in_full' || status === 'paid' ? (
            <button type="button" className="btn-line" onClick={() => generate('payment_claim')} disabled={working}>
              {busy === 'payment_claim' ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
              {t('Open the claim PDF')}
            </button>
          ) : null}

          {status === 'ignored' ? (
            <>
              <button
                type="button"
                className="btn-yellow"
                onClick={() => generate('notice_of_intention', { email: true, document_id: noticeDraft ? noticeDraft.id : undefined })}
                disabled={working}
              >
                {busy === 'notice_of_intention' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                {t('Send the notice')}
              </button>
              <button type="button" className="btn-line" onClick={() => setScheduleOpen(true)} disabled={working}>
                {t('Builder replied')}
              </button>
            </>
          ) : null}

          {status === 'served' ? (
            <button type="button" className="btn-ink" onClick={() => setScheduleOpen(true)} disabled={working}>
              {t('Builder replied')}
            </button>
          ) : null}

          {status === 'scheduled_short' ? (
            <>
              <button type="button" className="btn-yellow" onClick={() => generate('adjudication_preview')} disabled={working}>
                {busy === 'adjudication_preview' ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
                {t('Open the escalation paper')}
              </button>
              <button type="button" className="btn-line" onClick={() => setScheduleOpen(true)} disabled={working}>
                {t('Change the reply')}
              </button>
            </>
          ) : null}

          {status === 'adjudication_ready' ? (
            <button type="button" className="btn-line" onClick={() => generate('adjudication_preview')} disabled={working}>
              {t('Open the escalation paper')}
            </button>
          ) : null}

          {status !== 'paid' && status !== 'draft' ? (
            <button type="button" className="btn-line" onClick={() => setPaymentOpen(true)} disabled={working}>
              {t('Record payment')}
            </button>
          ) : null}
        </div>
        {nowWhat(t, status, claim) ? <p className="mt-3 max-w-2xl text-[16px]">{nowWhat(t, status, claim)}</p> : null}
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <section className="sheet">
            <div className="sheet-head">
              <h2 className="text-[20px] font-extrabold">{t('What is in this claim')}</h2>
              <span className="text-[14px] text-muted-foreground">
                {formatDate(claim.period_from)} {t('to')} {formatDate(claim.period_to)}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-left">
                <thead>
                  <tr>
                    <th className="border-b-2 border-foreground px-4 py-2 font-heading text-[14px] font-bold uppercase tracking-[0.06em] text-muted-foreground">{t('Line')}</th>
                    <th className="border-b-2 border-foreground px-3 py-2 text-right font-heading text-[14px] font-bold uppercase tracking-[0.06em] text-muted-foreground">{t('Done')}</th>
                    <th className="border-b-2 border-foreground px-4 py-2 text-right font-heading text-[14px] font-bold uppercase tracking-[0.06em] text-muted-foreground">{t('Amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {claimLines.map((line) => (
                    <tr key={line.variation_id || line.scope_line_id} className="border-b border-foreground/30 last:border-b-0">
                      <td className="px-4 py-2.5">
                        <p className="eyebrow">{line.area}</p>
                        <p className="text-[15px] leading-snug">{line.description}</p>
                      </td>
                      <td className="num px-3 py-2.5 text-right text-[15px]">{Math.round(Number(line.percent_this_claim || 0))}%</td>
                      <td className="num px-4 py-2.5 text-right text-[15px]">{formatAud(line.amount_this_claim)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[24px] font-extrabold">{t('Photos attached')}</h2>
              <span className="text-[14px] text-muted-foreground">{t('{count} photos', { count: appendix.reduce((total, entry) => total + entry.shots.length, 0) })}</span>
            </div>
            {appendix.length ? (
              <div className="space-y-4">
                {appendix.map((entry) => (
                  <div key={entry.line.scope_line_id} className="sheet p-4">
                    <p className="eyebrow">{entry.line.area}</p>
                    <p className="mb-3 text-[16px] leading-snug">{entry.line.description}</p>
                    <EvidenceGrid evidence={entry.shots} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="border-l-[6px] border-accent bg-secondary px-4 py-4 text-[16px] text-muted-foreground">
                {t('No photos on these lines yet. Take them on site and they go in the claim.')}
              </p>
            )}
          </section>
        </div>

        <div className="space-y-5">
          <ClaimClock claim={claim} status={status} job={job} />
          <ClaimMoneyCard claim={claim} />

          <section className="sheet">
            <div className="border-b-2 border-foreground px-4 py-3">
              <h2 className="text-[20px] font-extrabold">{t('Paperwork')}</h2>
            </div>
            <DocumentList documents={documents} />
            <p className="legal border-t-2 border-foreground px-4 py-2.5">{t('Every PDF is marked: Draft, for lawyer review.')}</p>
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
        job={job}
        holidays={holidays}
        onSaved={() => {
          toast({ title: t("Builder's reply recorded") });
          load();
        }}
      />

      <PaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        claim={claim}
        onSaved={() => {
          toast({ title: t('Payment recorded') });
          load();
        }}
      />
    </div>
  );
}
