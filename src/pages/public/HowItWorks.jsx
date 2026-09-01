import { Bot, Building2, CheckCircle, Factory, FlaskConical, HeartHandshake, Lightbulb, Rocket, Send, Users } from "lucide-react";
const steps = [
  ["Citizen", Users, "A citizen, NGO or community group identifies a real local problem."], ["Submit Challenge", Send, "Structured submission captures location, urgency, affected people and evidence."],
  ["AI Analysis", Bot, "Mock AI classifies category, risk, duplication and expertise required."], ["Government Validation", CheckCircle, "Admin validates feasibility, priority and public relevance."],
  ["Institute Matching", Building2, "Universities are matched by domain strength, mentors and team availability."], ["Solution Development", Lightbulb, "Multidisciplinary student and faculty teams build prototypes."],
  ["Industry Collaboration", Factory, "Industry contributes funding, mentors, cloud credits, equipment or pilots."], ["Prototype", FlaskConical, "The solution is tested in realistic community conditions."],
  ["Pilot", Rocket, "District teams deploy controlled pilots and collect evidence."], ["Social Impact", HeartHandshake, "Impact metrics track citizens benefited and implementation outcomes."]
];
export default function HowItWorks() {
  return <div className="mx-auto max-w-7xl px-4 py-8"><h1 className="text-4xl font-bold text-navy">How It Works</h1><p className="mt-2 text-slate-600">A transparent flow from citizen problem discovery to measured implementation.</p><div className="mt-8 overflow-x-auto pb-4"><div className="flex min-w-max items-stretch gap-3">{steps.map(([title,Icon,text],i)=><div key={title} className="flex items-center gap-3"><article className="w-56 rounded-xl border bg-white p-5 text-center shadow-sm"><span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-blue/10 text-blue"><Icon/></span><h2 className="mt-3 font-bold text-navy">{title}</h2><p className="mt-2 text-sm text-slate-600">{text}</p></article>{i<steps.length-1 && <span className="text-2xl text-slate-300">→</span>}</div>)}</div></div></div>;
}
