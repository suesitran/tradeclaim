import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';

export default function EditJobDialog({ open, onOpenChange, job, onSaved }) {
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
            <DialogTitle className="font-heading text-lg">Edit job</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.builder_name.trim() || !form.builder_email.trim()) {
      setError('The job name, the builder and the builder email address are all needed');
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
      setError(err.message || 'The job could not be saved');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">Edit job</DialogTitle>
          <DialogDescription>Fix anything that was read in wrongly, and set whether the quote is complete.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="editNumber">Job number</Label>
            <Input id="editNumber" value={form.job_number} onChange={(event) => setField('job_number', event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="editName">Job name</Label>
            <Input id="editName" value={form.name} onChange={(event) => setField('name', event.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="editSite">Site address</Label>
            <Input id="editSite" value={form.site_address} onChange={(event) => setField('site_address', event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="editBuilder">Builder</Label>
            <Input id="editBuilder" value={form.builder_name} onChange={(event) => setField('builder_name', event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="editEmail">Builder email</Label>
            <Input id="editEmail" type="email" value={form.builder_email} onChange={(event) => setField('builder_email', event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="editRetention">Retention, percent</Label>
            <Input
              id="editRetention"
              type="number"
              value={form.retention_percent}
              onChange={(event) => setField('retention_percent', event.target.value)}
              className="num"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="editDlp">Defects liability period ends</Label>
            <Input id="editDlp" type="date" value={form.dlp_end_date} onChange={(event) => setField('dlp_end_date', event.target.value)} className="num" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="editNext">Next claim date</Label>
            <Input id="editNext" type="date" value={form.next_claim_date} onChange={(event) => setField('next_claim_date', event.target.value)} className="num" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="editStatus">Quote status</Label>
            <Select value={form.quote_status} onValueChange={(value) => setField('quote_status', value)}>
              <SelectTrigger id="editStatus">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft, still being built</SelectItem>
                <SelectItem value="final">Final, claim against it</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error ? <p className="text-[12px] text-destructive">{error}</p> : null}

        <DialogFooter>
          <Button onClick={handleSave} disabled={saving} className="bg-primary">
            {saving ? 'Saving' : 'Save job'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}