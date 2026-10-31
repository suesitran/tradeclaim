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
import { LIABILITY_OPTIONS } from '@/lib/defects';

export default function DefectDialog({ open, onOpenChange, job, lines = [], onSaved }) {
  const [description, setDescription] = useState('');
  const [area, setArea] = useState('');
  const [scopeLineId, setScopeLineId] = useState('');
  const [raisedBy, setRaisedBy] = useState(job?.builder_name || '');
  const [raisedAt, setRaisedAt] = useState(todayYmd());
  const [dueAt, setDueAt] = useState('');
  const [liability, setLiability] = useState('unclear');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setDescription('');
    setArea('');
    setScopeLineId('');
    setRaisedBy(job?.builder_name || '');
    setRaisedAt(todayYmd());
    setDueAt('');
    setLiability('unclear');
    setFile(null);
    setError('');
  }, [open, job]);

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
    if (!description.trim()) {
      setError('Say what the builder has called defective.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        job_id: job.id,
        description: description.trim(),
        raised_at: raisedAt,
        liability,
        status: 'open',
      };
      if (area.trim()) payload.area = area.trim();
      if (scopeLineId) payload.scope_line_id = scopeLineId;
      if (raisedBy.trim()) payload.raised_by = raisedBy.trim();
      if (dueAt) payload.due_at = dueAt;
      if (file) {
        const compressed = await compressImage(file);
        const uploaded = await base44.integrations.Core.UploadPrivateFile({ file: compressed });
        payload.photo_uri = uploaded.file_uri;
      }
      await base44.entities.Defect.create(payload);
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(err.message || 'The defect could not be saved');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">Raise a defect</DialogTitle>
          <DialogDescription>Log the notice the day it arrives, so the date, the wording and whether it is your workmanship are all on record.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="defectDescription">What was called defective</Label>
            <Textarea
              id="defectDescription"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Skirting line in L1 corridor 3 showing roller marks, asked to sand and re-coat"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="defectArea">Area or level</Label>
              <Input id="defectArea" value={area} onChange={(event) => setArea(event.target.value)} placeholder="L1 Corridors" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="defectLine">Quoted scope line</Label>
              <select
                id="defectLine"
                value={scopeLineId}
                onChange={(event) => setScopeLineId(event.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Not tied to a line</option>
                {lines.map((line) => (
                  <option key={line.id} value={line.id}>
                    {line.description}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="defectRaisedBy">Raised by</Label>
              <Input id="defectRaisedBy" value={raisedBy} onChange={(event) => setRaisedBy(event.target.value)} placeholder="Site supervisor" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="defectRaisedAt">Date raised</Label>
              <Input id="defectRaisedAt" type="date" value={raisedAt} onChange={(event) => setRaisedAt(event.target.value)} className="num" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="defectDueAt">They want it by</Label>
              <Input id="defectDueAt" type="date" value={dueAt} onChange={(event) => setDueAt(event.target.value)} className="num" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="defectLiability">Whose issue is it</Label>
              <select
                id="defectLiability"
                value={liability}
                onChange={(event) => setLiability(event.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {LIABILITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-[4px] border border-dashed border-[#C9C2B4] bg-secondary px-3 py-2.5">
            {preview ? (
              <img src={preview} alt="Defect photo" className="h-12 w-16 rounded-[3px] object-cover" />
            ) : (
              <Camera className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-[12px] text-muted-foreground">
              {preview ? 'Photo attached' : 'Photo of the defect, optional'}
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
              <Check className="mr-2 h-4 w-4" /> Add to the register
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}