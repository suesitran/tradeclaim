import { STATUS_META } from '@/lib/claims';
import { useT } from '@/lib/i18n';

// The plain label as a stamped tag. With legal set, the Act's term sits under it.
export default function StatusPill({ status, legal = false, className = '' }) {
  const t = useT();
  const meta = STATUS_META[status] || STATUS_META.draft;
  if (!legal) {
    return <span className={`tag ${meta.tone} ${className}`}>{t(meta.label)}</span>;
  }
  return (
    <span className={`inline-flex flex-col items-start gap-1 ${className}`}>
      <span className={`tag ${meta.tone}`}>{t(meta.label)}</span>
      <span className="legal">{t(meta.legal)}</span>
    </span>
  );
}
