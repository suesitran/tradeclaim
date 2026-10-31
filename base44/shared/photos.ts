import { loadPhoto } from './pdf.ts';

export async function loadPhotoMap(base44: any, evidence: any[], limit = 36): Promise<Record<string, any>> {
  const selected = (evidence || []).slice(0, limit);
  const map: Record<string, any> = {};
  for (let i = 0; i < selected.length; i += 6) {
    const batch = selected.slice(i, i + 6);
    const results = await Promise.allSettled(batch.map((item: any) => loadPhoto(base44, item.photo_uri)));
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        map[batch[index].id] = result.value;
      }
    });
  }
  return map;
}

export function evidenceForLines(evidence: any[], lines: any[]): any[] {
  const ids = new Set((lines || []).map((line: any) => line.scope_line_id));
  return (evidence || []).filter((item: any) => ids.has(item.scope_line_id));
}

export async function uploadPdf(base44: any, bytes: Uint8Array, filename: string): Promise<string> {
  const file = new File([bytes], filename, { type: 'application/pdf' });
  const uploaded: any = await base44.asServiceRole.integrations.Core.UploadPrivateFile({ file });
  if (!uploaded || !uploaded.file_uri) throw new Error('The PDF could not be stored');
  return uploaded.file_uri;
}

export async function emailPdf(base44: any, payload: any): Promise<any> {
  if (!payload.to) return { sent: false, error: 'No builder email address on this job' };
  try {
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: payload.to,
      subject: payload.subject,
      body: payload.body,
      attachments: [{ filename: payload.filename, file_url: payload.fileUri }],
      category: 'transactional',
    });
    return { sent: true };
  } catch (error: any) {
    return { sent: false, error: error.message || 'The email could not be sent' };
  }
}