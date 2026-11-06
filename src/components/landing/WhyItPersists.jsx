import React from 'react';
import { useT } from '@/lib/i18n';

const REASONS = [
  { title: 'The paperwork is a full-time job', body: 'Every document has set wording and a set date, counted in business days.' },
  { title: 'There is no proof when they hold the money', body: 'Four hundred unlabelled photos on your phone prove nothing.' },
  { title: 'Escalating feels like starting a war', body: 'Big subbies do it as routine admin. You can too.' },
];

export default function WhyItPersists() {
  const t = useT();
  return (
    <section className="border-b-[3px] border-foreground bg-secondary">
      <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-18">
        <div className="grid gap-8 sm:grid-cols-[minmax(0,18rem)_1fr] sm:gap-12">
          <div>
            <p className="eyebrow">{t('Why it keeps happening')}</p>
            <h2 className="mt-2 text-[34px] font-extrabold leading-[1] sm:text-[44px]">
              {t('The law is on your side. Almost nobody uses it.')}
            </h2>
          </div>

          <div>
            <p className="text-[17px] leading-[1.5]">
              {t('The Security of Payment Act gives you a fast, cheap way to get paid. Send a proper claim, the builder must reply in 10 business days, and a dispute goes to an adjudicator in weeks, not a court in years.')}
            </p>

            <ol className="mt-6 border-t-2 border-foreground">
              {REASONS.map((reason, index) => (
                <li key={reason.title} className="flex gap-4 border-b-2 border-foreground py-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-foreground font-heading text-[20px] font-extrabold text-accent">{index + 1}</span>
                  <div>
                    <p className="font-heading text-[22px] font-bold uppercase leading-none">{t(reason.title)}</p>
                    <p className="mt-1.5 text-[16px] leading-snug text-muted-foreground">{t(reason.body)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
