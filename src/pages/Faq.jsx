import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FAQ_GROUPS } from '@/lib/faqs';
import useLoggedIn from '@/hooks/useLoggedIn';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';
import FaqAccordion from '@/components/faq/FaqAccordion';
import { useT } from '@/lib/i18n';

export default function Faq() {
  const t = useT();
  const loggedIn = useLoggedIn();
  const cta = loggedIn ? { to: '/app', label: 'Go to app' } : { to: '/register', label: 'Sign up' };
  const signIn = loggedIn ? null : { to: '/login', label: 'Log in' };

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader cta={cta} signIn={signIn} showAnchor={false} />
      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 font-heading text-[16px] font-bold uppercase tracking-[0.02em] hover:underline"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t('Back')}
        </Link>

        <p className="eyebrow mt-6">{t('Questions')}</p>
        <h1 className="mt-2 text-[40px] font-extrabold leading-none sm:text-[56px]">
          {t('Deadlines, retention and fees, answered')}
        </h1>
        <p className="mt-3 max-w-xl text-[16px] leading-snug text-muted-foreground">
          {t('The parts of the Victorian rules that decide whether a claim gets paid, and what TradeClaim does about each one. English only.')}
        </p>

        <div className="mt-10 space-y-10">
          {FAQ_GROUPS.map((group, index) => (
            <section key={group.title}>
              <h2 className="text-[24px] font-extrabold">{group.title}</h2>
              <div className="mt-4">
                <FaqAccordion items={group.items} groupIndex={index} />
              </div>
            </section>
          ))}
        </div>

        <p className="legal mt-10">
          {t('General information about security of payment law in Victoria, not legal advice.')}
        </p>
      </main>
      <LandingFooter />
    </div>
  );
}