import { useMemo, useState } from "react";
import { challenges as seed } from "../../data/mockData.js";
import ChallengeCard from "../../components/challenges/ChallengeCard.jsx";
import SearchFilter from "../../components/challenges/SearchFilter.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
export default function ExploreChallenges() {
  const [filters, setFilters] = useState({ search: "", category: "", district: "", priority: "", status: "", sort: "newest" });
  const all = [...seed, ...JSON.parse(localStorage.getItem("impactx_submissions") || "[]")];
  const rows = useMemo(() => all.filter(c =>
    (!filters.search || `${c.title} ${c.id} ${c.description}`.toLowerCase().includes(filters.search.toLowerCase())) &&
    (!filters.category || c.category === filters.category) && (!filters.district || c.district === filters.district) &&
    (!filters.priority || c.priority === filters.priority) && (!filters.status || c.status === filters.status)
  ).sort((a,b)=> filters.sort==="impact" ? b.affected-a.affected : filters.sort==="priority" ? ["Low","Medium","High","Critical"].indexOf(b.priority)-["Low","Medium","High","Critical"].indexOf(a.priority) : new Date(b.date)-new Date(a.date)), [filters, all.length]);
  return <div className="mx-auto max-w-7xl px-4 py-6 md:py-8"><span className="rounded-full border border-blue/20 bg-blue/10 px-3 py-1 text-sm font-semibold text-blue">Challenge Explorer</span><h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-navy md:text-4xl">Explore Societal Challenges</h1><p className="mt-2 text-sm leading-6 text-slate-600 md:text-base">Discover real problems waiting for innovative solutions.</p><div className="sticky top-[72px] z-10 mt-6"><SearchFilter filters={filters} setFilters={setFilters}/></div><p className="mt-5 text-sm text-slate-500">Showing <span className="text-navy">{rows.length}</span> of <span className="text-navy">1,248</span> challenges</p><div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{rows.map(c=><ChallengeCard key={c.id} challenge={c}/>)}</div>{!rows.length && <div className="mt-6"><EmptyState/></div>}</div>;
}
