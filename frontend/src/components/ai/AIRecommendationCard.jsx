import AIMatchScore from "./AIMatchScore.jsx";

export default function AIRecommendationCard({ title, subtitle, match = 0, reason, tags = [], actionLabel = "View Details", onAction }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:border-slate-300 hover:shadow-md md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0 flex-1">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue">AI Recommendation</span>
          <h3 className="mt-4 text-lg font-semibold leading-tight text-navy">{title}</h3>
          {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
        </div>
        <AIMatchScore value={match} size="sm" />
      </div>
      {reason && <p className="mt-5 text-sm leading-7 text-slate-600">{reason}</p>}
      <div className="mt-5 flex flex-wrap gap-2">
        {tags.slice(0, 5).map((tag) => (
          <span key={tag} className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal">{tag}</span>
        ))}
      </div>
      <button onClick={onAction} className="impact-gradient mt-6 min-h-11 rounded-xl px-5 py-2.5 text-sm font-semibold text-white">
        {actionLabel}
      </button>
    </article>
  );
}
