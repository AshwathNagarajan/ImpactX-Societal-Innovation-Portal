import { Bell } from "lucide-react";
export default function NotificationDropdown() {
  return <details className="relative"><summary className="list-none rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm hover:text-blue"><Bell size={20}/></summary><div className="absolute right-0 mt-3 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg"><p className="text-sm font-semibold text-navy">Notifications</p>{["New challenge submitted from Gumla", "BIT Mesra accepted flood warning project", "Pilot impact metrics updated"].map(n=><p key={n} className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-5 text-slate-600">{n}</p>)}</div></details>;
}
