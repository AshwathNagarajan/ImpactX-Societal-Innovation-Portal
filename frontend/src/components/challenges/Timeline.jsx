import { CheckCircle2 } from "lucide-react";
export default function Timeline({ steps }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">{steps.map((s,i)=><div key={s} className={`flex min-h-16 items-center gap-3 rounded-xl border px-4 py-3 text-left text-xs font-semibold ${i<4?"border-green/20 bg-green-50 text-green":"bg-white text-slate-600"}`}><CheckCircle2 size={18} className="shrink-0"/>{s}</div>)}</div>;
}
