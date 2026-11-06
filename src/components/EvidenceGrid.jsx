import useSignedUrls from '@/hooks/useSignedUrls';
import { formatDateTime, formatLocation, STAGE_LABELS, STAGE_TONES } from '@/lib/format';

export default function EvidenceGrid({ evidence = [], emptyLabel = 'No photos yet.' }) {
  const urls = useSignedUrls(evidence.map((item) => item.photo_uri));

  if (!evidence.length) {
    return <p className="border-l-[6px] border-accent bg-secondary px-4 py-4 text-[16px] leading-snug text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {evidence.map((item) => (
        <figure key={item.id} className="sheet overflow-hidden">
          <div className="aspect-[4/3] w-full bg-secondary">
            {urls[item.photo_uri] ? (
              <img src={urls[item.photo_uri]} alt={`${STAGE_LABELS[item.stage] || item.stage} photo`} loading="lazy" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[13px] uppercase tracking-[0.06em] text-muted-foreground">Loading photo</div>
            )}
          </div>
          <figcaption className="space-y-1 border-t-2 border-foreground px-3 py-2.5">
            <span className={`tag ${STAGE_TONES[item.stage] || STAGE_TONES.before}`}>{STAGE_LABELS[item.stage] || item.stage}</span>
            <p className="text-[13px] leading-snug">{formatDateTime(item.captured_at)}</p>
            <p className="text-[12px] leading-snug text-muted-foreground">{formatLocation(item)}</p>
            {item.note ? <p className="text-[13px] leading-snug">{item.note}</p> : null}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
