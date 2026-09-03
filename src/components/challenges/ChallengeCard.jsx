import { Link } from "react-router-dom";
import { Calendar, Factory, GraduationCap, MapPin, Users } from "lucide-react";
import StatusBadge from "../common/StatusBadge.jsx";
import PriorityBadge from "../common/PriorityBadge.jsx";
export default function ChallengeCard({ challenge }) {
  return <Link to={`/challenges/${challenge.id}`} className="group block w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
    <div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0"><span className="inline-flex max-w-full truncate rounded-full border border-blue/15 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue">{challenge.category}</span><p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{challenge.id}</p><h3 className="mt-2 text-lg font-semibold leading-tight text-navy md:text-xl">{challenge.title}</h3></div><div className="flex flex-wrap gap-2"><StatusBadge status={challenge.status}/><PriorityBadge priority={challenge.priority}/></div></div>
    <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{challenge.description}</p>
    <div className="mt-6 grid gap-3 text-sm text-slate-500 md:grid-cols-2">
      <span className="flex items-center gap-2"><MapPin size={16}/> {challenge.district}</span><span className="flex items-center gap-2"><Calendar size={16}/> {challenge.date}</span>
      <span className="flex items-center gap-2"><Users size={16}/> {challenge.affected.toLocaleString()} affected</span><span className="flex items-center gap-2"><GraduationCap size={16}/> {challenge.institutes} institutes</span>
      <span className="flex items-center gap-2"><Factory size={16}/> {challenge.industries} partners</span><span className="font-semibold text-blue group-hover:text-green">View Challenge &rarr;</span>
    </div>
  </Link>;
}
