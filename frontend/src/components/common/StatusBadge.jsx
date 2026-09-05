const tones = {
  Submitted: "bg-slate-400/10 text-slate-400 border-slate-400/20",
  "Under Review": "bg-blue/10 text-blue border-blue/20",
  Validated: "bg-green/10 text-green border-green/20",
  Assigned: "bg-purple/10 text-purple border-purple/20",
  "In Development": "bg-purple/10 text-purple border-purple/20",
  "Pilot Testing": "bg-orange/10 text-orange border-orange/20",
  Implemented: "bg-green/10 text-green border-green/20",
  Rejected: "bg-red-500/10 text-red-500 border-red-500/20"
};
export default function StatusBadge({ status }) {
  const label = formatBadgeLabel(status || "Submitted");
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${tones[label] || tones.Submitted}`}>{label}</span>;
}

function formatBadgeLabel(value) {
  return String(value).toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
