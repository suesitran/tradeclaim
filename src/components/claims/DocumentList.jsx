import { FileText, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import useSignedUrls from '@/hooks/useSignedUrls';
import { formatDate } from '@/lib/format';

const DOC_LABELS = {
  payment_claim: 'Payment claim',
  variation_notice: 'Variation notice',
  notice_of_intention: 'Notice of intention',
  adjudication_preview: 'Adjudication preview',
};

const ROW = 'flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition-colors hover:bg-secondary/60';

export default function DocumentList({ documents = [] }) {
  const { toast } = useToast();
  const urls = useSignedUrls(documents.map((document) => document.file_uri));

  const openInSameTab = async (fileUri) => {
    try {
      const result = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri, expires_in: 600 });
      if (result && result.signed_url) window.location.href = result.signed_url;
    } catch (error) {
      toast({ title: 'The PDF could not be opened', description: error.message, variant: 'destructive' });
    }
  };

  const body = (document, url) => (
    <>
      <div>
        <p className="text-[12px]">{DOC_LABELS[document.type] || document.type}</p>
        <p className="text-[10px] text-muted-foreground">
          {formatDate(String(document.generated_at || '').slice(0, 10))}
          {document.emailed_to ? '  |  Emailed' : ''}
        </p>
      </div>
      {url ? <FileText className="h-4 w-4 shrink-0 text-muted-foreground" /> : <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
    </>
  );

  if (!documents.length) {
    return <p className="px-5 py-5 text-[12px] text-muted-foreground">No documents generated yet.</p>;
  }

  return (
    <div className="divide-y divide-border">
      {documents.map((document) =>
        urls[document.file_uri] ? (
          <a key={document.id} href={urls[document.file_uri]} target="_blank" rel="noreferrer" className={ROW}>
            {body(document, true)}
          </a>
        ) : (
          <button key={document.id} type="button" onClick={() => openInSameTab(document.file_uri)} className={ROW}>
            {body(document, false)}
          </button>
        ),
      )}
    </div>
  );
}