import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GuidedStartBar({ steps, activeIndex, onHide }) {
  const active = steps[activeIndex];
  if (!active) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6">
      <div className="flex items-center gap-3 rounded-[4px] border border-border bg-card px-4 py-2.5">
        <span className="num flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] text-accent-foreground">
          {activeIndex + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium">{active.title}</p>
          <p className="mt-0.5 hidden truncate text-[11.5px] text-muted-foreground sm:block">{active.body}</p>
        </div>
        <span className="num hidden shrink-0 text-[10px] uppercase tracking-[0.12em] text-muted-foreground md:block">
          Step {activeIndex + 1} of {steps.length}
        </span>
        <Button asChild size="sm" className="shrink-0 rounded-[3px]">
          <Link to={active.action.to}>
            {active.action.label} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </Button>
        <button
          type="button"
          onClick={onHide}
          aria-label="Hide the guided start"
          className="shrink-0 rounded-[3px] p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}