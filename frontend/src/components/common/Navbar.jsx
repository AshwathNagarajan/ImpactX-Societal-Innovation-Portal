import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
const nav = [["/","Dashboard"],["/explore","Challenges"],["/submit","Submit Challenge"],["/how-it-works","About"]];
export default function Navbar() {
  const [open, setOpen] = useState(false);
  return <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
    <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10 xl:px-12">
      <Link to="/" onClick={()=>setOpen(false)} className="flex items-center gap-3 text-lg font-semibold tracking-tight text-white sm:text-xl"><img src="/impactx-logo.png" alt="IMPACTX" className="h-11 w-11 rounded-xl bg-white object-contain p-1" /> IMPACTX</Link>
      <nav className="hidden items-center gap-2 lg:flex">{nav.map(([to,label])=><NavLink key={`${to}-${label}`} to={to} end={to === "/"} className={({isActive})=>`relative rounded-xl px-4 py-2.5 text-sm font-medium ${isActive ? "bg-slate-300/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>{({isActive}) => <>{label}{isActive && <span className="absolute inset-x-4 -bottom-3 h-0.5 rounded-full impact-gradient"/>}</>}</NavLink>)}</nav>
      <div className="flex items-center gap-2">
        <Link to="/login" className="hidden rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-100 shadow-sm hover:bg-white/10 lg:inline-flex">Login</Link>
        <button onClick={()=>setOpen(v=>!v)} className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-100 shadow-sm lg:hidden" aria-label="Toggle navigation">{open ? <X size={20}/> : <Menu size={20}/>}</button>
      </div>
    </div>
    {open && <nav className="border-t border-white/10 bg-slate-950 px-4 py-4 shadow-lg lg:hidden">
      <div className="grid gap-2">{nav.map(([to,label])=><NavLink key={`${to}-${label}-mobile`} to={to} end={to === "/"} onClick={()=>setOpen(false)} className={({isActive})=>`rounded-xl px-4 py-3 text-sm font-medium ${isActive ? "bg-slate-300/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>{label}</NavLink>)}
      <Link to="/login" onClick={()=>setOpen(false)} className="impact-gradient mt-2 rounded-xl px-4 py-3 text-center text-sm font-semibold text-white">Login</Link></div>
    </nav>}
  </header>;
}
