import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { formatAud } from '@/lib/format';
import { feeFor, recoveredFor } from '@/lib/claims';
import { todayYmd } from '@/lib/clock';
import { useT } from '@/lib/i18n';

const FIELD = 'num h-12 border-2 border-foreground text-[16px]';

export default function PaymentDialog({ open, onOpenChange, claim, onSaved }) {
  const t = useT();
  const [amount, setAmount] = useState('');
  const [paidAt, setPaidAt] = useState(todayYmd());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !claim) return;
    setAmount(claim.paid_amount != null ? String(claim.paid_amount) : String(claim.scheduled_amount || claim.amount_claimed_ex_gst || ''));
    setPaidAt(claim.paid_at || todayYmd());
  }, [open, claim]);

  const draft = { ...claim, paid_at: paidAt, paid_amount: Number(amount || 0) };
  const recovered = recoveredFor(draft);
  const fee = feeFor(draft);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await base44.entities.Claim.update(claim.id, {
        paid_at: paidAt,
        paid_amount: Number(amount || 0),
        status: 'paid',
        recovered_amount: recovered,
        fee_amount: fee,
      });
      onSaved(updated);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[26px] font-extrabold">{t('Money came in')}</DialogTitle>
          <DialogDescription className="text-[15px]">{t('Claim {number}, {amount} ex GST claimed.', { number: claim?.claim_number, amount: formatAud(claim?.amount_claimed_ex_gst) })}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="paid" className="text-[15px]">{t('Amount paid, ex GST')}</Label>
            <Input id="paid" type="number" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} className={FIELD} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="paidAt" className="text-[15px]">{t('Date paid')}</Label>
            <Input id="paidAt" type="date" value={paidAt} onChange={(event) => setPaidAt(event.target.value)} className={FIELD} />
          </div>
        </div>

        <div className="border-2 border-foreground bg-secondary px-3 py-3 text-[15px]">
          <div className="flex items-center justify-between">
            <span>{t('Got back by escalating')}</span>
            <span className="num font-semibold">{formatAud(recovered)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span>{t('Our fee, 3% capped at A$300')}</span>
            <span className="num font-semibold">{formatAud(fee)}</span>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <button type="button" className="btn-line" onClick={() => onOpenChange(false)}>{t('Cancel')}</button>
          <button type="button" className="btn-ink" onClick={handleSave} disabled={saving}>
            {saving ? t('Saving') : t('Save')}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
