import React from 'react';
import useLoggedIn from '@/hooks/useLoggedIn';
import LandingHeader from '@/components/landing/LandingHeader';
import Hero from '@/components/landing/Hero';
import DemoVideo from '@/components/landing/DemoVideo';
import Steps from '@/components/landing/Steps';
import Pricing from '@/components/landing/Pricing';
import Problem from '@/components/landing/Problem';
import LandingFooter from '@/components/landing/LandingFooter';

export default function Landing() {
  const loggedIn = useLoggedIn();

  const cta = loggedIn ? { to: '/app', label: 'Go to app' } : { to: '/register', label: 'Sign up' };
  const signIn = loggedIn ? null : { to: '/login', label: 'Log in' };
  const trial = loggedIn ? cta : { to: '/demo', label: 'Try it, no sign-up', demo: true };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader cta={cta} signIn={signIn} />
      <main>
        <Hero cta={trial} />
        <DemoVideo />
        <Steps />
        <Pricing cta={cta} />
        <Problem cta={cta} />
      </main>
      <LandingFooter />
    </div>
  );
}