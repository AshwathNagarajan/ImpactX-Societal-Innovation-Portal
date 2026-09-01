import { Bell } from "lucide-react";
export default function NotificationDropdown() {
  return <details className="relative"><summary className="list-none rounded-xl border border-slate-500/10 bg-slate-100 p-2 text-slate-500 hover:text-blue"><Bell size={20}/></summary><div className="premium-surface absolute right-0 mt-2 w-72 rounded-2xl border p-3 shadow-lg"><p className="text-sm font-semibold text-navy">Notifications</p>{["New challenge submitted from Gumla", "BIT Mesra accepted flood warning project", "Pilot impact metrics updated"].map(n=><p key={n} className="mt-2 rounded-xl bg-slate-50 p-2 text-sm text-slate-600">{n}</p>)}</div></details>;
}
