export default function KPICard({ title, value, note, icon: Icon }) {
  const tone = /pending|validation/i.test(title) ? "text-orange" : /impact|benefited|implemented|completed|citizens/i.test(title) ? "text-green" : /project|research|patent|startup/i.test(title) ? "text-purple" : "text-blue";
  return <div className="premium-surface group rounded-2xl border p-5 transition duration-200 hover:-translate-y-0.5 hover:border-blue/30">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <span className="rounded-full border border-slate-500/20 px-2 py-1 text-xs font-semibold text-slate-500">+12.4%</span>
        <h3 className={`mt-4 text-3xl font-semibold tracking-tight ${tone}`}>{value}</h3>
        <p className="mt-2 text-sm font-semibold text-navy">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{note || "Compared with previous month"}</p>
      </div>
      {Icon && <span className="impact-gradient grid h-11 w-11 shrink-0 place-items-center rounded-xl text-[#041016]"><Icon size={20}/></span>}
    </div>
  </div>;
}
