import React from 'react';
import { useT } from '@/lib/i18n';

const STATS = [
  ['3,472', 'building firms went under in the last year. One in four of every company failure.'],
  ['76%', 'of those were small firms with fewer than 20 staff.'],
  ['72%', 'of contractors had 40% or more of their invoices paid late.'],
];

const SOURCE_NOTE =
  'ASIC Series 1, analysis by The Good Builder (FY2025-26); Equifax, year to June 2025; Murray Review survey of 526 contractors, cited in Victorian Parliament Hansard, November 2023.';

export default function IndustryStatement() {
  const t = useT();
  return (
    <section className="border-b-[3px] border-foreground bg-foreground text-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-18">
        <p className="font-heading text-[16px] font-bold uppercase tracking-[0.08em] text-accent">{t('The scale of it')}</p>

        <h2 className="mt-3 max-w-3xl text-[34px] font-extrabold leading-[1] sm:text-[48px]">
          {t('Most of the work on a site is done by subbies. Most subbies are small.')}
        </h2>

        <p className="mt-5 max-w-2xl text-[17px] leading-[1.5] text-background/85">
          {t('Late payment is the biggest complaint subbies make. The painter is the last trade in, so the marks of every other trade end up on your bill.')}
        </p>

        <dl className="mt-10 grid gap-px border-2 border-background/40 bg-background/40 sm:grid-cols-3">
          {STATS.map(([figure, label]) => (
            <div key={label} className="bg-foreground px-4 py-5">
              <dt className="font-heading text-[48px] font-extrabold leading-none text-accent">{figure}</dt>
              <dd className="mt-2 text-[15px] leading-snug text-background/85">{t(label)}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 max-w-3xl text-[11px] leading-relaxed text-background/50">
          {t('Sources')}: {SOURCE_NOTE}
        </p>
      </div>
    </section>
  );
}
