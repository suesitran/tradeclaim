import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingHeader({ cta, signIn, showAnchor = true }) {
  return (
    <header className="sticky top-0 z-30 border-b-[3px] border-foreground bg-background">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-4 py-2.5 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center bg-accent font-heading text-[16px] font-extrabold text-foreground">TC</span>
          <span className="font-heading text-[22px] font-extrabold uppercase leading-none tracking-[0.02em]">TradeClaim</span>
        </Link>

        <div className="ml-auto flex items-center gap-3 sm:gap-5">
          {showAnchor ? (
            <a href="#how-it-works" className="hidden font-heading text-[17px] font-bold uppercase tracking-[0.02em] hover:underline sm:block">
              How it works
            </a>
          ) : null}
          <Link to="/faq" className="hidden font-heading text-[17px] font-bold uppercase tracking-[0.02em] hover:underline sm:block">
            FAQ
          </Link>
          {signIn ? (
            <Link to={signIn.to} className="font-heading text-[17px] font-bold uppercase tracking-[0.02em] hover:underline">
              {signIn.label}
            </Link>
          ) : null}
          <Link to={cta.to} className="btn-small !min-h-[40px] !bg-foreground !text-background hover:!bg-accent hover:!text-foreground">
            {cta.label}
          </Link>
        </div>
      </div>
    </header>
  );
}
