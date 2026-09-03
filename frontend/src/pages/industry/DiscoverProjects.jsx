import { projects } from "../../data/mockData.js";
import ProjectCard from "../../components/dashboard/ProjectCard.jsx";
export default function DiscoverProjects(){return <div className="min-w-0"><h1 className="text-3xl font-semibold tracking-tight text-navy md:text-4xl">Discover Projects</h1><div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{projects.map(p=><ProjectCard key={p.id} project={p}/>)}</div></div>}
