import { useState } from 'react';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import { formatAud } from '@/lib/format';
import { SMALL_ACTION } from '@/components/jobs/taskStyles';
import { useT } from '@/lib/i18n';

const TH = 'border-b-2 border-foreground px-3 py-2.5 font-heading text-[14px] font-bold uppercase tracking-[0.06em] text-muted-foreground';
const EDIT_INPUT =
  'w-full border-2 border-foreground bg-card px-2 py-1.5 text-[15px] text-foreground focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-1 focus-visible:outline-accent';

// Photo counts per stage, in words rather than letters.
function PhotoCounts({ counts }) {
  const t = useT();
  const parts = [
    ['Before', counts.before],
    ['Finish', counts.finish],
    ['Clear', counts.clear],
  ];
  return (
    <span className="flex flex-wrap gap-x-3 gap-y-0.5 text-[13px]">
      {parts.map(([label, count]) => (
        <span key={label} className={count ? 'font-semibold' : 'text-muted-foreground'}>
          {t(label)} <span className="num">{count}</span>
        </span>
      ))}
    </span>
  );
}

export default function ScopeLineTable({ lines, evidenceByLine, claims, onSave, onDelete }) {
  const t = useT();
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ description: '', quantity: '', amount: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const claimedPercent = (lineId) =>
    (claims || []).reduce((total, claim) => {
      const match = (claim.lines || []).filter((line) => line.scope_line_id === lineId);
      return total + match.reduce((sum, line) => sum + Number(line.percent_this_claim || 0), 0);
    }, 0);

  const startEdit = (line) => {
    setError('');
    setEditingId(line.id);
    setDraft({
      description: line.description || '',
      quantity: String(line.quantity ?? 0),
      amount: String(line.amount ?? 0),
    });
  };

  const cancel = () => {
    setEditingId(null);
    setError('');
  };

  const commit = async (line) => {
    if (!draft.description.trim()) {
      setError(t('The line needs a description'));
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(line, {
        description: draft.description.trim(),
        quantity: Number(draft.quantity || 0),
        amount: Number(draft.amount || 0),
      });
      setEditingId(null);
    } catch (err) {
      setError(err.message || t('The line could not be saved'));
    } finally {
      setSaving(false);
    }
  };

  if (!lines.length) {
    return <p className="px-4 py-8 text-[16px] text-muted-foreground">{t('No lines on this job yet.')}</p>;
  }

  return (
    <div>
      {error ? <p className="border-b-2 border-foreground bg-destructive px-4 py-2 text-[14px] font-semibold text-white">{error}</p> : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr>
              <th className={`${TH} pl-4`}>{t('Line')}</th>
              <th className={`${TH} text-right`}>{t('Amount')}</th>
              <th className={`${TH} text-right`}>{t('Claimed')}</th>
              <th className={TH}>{t('Photos')}</th>
              <th className={`${TH} text-right`}>{t('Done')}</th>
              <th className={`${TH} pr-4 text-right`}>
                <span className="sr-only">{t('Actions')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => {
              const counts = evidenceByLine[line.id] || { before: 0, finish: 0, clear: 0 };
              const percent = Math.max(Number(line.percent_complete_to_date || 0), claimedPercent(line.id));
              const editing = editingId === line.id;

              if (editing) {
                return (
                  <tr key={line.id} className="border-b border-foreground/30 bg-secondary last:border-b-0">
                    <td className="py-3 pl-4 pr-3 align-top">
                      <p className="eyebrow">{line.area}</p>
                      <input
                        value={draft.description}
                        onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                        placeholder={t('What the work is')}
                        className={`${EDIT_INPUT} mt-1`}
                      />
                    </td>
                    <td className="px-3 py-3 align-top">
                      <div className="flex items-start justify-end gap-2">
                        <div>
                          <p className="eyebrow">{t('Qty')}</p>
                          <input
                            type="number"
                            inputMode="decimal"
                            value={draft.quantity}
                            onChange={(event) => setDraft((current) => ({ ...current, quantity: event.target.value }))}
                            className={`${EDIT_INPUT} num mt-0.5 h-9 w-20 text-right`}
                          />
                        </div>
                        <div>
                          <p className="eyebrow">{t('Amount')}</p>
                          <input
                            type="number"
                            inputMode="decimal"
                            value={draft.amount}
                            onChange={(event) => setDraft((current) => ({ ...current, amount: event.target.value }))}
                            className={`${EDIT_INPUT} num mt-0.5 h-9 w-28 text-right`}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="num px-3 py-3 text-right text-[14px] text-muted-foreground">{Math.round(claimedPercent(line.id))}%</td>
                    <td className="px-3 py-3 text-[13px] text-muted-foreground">{line.unit || t('each')}</td>
                    <td className="num px-3 py-3 text-right text-[15px] text-muted-foreground">{Math.round(percent)}%</td>
                    <td className="py-3 pl-3 pr-4">
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" onClick={() => onDelete(line)} disabled={saving} aria-label={t('Remove line')} className="btn-small">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={cancel} disabled={saving} aria-label={t('Cancel')} className="btn-small">
                          <X className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => commit(line)} disabled={saving} className="btn-small !bg-foreground !text-background">
                          <Check className="h-4 w-4" /> {saving ? t('Saving') : t('Save')}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={line.id} className="border-b border-foreground/30 last:border-b-0">
                  <td className="py-3 pl-4 pr-3 align-top">
                    <p className="eyebrow">{line.area}</p>
                    <p className="mt-0.5 text-[16px] leading-snug">{line.description}</p>
                    <p className="num mt-1 text-[12px] text-muted-foreground">
                      {t('{qty} {unit} at {rate}', { qty: line.quantity, unit: line.unit, rate: formatAud(line.rate) })}
                    </p>
                  </td>
                  <td className="num px-3 py-3 text-right text-[16px] align-top">{formatAud(line.amount)}</td>
                  <td className="num px-3 py-3 text-right text-[14px] text-muted-foreground align-top">{Math.round(claimedPercent(line.id))}%</td>
                  <td className="px-3 py-3 align-top">
                    <PhotoCounts counts={counts} />
                  </td>
                  <td className="px-3 py-3 text-right align-top">
                    <span className="num text-[16px] font-semibold">{Math.round(percent)}%</span>
                    <div className="ml-auto mt-1.5 h-2 w-20 border border-foreground bg-card">
                      <i className="block h-full bg-foreground" style={{ width: `${Math.min(100, Math.round(percent))}%` }} />
                    </div>
                  </td>
                  <td className="py-3 pl-3 pr-4 text-right align-top">
                    <button type="button" onClick={() => startEdit(line)} className={SMALL_ACTION}>
                      <Pencil className="h-4 w-4" /> {t('Edit')}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
