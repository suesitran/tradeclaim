import React from 'react';
import { Link } from 'react-router-dom';
import { useT } from '@/lib/i18n';

export default function LandingFooter() {
  const t = useT();
  return (
    <footer className="border-t-[3px] border-foreground bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center bg-accent font-heading text-[14px] font-extrabold">TC</span>
          <span className="text-[14px] text-muted-foreground">TradeClaim | {t('Payment claims, Victoria')}</span>
          <Link to="/faq" className="font-heading text-[15px] font-bold uppercase hover:underline">
            {t('FAQ')}
          </Link>
        </div>
        <p className="max-w-xl text-[12px] leading-snug text-muted-foreground">
          {t('Documents are drafts for a lawyer to check. TradeClaim is not a law firm and does not give legal advice.')}
        </p>
      </div>
    </footer>
  );
}
