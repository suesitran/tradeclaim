import { formatDate } from '@/lib/format';

export default function ClaimClock({ claim, status }) {
  const rows = [
    { label: 'Served', value: claim.served_at },
    { label: 'Payment schedule due', value: claim.schedule_due_at },
    { label: 'Schedule received', value: claim.schedule_received_at },
    { label: 'Apply for adjudication by', value: claim.apply_by },
    { label: 'Paid', value: claim.paid_at },
  ];

  return (
    <div className="rounded-[4px] border border-border bg-card">
      <div className="border-b border-border px-5 py-3">
        <h2 className="font-heading text-sm font-semibold">The clock</h2>
        <p className="mt-0.5 text-[11px] text-muted-foreground">10 business days for a schedule, then 10 business days to apply.</p>
      </div>
      <dl className="divide-y divide-border">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between px-5 py-2.5 text-[12px]">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className={`num ${row.value ? 'text-foreground' : 'text-muted-foreground'}`}>{row.value ? formatDate(row.value) : 'Not set'}</dd>
          </div>
        ))}
      </dl>
      {status === 'ignored' ? (
        <p className="border-t border-border px-5 py-3 text-[11px] text-[#8C2A1E]">
          The schedule date has passed with no schedule on record. The notice of intention gives the builder 2 business days.
        </p>
      ) : null}
      {status === 'scheduled_short' ? (
        <p className="border-t border-border px-5 py-3 text-[11px] text-[#8A4B12]">
          Schedule short of the claim. The builder may only argue the reasons it put in its schedule.
        </p>
      ) : null}
    </div>
  );
}