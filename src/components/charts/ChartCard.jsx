export default function ChartCard({ title, children }) {
  return <section className="premium-card w-full min-w-0 rounded-2xl border p-5 transition duration-200 hover:border-blue/25">
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3 md:gap-4">
      <div><h3 className="text-lg font-semibold text-navy">{title}</h3><p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">January - August 2026</p></div>
      <span className="rounded-full border border-green/20 bg-green/10 px-2.5 py-1 text-xs font-semibold text-green">+18.4%</span>
    </div>
    <div className="h-56 min-w-0 sm:h-64 lg:h-72">{children}</div>
  </section>;
}
