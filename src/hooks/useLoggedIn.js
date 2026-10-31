import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function useLoggedIn() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let active = true;
    base44.auth
      .isAuthenticated()
      .then((value) => {
        if (active) setLoggedIn(Boolean(value));
      })
      .catch(() => {
        if (active) setLoggedIn(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return loggedIn;
}