import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
export default function Sidebar({ title, items, dark = false, open = false, onClose }) {
  const location = useLocation();
  useEffect(() => onClose?.(), [location.pathname]);
  const accountLabels = ["Notifications", "Settings", "Profile", "Company Profile"];
  const visibleItems = items.filter(({ label }) => !accountLabels.includes(label));
  const content = <aside className={`flex h-full flex-col border-r ${dark ? "border-white/10 bg-slate-900 text-slate-100" : "border-slate-200 bg-white"}`}>
    <div className={`border-b p-6 ${dark ? "border-white/10" : "border-slate-200"}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3"><img src="/impactx-logo.png" alt="IMPACTX" className="h-12 w-12 rounded-xl bg-white object-contain p-1" /><div className="min-w-0"><h2 className={`text-xl font-semibold tracking-tight ${dark ? "text-white" : "text-navy"}`}>IMPACTX</h2><p className={`truncate text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>{title}</p></div></div>
        <button onClick={onClose} className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${dark ? "border-white/10 text-slate-300 hover:bg-white/10" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`} aria-label="Close navigation"><X size={18}/></button>
      </div>
    </div>
    <nav className="scrollbar-thin flex-1 space-y-2 overflow-y-auto p-4">{visibleItems.map(({to,label,icon:Icon})=><NavLink key={to} to={to} end={to.split("/").length===2} onClick={onClose} className={({isActive})=>`relative flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${dark ? (isActive ? "bg-slate-300/10 text-slate-100 before:absolute before:left-0 before:top-2 before:h-7 before:w-0.5 before:rounded-full before:bg-slate-300" : "text-slate-400 hover:bg-white/5 hover:text-white") : (isActive ? "bg-slate-100 text-slate-900 before:absolute before:left-0 before:top-2 before:h-7 before:w-0.5 before:rounded-full before:bg-slate-500" : "text-slate-600 hover:bg-slate-50 hover:text-navy")}`}>{Icon && <Icon size={18}/>} {label}</NavLink>)}</nav>
    <div className={`m-4 rounded-2xl border p-4 text-sm ${dark ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
      Select a module, then use the top account menu for profile, settings and logout.
    </div>
  </aside>;
  return open ? <div className="fixed inset-0 z-40"><div className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]" onClick={onClose}/><div className="relative h-full w-[85vw] max-w-[320px] shadow-2xl">{content}</div></div> : null;
}
