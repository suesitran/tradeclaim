import { useEffect, useState } from 'react';
import { Camera, Check, Loader2, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { compressImage, getPosition } from '@/lib/media';
import { STAGE_LABELS } from '@/lib/format';
import { useT } from '@/lib/i18n';
import MicButton from '@/components/MicButton';

const STAGES = ['before', 'finish', 'clear'];

export default function CaptureSheet({ open, onOpenChange, jobId, line, onSaved }) {
  const t = useT();
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
      setError(err.message || t('The photo could not be saved'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="border-b-2 border-foreground px-5 py-4">
          <DialogTitle className="text-[22px] font-extrabold leading-tight">{line ? line.description : t('Take the photo')}</DialogTitle>
          <DialogDescription className="text-[15px]">{line ? line.area : ''}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4">
          <label className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-foreground bg-secondary px-4 py-6 text-center">
            {preview ? (
              <img src={preview} alt={t('Photo')} className="max-h-48 w-full object-cover" />
            ) : (
              <>
                <Camera className="h-9 w-9" />
                <span className="font-heading text-[20px] font-bold uppercase">{t('Take the photo')}</span>
                <span className="text-[13px] text-muted-foreground">{t('Opens the camera on a phone')}</span>
              </>
            )}
            <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="sr-only" />
          </label>

          <div>
            <p className="eyebrow">{t('When was this taken?')}</p>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {STAGES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStage(option)}
                  className={`min-h-[48px] border-2 border-foreground px-2 py-2 font-heading text-[16px] font-bold uppercase transition-colors ${
                    stage === option ? 'bg-foreground text-accent' : 'bg-card text-foreground'
                  }`}
                >
                  {t(STAGE_LABELS[option])}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow">{t('Note, optional')}</p>
            <Input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={t('Coats applied, colour, anything you noticed')}
              className="mt-1.5 h-12 border-2 border-foreground text-[16px]"
            />
            <MicButton className="mt-2" onText={(said) => setNote((current) => `${current} ${said}`.trim())} />
          </div>

          <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {t('Time and location are saved with the photo.')}
          </p>

          {error ? <p className="text-[14px] text-destructive">{error}</p> : null}
        </div>

        <div className="border-t-2 border-foreground px-5 py-4">
          <button type="button" onClick={handleSave} disabled={!file || saving} className="btn-ink w-full">
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> {t('Saving')}
              </>
            ) : (
              <>
                <Check className="h-5 w-5" /> {t('Save the photo')}
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
