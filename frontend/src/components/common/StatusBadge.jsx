const tones = {
  Submitted: "bg-slate-100 text-slate-600 border-slate-200",
  "Under Review": "bg-blue/10 text-blue border-blue/20",
  Validated: "bg-green/10 text-green border-green/20",
  Assigned: "bg-purple/10 text-purple border-purple/20",
  "In Development": "bg-purple/10 text-purple border-purple/20",
  "Pilot Testing": "bg-orange/10 text-orange border-orange/20",
  Implemented: "bg-green-50 text-green-700 border-green-100",
  Rejected: "bg-red-50 text-red-700 border-red-100"
};
export default function StatusBadge({ status }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${tones[status] || tones.Submitted}`}>{status}</span>;
}
