import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SAMPLE_QUOTE, csvToScopeLines } from '@/lib/csv';
import { formatAud } from '@/lib/format';
import { addDays, todayYmd } from '@/lib/clock';

export default function ImportQuote() {
  const navigate = useNavigate();
  const [csv, setCsv] = useState('');
  const [jobNumber, setJobNumber] = useState('');
  const [name, setName] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [builderName, setBuilderName] = useState('');
  const [builderEmail, setBuilderEmail] = useState('');
  const [retention, setRetention] = useState('5');
  const [dlp, setDlp] = useState('');
  const [nextClaim, setNextClaim] = useState(addDays(todayYmd(), 30));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const parsed = csv.trim() ? csvToScopeLines(csv) : { lines: [], error: null };
  const lines = parsed.lines;
  const total = lines.reduce((sum, line) => sum + Number(line.amount || 0), 0);

  const handleImport = async () => {
    if (!lines.length) {
      setError('Paste the quote as CSV first.');
      return;
    }
    if (!name.trim() || !builderName.trim() || !builderEmail.trim()) {
      setError('The job needs a name, a builder and a builder email address.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        job_number: jobNumber.trim(),
        name: name.trim(),
        site_address: siteAddress.trim(),
        builder_name: builderName.trim(),
        builder_email: builderEmail.trim(),
        contract_sum_ex_gst: Math.round(total * 100) / 100,
        claim_period: 'monthly',
        retention_percent: Number(retention || 0),
      };
      if (dlp) payload.dlp_end_date = dlp;
      if (nextClaim) payload.next_claim_date = nextClaim;
      const job = await base44.entities.Job.create(payload);
      await base44.entities.ScopeLine.bulkCreate(lines.map((line) => ({ ...line, job_id: job.id })));
      navigate(`/jobs/${job.id}`);
    } catch (err) {
      setError(err.message || 'The job could not be created');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button type="button" onClick={() => navigate('/')} className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> All jobs
      </button>

      <div>
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Step one</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">Import a quote</h1>
        <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
          Paste the quote as CSV with columns for area, description, quantity, unit, rate and amount. Every line becomes a tracked scope line for evidence and claims.
        </p>
      </div>

      <div className="space-y-4 rounded-[4px] border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <Label htmlFor="csv">Quoted scope, CSV</Label>
          <button type="button" onClick={() => setCsv(SAMPLE_QUOTE)} className="text-[11px] text-accent hover:underline">
            Load a sample painting quote
          </button>
        </div>
        <Textarea
          id="csv"
          rows={8}
          value={csv}
          onChange={(event) => setCsv(event.target.value)}
          placeholder={'Area,Description,Quantity,Unit,Rate,Amount\nL1 Corridors,Paint walls PT1 low sheen,1240,m2,12.50,15500'}
          className="num text-[12px]"
        />
        {parsed.error ? <p className="text-[12px] text-destructive">{parsed.error}</p> : null}
        {lines.length ? (
          <p className="text-[12px] text-muted-foreground">
            {lines.length} lines read, {formatAud(total)} excluding GST.
          </p>
        ) : null}
        {lines.length ? (
          <div className="max-h-52 overflow-y-auto rounded-[3px] border border-border">
            <table className="w-full border-collapse text-left text-[11px]">
              <tbody>
                {lines.map((line) => (
                  <tr key={line.sort_order} className="border-b border-border last:border-b-0">
                    <td className="px-3 py-1.5 text-muted-foreground">{line.area}</td>
                    <td className="px-3 py-1.5">{line.description}</td>
                    <td className="num px-3 py-1.5 text-right">{formatAud(line.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      <div className="space-y-4 rounded-[4px] border border-border bg-card p-5">
        <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">The job</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="jobNumber">Job number</Label>
            <Input id="jobNumber" value={jobNumber} onChange={(event) => setJobNumber(event.target.value)} placeholder="0447" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">Job name</Label>
            <Input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="L1 and L2 apartments, repaint" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="site">Site address</Label>
            <Input id="site" value={siteAddress} onChange={(event) => setSiteAddress(event.target.value)} placeholder="18 Cremorne Street, Richmond VIC 3121" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="builder">Builder</Label>
            <Input id="builder" value={builderName} onChange={(event) => setBuilderName(event.target.value)} placeholder="Corvus Construction" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Builder email</Label>
            <Input id="email" type="email" value={builderEmail} onChange={(event) => setBuilderEmail(event.target.value)} placeholder="claims@example.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="retention">Retention, percent</Label>
            <Input id="retention" type="number" value={retention} onChange={(event) => setRetention(event.target.value)} className="num" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dlp">Defects liability period ends</Label>
            <Input id="dlp" type="date" value={dlp} onChange={(event) => setDlp(event.target.value)} className="num" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nextClaim">Next claim date</Label>
            <Input id="nextClaim" type="date" value={nextClaim} onChange={(event) => setNextClaim(event.target.value)} className="num" />
          </div>
        </div>

        {error ? <p className="text-[12px] text-destructive">{error}</p> : null}

        <Button onClick={handleImport} disabled={saving} className="bg-primary">
          <FileUp className="mr-2 h-4 w-4" />
          {saving ? 'Creating the job' : 'Create the job'}
        </Button>
      </div>
    </div>
  );
}