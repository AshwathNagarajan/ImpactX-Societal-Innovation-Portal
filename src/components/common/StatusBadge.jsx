const tones = {
  Submitted: "bg-slate-500/10 text-slate-400 border-slate-500/15",
  "Under Review": "bg-blue/10 text-blue border-blue/20",
  Validated: "bg-green/10 text-green border-green/20",
  Assigned: "bg-purple/10 text-purple border-purple/20",
  "In Development": "bg-purple/10 text-purple border-purple/20",
  "Pilot Testing": "bg-orange/10 text-orange border-orange/20",
  Implemented: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Rejected: "bg-red-500/10 text-red-400 border-red-500/20"
};
export default function StatusBadge({ status }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${tones[status] || tones.Submitted}`}>{status}</span>;
}
