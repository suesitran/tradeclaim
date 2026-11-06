// A numbered section of the job sheet.
export default function TaskRow({ number, title, sub, action, children }) {
  return (
    <section className="border-t-[3px] border-foreground py-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-foreground font-heading text-[20px] font-extrabold text-accent">
            {number}
          </span>
          <div>
            <h2 className="text-[30px] font-extrabold leading-none">{title}</h2>
            {sub ? <p className="mt-1 text-[14px] text-muted-foreground">{sub}</p> : null}
          </div>
        </div>
        {action}
      </div>

      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}
