import React from 'react';
import { formatYmd } from '@/lib/clock';

export default function DemoClockCard({ servedAt, dueAt, daysLeft }) {
  return (
    <div className="rounded-[3px] border border-border bg-card p-4">
      <p className="num text-[10px] uppercase tracking-[0.14em] text-muted-foreground">The statutory clock</p>
      <dl className="mt-3 space-y-2">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-[13px] text-muted-foreground">Claim served</dt>
          <dd className="num text-[13px]">{formatYmd(servedAt)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-[13px] text-muted-foreground">Payment schedule due</dt>
          <dd className="num text-[13px] font-medium">{formatYmd(dueAt)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-[13px] text-muted-foreground">Business days left</dt>
          <dd className="num text-[13px] text-accent">{Math.max(daysLeft, 0)}</dd>
        </div>
      </dl>
      <p className="mt-3 border-t border-border pt-3 text-[11px] leading-relaxed text-muted-foreground">
        Ten business days under the Security of Payment Act 2002 (Vic), counting weekends and the Christmas shutdown
        out. Public holidays are added to the count on your own jobs.
      </p>
    </div>
  );
}