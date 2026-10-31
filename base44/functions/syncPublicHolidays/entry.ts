import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { jurisdictionFor } from '../../shared/jurisdictions.ts';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const year = Number(body.year) || new Date().getFullYear();
    if (year < 2020 || year > 2100) return Response.json({ error: 'year is out of range' }, { status: 400 });

    const jurisdiction = jurisdictionFor(body.state);

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'gemini_3_8_flash',
      add_context_from_internet: true,
      prompt: `Find the official published list of public holidays in ${jurisdiction.name}, Australia, for ${year}. Use the ${jurisdiction.name} government's own public holidays page. Return every public holiday observed across the whole of ${jurisdiction.name} in ${year}, with the date in YYYY-MM-DD form and the holiday name exactly as the ${jurisdiction.name} government publishes it. Include the days that only that state or territory observes. Do not include holidays that are observed only in other states or territories, and do not include regional or show day holidays.`,
      response_json_schema: {
        type: 'object',
        properties: {
          holidays: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date: { type: 'string' },
                name: { type: 'string' },
              },
              required: ['date', 'name'],
            },
          },
        },
        required: ['holidays'],
      },
    });

    const holidays = ((result && result.holidays) || []).filter(
      (holiday) =>
        holiday &&
        /^\d{4}-\d{2}-\d{2}$/.test(String(holiday.date || '')) &&
        Number(String(holiday.date).slice(0, 4)) === year,
    );
    if (!holidays.length) {
      return Response.json(
        { error: `No public holidays for ${jurisdiction.name} could be read from the published list. Try again.` },
        { status: 502 },
      );
    }

    await base44.entities.PublicHoliday.deleteMany({ year, state: jurisdiction.code });
    await base44.entities.PublicHoliday.bulkCreate(
      holidays.map((holiday) => ({
        date: holiday.date,
        name: holiday.name,
        year,
        state: jurisdiction.code,
        source: `${jurisdiction.name} government public holiday list`,
      })),
    );

    return Response.json({
      year,
      state: jurisdiction.code,
      state_name: jurisdiction.name,
      count: holidays.length,
      holidays,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}