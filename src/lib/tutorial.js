// The guided start for a new account: four steps, each one already satisfied by
// real records, so the guide can point at the single next thing to do.

export const TUTORIAL_HIDDEN_KEY = 'tradeclaim.guided.hidden';

export function tutorialState({ jobs = [], hasEvidence = false, claims = [] }) {
  const firstJob = jobs[0];
  const openJob = firstJob
    ? { label: 'Open the job', to: `/jobs/${firstJob.id}` }
    : { label: 'Import a quote', to: '/import' };
  const servedCount = claims.filter((claim) => claim.served_at).length;

  const steps = [
    {
      key: 'quote',
      short: 'Import the quote',
      title: 'Start with the quote you already sent',
      body: 'Paste the quote, upload the PDF, or use the sample. It becomes priced scope lines, and every claim is built from them from here on.',
      done: jobs.length > 0,
      action: { label: 'Import a quote', to: '/import' },
    },
    {
      key: 'capture',
      short: 'Log the work on site',
      title: 'Record what is finished, with a photo',
      body: 'Open the job on site and log progress against each line. TradeClaim keeps the date, the location and the photo with the entry.',
      done: hasEvidence,
      action: openJob,
    },
    {
      key: 'claim',
      short: 'Build the claim',
      title: 'Turn finished lines into one claim',
      body: 'Choose what is done this period. GST, approved variations and retention are added for you, and the claim is ready to serve.',
      done: claims.length > 0,
      action: firstJob ? { label: 'Build a claim', to: `/jobs/${firstJob.id}` } : openJob,
    },
    {
      key: 'clock',
      short: 'Serve it and watch the clock',
      title: 'Serve the claim, then let the clock run',
      body: 'The moment it is served, the ten business days a builder has for a payment schedule start counting, weekends and shutdowns excluded.',
      done: servedCount > 0,
      action: claims.length ? { label: 'Open the clock', to: '/claims' } : openJob,
    },
  ];

  const activeIndex = steps.findIndex((step) => !step.done);
  return { steps, activeIndex, complete: activeIndex === -1 };
}