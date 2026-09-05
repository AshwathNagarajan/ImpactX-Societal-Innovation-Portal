import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import AIAnalysisCard from "../../components/ai/AIAnalysisCard.jsx";
import SimilarChallengeCard from "../../components/ai/SimilarChallengeCard.jsx";
import SolutionSuggestionCard from "../../components/ai/SolutionSuggestionCard.jsx";
import InstituteCard from "../../components/dashboard/InstituteCard.jsx";
import { aiService } from "../../services/aiService.js";
import { adminService } from "../../services/adminService.js";
import { challengeService } from "../../services/challengeService.js";

export default function ChallengeReview() {
  const { id } = useParams();
  const [challenge, setChallenge] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [solutions, setSolutions] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analysisBusy, setAnalysisBusy] = useState(false);
  const [actionBusy, setActionBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const topInstituteId = useMemo(() => institutes.find((item) => item.institute_id)?.institute_id, [institutes]);

  useEffect(() => {
    let mounted = true;
    const loadReview = async () => {
      setLoading(true);
      setError("");
      try {
        const [challengeRes, analysisRes, similarRes, instituteRes] = await Promise.all([
          challengeService.get(id),
          aiService.getAnalysis(id),
          aiService.getSimilarChallenges(id),
          aiService.getInstituteRecommendations(id),
        ]);
        if (!mounted) return;
        const liveAnalysis = analysisRes.data || {};
        setChallenge(challengeRes.data);
        setAnalysis(liveAnalysis);
        setSimilar(similarRes.items || liveAnalysis.similar_challenges || []);
        setSolutions(liveAnalysis.proposed_solution_directions || []);
        setInstitutes(instituteRes.items || liveAnalysis.recommended_institutes || []);
      } catch (err) {
        if (mounted) setError(err?.response?.data?.message || err?.response?.data?.detail || "Unable to load the live review center data.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadReview();
    return () => {
      mounted = false;
    };
  }, [id]);

  const runAnalysis = async () => {
    setAnalysisBusy(true);
    setError("");
    setMessage("");
    try {
      const analysisRes = await aiService.analyzeChallenge(id);
      const [similarRes, instituteRes, solutionRes] = await Promise.all([
        aiService.getSimilarChallenges(id),
        aiService.getInstituteRecommendations(id),
        aiService.generateSolutions(id),
      ]);
      setAnalysis(analysisRes.data || {});
      setSimilar(similarRes.items || []);
      setInstitutes(instituteRes.items || []);
      setSolutions(solutionRes.items || analysisRes.data?.proposed_solution_directions || []);
      setMessage("AI review completed with live recommendations.");
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.detail || "AI analysis failed. Retry analysis from admin review.");
    } finally {
      setAnalysisBusy(false);
    }
  };

  const runAction = async (action, instituteId = topInstituteId) => {
    setActionBusy(action);
    setMessage("");
    setError("");
    try {
      if (action === "Validate Challenge") await adminService.approveChallenge(id);
      else if (action === "Reject") await adminService.rejectChallenge(id);
      else if (action === "Request More Information") await adminService.requestInfo(id);
      else if (action === "Assign Institute") {
        if (!instituteId) throw new Error("Run AI analysis to get a live institute recommendation before assigning.");
        await adminService.assignChallenge(id, instituteId);
      } else if (action === "Override Severity") await adminService.updatePriority(id, "CRITICAL");
      else await adminService.requestInfo(id);
      const refreshed = await challengeService.get(id);
      setChallenge(refreshed.data);
      setMessage(`${action} completed for ${id}.`);
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.detail || err?.message || "Unable to complete action.");
    } finally {
      setActionBusy("");
    }
  };

  if (loading) return <div className="rounded-2xl border bg-white p-6 text-sm font-semibold text-slate-600 shadow-sm">Loading live challenge review...</div>;
  if (!challenge) return <div className="rounded-2xl border bg-white p-6 text-sm font-semibold text-red-600 shadow-sm">{error || "Challenge not found."}</div>;

  return (
    <div className="min-w-0">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue">Admin AI Review Center</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy md:text-4xl">Challenge Review</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">Review citizen evidence, AI analysis, duplicate signals and recommended assignment partners before human approval.</p>
        </div>
        <button onClick={runAnalysis} disabled={analysisBusy} className="impact-gradient min-h-11 rounded-xl px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{analysisBusy ? "Analyzing..." : "Run AI Analysis"}</button>
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <main className="min-w-0 space-y-8">
          <section className="rounded-2xl border bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-xl font-semibold leading-tight text-navy md:text-2xl">{challenge.title}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">{challenge.description}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Info k="Citizen submission" v={challenge.submitted_by?.name || "Not provided"} />
              <Info k="Status" v={formatStatus(challenge.status)} />
              <Info k="Location" v={[challenge.city_or_village, challenge.district].filter(Boolean).join(", ") || "Not provided"} />
              <Info k="People affected" v={challenge.people_affected?.toLocaleString?.() || "Not provided"} />
            </div>
          </section>
          <AIAnalysisCard analysis={analysis} />
          <Grid title="Similar Challenges" empty="No live duplicate signals returned yet.">{similar.slice(0, 3).map((item) => <SimilarChallengeCard key={item.challenge_id || item.title} challenge={item} />)}</Grid>
          <Grid title="AI Suggested Approaches" empty="No live solution directions returned yet.">{solutions.slice(0, 3).map((item) => <SolutionSuggestionCard key={item.title} solution={item} />)}</Grid>
          <Grid title="Recommended Institutes" empty="No live institute recommendations returned yet.">
            {institutes.map((institute) => (
              <InstituteCard
                key={institute.institute_id || institute.name}
                institute={{
                  ...institute,
                  expertise: institute.matching_expertise?.join(", ") || institute.expertise || institute.reason,
                  score: institute.match_score || institute.score || 0,
                  projects: institute.scoring?.previous_projects ? Math.round(institute.scoring.previous_projects / 30) : institute.projects || 0,
                  availability: institute.scoring?.availability >= 70 ? "High" : "Limited",
                }}
                onAssign={() => runAction("Assign Institute", institute.institute_id)}
              />
            ))}
          </Grid>
        </main>
        <aside className="min-w-0 space-y-5 lg:sticky lg:top-28 lg:self-start">
          {message && <p className="rounded-2xl bg-green/10 p-4 text-sm font-semibold text-green">{message}</p>}
          {error && <p className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600">{error}</p>}
          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-navy">Validation Actions</h2>
            <div className="mt-5 grid gap-3">
              {["Validate Challenge", "Reject", "Request More Information", "Change Category", "Override Severity", "Assign Institute"].map((label, index) => (
                <button key={label} disabled={!!actionBusy || (label === "Assign Institute" && !topInstituteId)} onClick={() => runAction(label)} className={`min-h-11 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60 ${index === 0 ? "bg-green text-white" : index === 1 ? "bg-red-50 text-red-600" : "border border-slate-200 bg-white text-slate-700"}`}>{actionBusy === label ? "Saving..." : label}</button>
              ))}
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-zinc-50 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-navy">Assignment Intelligence</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{topInstituteId ? "Top live institute recommendation is ready for assignment." : "Run AI analysis to populate live institute recommendations."}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Info({ k, v }) {
  return <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6"><span className="font-semibold text-slate-500">{k}: </span>{v}</p>;
}

function Grid({ title, children, empty }) {
  const items = Array.isArray(children) ? children.filter(Boolean) : children;
  const hasItems = Array.isArray(items) ? items.length > 0 : Boolean(items);
  return <section><h2 className="mb-6 text-xl font-semibold text-navy md:text-2xl">{title}</h2>{hasItems ? <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{items}</div> : <div className="rounded-2xl border bg-white p-6 text-sm font-semibold text-slate-500 shadow-sm">{empty}</div>}</section>;
}

function formatStatus(status = "") {
  return status.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
