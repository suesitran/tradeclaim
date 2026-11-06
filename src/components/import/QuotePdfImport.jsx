import { useRef, useState } from 'react';
import { FileSearch, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useT } from '@/lib/i18n';

export default function QuotePdfImport({ onExtracted }) {
  const t = useT();
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
      if (!data.lines || !data.lines.length) throw new Error(t('No lines could be read from that file'));
      onExtracted(data);
      setMessage(t('{count} lines read from {file}. Check them against the quote before saving.', { count: data.lines.length, file: file.name }));
    } catch (err) {
      setError(err.message || t('That quote could not be read'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sheet space-y-2 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[20px] font-extrabold">{t('Upload the quote')}</p>
          <p className="mt-1 text-[15px] leading-snug text-muted-foreground">
            {t('A PDF or a photo. Every line on it is read in for you.')}
          </p>
        </div>
        <button type="button" className="btn-ink" onClick={() => inputRef.current && inputRef.current.click()} disabled={busy}>
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileSearch className="h-5 w-5" />}
          {busy ? t('Reading the quote') : t('Choose the file')}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>
      {message ? <p className="text-[15px]">{message}</p> : null}
      {error ? <p className="text-[14px] text-destructive">{error}</p> : null}
    </div>
  );
}