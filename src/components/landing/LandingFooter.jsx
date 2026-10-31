import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-[3px] bg-primary font-mono text-[10px] font-semibold text-primary-foreground">
            TC
          </span>
          <span className="text-[12px] text-muted-foreground">TradeClaim · Payment claims, Victoria</span>
          <Link
            to="/faq"
            className="text-[12px] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            FAQ
          </Link>
        </div>
        <p className="max-w-xl text-[11px] leading-relaxed text-muted-foreground">
          Documents are generated as drafts for lawyer review. TradeClaim is not a law firm and does not give
          legal advice.
        </p>
      </div>
    </footer>
  );
}