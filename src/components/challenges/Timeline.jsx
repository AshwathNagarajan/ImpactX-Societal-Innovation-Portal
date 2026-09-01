import { CheckCircle2 } from "lucide-react";
export default function Timeline({ steps }) {
  return <div className="pb-2 lg:overflow-x-auto"><div className="grid gap-2 lg:flex lg:min-w-max lg:items-center">{steps.map((s,i)=><div key={s} className="grid gap-2 lg:flex lg:items-center"><div className={`flex min-h-16 items-center gap-3 rounded-xl border px-3 py-3 text-left text-xs font-semibold lg:h-24 lg:w-36 lg:flex-col lg:justify-center lg:text-center ${i<4?"border-green/20 bg-green/5 text-green":"bg-white text-slate-600"}`}><CheckCircle2 size={18} className="shrink-0 lg:mb-2"/>{s}</div>{i<steps.length-1 && <span className="hidden text-slate-300 lg:inline">→</span>}</div>)}</div></div>;
}
