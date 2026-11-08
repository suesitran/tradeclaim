import React, { useState } from 'react';
import { useT } from '@/lib/i18n';
import { DEMO_VIDEO } from '@/lib/demoVideo';

export default function DemoVideo() {
  const t = useT();
  // If the file ever goes missing the browser fires an error on the video
  // element. Hiding the section then beats showing a black box.
  const [broken, setBroken] = useState(false);
  if (!DEMO_VIDEO.src || broken) return null;

  return (
    <section className="border-b-[3px] border-foreground">
      <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-18">
        <p className="eyebrow">{t('See it work')}</p>
        <h2 className="mt-2 max-w-3xl text-[34px] font-extrabold leading-[1] sm:text-[48px]">
          {t('From photos to a sent claim')}
        </h2>

        {/* A phone recording is portrait, so the height is capped and the width follows. */}
        <video
          className="mx-auto mt-8 max-h-[720px] w-auto max-w-full border-2 border-foreground bg-foreground"
          src={DEMO_VIDEO.src}
          controls
          playsInline
          preload="metadata"
          onError={() => setBroken(true)}
        >
          {t("Your browser can't play this video.")}
        </video>
      </div>
    </section>
  );
}
