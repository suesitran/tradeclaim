import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const year = Number(body.year) || new Date().getFullYear();
    if (year < 2020 || year > 2100) return Response.json({ error: 'year is out of range' }, { status: 400 });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'gemini_3_1_pro',
      add_context_from_internet: true,
      prompt: `Find the Victorian Government's published list of public holidays for ${year}. Use the official list published by Business Victoria (business.vic.gov.au). Return every state-wide public holiday for Victoria only, with the date in YYYY-MM-DD form and the holiday name exactly as the government publishes it. Include Melbourne Cup Day, the Friday before the AFL Grand Final, Easter Saturday and Easter Sunday. Do not include national holidays observed only in other states.`,
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
      (holiday) => holiday && /^\d{4}-\d{2}-\d{2}$/.test(String(holiday.date || '')) && Number(holiday.date.slice(0, 4)) === year,
    );
    if (!holidays.length) {
      return Response.json({ error: 'No holidays could be read from the published list. Try again.' }, { status: 502 });
    }

    await base44.entities.PublicHoliday.deleteMany({ year });
    await base44.entities.PublicHoliday.bulkCreate(
      holidays.map((holiday) => ({
        date: holiday.date,
        name: holiday.name,
        year,
        state: 'VIC',
        source: 'Victorian Government public holiday list',
      })),
    );

    return Response.json({ year, count: holidays.length, holidays });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}