import { CheckCircle2 } from "lucide-react";
export default function Timeline({ steps }) {
  return <div className="overflow-x-auto pb-2"><div className="flex min-w-max items-center gap-2">{steps.map((s,i)=><div key={s} className="flex items-center gap-2"><div className={`flex h-24 w-36 flex-col items-center justify-center rounded-xl border text-center text-xs font-semibold ${i<4?"border-green/20 bg-green/5 text-green":"bg-white text-slate-600"}`}><CheckCircle2 size={18} className="mb-2"/>{s}</div>{i<steps.length-1 && <span className="text-slate-300">→</span>}</div>)}</div></div>;
}
