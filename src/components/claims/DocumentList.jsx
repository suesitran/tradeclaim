import { FileText, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import useSignedUrls from '@/hooks/useSignedUrls';
import { formatDate } from '@/lib/format';
import { useT } from '@/lib/i18n';

const DOC_LABELS = {
  payment_claim: 'Payment claim',
  variation_notice: 'Extra work notice',
  notice_of_intention: 'Notice to the builder',
  adjudication_preview: 'Escalation paper',
};

const DOC_LEGAL = {
  payment_claim: 'Payment claim under the Act',
  variation_notice: 'Variation notice',
  notice_of_intention: 'Notice of intention to apply for adjudication',
  adjudication_preview: 'Adjudication preview, cover sheet and evidence index',
};

const ROW = 'flex w-full items-center justify-between gap-3 border-b border-foreground/30 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-secondary';

export default function DocumentList({ documents = [] }) {
  const t = useT();
  const { toast } = useToast();
  const urls = useSignedUrls(documents.map((document) => document.file_uri));

  const openInSameTab = async (fileUri) => {
    try {
      const result = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri, expires_in: 600 });
      if (result && result.signed_url) window.location.href = result.signed_url;
    } catch (error) {
      toast({ title: t('The PDF could not be opened'), description: error.message, variant: 'destructive' });
    }
  };

  const body = (document, ready) => (
    <>
      <div>
        <p className="text-[16px] font-semibold">{t(DOC_LABELS[document.type] || document.type)}</p>
        <p className="legal">{t(DOC_LEGAL[document.type] || '')}</p>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          {formatDate(String(document.generated_at || '').slice(0, 10))}
          {document.emailed_to ? ` | ${t('Emailed to the builder')}` : ` | ${t('Not sent yet')}`}
        </p>
      </div>
      {ready ? <FileText className="h-5 w-5 shrink-0" /> : <Loader2 className="h-5 w-5 shrink-0 animate-spin text-muted-foreground" />}
    </>
  );

  if (!documents.length) {
    return <p className="px-4 py-5 text-[15px] text-muted-foreground">{t('No paperwork yet.')}</p>;
  }

  return (
    <div>
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
