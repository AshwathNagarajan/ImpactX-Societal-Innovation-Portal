import { SearchX } from "lucide-react";
export default function EmptyState({ title = "No records found", text = "Try changing filters or search terms." }) {
  return <div className="premium-card rounded-2xl border border-dashed p-10 text-center text-slate-600"><SearchX className="mx-auto mb-3 text-blue" /><h3 className="font-semibold text-navy">{title}</h3><p>{text}</p></div>;
}
