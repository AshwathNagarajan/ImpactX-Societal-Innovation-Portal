import { useParams } from "react-router-dom";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { challenges, industries, institutes } from "../../data/mockData.js";
import PriorityBadge from "../../components/common/PriorityBadge.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Timeline from "../../components/challenges/Timeline.jsx";
import InstituteCard from "../../components/dashboard/InstituteCard.jsx";
import IndustryCard from "../../components/dashboard/IndustryCard.jsx";
import ProgressBar from "../../components/common/ProgressBar.jsx";
const steps = ["Submitted","AI Analysis","Government Validation","Institute Matching","Solution Development","Industry Collaboration","Pilot","Implementation","Impact"];
export default function ChallengeDetails() {
  const { id } = useParams();
  const stored = JSON.parse(localStorage.getItem("impactx_submissions") || "[]");
  const c = [...challenges, ...stored].find(x => x.id === id) || challenges[0];
  return <div className="mx-auto max-w-7xl px-4 py-8">
    <div className="rounded-xl border bg-white p-6 shadow-sm"><div className="flex flex-wrap justify-between gap-3"><div><p className="font-bold text-blue">{c.id}</p><h1 className="mt-1 text-4xl font-bold text-navy">{c.title}</h1></div><div className="flex gap-2"><StatusBadge status={c.status}/><PriorityBadge priority={c.priority}/></div></div><p className="mt-4 max-w-4xl text-slate-600">{c.description}</p><div className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4"><Info k="Category" v={c.category}/><Info k="Location" v={`${c.city}, ${c.district}`}/><Info k="Submitted" v={c.date}/><Info k="People affected" v={Number(c.affected).toLocaleString()}/><Info k="Submitted by" v={c.submitter}/><Info k="Priority" v={c.priority}/></div></div>
    <section className="mt-6 rounded-xl border bg-white p-5 shadow-sm"><h2 className="mb-4 text-2xl font-bold text-navy">Status Timeline</h2><Timeline steps={steps}/></section>
    <div className="mt-6 grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
      <section className="rounded-xl border bg-white p-5 shadow-sm"><h2 className="text-2xl font-bold text-navy">AI Analysis</h2><div className="mt-4 space-y-3 text-sm"><Info k="Suggested category" v={c.category}/><Info k="Priority score" v={`${c.priority==="Critical"?94:c.priority==="High"?86:68}/100`}/><Info k="Duplicate probability" v="12% low-risk match"/><Info k="Recommended institute domains" v="AI, IoT, field research, public systems"/><Info k="Required expertise" v="Human-centered design, sensors, data analytics"/><Info k="Impact score" v="88/100"/></div></section>
      <section className="rounded-xl border bg-white p-5 shadow-sm"><h2 className="text-2xl font-bold text-navy">Impact Metrics</h2><ResponsiveContainer height={260}><BarChart data={[{name:"Reach",value:c.affected},{name:"Households",value:Math.round(c.affected/4.8)},{name:"Pilot users",value:Math.round(c.affected*.18)}]}><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="value" fill="#15803D" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></section>
    </div>
    <Grid title="Interested Institutes">{institutes.slice(0,3).map(i=><InstituteCard key={i.name} institute={i}/>)}</Grid>
    <Grid title="Interested Industries">{industries.slice(0,3).map(i=><IndustryCard key={i.name} industry={i}/>)}</Grid>
    <section className="mt-6 grid gap-4 lg:grid-cols-3">{["Assigned Team","Milestones","Documents","Updates"].map((t,i)=><div key={t} className="rounded-xl border bg-white p-5 shadow-sm"><h3 className="font-bold text-navy">{t}</h3><p className="mt-2 text-sm text-slate-600">{["BIT Mesra student team with district nodal officer and industry mentor.","Research complete, prototype under testing, pilot sites shortlisted.","Citizen submission, field survey, AI analysis note and validation order.","Latest update confirms community pilot readiness and installation plan."][i]}</p><div className="mt-4"><ProgressBar value={[72,58,80,46][i]}/></div></div>)}</section>
  </div>;
}
function Info({ k, v }) { return <p><span className="font-bold text-slate-500">{k}: </span><span className="text-slate-700">{v}</span></p>; }
function Grid({ title, children }) { return <section className="mt-6"><h2 className="mb-4 text-2xl font-bold text-navy">{title}</h2><div className="grid gap-4 lg:grid-cols-3">{children}</div></section>; }
