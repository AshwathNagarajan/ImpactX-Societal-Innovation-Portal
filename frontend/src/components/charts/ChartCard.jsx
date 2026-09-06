export default function ChartCard({ title, children }) {
  return <section className="admin-chart-card w-full min-w-0 rounded-2xl border border-slate-300/20 bg-slate-800 p-6 shadow-[0_18px_48px_rgba(15,23,42,.16)] transition duration-200 hover:border-slate-300/40 md:p-7">
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div><h3 className="text-lg font-semibold text-white md:text-xl">{title}</h3><p className="mt-1 text-sm text-slate-400">January - August 2026</p></div>
      <span className="rounded-full border border-slate-300/30 bg-slate-300/10 px-3 py-1 text-xs font-semibold text-slate-200">+18.4%</span>
    </div>
    <div className="h-64 min-w-0 md:h-72 xl:h-80">{children}</div>
  </section>;
}
