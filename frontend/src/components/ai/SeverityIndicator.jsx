const styles = {
  LOW: "border-green-100 bg-green-50 text-green-700",
  MODERATE: "border-amber-100 bg-amber-50 text-amber-700",
  HIGH: "border-orange-100 bg-orange-50 text-orange-700",
  CRITICAL: "border-red-100 bg-red-50 text-red-700",
};

export default function SeverityIndicator({ severity = {} }) {
  const level = severity.level || severity || "MODERATE";
  const score = severity.score ?? 50;
  return (
    <div className={`rounded-2xl border p-4 ${styles[level] || styles.MODERATE}`}>
      <p className="text-xs font-semibold uppercase tracking-wide">Severity</p>
      <div className="mt-2 flex items-end justify-between gap-4">
        <strong className="text-lg">{level}</strong>
        <span className="text-sm font-semibold">{score}/100</span>
      </div>
    </div>
  );
}

