import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CLOCK = [
  ['10 business days', 'Builder must give a payment schedule after the claim is served.'],
  ['10 business days', 'To apply for adjudication if the schedule is short or never arrives.'],
  ['2 business days', 'Extra time a notice of intention gives the builder to respond.'],
];

export default function ClockBand({ cta }) {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-18">
        <p className="num text-[11px] uppercase tracking-[0.18em] text-primary-foreground/60">The statutory clock</p>
        <h2 className="mt-3 max-w-2xl font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Every deadline is counted for you, in business days
        </h2>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-primary-foreground/70">
          Weekends and public holidays are excluded automatically, so the date you see is the date
          that counts.
        </p>

        <dl className="mt-9 grid gap-6 border-t border-primary-foreground/15 pt-8 sm:grid-cols-3">
          {CLOCK.map(([term, detail]) => (
            <div key={detail}>
              <dt className="num text-[19px] font-medium tracking-tight text-accent">{term}</dt>
              <dd className="mt-2 text-[12.5px] leading-relaxed text-primary-foreground/70">{detail}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Button asChild size="lg" className="h-11 rounded-[3px] bg-accent px-6 text-accent-foreground hover:bg-accent/90">
            <Link to={cta.to}>{cta.label}</Link>
          </Button>
          <p className="text-[12px] text-primary-foreground/60">Start with the quote you have already sent.</p>
        </div>
      </div>
    </section>
  );
}