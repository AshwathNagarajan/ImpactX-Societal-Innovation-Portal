import { useState } from "react";
import ProjectLifecycle from "../../components/ai/ProjectLifecycle.jsx";
import Modal from "../../components/common/Modal.jsx";
import ProgressBar from "../../components/common/ProgressBar.jsx";
import ProjectCard from "../../components/dashboard/ProjectCard.jsx";
import { useImpactData } from "../../hooks/useImpactData.js";

const stageLabels = {
  PLANNING: "Challenge Intake",
  RESEARCH: "Research",
  SOLUTION_DESIGN: "Blueprint",
  PROTOTYPE: "Prototype",
  TESTING: "Testing",
  PILOT: "Pilot",
  IMPLEMENTATION: "Implementation",
  IMPACT_MONITORING: "Impact Review",
  COMPLETED: "Closed",
};

export default function Projects() {
  const { data } = useImpactData();
  const [selectedId, setSelectedId] = useState("");
  const [edited, setEdited] = useState({});
  const projects = data.projects.map((project) => ({ ...project, ...(edited[project.id] || {}) }));
  const selected = projects.find((project) => project.id === selectedId);

  const onUpdated = (project) => {
    const id = project.project_id || project.id;
    setEdited((current) => ({
      ...current,
      [id]: {
        ...project,
        id,
        current_stage: project.current_stage,
        lifecycle: project.lifecycle,
        progress: project.progress,
        status: project.status,
        stage: project.current_stage?.label || stageLabels[project.status] || project.status,
      },
    }));
  };

  return (
    <div className="min-w-0 space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue">Admin Operations</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy md:text-4xl">Project Lifecycle Tracking</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
            Review each innovation project as a focused card. Open a project to inspect the complete lifecycle, stage owner, progress trail and available backend action.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
          <span className="block text-2xl font-semibold text-blue">{projects.length}</span>
          active project records
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-navy md:text-2xl">Project Cards</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Click any project card to open the floating lifecycle tracker.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stageLabels).slice(0, 5).map(([stage, label]) => (
              <span key={stage} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                {projects.filter((project) => project.status === stage).length} {label}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              action={
                <button onClick={() => setSelectedId(project.id)} className="mt-5 w-full rounded-xl border border-blue/30 bg-blue/10 px-4 py-3 text-sm font-semibold text-blue transition hover:bg-blue/15">
                  Open tracking progress
                </button>
              }
            />
          ))}
        </div>
      </section>

      <Modal open={!!selected} title={selected ? `${selected.id} Tracking Progress` : "Tracking Progress"} onClose={() => setSelectedId("")} size="xl">
        {selected && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{selected.university || "Partner Institute"}</p>
              <h3 className="mt-2 text-2xl font-semibold leading-tight text-navy">{selected.title}</h3>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <Info label="Stage" value={selected.current_stage?.label || selected.stage || stageLabels[selected.status] || selected.status} />
                <Info label="Support" value={selected.support || "Technical Mentorship"} />
                <Info label="Technology" value={selected.technology || "Civic Technology"} />
              </div>
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                  <span className="font-semibold">Overall progress</span>
                  <span>{selected.progress}%</span>
                </div>
                <ProgressBar value={selected.progress} />
              </div>
            </div>
            <ProjectLifecycle project={selected} onUpdated={onUpdated} />
          </div>
        )}
      </Modal>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-navy">{value}</p>
    </div>
  );
}
