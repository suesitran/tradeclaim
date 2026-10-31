import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { buildVariationNotice } from '../../shared/documents.ts';
import { loadPhotoMap, uploadPdf, emailPdf } from '../../shared/photos.ts';
import { formatAud, toYmd } from '../../shared/clock.ts';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const variationId = body.variation_id;
    if (!variationId) return Response.json({ error: 'variation_id is required' }, { status: 400 });

    const variation = await base44.entities.Variation.get(variationId).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!variation) return Response.json({ error: 'Variation not found' }, { status: 404 });
    const job = await base44.entities.Job.get(variation.job_id).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!job) return Response.json({ error: 'Job not found' }, { status: 404 });

    const sentAt = variation.sent_at || new Date().toISOString();
    const withDate = { ...variation, sent_at: sentAt };

    let photo = null;
    if (variation.photo_uri) {
      const map = await loadPhotoMap(base44, [{ id: variation.id, photo_uri: variation.photo_uri }], 1);
      photo = map[variation.id] || null;
    }

    const bytes = buildVariationNotice({ variation: withDate, job, photo });
    const filename = `variation-notice-job-${job.job_number || job.id}-${variation.id.slice(0, 6)}.pdf`;
    const fileUri = await uploadPdf(base44, bytes, filename);

    let emailResult = { sent: false, error: null };
    if (body.email !== false) {
      emailResult = await emailPdf(base44, {
        to: job.builder_email,
        subject: `Variation notice, ${job.name}, estimated ${formatAud(variation.estimated_amount)} excluding GST`,
        body: `Please find attached a variation notice for ${job.name}.\n\nInstructed by: ${variation.instructed_by}\nWork: ${variation.description}\nEstimated value: ${formatAud(variation.estimated_amount)} excluding GST\n\nPlease confirm in writing that this work is a variation and that the estimated value is accepted.\n\nDraft, for lawyer review.\n\nSent from the Subcontractor Survival Kit.`,
        fileUri,
        filename,
      });
    }

    const document = await base44.entities.Document.create({
      job_id: variation.job_id,
      variation_id: variation.id,
      type: 'variation_notice',
      title: `Variation notice, ${job.name}`,
      file_uri: fileUri,
      generated_at: new Date().toISOString(),
      emailed_to: emailResult.sent ? job.builder_email : '',
      emailed_at: emailResult.sent ? new Date().toISOString() : '',
    });

    const updated = await base44.entities.Variation.update(variation.id, {
      status: 'sent',
      sent_at: sentAt,
      document_id: document.id,
      email_status: emailResult.sent ? `Emailed ${toYmd(new Date())}` : `Not emailed: ${emailResult.error || 'unknown reason'}`,
    });

    const signed = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri, expires_in: 3600 });

    return Response.json({
      variation: updated,
      document,
      signed_url: signed ? signed.signed_url : null,
      email_sent: emailResult.sent,
      email_error: emailResult.error,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}