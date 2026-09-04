import { useState } from "react";
import ProjectLifecycle from "../../components/ai/ProjectLifecycle.jsx";
import ProgressBar from "../../components/common/ProgressBar.jsx";
import { useImpactData } from "../../hooks/useImpactData.js";

const lanes = [
  ["PLANNING", "Challenge Intake"],
  ["RESEARCH", "Research"],
  ["SOLUTION_DESIGN", "Blueprint"],
  ["PROTOTYPE", "Prototype"],
  ["TESTING", "Testing"],
  ["PILOT", "Pilot"],
  ["IMPLEMENTATION", "Implementation"],
  ["IMPACT_MONITORING", "Impact Review"],
  ["COMPLETED", "Closed"],
];

export default function Projects() {
  const { data } = useImpactData();
  const [selectedId, setSelectedId] = useState("");
  const [edited, setEdited] = useState({});
  const projects = data.projects.map((project) => ({ ...project, ...(edited[project.id] || {}) }));
  const selected = projects.find((project) => project.id === selectedId) || projects[0];

  const onUpdated = (project) => {
    setEdited((current) => ({
      ...current,
      [project.project_id || project.id]: {
        ...project,
        id: project.project_id || project.id,
        stage: project.current_stage?.label || project.status,
      },
    }));
  };

  return (
    <div className="min-w-0 space-y-8">
      <div>
        <p className="text-sm font-semibold text-blue">Admin Operations</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy md:text-4xl">Project Lifecycle Tracking</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
          Monitor each innovation project from citizen challenge intake to measurable social impact, with stage ownership and database-backed progress actions.
        </p>
      </div>

      {selected && <ProjectLifecycle project={selected} onUpdated={onUpdated} />}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-navy md:text-2xl">Lifecycle Board</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Projects are grouped by their saved backend lifecycle status.</p>
          </div>
          <p className="text-sm font-semibold text-slate-500">{projects.length} active records</p>
        </div>

        <div className="mt-7 overflow-x-auto pb-3">
          <div className="grid min-w-[1180px] grid-cols-9 gap-4">
            {lanes.map(([stage, label]) => (
              <section key={stage} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-navy">{label}</h3>
                  <p className="mt-1 text-xs text-slate-500">{projects.filter((project) => project.status === stage).length} projects</p>
                </div>
                <div className="space-y-3">
                  {projects.filter((project) => project.status === stage).map((project) => (
                    <button key={project.id} onClick={() => setSelectedId(project.id)} className={`w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-blue/30 hover:shadow-md ${selected?.id === project.id ? "border-blue/40 ring-4 ring-blue/10" : "border-slate-200"}`}>
                      <p className="line-clamp-3 text-sm font-semibold leading-5 text-navy">{project.title}</p>
                      <p className="mt-2 text-xs text-slate-500">{project.university}</p>
                      <div className="mt-4">
                        <ProgressBar value={project.progress} />
                      </div>
                    </button>
                  ))}
                  {!projects.some((project) => project.status === stage) && <p className="rounded-xl border border-dashed border-slate-200 bg-white/60 p-3 text-xs leading-5 text-slate-400">No projects in this stage.</p>}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
