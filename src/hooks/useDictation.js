import { useEffect, useRef, useState } from 'react';
import { speechLanguage, useLanguage } from '@/lib/i18n';

// Dictation into a text box using the browser's own speech recognition. Free,
// no account, works on phone browsers. Returns null for supported when the
// browser cannot do it, so the mic button can hide itself.
export default function useDictation(onText) {
  const { language } = useLanguage();
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);
  const onTextRef = useRef(onText);

  useEffect(() => {
    onTextRef.current = onText;
  });

  const Recognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
  const supported = Boolean(Recognition);

  const stop = () => {
    try {
      recognitionRef.current && recognitionRef.current.stop();
    } catch {
      // already stopped
    }
    setListening(false);
  };

  useEffect(() => stop, []);

  const start = () => {
    if (!Recognition) return;
    stop();
    setError('');
    const recognition = new Recognition();
    recognition.lang = speechLanguage(language);
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      let spoken = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        spoken += `${event.results[i][0].transcript} `;
      }
      if (spoken.trim()) onTextRef.current(spoken.trim());
    };
    recognition.onerror = (event) => {
      setListening(false);
      setError(event && event.error === 'not-allowed' ? 'blocked' : 'failed');
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  return { supported, listening, error, start, stop, toggle: () => (listening ? stop() : start()) };
}
