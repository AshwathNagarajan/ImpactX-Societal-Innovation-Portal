export default function KPICard({ title, value, note, icon: Icon }) {
  const tone = /pending|validation/i.test(title) ? "text-orange" : /impact|benefited|implemented|completed|citizens/i.test(title) ? "text-green" : /project|research|patent|startup/i.test(title) ? "text-purple" : "text-blue";
  const iconTone = tone === "text-orange" ? "bg-orange/10 text-orange" : tone === "text-green" ? "bg-green/10 text-green" : tone === "text-purple" ? "bg-purple/10 text-purple" : "bg-blue/10 text-blue";
  return <div className="group min-h-[140px] w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md md:p-7">
    <div className="flex h-full items-start justify-between gap-5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className={`mt-4 whitespace-nowrap text-3xl font-semibold tracking-tight md:text-4xl ${tone}`}>{value}</h3>
        <p className="mt-3 text-sm leading-5 text-slate-500">{note || "Compared with previous month"}</p>
      </div>
      {Icon && <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${iconTone}`}><Icon size={21}/></span>}
    </div>
  </div>;
}
