import { useImpactData } from "../../hooks/useImpactData.js";
import InstituteCard from "../../components/dashboard/InstituteCard.jsx";
export default function Institutes(){const { data } = useImpactData(); return <div className="min-w-0"><h1 className="text-3xl font-semibold tracking-tight text-navy md:text-4xl">Institutes</h1><div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{data.institutes.map(i=><InstituteCard key={i.name} institute={i}/>)}</div></div>}
