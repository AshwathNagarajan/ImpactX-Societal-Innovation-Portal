import { useState } from "react";
import { useImpactData } from "../../hooks/useImpactData.js";
import { supportTypes } from "../../data/referenceData.js";
import { partnershipService } from "../../services/partnershipService.js";
import { apiErrorMessage } from "../../utils/apiError.js";

const fundingTypes = ["CSR Grant", "Pilot Budget", "Equipment Sponsorship", "Cloud Credits", "Mentorship Only"];
const csrCategories = ["Healthcare", "Education", "Water & Sanitation", "Environment", "Livelihood", "Infrastructure"];

export default function Partnerships() {
  const { data } = useImpactData();
  const [done, setDone] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ project_id: "", support_type: supportTypes[0], contribution: "", mentor_name: "", timeline: "", notes: "", funding_amount: "", currency: "INR", funding_type: fundingTypes[0], milestone_release: "", csr_category: csrCategories[0] });
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setDone("");
    setError("");
    try {
      const payload = {
        ...form,
        project_id: form.project_id || data.projects[0]?.id,
        funding_amount: form.funding_amount ? Number(form.funding_amount) : null,
      };
      const res = await partnershipService.create(payload);
      setDone(`Support offer saved with status ${res.data?.status || "PENDING_REVIEW"}. Admin approval is required before activation.`);
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to confirm partnership."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-5xl min-w-0">
      <h1 className="text-3xl font-semibold tracking-tight text-navy md:text-4xl">Partnership Form</h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">Register industry support as a reviewable offer with funding, CSR and milestone details attached to the project.</p>
      {done && <p className="mt-6 rounded-2xl bg-green/10 p-4 font-semibold text-green">{done}</p>}
      {error && <p className="mt-6 rounded-2xl bg-red-50 p-4 font-semibold text-red-600">{error}</p>}
      <form onSubmit={submit} className="mt-8 rounded-2xl border bg-white p-6 shadow-sm md:p-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <Select label="Project" value={form.project_id} onChange={(value) => set("project_id", value)}>
            <option value="">Select project</option>
            {data.projects.slice(0, 10).map((project) => <option key={project.id} value={project.id}>{project.id} - {project.title}</option>)}
          </Select>
          <Select label="Support Type" value={form.support_type} onChange={(value) => set("support_type", value)}>{supportTypes.map((item) => <option key={item}>{item}</option>)}</Select>
          <Select label="Funding Type" value={form.funding_type} onChange={(value) => set("funding_type", value)}>{fundingTypes.map((item) => <option key={item}>{item}</option>)}</Select>
          <Select label="CSR Category" value={form.csr_category} onChange={(value) => set("csr_category", value)}>{csrCategories.map((item) => <option key={item}>{item}</option>)}</Select>
          <Field label="Funding Amount"><input type="number" min="0" value={form.funding_amount} onChange={(event) => set("funding_amount", event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border px-4 py-3" placeholder="Example: 500000" /></Field>
          <Field label="Currency"><input value={form.currency} onChange={(event) => set("currency", event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border px-4 py-3" /></Field>
          <Field label="Contribution"><input required value={form.contribution} onChange={(event) => set("contribution", event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border px-4 py-3" /></Field>
          <Field label="Mentor Name"><input value={form.mentor_name} onChange={(event) => set("mentor_name", event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border px-4 py-3" /></Field>
          <Field label="Timeline"><input value={form.timeline} onChange={(event) => set("timeline", event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border px-4 py-3" /></Field>
          <Field label="Milestone Release Plan"><input value={form.milestone_release} onChange={(event) => set("milestone_release", event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border px-4 py-3" placeholder="Example: 40% prototype, 60% pilot" /></Field>
          <Field label="Notes" wide><textarea value={form.notes} onChange={(event) => set("notes", event.target.value)} rows="5" className="mt-2 w-full rounded-xl border px-4 py-3" /></Field>
        </div>
        <button disabled={busy} className="mt-7 w-full rounded-xl bg-green px-5 py-3 font-semibold text-white disabled:opacity-60 sm:w-auto">{busy ? "Saving..." : "Submit support offer"}</button>
      </form>
    </div>
  );
}

function Field({ label, children, wide = false }) {
  return <label className={`text-sm font-semibold text-slate-600 ${wide ? "lg:col-span-2" : ""}`}>{label}{children}</label>;
}

function Select({ label, value, onChange, children }) {
  return <Field label={label}><select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border px-4 py-3">{children}</select></Field>;
}
