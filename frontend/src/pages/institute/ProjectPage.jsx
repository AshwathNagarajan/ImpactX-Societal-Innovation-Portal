import { useParams } from "react-router-dom";
import { useState } from "react";
import NextActionsCard from "../../components/ai/NextActionsCard.jsx";
import ProjectHealthCard from "../../components/ai/ProjectHealthCard.jsx";
import ProjectLifecycle from "../../components/ai/ProjectLifecycle.jsx";
import ProgressBar from "../../components/common/ProgressBar.jsx";
import { useImpactData } from "../../hooks/useImpactData.js";

export default function ProjectPage() {
  const { id } = useParams();
  const { data } = useImpactData();
  const [updatedProject, setUpdatedProject] = useState(null);
  const baseProject = data.projects.find((x) => x.id === id) || data.projects[0];
  const p = updatedProject ? { ...baseProject, ...updatedProject, id: updatedProject.project_id || updatedProject.id } : baseProject;
  const team = data.teams[0] || { mentor: "Faculty mentor", departments: ["CSE", "AI & DS", "ECE"] };
  if (!p) return <div className="rounded-2xl border bg-white p-6 shadow-sm">Loading database project...</div>;
  const currentStage = (p.status || p.stage || "PROTOTYPE").toUpperCase?.().replaceAll(" ", "_");

  return (
    <div className="min-w-0 space-y-10">
      <div>
        <p className="text-sm font-semibold text-blue">{p.id || "PRJ-0001"} - {p.university || "Institute Workspace"}</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight text-navy md:text-4xl">{p.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
          Project workspace for lifecycle tracking, milestone review, AI health intelligence and partner collaboration.
        </p>
      </div>

      <ProjectLifecycle project={p} current={currentStage} onUpdated={setUpdatedProject} />

      <div className="grid gap-8 xl:grid-cols-[1.2fr_.8fr]">
        <section className="rounded-2xl border bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-navy md:text-xl">Problem statement</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
            The project addresses a citizen validated {p.category.toLowerCase()} challenge through field research, rapid prototyping and measurable district pilot outcomes.
          </p>
          <h2 className="mt-7 text-lg font-semibold text-navy md:text-xl">Proposed solution</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
            {p.technology} based solution with offline-first workflows, local language support and admin impact reporting.
          </p>
          <div className="mt-7">
            <ProgressBar value={p.progress} />
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-navy md:text-xl">Team</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
            {team.mentor}, 8 students from {(team.departments || []).join(", ")} departments.
          </p>
          <p className="mt-5 text-sm font-semibold text-purple">Industry mentor: Tata Steel Foundation product team</p>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProjectHealthCard health={{ health: "ON_TRACK", health_score: 84, progress: p.progress, summary: "Prototype phase is progressing as expected. Field-testing access is the next major dependency." }} />
        <NextActionsCard actions={["Finalize prototype testing evidence", "Schedule district field validation", "Confirm industry sensor support", "Prepare pilot success metrics"]} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {["Milestones", "Files", "Timeline", "Discussion", "Updates"].map((title) => (
          <div key={title} className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-navy">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">Structured records for weekly review, pilot approvals and team collaboration.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
