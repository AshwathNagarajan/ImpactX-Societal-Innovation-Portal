import { SearchX } from "lucide-react";
export default function EmptyState({ title = "No records found", text = "Try changing filters or search terms." }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600 shadow-sm"><SearchX className="mx-auto mb-4 text-blue" size={36}/><h3 className="text-lg font-semibold text-navy">{title}</h3><p className="mt-2">{text}</p></div>;
}
