import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import LandingHeader from '@/components/landing/LandingHeader';
import Hero from '@/components/landing/Hero';
import IndustryStatement from '@/components/landing/IndustryStatement';
import ProblemGrid from '@/components/landing/ProblemGrid';
import Steps from '@/components/landing/Steps';
import ClockBand from '@/components/landing/ClockBand';
import LandingFooter from '@/components/landing/LandingFooter';

export default function Landing() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let active = true;
    base44.auth
      .isAuthenticated()
      .then((value) => {
        if (active) setLoggedIn(Boolean(value));
      })
      .catch(() => {
        if (active) setLoggedIn(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const cta = loggedIn ? { to: '/app', label: 'Go to app' } : { to: '/register', label: 'Sign up' };
  const signIn = loggedIn ? null : { to: '/login', label: 'Log in' };

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader cta={cta} signIn={signIn} />
      <main>
        <Hero cta={cta} />
        <IndustryStatement />
        <ProblemGrid />
        <Steps />
        <ClockBand cta={cta} />
      </main>
      <LandingFooter />
    </div>
  );
}