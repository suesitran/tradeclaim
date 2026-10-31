import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function useSignedUrls(uris) {
  const [urls, setUrls] = useState({});
  const key = JSON.stringify((uris || []).filter(Boolean));

  useEffect(() => {
    let alive = true;
    const list = (uris || []).filter(Boolean);
    if (!list.length) {
      setUrls({});
      return () => {
        alive = false;
      };
    }
    Promise.all(
      list.map(async (uri) => {
        try {
          const result = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 3600 });
          return [uri, result && result.signed_url ? result.signed_url : null];
        } catch {
          return [uri, null];
        }
      }),
    ).then((entries) => {
      if (alive) setUrls(Object.fromEntries(entries));
    });
    return () => {
      alive = false;
    };
  }, [key]);

  return urls;
}