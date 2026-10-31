import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function useHolidays() {
  const [holidays, setHolidays] = useState(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    base44.entities.PublicHoliday.filter({}, { limit: 500, sort: 'date' })
      .then((page) => {
        if (!alive) return;
        setHolidays(new Set(((page && page.items) || []).map((holiday) => holiday.date)));
      })
      .finally(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { holidays, ready };
}