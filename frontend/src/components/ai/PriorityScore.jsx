export default function PriorityScore({ priority = {} }) {
  const score = priority.score ?? priority.priority_score ?? 72;
  const level = priority.level ?? priority.priority_level ?? "HIGH";
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-blue">
      <p className="text-xs font-semibold uppercase tracking-wide">Priority</p>
      <div className="mt-2 flex items-end justify-between gap-4">
        <strong className="text-lg">{level}</strong>
        <span className="text-sm font-semibold">{score}/100</span>
      </div>
    </div>
  );
}

