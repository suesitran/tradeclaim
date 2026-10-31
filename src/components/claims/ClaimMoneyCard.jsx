import { formatAud } from '@/lib/format';
import { feeFor, recoveredFor } from '@/lib/claims';

export default function ClaimMoneyCard({ claim }) {
  const rows = [
    { label: 'Claimed, ex GST', value: claim.amount_claimed_ex_gst },
    { label: 'GST at 10%', value: claim.gst },
    { label: 'Claimed, inc GST', value: claim.amount_claimed_inc_gst, strong: true },
    { label: 'Previously paid', value: claim.previously_paid },
    { label: 'Scheduled, ex GST', value: claim.scheduled_amount },
    { label: 'Paid, ex GST', value: claim.paid_amount },
  ];

  const recovered = recoveredFor(claim);
  const fee = claim.fee_amount != null && claim.paid_at ? Number(claim.fee_amount) : feeFor(claim);

  return (
    <div className="rounded-[4px] border border-border bg-card">
      <div className="border-b border-border px-5 py-3">
        <h2 className="font-heading text-sm font-semibold">Money</h2>
        <p className="mt-0.5 text-[11px] text-muted-foreground">Australian dollars, GST at 10%.</p>
      </div>
      <dl className="divide-y divide-border">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between px-5 py-2.5 text-[12px]">
            <dt className={row.strong ? 'font-medium' : 'text-muted-foreground'}>{row.label}</dt>
            <dd className={`num ${row.strong ? 'font-medium' : ''}`}>{formatAud(row.value)}</dd>
          </div>
        ))}
      </dl>
      <div className="border-t border-border px-5 py-3">
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-muted-foreground">Recovered after escalation</span>
          <span className="num">{formatAud(recovered)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[12px]">
          <span className="text-muted-foreground">Fee, 3% capped at A$300</span>
          <span className="num">{formatAud(fee)}</span>
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
          A claim paid in full from a schedule, with no escalation, costs nothing.
        </p>
      </div>
    </div>
  );
}