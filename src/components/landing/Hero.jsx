import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import DemoButton from '@/components/landing/DemoButton';

const FACTS = [
  ['Photos', 'Dated and located, on each quoted line'],
  ['One tap', 'A claim the builder has to answer'],
  ['10 business days', 'The clock does the chasing'],
];

export default function Hero({ cta }) {
  return (
    <section className="border-b-[3px] border-foreground bg-foreground px-4 pb-14 pt-12 text-background sm:px-6 sm:pb-20 sm:pt-20">
      <div className="mx-auto w-full max-w-5xl">
        <p className="font-heading text-[16px] font-bold uppercase tracking-[0.08em] text-accent">For Victorian painters and finishing trades</p>

        <h1 className="mt-4 max-w-3xl text-[52px] font-extrabold leading-[0.95] sm:text-[88px]">
          The work's done.
          <br />
          Now get paid.
        </h1>

        <p className="mt-6 max-w-2xl text-[18px] leading-[1.45] text-background/85 sm:text-[20px]">
          Photograph the work. Send a claim the builder can't ignore. If they go quiet or pay less, the next bit of paperwork is already written.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {cta.demo ? (
            <DemoButton className="btn-yellow min-h-[56px] text-[20px]" label={cta.label} />
          ) : (
            <Link to={cta.to} className="btn-yellow min-h-[56px] text-[20px]">
              {cta.label}
              <ArrowRight className="h-5 w-5" />
            </Link>
          )}
          <a href="#how-it-works" className="btn-line min-h-[56px] border-background text-[20px] text-background hover:bg-background hover:text-foreground">
            How it works
          </a>
        </div>

        <dl className="mt-12 grid grid-cols-1 gap-px border-t-2 border-background/40 sm:grid-cols-3">
          {FACTS.map(([term, detail]) => (
            <div key={term} className="pr-4 pt-4">
              <dt className="font-heading text-[28px] font-extrabold uppercase leading-none text-accent">{term}</dt>
              <dd className="mt-1.5 text-[16px] leading-snug text-background/85">{detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
