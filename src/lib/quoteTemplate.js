// The blank quote spreadsheet a subcontractor can hand to their estimator, plus
// a small helper for saving any generated text file straight from the browser.

export const CSV_TEMPLATE = `Area,Description,Quantity,Unit,Rate,Amount
L1 Apartments,Set and stop plasterboard to walls,100,m2,18.40,1840
L1 Apartments,Set and stop plasterboard to ceilings,40,m2,19.60,784
L1 Corridors,Supply and fix 90mm cornice,60,lm,9.80,588
Allowance,Site clean before handover,1,item,600,600`;

export function downloadTextFile(filename, text, type = 'text/csv') {
  const blob = new Blob([text], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}