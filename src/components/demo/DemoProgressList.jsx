import React from 'react';
import { Slider } from '@/components/ui/slider';

export default function DemoProgressList({ lines, percents, onChange }) {
  return (
    <div className="divide-y divide-border rounded-[3px] border border-border bg-card">
      {lines.map((line, index) => (
        <div key={line.description} className="px-3 py-3">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[13px]">{line.description}</p>
            <span className="num shrink-0 text-[12px] text-accent">{percents[index]}%</span>
          </div>
          <p className="num mt-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{line.area}</p>
          <Slider
            className="mt-3"
            value={[percents[index]]}
            onValueChange={(value) => onChange(index, value[0])}
            max={100}
            step={5}
            aria-label={`Progress on ${line.description}`}
          />
        </div>
      ))}
    </div>
  );
}