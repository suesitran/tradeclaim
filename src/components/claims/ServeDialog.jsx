import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatAud, formatDate } from '@/lib/format';
import { addBusinessDays, todayYmd } from '@/lib/clock';

export default function ServeDialog({ open, onOpenChange, claim, job, holidays, busy, onServe }) {
  const [servedAt, setServedAt] = useState(todayYmd());

  useEffect(() => {
    if (open) setServedAt(todayYmd());
  }, [open]);

  const dueAt = addBusinessDays(servedAt, 10, holidays);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">Serve claim {claim?.claim_number}</DialogTitle>
          <DialogDescription>
            The claim PDF is emailed to {job ? job.builder_name : 'the builder'} with the evidence appendix attached. The email is the service.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="servedAt">Date served</Label>
            <Input id="servedAt" type="date" value={servedAt} onChange={(event) => setServedAt(event.target.value)} className="num" />
          </div>
          <div className="rounded-[3px] border border-border bg-secondary px-3 py-2.5 text-[12px]">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Payment schedule due</span>
              <span className="num">{formatDate(dueAt)}</span>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              10 business days, skipping weekends and Victorian public holidays. Claiming {formatAud(claim?.amount_claimed_ex_gst)} excluding GST.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onServe(servedAt)} disabled={busy} className="bg-accent text-accent-foreground">
            {busy ? 'Serving' : 'Serve and email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}