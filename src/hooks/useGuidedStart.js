import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { TUTORIAL_HIDDEN_KEY, tutorialState } from '@/lib/tutorial';

// Reads just enough to know which of the four steps is next, so the guided
// start can follow the user onto every screen inside the app.
export default function useGuidedStart() {
  const [jobs, setJobs] = useState([]);
  const [claims, setClaims] = useState([]);
  const [hasEvidence, setHasEvidence] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [hidden, setHidden] = useState(
    () => sessionStorage.getItem(TUTORIAL_HIDDEN_KEY) === '1',
  );

  useEffect(() => {
    let alive = true;
    Promise.all([
      base44.entities.Job.filter({}, { limit: 50, sort: 'created_date' }),
      base44.entities.Claim.filter({}, { limit: 200, sort: '-created_date' }),
      base44.entities.Evidence.filter({}, { limit: 1 }),
    ])
      .then(([jobPage, claimPage, evidencePage]) => {
        if (!alive) return;
        setJobs((jobPage && jobPage.items) || []);
        setClaims((claimPage && claimPage.items) || []);
        setHasEvidence(Boolean(evidencePage && evidencePage.items && evidencePage.items.length));
        setLoaded(true);
      })
      .catch(() => setLoaded(false));
    return () => {
      alive = false;
    };
  }, []);

  const hide = useCallback(() => {
    sessionStorage.setItem(TUTORIAL_HIDDEN_KEY, '1');
    setHidden(true);
  }, []);

  const show = useCallback(() => {
    sessionStorage.removeItem(TUTORIAL_HIDDEN_KEY);
    setHidden(false);
  }, []);

  return { ...tutorialState({ jobs, hasEvidence, claims }), loaded, hidden, hide, show };
}