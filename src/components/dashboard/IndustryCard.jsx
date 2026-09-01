export default function IndustryCard({ industry }) {
  return <div className="premium-card rounded-2xl border p-5 transition duration-200 hover:-translate-y-0.5 hover:border-green/25"><span className="rounded-full border border-green/20 bg-green/10 px-2.5 py-1 text-xs font-semibold text-green">Collaboration</span><h3 className="mt-3 font-semibold text-navy">{industry.name}</h3><p className="mt-2 text-sm text-slate-600">{industry.focus}</p><p className="mt-4 text-sm font-semibold text-purple">{industry.support}</p></div>;
}
