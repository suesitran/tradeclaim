import { useState } from 'react';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import { formatAud } from '@/lib/format';

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
    return <p className="px-5 py-8 text-sm text-muted-foreground">No scope lines on this job yet.</p>;
  }

  return (
    <div>
      {error ? <p className="border-b border-border px-5 py-2 text-[12px] text-destructive">{error}</p> : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-5 py-2.5 font-medium">Scope line</th>
              <th className="px-3 py-2.5 text-right font-medium">Amount</th>
              <th className="px-3 py-2.5 text-right font-medium">Claimed</th>
              <th className="px-3 py-2.5 font-medium">Evidence</th>
              <th className="px-3 py-2.5 text-right font-medium">Done</th>
              <th className="px-5 py-2.5 text-right font-medium">
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
                  <tr key={line.id} className="border-b border-border bg-secondary/50 last:border-b-0">
                    <td className="px-5 py-3">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{line.area}</p>
                      <input
                        value={draft.description}
                        onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                        placeholder="What the work is"
                        className="mt-1 w-full rounded-[3px] border border-input bg-card px-2 py-1.5 text-[13px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-start justify-end gap-1.5">
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground">Qty</p>
                          <input
                            type="number"
                            inputMode="decimal"
                            value={draft.quantity}
                            onChange={(event) => setDraft((current) => ({ ...current, quantity: event.target.value }))}
                            className="num mt-0.5 h-8 w-16 rounded-[3px] border border-input bg-card px-2 text-right text-[12px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground">Amount</p>
                          <input
                            type="number"
                            inputMode="decimal"
                            value={draft.amount}
                            onChange={(event) => setDraft((current) => ({ ...current, amount: event.target.value }))}
                            className="num mt-0.5 h-8 w-24 rounded-[3px] border border-input bg-card px-2 text-right text-[12px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="num px-3 py-3 text-right text-[12px] text-muted-foreground">{Math.round(claimedPercent(line.id))}%</td>
                    <td className="px-3 py-3 text-[11px] text-muted-foreground">{line.unit || 'each'}</td>
                    <td className="num px-3 py-3 text-right text-[13px] text-muted-foreground">{Math.round(percent)}%</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onDelete(line)}
                          disabled={saving}
                          aria-label="Remove line"
                          className="rounded-[3px] border border-border px-2 py-1 text-muted-foreground transition-colors hover:border-destructive hover:text-destructive disabled:opacity-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={cancel}
                          disabled={saving}
                          aria-label="Cancel"
                          className="rounded-[3px] border border-border px-2 py-1 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => commit(line)}
                          disabled={saving}
                          className="inline-flex items-center gap-1 rounded-[3px] bg-primary px-2 py-1 text-[11px] text-primary-foreground disabled:opacity-50"
                        >
                          <Check className="h-3 w-3" /> {saving ? 'Saving' : 'Save'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={line.id} className="border-b border-border last:border-b-0">
                  <td className="px-5 py-3">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{line.area}</p>
                    <p className="text-[13px] leading-snug">{line.description}</p>
                    <p className="num mt-0.5 text-[10px] text-muted-foreground">
                      {line.quantity} {line.unit} at {formatAud(line.rate)}
                    </p>
                  </td>
                  <td className="num px-3 py-3 text-right text-[13px]">{formatAud(line.amount)}</td>
                  <td className="num px-3 py-3 text-right text-[12px] text-muted-foreground">{Math.round(claimedPercent(line.id))}%</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="rounded-full border border-[#DCD7CB] bg-[#EDEBE4] px-2 py-0.5 text-[10px] text-[#4A4F55]">B {counts.before}</span>
                      <span className="rounded-full border border-[#C6DFCE] bg-[#E4F0E8] px-2 py-0.5 text-[10px] text-[#245B3B]">F {counts.finish}</span>
                      <span className="rounded-full border border-[#CBDCEB] bg-[#E7EEF5] px-2 py-0.5 text-[10px] text-[#1F4A70]">C {counts.clear}</span>
                    </div>
                  </td>
                  <td className="num px-3 py-3 text-right text-[13px]">{Math.round(percent)}%</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => startEdit(line)}
                      className="inline-flex items-center gap-1 rounded-[3px] border border-border px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                    >
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