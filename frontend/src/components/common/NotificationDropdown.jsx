import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { notificationService } from "../../services/notificationService.js";
import { getUser } from "../../utils/auth.js";
import { useDismissiblePopover } from "../../hooks/useDismissiblePopover.js";
export default function NotificationDropdown({ dark = false }) {
  const [items,setItems]=useState([]);
  const [error,setError]=useState("");
  const { open, setOpen, ref } = useDismissiblePopover();
  useEffect(()=>{if(!getUser()) return; let active=true; notificationService.list().then(res=>active&&setItems(res.items||[])).catch(()=>active&&setError("Unable to load notifications.")); return()=>{active=false}},[]);
  return <div ref={ref} className="relative"><button type="button" onClick={()=>setOpen(value=>!value)} className={`rounded-xl border p-2.5 shadow-sm ${dark ? "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10" : "border-slate-200 bg-white text-slate-500 hover:text-blue"}`} aria-label="Notifications" aria-expanded={open}><Bell size={20}/></button>{open&&<div className={`absolute right-0 z-50 mt-3 w-72 rounded-2xl border p-4 shadow-lg ${dark ? "border-white/10 bg-slate-800" : "border-slate-200 bg-white"}`}><div className="flex items-center justify-between gap-3"><p className={`text-sm font-semibold ${dark ? "text-white" : "text-navy"}`}>Notifications</p>{items.length>0&&<span className={`rounded-full px-2 py-1 text-xs font-semibold ${dark ? "bg-white/10 text-slate-200" : "bg-blue-50 text-blue"}`}>{items.filter(i=>!i.read).length} unread</span>}</div>{error&&<p className="mt-3 rounded-xl bg-red-50 p-3 text-sm leading-5 text-red-600">{error}</p>}{!error&&items.length===0&&<p className={`mt-3 rounded-xl p-3 text-sm leading-5 ${dark ? "bg-white/5 text-slate-300" : "bg-slate-50 text-slate-600"}`}>No workflow notifications yet.</p>}{items.map(n=>{const cls=`mt-3 block rounded-xl p-3 text-sm leading-5 ${dark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-50 text-slate-600 hover:bg-blue-50"}`;const body=<><span className={`block font-semibold ${dark ? "text-white" : "text-navy"}`}>{n.title}</span>{n.message}</>;return n.link?<Link key={n.id} to={n.link} onClick={()=>setOpen(false)} className={cls}>{body}</Link>:<p key={n.id} className={cls}>{body}</p>})}</div>}</div>;
}
