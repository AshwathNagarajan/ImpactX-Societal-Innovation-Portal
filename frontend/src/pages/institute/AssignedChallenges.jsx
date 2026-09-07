import { useEffect, useState } from "react";
import ChallengeCard from "../../components/challenges/ChallengeCard.jsx";
import { instituteService } from "../../services/instituteService.js";
import { apiErrorMessage } from "../../utils/apiError.js";

export default function AssignedChallenges() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  const loadAssigned = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await instituteService.assignedChallenges();
      setChallenges(res.items || []);
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to load assigned challenges."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssigned();
  }, []);

  const act = async (challenge, type) => {
    setBusy(`${type}-${challenge.challenge_id || challenge.id}`);
    setNote("");
    setError("");
    try {
      if (type === "accept") await instituteService.acceptChallenge(challenge.challenge_id || challenge.id);
      else await instituteService.rejectChallenge(challenge.challenge_id || challenge.id);
      setNote(`${challenge.title} ${type === "accept" ? "accepted and project workspace created" : "rejected with capacity note"}.`);
      await loadAssigned();
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to update challenge."));
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="min-w-0">
      <h1 className="text-3xl font-semibold tracking-tight text-navy md:text-4xl">Assigned Challenges</h1>
      {note && <p className="mt-6 rounded-2xl bg-green/10 p-4 font-semibold text-green">{note}</p>}
      {error && <p className="mt-6 rounded-2xl bg-red-50 p-4 font-semibold text-red-600">{error}</p>}
      {loading ? (
        <div className="mt-8 rounded-2xl border bg-white p-6 text-sm font-semibold text-slate-600 shadow-sm">Loading assigned challenges...</div>
      ) : challenges.length ? (
        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          {challenges.map((challenge) => {
            const id = challenge.challenge_id || challenge.id;
            return (
              <div key={id} className="min-w-0">
                <ChallengeCard challenge={{ ...challenge, id }} />
                <div className="mt-3 grid gap-3 rounded-2xl border bg-white p-4 shadow-sm sm:grid-cols-3">
                  <button disabled={!!busy} onClick={() => act(challenge, "accept")} className="rounded-xl bg-green px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                    {busy === `accept-${id}` ? "Saving..." : "Accept challenge"}
                  </button>
                  <button disabled={!!busy} onClick={() => act(challenge, "reject")} className="rounded-xl bg-red-600 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-60">Reject</button>
                  <a href={`/institute/proposals?challenge=${id}`} className="rounded-xl bg-blue px-3 py-2.5 text-center text-sm font-semibold text-white">Submit proposal</a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border bg-white p-6 text-sm font-semibold text-slate-600 shadow-sm">No challenges are accepted by your institute yet. Open an AI-approved challenge and accept it to begin proposal development.</div>
      )}
    </div>
  );
}
