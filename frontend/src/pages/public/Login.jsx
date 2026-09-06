import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2, CheckCircle2, Factory, LockKeyhole, Mail, Shield, Sparkles } from "lucide-react";
import { loginWithApi } from "../../services/authService.js";
import { credentials, rolePath, saveUser } from "../../utils/auth.js";

const roles = [
  { id: "admin", label: "Admin", description: "Review, validate, assign", icon: Shield },
  { id: "institute", label: "Institute", description: "Research and delivery", icon: Building2 },
  { id: "industry", label: "Industry", description: "Funding and pilots", icon: Factory },
];

const metrics = [
  ["3", "secure workspaces"],
  ["24", "districts connected"],
  ["2.4L+", "citizens impacted"],
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
    <main className="relative isolate min-h-[calc(100vh-72px)] overflow-hidden bg-transparent px-4 py-8 text-slate-100 sm:px-6 lg:px-10 lg:py-12">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_12%,rgba(148,163,184,.18),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(100,116,139,.18),transparent_32%),linear-gradient(135deg,rgba(17,24,39,.72)_0%,rgba(30,41,59,.84)_52%,rgba(38,50,68,.72)_100%)]" />
      <div className="mx-auto grid min-h-[calc(100vh-168px)] max-w-[1280px] items-center gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,.95fr)]">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-800/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,.22)] sm:p-8 lg:p-10">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-bl-full bg-white/5" />
          <div className="relative">
            <div className="flex items-center gap-4">
              <img src="/impactx-logo.png" alt="IMPACTX" className="h-14 w-14 rounded-2xl border border-slate-200 bg-white object-contain p-2 shadow-sm" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Secure access</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-navy">IMPACTX</h1>
              </div>
            </div>

            <div className="mt-16 max-w-2xl lg:mt-24">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <Sparkles size={14} />
                Civic innovation command center
              </span>
              <h2 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-navy sm:text-5xl lg:text-6xl">
                Connect public problems to accountable action.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 lg:text-lg">
                A professional workspace for government validation, institute research teams and industry partners building measurable social impact.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {metrics.map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="impact-gradient-text text-3xl font-semibold tracking-tight">{value}</p>
                  <p className="mt-2 text-sm text-slate-500">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-navy">Access workflow</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {["Authenticate role", "Open dashboard", "Coordinate impact"].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
                    <CheckCircle2 size={17} className="text-slate-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-800/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,.24)] sm:p-7 lg:p-8">
          <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-slate-800/90 to-slate-900/80 p-5 sm:p-7">
            <div>
              <p className="text-sm font-semibold text-blue">Welcome to IMPACTX</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">Sign in to your workspace</h2>
              <p className="mt-3 text-sm leading-7 text-slate-500">Choose the workspace role.</p>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {roles.map(({ id, label, description, icon: Icon }) => {
                const selected = role === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => pick(id)}
                    className={`flex min-h-24 flex-col items-start justify-between rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${selected ? "border-slate-700 bg-slate-800 text-white shadow-lg shadow-slate-900/10" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:shadow-sm"}`}
                  >
                    <Icon size={20} className={selected ? "text-white" : "text-slate-500"} />
                    <span>
                      <span className="block text-sm font-semibold uppercase tracking-wide">{label}</span>
                      <span className={`mt-1 hidden text-xs leading-5 sm:block ${selected ? "text-slate-300" : "text-slate-500"}`}>{description}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={submit} className="mt-8 space-y-5">
              <Field label="Email" icon={Mail}>
                <input value={email} onChange={(event) => setEmail(event.target.value)} className="min-h-12 w-full border-0 bg-transparent p-0 text-slate-100 outline-none placeholder:text-slate-500" autoComplete="email" />
              </Field>
              <Field label="Password" icon={LockKeyhole}>
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-12 w-full border-0 bg-transparent p-0 text-slate-100 outline-none placeholder:text-slate-500" autoComplete="current-password" />
              </Field>

              {error && <p className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">{error}</p>}

              <button disabled={busy} className="impact-gradient flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-white shadow-sm transition disabled:opacity-60">
                {busy ? "Signing in..." : "Enter workspace"}
                {!busy && <ArrowRight size={18} />}
              </button>
            </form>
          </div>
          <p className="mt-5 text-center text-xs leading-6 text-slate-400">Protected dashboards use backend authentication and role-based routing.</p>
        </section>
      </div>
    </main>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <span className="mt-2 flex min-h-14 items-center gap-3 rounded-xl border border-white/10 bg-slate-900/45 px-4 focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-400/10">
        <Icon className="shrink-0 text-slate-400" size={18} />
        {children}
      </span>
    </label>
  );
}
