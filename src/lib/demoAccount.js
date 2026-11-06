// The shared demo account a visitor is signed into from the landing page, so
// they can try the real app without registering. Create it once on the live
// app, then fill these in. Everyone who taps the demo button shares this
// account and its jobs, so keep it to demo data. Leave both empty to turn the
// demo button into a link to the no-account walkthrough instead.
export const DEMO_ACCOUNT = {
  email: 'ahmed172@icloud.com',
  password: 'Gun60&&TAM',
};

export const demoEnabled = Boolean(DEMO_ACCOUNT.email && DEMO_ACCOUNT.password);
