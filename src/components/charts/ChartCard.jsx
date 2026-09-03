export default function ChartCard({ title, children }) {
  return <section className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:border-slate-300 md:p-7">
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div><h3 className="text-lg font-semibold text-navy md:text-xl">{title}</h3><p className="mt-1 text-sm text-slate-500">January - August 2026</p></div>
      <span className="rounded-full border border-green/20 bg-green/10 px-3 py-1 text-xs font-semibold text-green">+18.4%</span>
    </div>
    <div className="h-64 min-w-0 md:h-72 xl:h-80">{children}</div>
  </section>;
}
