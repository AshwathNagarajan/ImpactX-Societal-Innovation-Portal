import { useEffect, useState } from "react";
import { industryService } from "../../services/industryService.js";
import { apiErrorMessage } from "../../utils/apiError.js";

export default function DiscoverProjects({ recommendedOnly = false }) {
  const [proposals, setProposals] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(defaultForm());
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    let active = true;
    industryService.recommendedProjects()
      .then((res) => active && setProposals(res.items || []))
      .catch(() => active && setProposals([]));
    return () => {
      active = false;
    };
  }, []);

  const openOffer = (proposal) => {
    setSelected(proposal);
    setForm(defaultForm());
    setMessage("");
    setError("");
  };

  const submitOffer = async (event) => {
    event.preventDefault();
    if (!selected) return;
    const id = selected.id || selected._id;
    setBusy(id);
    setMessage("");
    setError("");
    try {
      await industryService.offerProposal({ ...form, proposal_id: id, funding_amount: Number(form.funding_amount || 0) });
      setMessage(`Offer sent to ${selected.institute_name || "the institute"}.`);
      setSelected(null);
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to send industry offer."));
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="min-w-0 space-y-8">
      <div>
        <p className="text-sm font-semibold text-teal">Industry Collaboration</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy md:text-4xl">{recommendedOnly ? "Recommended Institute Proposals" : "Discover Institute Proposals"}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">Review institute proposals that need funding, mentorship, pilot support or implementation resources. The institute chooses the partner before a joint government proposal is submitted.</p>
      </div>
      {message && <p className="rounded-2xl bg-green/10 p-4 font-semibold text-green">{message}</p>}
      {error && <p className="rounded-2xl bg-red-50 p-4 font-semibold text-red-600">{error}</p>}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {proposals.map((proposal) => <article key={proposal.id || proposal._id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-teal">{proposal.challenge?.category || proposal.challenge_id}</p>
          <h2 className="mt-3 text-xl font-semibold text-navy">{proposal.challenge?.title || proposal.proposed_solution}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{proposal.proposed_solution}</p>
          <div className="mt-5 space-y-2 text-sm text-slate-600">
            <p><span className="font-semibold text-slate-800">Technology:</span> {proposal.technology || "Not specified"}</p>
            <p><span className="font-semibold text-slate-800">Institute:</span> {proposal.institute_name || proposal.institute_id || "Partner Institute"}</p>
            <p><span className="font-semibold text-slate-800">Duration:</span> {proposal.estimated_duration || "To be finalized"}</p>
          </div>
          <button onClick={() => openOffer(proposal)} className="mt-6 w-full rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-white">Offer Collaboration</button>
        </article>)}
      </div>
      {!proposals.length && <div className="rounded-2xl border border-dashed bg-white p-6 text-sm font-semibold text-slate-500">No institute proposals are waiting for industry support.</div>}
      {selected && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm" onMouseDown={() => setSelected(null)}>
        <form onSubmit={submitOffer} onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-2xl rounded-3xl border bg-white p-6 shadow-2xl md:p-8">
          <p className="text-sm font-semibold text-teal">Offer Collaboration</p>
          <h2 className="mt-2 text-2xl font-semibold text-navy">{selected.challenge?.title || selected.proposed_solution}</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Field label="Support Type" value={form.support_type} onChange={(value) => setFormField(setForm, "support_type", value)} />
            <Field label="Funding Amount" type="number" value={form.funding_amount} onChange={(value) => setFormField(setForm, "funding_amount", value)} />
            <Field label="Funding Type" value={form.funding_type} onChange={(value) => setFormField(setForm, "funding_type", value)} />
            <Field label="CSR Category" value={form.csr_category} onChange={(value) => setFormField(setForm, "csr_category", value)} />
            <Field label="Timeline" value={form.timeline} onChange={(value) => setFormField(setForm, "timeline", value)} />
            <Field label="Mentor Name" value={form.mentor_name} onChange={(value) => setFormField(setForm, "mentor_name", value)} />
            <Area label="Milestone Release Plan" value={form.milestone_release} onChange={(value) => setFormField(setForm, "milestone_release", value)} />
            <Area label="Contribution" value={form.contribution} onChange={(value) => setFormField(setForm, "contribution", value)} required />
            <Area label="Notes" value={form.notes} onChange={(value) => setFormField(setForm, "notes", value)} />
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setSelected(null)} className="rounded-xl border px-5 py-3 text-sm font-semibold text-slate-700">Cancel</button>
            <button disabled={busy === (selected.id || selected._id)} className="rounded-xl bg-teal px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Sending..." : "Send Offer"}</button>
          </div>
        </form>
      </div>}
    </div>
  );
}

function defaultForm() {
  return { support_type: "Funding and Mentorship", contribution: "", mentor_name: "", timeline: "", notes: "", funding_amount: "", currency: "INR", funding_type: "CSR Grant", milestone_release: "", csr_category: "" };
}
function setFormField(setForm, key, value) {
  setForm((current) => ({ ...current, [key]: value }));
}
function Field({ label, value, onChange, type = "text" }) {
  return <label className="text-sm font-semibold text-slate-600">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border px-4 py-3 outline-none focus:border-teal" /></label>;
}
function Area({ label, value, onChange, required }) {
  return <label className="text-sm font-semibold text-slate-600 md:col-span-2">{label}<textarea required={required} value={value} onChange={(event) => onChange(event.target.value)} rows="3" className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-teal" /></label>;
}
