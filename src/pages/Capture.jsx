import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, Mic, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import CaptureSheet from '@/components/capture/CaptureSheet';
import VoiceSheet from '@/components/capture/VoiceSheet';

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
      base44.entities.ScopeLine.filter({ job_id: jobId }, 'sort_order', 200),
      base44.entities.Evidence.filter({ job_id: jobId }, '-captured_at', 400),
    ]);
    setJob(jobRecord);
    setLines(linePage || []);
    setEvidence(evidencePage || []);
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

  if (loading) return <p className="py-16 text-center text-[16px] text-muted-foreground">Loading job</p>;
  if (!job) return <p className="py-16 text-center text-[16px] text-muted-foreground">This job could not be found.</p>;

  return (
    <div className="space-y-5">
      <Link to={`/jobs/${job.id}`} className="inline-flex items-center gap-1.5 font-heading text-[16px] font-bold uppercase tracking-[0.02em] hover:underline">
        <ArrowLeft className="h-4 w-4" /> {job.name}
      </Link>

      <div className="border-b-[3px] border-foreground pb-4">
        <p className="eyebrow">{job.job_number ? `Job ${job.job_number}` : 'Job'} | On site</p>
        <h1 className="mt-1 text-[40px] font-extrabold leading-none">Take photos</h1>
        <p className="mt-2 text-[16px] text-muted-foreground">Tap the line you worked on. Take the photo. Pick before, finish or clear.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={() => setVoiceOpen(true)} className="btn-yellow min-h-[56px]">
          <Mic className="h-5 w-5" /> Say what's done
        </button>
        <Link to={`/jobs/${job.id}/variation`} className="btn-line min-h-[56px]">
          <Plus className="h-5 w-5" /> Record extra work
        </Link>
      </div>

      <div className="sheet">
        <div className="sheet-head">
          <h2 className="text-[20px] font-extrabold">Your lines</h2>
          <span className="text-[14px] text-muted-foreground">{lines.length} on this job</span>
        </div>
        {lines.length ? (
          <div>
            {lines.map((line) => {
              const count = counts[line.id] || { before: 0, finish: 0, clear: 0, total: 0 };
              return (
                <button
                  key={line.id}
                  type="button"
                  onClick={() => setActiveLine(line)}
                  className="flex w-full items-center gap-3 border-b-2 border-foreground px-4 py-3.5 text-left transition-colors last:border-b-0 hover:bg-secondary"
                >
                  <div className="min-w-0 flex-1">
                    <p className="eyebrow">{line.area}</p>
                    <p className="text-[16px] leading-snug">{line.description}</p>
                    <p className="mt-1 flex flex-wrap gap-x-3 text-[13px]">
                      <span className={count.before ? 'font-semibold' : 'text-muted-foreground'}>Before <span className="num">{count.before}</span></span>
                      <span className={count.finish ? 'font-semibold' : 'text-muted-foreground'}>Finish <span className="num">{count.finish}</span></span>
                      <span className={count.clear ? 'font-semibold' : 'text-muted-foreground'}>Clear <span className="num">{count.clear}</span></span>
                    </p>
                  </div>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-foreground bg-accent text-foreground">
                    <Camera className="h-6 w-6" />
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="px-4 py-8 text-[16px] text-muted-foreground">This job has no lines yet.</p>
        )}
      </div>

      <CaptureSheet
        open={Boolean(activeLine)}
        onOpenChange={(next) => {
          if (!next) setActiveLine(null);
        }}
        jobId={job.id}
        line={activeLine}
        onSaved={() => {
          toast({ title: 'Photo saved' });
          load();
        }}
      />

      <VoiceSheet
        open={voiceOpen}
        onOpenChange={setVoiceOpen}
        jobId={job.id}
        onApplied={(count) => {
          toast({ title: `${count} lines updated` });
          load();
        }}
      />
    </div>
  );
}
