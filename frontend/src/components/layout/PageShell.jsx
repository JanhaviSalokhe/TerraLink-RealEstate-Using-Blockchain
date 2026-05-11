export function PageShell({ eyebrow, title, description, action, children }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          {eyebrow && <p className="text-sm font-bold uppercase tracking-[.24em] text-emerald-300">{eyebrow}</p>}
          <h2 className="mt-2 max-w-3xl font-display text-3xl font-black text-white sm:text-5xl">{title}</h2>
          {description && <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
