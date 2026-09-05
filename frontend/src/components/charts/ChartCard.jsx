import { useLocation } from "react-router-dom";

export default function ChartCard({ title, children }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return <section className={`w-full min-w-0 rounded-2xl border p-6 transition duration-200 md:p-7 ${isAdmin ? "admin-chart-card border-sky-300/20 bg-slate-950 shadow-[0_18px_48px_rgba(2,6,23,.18)] hover:border-cyan-300/40" : "border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:shadow-md"}`}>
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div><h3 className={`text-lg font-semibold md:text-xl ${isAdmin ? "text-white" : "text-navy"}`}>{title}</h3><p className={`mt-1 text-sm ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>January - August 2026</p></div>
      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${isAdmin ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-200" : "border-slate-200 bg-slate-50 text-slate-600"}`}>+18.4%</span>
    </div>
    <div className="h-64 min-w-0 md:h-72 xl:h-80">{children}</div>
  </section>;
}
