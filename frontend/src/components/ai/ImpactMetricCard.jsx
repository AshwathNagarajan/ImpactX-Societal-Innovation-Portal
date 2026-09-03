export default function ImpactMetricCard({ label, value, note }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <strong className="mt-2 block text-3xl font-semibold text-navy">{value}</strong>
      {note && <p className="mt-2 text-sm text-slate-500">{note}</p>}
    </div>
  );
}

