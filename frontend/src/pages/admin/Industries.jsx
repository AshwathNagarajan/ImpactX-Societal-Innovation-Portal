import { useImpactData } from "../../hooks/useImpactData.js";
import IndustryCard from "../../components/dashboard/IndustryCard.jsx";
export default function Industries(){const { data } = useImpactData(); return <div className="min-w-0"><h1 className="text-3xl font-semibold tracking-tight text-navy md:text-4xl">Industries</h1><div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{data.industries.map(i=><IndustryCard key={i.name} industry={i}/>)}</div></div>}
