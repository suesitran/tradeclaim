import React from 'react';
import { Slider } from '@/components/ui/slider';
import { useT } from '@/lib/i18n';

export default function DemoProgressList({ lines, percents, onChange }) {
  const t = useT();
  return (
    <div className="sheet">
      {lines.map((line, index) => (
        <div key={line.description} className="border-b-2 border-foreground px-4 py-3 last:border-b-0">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[16px]">{line.description}</p>
            <span className="num shrink-0 font-heading text-[22px] font-extrabold">{percents[index]}%</span>
          </div>
          <p className="eyebrow mt-0.5">{line.area}</p>
          <Slider
            className="mt-3"
            value={[percents[index]]}
            onValueChange={(value) => onChange(index, value[0])}
            max={100}
            step={5}
            aria-label={t('Progress on {line}', { line: line.description })}
          />
        </div>
      ))}
    </div>
  );
}
