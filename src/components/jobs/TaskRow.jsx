export default function TaskRow({ number, title, sub, action, children, delay = 0 }) {
  return (
    <section className="relative animate-rise border-t border-[#DED6C7] py-[34px]" style={{ animationDelay: `${delay}s` }}>
      <span
        aria-hidden="true"
        className="num pointer-events-none absolute -left-[112px] top-5 hidden text-[108px] font-extrabold leading-none tracking-[-0.04em] text-[#9A5B2A] md:block"
      >
        {number}
      </span>

      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <span className="num mb-1.5 block text-[13px] font-extrabold text-[#9A5B2A] md:hidden">{number}</span>
          <h2 className="text-[26px] font-extrabold leading-[1.15] tracking-[-0.015em] sm:text-[34px]">{title}</h2>
          {sub ? <p className="num mt-2 text-[12px] text-[#6b6457]">{sub}</p> : null}
        </div>
        {action}
      </div>

      {children ? <div className="mt-6 transition-opacity duration-300">{children}</div> : null}
    </section>
  );
}