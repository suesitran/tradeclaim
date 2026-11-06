import { useEffect, useRef, useState } from 'react';
import { Mic, Square } from 'lucide-react';
import { speechLanguage, useLanguage, useT } from '@/lib/i18n';

const STEPS = [
  { key: 'instructed_by', prompt: 'Who asked for it?', example: 'Site manager, Dan Petrov' },
  { key: 'description', prompt: 'What is the work?', example: 'Fire stair walls, extra coat' },
  { key: 'estimated_amount', prompt: 'Roughly how much, ex GST?', example: 'Eighteen hundred and fifty' },
];

// Three questions, one at a time, answered by talking. Each answer lands in
// the matching box below so it can still be fixed by typing.
export default function VariationVoiceWalk({ onField }) {
  const t = useT();
  const { language } = useLanguage();
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

  const Recognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
  if (!Recognition) return null;

  const current = STEPS[step];

  const listen = () => {
    stop();
    setError('');
    setHeard('');
    const recognition = new Recognition();
    recognition.lang = speechLanguage(language);
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const said = String(event.results[0][0].transcript || '').trim();
      if (!said) return;
      setHeard(said);
      if (current.key === 'estimated_amount') {
        const digits = said.replace(/[^0-9.]/g, '');
        if (!digits) {
          setError(t('Say the amount as a number, like eighteen fifty.'));
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
      setError(t('That was not picked up. Try again, or type it.'));
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const done = step >= STEPS.length;

  return (
    <div className="border-l-[6px] border-accent bg-secondary px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">{done ? t('All three answered') : t('Talk it in, {step} of {total}', { step: step + 1, total: STEPS.length })}</p>
        {done ? (
          <button type="button" className="btn-small" onClick={() => { setStep(0); setHeard(''); setError(''); }}>
            {t('Start again')}
          </button>
        ) : (
          <button type="button" className={`btn-small ${listening ? '!bg-accent' : ''}`} onClick={listening ? stop : listen}>
            {listening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {listening ? t('Listening, tap to stop') : t('Talk instead')}
          </button>
        )}
      </div>

      <p className="mt-2 text-[18px] font-semibold leading-snug">{done ? t('Check the three answers below, then send.') : t(current.prompt)}</p>
      {!done ? <p className="mt-0.5 text-[14px] text-muted-foreground">{t('For example')}: {t(current.example)}</p> : null}
      {heard ? <p className="mt-1 text-[14px] text-muted-foreground">{t('Heard')}: {heard}</p> : null}
      {error ? <p className="mt-1 text-[14px] text-destructive">{error}</p> : null}
    </div>
  );
}
