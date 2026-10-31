const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatAud(value) {
  const n = Number(value || 0);
  const hasCents = Math.round(Math.abs(n) * 100) % 100 !== 0;
  return 'A$' + n.toLocaleString('en-AU', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  });
}

export function formatDate(value) {
  if (!value) return '';
  const parts = String(value).slice(0, 10).split('-');
  if (parts.length !== 3) return '';
  const [y, m, d] = parts.map(Number);
  if (!y || !m || !d) return '';
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return formatDate(value);
  const day = date.getDate();
  const month = MONTHS[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

export function formatLocation(record) {
  if (!record || record.latitude == null || record.longitude == null) return 'No location recorded';
  return `${Number(record.latitude).toFixed(4)}, ${Number(record.longitude).toFixed(4)}`;
}

export const STAGE_LABELS = {
  before: 'Before',
  finish: 'Finish',
  clear: 'Clear to next trade',
};

export const STAGE_TONES = {
  before: 'bg-[#EDEBE4] text-[#4A4F55] border-[#DCD7CB]',
  finish: 'bg-[#E4F0E8] text-[#245B3B] border-[#C6DFCE]',
  clear: 'bg-[#E7EEF5] text-[#1F4A70] border-[#CBDCEB]',
};