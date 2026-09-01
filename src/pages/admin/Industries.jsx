import { industries } from "../../data/mockData.js";
import IndustryCard from "../../components/dashboard/IndustryCard.jsx";
export default function Industries(){return <div><h1 className="text-3xl font-bold text-navy">Industries</h1><div className="mt-5 grid gap-4 lg:grid-cols-3">{industries.map(i=><IndustryCard key={i.name} industry={i}/>)}</div></div>}
