import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { instituteService } from "../../services/instituteService.js";
import { proposalService } from "../../services/proposalService.js";
import { apiErrorMessage } from "../../utils/apiError.js";

export default function Proposal() {
  const [searchParams] = useSearchParams();
  const initialChallenge = searchParams.get("challenge") || "";
  const [assigned, setAssigned] = useState([]);
  const [done, setDone] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ challenge_id: initialChallenge, proposed_solution: "", technology: "", team_members: "", faculty_mentor: "", estimated_duration: "", required_resources: "", expected_outcome: "", need_industry_support: "Yes" });
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    let active = true;
    instituteService.assignedChallenges()
      .then((res) => {
        if (!active) return;
        const items = res.items || [];
        setAssigned(items);
        if (!form.challenge_id && items[0]) set("challenge_id", items[0].challenge_id || items[0].id);
      })
      .catch((err) => active && setError(apiErrorMessage(err, "Unable to load assigned challenges.")));
    return () => {
      active = false;
    };
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setDone("");
    setError("");
    try {
      const payload = { ...form, team_members: form.team_members.split(",").map((item) => item.trim()).filter(Boolean), need_industry_support: form.need_industry_support === "Yes" };
      const res = await proposalService.create(payload);
      setDone(`Proposal submitted to MongoDB with status ${res.data?.status || "SUBMITTED"}.`);
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to submit proposal."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-4xl min-w-0">
      <h1 className="text-3xl font-semibold tracking-tight text-navy md:text-4xl">Submit Proposal</h1>
      {done && <p className="mt-6 rounded-2xl bg-green/10 p-4 font-semibold text-green">{done}</p>}
      {error && <p className="mt-6 rounded-2xl bg-red-50 p-4 font-semibold text-red-600">{error}</p>}
      <form onSubmit={submit} className="mt-8 rounded-2xl border bg-white p-6 shadow-sm md:p-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <label className="text-sm font-semibold text-slate-600">Challenge
            <select required value={form.challenge_id} onChange={(event) => set("challenge_id", event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border px-4 py-3">
              <option value="">Select an assigned challenge</option>
              {assigned.map((challenge) => <option key={challenge.challenge_id || challenge.id} value={challenge.challenge_id || challenge.id}>{challenge.challenge_id || challenge.id} - {challenge.title}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-600">Technology<input required value={form.technology} onChange={(event) => set("technology", event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border px-4 py-3" /></label>
          <label className="text-sm font-semibold text-slate-600 lg:col-span-2">Proposed Solution<textarea required value={form.proposed_solution} onChange={(event) => set("proposed_solution", event.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" rows="5" /></label>
          <label className="text-sm font-semibold text-slate-600">Team Members<input value={form.team_members} onChange={(event) => set("team_members", event.target.value)} placeholder="Comma separated names" className="mt-2 min-h-12 w-full rounded-xl border px-4 py-3" /></label>
          <label className="text-sm font-semibold text-slate-600">Faculty Mentor<input required value={form.faculty_mentor} onChange={(event) => set("faculty_mentor", event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border px-4 py-3" /></label>
          <label className="text-sm font-semibold text-slate-600">Estimated Duration<input required value={form.estimated_duration} onChange={(event) => set("estimated_duration", event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border px-4 py-3" /></label>
          <label className="text-sm font-semibold text-slate-600">Required Resources<input value={form.required_resources} onChange={(event) => set("required_resources", event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border px-4 py-3" /></label>
          <label className="text-sm font-semibold text-slate-600 lg:col-span-2">Expected Outcome<textarea required value={form.expected_outcome} onChange={(event) => set("expected_outcome", event.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" rows="5" /></label>
          <label className="text-sm font-semibold text-slate-600">Need Industry Support?<select value={form.need_industry_support} onChange={(event) => set("need_industry_support", event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border px-4 py-3"><option>Yes</option><option>No</option></select></label>
        </div>
        <button disabled={busy || !assigned.length} className="mt-7 w-full rounded-xl bg-green px-5 py-3 font-semibold text-white disabled:opacity-60 sm:w-auto">{busy ? "Submitting..." : "Submit Proposal"}</button>
      </form>
    </div>
  );
}
