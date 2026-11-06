import { base44 } from '@/api/base44Client';
import { DEMO_ACCOUNT } from '@/lib/demoAccount';

// Signs the visitor into the shared demo account and opens the jobs screen.
// A full page load afterwards is deliberate: the SDK stores the token and the
// auth context reads it on boot.
export async function startDemo() {
  await base44.auth.loginViaEmailPassword(DEMO_ACCOUNT.email, DEMO_ACCOUNT.password);
  window.location.href = '/app';
}
