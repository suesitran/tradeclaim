import { Info } from 'lucide-react';

export default function AppPricingNote() {
  return (
    <div className="border-b border-border bg-secondary/70">
      <p className="mx-auto flex w-full max-w-6xl items-start gap-2 px-4 py-2 text-[11.5px] leading-relaxed text-muted-foreground sm:px-6">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
        <span>
          <span className="font-medium text-foreground">Pricing:</span> free for quotes, evidence, claims and notices. A fee of 3% applies only when escalation recovers more than the builder scheduled, capped at A$300 per claim. Nothing is charged on the scheduled amount.
        </span>
      </p>
    </div>
  );
}