import { Link, NavLink } from "react-router-dom";
import { BarChart3, Menu, X } from "lucide-react";
import { useState } from "react";
const nav = [["/","Dashboard"],["/explore","Challenges"],["/submit","Submit Challenge"],["/explore","Projects"],["/","Impact"],["/how-it-works","About"]];
export default function Navbar() {
  const [open, setOpen] = useState(false);
  return <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
    <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10 xl:px-12">
      <Link to="/" onClick={()=>setOpen(false)} className="flex items-center gap-3 text-lg font-semibold tracking-tight text-navy sm:text-xl"><span className="impact-gradient grid h-10 w-10 place-items-center rounded-2xl text-white"><BarChart3 size={20}/></span> IMPACTX</Link>
      <nav className="hidden items-center gap-2 lg:flex">{nav.map(([to,label], index)=><NavLink key={`${to}-${label}`} to={to} className={({isActive})=>`relative rounded-xl px-4 py-2.5 text-sm font-medium ${isActive && index < 3 ? "bg-blue-50 text-blue" : "text-slate-500 hover:bg-slate-50 hover:text-navy"}`}>{({isActive}) => <>{label}{isActive && index < 3 && <span className="absolute inset-x-4 -bottom-3 h-0.5 rounded-full impact-gradient"/>}</>}</NavLink>)}</nav>
      <div className="flex items-center gap-2">
        <Link to="/login" className="hidden rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-blue shadow-sm hover:border-blue/40 hover:bg-blue-50 lg:inline-flex">Login</Link>
        <button onClick={()=>setOpen(v=>!v)} className="rounded-xl border border-slate-200 bg-white p-2.5 text-blue shadow-sm lg:hidden" aria-label="Toggle navigation">{open ? <X size={20}/> : <Menu size={20}/>}</button>
      </div>
    </div>
    {open && <nav className="border-t border-slate-200 bg-white px-4 py-4 shadow-lg lg:hidden">
      <div className="grid gap-2">{nav.map(([to,label], index)=><NavLink key={`${to}-${label}-mobile`} to={to} onClick={()=>setOpen(false)} className={({isActive})=>`rounded-xl px-4 py-3 text-sm font-medium ${isActive && index < 3 ? "bg-blue-50 text-blue" : "text-slate-600 hover:bg-slate-50 hover:text-navy"}`}>{label}</NavLink>)}
      <Link to="/login" onClick={()=>setOpen(false)} className="impact-gradient mt-2 rounded-xl px-4 py-3 text-center text-sm font-semibold text-white">Login</Link></div>
    </nav>}
  </header>;
}
