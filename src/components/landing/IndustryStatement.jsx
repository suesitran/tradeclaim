import React from 'react';

const STATS = [
  ['About 1 in 10', 'Australian workers are employed in construction'],
  ['98%', 'of construction businesses are small businesses'],
  ['Most', 'insolvencies of any Australian industry happen in construction'],
];

export default function IndustryStatement() {
  return (
    <section className="border-b border-border bg-primary text-primary-foreground">
      <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-18">
        <p className="num text-[11px] uppercase tracking-[0.18em] text-accent">The scale of it</p>

        <h2 className="mt-4 max-w-3xl font-heading text-2xl font-semibold leading-[1.15] tracking-tight sm:text-[32px]">
          Almost every building in Australia is finished by subcontractors. Most of them are small businesses.
        </h2>

        <div className="mt-6 grid max-w-3xl gap-4 text-[13px] leading-relaxed text-primary-foreground/75 sm:grid-cols-2">
          <p>
            Construction is one of the country&rsquo;s largest employers, and nearly all of its businesses are small.
            The work is passed down a chain of contracts until it reaches a crew that has already paid for wages,
            paint and time out of its own pocket.
          </p>
          <p>
            When a builder stops paying, the loss lands at the bottom of that chain, on trades with no reserves to
            carry it. That is exactly why security of payment laws exist in every state. The right to be paid is
            strong, but the claim has to be served correctly and the next step taken inside the deadline, or the
            debt quietly becomes unrecoverable.
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
      </div>
    </section>
  );
}