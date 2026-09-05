import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2, Factory, LockKeyhole, Mail, Shield, Sparkles } from "lucide-react";
import { loginWithApi } from "../../services/authService.js";
import { credentials, rolePath, saveUser } from "../../utils/auth.js";

const roles = [
  { id: "admin", label: "Admin", description: "Review, validate, assign", icon: Shield },
  { id: "institute", label: "Institute", description: "Research and delivery", icon: Building2 },
  { id: "industry", label: "Industry", description: "Funding and pilots", icon: Factory },
];

const metrics = ["Live backend auth", "Role based routing", "MongoDB workspace"];

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
    <main className="min-h-[calc(100vh-72px)] bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-136px)] max-w-6xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/30 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="border-b border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,.10),rgba(255,255,255,.03))] p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-4">
              <img src="/impactx-logo.png" alt="IMPACTX" className="h-14 w-14 rounded-2xl bg-white object-contain p-1" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">IMPACTX</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">Secure access</h1>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {roles.map(({ id, label, description, icon: Icon }) => {
                const selected = role === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => pick(id)}
                    className={`flex min-h-20 w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${selected ? "border-white/30 bg-white text-slate-950" : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07]"}`}
                  >
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${selected ? "bg-slate-950 text-white" : "bg-white/10 text-slate-200"}`}>
                      <Icon size={20} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{label}</span>
                      <span className={`mt-1 block text-xs leading-5 ${selected ? "text-slate-600" : "text-slate-400"}`}>{description}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 grid gap-3">
              {metrics.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                  <Sparkles size={15} className="text-slate-400" />
                  {item}
                </div>
              ))}
            </div>
          </aside>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="max-w-xl">
              <p className="text-sm font-semibold text-slate-400">{activeRole.name}</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Sign in to your workspace</h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">Use the selected role credentials to enter the correct dashboard.</p>
            </div>

            <form onSubmit={submit} className="mt-8 max-w-xl space-y-5">
              <Field label="Email" icon={Mail}>
                <input value={email} onChange={(event) => setEmail(event.target.value)} className="min-h-12 w-full border-0 bg-transparent p-0 text-white outline-none placeholder:text-slate-500" autoComplete="email" />
              </Field>
              <Field label="Password" icon={LockKeyhole}>
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-12 w-full border-0 bg-transparent p-0 text-white outline-none placeholder:text-slate-500" autoComplete="current-password" />
              </Field>

              <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300 sm:grid-cols-2">
                <p><span className="block text-xs uppercase tracking-[0.18em] text-slate-500">Email</span>{activeRole.email}</p>
                <p><span className="block text-xs uppercase tracking-[0.18em] text-slate-500">Password</span>{activeRole.password}</p>
              </div>

              {error && <p className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-semibold text-red-200">{error}</p>}

              <button disabled={busy} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 shadow-sm transition hover:bg-slate-200 disabled:opacity-60">
                {busy ? "Signing in..." : "Enter workspace"}
                {!busy && <ArrowRight size={18} />}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <label className="block text-sm font-semibold text-slate-300">
      {label}
      <span className="mt-2 flex min-h-14 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 focus-within:border-white/30 focus-within:ring-4 focus-within:ring-white/10">
        <Icon className="shrink-0 text-slate-500" size={18} />
        {children}
      </span>
    </label>
  );
}
