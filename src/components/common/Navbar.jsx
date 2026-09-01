import { Link, NavLink } from "react-router-dom";
import { BarChart3 } from "lucide-react";
const nav = [["/","Dashboard"],["/explore","Challenges"],["/submit","Submit Challenge"],["/explore","Projects"],["/","Impact"],["/how-it-works","About"]];
export default function Navbar() {
  return <header className="sticky top-0 z-40 border-b bg-[#08111f]/85 backdrop-blur-xl">
    <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-4">
      <Link to="/" className="flex items-center gap-3 text-xl font-semibold tracking-tight text-navy"><span className="impact-gradient grid h-10 w-10 place-items-center rounded-xl text-[#041016]"><BarChart3 size={20}/></span> IMPACTX</Link>
      <nav className="hidden items-center gap-1 lg:flex">{nav.map(([to,label], index)=><NavLink key={`${to}-${label}`} to={to} className={({isActive})=>`relative rounded-xl px-3 py-2 text-sm font-medium ${isActive && index < 3 ? "text-blue" : "text-slate-500 hover:bg-slate-100 hover:text-navy"}`}>{({isActive}) => <>{label}{isActive && index < 3 && <span className="absolute inset-x-3 -bottom-3 h-0.5 rounded-full impact-gradient"/>}</>}</NavLink>)}</nav>
      <Link to="/login" className="rounded-xl border border-blue/30 bg-blue/10 px-4 py-2 text-sm font-semibold text-blue shadow-sm hover:border-blue/60">Login</Link>
    </div>
  </header>;
}
