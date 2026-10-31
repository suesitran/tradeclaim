import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { buildPaymentClaim, buildNoticeOfIntention, buildAdjudicationPreview } from '../../shared/documents.ts';
import { loadPhotoMap, evidenceForLines, uploadPdf, emailPdf } from '../../shared/photos.ts';
import { loadHolidaySet, addBusinessDays, toYmd, formatAud, formatYmdAu } from '../../shared/clock.ts';
import { jurisdictionFor } from '../../shared/jurisdictions.ts';

const TITLES = {
  payment_claim: 'Payment claim',
  notice_of_intention: 'Notice of intention to apply for adjudication',
  adjudication_preview: 'Adjudication preview',
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const claimId = body.claim_id;
    const type = body.type || 'payment_claim';
    if (!claimId) return Response.json({ error: 'claim_id is required' }, { status: 400 });
    if (!TITLES[type]) return Response.json({ error: 'Unknown document type' }, { status: 400 });

    const claim = await base44.entities.Claim.get(claimId).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!claim) return Response.json({ error: 'Claim not found' }, { status: 404 });
    const job = await base44.entities.Job.get(claim.job_id).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!job) return Response.json({ error: 'Job not found' }, { status: 404 });

    let current = { ...claim };
    const jurisdiction = jurisdictionFor(job.state);

    if (body.serve && type === 'payment_claim' && !current.served_at) {
      const servedAt = body.served_at || toYmd(new Date());
      const holidays = await loadHolidaySet(base44, job.state);
      const dueAt = addBusinessDays(servedAt, jurisdiction.scheduleDays, holidays, job.state);
      current = await base44.entities.Claim.update(claim.id, {
        served_at: servedAt,
        schedule_due_at: dueAt,
        status: 'served',
      });
    }

    const lineIds = (current.lines || []).map((line) => line.scope_line_id);
    const page = await base44.entities.Evidence.filter({ job_id: current.job_id }, { limit: 400, sort: '-captured_at' });
    const allEvidence = page && page.items ? page.items : [];
    const lineEvidence = evidenceForLines(allEvidence, (current.lines || []).map((line) => ({ scope_line_id: line.scope_line_id })));

    let bytes;
    let title;
    if (type === 'payment_claim') {
      const photos = await loadPhotoMap(base44, lineEvidence, 36);
      bytes = buildPaymentClaim({ claim: current, job, evidence: lineEvidence, photos });
      title = `Payment claim ${current.claim_number}`;
    } else if (type === 'notice_of_intention') {
      bytes = buildNoticeOfIntention({ claim: current, job });
      title = `Notice of intention, claim ${current.claim_number}`;
      current = await base44.entities.Claim.update(claim.id, {
        escalated: true,
        escalation_stage: 'notice_of_intention',
      });
    } else {
      bytes = buildAdjudicationPreview({ claim: current, job, evidence: lineEvidence });
      title = `Adjudication preview, claim ${current.claim_number}`;
      current = await base44.entities.Claim.update(claim.id, {
        escalated: true,
        escalation_stage: 'adjudication_preview',
        status: current.paid_at ? current.status : 'adjudication_ready',
      });
    }

    const filename = `${type.replace(/_/g, '-')}-job-${job.job_number || job.id}-claim-${current.claim_number}.pdf`;
    const fileUri = await uploadPdf(base44, bytes, filename);

    let emailResult = { sent: false, error: null };
    if (body.email) {
      const subject =
        type === 'payment_claim'
          ? `Payment claim ${current.claim_number}, ${job.name}, ${formatAud(current.amount_claimed_ex_gst)} excluding GST`
          : `Notice of intention to apply for adjudication, claim ${current.claim_number}, ${job.name}`;
      const intro =
        type === 'payment_claim'
          ? `Please find attached payment claim ${current.claim_number} for ${job.name}, served ${formatYmdAu(current.served_at)}. This is a payment claim made under the ${jurisdiction.act}. A payment schedule is required within ${jurisdiction.scheduleDays} ${jurisdiction.unit}, by ${formatYmdAu(current.schedule_due_at)}.`
          : `Please find attached a notice of intention to apply for adjudication of claim ${current.claim_number} for ${job.name}. A payment schedule was required by ${formatYmdAu(current.schedule_due_at)} and has not been received. ${
              jurisdiction.noticeDays
                ? `A payment schedule is now required within ${jurisdiction.noticeDays} ${jurisdiction.unit} of this notice.`
                : 'An application for adjudication may now be made.'
            }`;
      emailResult = await emailPdf(base44, {
        to: job.builder_email,
        subject,
        body: `${intro}\n\nDraft, for lawyer review.\n\nSent from the Subcontractor Survival Kit.`,
        fileUri,
        filename,
      });
    }

    const document = await base44.entities.Document.create({
      job_id: current.job_id,
      claim_id: current.id,
      type,
      title,
      file_uri: fileUri,
      generated_at: new Date().toISOString(),
      emailed_to: emailResult.sent ? job.builder_email : '',
      emailed_at: emailResult.sent ? new Date().toISOString() : '',
    });

    const signed = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri, expires_in: 3600 });

    return Response.json({
      claim: current,
      document,
      signed_url: signed ? signed.signed_url : null,
      email_sent: emailResult.sent,
      email_error: emailResult.error,
      evidence_count: lineEvidence.length,
      line_ids: lineIds.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}