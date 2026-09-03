import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, Settings, UserCircle } from "lucide-react";
import { logout } from "../../utils/auth.js";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
export default function Sidebar({ title, items }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);
  const signOut = () => { logout(); navigate("/login"); };
  const content = <aside className="flex h-full flex-col border-r border-slate-200 bg-white">
    <div className="border-b border-slate-200 p-6">
      <div className="flex items-center gap-3"><span className="impact-gradient h-9 w-1 rounded-full"/><div><h2 className="text-xl font-semibold tracking-tight text-navy">IMPACTX</h2><p className="text-sm text-slate-500">{title}</p></div></div>
    </div>
    <nav className="scrollbar-thin flex-1 space-y-2 overflow-y-auto p-4">{items.map(({to,label,icon:Icon})=><NavLink key={to} to={to} end={to.split("/").length===2} onClick={()=>setOpen(false)} className={({isActive})=>`relative flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${isActive?"bg-blue-50 text-blue before:absolute before:left-0 before:top-2 before:h-7 before:w-0.5 before:rounded-full before:bg-blue":"text-slate-600 hover:bg-slate-50 hover:text-navy"}`}>{Icon && <Icon size={18}/>} {label}</NavLink>)}</nav>
    <div className="m-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-3 text-sm"><UserCircle className="text-blue" size={24}/><div><p className="font-semibold text-navy">Demo User</p><p className="text-xs text-slate-500">{title}</p></div></div>
      <button className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-white hover:text-navy"><Settings size={16}/> Settings</button>
      <button onClick={signOut} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"><LogOut size={16}/> Logout</button>
    </div>
  </aside>;
  return <>
    <button onClick={()=>setOpen(true)} className="fixed left-3 top-3 z-50 rounded-xl border border-slate-200 bg-white p-2.5 text-blue shadow-md lg:hidden"><Menu size={20}/></button>
    <div className="hidden h-screen w-72 shrink-0 lg:block">{content}</div>
    {open && <div className="fixed inset-0 z-40 lg:hidden"><div className="absolute inset-0 bg-slate-900/40" onClick={()=>setOpen(false)}/><div className="relative h-full w-[85vw] max-w-[300px]">{content}</div></div>}
  </>;
}
