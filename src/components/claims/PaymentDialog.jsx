import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { formatAud } from '@/lib/format';
import { feeFor, recoveredFor } from '@/lib/claims';
import { todayYmd } from '@/lib/clock';

export default function PaymentDialog({ open, onOpenChange, claim, onSaved }) {
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
          <DialogTitle className="font-heading text-lg">Record the payment</DialogTitle>
          <DialogDescription>Claim {claim?.claim_number} for {formatAud(claim?.amount_claimed_ex_gst)} excluding GST.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="paid">Amount paid, ex GST</Label>
            <Input id="paid" type="number" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} className="num" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="paidAt">Date paid</Label>
            <Input id="paidAt" type="date" value={paidAt} onChange={(event) => setPaidAt(event.target.value)} className="num" />
          </div>
        </div>

        <div className="rounded-[3px] border border-border bg-secondary px-3 py-2.5">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-muted-foreground">Recovered after escalation</span>
            <span className="num">{formatAud(recovered)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[12px]">
            <span className="text-muted-foreground">Fee, 3% capped at A$300</span>
            <span className="num">{formatAud(fee)}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-primary">
            {saving ? 'Saving' : 'Save payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}