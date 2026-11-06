import React from 'react';
import { formatAud } from '@/lib/format';
import { useT } from '@/lib/i18n';

const ROWS = [
  ['Work done this claim', 'exGst'],
  ['GST', 'gst'],
  ['Total inc GST', 'incGst'],
];

export default function DemoClaimCard({ exGst, gst, incGst }) {
  const t = useT();
  const values = { exGst, gst, incGst };

  return (
    <div className="sheet p-4">
      <p className="eyebrow">{t('Claim 1')}</p>
      <dl className="mt-3 space-y-2">
        {ROWS.map(([label, key]) => (
          <div key={key} className="flex items-baseline justify-between gap-3">
            <dt className={`text-[15px] ${key === 'incGst' ? 'font-semibold' : 'text-muted-foreground'}`}>{t(label)}</dt>
            <dd className={`num text-[15px] ${key === 'incGst' ? 'font-semibold' : ''}`}>{formatAud(values[key])}</dd>
          </div>
        ))}
      </dl>
      <p className="legal mt-3 border-t-2 border-foreground pt-3">{t('5% retention stays with the builder until the defects period ends.')}</p>
    </div>
  );
}
