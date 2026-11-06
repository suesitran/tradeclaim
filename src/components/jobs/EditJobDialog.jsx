import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { useT } from '@/lib/i18n';

const FIELD = 'h-12 border-2 border-foreground text-[16px]';

export default function EditJobDialog({ open, onOpenChange, job, onSaved }) {
  const t = useT();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !job) return;
    setError('');
    setForm({
      job_number: job.job_number || '',
      name: job.name || '',
      site_address: job.site_address || '',
      builder_name: job.builder_name || '',
      builder_email: job.builder_email || '',
      retention_percent: String(job.retention_percent ?? 0),
      dlp_end_date: job.dlp_end_date || '',
      next_claim_date: job.next_claim_date || '',
      quote_status: job.quote_status || 'draft',
    });
  }, [open, job]);

  if (!form) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[26px] font-extrabold">{t('Edit job')}</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.builder_name.trim() || !form.builder_email.trim()) {
      setError(t('The job name, the builder and the builder email are all needed.'));
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        job_number: form.job_number.trim(),
        name: form.name.trim(),
        site_address: form.site_address.trim(),
        builder_name: form.builder_name.trim(),
        builder_email: form.builder_email.trim(),
        retention_percent: Number(form.retention_percent || 0),
        quote_status: form.quote_status,
      };
      payload.dlp_end_date = form.dlp_end_date || null;
      payload.next_claim_date = form.next_claim_date || null;
      await base44.entities.Job.update(job.id, payload);
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(err.message || t('The job could not be saved'));
    } finally {
      setSaving(false);
    }
  };

  const field = (key, label, props = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={`edit-${key}`} className="text-[15px]">{t(label)}</Label>
      <Input id={`edit-${key}`} value={form[key]} onChange={(event) => setField(key, event.target.value)} className={`${FIELD} ${props.num ? 'num' : ''}`} type={props.type || 'text'} />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[26px] font-extrabold">{t('Edit job')}</DialogTitle>
          <DialogDescription className="text-[15px]">{t('Fix anything that came in wrong.')}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          {field('job_number', 'Job number')}
          {field('name', 'Job name')}
          <div className="sm:col-span-2">{field('site_address', 'Site address')}</div>
          {field('builder_name', 'Builder')}
          {field('builder_email', 'Builder email', { type: 'email' })}
          {field('retention_percent', 'Retention, percent', { type: 'number', num: true })}
          {field('dlp_end_date', 'Retention held until', { type: 'date', num: true })}
          {field('next_claim_date', 'Next claim date', { type: 'date', num: true })}
          <div className="space-y-1.5">
            <Label className="text-[15px]">{t('Is the quote final?')}</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['draft', 'Still changing'],
                ['final', 'Final'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setField('quote_status', value)}
                  className={`min-h-[48px] border-2 border-foreground font-heading text-[16px] font-bold uppercase ${form.quote_status === value ? 'bg-foreground text-accent' : 'bg-card'}`}
                >
                  {t(label)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error ? <p className="text-[14px] text-destructive">{error}</p> : null}

        <DialogFooter className="gap-2">
          <button type="button" className="btn-line" onClick={() => onOpenChange(false)}>{t('Cancel')}</button>
          <button type="button" className="btn-ink" onClick={handleSave} disabled={saving}>
            {saving ? t('Saving') : t('Save')}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
