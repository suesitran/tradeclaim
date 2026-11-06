import { STATUS_META } from '@/lib/claims';

// The plain label as a stamped tag. With legal set, the Act's term sits under it.
export default function StatusPill({ status, legal = false, className = '' }) {
  const meta = STATUS_META[status] || STATUS_META.draft;
  if (!legal) {
    return <span className={`tag ${meta.tone} ${className}`}>{meta.label}</span>;
  }
  return (
    <span className={`inline-flex flex-col items-start gap-1 ${className}`}>
      <span className={`tag ${meta.tone}`}>{meta.label}</span>
      <span className="legal">{meta.legal}</span>
    </span>
  );
}
