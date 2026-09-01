import ProgressBar from "../common/ProgressBar.jsx";
export default function ProjectCard({ project, action }) {
  return <div className="premium-card w-full min-w-0 rounded-2xl border p-5 transition duration-200 hover:-translate-y-0.5 hover:border-green/25">
    <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><span className="rounded-full border border-purple/20 bg-purple/10 px-2.5 py-1 text-xs font-semibold text-purple">AI Insight</span><h3 className="mt-3 font-semibold leading-tight text-navy">{project.title}</h3><p className="mt-1 text-sm text-slate-500">{project.university || project.category}</p></div><span className="rounded-full border border-green/20 bg-green/10 px-2.5 py-1 text-xs font-semibold text-green">{project.impact || project.progress}% Impact</span></div>
    <p className="mt-3 text-sm text-slate-600">{project.technology} • {project.support}</p>
    <div className="mt-4"><div className="mb-2 flex justify-between text-xs text-slate-500"><span>Project stage</span><span>{project.progress}%</span></div><ProgressBar value={project.progress}/></div>{action}
  </div>;
}
