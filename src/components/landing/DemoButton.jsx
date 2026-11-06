import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { demoEnabled } from '@/lib/demoAccount';
import { startDemo } from '@/lib/demoLogin';
import { useT } from '@/lib/i18n';

// The "try it" button. With a demo account set up it signs the visitor straight
// into the app; without one it opens the walkthrough page.
export default function DemoButton({ className = 'btn-yellow', label = 'Try it, no sign-up' }) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!demoEnabled) {
    return (
      <Link to="/demo" className={className}>
        {t(label)}
        <ArrowRight className="h-5 w-5 rtl:rotate-180" />
      </Link>
    );
  }

  const handleClick = async () => {
    setBusy(true);
    setError('');
    try {
      await startDemo();
    } catch (err) {
      setError(err.message || t('The demo could not be opened'));
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex flex-col gap-2">
      <button type="button" onClick={handleClick} disabled={busy} className={className}>
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
        {busy ? t('Opening the demo') : t(label)}
        {busy ? null : <ArrowRight className="h-5 w-5 rtl:rotate-180" />}
      </button>
      {error ? <span className="text-[14px] text-destructive">{error}</span> : null}
    </span>
  );
}
