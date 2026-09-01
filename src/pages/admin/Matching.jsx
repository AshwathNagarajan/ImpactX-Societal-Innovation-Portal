import { useState } from "react";
import { institutes } from "../../data/mockData.js";
import InstituteCard from "../../components/dashboard/InstituteCard.jsx";
export default function Matching(){const [msg,setMsg]=useState("");return <div><h1 className="text-3xl font-bold text-navy">Matching Module</h1><p className="mt-2 text-slate-600">Recommended institute cards ranked by expertise, previous projects and availability.</p>{msg&&<p className="mt-4 rounded-lg bg-green/10 p-3 font-semibold text-green">{msg}</p>}<div className="mt-5 grid gap-4 lg:grid-cols-3">{institutes.map(i=><InstituteCard key={i.name} institute={i} onAssign={()=>setMsg(`${i.name} assigned to the selected challenge.`)}/>)}</div></div>}
