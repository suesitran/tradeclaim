import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, Mic, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import CaptureSheet from '@/components/capture/CaptureSheet';
import VoiceSheet from '@/components/capture/VoiceSheet';
import { STAGE_LABELS } from '@/lib/format';

export default function Capture() {
  const { jobId } = useParams();
  const { toast } = useToast();
  const [job, setJob] = useState(null);
  const [lines, setLines] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [activeLine, setActiveLine] = useState(null);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [jobRecord, linePage, evidencePage] = await Promise.all([
      base44.entities.Job.get(jobId).catch(() => null),
      base44.entities.ScopeLine.filter({ job_id: jobId }, { limit: 200, sort: 'sort_order' }),
      base44.entities.Evidence.filter({ job_id: jobId }, { limit: 400, sort: '-captured_at' }),
    ]);
    setJob(jobRecord);
    setLines((linePage && linePage.items) || []);
    setEvidence((evidencePage && evidencePage.items) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [jobId]);

  const counts = useMemo(() => {
    const map = {};
    evidence.forEach((item) => {
      map[item.scope_line_id] = map[item.scope_line_id] || { before: 0, finish: 0, clear: 0, total: 0 };
      map[item.scope_line_id][item.stage] += 1;
      map[item.scope_line_id].total += 1;
    });
    return map;
  }, [evidence]);

  if (loading) return <p className="py-16 text-center text-sm text-muted-foreground">Loading job</p>;
  if (!job) return <p className="py-16 text-center text-sm text-muted-foreground">This job could not be found.</p>;

  return (
    <div className="space-y-5">
      <Link to={`/jobs/${job.id}`} className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> {job.name}
      </Link>

      <div>
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {job.job_number ? `Job ${job.job_number}` : 'Job'}  |  On site
        </p>
        <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight">Capture</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">Tap a scope line, take the photo, pick the stage. Twenty seconds a line.</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setVoiceOpen(true)}
          className="flex items-center justify-center gap-2 rounded-[4px] bg-accent px-4 py-4 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          <Mic className="h-5 w-5" /> Dictate progress
        </button>
        <Link
          to={`/jobs/${job.id}/variation`}
          className="flex items-center justify-center gap-2 rounded-[4px] border border-border bg-card px-4 py-4 text-sm font-medium transition-colors hover:bg-secondary"
        >
          <Plus className="h-5 w-5" /> Record a variation
        </Link>
      </div>

      <div className="overflow-hidden rounded-[4px] border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="font-heading text-sm font-semibold">Scope lines</h2>
        </div>
        {lines.length ? (
          <div className="divide-y divide-border">
            {lines.map((line) => {
              const count = counts[line.id] || { before: 0, finish: 0, clear: 0, total: 0 };
              return (
                <button
                  key={line.id}
                  type="button"
                  onClick={() => setActiveLine(line)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-secondary/60"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{line.area}</p>
                    <p className="truncate text-[13px] leading-snug">{line.description}</p>
                    <p className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-muted-foreground">
                      <span className="rounded-full border border-[#DCD7CB] bg-[#EDEBE4] px-1.5 py-0.5">B {count.before}</span>
                      <span className="rounded-full border border-[#C6DFCE] bg-[#E4F0E8] px-1.5 py-0.5">F {count.finish}</span>
                      <span className="rounded-full border border-[#CBDCEB] bg-[#E7EEF5] px-1.5 py-0.5">C {count.clear}</span>
                    </p>
                  </div>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Camera className="h-5 w-5" />
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="px-4 py-8 text-sm text-muted-foreground">This job has no scope lines yet.</p>
        )}
      </div>

      <p className="pb-2 text-center text-[11px] text-muted-foreground">
        Stages: {STAGE_LABELS.before}, {STAGE_LABELS.finish}, {STAGE_LABELS.clear}.
      </p>

      <CaptureSheet
        open={Boolean(activeLine)}
        onOpenChange={(next) => {
          if (!next) setActiveLine(null);
        }}
        jobId={job.id}
        line={activeLine}
        onSaved={() => {
          toast({ title: 'Photo saved to the scope line' });
          load();
        }}
      />

      <VoiceSheet
        open={voiceOpen}
        onOpenChange={setVoiceOpen}
        jobId={job.id}
        onApplied={(count) => {
          toast({ title: `${count} scope lines updated from your note` });
          load();
        }}
      />
    </div>
  );
}