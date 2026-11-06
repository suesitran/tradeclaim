import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, Loader2, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { compressImage } from '@/lib/media';
import { useT } from '@/lib/i18n';
import VariationVoiceWalk from '@/components/variations/VariationVoiceWalk';

const FIELD = 'h-12 border-2 border-foreground text-[16px]';

export default function VariationNew() {
  const t = useT();
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [instructedBy, setInstructedBy] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    base44.entities.Job.get(jobId).then(setJob).catch(() => setJob(null));
  }, [jobId]);

  const handleFile = (event) => {
    const picked = event.target.files && event.target.files[0];
    if (!picked) return;
    if (preview) URL.revokeObjectURL(preview);
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  };

  const applySpokenField = (key, value) => {
    if (key === 'instructed_by') setInstructedBy(value);
    if (key === 'description') setDescription(value);
    if (key === 'estimated_amount') setAmount(value);
  };

  const handleSend = async () => {
    if (!description.trim() || !instructedBy.trim()) {
      setError(t('Say who asked for it and what the work is.'));
      return;
    }
    setStatus('working');
    setError('');
    try {
      let photoUri = '';
      if (file) {
        const compressed = await compressImage(file);
        const uploaded = await base44.integrations.Core.UploadPrivateFile({ file: compressed });
        photoUri = uploaded.file_uri;
      }
      const variation = await base44.entities.Variation.create({
        job_id: jobId,
        instructed_by: instructedBy.trim(),
        description: description.trim(),
        estimated_amount: Number(amount || 0),
        photo_uri: photoUri,
        status: 'sent',
        sent_at: new Date().toISOString(),
      });
      const response = await base44.functions.invoke('sendVariationNotice', { variation_id: variation.id, email: true });
      setResult(response.data || {});
      setStatus('done');
    } catch (err) {
      setError(err.message || t('The notice could not be sent'));
      setStatus('idle');
    }
  };

  if (status === 'done') {
    return (
      <div className="mx-auto max-w-lg space-y-5 py-6">
        <div className="sheet px-5 py-6">
          <p className="eyebrow">{t('Extra work')}</p>
          <h1 className="mt-1 text-[32px] font-extrabold leading-none">{t('Written down and sent')}</h1>
          <p className="mt-3 text-[16px]">
            {result.email_sent
              ? t('The notice went to {builder} by email, photo attached.', { builder: job ? job.builder_name : t('the builder') })
              : t('The notice PDF is saved. The email did not go: {reason}', { reason: result.email_error || t('no builder email') })}
          </p>
          <p className="legal mt-1">{t('Variation notice')}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {result.signed_url ? (
              <button type="button" className="btn-line" onClick={() => window.open(result.signed_url, '_blank', 'noopener')}>
                {t('Open the notice')}
              </button>
            ) : null}
            <button type="button" className="btn-ink" onClick={() => navigate(`/jobs/${jobId}`)}>
              {t('Back to the job')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <Link to={`/jobs/${jobId}`} className="inline-flex items-center gap-1.5 font-heading text-[16px] font-bold uppercase tracking-[0.02em] hover:underline">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {job ? job.name : t('Job')}
      </Link>

      <div className="border-b-[3px] border-foreground pb-4">
        <p className="eyebrow">{t('Not in the quote')}</p>
        <h1 className="mt-1 text-[40px] font-extrabold leading-none">{t('Extra work')}</h1>
        <p className="mt-2 text-[16px] text-muted-foreground">
          {t('Write it down before you do it. A dated note is the difference between paid extra work and free extra work.')}
        </p>
      </div>

      <div className="sheet space-y-4 p-5">
        <VariationVoiceWalk onField={applySpokenField} />

        <div className="space-y-1.5">
          <Label htmlFor="instructedBy" className="text-[15px]">{t('Who asked for it')}</Label>
          <Input id="instructedBy" value={instructedBy} onChange={(event) => setInstructedBy(event.target.value)} placeholder={t('Site manager, name')} className={FIELD} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-[15px]">{t('What the work is')}</Label>
          <Textarea
            id="description"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t('Fire stair, walls and ceilings, two coats low sheen')}
            className="border-2 border-foreground text-[16px]"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="amount" className="text-[15px]">{t('Rough price, ex GST')}</Label>
          <Input id="amount" type="number" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="1800" className={`${FIELD} num`} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[15px]">{t('Photo of the area')}</Label>
          <label className="flex cursor-pointer items-center gap-3 border-2 border-dashed border-foreground bg-secondary px-4 py-3">
            {preview ? <img src={preview} alt={t('Photo')} className="h-14 w-14 object-cover" /> : <Camera className="h-5 w-5" />}
            <span className="text-[15px]">{preview ? t('Change the photo') : t('Take or choose a photo')}</span>
            <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="sr-only" />
          </label>
        </div>

        {error ? <p className="text-[14px] text-destructive">{error}</p> : null}

        <button type="button" onClick={handleSend} disabled={status === 'working'} className="btn-yellow w-full">
          {status === 'working' ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> {t('Sending')}
            </>
          ) : (
            <>
              <Send className="h-5 w-5" /> {t('Send it to the builder')}
            </>
          )}
        </button>
        <p className="legal text-center">{t('Sends a variation notice by email, with the photo.')}</p>
      </div>
    </div>
  );
}
