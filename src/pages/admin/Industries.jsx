import { industries } from "../../data/mockData.js";
import IndustryCard from "../../components/dashboard/IndustryCard.jsx";
export default function Industries(){return <div className="min-w-0"><h1 className="text-2xl font-semibold text-navy md:text-3xl">Industries</h1><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{industries.map(i=><IndustryCard key={i.name} industry={i}/>)}</div></div>}
