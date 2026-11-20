import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Camera, FileUp, Gavel, MailX, Mic, Send, TrendingDown } from 'lucide-react';
import { useT } from '@/lib/i18n';

const STEPS = [
  { icon: FileUp, title: 'Add the quote you already sent', body: 'Each line on the quote becomes a line you claim against.' },
  { icon: Camera, title: 'Take photos as you go', body: 'Dated and located, on the line they belong to.' },
  { icon: Mic, title: "Say what's done", body: 'Talk into your phone at the end of the day. It is matched to your lines.' },
  { icon: Send, title: 'Send the claim and let the clock run', body: 'The builder has 10 business days to answer.' },
];

// These are alternatives, not a sequence, so they sit in their own row without numbers.
const IF_UNPAID = [
  { icon: MailX, title: 'If they ignore it', body: 'The reply date passes with no answer. A notice is drafted for you, and the next deadline is tracked against the builder, not you.' },
  { icon: TrendingDown, title: 'If they pay less', body: 'The escalation paper is ready, with your lines, photos and amounts in one document, and the date to apply by in front of you.' },
  { icon: Gavel, title: 'Who decides', body: 'An independent adjudicator, in weeks, not a court in years.' },
];

function StepCard({ icon: Icon, title, body, number }) {
  const t = useT();
  return (
    <li className="bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center bg-accent">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        {number ? <span className="font-heading text-[40px] font-extrabold leading-none text-muted-foreground">{number}</span> : null}
      </div>
      <h3 className="mt-4 text-[24px] font-extrabold leading-none">{t(title)}</h3>
      <p className="mt-2 text-[16px] leading-snug text-muted-foreground">{t(body)}</p>
    </li>
  );
}

export default function Steps() {
  const t = useT();
  return (
    <section id="how-it-works" className="scroll-mt-20 border-b-[3px] border-foreground">
      <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-18">
        <p className="eyebrow">{t('How it works')}</p>
        <h2 className="mt-2 max-w-3xl text-[34px] font-extrabold leading-[1] sm:text-[48px]">
          {t('Four steps from the site to a sent claim')}
        </h2>

        <ol className="mt-8 grid gap-px border-2 border-foreground bg-foreground sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <StepCard key={step.title} {...step} number={index + 1} />
          ))}
        </ol>

        <h2 className="mt-12 max-w-3xl text-[28px] font-extrabold leading-[1] sm:text-[36px]">
          {t("If the builder doesn't pay")}
        </h2>

        <ul className="mt-6 grid gap-px border-2 border-foreground bg-foreground sm:grid-cols-3">
          {IF_UNPAID.map((step) => (
            <StepCard key={step.title} {...step} />
          ))}
        </ul>

        <p className="mt-6 max-w-2xl text-[15px] leading-snug text-muted-foreground">
          {t('Builders never need an account. They get the claim and the notices by email, and the record of when each one was sent stays with the job.')}
        </p>

        <Link to="/faq" className="mt-6 inline-flex items-center gap-2 font-heading text-[18px] font-bold uppercase tracking-[0.02em] hover:underline">
          {t('Deadlines, retention and fees, answered')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </div>
    </section>
  );
}
