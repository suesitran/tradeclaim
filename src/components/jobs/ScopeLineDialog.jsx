import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { formatAud } from '@/lib/format';
import { useT } from '@/lib/i18n';
import MicButton from '@/components/MicButton';

const EMPTY = { area: '', description: '', quantity: '', unit: '', rate: '' };
const FIELD = 'h-12 border-2 border-foreground text-[16px]';

const round2 = (value) => Math.round(Number(value || 0) * 100) / 100;

export default function ScopeLineDialog({ open, onOpenChange, job, lines, line, onSaved }) {
  const t = useT();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm(
      line
        ? {
            area: line.area || '',
            description: line.description || '',
            quantity: String(line.quantity ?? ''),
            unit: line.unit || '',
            rate: String(line.rate ?? ''),
          }
        : EMPTY,
    );
  }, [open, line]);

  const quantity = Number(form.quantity || 0);
  const rate = Number(form.rate || 0);
  const amount = round2(quantity * rate);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const saveContractSum = async (nextLines) => {
    const sum = round2((nextLines || []).reduce((total, item) => total + Number(item.amount || 0), 0));
    await base44.entities.Job.update(job.id, { contract_sum_ex_gst: sum });
  };

  const handleSave = async () => {
    if (!form.description.trim()) {
      setError(t('Say what the work is.'));
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        area: form.area.trim(),
        description: form.description.trim(),
        quantity,
        unit: form.unit.trim(),
        rate,
        amount,
      };
      let nextLines;
      if (line) {
        await base44.entities.ScopeLine.update(line.id, payload);
        nextLines = lines.map((item) => (item.id === line.id ? { ...item, ...payload } : item));
      } else {
        const created = await base44.entities.ScopeLine.create({
          ...payload,
          job_id: job.id,
          sort_order: (lines.length || 0) + 1,
          percent_complete_to_date: 0,
        });
        nextLines = [...lines, created];
      }
      await saveContractSum(nextLines);
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(err.message || t('The line could not be saved'));
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setSaving(true);
    setError('');
    try {
      await base44.entities.ScopeLine.delete(line.id);
      await saveContractSum(lines.filter((item) => item.id !== line.id));
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(err.message || t('The line could not be removed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[26px] font-extrabold">{line ? t('Edit line') : t('Add a line')}</DialogTitle>
          <DialogDescription className="text-[15px]">{t('One line of the quote. Photos and claims hang off it.')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="lineArea" className="text-[15px]">{t('Area or level')}</Label>
            <Input id="lineArea" value={form.area} onChange={(event) => setField('area', event.target.value)} placeholder={t('L1 Apartments')} className={FIELD} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lineDescription" className="text-[15px]">{t('What the work is')}</Label>
            <Input
              id="lineDescription"
              value={form.description}
              onChange={(event) => setField('description', event.target.value)}
              placeholder={t('Walls, two coats low sheen')}
              className={FIELD}
            />
            <MicButton onText={(said) => setField('description', `${form.description} ${said}`.trim())} />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="lineQuantity" className="text-[15px]">{t('How many')}</Label>
              <Input id="lineQuantity" type="number" inputMode="decimal" value={form.quantity} onChange={(event) => setField('quantity', event.target.value)} className={`${FIELD} num`} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lineUnit" className="text-[15px]">{t('Unit')}</Label>
              <Input id="lineUnit" value={form.unit} onChange={(event) => setField('unit', event.target.value)} placeholder="m2" className={FIELD} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lineRate" className="text-[15px]">{t('Rate, ex GST')}</Label>
              <Input id="lineRate" type="number" inputMode="decimal" value={form.rate} onChange={(event) => setField('rate', event.target.value)} className={`${FIELD} num`} />
            </div>
          </div>
          <p className="border-2 border-foreground bg-secondary px-3 py-2.5 text-[15px]">
            {t('Line total')} <span className="num font-semibold">{formatAud(amount)}</span> <span className="legal inline">{t('ex GST')}</span>
          </p>
          {error ? <p className="text-[14px] text-destructive">{error}</p> : null}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          {line ? (
            <button type="button" className="btn-line !border-destructive !text-destructive hover:!bg-destructive hover:!text-white" onClick={handleRemove} disabled={saving}>
              {t('Remove line')}
            </button>
          ) : (
            <span />
          )}
          <button type="button" className="btn-ink" onClick={handleSave} disabled={saving}>
            {saving ? t('Saving') : line ? t('Save line') : t('Add line')}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
