import { useEffect, useRef, useState } from 'react';
import { Loader2, Mic, MicOff, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';

export default function VoiceSheet({ open, onOpenChange, jobId, onApplied }) {
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [updates, setUpdates] = useState(null);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setText('');
      setUpdates(null);
      setError('');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // recognition already stopped
        }
      }
      setListening(false);
    }
  }, [open]);

  const toggleListening = () => {
    const Recognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
    if (!Recognition) {
      setError('This browser cannot dictate. Type the note instead.');
      return;
    }
    if (listening) {
      recognitionRef.current && recognitionRef.current.stop();
      setListening(false);
      return;
    }
    const recognition = new Recognition();
    recognition.lang = 'en-AU';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      let spoken = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        spoken += `${event.results[i][0].transcript} `;
      }
      setText((current) => `${current}${spoken}`.trim());
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const handleAnalyse = async () => {
    if (!text.trim()) return;
    setBusy(true);
    setError('');
    setUpdates(null);
    try {
      const response = await base44.functions.invoke('structureVoiceLog', { job_id: jobId, transcript: text });
      if (response.data && response.data.error) {
        setError(response.data.error);
      } else {
        setUpdates(response.data.updates || []);
        if (!(response.data.updates || []).length) setError('Nothing in the note matched a scope line. Try naming the area and what is finished.');
      }
    } catch (err) {
      setError(err.message || 'The note could not be read');
    } finally {
      setBusy(false);
    }
  };

  const handleApply = async () => {
    if (!updates || !updates.length) return;
    setApplying(true);
    try {
      await base44.entities.ScopeLine.bulkUpdate(
        updates.map((update) => ({ id: update.scope_line_id, percent_complete_to_date: update.percent_complete })),
      );
      onApplied(updates.length);
      onOpenChange(false);
    } finally {
      setApplying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">Dictate the progress</DialogTitle>
          <DialogDescription>Say what is finished or under way. The note is matched to the quoted scope lines.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <button
            type="button"
            onClick={toggleListening}
            className={`flex w-full items-center justify-center gap-2 rounded-[4px] border px-4 py-4 text-sm font-medium transition-colors ${
              listening ? 'border-accent bg-accent text-accent-foreground' : 'border-border bg-secondary text-foreground hover:border-[#C9C2B4]'
            }`}
          >
            {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {listening ? 'Stop dictating' : 'Start dictating'}
          </button>

          <Textarea
            rows={5}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="L1 corridors are finished, ceilings done, doors and frames still to go. Stair 1 walls under way about half."
          />

          {error ? <p className="text-[12px] text-destructive">{error}</p> : null}

          {updates ? (
            <div className="space-y-1.5 rounded-[4px] border border-border bg-secondary px-3 py-2.5">
              {updates.map((update) => (
                <div key={update.scope_line_id} className="flex items-start justify-between gap-3 text-[12px]">
                  <span className="flex-1 leading-snug">{update.label}</span>
                  <span className="num shrink-0 text-muted-foreground">
                    {update.previous_percent}% to {update.percent_complete}%
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={handleAnalyse} disabled={busy || !text.trim()}>
            {busy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Reading the note
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Structure with AI
              </>
            )}
          </Button>
          <Button onClick={handleApply} disabled={!updates || !updates.length || applying} className="bg-primary">
            {applying ? 'Applying' : 'Apply progress'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}