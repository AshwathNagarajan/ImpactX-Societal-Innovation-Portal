import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { aiService } from "../../services/aiService.js";
import { adminService } from "../../services/adminService.js";

export default function ValidationQueue() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    let mounted = true;
    const loadQueue = async () => {
      setLoading(true);
      setError("");
      try {
        const [pending, review] = await Promise.all([
          adminService.pendingChallenges(),
          aiService.getAdminReviewCenter(),
        ]);
        if (!mounted) return;
        const reviewById = new Map((review.items || []).map((item) => [item.challenge_id, item]));
        setRows((pending.items || []).map((challenge) => normalizeQueueRow(challenge, reviewById.get(challenge.challenge_id))));
      } catch (err) {
        if (mounted) setError(err?.response?.data?.message || err?.response?.data?.detail || "Unable to load the live validation queue.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadQueue();
    return () => {
      mounted = false;
    };
  }, []);

  const act = async (id, status) => {
    setBusy(`${id}-${status}`);
    setError("");
    setMessage("");
    try {
      if (status === "Validated") await adminService.approveChallenge(id);
      else if (status === "Rejected") await adminService.rejectChallenge(id);
      else await adminService.requestInfo(id);
      setRows((current) => status === "Validated" || status === "Rejected"
        ? current.filter((row) => row.id !== id)
        : current.map((row) => row.id === id ? { ...row, status: "UNDER_REVIEW" } : row));
      setMessage(`${id} moved to ${status}.`);
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.detail || "Unable to update challenge.");
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="min-w-0">
      <h1 className="text-3xl font-semibold tracking-tight text-navy md:text-4xl">Validation Queue</h1>
      {message && <p className="mt-6 rounded-2xl bg-green/10 p-4 font-semibold text-green">{message}</p>}
      {error && <p className="mt-6 rounded-2xl bg-red-50 p-4 font-semibold text-red-600">{error}</p>}
      {loading ? (
        <div className="mt-8 rounded-2xl border bg-white p-6 text-sm font-semibold text-slate-600 shadow-sm">Loading live validation queue...</div>
      ) : (
        <div className="scrollbar-thin mt-8 overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full min-w-[860px] text-left text-sm md:min-w-[980px]">
            <thead className="bg-slate-50 text-slate-500">
              <tr>{["Challenge ID", "Title", "Category", "District", "AI Priority Score", "Submitted Date", "Action"].map((heading) => <th key={heading} className="px-5 py-4">{heading}</th>)}</tr>
            </thead>
            <tbody>
              {rows.length ? rows.map((challenge) => (
                <tr key={challenge.id} className="border-t">
                  <td className="px-5 py-4 font-bold text-blue">{challenge.id}</td>
                  <td className="max-w-72 px-5 py-4 font-semibold text-navy">{challenge.title}</td>
                  <td className="px-5 py-4">{challenge.category}</td>
                  <td className="px-5 py-4">{challenge.district}</td>
                  <td className="px-5 py-4">{challenge.priorityScore}</td>
                  <td className="px-5 py-4">{challenge.date}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-2 lg:flex-row">
                      <Link to={`/admin/review/${challenge.id}`} className="rounded-xl border px-3 py-2 text-center font-semibold text-blue">View</Link>
                      <button disabled={!!busy} onClick={() => act(challenge.id, "Validated")} className="rounded-xl bg-green px-3 py-2 font-semibold text-white disabled:opacity-60">{busy === `${challenge.id}-Validated` ? "Saving..." : "Approve"}</button>
                      <button disabled={!!busy} onClick={() => act(challenge.id, "Rejected")} className="rounded-xl bg-red-600 px-3 py-2 font-semibold text-white disabled:opacity-60">Reject</button>
                      <button disabled={!!busy} onClick={() => act(challenge.id, "Under Review")} className="rounded-xl bg-orange px-3 py-2 font-semibold text-white disabled:opacity-60">Request Info</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="7" className="px-5 py-10 text-center font-semibold text-slate-500">No live challenges are waiting for validation.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function normalizeQueueRow(challenge, review = {}) {
  const createdAt = challenge.created_at ? new Date(challenge.created_at) : null;
  return {
    id: challenge.challenge_id,
    title: challenge.title,
    category: review.ai_category || challenge.ai_analysis?.primary_category || challenge.category || "Unclassified",
    district: challenge.district || "Not provided",
    priorityScore: review.priority?.score ?? challenge.ai_analysis?.priority?.score ?? challenge.ai_analysis?.priority_score ?? "Pending",
    date: createdAt && !Number.isNaN(createdAt.valueOf()) ? createdAt.toLocaleDateString() : "Pending",
    status: challenge.status,
  };
}
