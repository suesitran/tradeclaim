import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { formatAud } from '@/lib/format';
import { claimedPercentForLine, nextClaimNumber, previouslyPaidForJob } from '@/lib/claims';
import { addDays, firstOfMonth, todayYmd } from '@/lib/clock';

const round2 = (value) => Math.round(Number(value || 0) * 100) / 100;

export default function NewClaimDialog({ open, onOpenChange, job, scopeLines, claims, evidence, variations, onCreated }) {
  const [items, setItems] = useState([]);
  const [chosenVariations, setChosenVariations] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !job) return;
    const photographed = new Set((evidence || []).filter((item) => item.stage !== 'before').map((item) => item.scope_line_id));
    setItems(
      (scopeLines || []).map((line) => {
        const claimed = claimedPercentForLine(line.id, claims);
        const remaining = Math.max(0, 100 - claimed);
        const suggested = photographed.has(line.id) ? Math.round(remaining * 10) / 10 : 0;
        return { id: line.id, area: line.area, description: line.description, amount: Number(line.amount || 0), claimed, percent: suggested };
      }),
    );
    const used = new Set((claims || []).flatMap((claim) => (claim.variations_included || []).map((item) => item.variation_id)));
    setChosenVariations((variations || []).filter((item) => item.status !== 'disputed' && !used.has(item.id)).map((item) => item.id));
  }, [open, job, scopeLines, claims, evidence, variations]);

  const lineTotal = items.reduce((sum, item) => sum + (item.amount * item.percent) / 100, 0);
  const variationTotal = (variations || []).filter((item) => chosenVariations.includes(item.id)).reduce((sum, item) => sum + Number(item.estimated_amount || 0), 0);
  const exGst = lineTotal + variationTotal;
  const gst = exGst * 0.1;

  const setPercent = (id, value) => {
    const parsed = Math.max(0, Math.min(100, Number(value) || 0));
    setItems((current) => current.map((item) => (item.id === id ? { ...item, percent: parsed } : item)));
  };

  const toggleVariation = (id) => {
    setChosenVariations((current) => (current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]));
  };

  const handleCreate = async () => {
    const chosen = items.filter((item) => item.percent > 0);
    if (!chosen.length) return;
    setSaving(true);
    try {
      const user = await base44.auth.me().catch(() => null);
      const lastClaim = [...(claims || [])].sort((a, b) => Number(b.claim_number || 0) - Number(a.claim_number || 0))[0];
      const periodFrom = lastClaim && lastClaim.period_to ? addDays(lastClaim.period_to, 1) : firstOfMonth();
      const claim = await base44.entities.Claim.create({
        job_id: job.id,
        claim_number: nextClaimNumber(claims),
        period_from: periodFrom,
        period_to: todayYmd(),
        lines: chosen.map((item) => ({
          scope_line_id: item.id,
          area: item.area,
          description: item.description,
          percent_this_claim: Math.round(item.percent * 10) / 10,
          amount_this_claim: round2((item.amount * item.percent) / 100),
        })),
        variations_included: (variations || [])
          .filter((item) => chosenVariations.includes(item.id))
          .map((item) => ({ variation_id: item.id, description: item.description, amount: Number(item.estimated_amount || 0) })),
        amount_claimed_ex_gst: round2(exGst),
        gst: round2(gst),
        amount_claimed_inc_gst: round2(exGst + gst),
        previously_paid: previouslyPaidForJob(claims),
        status: 'draft',
        claimant_name: user ? user.full_name || user.email : '',
        claimant_email: user ? user.email : '',
      });
      await base44.entities.ScopeLine.bulkUpdate(
        chosen.map((item) => ({ id: item.id, percent_complete_to_date: Math.min(100, Math.round((item.claimed + item.percent) * 10) / 10) })),
      );
      onCreated(claim);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle className="font-heading text-lg">Generate claim {nextClaimNumber(claims)}</DialogTitle>
          <DialogDescription>
            Set the percentage of each scope line to claim this period. Lines with photos are pre-filled.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[52vh] overflow-y-auto">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-card">
              <tr className="border-b border-border text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <th className="px-5 py-2 font-medium">Scope line</th>
                <th className="px-2 py-2 text-right font-medium">Line value</th>
                <th className="px-2 py-2 text-right font-medium">Claimed</th>
                <th className="px-5 py-2 text-right font-medium">This claim %</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-b-0">
                  <td className="px-5 py-2.5">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{item.area}</p>
                    <p className="text-[12px] leading-snug">{item.description}</p>
                  </td>
                  <td className="num px-2 py-2.5 text-right text-[11px] text-muted-foreground">{formatAud(item.amount)}</td>
                  <td className="num px-2 py-2.5 text-right text-[11px] text-muted-foreground">{Math.round(item.claimed)}%</td>
                  <td className="px-5 py-2 text-right">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={item.percent}
                      onChange={(event) => setPercent(item.id, event.target.value)}
                      className="num ml-auto h-8 w-20 text-right text-[12px]"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(variations || []).length ? (
            <div className="border-t border-border px-5 py-4">
              <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Variations to include</p>
              <div className="mt-2 space-y-1.5">
                {variations.map((variation) => (
                  <label key={variation.id} className="flex items-start gap-2 text-[12px]">
                    <input
                      type="checkbox"
                      checked={chosenVariations.includes(variation.id)}
                      onChange={() => toggleVariation(variation.id)}
                      className="mt-0.5 h-3.5 w-3.5 accent-[#C7741A]"
                    />
                    <span className="flex-1">{variation.description}</span>
                    <span className="num text-muted-foreground">{formatAud(variation.estimated_amount)}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter className="border-t border-border px-5 py-4 sm:justify-between">
          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
            <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Ex GST</span>
            <span className="num text-sm font-medium">{formatAud(exGst)}</span>
            <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Inc GST</span>
            <span className="num text-sm font-medium">{formatAud(exGst + gst)}</span>
          </div>
          <Button onClick={handleCreate} disabled={saving || exGst <= 0} className="bg-primary">
            {saving ? 'Creating claim' : 'Create draft claim'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}