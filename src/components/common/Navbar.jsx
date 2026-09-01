import { Link, NavLink } from "react-router-dom";
import { BarChart3, Menu, X } from "lucide-react";
import { useState } from "react";
const nav = [["/","Dashboard"],["/explore","Challenges"],["/submit","Submit Challenge"],["/explore","Projects"],["/","Impact"],["/how-it-works","About"]];
export default function Navbar() {
  const [open, setOpen] = useState(false);
  return <header className="sticky top-0 z-40 border-b bg-[#08111f]/85 backdrop-blur-xl">
    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-[68px]">
      <Link to="/" onClick={()=>setOpen(false)} className="flex items-center gap-3 text-lg font-semibold tracking-tight text-navy sm:text-xl"><span className="impact-gradient grid h-9 w-9 place-items-center rounded-xl text-[#041016] sm:h-10 sm:w-10"><BarChart3 size={20}/></span> IMPACTX</Link>
      <nav className="hidden items-center gap-1 lg:flex">{nav.map(([to,label], index)=><NavLink key={`${to}-${label}`} to={to} className={({isActive})=>`relative rounded-xl px-3 py-2 text-sm font-medium ${isActive && index < 3 ? "text-blue" : "text-slate-500 hover:bg-slate-100 hover:text-navy"}`}>{({isActive}) => <>{label}{isActive && index < 3 && <span className="absolute inset-x-3 -bottom-3 h-0.5 rounded-full impact-gradient"/>}</>}</NavLink>)}</nav>
      <div className="flex items-center gap-2">
        <Link to="/login" className="hidden rounded-xl border border-blue/30 bg-blue/10 px-4 py-2 text-sm font-semibold text-blue shadow-sm hover:border-blue/60 lg:inline-flex">Login</Link>
        <button onClick={()=>setOpen(v=>!v)} className="rounded-xl border border-slate-500/20 bg-slate-100 p-2 text-blue lg:hidden" aria-label="Toggle navigation">{open ? <X size={20}/> : <Menu size={20}/>}</button>
      </div>
    </div>
    {open && <nav className="border-t bg-[#08111f]/95 px-4 py-3 lg:hidden">
      <div className="grid gap-2">{nav.map(([to,label], index)=><NavLink key={`${to}-${label}-mobile`} to={to} onClick={()=>setOpen(false)} className={({isActive})=>`rounded-xl px-3 py-3 text-sm font-medium ${isActive && index < 3 ? "bg-[linear-gradient(90deg,rgba(56,189,248,.16),rgba(20,184,166,.06))] text-blue" : "text-slate-500 hover:bg-slate-100 hover:text-navy"}`}>{label}</NavLink>)}
      <Link to="/login" onClick={()=>setOpen(false)} className="impact-gradient mt-1 rounded-xl px-3 py-3 text-center text-sm font-semibold text-[#041016]">Login</Link></div>
    </nav>}
  </header>;
}
