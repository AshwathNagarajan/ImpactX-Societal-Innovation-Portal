import { useEffect, useState } from "react";
import ProjectLifecycle from "../../components/ai/ProjectLifecycle.jsx";
import ProjectCard from "../../components/dashboard/ProjectCard.jsx";
import { useImpactData } from "../../hooks/useImpactData.js";
import { industryService } from "../../services/industryService.js";

export default function DiscoverProjects({ recommendedOnly = false }) {
  const { data } = useImpactData();
  const [recommended, setRecommended] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  useEffect(() => {
    if (!recommendedOnly) return;
    let active = true;
    industryService.recommendedProjects().then((res) => active && setRecommended(res.items || [])).catch(() => active && setRecommended([]));
    return () => {
      active = false;
    };
  }, [recommendedOnly]);
  const projects = recommendedOnly ? recommended : data.projects;
  const selected = projects.find((project) => project.id === selectedId || project.project_id === selectedId) || projects[0];

  return (
    <div className="min-w-0 space-y-8">
      <div>
        <p className="text-sm font-semibold text-teal">Industry Collaboration</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy md:text-4xl">{recommendedOnly ? "Recommended Projects" : "Discover Projects"}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">{recommendedOnly ? "AI-ranked project opportunities aligned to industry mentorship, pilot, funding and implementation support." : "Review database-backed project lifecycles and support opportunities ready for funding, mentorship, pilot deployment or implementation."}</p>
      </div>
      {selected && <ProjectLifecycle project={selected} />}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id || project.project_id} project={project} action={<button onClick={() => setSelectedId(project.id || project.project_id)} className="mt-5 w-full rounded-xl border border-teal/30 bg-teal/10 px-4 py-3 text-sm font-semibold text-teal transition hover:bg-teal/15">{recommendedOnly ? "Review recommended fit" : "Review lifecycle"}</button>} />
        ))}
      </div>
      {!projects.length && <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">No projects are available in this view yet.</div>}
    </div>
  );
}
