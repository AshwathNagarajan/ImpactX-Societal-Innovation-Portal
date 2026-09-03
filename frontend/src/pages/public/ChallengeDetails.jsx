import { useParams } from "react-router-dom";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { challenges, industries, institutes } from "../../data/mockData.js";
import AIAnalysisCard from "../../components/ai/AIAnalysisCard.jsx";
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
  return <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 md:py-12 lg:px-10 xl:px-12">
    <div className="rounded-3xl border bg-white p-6 shadow-sm md:p-8"><div className="flex flex-wrap justify-between gap-5"><div className="min-w-0"><p className="text-sm font-semibold text-blue">{c.id}</p><h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight text-navy md:text-4xl">{c.title}</h1></div><div className="flex flex-wrap gap-2"><StatusBadge status={c.status}/><PriorityBadge priority={c.priority}/></div></div><p className="mt-6 max-w-4xl text-sm leading-7 text-slate-600 md:text-base">{c.description}</p><div className="mt-8 grid gap-4 text-sm md:grid-cols-2 lg:grid-cols-4"><Info k="Category" v={c.category}/><Info k="Location" v={`${c.city}, ${c.district}`}/><Info k="Submitted" v={c.date}/><Info k="People affected" v={Number(c.affected).toLocaleString()}/><Info k="Submitted by" v={c.submitter}/><Info k="Priority" v={c.priority}/></div></div>
    <section className="mt-8 rounded-3xl border bg-white p-6 shadow-sm md:p-8"><h2 className="mb-6 text-xl font-semibold text-navy md:text-2xl">Status Timeline</h2><Timeline steps={steps}/></section>
    <div className="mt-8 grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
      <AIAnalysisCard analysis={c.ai_analysis || fallbackAnalysis(c)} compact />
      <section className="min-w-0 rounded-3xl border bg-white p-6 shadow-sm md:p-8"><h2 className="text-xl font-semibold text-navy md:text-2xl">Impact Metrics</h2><ResponsiveContainer width="100%" height={280}><BarChart data={[{name:"Reach",value:c.affected},{name:"Households",value:Math.round(c.affected/4.8)},{name:"Pilot users",value:Math.round(c.affected*.18)}]}><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="value" fill="#0D9488" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></section>
    </div>
    <Grid title="Interested Institutes">{institutes.slice(0,3).map(i=><InstituteCard key={i.name} institute={i}/>)}</Grid>
    <Grid title="Interested Industries">{industries.slice(0,3).map(i=><IndustryCard key={i.name} industry={i}/>)}</Grid>
    <section className="mt-10 grid gap-6 lg:grid-cols-4">{["Assigned Team","Milestones","Documents","Updates"].map((t,i)=><div key={t} className="rounded-2xl border bg-white p-6 shadow-sm"><h3 className="text-lg font-semibold text-navy">{t}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{["BIT Mesra student team with district nodal officer and industry mentor.","Research complete, prototype under testing, pilot sites shortlisted.","Citizen submission, field survey, AI analysis note and validation order.","Latest update confirms community pilot readiness and installation plan."][i]}</p><div className="mt-5"><ProgressBar value={[72,58,80,46][i]}/></div></div>)}</section>
  </div>;
}
function Info({ k, v }) { return <p className="min-w-0"><span className="font-semibold text-slate-500">{k}: </span><span className="text-slate-700">{v}</span></p>; }
function Grid({ title, children }) { return <section className="mt-10"><h2 className="mb-6 text-xl font-semibold text-navy md:text-2xl">{title}</h2><div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{children}</div></section>; }
function fallbackAnalysis(c) { return { summary: "AI analysis highlights category fit, priority, expected impact and matching expertise for government validation.", primary_category: c.category, category_confidence: .84, severity: { level: c.priority === "Critical" ? "CRITICAL" : c.priority === "High" ? "HIGH" : "MODERATE", score: c.priority === "Critical" ? 86 : c.priority === "High" ? 74 : 58 }, priority: { level: c.priority?.toUpperCase?.() || "HIGH", score: c.priority === "Critical" ? 92 : c.priority === "High" ? 84 : 68 }, required_expertise: ["Field Research", "AI", "IoT", "Public Systems"], recommended_technologies: ["Analytics Dashboard", "Mobile Workflow"], confidence_score: .84 }; }
