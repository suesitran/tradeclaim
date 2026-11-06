import { formatDate } from '@/lib/format';
import { jurisdictionFor } from '@/lib/jurisdictions';

// The dates that matter on a claim, in order. Plain labels; the Act's framing sits under the heading.
export default function ClaimClock({ claim, status, job }) {
  const jurisdiction = jurisdictionFor(job?.state);
  const rows = [
    { label: 'Sent to builder', value: claim.served_at },
    { label: 'Builder must reply by', value: claim.schedule_due_at, hot: status === 'served' },
    { label: 'Builder replied', value: claim.schedule_received_at },
    { label: 'Escalate by', value: claim.apply_by, hot: status === 'scheduled_short' },
    { label: 'Paid', value: claim.paid_at },
  ];

  return (
    <div className="sheet">
      <div className="border-b-2 border-foreground px-4 py-3">
        <h2 className="text-[20px] font-extrabold">The clock</h2>
        <p className="legal">
          {jurisdiction.scheduleDays} {jurisdiction.unit} for the builder's payment schedule, then {jurisdiction.applyDays} {jurisdiction.unit} to apply for adjudication, under the {jurisdiction.act}.
        </p>
      </div>
      <dl>
        {rows.map((row) => (
          <div key={row.label} className={`flex items-center justify-between gap-3 border-b border-foreground/30 px-4 py-2.5 last:border-b-0 ${row.hot ? 'bg-accent' : ''}`}>
            <dt className="text-[15px]">{row.label}</dt>
            <dd className={`num text-[15px] ${row.value ? 'font-semibold' : 'text-muted-foreground'}`}>{row.value ? formatDate(row.value) : 'Not yet'}</dd>
          </div>
        ))}
      </dl>
      {status === 'ignored' ? (
        <p className="border-t-2 border-foreground bg-destructive px-4 py-3 text-[14px] font-semibold text-white">
          The builder did not reply in time. Send the notice: they then get {jurisdiction.noticeDays} {jurisdiction.unit} before you can escalate.
        </p>
      ) : null}
      {status === 'scheduled_short' ? (
        <p className="border-t-2 border-foreground bg-accent px-4 py-3 text-[14px] font-semibold">
          The builder is paying less than you claimed. They can only argue the reasons they wrote down.
        </p>
      ) : null}
    </div>
  );
}
