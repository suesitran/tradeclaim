import React from 'react';
import useLoggedIn from '@/hooks/useLoggedIn';
import LandingHeader from '@/components/landing/LandingHeader';
import Hero from '@/components/landing/Hero';
import IndustryStatement from '@/components/landing/IndustryStatement';
import ProblemGrid from '@/components/landing/ProblemGrid';
import WhyItPersists from '@/components/landing/WhyItPersists';
import Steps from '@/components/landing/Steps';
import ClockBand from '@/components/landing/ClockBand';
import Pricing from '@/components/landing/Pricing';
import LandingFooter from '@/components/landing/LandingFooter';

export default function Landing() {
  const loggedIn = useLoggedIn();

  const cta = loggedIn ? { to: '/app', label: 'Go to app' } : { to: '/register', label: 'Sign up' };
  const signIn = loggedIn ? null : { to: '/login', label: 'Log in' };
  const trial = loggedIn ? cta : { to: '/demo', label: 'Try it free, no account' };

  return (
    <div className="min-h-screen bg-[#FAF7F1] text-[#1B1A17]">
      <LandingHeader cta={cta} signIn={signIn} />
      <main>
        <Hero cta={trial} />
        <IndustryStatement />
        <ProblemGrid />
        <WhyItPersists />
        <Steps />
        <ClockBand cta={cta} />
        <Pricing cta={cta} />
      </main>
      <LandingFooter />
    </div>
  );
}