import React from 'react';

const FAQ = [
  {
    q: 'How long does a builder have to respond?',
    a: 'A payment schedule is due within 10 business days of the claim being served, or sooner if the contract names a shorter period. The date is worked out from the day the claim was emailed, counting business days only, so weekends and public holidays do not eat into it.',
  },
  {
    q: 'What if the deadline passes with no answer?',
    a: 'The claim is treated as ignored. The next step is a notice of intention to apply for adjudication, drafted from the claim and its evidence, and the date to apply by is tracked from there.',
  },
  {
    q: 'Can I still claim for work I finished months ago?',
    a: 'The clock runs from when the payment claim was served, not from when the work was done. Adjudication has its own strict time limit though, so an old unpaid claim is usually the most urgent one on the list.',
  },
  {
    q: 'Do the deadlines stop if the builder disputes the amount?',
    a: 'No. A short or disputed payment schedule does not pause anything. The apply-by date is set from the day the schedule was received, so the response has to be prepared inside that window.',
  },
];

export default function StepsFaq() {
  return (
    <div className="mt-10">
      <h3 className="font-heading text-[15px] font-semibold tracking-tight">Payment claim deadlines, answered</h3>
      <dl className="mt-4 border-t border-border">
        {FAQ.map((item) => (
          <div key={item.q} className="border-b border-border py-4 sm:grid sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-6">
            <dt className="text-[13px] font-medium text-foreground">{item.q}</dt>
            <dd className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground sm:mt-0">{item.a}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        General information about the Victorian security of payment scheme, not legal advice.
      </p>
    </div>
  );
}