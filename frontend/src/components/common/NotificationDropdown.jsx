import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { notificationService } from "../../services/notificationService.js";
import { getUser } from "../../utils/auth.js";
export default function NotificationDropdown() {
  const [items,setItems]=useState([]);
  const [error,setError]=useState("");
  useEffect(()=>{if(!getUser()) return; let active=true; notificationService.list().then(res=>active&&setItems(res.items||[])).catch(()=>active&&setError("Unable to load notifications.")); return()=>{active=false}},[]);
  return <details className="relative"><summary className="list-none rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm hover:text-blue"><Bell size={20}/></summary><div className="absolute right-0 mt-3 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-navy">Notifications</p>{items.length>0&&<span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue">{items.filter(i=>!i.read).length} unread</span>}</div>{error&&<p className="mt-3 rounded-xl bg-red-50 p-3 text-sm leading-5 text-red-600">{error}</p>}{!error&&items.length===0&&<p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-5 text-slate-600">No workflow notifications yet.</p>}{items.map(n=><p key={n.id} className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-5 text-slate-600"><span className="block font-semibold text-navy">{n.title}</span>{n.message}</p>)}</div></details>;
}
