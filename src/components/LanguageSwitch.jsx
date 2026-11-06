import { Languages } from 'lucide-react';
import { LANGUAGES, useLanguage } from '@/lib/i18n';

// A small select in the header. Each language is shown in its own script so a
// reader who cannot read English can still find theirs.
export default function LanguageSwitch({ className = '' }) {
  const { language, setLanguage } = useLanguage();
  return (
    <label className={`btn-small relative cursor-pointer !px-2 ${className}`} title="Language">
      <Languages className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">Language</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        className="max-w-[88px] cursor-pointer appearance-none bg-transparent pr-1 font-heading text-[14px] font-bold uppercase tracking-[0.02em] text-inherit focus:outline-none"
        aria-label="Language"
      >
        {LANGUAGES.map((item) => (
          <option key={item.code} value={item.code} className="text-foreground">
            {item.name}
          </option>
        ))}
      </select>
    </label>
  );
}
