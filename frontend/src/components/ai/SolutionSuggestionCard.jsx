export default function SolutionSuggestionCard({ solution }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-navy">{solution.title}</h3>
        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">{solution.estimated_complexity}</span>
      </div>
      <p className="mt-3 text-sm leading-7 text-slate-600">{solution.approach}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(solution.technologies || []).slice(0, 4).map((item) => (
          <span key={item} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue">{item}</span>
        ))}
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">AI-generated recommendation - review before adoption.</p>
    </article>
  );
}

