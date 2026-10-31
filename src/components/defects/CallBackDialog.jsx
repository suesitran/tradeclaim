import { useEffect, useState } from 'react';
import { Camera, Check, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { compressImage } from '@/lib/media';
import { todayYmd } from '@/lib/clock';
import { OUTCOME_OPTIONS } from '@/lib/defects';

export default function CallBackDialog({ open, onOpenChange, defect, job, onSaved }) {
  const [attendedAt, setAttendedAt] = useState(todayYmd());
  const [attendedBy, setAttendedBy] = useState('');
  const [hours, setHours] = useState('');
  const [cost, setCost] = useState('');
  const [workDone, setWorkDone] = useState('');
  const [outcome, setOutcome] = useState('resolved');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setAttendedAt(todayYmd());
    setAttendedBy('');
    setHours('');
    setCost('');
    setWorkDone('');
    setOutcome('resolved');
    setFile(null);
    setError('');
  }, [open, defect]);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const handleFile = (event) => {
    const picked = event.target.files && event.target.files[0];
    if (!picked) return;
    setFile(picked);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(picked));
  };

  const handleSave = async () => {
    if (!workDone.trim()) {
      setError('Record what was actually done on the visit.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        job_id: job.id,
        defect_id: defect.id,
        attended_at: attendedAt,
        work_done: workDone.trim(),
        outcome,
      };
      if (attendedBy.trim()) payload.attended_by = attendedBy.trim();
      if (hours !== '') payload.hours = Number(hours);
      if (cost !== '') payload.cost = Number(cost);
      if (file) {
        const compressed = await compressImage(file);
        const uploaded = await base44.integrations.Core.UploadPrivateFile({ file: compressed });
        payload.photo_uri = uploaded.file_uri;
      }
      await base44.entities.DefectVisit.create(payload);
      if (outcome === 'resolved') {
        await base44.entities.Defect.update(defect.id, { status: 'rectified', rectified_at: attendedAt });
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(err.message || 'The call-back could not be saved');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">Log a call-back</DialogTitle>
          <DialogDescription>{defect ? defect.description : ''}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="visitDate">Date attended</Label>
              <Input id="visitDate" type="date" value={attendedAt} onChange={(event) => setAttendedAt(event.target.value)} className="num" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="visitWho">Who attended</Label>
              <Input id="visitWho" value={attendedBy} onChange={(event) => setAttendedBy(event.target.value)} placeholder="Dave and one apprentice" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="visitHours">Hours on site</Label>
              <Input id="visitHours" type="number" step="0.25" value={hours} onChange={(event) => setHours(event.target.value)} className="num" placeholder="4" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="visitCost">Cost absorbed, ex GST</Label>
              <Input id="visitCost" type="number" step="0.01" value={cost} onChange={(event) => setCost(event.target.value)} className="num" placeholder="480" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="visitWork">What was done</Label>
            <Textarea
              id="visitWork"
              rows={3}
              value={workDone}
              onChange={(event) => setWorkDone(event.target.value)}
              placeholder="Sanded the skirting line, spot primed and applied two coats, matched the surrounding wall"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="visitOutcome">Outcome</Label>
            <select
              id="visitOutcome"
              value={outcome}
              onChange={(event) => setOutcome(event.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {OUTCOME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-[4px] border border-dashed border-[#C9C2B4] bg-secondary px-3 py-2.5">
            {preview ? (
              <img src={preview} alt="Rectification photo" className="h-12 w-16 rounded-[3px] object-cover" />
            ) : (
              <Camera className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-[12px] text-muted-foreground">
              {preview ? 'Photo attached' : 'Photo of the finished repair, optional'}
            </span>
            <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="sr-only" />
          </label>

          {error ? <p className="text-[12px] text-destructive">{error}</p> : null}
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full bg-primary">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" /> Save call-back
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}