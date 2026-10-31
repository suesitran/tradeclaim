import React from 'react';

const STATS = [
  ['3,472', 'construction firms entered external administration for the first time in FY2025-26, 24.5% of every company failure'],
  ['76%', 'of construction insolvencies were small firms with fewer than 20 staff'],
  ['72%', 'of surveyed contractors had 40% or more of their invoices paid late'],
];

const SOURCE_NOTE =
  'ASIC Series 1, analysis by The Good Builder (FY2025-26); Equifax, year to June 2025; Murray Review survey of 526 contractors, cited in Victorian Parliament Hansard, November 2023; ABCC security of payment reports; Love et al, rework survey of 161 projects.';

export default function IndustryStatement() {
  return (
    <section className="border-b border-border bg-primary text-primary-foreground">
      <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-18">
        <p className="num text-[11px] uppercase tracking-[0.18em] text-accent">The scale of it</p>

        <h2 className="mt-4 max-w-3xl font-heading text-2xl font-semibold leading-[1.15] tracking-tight sm:text-[32px]">
          Most of the work on an Australian building site is done by subcontractors. Almost all of them are small
          businesses.
        </h2>

        <div className="mt-6 grid max-w-3xl gap-4 text-[13px] leading-relaxed text-primary-foreground/75 sm:grid-cols-2">
          <p>
            Construction is about 17 per cent of Australian businesses and about a quarter of its company failures.
            Every year since 2021-22 that share has sat between 24 and 28 per cent, and 94 per cent of the security of
            payment reports subcontractors made to the ABCC were about late payment rather than any other dispute.
          </p>
          <p>
            Rework costs Australian projects 6.4 per cent of contract value directly and a further 5.9 per cent
            indirectly. On a fixed price subcontract the trade carries that unless it can show the fault belongs to
            someone else. Painting absorbs the marks of every trade that came before it, and a phone full of unlabelled
            photos proves none of it.
          </p>
        </div>

        <dl className="mt-10 grid gap-px overflow-hidden rounded-[3px] border border-primary-foreground/20 bg-primary-foreground/20 sm:grid-cols-3">
          {STATS.map(([figure, label]) => (
            <div key={label} className="bg-primary px-4 py-4">
              <dt className="num text-[20px] font-semibold tracking-tight text-primary-foreground">{figure}</dt>
              <dd className="mt-1.5 text-[12px] leading-relaxed text-primary-foreground/70">{label}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-5 max-w-3xl text-[11px] leading-relaxed text-primary-foreground/55">
          Sources: {SOURCE_NOTE}
        </p>
      </div>
    </section>
  );
}