import ProgressBar from "../common/ProgressBar.jsx";
export default function ProjectCard({ project, action }) {
  const stage = project.current_stage?.label || project.stage || String(project.status || "Project Stage").replaceAll("_", " ");
  return <div className="premium-card w-full min-w-0 rounded-2xl border p-6 transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
    <div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0"><span className="rounded-full border border-purple/20 bg-purple/10 px-3 py-1 text-xs font-semibold text-purple">AI Insight</span><h3 className="mt-4 text-lg font-semibold leading-tight text-navy">{project.title}</h3><p className="mt-2 text-sm text-slate-500">{project.university || project.category}</p></div><span className="rounded-full border border-green/20 bg-green/10 px-3 py-1 text-xs font-semibold text-green">{project.impact || project.progress}% Impact</span></div>
    <p className="mt-4 text-sm leading-6 text-slate-600">{project.technology} • {project.support}</p>
    <div className="mt-5 rounded-2xl bg-slate-50 p-4">
      <div className="mb-2 flex justify-between gap-3 text-xs text-slate-500"><span className="font-semibold text-slate-600">{stage}</span><span>{project.progress}%</span></div>
      <ProgressBar value={project.progress}/>
      <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">{project.current_stage?.summary || "Lifecycle progress is synced from the project database."}</p>
    </div>{action}
  </div>;
}
