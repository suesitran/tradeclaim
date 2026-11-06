import React from 'react';
import { Link } from 'react-router-dom';
import { useT } from '@/lib/i18n';

const CLOCK = [
  ['10 business days', 'for the builder to reply after you send a claim.'],
  ['10 business days', 'to escalate if they pay less or do not reply.'],
  ['One Act, one clock', 'Every job is counted the same way under the Victorian Act.'],
];

export default function ClockBand({ cta }) {
  const t = useT();
  return (
    <section className="border-b-[3px] border-foreground bg-foreground text-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-18">
        <p className="font-heading text-[16px] font-bold uppercase tracking-[0.08em] text-accent">{t('The clock')}</p>
        <h2 className="mt-2 max-w-3xl text-[34px] font-extrabold leading-[1] sm:text-[48px]">
          {t('Every deadline is counted for you')}
        </h2>
        <p className="mt-4 max-w-2xl text-[17px] leading-[1.5] text-background/85">
          {t('Weekends, Victorian public holidays and the Christmas shutdown are skipped, so the date you see is the date that counts.')}
        </p>

        <dl className="mt-9 grid gap-6 border-t-2 border-background/40 pt-8 sm:grid-cols-3">
          {CLOCK.map(([term, detail]) => (
            <div key={detail}>
              <dt className="font-heading text-[28px] font-extrabold uppercase leading-none text-accent">{t(term)}</dt>
              <dd className="mt-2 text-[16px] leading-snug text-background/85">{t(detail)}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link to={cta.to} className="btn-yellow min-h-[56px] text-[20px]">
            {t(cta.label)}
          </Link>
          <p className="text-[15px] text-background/70">{t('Start with the quote you already sent.')}</p>
        </div>
      </div>
    </section>
  );
}
