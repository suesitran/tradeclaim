import {
  newDoc, banner, sectionTitle, labelValue, paragraph, ensureSpace, finalise,
  STAGE_LABEL, locationLabel, M, PAGE_W, CONTENT_W,
} from './pdf.ts';
import { formatAud, formatYmdAu } from './clock.ts';

function money(value: any): string {
  return formatAud(Number(value || 0));
}

function partyRows(doc: any, y: number, claim: any, job: any): number {
  const colW = CONTENT_W / 2 - 8;
  let ly = labelValue(doc, M, y, 'Claimant', claim.claimant_name || 'The subcontractor', colW);
  ly = labelValue(doc, M, ly + 3.5, 'Contact', claim.claimant_email || '', colW);
  let ry = labelValue(doc, M + CONTENT_W / 2 + 4, y, 'Respondent', job.builder_name || '', colW);
  ry = labelValue(doc, M + CONTENT_W / 2 + 4, ry + 3.5, 'Contact', job.builder_email || '', colW);
  return Math.max(ly, ry) + 6;
}

function scopeTable(doc: any, claim: any, header: () => number, startY: number): number {
  let y = startY;
  const pctX = M + 138;
  const amtX = PAGE_W - M;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(110, 118, 128);
  doc.text('#', M, y);
  doc.text('SCOPE LINE', M + 8, y);
  doc.text('THIS CLAIM', pctX, y, { align: 'right' });
  doc.text('AMOUNT', amtX, y, { align: 'right' });
  doc.setDrawColor(220, 224, 230);
  doc.line(M, y + 2, PAGE_W - M, y + 2);
  y += 7;

  const lines = claim.lines || [];
  lines.forEach((line: any, index: number) => {
    const text = `${line.area ? line.area + ': ' : ''}${line.description}`;
    doc.setFontSize(8.5);
    const descLines = doc.splitTextToSize(text, 112);
    const rowHeight = descLines.length * 4 + 3;
    y = ensureSpace(doc, y, rowHeight + 4, header);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(17, 24, 39);
    doc.text(String(index + 1), M, y);
    doc.text(descLines, M + 8, y);
    doc.text(`${Math.round(Number(line.percent_this_claim || 0))}%`, pctX, y, { align: 'right' });
    doc.text(money(line.amount_this_claim), amtX, y, { align: 'right' });
    y += rowHeight;
    doc.setDrawColor(238, 240, 243);
    doc.line(M, y - 1, PAGE_W - M, y - 1);
  });
  return y;
}

