import { useState } from 'react';
import { ChevronDown, ChevronUp, Wrench } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import useSignedUrls from '@/hooks/useSignedUrls';
import { formatAud, formatDate } from '@/lib/format';
import { todayYmd } from '@/lib/clock';
import {
  DEFECT_STATUS_LABELS,
  DEFECT_STATUS_TONES,
  LIABILITY_LABELS,
  LIABILITY_TONES,
  OUTCOME_LABELS,
} from '@/lib/defects';

export default function DefectRow({ defect, line, visits = [], onLogCallBack, onChanged }) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const urls = useSignedUrls([defect.photo_uri, ...visits.map((visit) => visit.photo_uri)]);
  const labour = visits.reduce((sum, visit) => sum + Number(visit.cost || 0), 0);

  const markRectified = async () => {
    setSaving(true);
    try {
      await base44.entities.Defect.update(defect.id, { status: 'rectified', rectified_at: todayYmd() });
      onChanged();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-5 py-3.5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${DEFECT_STATUS_TONES[defect.status] || DEFECT_STATUS_TONES.open}`}>
              {DEFECT_STATUS_LABELS[defect.status] || defect.status}
            </span>
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${LIABILITY_TONES[defect.liability] || LIABILITY_TONES.unclear}`}>
              {LIABILITY_LABELS[defect.liability] || 'Not clear'}
            </span>
            {defect.due_at && defect.status === 'open' ? (
              <span className="text-[10px] text-muted-foreground">Wanted by {formatDate(defect.due_at)}</span>
            ) : null}
          </div>
          <p className="mt-1.5 text-[13px] leading-snug">{defect.description}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {[defect.area, line ? line.description : null, defect.raised_by ? `Raised by ${defect.raised_by}` : null, defect.raised_at ? formatDate(defect.raised_at) : null]
              .filter(Boolean)
              .join('  |  ')}
          </p>
          {defect.rectified_at ? (
            <p className="mt-0.5 text-[11px] text-muted-foreground">Rectified {formatDate(defect.rectified_at)}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="inline-flex items-center gap-1.5 rounded-[3px] border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-accent hover:text-accent"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {visits.length} call-back{visits.length === 1 ? '' : 's'}
            {labour ? `, ${formatAud(labour)} absorbed` : ''}
          </button>
          <Button variant="outline" size="sm" onClick={onLogCallBack}>
            <Wrench className="mr-2 h-3.5 w-3.5" /> Log call-back
          </Button>
          {defect.status === 'open' ? (
            <Button variant="ghost" size="sm" onClick={markRectified} disabled={saving}>
              {saving ? 'Saving' : 'Mark rectified'}
            </Button>
          ) : null}
        </div>
      </div>

      {expanded ? (
        <div className="mt-3 space-y-2 rounded-[3px] border border-border bg-secondary/60 px-3 py-2.5">
          {defect.photo_uri && urls[defect.photo_uri] ? (
            <img src={urls[defect.photo_uri]} alt="Defect photo" className="h-24 w-32 rounded-[3px] object-cover" />
          ) : null}
          {visits.length ? (
            visits.map((visit) => (
              <div key={visit.id} className="flex items-start gap-3 border-b border-border pb-2 last:border-b-0 last:pb-0">
                {visit.photo_uri && urls[visit.photo_uri] ? (
                  <img src={urls[visit.photo_uri]} alt="Repair photo" className="h-14 w-20 shrink-0 rounded-[3px] object-cover" />
                ) : null}
                <div className="min-w-0">
                  <p className="text-[12px] leading-snug">{visit.work_done}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {[
                      formatDate(visit.attended_at),
                      visit.attended_by,
                      visit.hours ? `${visit.hours} hours` : null,
                      visit.cost ? formatAud(visit.cost) : null,
                      OUTCOME_LABELS[visit.outcome] || visit.outcome,
                    ]
                      .filter(Boolean)
                      .join('  |  ')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-[12px] text-muted-foreground">No call-backs logged yet.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}