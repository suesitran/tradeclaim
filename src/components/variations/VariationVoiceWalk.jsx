import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STEPS = [
  { key: 'instructed_by', prompt: 'Who instructed it?', example: 'Site manager, Dan Petrov' },
  { key: 'description', prompt: 'What is the work?', example: 'Fire stair walls, extra coat' },
  { key: 'estimated_amount', prompt: 'What is the estimated amount, ex GST?', example: 'Eighteen hundred and fifty' },
];

export default function VariationVoiceWalk({ onField }) {
  const [step, setStep] = useState(0);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

  useEffect(
    () => () => {
      try {
        recognitionRef.current && recognitionRef.current.stop();
      } catch {
        // already stopped
      }
    },
    [],
  );

  const stop = () => {
    try {
      recognitionRef.current && recognitionRef.current.stop();
    } catch {
      // already stopped
    }
    setListening(false);
  };

  const current = STEPS[step];

  const listen = () => {
    const Recognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
    if (!Recognition) {
      setError('This browser cannot dictate. Type the answers instead.');
      return;
    }
    stop();
    setError('');
    setHeard('');
    const recognition = new Recognition();
    recognition.lang = 'en-AU';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const said = String(event.results[0][0].transcript || '').trim();
      if (!said) return;
      setHeard(said);
      if (current.key === 'estimated_amount') {
        const digits = said.replace(/[^0-9.]/g, '');
        if (!digits) {
          setError('Say the amount as a number, for example eighteen hundred and fifty.');
          return;
        }
        onField('estimated_amount', String(Math.round(Number(digits))));
      } else {
        onField(current.key, said.replace(/\s+/g, ' '));
      }
      setStep((index) => Math.min(index + 1, STEPS.length));
    };
    recognition.onerror = () => {
      setListening(false);
      setError('That was not picked up. Try again, or type it.');
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const done = step >= STEPS.length;

  return (
    <div className="rounded-[4px] border border-border bg-secondary/50 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {done ? 'All three answered' : `One field at a time, ${step + 1} of ${STEPS.length}`}
        </p>
        {done ? (
          <Button variant="ghost" size="sm" onClick={() => { setStep(0); setHeard(''); setError(''); }}>
            Start again
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={listening ? stop : listen}>
            {listening ? <MicOff className="mr-1.5 h-3.5 w-3.5" /> : <Mic className="mr-1.5 h-3.5 w-3.5" />}
            {listening ? 'Stop' : 'Speak the answer'}
          </Button>
        )}
      </div>

      <p className="mt-2 text-[13px] leading-snug">
        {done ? 'Check the three answers below, then send the notice.' : current.prompt}
      </p>
      {!done ? <p className="mt-0.5 text-[11px] text-muted-foreground">For example: {current.example}</p> : null}
      {heard ? <p className="num mt-1 text-[11px] text-muted-foreground">Heard: {heard}</p> : null}
      {error ? <p className="mt-1 text-[11px] text-destructive">{error}</p> : null}
    </div>
  );
}