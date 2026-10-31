import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { csvToScopeLines, scopeLineToCsvRow, scopeLinesToCsv } from '@/lib/csv';
import { CSV_TEMPLATE, downloadTextFile } from '@/lib/quoteTemplate';
import { SAMPLES, SAMPLE_PLACEHOLDER } from '@/lib/sampleQuotes';
import { formatAud } from '@/lib/format';
import { addDays, todayYmd } from '@/lib/clock';
import { DEFAULT_JURISDICTION, jurisdictionFor } from '@/lib/jurisdictions';
import QuoteVoiceAssistant from '@/components/import/QuoteVoiceAssistant';
import QuotePdfImport from '@/components/import/QuotePdfImport';

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
  const [saving, setSaving] = useState('');
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState('');
  const fieldsRef = useRef({});
  const linesRef = useRef([]);
  const jobIdRef = useRef(null);
  const saveChainRef = useRef(Promise.resolve());

  const parsed = csv.trim() ? csvToScopeLines(csv) : { lines: [], error: null };
  const lines = parsed.lines;
  const total = lines.reduce((sum, line) => sum + Number(line.amount || 0), 0);

  // The voice assistant calls this mid conversation, so the latest values are
  // read from refs rather than state: a patch and a save can arrive in the same
  // tool-call batch, before React has re-rendered.
  useEffect(() => {
    fieldsRef.current = {
      job_number: jobNumber,
      name,
      site_address: siteAddress,
      builder_name: builderName,
      builder_email: builderEmail,
      retention_percent: retention,
      dlp_end_date: dlp,
      next_claim_date: nextClaim,
    };
    linesRef.current = lines;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobNumber, name, siteAddress, builderName, builderEmail, retention, dlp, nextClaim, csv]);

  const persistQuote = async (kind) => {
    const fields = fieldsRef.current;
    const scopeLines = linesRef.current;
    const jobName = String(fields.name || '').trim();
    const jobBuilder = String(fields.builder_name || '').trim();
    const jobBuilderEmail = String(fields.builder_email || '').trim();

    if (!jobName || !jobBuilder || !jobBuilderEmail) {
      return { ok: false, message: 'Still needed before this can be saved: the job name, the builder and the builder email address.' };
    }
    if (kind === 'final' && !scopeLines.length) {
      return { ok: false, message: 'Still needed before the quote can be final: at least one quoted scope line.' };
    }

    const sum = scopeLines.reduce((running, line) => running + Number(line.amount || 0), 0);
    const payload = {
      job_number: String(fields.job_number || '').trim(),
      name: jobName,
      site_address: String(fields.site_address || '').trim(),
      builder_name: jobBuilder,
      builder_email: jobBuilderEmail,
      state: DEFAULT_JURISDICTION,
      contract_sum_ex_gst: Math.round(sum * 100) / 100,
      claim_period: 'monthly',
      retention_percent: Number(fields.retention_percent || 0),
      quote_status: kind,
    };
    if (fields.dlp_end_date) payload.dlp_end_date = fields.dlp_end_date;
    if (fields.next_claim_date) payload.next_claim_date = fields.next_claim_date;

    setSaving(kind);
    setError('');
    try {
      let jobId = jobIdRef.current;
      if (jobId) {
        await base44.entities.Job.update(jobId, payload);
        await base44.entities.ScopeLine.deleteMany({ job_id: jobId });
      } else {
        const job = await base44.entities.Job.create(payload);
        jobId = job.id;
        jobIdRef.current = jobId;
      }
      if (scopeLines.length) {
        await base44.entities.ScopeLine.bulkCreate(scopeLines.map((line) => ({ ...line, job_id: jobId })));
      }
      setSaved({ kind, at: new Date() });
      if (kind === 'final') {
        navigate(`/jobs/${jobId}`);
        return { ok: true, message: 'Saved as the final quote for this job.' };
      }
      return { ok: true, message: 'Draft saved. Keep adding lines.' };
    } catch (err) {
      setError(err.message || 'The quote could not be saved');
      return { ok: false, message: err.message || 'The quote could not be saved' };
    } finally {
      setSaving('');
    }
  };

  // Saves run one after another so a burst of voice tool calls cannot create
  // two jobs or overlap a delete and an insert of the same scope lines.
  const saveQuote = (kind) => {
    const run = saveChainRef.current.then(() => persistQuote(kind));
    saveChainRef.current = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  };

  const saveDraft = () => saveQuote('draft');
  const saveFinal = () => saveQuote('final');

  const applyVoicePatch = (patch) => {
    const next = { ...fieldsRef.current };
    if (patch.job_number !== undefined) next.job_number = String(patch.job_number);
    if (patch.name !== undefined) next.name = String(patch.name);
    if (patch.site_address !== undefined) next.site_address = String(patch.site_address);
    if (patch.builder_name !== undefined) next.builder_name = String(patch.builder_name);
    if (patch.builder_email !== undefined) next.builder_email = String(patch.builder_email);
    if (patch.retention_percent !== undefined) next.retention_percent = String(patch.retention_percent);
    if (patch.dlp_end_date !== undefined) next.dlp_end_date = String(patch.dlp_end_date);
    if (patch.next_claim_date !== undefined) next.next_claim_date = String(patch.next_claim_date);
    fieldsRef.current = next;

    if (patch.job_number !== undefined) setJobNumber(next.job_number);
    if (patch.name !== undefined) setName(next.name);
    if (patch.site_address !== undefined) setSiteAddress(next.site_address);
    if (patch.builder_name !== undefined) setBuilderName(next.builder_name);
    if (patch.builder_email !== undefined) setBuilderEmail(next.builder_email);
    if (patch.retention_percent !== undefined) setRetention(next.retention_percent);
    if (patch.dlp_end_date !== undefined) setDlp(next.dlp_end_date);
    if (patch.next_claim_date !== undefined) setNextClaim(next.next_claim_date);
  };

  const appendVoiceLines = (incoming) => {
    const read = (incoming || [])
      .map((line) => {
        const description = String((line && line.description) || '').trim();
        if (!description) return null;
        const quantity = Number(line.quantity || 0);
        const rate = Number(line.rate || 0);
        return {
          area: line.area || '',
          description,
          quantity,
          unit: line.unit || '',
          rate,
          amount: Math.round(quantity * rate * 100) / 100,
          percent_complete_to_date: 0,
        };
      })
      .filter(Boolean);
    if (!read.length) return 0;

    const withOrder = read.map((line, index) => ({ ...line, sort_order: linesRef.current.length + index + 1 }));
    linesRef.current = [...linesRef.current, ...withOrder];
    setCsv((current) => {
      const body = current.replace(/\s+$/, '');
      const rows = withOrder.map(scopeLineToCsvRow).join('\n');
      return body ? `${body}\n${rows}` : `Area,Description,Quantity,Unit,Rate,Amount\n${rows}`;
    });
    setError('');
    return withOrder.length;
  };

  const applyExtractedQuote = (data) => {
    const header = data.job || {};
    const patch = {};
    if (header.job_number) patch.job_number = header.job_number;
    if (header.name) patch.name = header.name;
    if (header.site_address) patch.site_address = header.site_address;
    if (header.builder_name) patch.builder_name = header.builder_name;
    if (header.builder_email) patch.builder_email = header.builder_email;
    if (header.retention_percent) patch.retention_percent = header.retention_percent;
    if (Object.keys(patch).length) applyVoicePatch(patch);
    setCsv(scopeLinesToCsv((data.lines || []).map((line, index) => ({ ...line, sort_order: index + 1 }))));
    setError('');
  };

  const voiceJob = {
    job_number: jobNumber,
    name,
    site_address: siteAddress,
    builder_name: builderName,
    builder_email: builderEmail,
    state: DEFAULT_JURISDICTION,
    retention_percent: Number(retention || 0),
    dlp_end_date: dlp,
    next_claim_date: nextClaim,
    line_count: lines.length,
    quote_total: total,
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button type="button" onClick={() => navigate('/app')} className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> All jobs
      </button>

      <div>
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Step one</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">Import a quote</h1>
        <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
          Upload the quote as a PDF, talk it through, or paste it as CSV with columns for area, description, quantity, unit, rate and amount. Every line becomes a tracked scope line for evidence and claims.
        </p>
      </div>

      <QuotePdfImport onExtracted={applyExtractedQuote} />

      <QuoteVoiceAssistant
        job={voiceJob}
        onPatch={applyVoicePatch}
        onAddLines={appendVoiceLines}
        onSaveDraft={saveDraft}
        onSaveFinal={saveFinal}
      />

      <div className="space-y-4 rounded-[4px] border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="csv">Quoted scope, CSV</Label>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] text-muted-foreground">Sample quote</span>
            <button
              type="button"
              onClick={() => downloadTextFile('tradeclaim-quote-template.csv', CSV_TEMPLATE)}
              className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline"
            >
              <Download className="h-3 w-3" /> Download the CSV template
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => {
                setCsv(sample.csv);
                setError('');
              }}
              className="rounded-[3px] border border-border px-2.5 py-1 text-[11px] text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              {sample.trade}
            </button>
          ))}
        </div>
        <Textarea
          id="csv"
          rows={8}
          value={csv}
          onChange={(event) => setCsv(event.target.value)}
          placeholder={SAMPLE_PLACEHOLDER}
          className="num text-[12px]"
        />
        {parsed.error ? <p className="text-[12px] text-destructive">{parsed.error}</p> : null}
        {lines.length ? (
          <p className="text-[12px] text-muted-foreground">
            {lines.length} lines read, {formatAud(total)} excluding GST.
          </p>
        ) : null}
        {lines.length ? (
          <div className="max-h-52 overflow-auto rounded-[3px] border border-border">
            <table className="w-full border-collapse text-left text-[11px]">
              <tbody>
                {lines.map((line) => (
                  <tr key={line.sort_order} className="border-b border-border last:border-b-0">
                    <td className="break-words px-2 py-1.5 text-muted-foreground sm:px-3">{line.area}</td>
                    <td className="break-words px-2 py-1.5 sm:px-3">{line.description}</td>
                    <td className="num whitespace-nowrap px-2 py-1.5 text-right sm:px-3">{formatAud(line.amount)}</td>
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
            <Label>Jurisdiction</Label>
            <p className="flex h-9 items-center rounded-md border border-border bg-secondary/60 px-3 text-sm">Victoria</p>
          </div>
          <div className="space-y-1.5">
            <Label>Governing Act</Label>
            <p className="text-[11px] leading-relaxed text-muted-foreground">{jurisdictionFor(DEFAULT_JURISDICTION).act}</p>
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

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button onClick={saveFinal} disabled={Boolean(saving)} className="w-full bg-primary sm:w-auto">
            <FileUp className="mr-2 h-4 w-4" />
            {saving === 'final' ? 'Saving the final quote' : 'Save final quote'}
          </Button>
          <Button variant="outline" onClick={saveDraft} disabled={Boolean(saving)} className="w-full sm:w-auto">
            {saving === 'draft' ? 'Saving the draft' : 'Save as draft'}
          </Button>
        </div>

        {saved ? (
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {saved.kind === 'final' ? 'Final quote saved' : 'Draft saved'} at{' '}
            {saved.at.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' })}.
          </p>
        ) : null}
      </div>
    </div>
  );
}