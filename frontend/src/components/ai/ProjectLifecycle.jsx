import { Check, Clock, Flag, Lock, Sparkles } from "lucide-react";
import { useState } from "react";
import { projectService } from "../../services/projectService.js";
import { getUser } from "../../utils/auth.js";

const defaultSteps = ["PLANNING", "RESEARCH", "SOLUTION_DESIGN", "PROTOTYPE", "TESTING", "PILOT", "IMPLEMENTATION", "IMPACT_MONITORING", "COMPLETED"];

const labels = {
  PLANNING: "Challenge Intake",
  RESEARCH: "Research Validation",
  SOLUTION_DESIGN: "Solution Blueprint",
  PROTOTYPE: "Prototype Build",
  TESTING: "Lab & Field Testing",
  PILOT: "Pilot Deployment",
  IMPLEMENTATION: "Implementation",
  IMPACT_MONITORING: "Impact Monitoring",
  COMPLETED: "Impact Closed",
};

const descriptions = {
  PLANNING: "Scope, ownership and field context are being confirmed.",
  RESEARCH: "Root causes, users, constraints and field evidence are validated.",
  SOLUTION_DESIGN: "Architecture, resources and implementation plan are prepared.",
  PROTOTYPE: "A working prototype is developed with success criteria.",
  TESTING: "The prototype is tested for reliability and field readiness.",
  PILOT: "Partners support controlled deployment in target locations.",
  IMPLEMENTATION: "The solution is scaled with administrative ownership.",
  IMPACT_MONITORING: "Adoption, beneficiary reach and outcomes are measured.",
  COMPLETED: "Impact evidence is ready for reporting.",
};

function normalizeStage(value) {
  const stage = String(value || "PLANNING").toUpperCase().replaceAll(" ", "_");
  return stage === "ASSIGNED" ? "PLANNING" : stage;
}

function buildSteps(current) {
  const normalized = normalizeStage(current);
  const currentIndex = Math.max(0, defaultSteps.indexOf(normalized));
  return defaultSteps.map((stage, index) => ({
    stage,
    label: labels[stage],
    summary: descriptions[stage],
    state: index < currentIndex ? "completed" : index === currentIndex ? "current" : "upcoming",
  }));
}

