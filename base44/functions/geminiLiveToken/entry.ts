import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';

const MODEL = 'gemini-3.8-live';
const TOKEN_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/auth_tokens';

function isoSeconds(milliseconds) {
  return new Date(milliseconds).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = secrets.get('GEMINI_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'The Gemini API key is not set for this app' }, { status: 500 });
    }

    const now = Date.now();
    const expireTime = isoSeconds(now + 30 * 60 * 1000);
    const newSessionExpireTime = isoSeconds(now + 60 * 1000);

    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ uses: 1, expireTime, newSessionExpireTime }),
      signal: AbortSignal.timeout(15000),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = (data && data.error && data.error.message) || 'The voice session could not be started';
      return Response.json({ error: message }, { status: 502 });
    }

    if (!data.name) {
      return Response.json({ error: 'The voice session returned no token' }, { status: 502 });
    }

    return Response.json({ token: data.name, model: MODEL, expires_at: expireTime });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}