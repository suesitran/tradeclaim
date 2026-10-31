import useSignedUrls from '@/hooks/useSignedUrls';
import { formatDateTime, formatLocation, STAGE_LABELS, STAGE_TONES } from '@/lib/format';

export default function EvidenceGrid({ evidence = [], emptyLabel = 'No photos recorded yet.', variant = 'default' }) {
  const urls = useSignedUrls(evidence.map((item) => item.photo_uri));
  const bone = variant === 'bone';

  if (!evidence.length) {
    return (
      <p
        className={
          bone
            ? 'rounded-r-[4px] border-l-[3px] border-[#9A5B2A] bg-[#F1EBDE] px-5 py-[18px] text-[14px] leading-[1.55] text-[#6b6457]'
            : 'text-sm text-muted-foreground'
        }
      >
        {emptyLabel}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {evidence.map((item) => (
        <figure
          key={item.id}
          className={
            bone
              ? 'overflow-hidden rounded-[6px] border border-[#DED6C7] bg-white shadow-[0_8px_22px_-16px_rgba(60,40,15,0.4)]'
              : 'overflow-hidden rounded-[4px] border border-border bg-card'
          }
        >
          <div className={bone ? 'aspect-[4/3] w-full bg-[#EDE7DA]' : 'aspect-[4/3] w-full bg-secondary'}>
            {urls[item.photo_uri] ? (
              <img
                src={urls[item.photo_uri]}
                alt={`${STAGE_LABELS[item.stage] || item.stage} photo`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className={`flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.12em] ${
                  bone ? 'text-[#6b6457]' : 'text-muted-foreground'
                }`}
              >
                Loading photo
              </div>
            )}
          </div>
          <figcaption className={bone ? 'space-y-1 px-3 py-2.5' : 'space-y-1 px-2.5 py-2'}>
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${STAGE_TONES[item.stage] || STAGE_TONES.before}`}>
              {STAGE_LABELS[item.stage] || item.stage}
            </span>
            <p className="text-[11px] leading-snug text-foreground">{formatDateTime(item.captured_at)}</p>
            <p className="text-[10px] leading-snug text-muted-foreground">{formatLocation(item)}</p>
            {item.received_at ? (
              <p className="text-[10px] leading-snug text-muted-foreground">Received by server {formatDateTime(item.received_at)}</p>
            ) : null}
            {item.note ? <p className="text-[11px] leading-snug text-muted-foreground">{item.note}</p> : null}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}