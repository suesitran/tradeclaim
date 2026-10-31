import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const FACTS = [
  ['Voice on site', 'Progress logged in seconds'],
  ['Photo evidence', 'Dated and located'],
  ['10 business days', 'The clock does the chasing'],
];

export default function Hero({ cta }) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto w-full max-w-5xl px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-16">
        <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          For Victorian painting and finishing subcontractors
        </p>

        <h1 className="mt-5 max-w-3xl font-heading text-[34px] font-semibold leading-[1.05] tracking-tight sm:text-5xl">
          The work is done. Getting paid in Victoria is the hard part.
        </h1>

        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
          TradeClaim runs the Victorian claims process end to end: a compliant payment claim served under
          the Security of Payment Act 2002 (Vic), 10 business days for the builder's payment schedule, and a
          notice of intention drafted the moment that date passes unpaid.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button asChild size="lg" className="h-11 rounded-[3px] px-6">
            <Link to={cta.to}>
              {cta.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <a
            href="#how-it-works"
            className="inline-flex h-11 items-center rounded-[3px] border border-border px-5 text-sm text-foreground transition-colors hover:bg-secondary"
          >
            See how it works
          </a>
        </div>

        <dl className="mt-12 grid gap-px overflow-hidden rounded-[3px] border border-border bg-border sm:grid-cols-3">
          {FACTS.map(([term, detail]) => (
            <div key={term} className="bg-card px-4 py-4">
              <dt className="num text-[11px] uppercase tracking-[0.12em] text-accent">{term}</dt>
              <dd className="mt-1.5 text-[13px] text-foreground">{detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}