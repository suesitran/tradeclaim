import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NextStepGuide({ steps, activeIndex, onHide }) {
  const active = steps[activeIndex];

  return (
    <section className="overflow-hidden rounded-[4px] border border-border bg-card">
      <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-3">
        <div>
          <p className="num text-[10px] uppercase tracking-[0.16em] text-accent">Guided start</p>
          <h2 className="mt-1 font-heading text-[15px] font-semibold tracking-tight">
            {active.title}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="num hidden text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:block">
            Step {activeIndex + 1} of {steps.length}
          </span>
          <button
            type="button"
            onClick={onHide}
            aria-label="Hide the guided start"
            className="rounded-[3px] p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <ol className="divide-y divide-border">
        {steps.map((step, index) => {
          const isActive = index === activeIndex;
          const isDone = step.done;

          return (
            <li key={step.key} className={isActive ? 'bg-secondary/40' : ''}>
              <div className="flex items-start gap-3 px-5 py-3.5">
                <span
                  className={`num mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] ${
                    isDone
                      ? 'border-[#C6DFCE] bg-[#E4F0E8] text-[#245B3B]'
                      : isActive
                        ? 'border-accent bg-accent text-accent-foreground'
                        : 'border-border text-muted-foreground'
                  }`}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[13px] ${
                      isActive ? 'font-medium' : isDone ? 'text-muted-foreground line-through' : 'text-muted-foreground'
                    }`}
                  >
                    {step.short}
                  </p>

                  {isActive ? (
                    <>
                      <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-muted-foreground">{step.body}</p>
                      <Button asChild size="sm" className="mt-3 rounded-[3px]">
                        <Link to={step.action.to}>
                          {step.action.label} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <p className="border-t border-border px-5 py-2.5 text-[11px] text-muted-foreground">
        One step at a time. This guide steps forward on its own as you work, and disappears once all four are done.
      </p>
    </section>
  );
}