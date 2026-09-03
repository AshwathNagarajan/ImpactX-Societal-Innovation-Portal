import { industries } from "../../data/mockData.js";
import IndustryCard from "../../components/dashboard/IndustryCard.jsx";
export default function Industries(){return <div className="min-w-0"><h1 className="text-3xl font-semibold tracking-tight text-navy md:text-4xl">Industries</h1><div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{industries.map(i=><IndustryCard key={i.name} industry={i}/>)}</div></div>}
