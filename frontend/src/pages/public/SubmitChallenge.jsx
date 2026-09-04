import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { categories, districts } from "../../data/referenceData.js";
import Modal from "../../components/common/Modal.jsx";
import { challengeService } from "../../services/challengeService.js";
export default function SubmitChallenge() {
  const navigate = useNavigate();
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title:"", description:"", category:"Agriculture", subCategory:"", district:"Ranchi", city:"", location:"", priority:"Medium", attempts:"", affected:"", impact:"", consent:false });
  const set = (k,v)=>setForm(f=>({...f,[k]:v}));
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await challengeService.create({
        submitted_by: { name: "Anonymous Citizen", email: "anonymous@impactx.in", phone: "", type: "Citizen" },
        title: form.title,
        description: form.description,
        category: form.category,
        subcategory: form.subCategory,
        district: form.district,
        city_or_village: form.city,
        location: form.location,
        urgency: form.priority.toUpperCase(),
        people_affected: Number(form.affected || 0),
        existing_attempts: form.attempts,
        expected_impact: form.impact,
        attachments: [],
      });
      setModal(response.challenge_id);
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.detail || "Unable to submit challenge. Please check the form and try again.");
    } finally {
      setBusy(false);
    }
  };
  return <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-12 lg:px-10 xl:px-0"><span className="rounded-full border border-blue/20 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue sm:text-sm">Citizen Submission</span><h1 className="mt-5 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">Submit a Societal Challenge</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">No login required. Your submission enters AI analysis and government validation.</p>
    <form onSubmit={submit} className="mt-8 space-y-8">
      <Panel title="Challenge Information"><Input label="Challenge Title" v={form.title} on={v=>set("title",v)} required/><Text label="Description" v={form.description} on={v=>set("description",v)} required/><Select label="Category" v={form.category} on={v=>set("category",v)} opts={categories}/><Input label="Sub-category" v={form.subCategory} on={v=>set("subCategory",v)}/><Select label="District" v={form.district} on={v=>set("district",v)} opts={districts}/><Input label="City / Village" v={form.city} on={v=>set("city",v)}/><Input label="Exact location text" v={form.location} on={v=>set("location",v)}/><Select label="Urgency level" v={form.priority} on={v=>set("priority",v)} opts={["Low","Medium","High","Critical"]}/></Panel>
      <Panel title="Supporting Information"><Upload label="Upload image placeholder"/><Upload label="Upload video placeholder"/><Upload label="Upload document placeholder"/><Text label="Existing attempts to solve the problem" v={form.attempts} on={v=>set("attempts",v)}/><Input label="Number of people affected" type="number" v={form.affected} on={v=>set("affected",v)} required/><Text label="Expected impact" v={form.impact} on={v=>set("impact",v)}/></Panel>
      <label className="flex gap-3 rounded-2xl border bg-white p-5 text-sm shadow-sm"><input type="checkbox" required checked={form.consent} onChange={e=>set("consent",e.target.checked)}/> I confirm that the information provided is accurate.</label>
      {error&&<p className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600">{error}</p>}
      <button disabled={busy} className="impact-gradient min-h-11 rounded-xl px-6 py-3 font-semibold text-white shadow-sm disabled:opacity-60">{busy?"Submitting...":"Submit Challenge"}</button>
    </form>
    <Modal open={!!modal} title="Challenge submitted" onClose={()=>navigate(`/challenges/${modal}`)}><p className="text-slate-600">Your challenge ID is <strong className="text-navy">{modal}</strong>. The mock AI review has been queued.</p><button onClick={()=>navigate(`/challenges/${modal}`)} className="mt-5 rounded-xl bg-blue px-5 py-3 font-semibold text-white">View Challenge Details</button></Modal>
  </div>;
}
function Panel({ title, children }) { return <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 lg:p-10"><h2 className="mb-6 text-xl font-semibold text-navy sm:text-2xl">{title}</h2><div className="grid gap-6 lg:grid-cols-2">{children}</div></section>; }
function Input({ label, v, on, type="text", required }) { return <label className="text-sm font-semibold text-slate-600">{label}<input required={required} type={type} value={v} onChange={e=>on(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border px-4 py-3 outline-none focus:border-blue"/></label>; }
function Text({ label, v, on, required }) { return <label className="text-sm font-semibold text-slate-600 lg:col-span-2">{label}<textarea required={required} value={v} onChange={e=>on(e.target.value)} rows="5" className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-blue"/></label>; }
function Select({ label, v, on, opts }) { return <label className="text-sm font-semibold text-slate-600">{label}<select value={v} onChange={e=>on(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border px-4 py-3 outline-none focus:border-blue">{opts.map(o=><option key={o}>{o}</option>)}</select></label>; }
function Upload({ label }) { return <div className="rounded-2xl border border-dashed bg-slate-50 p-5 text-sm font-semibold text-slate-500">{label}</div>; }
