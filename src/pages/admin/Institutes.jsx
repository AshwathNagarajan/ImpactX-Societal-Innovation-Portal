import { institutes } from "../../data/mockData.js";
import InstituteCard from "../../components/dashboard/InstituteCard.jsx";
export default function Institutes(){return <div className="min-w-0"><h1 className="text-2xl font-semibold text-navy md:text-3xl">Institutes</h1><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{institutes.map(i=><InstituteCard key={i.name} institute={i}/>)}</div></div>}
