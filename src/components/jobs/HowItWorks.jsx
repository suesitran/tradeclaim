const STEPS = [
  {
    title: 'Import the quote',
    body: 'Read the quote in from a PDF, paste it as CSV, or talk it through. Every wording becomes a scope line with its own value.',
  },
  {
    title: 'Capture the site',
    body: 'Photograph each scope line before work starts, at finish, and clear. The photos are the evidence behind the claim.',
  },
  {
    title: 'Generate the claim',
    body: 'Set how much of each line is done this period, tick any variations, and the claim is built with GST and the reference date.',
  },
  {
    title: 'Serve and track the clock',
    body: 'Serve the claim on the builder. The payment schedule due date and the adjudication deadline are counted for you.',
  },
];

export default function HowItWorks() {
  return (
    <section className="rounded-[4px] border border-border bg-card px-5 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-heading text-sm font-semibold">How a job runs</h2>
        <p className="text-[11px] text-muted-foreground">Quote in, evidence on, claim served, clock tracked.</p>
      </div>
      <ol className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <li key={step.title} className="rounded-[3px] border border-border/70 bg-background/40 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-[0.12em] text-accent">Step {index + 1}</p>
            <p className="mt-1 text-[12px] font-medium">{step.title}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        A quote saved as a draft can still be edited. Once it is final the scope lines are what claims are measured against, and a claim stays a draft until it is served.
      </p>
    </section>
  );
}