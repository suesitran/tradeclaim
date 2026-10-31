import React from 'react';
import { formatAud } from '@/lib/format';

const ROWS = [
  ['Work claimed this claim', 'exGst'],
  ['GST', 'gst'],
  ['Total incl GST', 'incGst'],
];

export default function DemoClaimCard({ exGst, gst, incGst }) {
  const values = { exGst, gst, incGst };

  return (
    <div className="rounded-[3px] border border-border bg-card p-4">
      <p className="num text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Payment claim 1</p>
      <dl className="mt-3 space-y-2">
        {ROWS.map(([label, key]) => (
          <div key={key} className="flex items-baseline justify-between gap-3">
            <dt className={`text-[13px] ${key === 'incGst' ? 'font-medium' : 'text-muted-foreground'}`}>{label}</dt>
            <dd className={`num text-[13px] ${key === 'incGst' ? 'font-medium' : ''}`}>{formatAud(values[key])}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 border-t border-border pt-3 text-[11px] leading-relaxed text-muted-foreground">
        Served against the quoted scope lines. 5 per cent retention stays on the job as the contract records it.
      </p>
    </div>
  );
}