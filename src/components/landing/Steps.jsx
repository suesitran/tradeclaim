import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import TaskRow from '@/components/jobs/TaskRow';
import { CARD } from '@/components/jobs/taskStyles';

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

const CARD_COPY = [
  {
    label: 'If they keep ignoring it',
    body: 'The schedule deadline passes with no answer, so the unpaid claim is escalated to a notice of intention: the amount, the work it covers and the date it was served, drafted and ready to send. The deadline is then tracked against the builder, not against you.',
  },
  {
    label: 'If they argue or pay short',
    body: 'A disputed or short payment schedule moves to adjudication. The scope lines, the photos and the amount are already assembled in one document, with the apply-by date tracked so the right to adjudicate is not lost weeks after the work was finished.',
  },
];

export default function Steps() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-t border-[#DED6C7] bg-[#FAF7F1]">
      <div className="mx-auto w-full max-w-5xl px-4 pt-14 sm:px-6 sm:pt-16 md:pl-[140px]">
        <p className="num text-[10px] uppercase tracking-[0.16em] text-[#9A5B2A]">How it works</p>
        <h2 className="mt-3 max-w-2xl text-[26px] font-extrabold leading-[1.12] tracking-[-0.015em] sm:text-[34px]">
          Four steps from site progress to a served claim
        </h2>

        {STEPS.map((step, index) => (
          <TaskRow key={step.title} number={String(index + 1)} title={step.title} delay={0.1 + index * 0.08}>
            <p className="max-w-2xl text-[14px] leading-[1.6] text-[#6b6457]">{step.body}</p>
          </TaskRow>
        ))}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {CARD_COPY.map((card) => (
            <div key={card.label} className={`${CARD} p-5`}>
              <p className="num text-[10px] uppercase tracking-[0.14em] text-[#9A5B2A]">{card.label}</p>
              <p className="mt-2 text-[13px] leading-[1.6] text-[#6b6457]">{card.body}</p>
            </div>
          ))}
        </div>

        <p className="mt-6 max-w-2xl text-[12px] leading-[1.6] text-[#6b6457]">
          Builders never need an account. They receive the claim and the notices by email, and the record of
          when each one was served stays with the job.
        </p>

        <Link
          to="/faq"
          className="mt-8 inline-flex items-center gap-2 pb-14 text-[13px] font-semibold text-[#9A5B2A] transition-colors duration-200 hover:text-[#1B1A17] hover:underline"
        >
          Deadlines, retention and fees, answered <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}