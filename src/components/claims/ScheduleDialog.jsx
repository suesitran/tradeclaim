import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { formatAud, formatDate } from '@/lib/format';
import { addBusinessDays, todayYmd } from '@/lib/clock';
import { jurisdictionFor } from '@/lib/jurisdictions';
import { useT } from '@/lib/i18n';

const FIELD = 'num h-12 border-2 border-foreground text-[16px]';

export default function ScheduleDialog({ open, onOpenChange, claim, job, holidays, onSaved }) {
  const t = useT();
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
          <DialogTitle className="text-[26px] font-extrabold">{t('What did the builder say?')}</DialogTitle>
          <DialogDescription className="text-[15px]">
            {t('You claimed {amount} ex GST. Put in what they say they will pay, and their reasons if it is less.', { amount: formatAud(claimed) })}
            <span className="legal mt-1">{t("This is the builder's payment schedule under the Act.")}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="scheduled" className="text-[15px]">{t('They will pay, ex GST')}</Label>
              <Input id="scheduled" type="number" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} className={FIELD} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="received" className="text-[15px]">{t('Date they replied')}</Label>
              <Input id="received" type="date" value={receivedAt} onChange={(event) => setReceivedAt(event.target.value)} className={FIELD} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reasons" className="text-[15px]">{t('Their reasons for paying less')}</Label>
            <Textarea id="reasons" rows={3} placeholder={t('Defective finish, L1 corridors')} value={reasons} onChange={(event) => setReasons(event.target.value)} className="border-2 border-foreground text-[16px]" />
          </div>
          <p className={`border-2 border-foreground px-3 py-3 text-[15px] ${short ? 'bg-accent' : 'bg-secondary'}`}>
            {short ? (
              <>
                {t('That is {amount} short. If you want to fight it, apply by {date}.', { amount: formatAud(claimed - scheduled), date: formatDate(applyBy) })}
                <span className="legal mt-1 !text-foreground">{t('{days} business days to apply for adjudication under the {act}.', { days: jurisdiction.applyDays, act: jurisdiction.act })}</span>
              </>
            ) : (
              <>{t('They agreed to the full amount. Next, record the payment when it lands.')}</>
            )}
          </p>
        </div>

        <DialogFooter className="gap-2">
          <button type="button" className="btn-line" onClick={() => onOpenChange(false)}>{t('Cancel')}</button>
          <button type="button" className="btn-ink" onClick={handleSave} disabled={saving || !amount}>
            {saving ? t('Saving') : t('Save')}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
