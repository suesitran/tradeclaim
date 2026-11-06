import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
import { useT } from '@/lib/i18n';

const round2 = (value) => Math.round(Number(value || 0) * 100) / 100;
const START_PERCENTS = [100, 100, 60, 40, 0];

function Step({ number, title, sub, children }) {
  return (
    <section className="mt-8 border-t-[3px] border-foreground pt-6">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-foreground font-heading text-[20px] font-extrabold text-accent">{number}</span>
        <div>
          <h2 className="text-[28px] font-extrabold leading-none">{title}</h2>
          <p className="mt-1 text-[15px] text-muted-foreground">{sub}</p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function Demo() {
  const t = useT();
  const loggedIn = useLoggedIn();
  const [percents, setPercents] = useState(START_PERCENTS);

  const cta = loggedIn ? { to: '/app', label: 'Go to app' } : { to: '/register', label: 'Sign up' };
  const signIn = loggedIn ? null : { to: '/login', label: 'Log in' };

  const setPercent = (index, value) => {
    setPercents((current) => current.map((percent, i) => (i === index ? value : percent)));
  };

  const totals = useMemo(() => {
    const exGst = round2(DEMO_LINES.reduce((total, line, index) => total + (line.amount * percents[index]) / 100, 0));
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
        <p className="eyebrow">{t('Try it, no account')}</p>
        <h1 className="mt-2 max-w-2xl text-[40px] font-extrabold leading-[0.95] sm:text-[56px]">{t('Work a finished job')}</h1>
        <p className="mt-3 max-w-2xl text-[17px] leading-snug text-muted-foreground">
          {t('A real painting quote. Slide each line along and watch the claim and the deadline build themselves. Nothing is saved.')}
        </p>

        <dl className="mt-8 grid gap-px border-2 border-foreground bg-foreground sm:grid-cols-3">
          <div className="bg-card px-4 py-3">
            <dt className="eyebrow">{t('Job')}</dt>
            <dd className="mt-1 text-[16px] font-semibold">{DEMO_JOB.name}</dd>
          </div>
          <div className="bg-card px-4 py-3">
            <dt className="eyebrow">{t('Builder')}</dt>
            <dd className="mt-1 text-[16px] font-semibold">{DEMO_JOB.builder_name}</dd>
          </div>
          <div className="bg-card px-4 py-3">
            <dt className="eyebrow">{t('Quote')}</dt>
            <dd className="num mt-1 text-[16px] font-semibold">{formatAud(DEMO_CONTRACT_SUM)}</dd>
          </div>
        </dl>

        <Step number="1" title={t('What you quoted')} sub={t('Every claim is built from these lines.')}>
          <DemoQuoteTable lines={DEMO_LINES} total={DEMO_CONTRACT_SUM} />
        </Step>

        <Step number="2" title={t('How far along it is')} sub={t('On site you say this into your phone. Here, drag the sliders.')}>
          <DemoProgressList lines={DEMO_LINES} percents={percents} onChange={setPercent} />
        </Step>

        <Step number="3" title={t('The claim it makes')} sub={t('And the clock that starts the moment it is sent.')}>
          <div className="grid gap-3 sm:grid-cols-2">
            <DemoClaimCard {...totals} />
            <DemoClockCard servedAt={servedAt} dueAt={dueAt} daysLeft={daysLeft} />
          </div>
        </Step>

        <section className="mt-10 border-2 border-foreground bg-foreground px-6 py-7 text-background">
          <h2 className="text-[30px] font-extrabold leading-none">{t('Ready to run it on a real job?')}</h2>
          <p className="mt-2 max-w-xl text-[16px] leading-snug text-background/85">
            {t('Make a free account, add the quote you already sent, and send the next claim with the photos attached. No card.')}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link to="/register" className="btn-yellow">
              {t('Make a free account')} <ArrowRight className="h-5 w-5 rtl:rotate-180" />
            </Link>
            <Link to="/login" className="btn-line border-background text-background hover:bg-background hover:text-foreground">
              {t('Log in')}
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
