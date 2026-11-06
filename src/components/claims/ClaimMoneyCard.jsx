import { formatAud } from '@/lib/format';
import { feeFor, recoveredFor } from '@/lib/claims';

export default function ClaimMoneyCard({ claim }) {
  const rows = [
    { label: 'Claimed, ex GST', value: claim.amount_claimed_ex_gst },
    { label: 'GST', value: claim.gst },
    { label: 'Claimed, inc GST', value: claim.amount_claimed_inc_gst, strong: true },
    { label: 'Paid on earlier claims', value: claim.previously_paid },
    { label: 'Builder says it will pay', value: claim.scheduled_amount },
    { label: 'Paid on this claim', value: claim.paid_amount },
  ];

  const recovered = recoveredFor(claim);
  const fee = claim.fee_amount != null && claim.paid_at ? Number(claim.fee_amount) : feeFor(claim);

  return (
    <div className="sheet">
      <div className="border-b-2 border-foreground px-4 py-3">
        <h2 className="text-[20px] font-extrabold">Money</h2>
      </div>
      <dl>
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 border-b border-foreground/30 px-4 py-2.5 text-[15px]">
            <dt className={row.strong ? 'font-semibold' : ''}>{row.label}</dt>
            <dd className={`num ${row.strong ? 'font-semibold' : ''}`}>{formatAud(row.value)}</dd>
          </div>
        ))}
      </dl>
      <div className="border-t-2 border-foreground px-4 py-3">
        <div className="flex items-center justify-between text-[15px]">
          <span>Got back by escalating</span>
          <span className="num font-semibold">{formatAud(recovered)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[15px]">
          <span>Our fee</span>
          <span className="num font-semibold">{formatAud(fee)}</span>
        </div>
        <p className="legal mt-2">3% of what escalating got back, capped at A$300. Nothing if the builder paid without a fight.</p>
      </div>
    </div>
  );
}
