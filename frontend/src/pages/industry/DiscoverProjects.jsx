import { useImpactData } from "../../hooks/useImpactData.js";
import ProjectCard from "../../components/dashboard/ProjectCard.jsx";
export default function DiscoverProjects(){const { data } = useImpactData(); return <div className="min-w-0"><h1 className="text-3xl font-semibold tracking-tight text-navy md:text-4xl">Discover Projects</h1><div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{data.projects.map(p=><ProjectCard key={p.id} project={p}/>)}</div></div>}
