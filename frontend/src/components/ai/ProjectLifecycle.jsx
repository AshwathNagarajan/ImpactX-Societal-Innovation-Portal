const defaultSteps = ["PLANNING", "RESEARCH", "SOLUTION_DESIGN", "PROTOTYPE", "TESTING", "PILOT", "IMPLEMENTATION", "IMPACT_MONITORING", "COMPLETED"];

export default function ProjectLifecycle({ current = "PROTOTYPE", steps }) {
  const normalized = current === "ASSIGNED" ? "PLANNING" : current;
  const data = steps || defaultSteps.map((stage) => ({ stage, label: stage.replaceAll("_", " "), state: defaultSteps.indexOf(stage) < defaultSteps.indexOf(normalized) ? "completed" : stage === normalized ? "current" : "upcoming" }));
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-navy">Project Lifecycle</h3>
      <div className="mt-6 grid gap-4 md:hidden">
        {data.map((step) => <Step key={step.stage} step={step} />)}
      </div>
      <div className="mt-6 hidden min-w-0 overflow-x-auto pb-2 md:block">
        <div className="flex min-w-[860px] items-center">
          {data.map((step, index) => (
            <div key={step.stage} className="flex flex-1 items-center">
              <Step step={step} horizontal />
              {index < data.length - 1 && <div className={`h-px flex-1 ${step.state === "upcoming" ? "bg-slate-200" : "bg-blue-200"}`} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Step({ step, horizontal = false }) {
  const active = step.state === "current";
  const completed = step.state === "completed";
  return (
    <div className={`flex items-center gap-3 ${horizontal ? "min-w-24 flex-col text-center" : ""}`}>
      <span className={`grid h-8 w-8 place-items-center rounded-full text-xs font-semibold ${completed ? "bg-green-100 text-green-700" : active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>
        {completed ? "OK" : active ? "ON" : "--"}
      </span>
      <span className="text-xs font-semibold capitalize text-slate-600">{(step.label || step.stage).toLowerCase()}</span>
    </div>
  );
}
