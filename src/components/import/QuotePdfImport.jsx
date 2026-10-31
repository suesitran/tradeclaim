import { useRef, useState } from 'react';
import { FileSearch, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function QuotePdfImport({ onExtracted }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFile = async (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file) return;

    setBusy(true);
    setError('');
    setMessage('');
    try {
      const uploaded = await base44.integrations.Core.UploadPrivateFile({ file });
      const signed = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uploaded.file_uri, expires_in: 900 });
      const response = await base44.functions.invoke('extractQuotePdf', { file_url: signed.signed_url });
      const data = response.data || {};
      if (data.error) throw new Error(data.error);
      if (!data.lines || !data.lines.length) throw new Error('No quoted items could be read from that document');
      onExtracted(data);
      setMessage(`${data.lines.length} scope lines read from ${file.name}. Check them against the quote before saving.`);
    } catch (err) {
      setError(err.message || 'That quote could not be read');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2 rounded-[4px] border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Or read the quote itself</p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            Upload the quote as a PDF or a photo and every wording is read into the scope lines below.
          </p>
        </div>
        <Button variant="outline" onClick={() => inputRef.current && inputRef.current.click()} disabled={busy}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSearch className="mr-2 h-4 w-4" />}
          {busy ? 'Reading the quote' : 'Upload quote'}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>
      {message ? <p className="text-[12px] text-muted-foreground">{message}</p> : null}
      {error ? <p className="text-[12px] text-destructive">{error}</p> : null}
    </div>
  );
}