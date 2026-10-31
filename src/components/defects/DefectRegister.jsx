import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatAud } from '@/lib/format';
import DefectRow from '@/components/defects/DefectRow';
import DefectDialog from '@/components/defects/DefectDialog';
import CallBackDialog from '@/components/defects/CallBackDialog';

export default function DefectRegister({ job, lines = [], defects = [], visits = [], onChanged, embedded = false }) {
  const [raiseOpen, setRaiseOpen] = useState(false);
  const [callBackFor, setCallBackFor] = useState(null);

  const open = defects.filter((defect) => defect.status === 'open').length;
  const absorbed = visits.reduce((sum, visit) => sum + Number(visit.cost || 0), 0);

  return (
    <section
      className={
        embedded
          ? 'overflow-hidden rounded-[6px] border border-[#DED6C7] bg-white shadow-[0_10px_30px_-18px_rgba(60,40,15,0.35)]'
          : 'overflow-hidden rounded-[4px] border border-border bg-card'
      }
    >
      <div
        className={
          embedded
            ? 'flex flex-wrap items-center justify-between gap-3 border-b border-[#DED6C7] bg-[#F6F1E6] px-5 py-[13px]'
            : 'flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3'
        }
      >
        <div>
          {embedded ? null : <h2 className="font-heading text-sm font-semibold">Defect register</h2>}
          <p className={embedded ? 'text-[11px] text-[#6b6457]' : 'mt-0.5 text-[11px] text-muted-foreground'}>
            {defects.length} logged, {open} still open
            {absorbed ? `, ${formatAud(absorbed)} of call-back labour absorbed` : ''}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setRaiseOpen(true)}>
          <Plus className="mr-2 h-3.5 w-3.5" /> Raise a defect
        </Button>
      </div>

      {defects.length ? (
        <div className="divide-y divide-border">
          {defects.map((defect) => (
            <DefectRow
              key={defect.id}
              defect={defect}
              line={lines.find((line) => line.id === defect.scope_line_id)}
              visits={visits.filter((visit) => visit.defect_id === defect.id)}
              onLogCallBack={() => setCallBackFor(defect)}
              onChanged={onChanged}
            />
          ))}
        </div>
      ) : (
        <p className="px-5 py-8 text-sm text-muted-foreground">
          No defects logged. When the builder sends a defect notice, log it here the day it arrives with what was asked and whether it is your workmanship.
        </p>
      )}

      <DefectDialog open={raiseOpen} onOpenChange={setRaiseOpen} job={job} lines={lines} onSaved={onChanged} />
      <CallBackDialog
        open={Boolean(callBackFor)}
        onOpenChange={(next) => {
          if (!next) setCallBackFor(null);
        }}
        defect={callBackFor}
        job={job}
        onSaved={onChanged}
      />
    </section>
  );
}