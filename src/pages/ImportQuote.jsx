import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Download, FileSearch, Keyboard, Mic } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { csvToScopeLines, scopeLineToCsvRow, scopeLinesToCsv } from '@/lib/csv';
import { CSV_TEMPLATE, downloadTextFile } from '@/lib/quoteTemplate';
import { SAMPLES, SAMPLE_PLACEHOLDER } from '@/lib/sampleQuotes';
import { formatAud } from '@/lib/format';
import { addDays, todayYmd } from '@/lib/clock';
import { DEFAULT_JURISDICTION } from '@/lib/jurisdictions';
import { useT } from '@/lib/i18n';
import QuoteVoiceAssistant from '@/components/import/QuoteVoiceAssistant';
import QuotePdfImport from '@/components/import/QuotePdfImport';

const FIELD = 'h-12 border-2 border-foreground text-[16px]';
const STEPS = ['The job', 'What you quoted', 'Check and save'];
const WAYS = [
  { key: 'upload', icon: FileSearch, label: 'Upload it', sub: 'A PDF or a photo of the quote' },
  { key: 'talk', icon: Mic, label: 'Talk it through', sub: 'Read the quote out loud' },
  { key: 'type', icon: Keyboard, label: 'Type it in', sub: 'One line per row' },
];

// Three screens instead of one long form: who the job is for, what was quoted,
// then a check before saving. All the state lives here so the voice assistant
// can fill any step from any step.
export default function ImportQuote() {
  const t = useT();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [way, setWay] = useState('');
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
      return { ok: false, message: t('Still needed: the job name, the builder and the builder email.') };
    }
    if (kind === 'final' && !scopeLines.length) {
      return { ok: false, message: t('Still needed: at least one line from the quote.') };
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
        return { ok: true, message: t('Saved as the final quote for this job.') };
      }
      return { ok: true, message: t('Draft saved. Keep adding lines.') };
    } catch (err) {
      setError(err.message || t('The quote could not be saved'));
      return { ok: false, message: err.message || t('The quote could not be saved') };
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
  const saveFinal = async () => {
    const outcome = await saveQuote('final');
    if (!outcome.ok) setError(outcome.message);
  };

  const applyVoicePatch = (patch) => {
    const next = { ...fieldsRef.current };
    const keys = ['job_number', 'name', 'site_address', 'builder_name', 'builder_email', 'retention_percent', 'dlp_end_date', 'next_claim_date'];
    keys.forEach((key) => {
      if (patch[key] !== undefined) next[key] = String(patch[key]);
    });
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

  const jobReady = name.trim() && builderName.trim() && builderEmail.trim();

  const goNext = () => {
    setError('');
    if (step === 0 && !jobReady) {
      setError(t('Still needed: the job name, the builder and the builder email.'));
      return;
    }
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
    window.scrollTo({ top: 0 });
  };

  const field = (id, label, value, setter, props = {}) => (
    <div className={`space-y-1.5 ${props.wide ? 'sm:col-span-2' : ''}`}>
      <Label htmlFor={id} className="text-[15px]">{t(label)}</Label>
      <Input id={id} type={props.type || 'text'} inputMode={props.inputMode} value={value} onChange={(event) => setter(event.target.value)} placeholder={props.placeholder} className={`${FIELD} ${props.num ? 'num' : ''}`} />
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button type="button" onClick={() => navigate('/app')} className="inline-flex items-center gap-1.5 font-heading text-[16px] font-bold uppercase tracking-[0.02em] hover:underline">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t('All jobs')}
      </button>

      <div className="border-b-[3px] border-foreground pb-4">
        <p className="eyebrow">{t('New job')}</p>
        <h1 className="mt-1 text-[40px] font-extrabold leading-none sm:text-[56px]">{t('Add a quote')}</h1>
      </div>

      <ol className="grid grid-cols-3 gap-px border-2 border-foreground bg-foreground">
        {STEPS.map((label, index) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => index < step && setStep(index)}
              className={`flex min-h-[64px] w-full items-center gap-2 px-3 py-2 text-left ${index === step ? 'bg-foreground text-accent' : index < step ? 'bg-card' : 'bg-secondary text-muted-foreground'}`}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center border-2 font-heading text-[18px] font-extrabold ${index === step ? 'border-accent' : 'border-foreground'}`}>
                {index < step ? <Check className="h-5 w-5" /> : index + 1}
              </span>
              <span className={`font-heading text-[15px] font-bold uppercase leading-tight sm:text-[18px] ${index === step ? '' : 'hidden sm:inline'}`}>{t(label)}</span>
            </button>
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <section className="sheet p-5">
          <h2 className="text-[26px] font-extrabold">{t('Who is the job for?')}</h2>
          <p className="mt-1 text-[15px] text-muted-foreground">{t('The claim goes to the builder email, so get that one right.')}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {field('name', 'Job name', name, setName, { placeholder: t('L1 and L2 apartments, repaint') })}
            {field('jobNumber', 'Job number, if there is one', jobNumber, setJobNumber, { placeholder: '0447' })}
            {field('builder', 'Builder', builderName, setBuilderName, { placeholder: t('Corvus Construction') })}
            {field('email', 'Builder email', builderEmail, setBuilderEmail, { type: 'email', placeholder: 'claims@example.com' })}
            {field('site', 'Site address', siteAddress, setSiteAddress, { wide: true, placeholder: t('18 Cremorne Street, Richmond VIC 3121') })}
          </div>

          <details className="mt-5 border-t-2 border-foreground pt-4">
            <summary className="cursor-pointer font-heading text-[18px] font-bold uppercase">{t('Retention and dates')}</summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {field('retention', 'Retention, percent', retention, setRetention, { type: 'number', inputMode: 'decimal', num: true })}
              {field('dlp', 'Retention held until', dlp, setDlp, { type: 'date', num: true })}
              {field('nextClaim', 'Next claim date', nextClaim, setNextClaim, { type: 'date', num: true })}
            </div>
            <p className="legal mt-2">{t('Victoria. Security of Payment Act 2002 (Vic).')}</p>
          </details>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-[26px] font-extrabold">{t('How do you want to put the quote in?')}</h2>
            <p className="mt-1 text-[15px] text-muted-foreground">{t('Each line on the quote becomes a line you take photos on and claim against.')}</p>
          </div>
          <div className="grid gap-px border-2 border-foreground bg-foreground sm:grid-cols-3">
            {WAYS.map(({ key, icon: Icon, label, sub }) => (
              <button
                key={key}
                type="button"
                onClick={() => setWay(key)}
                className={`flex min-h-[96px] flex-col items-start gap-1 p-4 text-left transition-colors ${way === key ? 'bg-foreground text-accent' : 'bg-card hover:bg-secondary'}`}
              >
                <Icon className="h-7 w-7" />
                <span className="font-heading text-[20px] font-extrabold uppercase leading-none">{t(label)}</span>
                <span className={`text-[14px] ${way === key ? 'text-background/80' : 'text-muted-foreground'}`}>{t(sub)}</span>
              </button>
            ))}
          </div>

          {way === 'upload' ? <QuotePdfImport onExtracted={applyExtractedQuote} /> : null}

          {way === 'talk' ? (
            <QuoteVoiceAssistant job={voiceJob} onPatch={applyVoicePatch} onAddLines={appendVoiceLines} onSaveDraft={saveDraft} onSaveFinal={saveFinal} />
          ) : null}

          {way === 'type' ? (
            <div className="sheet space-y-3 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor="csv" className="text-[15px]">{t('One line per row: area, what, how many, unit, rate, amount')}</Label>
                <button type="button" onClick={() => downloadTextFile('tradeclaim-quote-template.csv', CSV_TEMPLATE)} className="inline-flex items-center gap-1 text-[13px] underline">
                  <Download className="h-3.5 w-3.5" /> {t('Get the spreadsheet template')}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[13px] text-muted-foreground">{t('Try a sample')}:</span>
                {SAMPLES.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => {
                      setCsv(sample.csv);
                      setError('');
                    }}
                    className="btn-small"
                  >
                    {sample.trade}
                  </button>
                ))}
              </div>
              <Textarea id="csv" rows={8} value={csv} onChange={(event) => setCsv(event.target.value)} placeholder={SAMPLE_PLACEHOLDER} className="num border-2 border-foreground text-[13px]" />
            </div>
          ) : null}

          {parsed.error ? <p className="text-[14px] text-destructive">{parsed.error}</p> : null}
          {lines.length ? (
            <p className="border-l-[6px] border-accent bg-secondary px-4 py-3 text-[16px]">
              {t('{count} lines read, {amount} ex GST.', { count: lines.length, amount: formatAud(total) })}
            </p>
          ) : null}
        </section>
      ) : null}

      {step === 2 ? (
        <section className="space-y-4">
          <div className="sheet">
            <div className="sheet-head">
              <h2 className="text-[20px] font-extrabold">{name || t('The job')}</h2>
              <button type="button" className="btn-small" onClick={() => setStep(0)}>{t('Change')}</button>
            </div>
            <p className="px-4 py-3 text-[15px]">
              {builderName || t('No builder yet')} | {builderEmail || t('No email yet')}
              {siteAddress ? ` | ${siteAddress}` : ''}
            </p>
          </div>

          <div className="sheet">
            <div className="sheet-head">
              <h2 className="text-[20px] font-extrabold">{t('{count} lines', { count: lines.length })}</h2>
              <div className="flex items-center gap-3">
                <span className="num text-[16px] font-semibold">{formatAud(total)}</span>
                <button type="button" className="btn-small" onClick={() => setStep(1)}>{t('Change')}</button>
              </div>
            </div>
            {lines.length ? (
              <table className="w-full border-collapse text-left text-[15px]">
                <tbody>
                  {lines.map((line) => (
                    <tr key={line.sort_order} className="border-b border-foreground/30 last:border-b-0">
                      <td className="px-4 py-2 text-muted-foreground">{line.area}</td>
                      <td className="px-2 py-2">{line.description}</td>
                      <td className="num whitespace-nowrap px-4 py-2 text-right">{formatAud(line.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="px-4 py-6 text-[16px] text-muted-foreground">{t('No lines yet. Go back a step and add them.')}</p>
            )}
          </div>

          {error ? <p className="text-[14px] text-destructive">{error}</p> : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={saveFinal} disabled={Boolean(saving)} className="btn-yellow w-full sm:w-auto">
              <Check className="h-5 w-5" /> {saving === 'final' ? t('Saving') : t('Save the job')}
            </button>
            <button type="button" onClick={saveDraft} disabled={Boolean(saving)} className="btn-line w-full sm:w-auto">
              {saving === 'draft' ? t('Saving') : t('Save as draft, finish later')}
            </button>
          </div>
          {saved ? (
            <p className="text-[13px] text-muted-foreground">
              {saved.kind === 'final' ? t('Saved') : t('Draft saved')} {saved.at.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' })}
            </p>
          ) : null}
        </section>
      ) : null}

      {step < 2 ? (
        <div className="flex items-center justify-between gap-3 border-t-[3px] border-foreground pt-4">
          {step > 0 ? (
            <button type="button" className="btn-line" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="h-5 w-5 rtl:rotate-180" /> {t('Back')}
            </button>
          ) : (
            <span />
          )}
          <div className="flex flex-col items-end gap-2">
            {error ? <p className="text-[14px] text-destructive">{error}</p> : null}
            <button type="button" className="btn-ink" onClick={goNext}>
              {t('Next')} <ArrowRight className="h-5 w-5 rtl:rotate-180" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
