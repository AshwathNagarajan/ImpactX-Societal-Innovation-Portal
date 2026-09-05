export default function MilestoneCard({ milestone }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold text-navy">{milestone.title}</h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{milestone.status}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{milestone.description}</p>
      <div className="mt-5 h-2 rounded-full bg-slate-100">
        <div className="impact-gradient h-full rounded-full" style={{ width: `${milestone.completion_percentage || 0}%` }} />
      </div>
    </article>
  );
}
