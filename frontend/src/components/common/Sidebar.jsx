import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, Settings, UserCircle } from "lucide-react";
import { logout } from "../../utils/auth.js";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
export default function Sidebar({ title, items, dark = false }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);
  const signOut = () => { logout(); navigate("/login"); };
  const content = <aside className={`flex h-full flex-col border-r ${dark ? "border-white/10 bg-slate-950 text-slate-100" : "border-slate-200 bg-white"}`}>
    <div className={`border-b p-6 ${dark ? "border-white/10" : "border-slate-200"}`}>
      <div className="flex items-center gap-3"><span className="impact-gradient h-9 w-1 rounded-full"/><div><h2 className={`text-xl font-semibold tracking-tight ${dark ? "text-white" : "text-navy"}`}>IMPACTX</h2><p className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>{title}</p></div></div>
    </div>
    <nav className="scrollbar-thin flex-1 space-y-2 overflow-y-auto p-4">{items.map(({to,label,icon:Icon})=><NavLink key={to} to={to} end={to.split("/").length===2} onClick={()=>setOpen(false)} className={({isActive})=>`relative flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${dark ? (isActive ? "bg-slate-300/10 text-slate-100 before:absolute before:left-0 before:top-2 before:h-7 before:w-0.5 before:rounded-full before:bg-slate-300" : "text-slate-400 hover:bg-white/5 hover:text-white") : (isActive ? "bg-slate-100 text-slate-900 before:absolute before:left-0 before:top-2 before:h-7 before:w-0.5 before:rounded-full before:bg-slate-500" : "text-slate-600 hover:bg-slate-50 hover:text-navy")}`}>{Icon && <Icon size={18}/>} {label}</NavLink>)}</nav>
    <div className={`m-4 rounded-2xl border p-4 ${dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
      <div className="flex items-center gap-3 text-sm"><UserCircle className={dark ? "text-slate-300" : "text-slate-600"} size={24}/><div><p className={`font-semibold ${dark ? "text-white" : "text-navy"}`}>Demo User</p><p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{title}</p></div></div>
      <button className={`mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${dark ? "text-slate-300 hover:bg-white/10 hover:text-white" : "text-slate-600 hover:bg-white hover:text-navy"}`}><Settings size={16}/> Settings</button>
      <button onClick={signOut} className={`mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${dark ? "text-red-300 hover:bg-red-500/10" : "text-red-600 hover:bg-red-50"}`}><LogOut size={16}/> Logout</button>
    </div>
  </aside>;
  return <>
    <button onClick={()=>setOpen(true)} className={`fixed left-3 top-3 z-50 rounded-xl border p-2.5 shadow-md lg:hidden ${dark ? "border-white/10 bg-slate-950 text-slate-200" : "border-slate-200 bg-white text-slate-700"}`}><Menu size={20}/></button>
    <div className="hidden h-screen w-72 shrink-0 lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block">{content}</div>
    {open && <div className="fixed inset-0 z-40 lg:hidden"><div className="absolute inset-0 bg-slate-900/40" onClick={()=>setOpen(false)}/><div className="relative h-full w-[85vw] max-w-[300px]">{content}</div></div>}
  </>;
}
