import { useEffect, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import MicButton from '@/components/MicButton';
import { useT } from '@/lib/i18n';

export default function VoiceSheet({ open, onOpenChange, jobId, onApplied }) {
  const t = useT();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [updates, setUpdates] = useState(null);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!open) {
      setText('');
      setUpdates(null);
      setError('');
    }
  }, [open]);

  const handleAnalyse = async () => {
    if (!text.trim()) return;
    setBusy(true);
    setError('');
    setUpdates(null);
    try {
      const response = await base44.functions.invoke('structureVoiceLog', { job_id: jobId, transcript: text });
      if (response.data && response.data.error) {
        setError(response.data.error);
      } else {
        setUpdates(response.data.updates || []);
        if (!(response.data.updates || []).length) setError(t('Nothing in the note matched a line. Try naming the area and what is finished.'));
      }
    } catch (err) {
      setError(err.message || t('The note could not be read'));
    } finally {
      setBusy(false);
    }
  };

  const handleApply = async () => {
    if (!updates || !updates.length) return;
    setApplying(true);
    try {
      await base44.entities.ScopeLine.bulkUpdate(
        updates.map((update) => ({ id: update.scope_line_id, percent_complete_to_date: update.percent_complete })),
      );
      onApplied(updates.length);
      onOpenChange(false);
    } finally {
      setApplying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[26px] font-extrabold">{t("Say what's done")}</DialogTitle>
          <DialogDescription className="text-[15px]">{t('Talk or type. Name the area and how far along it is. The note is matched to your lines.')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <MicButton onText={(said) => setText((current) => `${current} ${said}`.trim())} />

          <Textarea
            rows={5}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={t('L1 corridors are finished, ceilings done, doors still to go. Stair 1 walls about half.')}
            className="border-2 border-foreground text-[16px]"
          />

          {error ? <p className="text-[14px] text-destructive">{error}</p> : null}

          {updates ? (
            <div className="space-y-1.5 border-2 border-foreground bg-secondary px-3 py-2.5">
              {updates.map((update) => (
                <div key={update.scope_line_id} className="flex items-start justify-between gap-3 text-[14px]">
                  <span className="flex-1 leading-snug">{update.label}</span>
                  <span className="num shrink-0 text-muted-foreground">
                    {update.previous_percent}% {t('to')} {update.percent_complete}%
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <button type="button" className="btn-line" onClick={handleAnalyse} disabled={busy || !text.trim()}>
            {busy ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> {t('Reading the note')}
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" /> {t('Match to my lines')}
              </>
            )}
          </button>
          <button type="button" className="btn-ink" onClick={handleApply} disabled={!updates || !updates.length || applying}>
            {applying ? t('Saving') : t('Save progress')}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
