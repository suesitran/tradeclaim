import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatAud, formatDate } from '@/lib/format';
import { addBusinessDays, todayYmd } from '@/lib/clock';
import { jurisdictionFor } from '@/lib/jurisdictions';

export default function ServeDialog({ open, onOpenChange, claim, job, holidays, busy, onServe }) {
  const [servedAt, setServedAt] = useState(todayYmd());
  const jurisdiction = jurisdictionFor(job?.state);

  useEffect(() => {
    if (open) setServedAt(todayYmd());
  }, [open]);

  const dueAt = addBusinessDays(servedAt, jurisdiction.scheduleDays, holidays, jurisdiction.code);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[26px] font-extrabold">Send claim {claim?.claim_number}</DialogTitle>
          <DialogDescription className="text-[15px]">
            The claim PDF goes to {job ? job.builder_name : 'the builder'} by email, photos attached. That counts as serving it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="servedAt" className="text-[15px]">Date sent</Label>
            <Input id="servedAt" type="date" value={servedAt} onChange={(event) => setServedAt(event.target.value)} className="num h-12 border-2 border-foreground text-[16px]" />
          </div>
          <div className="border-2 border-foreground bg-accent px-3 py-3">
            <div className="flex items-center justify-between text-[16px] font-semibold">
              <span>Builder must reply by</span>
              <span className="num">{formatDate(dueAt)}</span>
            </div>
            <p className="legal mt-1.5 !text-foreground">
              {jurisdiction.scheduleDays} {jurisdiction.unit} under the {jurisdiction.act}. Claiming {formatAud(claim?.amount_claimed_ex_gst)} ex GST.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <button type="button" className="btn-line" onClick={() => onOpenChange(false)}>Cancel</button>
          <button type="button" className="btn-yellow" onClick={() => onServe(servedAt)} disabled={busy}>
            {busy ? 'Sending' : 'Send it'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
