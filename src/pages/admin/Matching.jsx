import { useState } from "react";
import { institutes } from "../../data/mockData.js";
import InstituteCard from "../../components/dashboard/InstituteCard.jsx";
export default function Matching(){const [msg,setMsg]=useState("");return <div className="min-w-0"><h1 className="text-2xl font-semibold text-navy md:text-3xl">Matching Module</h1><p className="mt-2 text-sm leading-6 text-slate-600 md:text-base">Recommended institute cards ranked by expertise, previous projects and availability.</p>{msg&&<p className="mt-4 rounded-lg bg-green/10 p-3 font-semibold text-green">{msg}</p>}<div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{institutes.map(i=><InstituteCard key={i.name} institute={i} onAssign={()=>setMsg(`${i.name} assigned to the selected challenge.`)}/>)}</div></div>}
