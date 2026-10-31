import React from 'react';

const PROBLEMS = [
  {
    title: 'Claims go out late',
    body:
      'The statutory clock only starts once a payment claim is properly served. Every week spent rebuilding one in a spreadsheet is a week of deadline you cannot get back.',
  },
  {
    title: 'Progress lives in someone’s head',
    body:
      'Your foreman knows exactly what got done. Without dated, located photos tied to the quoted scope, none of it stands up when the builder questions a percentage.',
  },
  {
    title: 'Variations disappear',
    body:
      'Instructed on the phone, never written down. By claim time nobody can say who asked for the extra coat, or when — so it goes unpaid.',
  },
  {
    title: 'The clock runs out unattended',
    body:
      'Miss the window to apply for adjudication and a clear debt turns into an argument you chase through court, with your own cash funding the delay.',
  },
];

export default function ProblemGrid() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-18">
        <h2 className="max-w-2xl font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Finishing trades lose money to paperwork, not to the work
        </h2>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
          The Security of Payment Act gives you strong rights. They only count if the claim is served correctly
          and the next step is taken inside the deadline.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {PROBLEMS.map((problem, index) => (
            <article key={problem.title} className="rounded-[3px] border border-border bg-card p-5">
              <span className="num text-[11px] text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="mt-2 font-heading text-[16px] font-semibold tracking-tight">{problem.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{problem.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}