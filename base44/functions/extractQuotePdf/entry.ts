import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const round2 = (value) => Math.round(Number(value || 0) * 100) / 100;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const fileUrl = String(body.file_url || '').trim();
    if (!fileUrl) return Response.json({ error: 'file_url is required' }, { status: 400 });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are reading a subcontract quote from an Australian finishing trade (painting, plastering and linings, tiling, carpentry and joinery, rendering, suspended ceilings, waterproofing) so it can be imported into a payment claim tool.

Read the whole document and return every quoted item as a separate scope line.

Rules:
- One scope line per quoted wording. If a line covers several distinct tasks or areas, split it into separate lines rather than merging them.
- Put the level, block, room or area in "area" (for example "L1 Apartments"). Leave it blank if the quote gives none.
- "description" is the wording of the work, without the area, quantities, rates or money.
- "quantity" is the number quoted, "unit" is the unit of measure as written (m2, lm, no, item, hr). Use 0 and an empty unit when the quote does not give them.
- "rate" is dollars per unit excluding GST. Use 0 when the quote does not give a rate.
- "amount" is the line total excluding GST. Work it out from quantity times rate when the quote only gives those. Use 0 when neither is available.
- Never invent an item, a quantity, a rate or a total that is not in the document. Skip headings, subtotals, GST lines, terms and conditions.
- Also return the job header: the job number, job name, site address, builder or head contractor name, builder email, retention percent if stated, and the quote total excluding GST.
- Dates in the document are Australian format. Only return a date when it is written out in full.`,
      file_urls: [fileUrl],
      response_json_schema: {
        type: 'object',
        properties: {
          job: {
            type: 'object',
            properties: {
              job_number: { type: 'string' },
              name: { type: 'string' },
              site_address: { type: 'string' },
              builder_name: { type: 'string' },
              builder_email: { type: 'string' },
              retention_percent: { type: 'number' },
              quote_total_ex_gst: { type: 'number' },
            },
          },
          lines: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                area: { type: 'string' },
                description: { type: 'string' },
                quantity: { type: 'number' },
                unit: { type: 'string' },
                rate: { type: 'number' },
                amount: { type: 'number' },
              },
              required: ['description'],
            },
          },
        },
        required: ['lines'],
      },
    });

    const rawJob = (result && result.job) || {};
    const rawLines = Array.isArray(result && result.lines) ? result.lines : [];

    const lines = rawLines
      .slice(0, 300)
      .map((line, index) => {
        const description = String(line.description || '').trim();
        if (!description) return null;
        const quantity = Number(line.quantity || 0);
        const rate = Number(line.rate || 0);
        const amount = Number(line.amount || 0);
        return {
          area: String(line.area || '').trim(),
          description,
          quantity: Number.isFinite(quantity) ? quantity : 0,
          unit: String(line.unit || '').trim(),
          rate: Number.isFinite(rate) ? rate : 0,
          amount: Number.isFinite(amount) && amount ? round2(amount) : round2((quantity || 0) * (rate || 0)),
          sort_order: index + 1,
          percent_complete_to_date: 0,
        };
      })
      .filter(Boolean);

    if (!lines.length) {
      return Response.json({ error: 'No quoted items could be read from that document' }, { status: 422 });
    }

    return Response.json({
      job: {
        job_number: String(rawJob.job_number || '').trim(),
        name: String(rawJob.name || '').trim(),
        site_address: String(rawJob.site_address || '').trim(),
        builder_name: String(rawJob.builder_name || '').trim(),
        builder_email: String(rawJob.builder_email || '').trim(),
        retention_percent: Number(rawJob.retention_percent || 0),
        quote_total_ex_gst: round2(rawJob.quote_total_ex_gst || lines.reduce((sum, line) => sum + line.amount, 0)),
      },
      lines,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}