import React from 'react';
import { formatAud } from '@/lib/format';
import { useT } from '@/lib/i18n';

const TH = 'border-b-2 border-foreground px-3 py-2 font-heading text-[14px] font-bold uppercase tracking-[0.06em] text-muted-foreground';

export default function DemoQuoteTable({ lines, total }) {
  const t = useT();
  return (
    <div className="sheet overflow-x-auto">
      <table className="w-full min-w-[520px] text-left text-[15px]">
        <thead>
          <tr>
            <th className={TH}>{t('Area')}</th>
            <th className={TH}>{t('Line')}</th>
            <th className={`${TH} text-right`}>{t('Qty')}</th>
            <th className={`${TH} text-right`}>{t('Amount')}</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.description} className="border-b border-foreground/30 last:border-0">
              <td className="px-3 py-2.5 text-muted-foreground">{line.area}</td>
              <td className="px-3 py-2.5">{line.description}</td>
              <td className="num px-3 py-2.5 text-right text-muted-foreground">
                {line.quantity} {line.unit}
              </td>
              <td className="num px-3 py-2.5 text-right">{formatAud(line.amount)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-foreground bg-secondary">
            <td className="px-3 py-2.5 font-semibold" colSpan={3}>
              {t('Quote, ex GST')}
            </td>
            <td className="num px-3 py-2.5 text-right font-semibold">{formatAud(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
