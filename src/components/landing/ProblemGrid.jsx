import React from 'react';
import { CalendarX, Camera, Hourglass, PhoneOff } from 'lucide-react';
import { useT } from '@/lib/i18n';

const PROBLEMS = [
  { icon: CalendarX, title: 'Claims go out late', body: 'The clock only starts when the claim is sent properly. Every week spent on a spreadsheet is a week lost.' },
  { icon: Camera, title: 'Progress lives in your head', body: "Your foreman knows what got done. Without dated photos, the builder's word wins." },
  { icon: PhoneOff, title: 'Extra work disappears', body: 'Asked for on the phone, never written down, never paid.' },
  { icon: Hourglass, title: 'The clock runs out', body: 'Miss the date to escalate and a clear debt becomes a court fight, on your money.' },
];

export default function ProblemGrid() {
  const t = useT();
  return (
    <section className="border-b-[3px] border-foreground">
      <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-18">
        <p className="eyebrow">{t('The problem')}</p>
        <h2 className="mt-2 max-w-3xl text-[34px] font-extrabold leading-[1] sm:text-[48px]">
          {t('Painters lose money to paperwork, not to the work')}
        </h2>

        <div className="mt-8 grid gap-px border-2 border-foreground bg-foreground sm:grid-cols-2">
          {PROBLEMS.map(({ icon: Icon, title, body }, index) => (
            <article key={title} className="bg-card p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-accent">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="num text-[14px] text-muted-foreground">0{index + 1}</span>
              </div>
              <h3 className="mt-3 text-[24px] font-extrabold leading-none">{t(title)}</h3>
              <p className="mt-2 text-[16px] leading-snug text-muted-foreground">{t(body)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
