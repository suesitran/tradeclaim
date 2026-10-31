import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { formatAud } from '@/lib/format';

const EMPTY = { area: '', description: '', quantity: '', unit: '', rate: '' };

const round2 = (value) => Math.round(Number(value || 0) * 100) / 100;

export default function ScopeLineDialog({ open, onOpenChange, job, lines, line, onSaved }) {
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
      setError('A description is needed for the line');
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
      setError(err.message || 'The line could not be saved');
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
      setError(err.message || 'The line could not be removed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">{line ? 'Edit scope line' : 'Add a scope line'}</DialogTitle>
          <DialogDescription>
            The wording here is what the claim and the evidence are measured against.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="lineArea">Area or level</Label>
            <Input id="lineArea" value={form.area} onChange={(event) => setField('area', event.target.value)} placeholder="L1 Apartments" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lineDescription">Description</Label>
            <Input
              id="lineDescription"
              value={form.description}
              onChange={(event) => setField('description', event.target.value)}
              placeholder="Set and stop plasterboard to walls"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="lineQuantity">Quantity</Label>
              <Input
                id="lineQuantity"
                type="number"
                value={form.quantity}
                onChange={(event) => setField('quantity', event.target.value)}
                className="num"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lineUnit">Unit</Label>
              <Input id="lineUnit" value={form.unit} onChange={(event) => setField('unit', event.target.value)} placeholder="m2" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lineRate">Rate, ex GST</Label>
              <Input
                id="lineRate"
                type="number"
                value={form.rate}
                onChange={(event) => setField('rate', event.target.value)}
                className="num"
              />
            </div>
          </div>
          <p className="text-[12px] text-muted-foreground">
            Line value <span className="num text-foreground">{formatAud(amount)}</span> excluding GST
          </p>
          {error ? <p className="text-[12px] text-destructive">{error}</p> : null}
        </div>

        <DialogFooter className="sm:justify-between">
          {line ? (
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={handleRemove} disabled={saving}>
              Remove line
            </Button>
          ) : (
            <span />
          )}
          <Button onClick={handleSave} disabled={saving} className="bg-primary">
            {saving ? 'Saving' : line ? 'Save line' : 'Add line'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}