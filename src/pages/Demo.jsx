import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';
import DemoQuoteTable from '@/components/demo/DemoQuoteTable';
import DemoProgressList from '@/components/demo/DemoProgressList';
import DemoClaimCard from '@/components/demo/DemoClaimCard';
import DemoClockCard from '@/components/demo/DemoClockCard';
import useLoggedIn from '@/hooks/useLoggedIn';
import { DEMO_CONTRACT_SUM, DEMO_JOB, DEMO_LINES } from '@/lib/demoJob';
import { addBusinessDays, businessDaysUntil, todayYmd } from '@/lib/clock';
import { formatAud } from '@/lib/format';

const round2 = (value) => Math.round(Number(value || 0) * 100) / 100;
const START_PERCENTS = [100, 100, 60, 40, 0];

export default function Demo() {
  const loggedIn = useLoggedIn();
  const [percents, setPercents] = useState(START_PERCENTS);

  const cta = loggedIn ? { to: '/app', label: 'Go to app' } : { to: '/register', label: 'Create account' };
  const signIn = loggedIn ? null : { to: '/login', label: 'Log in' };

  const setPercent = (index, value) => {
    setPercents((current) => current.map((percent, i) => (i === index ? value : percent)));
  };

  const totals = useMemo(() => {
    const exGst = round2(
      DEMO_LINES.reduce((total, line, index) => total + (line.amount * percents[index]) / 100, 0),
    );
    const gst = round2(exGst * 0.1);
    return { exGst, gst, incGst: round2(exGst + gst) };
  }, [percents]);

  const servedAt = todayYmd();
  const dueAt = addBusinessDays(servedAt, 10, null, 'VIC');
  const daysLeft = businessDaysUntil(dueAt, null, 'VIC');

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader cta={cta} signIn={signIn} showAnchor={false} />

      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="num text-[11px] uppercase tracking-[0.18em] text-accent">Free trial, no account</p>
        <h1 className="mt-3 max-w-2xl font-heading text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          Work a finished job before you sign up
        </h1>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
          This is a real quote for a level 3 repaint. Move each line along, and the payment claim and the Victorian
          deadline build themselves. Nothing is saved until you create an account.
        </p>

        <dl className="mt-8 grid gap-px overflow-hidden rounded-[3px] border border-border bg-border sm:grid-cols-3">
          <div className="bg-card px-4 py-3">
            <dt className="num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Job</dt>
            <dd className="mt-1 text-[13px]">{DEMO_JOB.name}</dd>
          </div>
          <div className="bg-card px-4 py-3">
            <dt className="num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Builder</dt>
            <dd className="mt-1 text-[13px]">{DEMO_JOB.builder_name}</dd>
          </div>
          <div className="bg-card px-4 py-3">
            <dt className="num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Contract sum, ex GST</dt>
            <dd className="num mt-1 text-[13px]">{formatAud(DEMO_CONTRACT_SUM)}</dd>
          </div>
        </dl>

        <section className="mt-10">
          <h2 className="font-heading text-[15px] font-semibold tracking-tight">
            <span className="num mr-2 text-[11px] text-accent">01</span> The quote you already sent
          </h2>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            Every claim from here on is built from these scope lines, so nothing is retyped at claim time.
          </p>
          <div className="mt-4">
            <DemoQuoteTable lines={DEMO_LINES} total={DEMO_CONTRACT_SUM} />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-heading text-[15px] font-semibold tracking-tight">
            <span className="num mr-2 text-[11px] text-accent">02</span> How far along the work is
          </h2>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            On site this is spoken into the phone at the end of the day and matched to these lines. Drag the
            sliders to see it move.
          </p>
          <div className="mt-4">
            <DemoProgressList lines={DEMO_LINES} percents={percents} onChange={setPercent} />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-heading text-[15px] font-semibold tracking-tight">
            <span className="num mr-2 text-[11px] text-accent">03</span> The claim it produces
          </h2>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            A compliant payment claim for the work done, and the clock that starts the moment it is served.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <DemoClaimCard {...totals} />
            <DemoClockCard servedAt={servedAt} dueAt={dueAt} daysLeft={daysLeft} />
          </div>
        </section>

        <section className="mt-10 rounded-[3px] border border-border bg-secondary/40 px-6 py-7">
          <h2 className="font-heading text-lg font-semibold tracking-tight">Ready to run it on a real job?</h2>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted-foreground">
            Create a free account, import the quote you have already sent, and serve the next claim with the evidence
            attached. No card, no subscription.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button asChild size="lg" className="h-10 rounded-[3px]">
              <Link to="/register">
                Create a free account <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-10 rounded-[3px]">
              <Link to="/login">Log in</Link>
            </Button>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}