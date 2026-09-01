import { Search } from "lucide-react";
import { categories, districts, priorities, statuses } from "../../data/mockData.js";
export default function SearchFilter({ filters, setFilters }) {
  const update = (key, value) => setFilters((f) => ({ ...f, [key]: value }));
  return <div className="premium-surface rounded-2xl border p-4 backdrop-blur">
    <div className="grid gap-3 lg:grid-cols-6">
      <label className="relative lg:col-span-2"><Search className="absolute left-3 top-3 text-blue" size={18}/><input value={filters.search} onChange={(e)=>update("search",e.target.value)} placeholder="Search challenges" className="w-full rounded-xl border py-2.5 pl-10 pr-3 outline-none"/></label>
      {[["category", categories],["district", districts],["priority", priorities],["status", statuses]].map(([key, opts])=><select key={key} value={filters[key]} onChange={(e)=>update(key,e.target.value)} className="rounded-xl border px-3 py-2.5 outline-none"><option value="">All {key}</option>{opts.map(o=><option key={o}>{o}</option>)}</select>)}
      <select value={filters.sort} onChange={(e)=>update("sort",e.target.value)} className="rounded-xl border px-3 py-2.5 outline-none"><option value="newest">Newest</option><option value="impact">Impact</option><option value="priority">Priority</option></select>
    </div>
  </div>;
}
