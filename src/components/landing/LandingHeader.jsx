import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function LandingHeader({ cta }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-[3px] bg-primary font-mono text-[11px] font-semibold tracking-tight text-primary-foreground">
            SK
          </span>
          <span className="leading-none">
            <span className="block font-heading text-[15px] font-semibold tracking-tight">Survival Kit</span>
            <span className="mt-0.5 block text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Payment claims, Victoria</span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <a
            href="#how-it-works"
            className="hidden text-[13px] text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            How it works
          </a>
          <Button asChild size="sm" className="rounded-[3px]">
            <Link to={cta.to}>{cta.label}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}