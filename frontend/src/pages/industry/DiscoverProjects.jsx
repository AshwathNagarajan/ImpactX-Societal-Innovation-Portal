import { useState } from "react";
import ProjectLifecycle from "../../components/ai/ProjectLifecycle.jsx";
import ProjectCard from "../../components/dashboard/ProjectCard.jsx";
import { useImpactData } from "../../hooks/useImpactData.js";

export default function DiscoverProjects() {
  const { data } = useImpactData();
  const [selectedId, setSelectedId] = useState("");
  const selected = data.projects.find((project) => project.id === selectedId) || data.projects[0];

  return (
    <div className="min-w-0 space-y-8">
      <div>
        <p className="text-sm font-semibold text-teal">Industry Collaboration</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy md:text-4xl">Discover Projects</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">Review database-backed project lifecycles and support opportunities ready for funding, mentorship, pilot deployment or implementation.</p>
      </div>
      {selected && <ProjectLifecycle project={selected} />}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {data.projects.map((project) => (
          <ProjectCard key={project.id} project={project} action={<button onClick={() => setSelectedId(project.id)} className="mt-5 w-full rounded-xl border border-teal/30 bg-teal/10 px-4 py-3 text-sm font-semibold text-teal transition hover:bg-teal/15">Review lifecycle</button>} />
        ))}
      </div>
    </div>
  );
}
