import { useState } from "react";
import { Banknote, Factory, Handshake, MapPin, X } from "lucide-react";
import { useImpactData } from "../../hooks/useImpactData.js";

export default function Industries() {
  const { data, loading } = useImpactData();
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-teal">Industry Network</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy md:text-4xl">Industries</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            Review industry partners, CSR capacity, support models and pilot collaboration readiness.
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200">
          {data.industries.length} records
        </span>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {data.industries.map((industry) => (
          <button
            key={industry.id || industry.name}
            type="button"
            onClick={() => setSelected(industry)}
            className="group min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-teal/40 hover:bg-white/[0.07] hover:shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal/15 text-teal">
                <Factory size={22} />
              </span>
              <span className="rounded-full border border-teal/20 bg-teal/10 px-3 py-1 text-xs font-semibold text-teal">
                Collaboration
              </span>
            </div>
            <h2 className="mt-5 line-clamp-2 text-xl font-semibold text-white">{industry.name}</h2>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{industry.focus || "Industry innovation partner"}</p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <Metric label="Projects" value={industry.projects || 0} />
              <Metric label="Support" value={industry.support || "Mentorship"} />
            </div>
            <p className="mt-5 text-sm font-semibold text-teal group-hover:text-cyan-300">View organization details</p>
          </button>
        ))}
      </div>

      {!loading && !data.industries.length && (
        <p className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.04] p-8 text-center text-sm font-semibold text-slate-300">
          No industry records found.
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
      <p className="mt-2 line-clamp-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function OrganizationModal({ organization, onClose }) {
  const list = (value) => Array.isArray(value) ? value : String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
  const domains = list(organization.csr_domains);
  const expertise = list(organization.expertise);
  const support = list(organization.support_types || organization.support);
  const locations = list(organization.locations);
  const previous = list(organization.previous_projects);
  const committed = Number(organization.funding_committed || 0);
  const utilized = Number(organization.funding_utilized || 0);

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm" onMouseDown={onClose}>
      <section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/15 bg-slate-900 p-6 text-white shadow-2xl md:p-8" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-teal">Industry Profile</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{organization.name}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">{organization.sector || organization.email || "Registered industry partner"}</p>
          </div>
          <button onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10" aria-label="Close organization details">
            <X size={18} />
          </button>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <DetailStat icon={Handshake} label="Support Types" value={support.length || 0} />
          <DetailStat icon={Banknote} label="Committed" value={committed ? `₹${(committed / 10000000).toFixed(1)} Cr` : "Not set"} />
          <DetailStat icon={MapPin} label="Locations" value={locations.length || "Not set"} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <DetailList title="CSR Domains" items={domains} />
          <DetailList title="Expertise" items={expertise} />
          <DetailList title="Support Models" items={support} />
          <DetailList title="Operating Locations" items={locations} />
          <DetailList title="Previous Projects" items={previous} wide />
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <h3 className="font-semibold text-white">Funding Details</h3>
            <p className="mt-4 text-sm leading-6 text-slate-300">Committed: ₹{committed.toLocaleString("en-IN")}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">Utilized: ₹{utilized.toLocaleString("en-IN")}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-teal" style={{ width: `${committed ? Math.min(100, Math.round((utilized / committed) * 100)) : 0}%` }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DetailStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <Icon size={18} className="text-teal" />
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function DetailList({ title, items, wide = false }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.04] p-5 ${wide ? "lg:col-span-2" : ""}`}>
      <h3 className="font-semibold text-white">{title}</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.length ? items.map((item) => <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200">{item}</span>) : <span className="text-sm text-slate-400">Not provided</span>}
      </div>
    </div>
  );
}
