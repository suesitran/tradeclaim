// Drafts the notice of intention for any claim the clock has run out on, so it
// is waiting on the claim screen with a Send button rather than being generated
// at the moment of sending.

import { base44 } from '@/api/base44Client';
import { effectiveStatus } from '@/lib/claims';

export const NOTICE_TYPE = 'notice_of_intention';

// Claim ids with a draft in progress, so two screens loading at once do not
// produce two drafts.
const drafting = new Set();

export function noticeDraftFor(documents) {
  return (documents || []).find((document) => document.type === NOTICE_TYPE) || null;
}

// Returns the number of drafts created. Callers reload their documents when it
// is more than zero.
export async function ensureNoticeDrafts(claims) {
  const ignored = (claims || []).filter((claim) => effectiveStatus(claim) === 'ignored' && !drafting.has(claim.id));
  if (!ignored.length) return 0;

  const existing = await base44.entities.Document.filter({ type: NOTICE_TYPE }, '-generated_at', 200);
  const drafted = new Set((existing || []).map((document) => document.claim_id));
  const missing = ignored.filter((claim) => !drafted.has(claim.id));

  let count = 0;
  for (const claim of missing) {
    drafting.add(claim.id);
    try {
      const response = await base44.functions.invoke('generateClaimDocument', { claim_id: claim.id, type: NOTICE_TYPE });
      if (!(response.data && response.data.error)) count += 1;
    } catch {
      // A failed draft is retried the next time the claim is opened.
    } finally {
      drafting.delete(claim.id);
    }
  }
  return count;
}
