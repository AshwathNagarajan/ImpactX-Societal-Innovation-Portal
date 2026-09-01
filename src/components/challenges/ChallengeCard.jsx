import { Link } from "react-router-dom";
import { Calendar, Factory, GraduationCap, MapPin, Users } from "lucide-react";
import StatusBadge from "../common/StatusBadge.jsx";
import PriorityBadge from "../common/PriorityBadge.jsx";
export default function ChallengeCard({ challenge }) {
  return <Link to={`/challenges/${challenge.id}`} className="group block rounded-2xl border bg-[#0d1828] p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue/30">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><span className="rounded-full border border-blue/20 bg-blue/10 px-2.5 py-1 text-xs font-semibold text-blue">{challenge.category}</span><p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{challenge.id}</p><h3 className="mt-1 text-xl font-semibold text-navy">{challenge.title}</h3></div><div className="flex gap-2"><StatusBadge status={challenge.status}/><PriorityBadge priority={challenge.priority}/></div></div>
    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{challenge.description}</p>
    <div className="mt-4 grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
      <span className="flex items-center gap-2"><MapPin size={16}/> {challenge.district}</span><span className="flex items-center gap-2"><Calendar size={16}/> {challenge.date}</span>
      <span className="flex items-center gap-2"><Users size={16}/> {challenge.affected.toLocaleString()} affected</span><span className="flex items-center gap-2"><GraduationCap size={16}/> {challenge.institutes} institutes</span>
      <span className="flex items-center gap-2"><Factory size={16}/> {challenge.industries} partners</span><span className="font-semibold text-blue group-hover:text-green">View Challenge &rarr;</span>
    </div>
  </Link>;
}
