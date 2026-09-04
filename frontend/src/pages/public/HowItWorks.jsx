import { Bot, Building2, CheckCircle, Factory, FlaskConical, HeartHandshake, Lightbulb, Rocket, Send, Users } from "lucide-react";
const steps = [
  ["Citizen", Users, "A citizen, NGO or community group identifies a real local problem."], ["Submit Challenge", Send, "Structured submission captures location, urgency, affected people and evidence."],
  ["AI Analysis", Bot, "Mock AI classifies category, risk, duplication and expertise required."], ["Government Validation", CheckCircle, "Admin validates feasibility, priority and public relevance."],
  ["Institute Matching", Building2, "Universities are matched by domain strength, mentors and team availability."], ["Solution Development", Lightbulb, "Multidisciplinary student and faculty teams build prototypes."],
  ["Industry Collaboration", Factory, "Industry contributes funding, mentors, cloud credits, equipment or pilots."], ["Prototype", FlaskConical, "The solution is tested in realistic community conditions."],
  ["Pilot", Rocket, "District teams deploy controlled pilots and collect evidence."], ["Social Impact", HeartHandshake, "Impact metrics track citizens benefited and implementation outcomes."]
];
export default function HowItWorks() {
  return <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 md:py-12 lg:px-10 xl:px-12"><h1 className="text-3xl font-semibold tracking-tight text-navy md:text-4xl">How It Works</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">A transparent flow from citizen problem discovery to measured implementation.</p><div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-5">{steps.map(([title,Icon,text])=><article key={title} className="flex gap-5 rounded-2xl border bg-white p-6 text-left shadow-sm xl:block xl:p-7 xl:text-center"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue/10 text-blue xl:mx-auto"><Icon size={21}/></span><div><h2 className="text-lg font-semibold text-navy xl:mt-4">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div></article>)}</div></div>;
}
