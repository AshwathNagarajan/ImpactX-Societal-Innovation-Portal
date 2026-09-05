const tones = {
  Low: "bg-green/10 text-green border-green/20",
  Medium: "bg-amber-400/10 text-amber-500 border-amber-400/20",
  High: "bg-orange/10 text-orange border-orange/20",
  Critical: "bg-red-500/10 text-red-500 border-red-500/20"
};
export default function PriorityBadge({ priority }) {
  const label = formatBadgeLabel(priority || "Medium");
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${tones[label] || tones.Medium}`}>{label}</span>;
}

function formatBadgeLabel(value) {
  return String(value).toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
