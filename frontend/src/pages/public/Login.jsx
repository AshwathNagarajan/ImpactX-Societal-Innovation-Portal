import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2, CheckCircle2, Factory, LockKeyhole, Mail, Shield } from "lucide-react";
import { loginWithApi } from "../../services/authService.js";
import { credentials, rolePath, saveUser } from "../../utils/auth.js";

const roles = [
  ["admin", "Admin", "Validation, approvals and assignments", Shield],
  ["institute", "Institute", "Research teams and project delivery", Building2],
  ["industry", "Industry", "Funding, pilots and mentorship", Factory],
];

export default function Login() {
  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState(credentials.admin.email);
  const [password, setPassword] = useState(credentials.admin.password);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const activeRole = credentials[role];

  const pick = (nextRole) => {
    setRole(nextRole);
    setEmail(credentials[nextRole].email);
    setPassword(credentials[nextRole].password);
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
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

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[linear-gradient(135deg,#f8fafc_0%,#eef2f7_48%,#e5e7eb_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-136px)] max-w-6xl items-center gap-8 lg:grid-cols-[0.94fr_1.06fr]">
        <section className="min-w-0">
          <div className="flex items-center gap-4">
            <img src="/impactx-logo.png" alt="IMPACTX" className="h-16 w-16 rounded-2xl bg-white object-contain p-1 shadow-sm" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">IMPACTX</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Workspace sign in</h1>
            </div>
          </div>

          <div className="mt-10 grid gap-3">
            {roles.map(([id, label, description, Icon]) => {
              const selected = role === id;
              return (
                <button
                  type="button"
                  key={id}
                  onClick={() => pick(id)}
                  className={`flex min-h-24 w-full items-center gap-4 rounded-2xl border p-4 text-left shadow-sm transition ${selected ? "border-slate-900 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"}`}
                >
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${selected ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700"}`}>
                    <Icon size={22} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-base font-semibold ${selected ? "text-white" : "text-slate-950"}`}>{label}</span>
                    <span className={`mt-1 block text-sm leading-6 ${selected ? "text-slate-300" : "text-slate-500"}`}>{description}</span>
                  </span>
                  {selected && <CheckCircle2 className="shrink-0 text-slate-200" size={20} />}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70 sm:p-7 lg:p-8">
          <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">{activeRole.name}</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Enter credentials</h2>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{role}</span>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-5">
            <label className="block text-sm font-semibold text-slate-700">
              Email
              <span className="mt-2 flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 focus-within:border-slate-500 focus-within:ring-4 focus-within:ring-slate-500/10">
                <Mail className="shrink-0 text-slate-400" size={18} />
                <input value={email} onChange={(event) => setEmail(event.target.value)} className="min-h-11 w-full border-0 bg-transparent p-0 outline-none" autoComplete="email" />
              </span>
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Password
              <span className="mt-2 flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 focus-within:border-slate-500 focus-within:ring-4 focus-within:ring-slate-500/10">
                <LockKeyhole className="shrink-0 text-slate-400" size={18} />
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-11 w-full border-0 bg-transparent p-0 outline-none" autoComplete="current-password" />
              </span>
            </label>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              <p className="font-semibold text-slate-900">Demo credentials</p>
              <p className="mt-1">{activeRole.email}</p>
              <p>{activeRole.password}</p>
            </div>

            {error && <p className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">{error}</p>}

            <button disabled={busy} className="impact-gradient flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-white shadow-sm disabled:opacity-60">
              {busy ? "Signing in..." : "Sign in"}
              {!busy && <ArrowRight size={18} />}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
