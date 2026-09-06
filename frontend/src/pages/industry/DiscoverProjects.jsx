import { useEffect, useState } from "react";
import ProjectLifecycle from "../../components/ai/ProjectLifecycle.jsx";
import ProjectCard from "../../components/dashboard/ProjectCard.jsx";
import { useImpactData } from "../../hooks/useImpactData.js";
import { industryService } from "../../services/industryService.js";
import { apiErrorMessage } from "../../utils/apiError.js";

export default function DiscoverProjects({ recommendedOnly = false }) {
  const { data } = useImpactData();
  const [recommended, setRecommended] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
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
  const supportProject = async (project) => {
    const id = project.project_id || project.id;
    setBusy(id);
    setMessage("");
    setError("");
    try {
      await industryService.supportProject(id, {
        support_type: project.support || "Technical Mentorship",
        contribution: "Support offered from industry project discovery.",
        notes: recommendedOnly ? "Registered from recommended projects." : "Registered from discover projects.",
      });
      setMessage(`Support registered for ${project.title}.`);
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to register support."));
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="min-w-0 space-y-8">
      <div>
        <p className="text-sm font-semibold text-teal">Industry Collaboration</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy md:text-4xl">{recommendedOnly ? "Recommended Projects" : "Discover Projects"}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">{recommendedOnly ? "AI-ranked project opportunities aligned to industry mentorship, pilot, funding and implementation support." : "Review database-backed project lifecycles and support opportunities ready for funding, mentorship, pilot deployment or implementation."}</p>
      </div>
      {message && <p className="rounded-2xl bg-green/10 p-4 font-semibold text-green">{message}</p>}
      {error && <p className="rounded-2xl bg-red-50 p-4 font-semibold text-red-600">{error}</p>}
      {selected && <ProjectLifecycle project={selected} />}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id || project.project_id} project={project} action={<div className="mt-5 grid gap-3 sm:grid-cols-2"><button onClick={() => setSelectedId(project.id || project.project_id)} className="rounded-xl border border-teal/30 bg-teal/10 px-4 py-3 text-sm font-semibold text-teal transition hover:bg-teal/15">{recommendedOnly ? "Review fit" : "Review lifecycle"}</button><button disabled={busy === (project.project_id || project.id)} onClick={() => supportProject(project)} className="rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal/90 disabled:opacity-60">{busy === (project.project_id || project.id) ? "Saving..." : "Offer support"}</button></div>} />
        ))}
      </div>
      {!projects.length && <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">No projects are available in this view yet.</div>}
    </div>
  );
}
