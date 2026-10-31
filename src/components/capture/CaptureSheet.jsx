import { useEffect, useState } from 'react';
import { Camera, Check, Loader2, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { compressImage, getPosition } from '@/lib/media';
import { STAGE_LABELS, STAGE_TONES } from '@/lib/format';

const STAGES = ['before', 'finish', 'clear'];

export default function CaptureSheet({ open, onOpenChange, jobId, line, onSaved }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [stage, setStage] = useState('finish');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setFile(null);
    setPreview(null);
    setStage('finish');
    setNote('');
    setError('');
  }, [open, line]);

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
    if (!file || !line) return;
    setSaving(true);
    setError('');
    try {
      const compressed = await compressImage(file);
      const uploaded = await base44.integrations.Core.UploadPrivateFile({ file: compressed });
      const position = await getPosition();
      const payload = {
        job_id: jobId,
        scope_line_id: line.id,
        stage,
        photo_uri: uploaded.file_uri,
        captured_at: new Date(file.lastModified || Date.now()).toISOString(),
        received_at: new Date().toISOString(),
      };
      if (position) {
        payload.latitude = position.latitude;
        payload.longitude = position.longitude;
        if (position.accuracy) payload.accuracy = Math.round(position.accuracy);
      }
      if (note.trim()) payload.note = note.trim();
      const created = await base44.entities.Evidence.create(payload);
      onSaved(created);
      onOpenChange(false);
    } catch (err) {
      setError(err.message || 'The photo could not be saved');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle className="font-heading text-base leading-tight">{line ? line.description : 'Capture'}</DialogTitle>
          <DialogDescription>{line ? line.area : ''}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[4px] border border-dashed border-[#C9C2B4] bg-secondary px-4 py-8 text-center">
            {preview ? (
              <img src={preview} alt="Captured photo" className="max-h-48 w-full rounded-[3px] object-cover" />
            ) : (
              <>
                <Camera className="h-7 w-7 text-muted-foreground" />
                <span className="text-sm font-medium">Take the photo</span>
                <span className="text-[11px] text-muted-foreground">Opens the camera on a phone, or a file picker on desktop</span>
              </>
            )}
            <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="sr-only" />
          </label>

          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Stage</p>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {STAGES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStage(option)}
                  className={`rounded-[3px] border px-2 py-2 text-[11px] font-medium transition-colors ${
                    stage === option ? 'border-primary bg-primary text-primary-foreground' : `border-border bg-card ${STAGE_TONES[option].split(' ')[1]}`
                  }`}
                >
                  {STAGE_LABELS[option]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Note, optional</p>
            <Input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Coats applied, colour, defect noticed" className="mt-1.5" />
          </div>

          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            Time and location are recorded with the photo.
          </p>

          {error ? <p className="text-[12px] text-destructive">{error}</p> : null}
        </div>

        <div className="border-t border-border px-5 py-4">
          <Button onClick={handleSave} disabled={!file || saving} className="w-full bg-primary">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" /> Save to scope line
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}