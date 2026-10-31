import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const jobId = body.job_id;
    const transcript = String(body.transcript || '').trim();
    if (!jobId) return Response.json({ error: 'job_id is required' }, { status: 400 });
    if (!transcript) return Response.json({ error: 'Nothing was dictated' }, { status: 400 });

    const page = await base44.entities.ScopeLine.filter({ job_id: jobId }, { limit: 200, sort: 'sort_order' });
    const lines = page && page.items ? page.items : [];
    if (!lines.length) return Response.json({ error: 'This job has no scope lines yet' }, { status: 400 });

    const list = lines
      .map((line) => `id: ${line.id} | area: ${line.area || 'n/a'} | ${line.description} | currently ${Math.round(Number(line.percent_complete_to_date || 0))}% complete`)
      .join('\n');

    const prompt = `You are reading a site foreman's dictated progress note for a Victorian painting subcontractor and turning it into structured progress against a quoted scope of work.

Scope lines for this job:
${list}

Dictation:
"${transcript}"

Rules:
- Only reference scope line ids from the list above.
- Work out the percentage of each line completed to date. If the dictation says an area is finished, that is 100. If it says a coat or a stage is done, estimate sensibly. If a line is not mentioned, do not include it.
- Keep the note short, in Australian English, no em dashes.
- If the dictation mentions work outside the quoted scope, list it under variations instead.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          updates: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                scope_line_id: { type: 'string' },
                percent_complete: { type: 'number' },
                note: { type: 'string' },
              },
              required: ['scope_line_id', 'percent_complete'],
            },
          },
          variations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                description: { type: 'string' },
                estimated_percent: { type: 'number' },
              },
              required: ['description'],
            },
          },
          summary: { type: 'string' },
        },
        required: ['updates'],
      },
    });

    const known = new Set(lines.map((line) => line.id));
    const updates = ((result && result.updates) || [])
      .filter((update) => known.has(update.scope_line_id))
      .map((update) => {
        const line = lines.find((item) => item.id === update.scope_line_id);
        const percent = Math.max(0, Math.min(100, Math.round(Number(update.percent_complete || 0))));
        return {
          scope_line_id: update.scope_line_id,
          label: `${line.area ? line.area + ': ' : ''}${line.description}`,
          percent_complete: percent,
          previous_percent: Math.round(Number(line.percent_complete_to_date || 0)),
          note: update.note || '',
        };
      });

    return Response.json({
      updates,
      variations: (result && result.variations) || [],
      summary: (result && result.summary) || '',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}