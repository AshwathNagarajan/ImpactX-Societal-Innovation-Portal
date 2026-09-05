import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Factory, Shield, Share2 } from "lucide-react";
import { loginWithApi } from "../../services/authService.js";
import { credentials, rolePath, saveUser } from "../../utils/auth.js";
const roles = [["admin","Admin",Shield],["institute","Institute",Building2],["industry","Industry",Factory]];
export default function Login() {
  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState(credentials.admin.email);
  const [password, setPassword] = useState(credentials.admin.password);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const pick = (r) => { setRole(r); setEmail(credentials[r].email); setPassword(credentials[r].password); setError(""); };
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await loginWithApi(email, password);
      const apiRole = String(res.user?.role || "").toLowerCase();
      if (apiRole !== role) {
        setError("These credentials belong to a different workspace role.");
        return;
      }
      saveUser(res.user);
      navigate(rolePath(apiRole));
    } catch (err) {
      if (!err?.response) {
        setError("Backend is not reachable. Start the API on port 8000 or check API_URL.");
      } else {
        setError(err?.response?.data?.message || err?.response?.data?.detail || "Unable to sign in with backend credentials.");
      }
    } finally {
      setBusy(false);
    }
  };
  return <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-[55fr_45fr]">
    <section className="relative order-2 hidden overflow-hidden border-r border-slate-200 bg-white p-8 lg:order-1 lg:block lg:p-12 xl:p-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(37,99,235,.10),transparent_32%),radial-gradient(circle_at_75%_65%,rgba(8,145,178,.09),transparent_32%)]"/>
      <div className="relative flex min-h-[260px] flex-col justify-between gap-8 lg:h-full lg:min-h-[420px]">
        <div className="flex items-center gap-3 text-xl font-semibold text-navy lg:text-2xl"><span className="impact-gradient grid h-11 w-11 place-items-center rounded-2xl text-white"><Share2 size={20}/></span>IMPACTX</div>
        <div><h1 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight text-navy sm:text-4xl lg:text-5xl">Connect. Collaborate.<br/><span className="impact-gradient-text">Create Impact.</span></h1><p className="mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-base lg:text-lg lg:leading-8">A secure civic innovation workspace for government validation, institute research teams and industry partnerships.</p></div>
        <div className="grid max-w-lg grid-cols-3 gap-4">{["Citizen","AI","Impact"].map(n=><div key={n} className="rounded-2xl border bg-white p-5 text-center text-sm text-slate-600 shadow-sm"><span className="mx-auto mb-3 block h-2 w-2 rounded-full bg-blue"/>{n}</div>)}</div>
      </div>
    </section>
    <section className="order-1 flex items-start justify-center p-4 py-10 sm:p-6 lg:order-2 lg:items-center lg:p-12"><form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8"><p className="text-sm font-semibold text-blue">Welcome to IMPACTX</p><h2 className="mt-3 text-2xl font-semibold text-navy sm:text-3xl">Choose your workspace.</h2><div className="mt-7 grid grid-cols-3 gap-3">{roles.map(([r,label,Icon])=><button type="button" key={r} onClick={()=>pick(r)} className={`rounded-xl border p-3 text-center text-[10px] font-semibold min-[375px]:text-[11px] sm:text-xs ${role===r?"impact-gradient border-transparent text-white":"bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue"}`}><Icon className="mx-auto mb-1" size={18}/>{label.toUpperCase()}</button>)}</div><label className="mt-7 block text-sm font-semibold text-slate-600">Email<input value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border px-4 py-3 outline-none"/></label><label className="mt-5 block text-sm font-semibold text-slate-600">Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border px-4 py-3 outline-none"/></label>{error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}<button disabled={busy} className="impact-gradient mt-7 w-full rounded-xl px-4 py-3 font-semibold text-white disabled:opacity-60">{busy ? "Signing in..." : "Sign In"}</button></form></section>
  </div>;
}
