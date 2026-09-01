import { CheckCircle2 } from "lucide-react";
export default function Timeline({ steps }) {
  return <div className="pb-2 sm:overflow-x-auto"><div className="grid gap-2 sm:flex sm:min-w-max sm:items-center">{steps.map((s,i)=><div key={s} className="grid gap-2 sm:flex sm:items-center"><div className={`flex min-h-16 items-center gap-3 rounded-xl border px-3 py-3 text-left text-xs font-semibold sm:h-24 sm:w-36 sm:flex-col sm:justify-center sm:text-center ${i<4?"border-green/20 bg-green/5 text-green":"bg-white text-slate-600"}`}><CheckCircle2 size={18} className="shrink-0 sm:mb-2"/>{s}</div>{i<steps.length-1 && <span className="hidden text-slate-300 sm:inline">→</span>}</div>)}</div></div>;
}
