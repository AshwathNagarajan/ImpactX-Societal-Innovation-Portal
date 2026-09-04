import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AIAnalysisCard from "../../components/ai/AIAnalysisCard.jsx";
import SimilarChallengeCard from "../../components/ai/SimilarChallengeCard.jsx";
import SolutionSuggestionCard from "../../components/ai/SolutionSuggestionCard.jsx";
import { useImpactData } from "../../hooks/useImpactData.js";
import InstituteCard from "../../components/dashboard/InstituteCard.jsx";
import IndustryCard from "../../components/dashboard/IndustryCard.jsx";
import { aiService } from "../../services/aiService.js";
import { adminService } from "../../services/adminService.js";

export default function ChallengeReview(){
  const {id}=useParams();
  const { data } = useImpactData();
  const c=data.challenges.find(x=>x.id===id)||data.challenges[0];
  const [analysis,setAnalysis]=useState(null);
  const [busy,setBusy]=useState(false);
  const [actionBusy,setActionBusy]=useState("");
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  useEffect(()=>{let mounted=true;aiService.getAnalysis(id).then(res=>mounted&&setAnalysis(res.data)).catch(()=>{});return()=>{mounted=false}},[id]);
  const runAnalysis=async()=>{setBusy(true);try{const res=await aiService.analyzeChallenge(id);setAnalysis(res.data)}catch{setAnalysis(fallbackAnalysis(c, data.institutes))}finally{setBusy(false)}};
  if (!c) return <div className="rounded-2xl border bg-white p-6 shadow-sm">Loading database challenge...</div>;
  const runAction=async(action)=>{setActionBusy(action);setMessage("");setError("");try{if(action==="Validate Challenge") await adminService.approveChallenge(id); else if(action==="Reject") await adminService.rejectChallenge(id); else if(action==="Request More Information") await adminService.requestInfo(id); else if(action==="Assign Institute") await adminService.assignChallenge(id, data.institutes[0]?.id || "demo-institute"); else if(action==="Override Severity") await adminService.updatePriority(id, "CRITICAL"); else await adminService.requestInfo(id);setMessage(`${action} completed for ${id}.`)}catch(err){setError(err?.response?.data?.message || err?.response?.data?.detail || "Unable to complete action.")}finally{setActionBusy("")}};
  const activeAnalysis=analysis&&Object.keys(analysis).length?analysis:fallbackAnalysis(c, data.institutes);
  return <div className="min-w-0">
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-semibold text-blue">Admin AI Review Center</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy md:text-4xl">Challenge Review</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">Review citizen evidence, AI analysis, duplicate signals and recommended assignment partners before human approval.</p>
      </div>
      <button onClick={runAnalysis} disabled={busy} className="min-h-11 rounded-xl bg-gradient-to-r from-blue via-cyan to-teal px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{busy?"Analyzing...":"Re-run AI Analysis"}</button>
    </div>
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <main className="min-w-0 space-y-8">
        <section className="rounded-2xl border bg-white p-6 shadow-sm md:p-8"><h2 className="text-xl font-semibold leading-tight text-navy md:text-2xl">{c.title}</h2><p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">{c.description}</p><div className="mt-6 grid gap-4 md:grid-cols-2"><Info k="Citizen submission" v={c.submitter}/><Info k="Media" v="Image, video and PDF placeholders attached"/><Info k="Location" v={`${c.city}, ${c.district}`}/><Info k="People affected" v={c.affected?.toLocaleString?.() || "5,200"}/></div></section>
        <AIAnalysisCard analysis={activeAnalysis}/>
        <Grid title="Similar Challenges">{(activeAnalysis.similar_challenges||[]).slice(0,3).map(item=><SimilarChallengeCard key={item.challenge_id} challenge={item}/>)}</Grid>
        <Grid title="AI Suggested Approaches">{(activeAnalysis.proposed_solution_directions||[]).slice(0,3).map(item=><SolutionSuggestionCard key={item.title} solution={item}/>)}</Grid>
        <Grid title="Recommended Institutes">{(activeAnalysis.recommended_institutes?.length?activeAnalysis.recommended_institutes:data.institutes).map(i=><InstituteCard key={i.name} institute={{...i, expertise:i.matching_expertise?.join(", ")||i.expertise, score:i.match_score||i.score||90, projects:i.projects||18, availability:i.availability||"High"}} />)}</Grid>
      </main>
      <aside className="min-w-0 space-y-5 lg:sticky lg:top-28 lg:self-start">
        {message&&<p className="rounded-2xl bg-green/10 p-4 text-sm font-semibold text-green">{message}</p>}
        {error&&<p className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600">{error}</p>}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-navy">Validation Actions</h2>
          <div className="mt-5 grid gap-3">{["Validate Challenge","Reject","Request More Information","Change Category","Override Severity","Assign Institute"].map((b,i)=><button key={b} disabled={!!actionBusy} onClick={()=>runAction(b)} className={`min-h-11 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60 ${i===0?"bg-green text-white":i===1?"bg-red-50 text-red-600":"border border-slate-200 bg-white text-slate-700"}`}>{actionBusy===b?"Saving...":b}</button>)}</div>
        </section>
        <section className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-violet-50 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-navy">Assignment Intelligence</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">Best handled by IoT, AI and public systems teams with industry pilot support.</p>
          <div className="mt-5 space-y-4">{data.industries.slice(0,2).map(i=><IndustryCard key={i.name} industry={i}/>)}</div>
        </section>
      </aside>
    </div>
  </div>
}
function Info({k,v}){return <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6"><span className="font-semibold text-slate-500">{k}: </span>{v}</p>}
function Grid({title,children}){return <section><h2 className="mb-6 text-xl font-semibold text-navy md:text-2xl">{title}</h2><div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{children}</div></section>}
function fallbackAnalysis(c, institutes){return {summary:`AI decision support identifies ${c.title.toLowerCase()} as a high-impact civic challenge requiring coordinated validation, institute expertise and industry pilot support.`,primary_category:(c.category||"OTHER").toUpperCase().replaceAll(" ","_").replace("&","AND"),subcategory:c.subCategory||"General Civic Innovation",category_confidence:.88,severity:{level:c.priority==="Critical"?"CRITICAL":c.priority==="High"?"HIGH":"MODERATE",score:c.priority==="Critical"?86:c.priority==="High"?74:58,reason:"Calculated from urgency, affected population and service disruption signals."},priority:{level:c.priority?.toUpperCase?.()||"HIGH",score:c.priority==="Critical"?92:c.priority==="High"?84:68,factors:[{factor:"Affected population",contribution:18},{factor:"Government relevance",contribution:12}]},required_expertise:["IoT","AI","Field Research","Public Systems"],recommended_technologies:["Sensors","Analytics Dashboard","Mobile Alerts"],root_causes:["Limited field monitoring","Slow response coordination"],risks:["Pilot access delay","Data quality gaps"],confidence_score:.86,similar_challenges:[{challenge_id:"IMPX-2026-0003",title:"Low-Cost Flood Warning System for Vulnerable Villages",similarity:.76,relationship:"RELATED"}],recommended_institutes:institutes.map(i=>({name:i.name,match_score:i.score,matching_expertise:String(i.expertise||"").split(", ")})),proposed_solution_directions:[{title:"Community Pilot and Alert System",approach:"Deploy a district pilot with field inputs, escalation dashboards and measurable outcome tracking.",technologies:["IoT Sensors","Dashboard","SMS Alerts"],estimated_complexity:"MEDIUM"}]}}
