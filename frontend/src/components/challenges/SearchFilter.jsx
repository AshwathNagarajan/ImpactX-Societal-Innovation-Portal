import { Search } from "lucide-react";
import { categories, districts, priorities, statuses } from "../../data/mockData.js";
export default function SearchFilter({ filters, setFilters }) {
  const update = (key, value) => setFilters((f) => ({ ...f, [key]: value }));
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm backdrop-blur md:p-6">
    <div className="grid gap-4 lg:grid-cols-6">
      <label className="relative lg:col-span-2"><Search className="absolute left-4 top-3.5 text-blue" size={18}/><input value={filters.search} onChange={(e)=>update("search",e.target.value)} placeholder="Search challenges" className="min-h-12 w-full rounded-xl border py-3 pl-11 pr-4 outline-none"/></label>
      {[["category", categories],["district", districts],["priority", priorities],["status", statuses]].map(([key, opts])=><select key={key} value={filters[key]} onChange={(e)=>update(key,e.target.value)} className="min-h-12 rounded-xl border px-4 py-3 outline-none"><option value="">All {key}</option>{opts.map(o=><option key={o}>{o}</option>)}</select>)}
      <select value={filters.sort} onChange={(e)=>update("sort",e.target.value)} className="min-h-12 rounded-xl border px-4 py-3 outline-none"><option value="newest">Newest</option><option value="impact">Impact</option><option value="priority">Priority</option></select>
    </div>
  </div>;
}
