import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Factory, Shield, Share2 } from "lucide-react";
import { credentials, login, rolePath } from "../../utils/auth.js";
const roles = [["admin","Admin",Shield],["institute","Institute",Building2],["industry","Industry",Factory]];
export default function Login() {
  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState(credentials.admin.email);
  const [password, setPassword] = useState(credentials.admin.password);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const pick = (r) => { setRole(r); setEmail(credentials[r].email); setPassword(credentials[r].password); setError(""); };
  const submit = (e) => { e.preventDefault(); const res = login(email, password, role); res.ok ? navigate(rolePath(role)) : setError(res.error); };
  return <div className="grid min-h-[calc(100vh-68px)] lg:grid-cols-[55fr_45fr]">
    <section className="relative overflow-hidden border-r bg-[#08111f] p-8 lg:p-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(56,189,248,.15),transparent_32%),radial-gradient(circle_at_75%_65%,rgba(139,92,246,.12),transparent_32%)]"/>
      <div className="relative flex h-full min-h-[420px] flex-col justify-between">
        <div className="flex items-center gap-3 text-2xl font-semibold text-navy"><span className="impact-gradient grid h-11 w-11 place-items-center rounded-xl text-[#041016]"><Share2/></span>IMPACTX</div>
        <div><h1 className="max-w-xl text-5xl font-semibold leading-tight tracking-tight text-navy">Connect. Collaborate.<br/><span className="impact-gradient-text">Create Impact.</span></h1><p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">A secure civic innovation workspace for government validation, institute research teams and industry partnerships.</p></div>
        <div className="grid max-w-lg grid-cols-3 gap-3">{["Citizen","AI","Impact"].map(n=><div key={n} className="rounded-2xl border bg-[#0d1828]/80 p-4 text-center text-sm text-slate-600"><span className="mx-auto mb-2 block h-2 w-2 rounded-full bg-blue"/>{n}</div>)}</div>
      </div>
    </section>
    <section className="grid place-items-center p-6 lg:p-12"><form onSubmit={submit} className="premium-surface w-full max-w-md rounded-3xl border p-7"><p className="text-sm font-semibold text-blue">Welcome to IMPACTX</p><h2 className="mt-2 text-3xl font-semibold text-navy">Choose your workspace.</h2><div className="mt-6 grid grid-cols-3 gap-2">{roles.map(([r,label,Icon])=><button type="button" key={r} onClick={()=>pick(r)} className={`rounded-xl border p-3 text-center text-xs font-semibold ${role===r?"impact-gradient text-[#041016] border-transparent":"bg-slate-100 text-slate-500"}`}><Icon className="mx-auto mb-1" size={18}/>{label.toUpperCase()}</button>)}</div><label className="mt-5 block text-sm font-semibold text-slate-600">Email<input value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-3 outline-none"/></label><label className="mt-4 block text-sm font-semibold text-slate-600">Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-3 outline-none"/></label>{error && <p className="mt-3 rounded-xl bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}<button className="impact-gradient mt-5 w-full rounded-xl px-4 py-3 font-semibold text-[#041016]">Sign In</button></form></section>
  </div>;
}
