import { useState } from "react";
import { Building2, GraduationCap, MapPin, Sparkles, X } from "lucide-react";
import { useImpactData } from "../../hooks/useImpactData.js";

export default function Institutes() {
  const { data, loading } = useImpactData();
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue">Institute Network</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy md:text-4xl">Institutes</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            Review registered research partners, their capabilities and delivery readiness.
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200">
          {data.institutes.length} records
        </span>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {data.institutes.map((institute) => (
          <button
            key={institute.id || institute.name}
            type="button"
            onClick={() => setSelected(institute)}
            className="group min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue/40 hover:bg-white/[0.07] hover:shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue/15 text-blue">
                <GraduationCap size={22} />
              </span>
              <span className="rounded-full border border-blue/20 bg-blue/10 px-3 py-1 text-xs font-semibold text-blue">
                {institute.availability || "High"} availability
              </span>
            </div>
            <h2 className="mt-5 line-clamp-2 text-xl font-semibold text-white">{institute.name}</h2>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{institute.expertise || "Research and innovation partner"}</p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <Metric label="Projects" value={institute.projects || 0} />
              <Metric label="AI Match" value={`${institute.score || 82}%`} />
            </div>
            <p className="mt-5 text-sm font-semibold text-blue group-hover:text-cyan-300">View organization details</p>
          </button>
        ))}
      </div>

      {!loading && !data.institutes.length && (
        <p className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.04] p-8 text-center text-sm font-semibold text-slate-300">
          No institute records found.
        </p>
      )}

      {selected && <OrganizationModal organization={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function OrganizationModal({ organization, onClose }) {
  const list = (value) => Array.isArray(value) ? value : String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
  const expertise = list(organization.expertise);
  const departments = list(organization.departments);
  const domains = list(organization.research_domains);
  const projects = list(organization.previous_projects);

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm" onMouseDown={onClose}>
      <section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/15 bg-slate-900 p-6 text-white shadow-2xl md:p-8" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-blue">Institute Profile</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{organization.name}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">{organization.email || "Registered institute partner"}</p>
          </div>
          <button onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10" aria-label="Close organization details">
            <X size={18} />
          </button>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <DetailStat icon={Sparkles} label="Match Score" value={`${organization.score || 82}%`} />
          <DetailStat icon={Building2} label="Projects" value={organization.projects || 0} />
          <DetailStat icon={MapPin} label="District" value={organization.district || "Not specified"} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <DetailList title="Expertise" items={expertise} />
          <DetailList title="Departments" items={departments} />
          <DetailList title="Research Domains" items={domains} />
          <DetailList title="Previous Projects" items={projects} />
        </div>
      </section>
    </div>
  );
}

function DetailStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <Icon size={18} className="text-blue" />
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function DetailList({ title, items }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <h3 className="font-semibold text-white">{title}</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.length ? items.map((item) => <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200">{item}</span>) : <span className="text-sm text-slate-400">Not provided</span>}
      </div>
    </div>
  );
}