export default function ProjectLifecycle({ project, current = "PROTOTYPE", steps, actions = [], history = [], onUpdated }) {
  const user = getUser();
  const projectId = project?.id || project?.project_id;
  const lifecycle = steps?.length ? steps : project?.lifecycle?.length ? project.lifecycle : buildSteps(project?.status || project?.stage || current);
  const currentStep = lifecycle.find((step) => step.state === "current") || lifecycle[0];
  const roleActions = actions.length ? actions : availableFallbackActions(currentStep?.stage, user?.role);
  const [busy, setBusy] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const runAction = async (action) => {
    if (!projectId) return;
    setBusy(action.target_status);
    setMessage("");
    setError("");
    try {
      const response = await projectService.transition(projectId, action.target_status, note || action.description || "Lifecycle updated from project workspace.");
      setMessage(`Project moved to ${labels[action.target_status] || action.target_status.replaceAll("_", " ")}.`);
      setNote("");
      onUpdated?.(response.data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to update lifecycle stage.");
    } finally {
      setBusy("");
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7 lg:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue">
            <Sparkles size={14} /> Project Lifecycle
          </p>
          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-navy">{currentStep?.label || "Lifecycle Tracking"}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">{currentStep?.summary || "Track the project from challenge intake through implementation and measured impact."}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 lg:min-w-64">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Current owner</p>
          <p className="mt-1 text-lg font-semibold text-navy">{currentStep?.owner || ownerForStage(currentStep?.stage)}</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Project progress</p>
          <p className="mt-1 text-3xl font-semibold text-blue">{project?.progress ?? currentStep?.progress ?? 0}%</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:hidden">
        {lifecycle.map((step) => <StageRow key={step.stage} step={step} />)}
      </div>

      <div className="mt-9 hidden overflow-x-auto pb-3 md:block">
        <div className="flex min-w-[980px] items-start">
          {lifecycle.map((step, index) => (
            <div key={step.stage} className="flex flex-1 items-start">
              <StageNode step={step} />
              {index < lifecycle.length - 1 && <div className={`mt-5 h-px flex-1 ${step.state === "upcoming" ? "bg-slate-200" : "bg-blue-200"}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_.8fr]">
        <div className="rounded-2xl bg-slate-50 p-4 md:p-5">
          <h4 className="font-semibold text-navy">Next lifecycle action</h4>
          {roleActions.length ? (
            <div className="mt-4 space-y-4">
              <textarea value={note} onChange={(event) => setNote(event.target.value)} rows="3" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/10" placeholder="Add an optional lifecycle note for the audit trail" />
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {roleActions.map((action) => (
                  <button key={action.target_status} disabled={busy === action.target_status} onClick={() => runAction(action)} className="impact-gradient min-h-11 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 disabled:opacity-60">
                    {busy === action.target_status ? "Updating..." : action.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-600">No lifecycle action is assigned to your role at this stage. You can still monitor progress and review history.</p>
          )}
          {message && <p className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green">{message}</p>}
          {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}
        </div>

        <div className="rounded-2xl bg-slate-50 p-4 md:p-5">
          <h4 className="font-semibold text-navy">Recent stage history</h4>
          <div className="mt-4 space-y-3">
            {(history.length ? history.slice(-3).reverse() : project?.status_history?.slice(-3).reverse() || []).map((item, index) => (
              <div key={`${item.to}-${index}`} className="rounded-xl bg-white p-3 text-sm text-slate-600">
                <p className="font-semibold text-navy">{labels[item.to] || item.to}</p>
                <p className="mt-1 text-xs text-slate-500">{item.note || "Lifecycle stage updated."}</p>
              </div>
            ))}
            {!history.length && !project?.status_history?.length && <p className="text-sm leading-6 text-slate-600">Stage updates will appear here after the project moves forward.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

function StageRow({ step }) {
  return (
    <div className="grid grid-cols-[36px_1fr] gap-3">
      <StatusIcon step={step} />
      <div className="pb-4">
        <p className="font-semibold text-navy">{step.label || labels[step.stage]}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">{step.summary || descriptions[step.stage]}</p>
      </div>
    </div>
  );
}

function StageNode({ step }) {
  return (
    <div className="w-28 text-center">
      <div className="mx-auto w-fit"><StatusIcon step={step} /></div>
      <p className="mt-3 text-xs font-semibold leading-5 text-navy">{step.label || labels[step.stage]}</p>
      <p className="mt-1 text-[11px] leading-4 text-slate-500">{step.owner || ownerForStage(step.stage)}</p>
    </div>
  );
}

function StatusIcon({ step }) {
  const completed = step.state === "completed";
  const current = step.state === "current";
  const className = completed ? "bg-green-100 text-green-700" : current ? "bg-blue text-white shadow-sm shadow-blue/20" : "bg-slate-100 text-slate-400";
  const Icon = completed ? Check : current ? Flag : step.state === "upcoming" ? Lock : Clock;
  return <span className={`grid h-10 w-10 place-items-center rounded-full ${className}`}><Icon size={17} /></span>;
}

function ownerForStage(stage) {
  if (["RESEARCH", "SOLUTION_DESIGN", "PROTOTYPE", "TESTING"].includes(stage)) return "Institute";
  if (stage === "PILOT") return "Industry";
  return "Admin";
}

function availableFallbackActions(stage, role) {
  const normalizedRole = String(role || "").toUpperCase();
  const map = {
    PLANNING: [{ role: "ADMIN", label: "Start Research", target_status: "RESEARCH", description: "Assign institute ownership and begin field research." }],
    RESEARCH: [{ role: "INSTITUTE", label: "Submit Blueprint", target_status: "SOLUTION_DESIGN", description: "Move from problem research to proposed solution design." }],
    SOLUTION_DESIGN: [{ role: "INSTITUTE", label: "Begin Prototype", target_status: "PROTOTYPE", description: "Approve the blueprint and start prototype development." }],
    PROTOTYPE: [{ role: "INSTITUTE", label: "Send To Testing", target_status: "TESTING", description: "Prototype is ready for controlled testing." }],
    TESTING: [{ role: "INSTITUTE", label: "Request Pilot", target_status: "PILOT", description: "Testing is complete and pilot support is required." }],
    PILOT: [{ role: "INDUSTRY", label: "Support Implementation", target_status: "IMPLEMENTATION", description: "Confirm pilot support and implementation readiness." }],
    IMPLEMENTATION: [{ role: "ADMIN", label: "Start Impact Review", target_status: "IMPACT_MONITORING", description: "Begin official outcome measurement." }],
    IMPACT_MONITORING: [{ role: "ADMIN", label: "Close Project", target_status: "COMPLETED", description: "Mark project complete with impact evidence." }],
  };
  return (map[stage] || []).filter((action) => action.role === normalizedRole);
}
