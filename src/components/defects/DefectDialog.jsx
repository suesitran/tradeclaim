import { useEffect, useState } from 'react';
import { Camera, Check, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { compressImage } from '@/lib/media';
import { todayYmd } from '@/lib/clock';
import { LIABILITY_OPTIONS } from '@/lib/defects';
import { useT } from '@/lib/i18n';
import MicButton from '@/components/MicButton';

const FIELD = 'h-12 border-2 border-foreground text-[16px]';
const SELECT = 'flex h-12 w-full border-2 border-foreground bg-card px-3 text-[16px] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-accent';

export default function DefectDialog({ open, onOpenChange, job, lines = [], onSaved }) {
  const t = useT();
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
      setError(t('Say what the builder wants fixed.'));
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
      setError(err.message || t('The defect could not be saved'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[26px] font-extrabold">{t('Add a defect')}</DialogTitle>
          <DialogDescription className="text-[15px]">{t('Write it down the day the builder raises it: what, when, and whose fault.')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="defectDescription" className="text-[15px]">{t('What do they want fixed?')}</Label>
            <Textarea
              id="defectDescription"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={t('Roller marks on the skirting line, L1 corridor 3. Sand and re-coat.')}
              className="border-2 border-foreground text-[16px]"
            />
            <MicButton onText={(said) => setDescription((current) => `${current} ${said}`.trim())} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="defectArea" className="text-[15px]">{t('Area or level')}</Label>
              <Input id="defectArea" value={area} onChange={(event) => setArea(event.target.value)} placeholder={t('L1 Corridors')} className={FIELD} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="defectLine" className="text-[15px]">{t('Which line')}</Label>
              <select id="defectLine" value={scopeLineId} onChange={(event) => setScopeLineId(event.target.value)} className={SELECT}>
                <option value="">{t('Not tied to a line')}</option>
                {lines.map((line) => (
                  <option key={line.id} value={line.id}>
                    {line.description}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="defectRaisedBy" className="text-[15px]">{t('Who raised it')}</Label>
              <Input id="defectRaisedBy" value={raisedBy} onChange={(event) => setRaisedBy(event.target.value)} placeholder={t('Site supervisor')} className={FIELD} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="defectRaisedAt" className="text-[15px]">{t('Date raised')}</Label>
              <Input id="defectRaisedAt" type="date" value={raisedAt} onChange={(event) => setRaisedAt(event.target.value)} className={`${FIELD} num`} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="defectDueAt" className="text-[15px]">{t('They want it by')}</Label>
              <Input id="defectDueAt" type="date" value={dueAt} onChange={(event) => setDueAt(event.target.value)} className={`${FIELD} num`} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="defectLiability" className="text-[15px]">{t('Whose fault is it?')}</Label>
              <select id="defectLiability" value={liability} onChange={(event) => setLiability(event.target.value)} className={SELECT}>
                {LIABILITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.label)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3 border-2 border-dashed border-foreground bg-secondary px-3 py-3">
            {preview ? <img src={preview} alt={t('Defect photo')} className="h-12 w-16 object-cover" /> : <Camera className="h-5 w-5" />}
            <span className="text-[15px]">{preview ? t('Photo attached') : t('Photo of the defect, optional')}</span>
            <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="sr-only" />
          </label>

          {error ? <p className="text-[14px] text-destructive">{error}</p> : null}
        </div>

        <button type="button" onClick={handleSave} disabled={saving} className="btn-ink w-full">
          {saving ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> {t('Saving')}
            </>
          ) : (
            <>
              <Check className="h-5 w-5" /> {t('Save the defect')}
            </>
          )}
        </button>
      </DialogContent>
    </Dialog>
  );
}
