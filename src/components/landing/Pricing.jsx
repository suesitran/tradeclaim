import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const TERMS = [
  {
    term: 'A$0 to start',
    detail: 'Importing quotes, photographing progress, preparing payment claims and serving them carries no charge and no lock in.',
  },
  {
    term: '3% of the recovery',
    detail: 'When an escalated claim brings in more than the builder scheduled, the fee is 3 per cent of that extra amount only.',
  },
  {
    term: 'Capped at A$300',
    detail: 'A flat ceiling per claim, so the fee stops growing once a recovery passes A$10,000.',
  },
];

export default function Pricing({ cta }) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-18">
        <p className="num text-[11px] uppercase tracking-[0.18em] text-muted-foreground">What it costs</p>
        <h2 className="mt-3 max-w-2xl font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Nothing unless escalation wins you more
        </h2>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
          TradeClaim is free for the work you already do: the claims, the photos, the notices and the deadlines. A fee applies only where a notice of intention or adjudication recovers money beyond what the builder scheduled.
        </p>

        <dl className="mt-9 grid gap-5 border-t border-border pt-8 sm:grid-cols-3">
          {TERMS.map((item) => (
            <div key={item.term}>
              <dt className="font-heading text-[19px] font-semibold tracking-tight text-accent">{item.term}</dt>
              <dd className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">{item.detail}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 grid gap-4 rounded-[3px] border border-border bg-card p-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Worked example</p>
            <p className="mt-1.5 text-[13px] leading-relaxed">
              The builder schedules A$20,000. After escalation A$24,000 lands, so A$4,000 was recovered and the fee is A$120.
              Had nothing extra come through, the fee would be nothing.
            </p>
          </div>
          <Button asChild variant="outline" className="justify-self-start sm:justify-self-end">
            <Link to={cta.to}>{cta.label}</Link>
          </Button>
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
          Fees are only ever charged on escalated claims, are shown on the claim before anything is recorded as paid, and are invoiced separately. No subscription, no percentage of the claim you were always owed.
        </p>
      </div>
    </section>
  );
}