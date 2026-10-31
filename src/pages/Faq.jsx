import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FAQ_GROUPS } from '@/lib/faqs';
import useLoggedIn from '@/hooks/useLoggedIn';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';
import FaqAccordion from '@/components/faq/FaqAccordion';

export default function Faq() {
  const loggedIn = useLoggedIn();
  const cta = loggedIn ? { to: '/app', label: 'Go to app' } : { to: '/register', label: 'Sign up' };
  const signIn = loggedIn ? null : { to: '/login', label: 'Log in' };

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader cta={cta} signIn={signIn} showAnchor={false} />
      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to TradeClaim
        </Link>

        <p className="num mt-6 text-[11px] uppercase tracking-[0.18em] text-accent">Questions</p>
        <h1 className="mt-3 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Payment claims, retention and fees, answered
        </h1>
        <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-muted-foreground">
          The parts of the Victorian security of payment process that decide whether a claim gets paid, and what
          TradeClaim does about each one.
        </p>

        <div className="mt-10 space-y-10">
          {FAQ_GROUPS.map((group, index) => (
            <section key={group.title}>
              <h2 className="font-heading text-[15px] font-semibold tracking-tight">{group.title}</h2>
              <div className="mt-4">
                <FaqAccordion items={group.items} groupIndex={index} />
              </div>
            </section>
          ))}
        </div>

        <p className="mt-10 text-[11px] leading-relaxed text-muted-foreground">
          General information about security of payment law in Victoria, not legal advice.
        </p>
      </main>
      <LandingFooter />
    </div>
  );
}