export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const value = String(text || '');
  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    if (inQuotes) {
      if (char === '"' && value[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') {
      field += char;
    }
  }
  row.push(field);
  rows.push(row);
  return rows.filter((entry) => entry.some((cell) => String(cell).trim() !== ''));
}

function toNumber(value) {
  const cleaned = String(value || '').replace(/[^0-9.\-]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function csvToScopeLines(text) {
  const rows = parseCsv(text);
  if (!rows.length) return { lines: [], error: 'Nothing to import' };

  const header = rows[0].map((cell) => String(cell).toLowerCase().trim());
  const looksLikeHeader = header.some((cell) => cell.includes('description')) || header.some((cell) => cell.includes('area'));
  const body = looksLikeHeader ? rows.slice(1) : rows;

  const columnFor = (names) => header.findIndex((cell) => names.some((name) => cell.includes(name)));
  const areaIndex = looksLikeHeader ? columnFor(['area', 'location', 'level']) : 0;
  const descIndex = looksLikeHeader ? columnFor(['description', 'item', 'task', 'works']) : 1;
  const qtyIndex = looksLikeHeader ? columnFor(['quantity', 'qty']) : 2;
  const unitIndex = looksLikeHeader ? columnFor(['unit', 'uom']) : 3;
  const rateIndex = looksLikeHeader ? columnFor(['rate', 'price']) : 4;
  const amountIndex = looksLikeHeader ? columnFor(['amount', 'total', 'value']) : 5;

  const lines = body
    .map((cells, index) => {
      const description = String(cells[descIndex >= 0 ? descIndex : 1] || '').trim();
      if (!description) return null;
      const quantity = toNumber(cells[qtyIndex]);
      const rate = toNumber(cells[rateIndex]);
      const amount = amountIndex >= 0 ? toNumber(cells[amountIndex]) : 0;
      return {
        area: String(cells[areaIndex] || '').trim(),
        description,
        quantity,
        unit: String(cells[unitIndex] || '').trim(),
        rate,
        amount: amount || Math.round(quantity * rate * 100) / 100,
        sort_order: index + 1,
        percent_complete_to_date: 0,
      };
    })
    .filter(Boolean);

  if (!lines.length) return { lines: [], error: 'No scope lines could be read from that text' };
  return { lines, error: null };
}

export const SAMPLE_QUOTE = `Area,Description,Quantity,Unit,Rate,Amount
L1 Apartments,Prepare and paint plasterboard walls PT1 low sheen to schedule,2650,m2,12.10,32065
L1 Apartments,Prepare and paint ceilings PT4 flat white,980,m2,13.90,13622
L1 Apartments,Paint doors frames and trims enamel,168,no,132,22176
L1 Apartments,Paint wet area ceilings moisture resistant,210,m2,16.40,3444
L1 Apartments,Feature walls two pack finish,180,m2,24.50,4410
L1 Apartments,Seal and paint skirtings and architraves,1420,lm,8.40,11928
L1 Corridors,Prepare and paint walls PT1 low sheen,1240,m2,12.50,15500
L1 Corridors,Prepare and paint ceilings PT4 flat,420,m2,14.80,6216
L1 Corridors,Paint doors and frames enamel,46,no,145,6670
L1 Corridors,Paint skirtings and trims,380,lm,8.40,3192
L1 Lobby,Feature ceiling two pack to detail,120,m2,32.00,3840
L1 Lobby,Wall protection clear sealer,260,m2,11.20,2912
L2 Apartments,Prepare and paint plasterboard walls PT1 low sheen,2650,m2,12.10,32065
L2 Apartments,Prepare and paint ceilings PT4 flat white,980,m2,13.90,13622
L2 Apartments,Paint doors frames and trims enamel,168,no,132,22176
L2 Apartments,Paint wet area ceilings moisture resistant,210,m2,16.40,3444
L2 Apartments,Feature walls two pack finish,180,m2,24.50,4410
L2 Apartments,Seal and paint skirtings and architraves,1420,lm,8.40,11928
L2 Corridors,Prepare and paint walls PT1 low sheen,980,m2,12.50,12250
L2 Corridors,Prepare and paint ceilings PT4 flat,340,m2,14.80,5032
L2 Corridors,Paint doors and frames enamel,38,no,145,5510
Stair 1,Prepare and paint walls and ceilings low sheen,460,m2,15.60,7176
Stair 1,Paint handrails and balustrades enamel,96,lm,22.00,2112
Stair 2,Prepare and paint walls and ceilings low sheen,460,m2,15.60,7176
External,Paint soffits and fascias weathershield,320,m2,19.80,6336
External,Paint entry doors and frames exterior enamel,24,no,165,3960
Allowance,Protection of finished surfaces all levels,1,item,4800,4800
Allowance,Site clean and touch up before handover,1,item,6200,6200`;