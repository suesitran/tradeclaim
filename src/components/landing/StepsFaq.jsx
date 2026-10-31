import React from 'react';

const DEADLINE_FAQ = [
  {
    q: 'How long does a builder have to respond?',
    a: 'It depends on the state or territory: 10 business days in New South Wales, Victoria, Tasmania and the ACT, 15 in Queensland, South Australia and Western Australia, or sooner if the contract names a shorter period. The date is worked out from the day the claim was emailed, counting business days only, so weekends, public holidays and the end of year shutdown do not eat into it.',
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

const RETENTION_FAQ = [
  {
    q: 'What is retention?',
    a: 'A slice of every progress payment, usually 5 per cent, held back by the builder as security for the work. The contract rate is recorded against the job, so the amount being held is always visible rather than buried in a payment schedule.',
  },
  {
    q: 'Does retention come off each claim?',
    a: 'The claim is served for the value of work done excluding GST. TradeClaim keeps the contract percentage on the job instead of quietly reducing your claim, so a deduction that looks too high can be queried straight away.',
  },
  {
    q: 'What is the defects liability period?',
    a: 'The period after practical completion, commonly 12 months, when you have to return and fix defects. The end date sits on the job alongside the retention percentage.',
  },
  {
    q: 'How do I get the retention back?',
    a: 'Once the defects liability period ends, the retained amount is claimed like any other payment claim. The end date is on the job so it does not quietly lapse while you are on the next project.',
  },
];

function FaqGroup({ title, items }) {
  return (
    <div>
      <h3 className="font-heading text-[15px] font-semibold tracking-tight">{title}</h3>
      <dl className="mt-4 border-t border-border">
        {items.map((item) => (
          <div key={item.q} className="border-b border-border py-4 sm:grid sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-6">
            <dt className="text-[13px] font-medium text-foreground">{item.q}</dt>
            <dd className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground sm:mt-0">{item.a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function StepsFaq() {
  return (
    <div className="mt-10 space-y-9">
      <FaqGroup title="Payment claim deadlines, answered" items={DEADLINE_FAQ} />
      <FaqGroup title="Retention and defects liability, answered" items={RETENTION_FAQ} />
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        General information about security of payment law across Australia, not legal advice.
      </p>
    </div>
  );
}