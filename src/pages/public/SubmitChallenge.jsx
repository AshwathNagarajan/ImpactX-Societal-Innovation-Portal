import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { categories, districts } from "../../data/mockData.js";
import Modal from "../../components/common/Modal.jsx";
export default function SubmitChallenge() {
  const navigate = useNavigate();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name:"", email:"", phone:"", type:"Citizen", title:"", description:"", category:"Agriculture", subCategory:"", district:"Ranchi", city:"", location:"", priority:"Medium", attempts:"", affected:"", impact:"", consent:false });
  const set = (k,v)=>setForm(f=>({...f,[k]:v}));
  const submit = (e) => {
    e.preventDefault();
    const list = JSON.parse(localStorage.getItem("impactx_submissions") || "[]");
    const id = `IMPX-2026-${String(12 + list.length + 1).padStart(4,"0")}`;
    const row = { id, title: form.title, category: form.category, subCategory: form.subCategory, district: form.district, city: form.city, date: new Date().toISOString().slice(0,10), status: "Submitted", priority: form.priority, affected: Number(form.affected || 0), institutes: 0, industries: 0, submitter: `${form.name}, ${form.type}`, description: form.description, progress: 5 };
    localStorage.setItem("impactx_submissions", JSON.stringify([...list, row]));
    setModal(id);
  };
  const steps = ["Basic Information","Problem Details","Location","Evidence","Impact","Contact","Review"];
  return <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8"><span className="rounded-full border border-blue/20 bg-blue/10 px-3 py-1 text-xs font-semibold text-blue sm:text-sm">Citizen Submission</span><h1 className="mt-4 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">Submit a Societal Challenge</h1><p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">No login required. Your submission enters AI analysis and government validation.</p>
    <div className="mt-6 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-7">{steps.map((s,i)=><div key={s} className="flex items-center gap-2 rounded-2xl border bg-[#0d1828] px-3 py-3"><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-xl text-[11px] font-semibold ${i===0?"impact-gradient text-[#041016]":"bg-slate-100 text-slate-500"}`}>{String(i+1).padStart(2,"0")}</span><span className="min-w-0 text-xs font-medium leading-4 text-navy lg:text-sm">{s}</span></div>)}</div>
    <form onSubmit={submit} className="mt-6 space-y-6">
      <Panel title="Personal Information"><Input label="Name" v={form.name} on={v=>set("name",v)} required/><Input label="Email" type="email" v={form.email} on={v=>set("email",v)} required/><Input label="Phone" v={form.phone} on={v=>set("phone",v)}/><Select label="Citizen Type" v={form.type} on={v=>set("type",v)} opts={["Citizen","NGO","Community Group","Other"]}/></Panel>
      <Panel title="Challenge Information"><Input label="Challenge Title" v={form.title} on={v=>set("title",v)} required/><Text label="Description" v={form.description} on={v=>set("description",v)} required/><Select label="Category" v={form.category} on={v=>set("category",v)} opts={categories}/><Input label="Sub-category" v={form.subCategory} on={v=>set("subCategory",v)}/><Select label="District" v={form.district} on={v=>set("district",v)} opts={districts}/><Input label="City / Village" v={form.city} on={v=>set("city",v)}/><Input label="Exact location text" v={form.location} on={v=>set("location",v)}/><Select label="Urgency level" v={form.priority} on={v=>set("priority",v)} opts={["Low","Medium","High","Critical"]}/></Panel>
      <Panel title="Supporting Information"><Upload label="Upload image placeholder"/><Upload label="Upload video placeholder"/><Upload label="Upload document placeholder"/><Text label="Existing attempts to solve the problem" v={form.attempts} on={v=>set("attempts",v)}/><Input label="Number of people affected" type="number" v={form.affected} on={v=>set("affected",v)} required/><Text label="Expected impact" v={form.impact} on={v=>set("impact",v)}/></Panel>
      <label className="flex gap-3 rounded-xl border bg-white p-4 text-sm"><input type="checkbox" required checked={form.consent} onChange={e=>set("consent",e.target.checked)}/> I confirm that the information provided is accurate.</label>
      <button className="impact-gradient rounded-xl px-6 py-3 font-semibold text-[#041016] shadow-sm">Submit Challenge</button>
    </form>
    <Modal open={!!modal} title="Challenge submitted" onClose={()=>navigate(`/challenges/${modal}`)}><p className="text-slate-600">Your challenge ID is <strong className="text-navy">{modal}</strong>. The mock AI review has been queued.</p><button onClick={()=>navigate(`/challenges/${modal}`)} className="mt-5 rounded-lg bg-blue px-4 py-2 font-bold text-white">View Challenge Details</button></Modal>
  </div>;
}
function Panel({ title, children }) { return <section className="premium-surface rounded-2xl border p-4 sm:p-5"><h2 className="mb-4 text-xl font-semibold text-navy sm:text-2xl">{title}</h2><div className="grid gap-4 lg:grid-cols-2">{children}</div></section>; }
function Input({ label, v, on, type="text", required }) { return <label className="text-sm font-semibold text-slate-600">{label}<input required={required} type={type} value={v} onChange={e=>on(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue"/></label>; }
function Text({ label, v, on, required }) { return <label className="text-sm font-semibold text-slate-600 lg:col-span-2">{label}<textarea required={required} value={v} onChange={e=>on(e.target.value)} rows="4" className="mt-1 w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue"/></label>; }
function Select({ label, v, on, opts }) { return <label className="text-sm font-semibold text-slate-600">{label}<select value={v} onChange={e=>on(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue">{opts.map(o=><option key={o}>{o}</option>)}</select></label>; }
function Upload({ label }) { return <div className="rounded-xl border border-dashed bg-slate-50 p-4 text-sm font-semibold text-slate-500">{label}</div>; }
