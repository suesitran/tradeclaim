import React from 'react';

const REASONS = [
  {
    title: 'The paperwork is beyond a two-person firm',
    body:
      'A claim has to identify the work, state the amount, carry the right wording and go out from the right date. Every follow-up document after it is timed in business days, not weeks.',
  },
  {
    title: 'There is no evidence when payment is withheld',
    body:
      'A camera roll with 400 unlabelled photos is not proof that the finish was complete on the day the builder walked through.',
  },
  {
    title: 'Escalating feels like a declaration of war',
    body:
      'Nobody wants to be dropped from a builder’s list. Large subcontractors endorse every claim as routine admin, and there is no reason a small trade cannot do the same.',
  },
];

export default function WhyItPersists() {
  return (
    <section className="border-b border-border bg-secondary">
      <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-18">
        <div className="grid gap-8 sm:grid-cols-[minmax(0,17rem)_1fr] sm:gap-12">
          <div>
            <p className="num text-[11px] uppercase tracking-[0.18em] text-accent">Why it persists</p>
            <h2 className="mt-4 font-heading text-2xl font-semibold leading-[1.15] tracking-tight sm:text-[28px]">
              The remedy already exists. Almost nobody uses it.
            </h2>
          </div>

          <div>
            <p className="text-[14px] leading-relaxed text-muted-foreground">
              The Security of Payment Act gives a subcontractor a fast, cheap, interim path to being paid. Serve a
              compliant claim, the builder must respond inside a short fixed window, and a dispute goes to an
              adjudicator in weeks rather than to a court in years. Pay when paid clauses are void under it.
            </p>

            <dl className="mt-6 border-t border-border">
              {REASONS.map((reason, index) => (
                <div key={reason.title} className="border-b border-border py-4">
                  <dt className="flex gap-3">
                    <span className="num text-[11px] text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
                    <span className="text-[14px] font-medium text-foreground">{reason.title}</span>
                  </dt>
                  <dd className="mt-1.5 pl-7 text-[13px] leading-relaxed text-muted-foreground">{reason.body}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-5 text-[13px] leading-relaxed text-muted-foreground">
              Quoting software stops at the invoice. Photo tools stop at the photo. Builder portals consume your
              evidence rather than create it. Nothing carries quote to scope to evidence to claim for the trade
              doing the work, which is the gap TradeClaim fills.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}