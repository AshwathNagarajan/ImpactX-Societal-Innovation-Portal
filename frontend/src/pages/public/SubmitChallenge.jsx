import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { categories, districts } from "../../data/referenceData.js";
import Modal from "../../components/common/Modal.jsx";
import { challengeService } from "../../services/challengeService.js";
import { evidenceService } from "../../services/evidenceService.js";
import { otpService } from "../../services/otpService.js";
export default function SubmitChallenge() {
  const navigate = useNavigate();
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);
  const [otpBusy, setOtpBusy] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState({ verification_id: "", code: "", verified: false, message: "" });
  const [form, setForm] = useState({ name:"", mobile:"", email:"", title:"", description:"", category:"Agriculture", subCategory:"", district:"Ranchi", city:"", location:"", priority:"Medium", attempts:"", affected:"", impact:"", consent:false });
  const [uploads, setUploads] = useState({ images: [], videos: [], documents: [] });
  const set = (k,v)=>setForm(f=>({...f,[k]:v}));
  const setFiles = (key, files)=>setUploads(current=>({...current,[key]:Array.from(files || [])}));
  const requestOtp = async () => {
    setOtpBusy(true);
    setError("");
    try {
      const response = await otpService.request(form.mobile);
      setOtp({ verification_id: response.verification_id || response.data?.verification_id || "", code: "", verified: false, message: response.message || "OTP sent to your mobile number." });
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.detail || "Unable to send OTP.");
    } finally {
      setOtpBusy(false);
    }
  };
  const verifyOtp = async () => {
    setOtpBusy(true);
    setError("");
    try {
      await otpService.verify({ verification_id: otp.verification_id, mobile: form.mobile, otp: otp.code });
      setOtp((current) => ({ ...current, verified: true, message: "Mobile number verified." }));
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.detail || "Unable to verify OTP.");
    } finally {
      setOtpBusy(false);
    }
  };
  const submit = async (e) => {
    e.preventDefault();
    if (!otp.verified) {
      setError("Verify your mobile number before submitting the challenge.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const allFiles = [...uploads.images, ...uploads.videos, ...uploads.documents];
      const evidence = allFiles.length ? await evidenceService.upload(allFiles, "challenge_submission", "") : { items: [] };
      const response = await challengeService.create({
        submitted_by: { name: form.name || "Verified Citizen", email: form.email || null, phone: form.mobile, type: "Citizen", verification_id: otp.verification_id, mobile_verified: true, notification_consent: true },
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
        attachments: evidence.items || [],
      });
      setModal({ id: response.challenge_id, status: response.data?.status, validation: response.data?.ai_validation });
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.detail || "Unable to submit challenge. Please check the form and try again.");
    } finally {
      setBusy(false);
    }
  };
  return <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-12 lg:px-10 xl:px-0"><span className="rounded-full border border-blue/20 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue sm:text-sm">Citizen Submission</span><h1 className="mt-5 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">Submit a Societal Challenge</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">Verify your mobile number first. AI filters service requests, duplicates and spam before opening worthy innovation challenges.</p>
    <form onSubmit={submit} className="mt-8 space-y-8">
      <Panel title="Submitter Verification"><Input label="Name" v={form.name} on={v=>set("name",v)} required/><Input label="Email (optional)" type="email" v={form.email} on={v=>set("email",v)}/><Input label="Mobile Number" type="tel" v={form.mobile} on={v=>{set("mobile",v);setOtp({ verification_id:"", code:"", verified:false, message:"" });}} required/><div className="self-end"><button type="button" disabled={otpBusy || !form.mobile || otp.verified} onClick={requestOtp} className="min-h-12 w-full rounded-xl border border-blue/30 bg-blue/10 px-5 py-3 text-sm font-semibold text-blue disabled:opacity-50">{otp.verified?"Verified":otpBusy?"Sending...":"Send OTP"}</button></div>{otp.verification_id&&!otp.verified&&<label className="text-sm font-semibold text-slate-600">OTP<input value={otp.code} onChange={e=>setOtp(current=>({...current,code:e.target.value}))} className="mt-2 min-h-12 w-full rounded-xl border px-4 py-3 outline-none focus:border-blue"/></label>}{otp.verification_id&&!otp.verified&&<div className="self-end"><button type="button" disabled={otpBusy || !otp.code} onClick={verifyOtp} className="impact-gradient min-h-12 w-full rounded-xl px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">Verify OTP</button></div>}{otp.message&&<p className="rounded-2xl bg-blue/10 p-4 text-sm font-semibold text-blue lg:col-span-2">{otp.message}</p>}</Panel>
      <Panel title="Challenge Information"><Input label="Challenge Title" v={form.title} on={v=>set("title",v)} required/><Text label="Description" v={form.description} on={v=>set("description",v)} required/><Select label="Category" v={form.category} on={v=>set("category",v)} opts={categories}/><Input label="Sub-category" v={form.subCategory} on={v=>set("subCategory",v)}/><Select label="District" v={form.district} on={v=>set("district",v)} opts={districts}/><Input label="City / Village" v={form.city} on={v=>set("city",v)}/><Input label="Exact location text" v={form.location} on={v=>set("location",v)}/><Select label="Urgency level" v={form.priority} on={v=>set("priority",v)} opts={["Low","Medium","High","Critical"]}/></Panel>
      <Panel title="Supporting Information"><Upload label="Upload images" accept="image/*" files={uploads.images} on={files=>setFiles("images",files)}/><Upload label="Upload videos" accept="video/*" files={uploads.videos} on={files=>setFiles("videos",files)}/><Upload label="Upload documents" accept=".pdf,.doc,.docx,.txt,.csv,.md,image/*" files={uploads.documents} on={files=>setFiles("documents",files)}/><Text label="Existing attempts to solve the problem" v={form.attempts} on={v=>set("attempts",v)}/><Input label="Number of people affected" type="number" v={form.affected} on={v=>set("affected",v)} required/><Text label="Expected impact" v={form.impact} on={v=>set("impact",v)}/></Panel>
      <label className="flex gap-3 rounded-2xl border bg-white p-5 text-sm shadow-sm"><input type="checkbox" required checked={form.consent} onChange={e=>set("consent",e.target.checked)}/> I confirm that the information provided is accurate.</label>
      {error&&<p className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600">{error}</p>}
      <button disabled={busy || !otp.verified} className="impact-gradient min-h-11 rounded-xl px-6 py-3 font-semibold text-white shadow-sm disabled:opacity-60">{busy?"Submitting...":"Submit Challenge"}</button>
    </form>
    <Modal open={!!modal} title="Challenge submitted" onClose={()=>navigate(`/challenges/${modal?.id}`)}><p className="text-slate-600">Your challenge ID is <strong className="text-navy">{modal?.id}</strong>. AI classified it as <strong className="text-navy">{String(modal?.validation?.classification || modal?.status || "AI reviewed").replaceAll("_"," ")}</strong>.</p><p className="mt-3 text-sm text-slate-500">{modal?.validation?.reason}</p><button onClick={()=>navigate(`/challenges/${modal?.id}`)} className="mt-5 rounded-xl bg-blue px-5 py-3 font-semibold text-white">View Challenge Details</button></Modal>
  </div>;
}
function Panel({ title, children }) { return <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 lg:p-10"><h2 className="mb-6 text-xl font-semibold text-navy sm:text-2xl">{title}</h2><div className="grid gap-6 lg:grid-cols-2">{children}</div></section>; }
function Input({ label, v, on, type="text", required }) { return <label className="text-sm font-semibold text-slate-600">{label}<input required={required} type={type} value={v} onChange={e=>on(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border px-4 py-3 outline-none focus:border-blue"/></label>; }
function Text({ label, v, on, required }) { return <label className="text-sm font-semibold text-slate-600 lg:col-span-2">{label}<textarea required={required} value={v} onChange={e=>on(e.target.value)} rows="5" className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-blue"/></label>; }
function Select({ label, v, on, opts }) { return <label className="text-sm font-semibold text-slate-600">{label}<select value={v} onChange={e=>on(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border px-4 py-3 outline-none focus:border-blue">{opts.map(o=><option key={o}>{o}</option>)}</select></label>; }
function Upload({ label, accept, files, on }) { return <label className="rounded-2xl border border-dashed border-blue/25 bg-blue/10 p-5 text-sm font-semibold text-slate-700">{label}<input type="file" multiple accept={accept} onChange={e=>on(e.target.files)} className="mt-3 block w-full text-sm text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-blue file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"/><span className="mt-2 block text-xs font-medium text-slate-500">{files?.length ? `${files.length} file(s) selected` : "Choose files to store with OCR/text extraction where possible."}</span></label>; }
