import { Link } from "react-router-dom";
import { projects } from "../../data/mockData.js";
import ProjectCard from "../../components/dashboard/ProjectCard.jsx";
export default function InstituteProjects(){return <div className="min-w-0"><h1 className="text-2xl font-semibold text-navy md:text-3xl">My Projects</h1><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{projects.slice(0,6).map(p=><ProjectCard key={p.id} project={p} action={<Link to={`/institute/projects/${p.id}`} className="mt-4 inline-block w-full rounded-lg bg-blue px-3 py-2 text-center text-sm font-bold text-white sm:w-auto">Open project</Link>}/>)}</div></div>}
