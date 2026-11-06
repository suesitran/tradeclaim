import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { formatAud } from '@/lib/format';
import { claimedPercentForLine, nextClaimNumber, previouslyPaidForJob } from '@/lib/claims';
import { addDays, firstOfMonth, todayYmd } from '@/lib/clock';
import { useT } from '@/lib/i18n';

const round2 = (value) => Math.round(Number(value || 0) * 100) / 100;

export default function NewClaimDialog({ open, onOpenChange, job, scopeLines, claims, evidence, variations, onCreated }) {
  const t = useT();
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
    if (!chosen.length && !chosenVariations.length) return;
    const variationRows = (variations || [])
      .filter((item) => chosenVariations.includes(item.id))
      .map((item) => ({
        scope_line_id: null,
        variation_id: item.id,
        area: t('Extra work'),
        description: item.description,
        percent_this_claim: 100,
        amount_this_claim: round2(Number(item.estimated_amount || 0)),
      }));
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
        lines: [
          ...chosen.map((item) => ({
            scope_line_id: item.id,
            area: item.area,
            description: item.description,
            percent_this_claim: Math.round(item.percent * 10) / 10,
            amount_this_claim: round2((item.amount * item.percent) / 100),
          })),
          ...variationRows,
        ],
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
      if (chosen.length) {
        await base44.entities.ScopeLine.bulkUpdate(
          chosen.map((item) => ({ id: item.id, percent_complete_to_date: Math.min(100, Math.round((item.claimed + item.percent) * 10) / 10) })),
        );
      }
      onCreated(claim);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden p-0">
        <DialogHeader className="border-b-2 border-foreground px-5 py-4">
          <DialogTitle className="text-[26px] font-extrabold">{t('Make claim {number}', { number: nextClaimNumber(claims) })}</DialogTitle>
          <DialogDescription className="text-[15px]">
            {t('How much of each line are you claiming this time? Lines with photos are filled in for you. Tick any extra work to add it.')}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[52vh] overflow-auto">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-card">
              <tr className="border-b-2 border-foreground font-heading text-[14px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                <th className="px-5 py-2 font-bold">{t('Line')}</th>
                <th className="px-2 py-2 text-right font-bold">{t('Amount')}</th>
                <th className="px-2 py-2 text-right font-bold">{t('Claimed')}</th>
                <th className="px-5 py-2 text-right font-bold">{t('This claim %')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-foreground/30 last:border-b-0">
                  <td className="px-5 py-2.5">
                    <p className="eyebrow">{item.area}</p>
                    <p className="text-[15px] leading-snug">{item.description}</p>
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
                      className="num ml-auto h-11 w-24 border-2 border-foreground text-right text-[16px]"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(variations || []).length ? (
            <div className="border-t-2 border-foreground px-5 py-4">
              <p className="eyebrow">{t('Extra work to include')}</p>
              <div className="mt-2 space-y-1.5">
                {variations.map((variation) => (
                  <label key={variation.id} className="flex items-start gap-2 text-[15px]">
                    <input
                      type="checkbox"
                      checked={chosenVariations.includes(variation.id)}
                      onChange={() => toggleVariation(variation.id)}
                      className="mt-1 h-5 w-5 accent-[#14181D]"
                    />
                    <span className="flex-1">{variation.description}</span>
                    <span className="num text-muted-foreground">{formatAud(variation.estimated_amount)}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter className="gap-3 border-t-2 border-foreground px-5 py-4 sm:justify-between">
          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
            <span className="eyebrow">{t('ex GST')}</span>
            <span className="num text-[16px] font-semibold">{formatAud(exGst)}</span>
            <span className="eyebrow">{t('inc GST')}</span>
            <span className="num text-[16px] font-semibold">{formatAud(exGst + gst)}</span>
          </div>
          <button type="button" onClick={handleCreate} disabled={saving || exGst <= 0} className="btn-ink">
            {saving ? t('Making the claim') : t('Make the claim')}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}