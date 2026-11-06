import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { jurisdictionFor } from '@/lib/jurisdictions';

export default function useHolidays(state) {
  const code = jurisdictionFor(state).code;
  const [holidays, setHolidays] = useState(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    setReady(false);
    base44.entities.PublicHoliday.filter({ state: code }, 'date', 500)
      .then((page) => {
        if (!alive) return;
        setHolidays(new Set((page || []).map((holiday) => holiday.date)));
      })
      .finally(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, [code]);

  return { holidays, ready };
}