import { projects } from "../../data/mockData.js";
import ProjectCard from "../../components/dashboard/ProjectCard.jsx";
export default function DiscoverProjects(){return <div className="min-w-0"><h1 className="text-2xl font-semibold text-navy md:text-3xl">Discover Projects</h1><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{projects.map(p=><ProjectCard key={p.id} project={p}/>)}</div></div>}
