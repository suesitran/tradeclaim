import { useState } from 'react';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import { formatAud } from '@/lib/format';
import { SMALL_ACTION } from '@/components/jobs/taskStyles';

const CHIP = {
  before: 'num mr-1 inline-block rounded-full border border-[#DED6C7] bg-[#EDE7DA] px-2 py-[2px] text-[10px] text-[#4a4439]',
  finish: 'num mr-1 inline-block rounded-full border border-[#C9D6B6] bg-[#E7EEDD] px-2 py-[2px] text-[10px] text-[#3d5a24]',
  clear: 'num mr-1 inline-block rounded-full border border-[#E2C7A6] bg-[#F1E3D1] px-2 py-[2px] text-[10px] text-[#7a4519]',
};

const EDIT_INPUT =
  'w-full rounded-[3px] border border-[#DED6C7] bg-white px-2 py-1.5 text-[13px] text-[#1B1A17] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#9A5B2A]';

export default function ScopeLineTable({ lines, evidenceByLine, claims, onSave, onDelete }) {
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
      setError('A description is needed for the line');
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
      setError(err.message || 'The line could not be saved');
    } finally {
      setSaving(false);
    }
  };

  if (!lines.length) {
    return (
      <p className="px-5 py-8 text-[14px] leading-[1.55] text-[#6b6457]">No scope lines on this job yet.</p>
    );
  }

  return (
    <div>
      {error ? (
        <p className="border-b border-[#DED6C7] bg-[#FBEFEC] px-5 py-2 text-[12px] text-[#8C2A1E]">{error}</p>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <thead>
            <tr>
              <th className="border-b border-[#DED6C7] py-[11px] pl-5 pr-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6b6457]">
                Scope line
              </th>
              <th className="border-b border-[#DED6C7] px-3 py-[11px] text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6b6457]">
                Amount
              </th>
              <th className="border-b border-[#DED6C7] px-3 py-[11px] text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6b6457]">
                Claimed
              </th>
              <th className="border-b border-[#DED6C7] px-3 py-[11px] text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6b6457]">
                Evidence
              </th>
              <th className="border-b border-[#DED6C7] px-3 py-[11px] text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6b6457]">
                Done
              </th>
              <th className="border-b border-[#DED6C7] py-[11px] pl-3 pr-5 text-right">
                <span className="sr-only">Actions</span>
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
                  <tr key={line.id} className="border-b border-[#EAE3D4] bg-[#FBF6EA] last:border-b-0">
                    <td className="py-[14px] pl-5 pr-3 align-top">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-[#6b6457]">{line.area}</p>
                      <input
                        value={draft.description}
                        onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                        placeholder="What the work is"
                        className={`${EDIT_INPUT} mt-1`}
                      />
                    </td>
                    <td className="px-3 py-[14px] align-top">
                      <div className="flex items-start justify-end gap-1.5">
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.1em] text-[#6b6457]">Qty</p>
                          <input
                            type="number"
                            inputMode="decimal"
                            value={draft.quantity}
                            onChange={(event) => setDraft((current) => ({ ...current, quantity: event.target.value }))}
                            className={`${EDIT_INPUT} num mt-0.5 h-8 w-16 text-right`}
                          />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.1em] text-[#6b6457]">Amount</p>
                          <input
                            type="number"
                            inputMode="decimal"
                            value={draft.amount}
                            onChange={(event) => setDraft((current) => ({ ...current, amount: event.target.value }))}
                            className={`${EDIT_INPUT} num mt-0.5 h-8 w-24 text-right`}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="num px-3 py-[14px] text-right text-[12px] text-[#6b6457]">
                      {Math.round(claimedPercent(line.id))}%
                    </td>
                    <td className="px-3 py-[14px] text-[11px] text-[#6b6457]">{line.unit || 'each'}</td>
                    <td className="num px-3 py-[14px] text-right text-[13px] text-[#6b6457]">{Math.round(percent)}%</td>
                    <td className="py-[14px] pl-3 pr-5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onDelete(line)}
                          disabled={saving}
                          aria-label="Remove line"
                          className="rounded-[3px] border border-[#DED6C7] bg-white px-2 py-1 text-[#6b6457] transition-colors duration-200 hover:border-[#8C2A1E] hover:text-[#8C2A1E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8C2A1E] disabled:opacity-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={cancel}
                          disabled={saving}
                          aria-label="Cancel"
                          className="rounded-[3px] border border-[#DED6C7] bg-white px-2 py-1 text-[#6b6457] transition-colors duration-200 hover:text-[#1B1A17] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9A5B2A] disabled:opacity-50"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => commit(line)}
                          disabled={saving}
                          className="inline-flex items-center gap-1 rounded-[3px] bg-[#1B1A17] px-2 py-1 text-[11px] font-semibold text-[#FAF7F1] transition-colors duration-200 hover:bg-[#9A5B2A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9A5B2A] disabled:opacity-50"
                        >
                          <Check className="h-3 w-3" /> {saving ? 'Saving' : 'Save'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={line.id} className="border-b border-[#EAE3D4] last:border-b-0">
                  <td className="py-[14px] pl-5 pr-3 align-top">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#6b6457]">{line.area}</p>
                    <p className="mt-0.5 text-[13px] leading-[1.4]">{line.description}</p>
                    <p className="num mt-[3px] text-[10px] text-[#6b6457]">
                      {line.quantity} {line.unit} at {formatAud(line.rate)}
                    </p>
                  </td>
                  <td className="num px-3 py-[14px] text-right text-[13px] align-top">{formatAud(line.amount)}</td>
                  <td className="num px-3 py-[14px] text-right text-[12px] text-[#6b6457] align-top">
                    {Math.round(claimedPercent(line.id))}%
                  </td>
                  <td className="px-3 py-[14px] align-top">
                    <span className={CHIP.before}>B {counts.before}</span>
                    <span className={CHIP.finish}>F {counts.finish}</span>
                    <span className={CHIP.clear}>C {counts.clear}</span>
                  </td>
                  <td className="num px-3 py-[14px] text-right text-[13px] align-top">
                    {Math.round(percent)}%
                    <div className="ml-auto mt-[6px] h-1 w-16 overflow-hidden rounded-[2px] bg-[#EAE3D4]">
                      <i className="block h-full rounded-[2px] bg-[#9A5B2A]" style={{ width: `${Math.min(100, Math.round(percent))}%` }} />
                    </div>
                  </td>
                  <td className="py-[14px] pl-3 pr-5 text-right align-top">
                    <button type="button" onClick={() => startEdit(line)} className={SMALL_ACTION}>
                      <Pencil className="h-3 w-3" /> Edit
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