export function buildPaymentClaim(input: any): any {
  const { claim, job, evidence, photos } = input;
  const doc = newDoc();
  const header = () => banner(doc, 'Payment claim', 'Building and Construction Industry Security of Payment Act 2002 (Vic)');
  let y = header();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`Claim ${claim.claim_number}`, M, y + 2);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(`Claim period ${formatYmdAu(claim.period_from)} to ${formatYmdAu(claim.period_to)}`, M, y + 8);
  y += 16;

  y = partyRows(doc, y, claim, job);
  y = sectionTitle(doc, 'The work', y);
  y = labelValue(doc, M, y, 'Project', `${job.name}${job.job_number ? ' (Job ' + job.job_number + ')' : ''}`, CONTENT_W);
  y = labelValue(doc, M, y + 3.5, 'Site address', job.site_address || '', CONTENT_W);
  y += 8;

  doc.setFillColor(246, 243, 237);
  doc.rect(M, y, CONTENT_W, 15, 'F');
  paragraph(doc, 'This is a payment claim made under the Building and Construction Industry Security of Payment Act 2002 (Vic).', M + 4, y + 6, CONTENT_W - 8, 9.5);
  y += 24;

  y = sectionTitle(doc, 'Scope lines claimed', y);
  y = scopeTable(doc, claim, header, y);
  y += 6;

  const variations = claim.variations_included || [];
  if (variations.length) {
    y = ensureSpace(doc, y, 30, header);
    y = sectionTitle(doc, 'Variations included', y);
    variations.forEach((variation: any) => {
      y = ensureSpace(doc, y, 8, header);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(doc.splitTextToSize(variation.description || 'Variation', 130), M, y);
      doc.text(money(variation.amount), PAGE_W - M, y, { align: 'right' });
      y += 6;
    });
    y += 4;
  }

  y = ensureSpace(doc, y, 62, header);
  y = sectionTitle(doc, 'Claim summary', y);
  const previouslyPaid = Number(claim.previously_paid || 0);
  const rows = [
    ['Amount claimed, excluding GST', money(claim.amount_claimed_ex_gst)],
    ['GST at 10%', money(claim.gst)],
    ['Total including GST', money(claim.amount_claimed_inc_gst)],
    ['Previously paid', money(previouslyPaid)],
    ['Amount now claimed, including GST', money(Number(claim.amount_claimed_inc_gst || 0) - previouslyPaid)],
  ];
  rows.forEach((row, index) => {
    const isLast = index === rows.length - 1;
    doc.setFont('helvetica', isLast ? 'bold' : 'normal');
    doc.setFontSize(isLast ? 10 : 9);
    doc.setTextColor(17, 24, 39);
    doc.text(row[0], M + 4, y);
    doc.text(row[1], PAGE_W - M - 4, y, { align: 'right' });
    y += 6;
  });
  y += 8;

  y = ensureSpace(doc, y, 26, header);
  y = sectionTitle(doc, 'Signature', y);
  paragraph(doc, 'Signed for the claimant:', M, y, CONTENT_W, 9);
  y += 12;
  doc.setDrawColor(17, 24, 39);
  doc.line(M, y, M + 60, y);
  doc.line(M + 90, y, M + 140, y);
  doc.setFontSize(7.5);
  doc.setTextColor(110, 118, 128);
  doc.text('Authorised signatory', M, y + 4);
  doc.text('Date', M + 90, y + 4);

  // Evidence appendix
  doc.addPage();
  let ay = banner(doc, 'Evidence appendix', `Claim ${claim.claim_number}  |  Photos recorded against the scope lines in this claim`);
  const byLine = new Map<string, any[]>();
  (evidence || []).forEach((item: any) => {
    if (!byLine.has(item.scope_line_id)) byLine.set(item.scope_line_id, []);
    byLine.get(item.scope_line_id)!.push(item);
  });
  const claimedLines = (claim.lines || []).filter((line: any) => byLine.has(line.scope_line_id));
  if (!claimedLines.length) {
    paragraph(doc, 'No photos have been recorded against the lines in this claim.', M, ay, CONTENT_W);
  }
  claimedLines.forEach((line: any) => {
    const shots = byLine.get(line.scope_line_id)!.slice(0, 6);
    ay = ensureSpace(doc, ay, 64, () => banner(doc, 'Evidence appendix', 'Continued'));
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(17, 24, 39);
    const titleLines = doc.splitTextToSize(`${line.area ? line.area + ': ' : ''}${line.description}`, CONTENT_W);
    doc.text(titleLines, M, ay);
    ay += titleLines.length * 4.2 + 2;
    let x = M;
    shots.forEach((shot: any, index: number) => {
      if (index > 0 && index % 3 === 0) {
        x = M;
        ay += 52;
      }
      const photo = photos[shot.id];
      if (photo) {
        doc.addImage(photo.data, photo.format, x, ay, 54, 40);
      } else {
        doc.setDrawColor(205, 210, 216);
        doc.rect(x, ay, 54, 40);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(110, 118, 128);
        doc.text('Photo unavailable', x + 3, ay + 8);
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(17, 24, 39);
      doc.text(STAGE_LABEL[shot.stage] || shot.stage || '', x, ay + 43.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(90, 99, 112);
      doc.text(
        `${formatYmdAu(String(shot.captured_at || '').slice(0, 10))}  |  ${locationLabel(shot.latitude, shot.longitude)}`,
        x,
        ay + 46.8,
      );
      x += 60;
    });
    ay += 52;
  });

  return finalise(doc);
}

export function buildNoticeOfIntention(input: any): any {
  const { claim, job } = input;
  const doc = newDoc();
  let y = banner(doc, 'Notice of intention to apply for adjudication', 'Building and Construction Industry Security of Payment Act 2002 (Vic)');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('To the respondent', M, y);
  y += 6;
  y = labelValue(doc, M, y, 'Respondent', job.builder_name || '', CONTENT_W);
  y = labelValue(doc, M, y + 3.5, 'Contact', job.builder_email || '', CONTENT_W);
  y += 8;

  y = sectionTitle(doc, 'The payment claim', y);
  y = labelValue(doc, M, y, 'Claim', `Claim ${claim.claim_number}, served ${formatYmdAu(claim.served_at)}`, CONTENT_W);
  y = labelValue(doc, M, y + 3.5, 'Amount claimed, excluding GST', money(claim.amount_claimed_ex_gst), CONTENT_W);
  y = labelValue(doc, M, y + 3.5, 'Project', `${job.name}${job.site_address ? ', ' + job.site_address : ''}`, CONTENT_W);
  y += 8;

  y = sectionTitle(doc, 'The payment schedule', y);
  y = labelValue(doc, M, y, 'Payment schedule was due', formatYmdAu(claim.schedule_due_at), CONTENT_W);
  y = labelValue(doc, M, y + 3.5, 'Payment schedule received', claim.schedule_received_at ? formatYmdAu(claim.schedule_received_at) : 'None as at the date of this notice', CONTENT_W);
  y += 9;

  const body = `The payment claim identified above was served on the respondent on ${formatYmdAu(claim.served_at)}. A payment schedule was required by ${formatYmdAu(claim.schedule_due_at)}. No payment schedule has been received.`;
  y = paragraph(doc, body, M, y, CONTENT_W, 9.5) + 5;
  const body2 = 'The respondent is given 2 business days from service of this notice to provide a payment schedule setting out the amount it proposes to pay and the reasons for any amount withheld. If a payment schedule is not received within that period, an application for adjudication of the payment claim will be made without further notice.';
  y = paragraph(doc, body2, M, y, CONTENT_W, 9.5) + 8;

  y = sectionTitle(doc, 'Signature', y);
  paragraph(doc, 'Signed for the claimant:', M, y, CONTENT_W, 9);
  y += 12;
  doc.setDrawColor(17, 24, 39);
  doc.line(M, y, M + 60, y);
  doc.line(M + 90, y, M + 140, y);
  doc.setFontSize(7.5);
  doc.setTextColor(110, 118, 128);
  doc.text('Authorised signatory', M, y + 4);
  doc.text('Date', M + 90, y + 4);

  return finalise(doc);
}

export function buildAdjudicationPreview(input: any): any {
  const { claim, job, evidence } = input;
  const doc = newDoc();
  let y = banner(doc, 'Adjudication preview', 'Cover sheet and evidence index only. This is not an application.');

  const disputed = Number(claim.amount_claimed_ex_gst || 0) - Number(claim.scheduled_amount || 0);
  y = sectionTitle(doc, 'The dispute', y);
  y = labelValue(doc, M, y, 'Claim', `Claim ${claim.claim_number}`, CONTENT_W);
  y = labelValue(doc, M, y + 3.5, 'Project', `${job.name}${job.job_number ? ' (Job ' + job.job_number + ')' : ''}`, CONTENT_W);
  y = labelValue(doc, M, y + 3.5, 'Respondent', job.builder_name || '', CONTENT_W);
  y += 4;
  const cols = [
    ['Served', formatYmdAu(claim.served_at), 'Schedule received', claim.schedule_received_at ? formatYmdAu(claim.schedule_received_at) : 'None'],
    ['Claimed, excluding GST', money(claim.amount_claimed_ex_gst), 'Scheduled', money(claim.scheduled_amount)],
    ['Amount in dispute, excluding GST', money(disputed), 'Apply by', formatYmdAu(claim.apply_by)],
  ];
  cols.forEach((row) => {
    const left = labelValue(doc, M, y, row[0], row[1], 78);
    const right = labelValue(doc, M + 96, y, row[2], row[3], 78);
    y = Math.max(left, right) + 4;
  });

  y += 4;
  y = sectionTitle(doc, 'Reasons given for withholding', y);
  paragraph(doc, claim.schedule_reasons || 'No reasons recorded.', M, y, CONTENT_W, 9.5);
  y += 12;

  y = sectionTitle(doc, 'Scope lines in dispute', y);
  const byLine = new Map<string, any[]>();
  (evidence || []).forEach((item: any) => {
    if (!byLine.has(item.scope_line_id)) byLine.set(item.scope_line_id, []);
    byLine.get(item.scope_line_id)!.push(item);
  });
  const disputeLines = (claim.lines || []).filter((line: any) => byLine.has(line.scope_line_id));
  if (!disputeLines.length) {
    paragraph(doc, 'No photos on record for the lines in this claim.', M, y, CONTENT_W, 9.5);
  }
  disputeLines.forEach((line: any) => {
    const shots = byLine.get(line.scope_line_id)!;
    y = ensureSpace(doc, y, 12 + shots.length * 5, () => banner(doc, 'Adjudication preview', 'Evidence index, continued'));
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(17, 24, 39);
    doc.text(doc.splitTextToSize(`${line.area ? line.area + ': ' : ''}${line.description}`, CONTENT_W), M, y);
    y += 5;
    shots.forEach((shot: any) => {
      y = ensureSpace(doc, y, 6, () => banner(doc, 'Adjudication preview', 'Evidence index, continued'));
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(90, 99, 112);
      doc.text(
        `${STAGE_LABEL[shot.stage] || shot.stage}  |  ${formatYmdAu(String(shot.captured_at || '').slice(0, 10))}  |  ${locationLabel(shot.latitude, shot.longitude)}`,
        M + 4,
        y,
      );
      y += 4.4;
    });
    y += 3;
  });

  return finalise(doc);
}

export function buildVariationNotice(input: any): any {
  const { variation, job, photo } = input;
  const doc = newDoc();
  let y = banner(doc, 'Variation notice', 'Notice of instructed work outside the quoted scope');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('To the respondent', M, y);
  y += 6;
  y = labelValue(doc, M, y, 'Builder', job.builder_name || '', CONTENT_W);
  y = labelValue(doc, M, y + 3.5, 'Contact', job.builder_email || '', CONTENT_W);
  y += 8;

  y = sectionTitle(doc, 'The instruction', y);
  y = labelValue(doc, M, y, 'Project', `${job.name}${job.job_number ? ' (Job ' + job.job_number + ')' : ''}`, CONTENT_W);
  y = labelValue(doc, M, y + 3.5, 'Instructed by', variation.instructed_by || '', CONTENT_W);
  y = labelValue(doc, M, y + 3.5, 'Date and time instructed', variation.instructed_at ? variation.instructed_at.replace('T', ' ').slice(0, 16) : '', CONTENT_W);
  y = labelValue(doc, M, y + 3.5, 'Estimated value, excluding GST', money(variation.estimated_amount), CONTENT_W);
  y += 6;

  y = sectionTitle(doc, 'The work', y);
  y = paragraph(doc, variation.description || '', M, y, CONTENT_W, 9.5) + 8;

  if (photo) {
    y = ensureSpace(doc, y, 66, () => banner(doc, 'Variation notice', 'Continued'));
    doc.addImage(photo.data, photo.format, M, y, 80, 60);
    y += 64;
  }

  y = ensureSpace(doc, y, 40, () => banner(doc, 'Variation notice', 'Continued'));
  const note = 'This notice records work instructed outside the quoted scope and is sent on the day of instruction. Please confirm in writing that the work is a variation and that the estimated value is accepted.';
  y = paragraph(doc, note, M, y, CONTENT_W, 9.5) + 10;

  y = sectionTitle(doc, 'Signature', y);
  paragraph(doc, 'Sent for the claimant:', M, y, CONTENT_W, 9);
  y += 12;
  doc.setDrawColor(17, 24, 39);
  doc.line(M, y, M + 60, y);
  doc.setFontSize(7.5);
  doc.setTextColor(110, 118, 128);
  doc.text('Authorised signatory', M, y + 4);
  doc.text(`Sent ${formatYmdAu(String(variation.sent_at || '').slice(0, 10))}`, M + 90, y + 4);

  return finalise(doc);
}