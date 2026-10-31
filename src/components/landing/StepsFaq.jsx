import React from 'react';

const DEADLINE_FAQ = [
  {
    q: 'How long does a builder have to respond?',
    a: 'In Victoria, the builder has 10 business days from the day the claim is served to give a payment schedule, or sooner if the contract names a shorter period. The date is worked out from the day the claim was emailed, counting business days only, so weekends, Victorian public holidays and the end of year shutdown do not eat into it.',
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

const FEE_FAQ = [
  {
    q: 'Is there a subscription?',
    a: 'No. There is no monthly fee and no charge for importing a quote, capturing evidence, preparing a payment claim or serving it. The only charge is a success fee on escalated claims that recover more than the builder scheduled.',
  },
  {
    q: 'How is the fee worked out?',
    a: 'Three per cent of the difference between what the builder scheduled and what actually reached your account after escalation, capped at A$300 per claim. If the schedule allowed A$20,000 and A$24,000 is paid, the fee is 3 per cent of A$4,000, which is A$120.',
  },
  {
    q: 'What if escalation recovers nothing?',
    a: 'There is no fee. A claim paid as scheduled, or paid without a notice of intention, carries no charge at all, whatever the amount.',
  },
  {
    q: 'When do I see the fee?',
    a: 'The fee sits on the claim itself and updates the moment a payment is recorded, so the number is visible before it is ever invoiced. Nothing is deducted from the payment you receive.',
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
      <FaqGroup title="What TradeClaim costs, answered" items={FEE_FAQ} />
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        General information about security of payment law in Victoria, not legal advice.
      </p>
    </div>
  );
}