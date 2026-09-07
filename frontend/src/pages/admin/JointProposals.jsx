import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, FileCheck, XCircle } from "lucide-react";
import { adminService } from "../../services/adminService.js";
import { apiErrorMessage } from "../../utils/apiError.js";

export default function JointProposals() {
  const [items, setItems] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = () => adminService.jointProposals().then((res) => setItems(res.items || [])).catch((err) => setError(apiErrorMessage(err, "Unable to load joint proposals.")));

  useEffect(() => {
    load();
  }, []);

  const grouped = useMemo(() => {
    const map = new Map();
    items.forEach((item) => {
      const id = item.challenge_id;
      if (!map.has(id)) map.set(id, { challenge: item.challenge || { challenge_id: id, title: id }, proposals: [] });
      map.get(id).proposals.push(item);
    });
    return Array.from(map.values());
  }, [items]);

  const update = async (proposal, status) => {
    const id = proposal.id || proposal._id;
    setBusy(id + status);
    setMessage("");
    setError("");
    try {
      await adminService.updateJointProposal(id, { status, comment: status === "GOV_APPROVED" ? "Joint proposal approved for project execution." : status === "CHANGES_REQUESTED" ? "Please refine the joint implementation plan." : "Joint proposal rejected by government review." });
      setMessage(`Joint proposal marked ${status.replaceAll("_", " ").toLowerCase()}.`);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to update joint proposal."));
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="min-w-0 space-y-8">
      <div>
        <p className="text-sm font-semibold text-cyan-300">Government Validation</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">Joint Proposal Review</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">Each card represents one challenge. Open it to review institute-industry tie-up proposals and approve the final collaboration before project execution.</p>
      </div>
      {message && <p className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 font-semibold text-emerald-200">{message}</p>}
      {error && <p className="rounded-2xl border border-red-300/20 bg-red-300/10 p-4 font-semibold text-red-200">{error}</p>}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {grouped.map((group) => <article key={group.challenge.challenge_id} className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-200"><FileCheck size={21} /></span>
          <h2 className="mt-5 text-xl font-semibold text-white">{group.challenge.title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">{group.challenge.description || "Review submitted collaborations for this challenge."}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-blue-400/10 px-3 py-1 text-blue-200">{group.proposals.length} proposal(s)</span>
            <span className="rounded-full bg-violet-400/10 px-3 py-1 text-violet-200">{group.challenge.priority || "Priority pending"}</span>
          </div>
          <button onClick={() => setSelectedChallenge(group)} className="mt-6 inline-flex items-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100"><Eye size={16} /> View Proposals</button>
        </article>)}
      </div>
      {!grouped.length && <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-sm font-semibold text-slate-300">No joint proposals are waiting for review.</div>}
      {selectedChallenge && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm" onMouseDown={() => setSelectedChallenge(null)}>
        <section onMouseDown={(event) => event.stopPropagation()} className="max-h-[88vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-cyan-300">{selectedChallenge.challenge.challenge_id}</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{selectedChallenge.challenge.title}</h2>
            </div>
            <button onClick={() => setSelectedChallenge(null)} className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200">Close</button>
          </div>
          <div className="mt-7 space-y-5">
            {selectedChallenge.proposals.map((proposal) => <article key={proposal.id || proposal._id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{proposal.institute_name} + {proposal.industry_name}</h3>
                  <p className="mt-1 text-sm text-slate-400">{proposal.status?.replaceAll("_", " ")}</p>
                </div>
                <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">{proposal.support_type}</span>
              </div>
              <div className="mt-4 grid gap-4 text-sm leading-6 text-slate-300 md:grid-cols-2">
                <p><span className="font-semibold text-white">Solution:</span> {proposal.solution || "Not specified"}</p>
                <p><span className="font-semibold text-white">Technology:</span> {proposal.technology || "Not specified"}</p>
                <p><span className="font-semibold text-white">Industry contribution:</span> {proposal.industry_contribution || "Not specified"}</p>
                <p><span className="font-semibold text-white">Budget:</span> INR {Number(proposal.budget || 0).toLocaleString()}</p>
                <p><span className="font-semibold text-white">Timeline:</span> {proposal.timeline || "Not specified"}</p>
                <p><span className="font-semibold text-white">Expected impact:</span> {proposal.expected_impact || "Not specified"}</p>
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button disabled={!!busy} onClick={() => update(proposal, "GOV_APPROVED")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60"><CheckCircle2 size={16} /> Approve</button>
                <button disabled={!!busy} onClick={() => update(proposal, "CHANGES_REQUESTED")} className="rounded-xl bg-amber-300 px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60">Request Changes</button>
                <button disabled={!!busy} onClick={() => update(proposal, "REJECTED")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-400 px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60"><XCircle size={16} /> Reject</button>
              </div>
            </article>)}
          </div>
        </section>
      </div>}
    </div>
  );
}
