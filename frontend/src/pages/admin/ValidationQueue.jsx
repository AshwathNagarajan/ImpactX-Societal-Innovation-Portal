import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { aiService } from "../../services/aiService.js";
import { adminService } from "../../services/adminService.js";
import { apiErrorMessage } from "../../utils/apiError.js";
import { useToast } from "../../components/common/ToastProvider.jsx";

export default function ValidationQueue() {
  const [rows, setRows] = useState([]);
  const [assignmentRequests, setAssignmentRequests] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [supportOffers, setSupportOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [search, setSearch] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    let mounted = true;
    const loadQueue = async () => {
      setLoading(true);
      setError("");
      try {
        const [pending, review, requests, proposalRows, offerRows] = await Promise.all([
          adminService.pendingChallenges(),
          aiService.getAdminReviewCenter(),
          adminService.assignmentRequests(),
          adminService.proposals("SUBMITTED"),
          adminService.supportOffers("PENDING_REVIEW"),
        ]);
        if (!mounted) return;
        const reviewById = new Map((review.items || []).map((item) => [item.challenge_id, item]));
        setRows((pending.items || []).map((challenge) => normalizeQueueRow(challenge, reviewById.get(challenge.challenge_id))));
        setAssignmentRequests(requests.items || []);
        setProposals(proposalRows.items || []);
        setSupportOffers(offerRows.items || []);
      } catch (err) {
        if (mounted) setError(apiErrorMessage(err, "Unable to load the live validation queue."));
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
      if (status === "Rejected") await adminService.rejectChallenge(id);
      else await adminService.requestInfo(id);
      setRows((current) => status === "Rejected"
        ? current.filter((row) => row.id !== id)
        : current.map((row) => row.id === id ? { ...row, status: "UNDER_REVIEW" } : row));
      const text = `${id} moved to ${status}.`;
      setMessage(text);
      showToast(text);
    } catch (err) {
      const text = apiErrorMessage(err, "Unable to update challenge.");
      setError(text);
      showToast(text, "error");
    } finally {
      setBusy("");
    }
  };

  const approveRequest = async (request) => {
    const requestId = request.id || request._id;
    setBusy(`request-${requestId}`);
    setError("");
    setMessage("");
    try {
      await adminService.approveAssignmentRequest(requestId);
      setAssignmentRequests((current) => current.filter((item) => (item.id || item._id) !== requestId));
      const text = `${request.challenge_id} assigned to ${request.institute_name || "the requesting institute"}.`;
      setMessage(text);
      showToast(text);
    } catch (err) {
      const text = apiErrorMessage(err, "Unable to approve assignment request.");
      setError(text);
      showToast(text, "error");
    } finally {
      setBusy("");
    }
  };

  const updateRequest = async (request, status) => {
    const requestId = request.id || request._id;
    setBusy(`request-${requestId}-${status}`);
    setError("");
    setMessage("");
    try {
      await adminService.updateAssignmentRequest(requestId, { status, comment: status === "REJECTED" ? "Assignment request rejected by admin." : "Assignment request placed on hold for review." });
      setAssignmentRequests((current) => current.filter((item) => (item.id || item._id) !== requestId));
      const text = `${request.challenge_id} assignment request moved to ${status.replace("_", " ").toLowerCase()}.`;
      setMessage(text);
      showToast(text);
    } catch (err) {
      const text = apiErrorMessage(err, "Unable to update assignment request.");
      setError(text);
      showToast(text, "error");
    } finally {
      setBusy("");
    }
  };

  const updateProposal = async (proposal, status) => {
    const proposalId = proposal.id || proposal._id;
    setBusy(`proposal-${proposalId}-${status}`);
    setError("");
    setMessage("");
    try {
      await adminService.updateProposal(proposalId, { status, comment: status === "APPROVED" ? "Proposal approved for research execution." : "Proposal needs revision before approval." });
      setProposals((current) => current.filter((item) => (item.id || item._id) !== proposalId));
      const text = `${proposal.challenge_id} proposal moved to ${status.replace("_", " ").toLowerCase()}.`;
      setMessage(text);
      showToast(text);
    } catch (err) {
      const text = apiErrorMessage(err, "Unable to update proposal.");
      setError(text);
      showToast(text, "error");
    } finally {
      setBusy("");
    }
  };

  const updateSupportOffer = async (offer, status) => {
    const offerId = offer.id || offer._id;
    setBusy(`offer-${offerId}-${status}`);
    setError("");
    setMessage("");
    try {
      await adminService.updateSupportOffer(offerId, { status, comment: status === "ACTIVE" ? "Support offer approved for implementation." : "Support offer needs revision before activation." });
      setSupportOffers((current) => current.filter((item) => (item.id || item._id) !== offerId));
      const text = `${offer.project_id} support offer moved to ${status.replace("_", " ").toLowerCase()}.`;
      setMessage(text);
      showToast(text);
    } catch (err) {
      const text = apiErrorMessage(err, "Unable to update support offer.");
      setError(text);
      showToast(text, "error");
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="min-w-0">
      <h1 className="text-3xl font-semibold tracking-tight text-navy md:text-4xl">AI Exception Queue</h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">Challenges are approved or filtered by AI at intake. This queue is for duplicates, service requests, threats, and submissions that need more information.</p>
      {message && <p className="mt-6 rounded-2xl bg-green/10 p-4 font-semibold text-green">{message}</p>}
      {error && <p className="mt-6 rounded-2xl bg-red-50 p-4 font-semibold text-red-600">{error}</p>}
      {!loading && <div className="mt-6 rounded-2xl border bg-white p-4 shadow-sm"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search challenges, proposals, requests or support offers" className="min-h-12 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue" /></div>}
      {!loading && visibleItems(assignmentRequests, search).length > 0 && (
        <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue">Legacy Assignment Requests</p>
              <h2 className="mt-1 text-xl font-semibold text-navy">Requests created before direct institute acceptance</h2>
            </div>
            <span className="text-sm font-semibold text-slate-500">{visibleItems(assignmentRequests, search).length} pending</span>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {visibleItems(assignmentRequests, search).map((request) => {
              const requestId = request.id || request._id;
              return (
                <div key={requestId} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-blue">{request.challenge_id}</p>
                  <h3 className="mt-2 font-semibold text-navy">{request.challenge?.title || "Challenge assignment"}</h3>
                  <p className="mt-2 text-sm text-slate-600">{request.institute_name || "Institute"} requested this challenge.</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link to={`/admin/review/${request.challenge_id}`} className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-blue">Review</Link>
                    <button disabled={!!busy} onClick={() => approveRequest(request)} className="rounded-xl bg-green px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{busy === `request-${requestId}` ? "Assigning..." : "Approve assignment"}</button>
                    <button disabled={!!busy} onClick={() => updateRequest(request, "ON_HOLD")} className="rounded-xl bg-orange px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Hold</button>
                    <button disabled={!!busy} onClick={() => updateRequest(request, "REJECTED")} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Reject</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
      {!loading && <ReviewCards title="Proposal Review" eyebrow="Institute Proposals" empty="No submitted proposals are waiting for review." items={visibleItems(proposals, search)} render={(proposal) => (
        <div key={proposal.id || proposal._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-blue">{proposal.challenge_id}</p>
          <h3 className="mt-2 font-semibold text-navy">{proposal.technology || "Proposed solution"}</h3>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{proposal.proposed_solution}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button disabled={!!busy} onClick={() => updateProposal(proposal, "APPROVED")} className="rounded-xl bg-green px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Approve</button>
            <button disabled={!!busy} onClick={() => updateProposal(proposal, "CHANGES_REQUESTED")} className="rounded-xl bg-orange px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Request changes</button>
            <button disabled={!!busy} onClick={() => updateProposal(proposal, "REJECTED")} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Reject</button>
          </div>
        </div>
      )} />}
      {!loading && <ReviewCards title="Support Offer Review" eyebrow="Industry Support" empty="No industry support offers are waiting for approval." items={visibleItems(supportOffers, search)} render={(offer) => (
        <div key={offer.id || offer._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-teal">{offer.project_id}</p>
          <h3 className="mt-2 font-semibold text-navy">{offer.support_type || "Support offer"}</h3>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{offer.contribution}</p>
          {offer.funding_amount ? <p className="mt-2 text-sm font-semibold text-slate-700">Funding: ₹{Number(offer.funding_amount).toLocaleString()}</p> : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <button disabled={!!busy} onClick={() => updateSupportOffer(offer, "ACTIVE")} className="rounded-xl bg-green px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Approve</button>
            <button disabled={!!busy} onClick={() => updateSupportOffer(offer, "CHANGES_REQUESTED")} className="rounded-xl bg-orange px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Request changes</button>
            <button disabled={!!busy} onClick={() => updateSupportOffer(offer, "REJECTED")} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Reject</button>
          </div>
        </div>
      )} />}
      {loading ? (
        <div className="mt-8 rounded-2xl border bg-white p-6 text-sm font-semibold text-slate-600 shadow-sm">Loading live validation queue...</div>
      ) : (
        <section className="mt-8">
          <div className="mb-4">
            <p className="text-sm font-semibold text-blue">AI Intake Exceptions</p>
            <h2 className="mt-1 text-xl font-semibold text-navy">Filtered challenge submissions</h2>
          </div>
          <div className="scrollbar-thin overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full min-w-[860px] text-left text-sm md:min-w-[980px]">
            <thead className="bg-slate-50 text-slate-500">
              <tr>{["Challenge ID", "Title", "AI Classification", "District", "AI Priority Score", "Submitted Date", "Action"].map((heading) => <th key={heading} className="px-5 py-4">{heading}</th>)}</tr>
            </thead>
            <tbody>
              {visibleItems(rows, search).length ? visibleItems(rows, search).map((challenge) => (
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
                      <button disabled={!!busy} onClick={() => act(challenge.id, "Rejected")} className="rounded-xl bg-red-600 px-3 py-2 font-semibold text-white disabled:opacity-60">Reject</button>
                      <button disabled={!!busy} onClick={() => act(challenge.id, "Under Review")} className="rounded-xl bg-orange px-3 py-2 font-semibold text-white disabled:opacity-60">Request Info</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="7" className="px-5 py-10 text-center font-semibold text-slate-500">No matching AI intake exceptions need review.</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </section>
      )}
    </div>
  );
}

function visibleItems(items, search) {
  const query = search.trim().toLowerCase();
  if (!query) return items;
  return items.filter((item) => JSON.stringify(item).toLowerCase().includes(query));
}

function ReviewCards({ title, eyebrow, items, empty, render }) {
  return (
    <section className="mt-8 rounded-2xl border bg-slate-50 p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue">{eyebrow}</p>
          <h2 className="mt-1 text-xl font-semibold text-navy">{title}</h2>
        </div>
        <span className="text-sm font-semibold text-slate-500">{items.length} pending</span>
      </div>
      {items.length ? <div className="mt-5 grid gap-4 lg:grid-cols-2">{items.map(render)}</div> : <p className="mt-5 rounded-2xl border border-dashed bg-white p-5 text-sm font-semibold text-slate-500">{empty}</p>}
    </section>
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
