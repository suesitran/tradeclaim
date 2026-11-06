import { useEffect, useState } from 'react';
import { Camera, Check, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { compressImage } from '@/lib/media';
import { todayYmd } from '@/lib/clock';
import { OUTCOME_OPTIONS } from '@/lib/defects';
import { useT } from '@/lib/i18n';
import MicButton from '@/components/MicButton';

const FIELD = 'h-12 border-2 border-foreground text-[16px]';
const SELECT = 'flex h-12 w-full border-2 border-foreground bg-card px-3 text-[16px] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-accent';

export default function CallBackDialog({ open, onOpenChange, defect, job, onSaved }) {
  const t = useT();
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
      setError(t('Say what was done on the visit.'));
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
      setError(err.message || t('The visit could not be saved'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[26px] font-extrabold">{t('Record a fix visit')}</DialogTitle>
          <DialogDescription className="text-[15px]">{defect ? defect.description : ''}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="visitDate" className="text-[15px]">{t('Date')}</Label>
              <Input id="visitDate" type="date" value={attendedAt} onChange={(event) => setAttendedAt(event.target.value)} className={`${FIELD} num`} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="visitWho" className="text-[15px]">{t('Who went')}</Label>
              <Input id="visitWho" value={attendedBy} onChange={(event) => setAttendedBy(event.target.value)} placeholder={t('Dave and one apprentice')} className={FIELD} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="visitHours" className="text-[15px]">{t('Hours on site')}</Label>
              <Input id="visitHours" type="number" inputMode="decimal" step="0.25" value={hours} onChange={(event) => setHours(event.target.value)} className={`${FIELD} num`} placeholder="4" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="visitCost" className="text-[15px]">{t('What it cost you, ex GST')}</Label>
              <Input id="visitCost" type="number" inputMode="decimal" step="0.01" value={cost} onChange={(event) => setCost(event.target.value)} className={`${FIELD} num`} placeholder="480" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="visitWork" className="text-[15px]">{t('What was done')}</Label>
            <Textarea
              id="visitWork"
              rows={3}
              value={workDone}
              onChange={(event) => setWorkDone(event.target.value)}
              placeholder={t('Sanded the skirting line, spot primed, two coats, matched the wall')}
              className="border-2 border-foreground text-[16px]"
            />
            <MicButton onText={(said) => setWorkDone((current) => `${current} ${said}`.trim())} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="visitOutcome" className="text-[15px]">{t('How did it go?')}</Label>
            <select id="visitOutcome" value={outcome} onChange={(event) => setOutcome(event.target.value)} className={SELECT}>
              {OUTCOME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.label)}
                </option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer items-center gap-3 border-2 border-dashed border-foreground bg-secondary px-3 py-3">
            {preview ? <img src={preview} alt={t('Repair photo')} className="h-12 w-16 object-cover" /> : <Camera className="h-5 w-5" />}
            <span className="text-[15px]">{preview ? t('Photo attached') : t('Photo of the fix, optional')}</span>
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
              <Check className="h-5 w-5" /> {t('Save the visit')}
            </>
          )}
        </button>
      </DialogContent>
    </Dialog>
  );
}
