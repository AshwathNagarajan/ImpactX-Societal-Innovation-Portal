import { Link } from "react-router-dom";
import { projects } from "../../data/mockData.js";
import ProjectCard from "../../components/dashboard/ProjectCard.jsx";
export default function InstituteProjects(){return <div><h1 className="text-3xl font-bold text-navy">My Projects</h1><div className="mt-5 grid gap-4 lg:grid-cols-3">{projects.slice(0,6).map(p=><ProjectCard key={p.id} project={p} action={<Link to={`/institute/projects/${p.id}`} className="mt-4 inline-block rounded-lg bg-blue px-3 py-2 text-sm font-bold text-white">Open project</Link>}/>)}</div></div>}
