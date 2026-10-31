import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { formatAud, formatDate } from '@/lib/format';
import { addBusinessDays, todayYmd } from '@/lib/clock';

export default function ScheduleDialog({ open, onOpenChange, claim, holidays, onSaved }) {
  const [amount, setAmount] = useState('');
  const [reasons, setReasons] = useState('');
  const [receivedAt, setReceivedAt] = useState(todayYmd());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !claim) return;
    setAmount(claim.scheduled_amount != null ? String(claim.scheduled_amount) : '');
    setReasons(claim.schedule_reasons || '');
    setReceivedAt(claim.schedule_received_at || todayYmd());
  }, [open, claim]);

  const scheduled = Number(amount || 0);
  const claimed = Number(claim?.amount_claimed_ex_gst || 0);
  const applyBy = addBusinessDays(receivedAt, 10, holidays);
  const short = scheduled < claimed - 0.005;

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await base44.entities.Claim.update(claim.id, {
        schedule_received_at: receivedAt,
        scheduled_amount: scheduled,
        schedule_reasons: reasons,
        apply_by: applyBy,
        escalated: true,
        status: short ? 'scheduled_short' : 'scheduled_in_full',
      });
      onSaved(updated);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">Record the payment schedule</DialogTitle>
          <DialogDescription>
            Claimed {formatAud(claimed)} excluding GST. If the builder pays less, record the amount and the reasons given.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="scheduled">Scheduled amount, ex GST</Label>
              <Input id="scheduled" type="number" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} className="num" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="received">Date received</Label>
              <Input id="received" type="date" value={receivedAt} onChange={(event) => setReceivedAt(event.target.value)} className="num" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reasons">Reasons given for withholding</Label>
            <Textarea
              id="reasons"
              rows={3}
              placeholder="Defective finish, L1 corridors"
              value={reasons}
              onChange={(event) => setReasons(event.target.value)}
            />
          </div>
          <p className="rounded-[3px] border border-border bg-secondary px-3 py-2 text-[12px] text-muted-foreground">
            {short ? (
              <>Scheduled short by {formatAud(claimed - scheduled)}. Apply for adjudication by <span className="text-foreground">{formatDate(applyBy)}</span>.</>
            ) : (
              <>Scheduled in full. Next step is to record the payment.</>
            )}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !amount} className="bg-primary">
            {saving ? 'Saving' : 'Save schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}