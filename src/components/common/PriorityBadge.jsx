const tones = {
  Low: "bg-green/10 text-green border-green/20",
  Medium: "bg-amber-50 text-amber-700 border-amber-100",
  High: "bg-orange/10 text-orange border-orange/20",
  Critical: "bg-red-50 text-red-700 border-red-100"
};
export default function PriorityBadge({ priority }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${tones[priority] || tones.Medium}`}>{priority}</span>;
}
