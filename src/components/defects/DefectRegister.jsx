import { useState } from 'react';
import { Plus } from 'lucide-react';
import { formatAud } from '@/lib/format';
import { useT } from '@/lib/i18n';
import DefectRow from '@/components/defects/DefectRow';
import DefectDialog from '@/components/defects/DefectDialog';
import CallBackDialog from '@/components/defects/CallBackDialog';

export default function DefectRegister({ job, lines = [], defects = [], visits = [], onChanged }) {
  const t = useT();
  const [raiseOpen, setRaiseOpen] = useState(false);
  const [callBackFor, setCallBackFor] = useState(null);

  const open = defects.filter((defect) => defect.status === 'open').length;
  const absorbed = visits.reduce((sum, visit) => sum + Number(visit.cost || 0), 0);

  return (
    <section className="sheet">
      <div className="sheet-head">
        <p className="text-[14px] text-muted-foreground">
          {t('{count} logged, {open} still open', { count: defects.length, open })}
          {absorbed ? `, ${t('{amount} of your time spent fixing', { amount: formatAud(absorbed) })}` : ''}
        </p>
        <button type="button" className="btn-small" onClick={() => setRaiseOpen(true)}>
          <Plus className="h-4 w-4" /> {t('Add a defect')}
        </button>
      </div>

      {defects.length ? (
        <div>
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
        <p className="px-4 py-6 text-[16px] text-muted-foreground">
          {t('None yet. When the builder sends a defect notice, add it here the same day.')}
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
