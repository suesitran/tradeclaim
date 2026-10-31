import React from 'react';
import StepsFaq from '@/components/landing/StepsFaq';

const STEPS = [
  {
    title: 'Import the quote you already sent',
    body: 'Your scope lines become the schedule every claim is built from, priced against the contract, with no retyping at claim time.',
  },
  {
    title: 'Log progress by voice, on site',
    body: 'Your foreman speaks a note at the end of the day. It is matched to the quoted scope lines and turned into a claimed percentage.',
  },
  {
    title: 'Capture evidence as you go',
    body: 'Photos attach to each scope line, timestamped and located, so every amount claimed has a dated record behind it.',
  },
  {
    title: 'Serve the claim, then let the clock work',
    body: 'A compliant payment claim is generated and emailed to the builder. If the schedule never comes, a notice of intention is drafted and the next deadline is tracked.',
  },
];

export default function Steps() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-b border-border bg-secondary/40">
      <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-18">
        <p className="num text-[11px] uppercase tracking-[0.18em] text-accent">How it works</p>
        <h2 className="mt-3 max-w-2xl font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Four steps from site progress to a served claim
        </h2>

        <ol className="mt-10 grid gap-px overflow-hidden rounded-[3px] border border-border bg-border sm:grid-cols-2">
          {STEPS.map((step, index) => (
            <li key={step.title} className="bg-card p-5">
              <span className="flex h-7 w-7 items-center justify-center rounded-[3px] bg-primary font-mono text-[11px] text-primary-foreground">
                {index + 1}
              </span>
              <h3 className="mt-3 font-heading text-[16px] font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-6 grid gap-px overflow-hidden rounded-[3px] border border-border bg-border sm:grid-cols-2">
          <div className="bg-card p-5">
            <p className="num text-[10px] uppercase tracking-[0.14em] text-accent">If they keep ignoring it</p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              The schedule deadline passes with no answer, so the unpaid claim is escalated to a notice of
              intention: the amount, the work it covers and the date it was served, drafted and ready to send.
              The deadline is then tracked against the builder, not against you.
            </p>
          </div>
          <div className="bg-card p-5">
            <p className="num text-[10px] uppercase tracking-[0.14em] text-accent">If they argue or pay short</p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              A disputed or short payment schedule moves to adjudication. The scope lines, the photos and the
              amount are already assembled in one document, with the apply-by date tracked so the right to
              adjudicate is not lost weeks after the work was finished.
            </p>
          </div>
        </div>

        <p className="mt-6 max-w-2xl text-[12px] leading-relaxed text-muted-foreground">
          Builders never need an account. They receive the claim and the notices by email, and the record of
          when each one was served stays with the job.
        </p>

        <StepsFaq />
      </div>
    </section>
  );
}