import { projects } from "../../data/mockData.js";
import ProjectCard from "../../components/dashboard/ProjectCard.jsx";
export default function DiscoverProjects(){return <div><h1 className="text-3xl font-bold text-navy">Discover Projects</h1><div className="mt-5 grid gap-4 lg:grid-cols-3">{projects.map(p=><ProjectCard key={p.id} project={p}/>)}</div></div>}
