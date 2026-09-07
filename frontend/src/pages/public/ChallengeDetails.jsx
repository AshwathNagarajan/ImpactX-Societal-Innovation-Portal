import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { challengeService } from "../../services/challengeService.js";
import { useImpactData } from "../../hooks/useImpactData.js";
import AIAnalysisCard from "../../components/ai/AIAnalysisCard.jsx";
import PriorityBadge from "../../components/common/PriorityBadge.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Timeline from "../../components/challenges/Timeline.jsx";
import InstituteCard from "../../components/dashboard/InstituteCard.jsx";
import IndustryCard from "../../components/dashboard/IndustryCard.jsx";
import ProgressBar from "../../components/common/ProgressBar.jsx";
import EvidenceViewer from "../../components/evidence/EvidenceViewer.jsx";
import CommentThread from "../../components/comments/CommentThread.jsx";
import { getUser } from "../../utils/auth.js";
import { instituteService } from "../../services/instituteService.js";
import { auditService } from "../../services/auditService.js";
import { apiErrorMessage } from "../../utils/apiError.js";
const steps = ["Submitted","AI Analysis","Government Validation","Institute Matching","Solution Development","Industry Collaboration","Pilot","Implementation","Impact"];
export default function ChallengeDetails() {
  const { id } = useParams();
  const { data } = useImpactData();
  const user = getUser();
  const [record, setRecord] = useState(null);
  const [events, setEvents] = useState([]);
  const [assignmentState, setAssignmentState] = useState({ busy: false, message: "", error: "" });
  useEffect(() => { challengeService.get(id).then(res => setRecord(toUi(res.data))).catch(() => setRecord(null)); }, [id]);
  useEffect(() => { if (!user) return; let active = true; auditService.events({ entity_type: "challenge", entity_id: id, limit: 12 }).then(res => active && setEvents(res.items || [])).catch(() => active && setEvents([])); return () => { active = false; }; }, [id]);
  const c = record || data.challenges.find(x => x.id === id) || data.challenges[0];
  if (!c) return <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 md:py-12 lg:px-10 xl:px-12"><div className="rounded-3xl border bg-white p-8 shadow-sm">Loading database record...</div></div>;
  const isInstitute = user?.role === "institute";
  const isAssignedToInstitute = isInstitute && ["assigned", "in development"].includes(display(c.status).toLowerCase());
  const isOpenForInstitute = isInstitute && display(c.status).toLowerCase() === "open for institute";
  const acceptChallenge = async () => {
    setAssignmentState({ busy: true, message: "", error: "" });
    try {
      const response = await instituteService.acceptChallenge(c.id);
      setAssignmentState({ busy: false, message: response.message || "Challenge accepted. You can now submit a proposal.", error: "" });
      setRecord((current) => current ? { ...current, status: "Assigned" } : current);
    } catch (err) {
      setAssignmentState({ busy: false, message: "", error: apiErrorMessage(err, "Unable to accept challenge.") });
    }
  };
  return <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 md:py-12 lg:px-10 xl:px-12">
    <div className="rounded-3xl border bg-white p-6 shadow-sm md:p-8"><div className="flex flex-wrap justify-between gap-5"><div className="min-w-0"><p className="text-sm font-semibold text-blue">{c.id}</p><h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight text-navy md:text-4xl">{c.title}</h1></div><div className="flex flex-wrap gap-2"><StatusBadge status={c.status}/><PriorityBadge priority={c.priority}/></div></div><p className="mt-6 max-w-4xl text-sm leading-7 text-slate-600 md:text-base">{c.description}</p>{isInstitute&&<div className="mt-7 rounded-2xl border border-blue/20 bg-blue/10 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-semibold text-slate-700">{isAssignedToInstitute?"This challenge is assigned to your institute. Submit a proposal to move solution planning forward.":isOpenForInstitute?"AI has approved this as an innovation-worthy challenge. Accept it to start proposal development.":"This challenge is not currently open for institute assignment."}</p>{isAssignedToInstitute?<Link to={`/institute/proposals?challenge=${c.id}`} className="impact-gradient min-h-11 rounded-xl px-5 py-3 text-center text-sm font-semibold text-white">Propose Solution</Link>:isOpenForInstitute?<button disabled={assignmentState.busy} onClick={acceptChallenge} className="impact-gradient min-h-11 rounded-xl px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{assignmentState.busy?"Accepting...":"Accept Challenge"}</button>:null}</div>{assignmentState.message&&<p className="mt-3 text-sm font-semibold text-green">{assignmentState.message}</p>}{assignmentState.error&&<p className="mt-3 text-sm font-semibold text-red-300">{assignmentState.error}</p>}</div>}<div className="mt-8 grid gap-4 text-sm md:grid-cols-2 lg:grid-cols-4"><Info k="Category" v={c.category}/><Info k="Location" v={`${c.city}, ${c.district}`}/><Info k="Submitted" v={c.date}/><Info k="People affected" v={Number(c.affected).toLocaleString()}/><Info k="Submitted by" v={c.submitter}/><Info k="Priority" v={c.priority}/></div></div>
    <section className="mt-8 rounded-3xl border bg-white p-6 shadow-sm md:p-8"><h2 className="mb-6 text-xl font-semibold text-navy md:text-2xl">Status Timeline</h2><Timeline steps={steps}/></section>
    <div className="mt-8"><EvidenceViewer items={c.attachments || []} /></div>
    <div className="mt-8 grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
      <AIAnalysisCard analysis={c.ai_analysis || fallbackAnalysis(c)} compact />
      <section className="min-w-0 rounded-3xl border bg-white p-6 shadow-sm md:p-8"><h2 className="text-xl font-semibold text-navy md:text-2xl">Impact Metrics</h2><ResponsiveContainer width="100%" height={280}><BarChart data={[{name:"Reach",value:c.affected},{name:"Households",value:Math.round(c.affected/4.8)},{name:"Pilot users",value:Math.round(c.affected*.18)}]}><XAxis dataKey="name"/><YAxis/><Tooltip/><Legend wrapperStyle={{ color: "#cbd5e1", fontSize: 12 }}/><Bar dataKey="value" name="Beneficiaries" fill="transparent" stroke="#22d3ee" strokeWidth={2} radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></section>
    </div>
    <Grid title="Interested Institutes">{data.institutes.slice(0,3).map(i=><InstituteCard key={i.name} institute={i}/>)}</Grid>
    <Grid title="Interested Industries">{data.industries.slice(0,3).map(i=><IndustryCard key={i.name} industry={i}/>)}</Grid>
    {user && <div className="mt-10"><CommentThread entityType="challenge" entityId={c.id} title="Challenge Discussion" /></div>}
    <ActivityTimeline events={events} />
    <section className="mt-10 grid gap-6 lg:grid-cols-4">{["Assigned Team","Milestones","Documents","Updates"].map((t,i)=><div key={t} className="rounded-2xl border bg-white p-6 shadow-sm"><h3 className="text-lg font-semibold text-navy">{t}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{["BIT Mesra student team with district nodal officer and industry mentor.","Research complete, prototype under testing, pilot sites shortlisted.","Citizen submission, field survey, AI analysis note and validation order.","Latest update confirms community pilot readiness and installation plan."][i]}</p><div className="mt-5"><ProgressBar value={[72,58,80,46][i]}/></div></div>)}</section>
  </div>;
}
function Info({ k, v }) { return <p className="min-w-0"><span className="font-semibold text-slate-500">{k}: </span><span className="text-slate-700">{v}</span></p>; }
function Grid({ title, children }) { return <section className="mt-10"><h2 className="mb-6 text-xl font-semibold text-navy md:text-2xl">{title}</h2><div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{children}</div></section>; }
function ActivityTimeline({ events }) { return <section className="mt-10 rounded-2xl border bg-white p-6 shadow-sm md:p-8"><h2 className="text-xl font-semibold text-navy md:text-2xl">Activity Timeline</h2>{events.length?<div className="mt-5 space-y-3">{events.map(event=><div key={event.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-semibold text-navy">{display(event.action)}</p><p className="mt-1 text-xs text-slate-500">{event.actor_name || event.actor_role || "System"} | {String(event.created_at || "").slice(0, 19).replace("T", " ")}</p></div>)}</div>:<p className="mt-5 rounded-xl border border-dashed bg-slate-50 p-4 text-sm font-semibold text-slate-500">No workflow history has been recorded for this challenge yet.</p>}</section>; }
function fallbackAnalysis(c) { return { summary: "AI analysis highlights category fit, priority, expected impact and matching expertise for government validation.", primary_category: c.category, category_confidence: .84, severity: { level: c.priority === "Critical" ? "CRITICAL" : c.priority === "High" ? "HIGH" : "MODERATE", score: c.priority === "Critical" ? 86 : c.priority === "High" ? 74 : 58 }, priority: { level: c.priority?.toUpperCase?.() || "HIGH", score: c.priority === "Critical" ? 92 : c.priority === "High" ? 84 : 68 }, required_expertise: ["Field Research", "AI", "IoT", "Public Systems"], recommended_technologies: ["Analytics Dashboard", "Mobile Workflow"], confidence_score: .84 }; }
function toUi(doc) { return { ...doc, id: doc.challenge_id, subCategory: doc.subcategory, city: doc.city_or_village, date: String(doc.created_at || "").slice(0,10), status: display(doc.status), priority: display(doc.priority), affected: doc.people_affected || 0, institutes: doc.matched_institutes?.length || 0, industries: doc.industry_partners?.length || 0, submitter: doc.submitted_by?.mobile_verified ? "Verified Citizen" : "Citizen" }; }
function display(value) { return String(value || "").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase()); }
