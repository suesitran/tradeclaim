import React from 'react';
import { Link } from 'react-router-dom';
import { useT } from '@/lib/i18n';

const TERMS = [
  { term: 'A$0 to start', detail: 'Quotes, photos, claims and notices cost nothing.' },
  { term: '3% of the extra', detail: 'Only when escalating gets you more than the builder offered. 3% of that extra, nothing else.' },
  { term: 'Capped at A$300', detail: 'The fee never goes above A$300 on a claim.' },
];

export default function Pricing({ cta }) {
  const t = useT();
  return (
    <section className="border-b-[3px] border-foreground">
      <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-18">
        <p className="eyebrow">{t('What it costs')}</p>
        <h2 className="mt-2 max-w-3xl text-[34px] font-extrabold leading-[1] sm:text-[48px]">
          {t('Nothing, unless escalating wins you more')}
        </h2>

        <dl className="mt-8 grid gap-px border-2 border-foreground bg-foreground sm:grid-cols-3">
          {TERMS.map((item) => (
            <div key={item.term} className="bg-card px-4 py-5">
              <dt className="font-heading text-[30px] font-extrabold uppercase leading-none">{t(item.term)}</dt>
              <dd className="mt-2 text-[16px] leading-snug text-muted-foreground">{t(item.detail)}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 grid gap-4 border-l-[6px] border-accent bg-secondary px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="font-heading text-[20px] font-bold uppercase leading-none">{t('Example')}</p>
            <p className="mt-2 text-[16px] leading-snug">
              {t('The builder offers A$20,000. After escalating, A$24,000 lands. The extra is A$4,000, so the fee is A$120. If nothing extra came in, the fee is nothing.')}
            </p>
          </div>
          <Link to={cta.to} className="btn-ink justify-self-start sm:justify-self-end">
            {t(cta.label)}
          </Link>
        </div>

        <p className="mt-4 text-[13px] leading-snug text-muted-foreground">
          {t('The fee is shown on the claim before anything is recorded as paid, and invoiced separately. No subscription.')}
        </p>
      </div>
    </section>
  );
}
