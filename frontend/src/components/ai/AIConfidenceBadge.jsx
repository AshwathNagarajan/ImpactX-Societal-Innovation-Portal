export default function AIConfidenceBadge({ value = 0 }) {
  const percent = Math.round((value > 1 ? value : value * 100) || 0);
  return (
    <span className="inline-flex min-h-9 items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue">
      {percent}% AI confidence
    </span>
  );
}

