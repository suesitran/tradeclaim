import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function LandingHeader({ cta, signIn, showAnchor = true }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#DED6C7] bg-[#FAF7F1]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-[3px] bg-primary font-mono text-[11px] font-semibold tracking-tight text-primary-foreground">
            TC
          </span>
          <span className="leading-none">
            <span className="block font-heading text-[15px] font-semibold tracking-tight">TradeClaim</span>
            <span className="mt-0.5 hidden text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:block">Payment claims, Victoria</span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          {showAnchor ? (
            <a
              href="#how-it-works"
              className="hidden text-[13px] text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              How it works
            </a>
          ) : null}
          <Link
            to="/faq"
            className="hidden text-[13px] text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            FAQ
          </Link>
          {signIn ? (
            <Link to={signIn.to} className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">
              {signIn.label}
            </Link>
          ) : null}
          <Button asChild size="sm" className="rounded-[3px]">
            <Link to={cta.to}>{cta.label}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}