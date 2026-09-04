import { Link } from "react-router-dom";
import { useImpactData } from "../../hooks/useImpactData.js";
import ProjectCard from "../../components/dashboard/ProjectCard.jsx";
export default function InstituteProjects(){const { data } = useImpactData(); return <div className="min-w-0"><h1 className="text-3xl font-semibold tracking-tight text-navy md:text-4xl">My Projects</h1><div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{data.projects.slice(0,6).map(p=><ProjectCard key={p.id} project={p} action={<Link to={`/institute/projects/${p.id}`} className="mt-5 inline-block w-full rounded-xl bg-blue px-4 py-2.5 text-center text-sm font-semibold text-white sm:w-auto">Open project</Link>}/>)}</div></div>}
