import React from 'react';
import { formatYmd } from '@/lib/clock';
import { useT } from '@/lib/i18n';

export default function DemoClockCard({ servedAt, dueAt, daysLeft }) {
  const t = useT();
  return (
    <div className="sheet p-4">
      <p className="eyebrow">{t('The clock')}</p>
      <dl className="mt-3 space-y-2">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-[15px] text-muted-foreground">{t('Claim sent')}</dt>
          <dd className="num text-[15px]">{formatYmd(servedAt)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-[15px] text-muted-foreground">{t('Builder must reply by')}</dt>
          <dd className="num text-[15px] font-semibold">{formatYmd(dueAt)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 bg-accent px-2 py-1">
          <dt className="text-[15px] font-semibold">{t('Business days left')}</dt>
          <dd className="num text-[15px] font-semibold">{Math.max(daysLeft, 0)}</dd>
        </div>
      </dl>
      <p className="legal mt-3 border-t-2 border-foreground pt-3">
        {t('10 business days under the Security of Payment Act 2002 (Vic). Weekends and the Christmas shutdown are skipped.')}
      </p>
    </div>
  );
}
