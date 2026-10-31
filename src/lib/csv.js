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