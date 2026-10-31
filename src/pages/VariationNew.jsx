import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, Loader2, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { compressImage } from '@/lib/media';

export default function VariationNew() {
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

  const handleSend = async () => {
    if (!description.trim() || !instructedBy.trim()) {
      setError('Record who instructed it and what the work is.');
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
      setError(err.message || 'The variation could not be sent');
      setStatus('idle');
    }
  };

  if (status === 'done') {
    return (
      <div className="mx-auto max-w-lg space-y-5 py-6">
        <div className="rounded-[4px] border border-border bg-card px-5 py-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Variation notice</p>
          <h1 className="mt-1 font-heading text-2xl font-semibold">Recorded and drafted</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {result.email_sent
              ? `The notice has been emailed to ${job ? job.builder_name : 'the builder'} with the photo attached.`
              : `The notice PDF is saved. The email did not go out: ${result.email_error || 'no builder address'}.`}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {result.signed_url ? (
              <Button variant="outline" onClick={() => window.open(result.signed_url, '_blank', 'noopener')}>
                Open the notice
              </Button>
            ) : null}
            <Button className="bg-primary" onClick={() => navigate(`/jobs/${jobId}`)}>
              Back to the job
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <Link to={`/jobs/${jobId}`} className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> {job ? job.name : 'Job'}
      </Link>

      <div>
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Outside the quoted scope</p>
        <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight">Record a variation</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          A dated notice sent before the work is done is the difference between a paid variation and a free one.
        </p>
      </div>

      <div className="space-y-4 rounded-[4px] border border-border bg-card p-5">
        <div className="space-y-1.5">
          <Label htmlFor="instructedBy">Who instructed it</Label>
          <Input id="instructedBy" value={instructedBy} onChange={(event) => setInstructedBy(event.target.value)} placeholder="Site manager, name" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">What the work is</Label>
          <Textarea
            id="description"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Fire stair, walls and ceilings, two coats low sheen"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="amount">Estimated amount, ex GST</Label>
          <Input id="amount" type="number" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="1800" className="num" />
        </div>

        <div className="space-y-1.5">
          <Label>Photo of the area</Label>
          <label className="flex cursor-pointer items-center gap-3 rounded-[4px] border border-dashed border-[#C9C2B4] bg-secondary px-4 py-3">
            {preview ? <img src={preview} alt="Variation area" className="h-14 w-14 rounded-[3px] object-cover" /> : <Camera className="h-5 w-5 text-muted-foreground" />}
            <span className="text-[12px] text-muted-foreground">{preview ? 'Replace the photo' : 'Take or choose a photo'}</span>
            <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="sr-only" />
          </label>
        </div>

        {error ? <p className="text-[12px] text-destructive">{error}</p> : null}

        <Button onClick={handleSend} disabled={status === 'working'} className="w-full bg-accent text-accent-foreground">
          {status === 'working' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending the notice
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" /> Send the variation notice
            </>
          )}
        </Button>
      </div>
    </div>
  );
}