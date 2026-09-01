import { institutes } from "../../data/mockData.js";
import InstituteCard from "../../components/dashboard/InstituteCard.jsx";
export default function Institutes(){return <div><h1 className="text-3xl font-bold text-navy">Institutes</h1><div className="mt-5 grid gap-4 lg:grid-cols-3">{institutes.map(i=><InstituteCard key={i.name} institute={i}/>)}</div></div>}
