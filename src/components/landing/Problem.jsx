import React from 'react';
import { Link } from 'react-router-dom';
import { useT } from '@/lib/i18n';

const REASONS = [
  { title: 'Claims go out late', body: 'The clock only starts when the claim is sent properly. Every week spent on a spreadsheet is a week lost.' },
  { title: 'Progress lives in your head', body: "Your foreman knows what got done. Without dated photos, the builder's word wins." },
  { title: 'Extra work disappears', body: 'Asked for on the phone, never written down, never paid.' },
  { title: 'Escalating feels like starting a war', body: 'Big subbies do it as routine admin. You can too.' },
];

const LATE_PAID_SOURCE = 'Murray Review survey of 526 contractors, cited in Victorian Parliament Hansard, November 2023.';

export default function Problem({ cta }) {
  const t = useT();
  return (
    <section className="border-b-[3px] border-foreground bg-foreground text-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-18">
        <div className="grid gap-8 sm:grid-cols-[minmax(0,18rem)_1fr] sm:gap-12">
          <div>
            <p className="font-heading text-[16px] font-bold uppercase tracking-[0.08em] text-accent">{t('Why it keeps happening')}</p>
            <h2 className="mt-2 text-[34px] font-extrabold leading-[1] sm:text-[44px]">
              {t('The law is on your side. Almost nobody uses it.')}
            </h2>

            <p className="mt-8 font-heading text-[48px] font-extrabold leading-none text-accent">72%</p>
            <p className="mt-2 text-[15px] leading-snug text-background/85">
              {t('of contractors had 40% or more of their invoices paid late.')}
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-background/50">
              {t('Source')}: {LATE_PAID_SOURCE}
            </p>
          </div>

          <div>
            <p className="text-[17px] leading-[1.5] text-background/85">
              {t('The Security of Payment Act gives you a fast, cheap way to get paid. Send a proper claim, the builder must reply in 10 business days, and a dispute goes to an adjudicator in weeks, not a court in years.')}
            </p>

            <ol className="mt-6 border-t-2 border-background/40">
              {REASONS.map((reason, index) => (
                <li key={reason.title} className="flex gap-4 border-b-2 border-background/40 py-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-accent font-heading text-[20px] font-extrabold text-foreground">{index + 1}</span>
                  <div>
                    <p className="font-heading text-[22px] font-bold uppercase leading-none">{t(reason.title)}</p>
                    <p className="mt-1.5 text-[16px] leading-snug text-background/85">{t(reason.body)}</p>
                  </div>
                </li>
              ))}
            </ol>

            <p className="mt-6 text-[16px] leading-snug text-background/85">
              <span className="font-bold text-background">{t('Every deadline is counted for you')}.</span>{' '}
              {t('Weekends, Victorian public holidays and the Christmas shutdown are skipped, so the date you see is the date that counts.')}
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4 border-t-2 border-background/40 pt-8">
          <Link to={cta.to} className="btn-yellow min-h-[56px] text-[20px]">
            {t(cta.label)}
          </Link>
          <p className="text-[15px] text-background/70">{t('Start with the quote you already sent.')}</p>
        </div>
      </div>
    </section>
  );
}
