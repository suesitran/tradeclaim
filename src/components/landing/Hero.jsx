import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { HERO_ACTION, HERO_ACTION_PRIMARY } from '@/components/jobs/taskStyles';

const HERO_IMAGE =
  'https://media.base44.com/images/public/6ae53bfb0bf98c8224ef283d/e06319f93_generated_43821c14.jpg';

const FACTS = [
  ['Voice on site', 'Progress logged in seconds'],
  ['Photo evidence', 'Dated and located'],
  ['10 business days', 'The clock does the chasing'],
];

export default function Hero({ cta }) {
  return (
    <section className="relative overflow-hidden bg-[#1B1A17] px-4 pb-16 pt-14 text-[#FAF7F1] sm:px-6 sm:pb-20 sm:pt-20">
      <img
        src={HERO_IMAGE}
        alt="Freshly painted wall corner with a masked edge"
        className="absolute inset-0 h-full w-full animate-drift object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(27,26,23,0.94)_0%,rgba(27,26,23,0.8)_55%,rgba(27,26,23,0.45)_100%)]" />

      <div className="relative mx-auto w-full max-w-5xl">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#E3C9A8]">
          For Victorian painting and finishing subcontractors
        </p>

        <h1 className="mt-4 max-w-3xl text-[36px] font-extrabold leading-[1.06] tracking-[-0.02em] sm:text-[54px]">
          The work is done. Getting paid in Victoria is the hard part.
        </h1>

        <p className="mt-5 max-w-2xl text-[15px] leading-[1.55] text-[#DED6C7]">
          TradeClaim runs the Victorian claims process end to end: a compliant payment claim served under
          the Security of Payment Act 2002 (Vic), 10 business days for the builder's payment schedule, and a
          notice of intention drafted the moment that date passes unpaid.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-2.5">
          <Link to={cta.to} className={HERO_ACTION_PRIMARY}>
            {cta.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#how-it-works" className={HERO_ACTION}>
            See how it works
          </a>
        </div>

        <dl className="mt-12 grid grid-cols-1 border-t border-[rgba(222,214,199,0.35)] sm:grid-cols-3">
          {FACTS.map(([term, detail]) => (
            <div key={term} className="pr-3 pt-[14px]">
              <dt className="num text-[10px] uppercase tracking-[0.14em] text-[#E3C9A8]">{term}</dt>
              <dd className="mt-[6px] text-[19px] leading-[1.3] text-[#FAF7F1]">{detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}