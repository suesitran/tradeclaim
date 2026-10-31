import { jsPDF } from 'npm:jspdf@4.0.0';

export const M = 18;
export const PAGE_W = 210;
export const PAGE_H = 297;
export const CONTENT_W = PAGE_W - M * 2;
export const BOTTOM = PAGE_H - 26;

export function newDoc(): any {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  doc.setFont('helvetica', 'normal');
  return doc;
}

export function banner(doc: any, title: string, subtitle: string): number {
  doc.setFillColor(17, 24, 39);
  doc.rect(0, 0, PAGE_W, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(title, M, 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(subtitle, M, 23);
  doc.setTextColor(17, 24, 39);
  return 40;
}

export function sectionTitle(doc: any, text: string, y: number): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text(text.toUpperCase(), M, y);
  doc.setDrawColor(210, 214, 220);
  doc.line(M, y + 1.8, PAGE_W - M, y + 1.8);
  doc.setFont('helvetica', 'normal');
  return y + 7;
}

export function labelValue(doc: any, x: number, y: number, label: string, value: string, width: number): number {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(110, 118, 128);
  doc.text(label.toUpperCase(), x, y);
  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39);
  const lines = doc.splitTextToSize(String(value || ''), width);
  doc.text(lines, x, y + 4.6);
  return y + 4.6 + lines.length * 4.4;
}

export function paragraph(doc: any, text: string, x: number, y: number, width: number, size = 9.5): number {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(size);
  doc.setTextColor(34, 41, 51);
  const lines = doc.splitTextToSize(text, width);
  doc.text(lines, x, y);
  return y + lines.length * (size * 0.48);
}

export function ensureSpace(doc: any, y: number, needed: number, header: () => number): number {
  if (y + needed < BOTTOM) return y;
  doc.addPage();
  return header();
}

export function finalise(doc: any): Uint8Array {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i += 1) {
    doc.setPage(i);
    doc.setDrawColor(210, 214, 220);
    doc.line(M, PAGE_H - 20, PAGE_W - M, PAGE_H - 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(120, 70, 20);
    doc.text('Draft, for lawyer review.', M, PAGE_H - 14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(110, 118, 128);
    doc.text(`Page ${i} of ${total}`, PAGE_W - M, PAGE_H - 14, { align: 'right' });
  }
  return new Uint8Array(doc.output('arraybuffer'));
}

export async function loadPhoto(base44: any, fileUri: string): Promise<any> {
  if (!fileUri) return null;
  try {
    const signed: any = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri, expires_in: 600 });
    const url = signed && signed.signed_url;
    if (!url) return null;
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    const contentType = String(res.headers.get('content-type') || 'image/jpeg');
    const format = contentType.includes('png') ? 'PNG' : contentType.includes('webp') ? 'WEBP' : 'JPEG';
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)) as any);
    }
    return { data: btoa(binary), format };
  } catch {
    return null;
  }
}

export const STAGE_LABEL: Record<string, string> = {
  before: 'Before',
  finish: 'Finish',
  clear: 'Clear to next trade',
};

export function locationLabel(lat?: number, lon?: number): string {
  if (typeof lat !== 'number' || typeof lon !== 'number') return 'No location recorded';
  return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
}