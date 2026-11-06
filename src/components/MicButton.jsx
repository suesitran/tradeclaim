import { Mic, Square } from 'lucide-react';
import useDictation from '@/hooks/useDictation';
import { useT } from '@/lib/i18n';

// A mic next to a text box. Tap, talk, and the words are added to the box.
// Hidden on browsers that cannot dictate, so nothing is promised that fails.
export default function MicButton({ onText, className = '' }) {
  const t = useT();
  const { supported, listening, error, toggle } = useDictation(onText);
  if (!supported) return null;

  const message = error === 'blocked' ? t('Allow the microphone for this site, then try again.') : error ? t('That was not picked up. Try again.') : '';

  return (
    <span className={`inline-flex flex-col items-start gap-1 ${className}`}>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={listening}
        className={`inline-flex min-h-[44px] items-center gap-2 border-2 border-foreground px-3 font-heading text-[15px] font-bold uppercase tracking-[0.02em] transition-colors ${
          listening ? 'bg-accent text-foreground' : 'bg-card text-foreground hover:bg-foreground hover:text-background'
        }`}
      >
        {listening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        {listening ? t('Listening, tap to stop') : t('Talk instead')}
      </button>
      {message ? <span className="text-[13px] text-destructive">{message}</span> : null}
    </span>
  );
}
