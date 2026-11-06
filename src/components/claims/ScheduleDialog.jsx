import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { formatAud, formatDate } from '@/lib/format';
import { addBusinessDays, todayYmd } from '@/lib/clock';
import { jurisdictionFor } from '@/lib/jurisdictions';

const FIELD = 'num h-12 border-2 border-foreground text-[16px]';

export default function ScheduleDialog({ open, onOpenChange, claim, job, holidays, onSaved }) {
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
  const jurisdiction = jurisdictionFor(job?.state);
  const applyBy = addBusinessDays(receivedAt, jurisdiction.applyDays, holidays, jurisdiction.code);
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
          <DialogTitle className="text-[26px] font-extrabold">What did the builder say?</DialogTitle>
          <DialogDescription className="text-[15px]">
            You claimed {formatAud(claimed)} ex GST. Put in what they say they will pay, and their reasons if it is less.
            <span className="legal mt-1">This is the builder's payment schedule under the Act.</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="scheduled" className="text-[15px]">They will pay, ex GST</Label>
              <Input id="scheduled" type="number" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} className={FIELD} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="received" className="text-[15px]">Date they replied</Label>
              <Input id="received" type="date" value={receivedAt} onChange={(event) => setReceivedAt(event.target.value)} className={FIELD} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reasons" className="text-[15px]">Their reasons for paying less</Label>
            <Textarea id="reasons" rows={3} placeholder="Defective finish, L1 corridors" value={reasons} onChange={(event) => setReasons(event.target.value)} className="border-2 border-foreground text-[16px]" />
          </div>
          <p className={`border-2 border-foreground px-3 py-3 text-[15px] ${short ? 'bg-accent' : 'bg-secondary'}`}>
            {short ? (
              <>
                That is <span className="num font-semibold">{formatAud(claimed - scheduled)}</span> short. If you want to fight it, apply by{' '}
                <span className="num font-semibold">{formatDate(applyBy)}</span>.
                <span className="legal mt-1 !text-foreground">{jurisdiction.applyDays} {jurisdiction.unit} to apply for adjudication under the {jurisdiction.act}.</span>
              </>
            ) : (
              <>They agreed to the full amount. Next, record the payment when it lands.</>
            )}
          </p>
        </div>

        <DialogFooter className="gap-2">
          <button type="button" className="btn-line" onClick={() => onOpenChange(false)}>Cancel</button>
          <button type="button" className="btn-ink" onClick={handleSave} disabled={saving || !amount}>
            {saving ? 'Saving' : 'Save'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
