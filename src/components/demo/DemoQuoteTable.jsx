import React from 'react';
import { formatAud } from '@/lib/format';

export default function DemoQuoteTable({ lines, total }) {
  return (
    <div className="overflow-x-auto rounded-[3px] border border-border bg-card">
      <table className="w-full min-w-[520px] text-left text-[13px]">
        <thead className="border-b border-border bg-secondary/50">
          <tr className="num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <th className="px-3 py-2 font-medium">Area</th>
            <th className="px-3 py-2 font-medium">Scope line</th>
            <th className="px-3 py-2 text-right font-medium">Qty</th>
            <th className="px-3 py-2 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.description} className="border-b border-border/70 last:border-0">
              <td className="px-3 py-2.5 text-muted-foreground">{line.area}</td>
              <td className="px-3 py-2.5">{line.description}</td>
              <td className="num px-3 py-2.5 text-right text-muted-foreground">
                {line.quantity} {line.unit}
              </td>
              <td className="num px-3 py-2.5 text-right">{formatAud(line.amount)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t border-border bg-secondary/40">
          <tr>
            <td className="px-3 py-2.5 text-[12px] text-muted-foreground" colSpan={3}>
              Contract sum, ex GST
            </td>
            <td className="num px-3 py-2.5 text-right font-medium">{formatAud(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}