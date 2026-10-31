const STEPS = [
  {
    label: 'Import quote',
    body: 'The quote you already sent becomes priced scope lines, once.',
  },
  {
    label: 'Capture',
    body: 'A photo against each line, dated and located, as the work happens.',
  },
  {
    label: 'Claim',
    body: 'Pick what is done this period and the claim is built with GST and variations.',
  },
  {
    label: 'Clock',
    body: 'Serve it and the schedule and adjudication dates are counted for you.',
  },
];

export default function ShepherdStrip() {
  return (
    <section className="overflow-hidden rounded-[4px] border border-border bg-card">
      <ol className="grid grid-cols-2 divide-x divide-y divide-border lg:grid-cols-4 lg:divide-y-0">
        {STEPS.map((step, index) => (
          <li key={step.label} className="px-4 py-3">
            <p className="flex items-baseline gap-2">
              <span className="num text-[10px] text-accent">{index + 1}</span>
              <span className="text-[11px] font-medium uppercase tracking-[0.12em]">{step.label}</span>
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}