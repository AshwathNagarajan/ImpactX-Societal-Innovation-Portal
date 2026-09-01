const tones = {
  Low: "bg-green/10 text-green border-green/20",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  High: "bg-orange/10 text-orange border-orange/20",
  Critical: "bg-red-500/10 text-red-400 border-red-500/20"
};
export default function PriorityBadge({ priority }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${tones[priority] || tones.Medium}`}>{priority}</span>;
}
