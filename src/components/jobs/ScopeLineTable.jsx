import { formatAud } from '@/lib/format';
import { Pencil } from 'lucide-react';

export default function ScopeLineTable({ lines, evidenceByLine, claims, onEdit }) {
  const claimedPercent = (lineId) =>
    (claims || []).reduce((total, claim) => {
      const match = (claim.lines || []).filter((line) => line.scope_line_id === lineId);
      return total + match.reduce((sum, line) => sum + Number(line.percent_this_claim || 0), 0);
    }, 0);

  if (!lines.length) {
    return <p className="px-5 py-8 text-sm text-muted-foreground">No scope lines on this job yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b border-border text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <th className="px-5 py-2.5 font-medium">Scope line</th>
            <th className="px-3 py-2.5 text-right font-medium">Amount</th>
            <th className="px-3 py-2.5 text-right font-medium">Claimed</th>
            <th className="px-3 py-2.5 font-medium">Evidence</th>
            <th className="px-3 py-2.5 text-right font-medium">Done</th>
            <th className="px-5 py-2.5 text-right font-medium">
              <span className="sr-only">Edit</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => {
            const counts = evidenceByLine[line.id] || { before: 0, finish: 0, clear: 0 };
            const percent = Math.max(Number(line.percent_complete_to_date || 0), claimedPercent(line.id));
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
                  {onEdit ? (
                    <button
                      type="button"
                      onClick={() => onEdit(line)}
                      className="inline-flex items-center gap-1 rounded-[3px] border border-border px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </button>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}