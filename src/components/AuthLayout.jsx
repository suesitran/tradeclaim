import React from 'react';
import { Link } from 'react-router-dom';
import LanguageSwitch from '@/components/LanguageSwitch';

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b-[3px] border-foreground">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-2.5">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center bg-accent font-heading text-[16px] font-extrabold">TC</span>
            <span className="font-heading text-[22px] font-extrabold uppercase leading-none tracking-[0.02em]">TradeClaim</span>
          </Link>
          <LanguageSwitch />
        </div>
      </header>
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center border-2 border-foreground bg-foreground">
              <Icon className="h-7 w-7 text-accent" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-[36px] font-extrabold leading-none">{title}</h1>
              {subtitle && <p className="mt-1 text-[15px] text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          <div className="sheet p-6">{children}</div>
          {footer && <p className="mt-5 text-center text-[15px] text-muted-foreground">{footer}</p>}
        </div>
      </div>
    </div>
  );
}
