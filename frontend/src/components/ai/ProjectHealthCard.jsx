export default function ProjectHealthCard({ health = {} }) {
  const score = health.health_score ?? 82;
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-blue">AI Project Intelligence</p>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold text-navy">{health.health || "ON_TRACK"}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{health.summary || "Project is progressing within expected range."}</p>
        </div>
        <strong className="impact-gradient-text text-4xl font-semibold">{score}</strong>
      </div>
      <div className="mt-5 h-2 rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-gradient-to-r from-blue via-cyan to-teal" style={{ width: `${Math.min(100, score)}%` }} />
      </div>
    </section>
  );
}

