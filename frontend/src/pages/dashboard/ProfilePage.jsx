import { Building2, Factory, Globe2, Mail, MapPin, ShieldCheck, Users } from "lucide-react";
import { getUser } from "../../utils/auth.js";
import { useImpactData } from "../../hooks/useImpactData.js";

export default function ProfilePage({ type = "institute" }) {
  const user = getUser();
  const { data } = useImpactData();
  const isIndustry = type === "industry";
  const record = isIndustry ? data.industries[0] || {} : data.institutes[0] || {};
  const Icon = isIndustry ? Factory : Building2;
  const name = record.name || (isIndustry ? "Tata Steel Foundation" : "BIT Mesra Innovation Cell");
  const focus = record.focus || record.expertise || (isIndustry ? "CSR innovation, pilot deployment and technical mentorship" : "AI, IoT, civil systems and field research");
  const stats = isIndustry
    ? [["Supported Projects", data.projects.length], ["Mentorship Hours", "1,420"], ["Pilot Sites", data.projects.filter((p) => p.status === "PILOT").length]]
    : [["Active Projects", data.projects.filter((p) => p.progress < 100).length], ["Student Teams", data.teams.length], ["Research Outputs", 11]];

  return (
    <div className="min-w-0 space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-slate-100 text-slate-700"><Icon size={28} /></span>
            <div>
              <p className="text-sm font-semibold text-blue">{isIndustry ? "Company Profile" : "Institute Profile"}</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy md:text-4xl">{name}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">{focus}</p>
            </div>
          </div>
          <span className="w-fit rounded-full border border-green/20 bg-green/10 px-4 py-2 text-sm font-semibold text-green">Verified Partner</span>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_.8fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-semibold text-navy md:text-2xl">Operating Details</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Info icon={Mail} label="Workspace Email" value={user?.email || "demo@impactx.in"} />
            <Info icon={MapPin} label="Location" value={record.location || "Jharkhand, India"} />
            <Info icon={Globe2} label="Domain" value={isIndustry ? "Industry collaboration" : "Research and innovation"} />
            <Info icon={ShieldCheck} label="Matching Status" value="Eligible for AI matching" />
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-semibold text-navy md:text-2xl">Profile Strength</h2>
          <div className="mt-6 grid gap-4">
            {["Capabilities verified", "Contact details active", "Collaboration preference configured"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-green/10 text-green"><ShieldCheck size={17} /></span>
                <span className="text-sm font-semibold text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="grid gap-6 md:grid-cols-3">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <Users className="text-blue" size={22} />
            <p className="mt-5 text-3xl font-semibold text-navy">{value}</p>
            <p className="mt-2 text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <Icon className="text-blue" size={18} />
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-navy">{value}</p>
    </div>
  );
}
