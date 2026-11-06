import { useState } from 'react';
import { ChevronDown, ChevronUp, Wrench } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import useSignedUrls from '@/hooks/useSignedUrls';
import { formatAud, formatDate } from '@/lib/format';
import { todayYmd } from '@/lib/clock';
import { useT } from '@/lib/i18n';
import { DEFECT_STATUS_LABELS, LIABILITY_LABELS, OUTCOME_LABELS } from '@/lib/defects';

const STATUS_TONE = { open: 'bg-accent', rectified: 'bg-[#1F7A3F] text-white border-[#1F7A3F]', disputed: 'bg-destructive text-white border-destructive' };

export default function DefectRow({ defect, line, visits = [], onLogCallBack, onChanged }) {
  const t = useT();
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
    <div className="border-b-2 border-foreground px-4 py-4 last:border-b-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`tag ${STATUS_TONE[defect.status] || STATUS_TONE.open}`}>{t(DEFECT_STATUS_LABELS[defect.status] || defect.status)}</span>
            <span className="tag bg-secondary">{t(LIABILITY_LABELS[defect.liability] || 'Not clear')}</span>
            {defect.due_at && defect.status === 'open' ? (
              <span className="text-[13px] text-muted-foreground">{t('Wanted by {date}', { date: formatDate(defect.due_at) })}</span>
            ) : null}
          </div>
          <p className="mt-2 text-[16px] leading-snug">{defect.description}</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {[defect.area, line ? line.description : null, defect.raised_by ? t('Raised by {name}', { name: defect.raised_by }) : null, defect.raised_at ? formatDate(defect.raised_at) : null]
              .filter(Boolean)
              .join('  |  ')}
          </p>
          {defect.rectified_at ? <p className="mt-0.5 text-[13px] text-muted-foreground">{t('Fixed {date}', { date: formatDate(defect.rectified_at) })}</p> : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setExpanded((current) => !current)} className="btn-small">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {t('{count} visits', { count: visits.length })}
            {labour ? `, ${formatAud(labour)}` : ''}
          </button>
          <button type="button" className="btn-small" onClick={onLogCallBack}>
            <Wrench className="h-4 w-4" /> {t('Record a fix visit')}
          </button>
          {defect.status === 'open' ? (
            <button type="button" className="btn-small !bg-foreground !text-background" onClick={markRectified} disabled={saving}>
              {saving ? t('Saving') : t('Mark fixed')}
            </button>
          ) : null}
        </div>
      </div>

      {expanded ? (
        <div className="mt-3 space-y-2 border-2 border-foreground bg-secondary px-3 py-2.5">
          {defect.photo_uri && urls[defect.photo_uri] ? <img src={urls[defect.photo_uri]} alt={t('Defect photo')} className="h-24 w-32 object-cover" /> : null}
          {visits.length ? (
            visits.map((visit) => (
              <div key={visit.id} className="flex items-start gap-3 border-b border-foreground/30 pb-2 last:border-b-0 last:pb-0">
                {visit.photo_uri && urls[visit.photo_uri] ? <img src={urls[visit.photo_uri]} alt={t('Repair photo')} className="h-14 w-20 shrink-0 object-cover" /> : null}
                <div className="min-w-0">
                  <p className="text-[15px] leading-snug">{visit.work_done}</p>
                  <p className="mt-0.5 text-[13px] text-muted-foreground">
                    {[
                      formatDate(visit.attended_at),
                      visit.attended_by,
                      visit.hours ? t('{count} hours', { count: visit.hours }) : null,
                      visit.cost ? formatAud(visit.cost) : null,
                      t(OUTCOME_LABELS[visit.outcome] || visit.outcome),
                    ]
                      .filter(Boolean)
                      .join('  |  ')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-[15px] text-muted-foreground">{t('No visits yet.')}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
