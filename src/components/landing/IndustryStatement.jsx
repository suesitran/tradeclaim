import React from 'react';

const STATS = [
  ['1.3 million', 'people employed in Australian construction'],
  ['98.5%', 'of construction businesses have fewer than 20 employees'],
  ['26%', 'of all Australian insolvencies were in construction in 2024-25'],
];

const SOURCES = [
  {
    label: 'ABS, Australian Industry 2023-24',
    href: 'https://www.abs.gov.au/articles/nuts-and-bolts-australian-construction-industry',
  },
  {
    label: 'ABS and RBA, Size Matters (2025)',
    href: 'https://www.rba.gov.au/publications/other-confs/abs-and-rba-joint-conferences/2025/pdf/abs-rba-conference-2025-wilson-brooks.pdf',
  },
  {
    label: 'Building and Plumbing Commission Victoria, insolvency research',
    href: 'https://www.bpc.vic.gov.au/resource-hub/research-projects/insolvency-in-the-construction-industry',
  },
];

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
            Construction employed around 1.3 million people and produced 7.0 per cent of Australia&rsquo;s GDP in
            2023-24. The trades earned $116.6 billion from subcontracting work and $71.4 billion from head contracts,
            so the business doing the work is usually not the business holding the contract.
          </p>
          <p>
            When a builder stops paying, the loss lands at the bottom of that chain, on businesses with no reserves to
            carry it. In 2024-25, construction accounted for 26 per cent of all insolvencies in Australia. That is why
            security of payment laws exist in every state, and why a claim must be served correctly and the next step
            taken inside the deadline, or the debt quietly becomes unrecoverable.
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

        <p className="mt-5 text-[11px] leading-relaxed text-primary-foreground/55">
          Sources:{' '}
          {SOURCES.map((source, index) => (
            <React.Fragment key={source.href}>
              {index > 0 ? ', ' : ''}
              <a href={source.href} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                {source.label}
              </a>
            </React.Fragment>
          ))}
          .
        </p>
      </div>
    </section>
  );
}