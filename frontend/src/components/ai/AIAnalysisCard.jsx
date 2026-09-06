import { Bot } from "lucide-react";
import AIConfidenceBadge from "./AIConfidenceBadge.jsx";
import PriorityScore from "./PriorityScore.jsx";
import SeverityIndicator from "./SeverityIndicator.jsx";

export default function AIAnalysisCard({ analysis, compact = false }) {
  if (!analysis || Object.keys(analysis).length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-800/90 p-6 shadow-xl shadow-blue-950/20">
        <p className="text-sm font-semibold text-sky-300">AI Challenge Intelligence</p>
        <p className="mt-3 text-sm leading-7 text-slate-300">AI analysis has not been generated yet. Admin users can run analysis from the review workflow.</p>
      </div>
    );
  }
  const expertise = analysis.required_expertise || analysis.recommended_domains || [];
  const technologies = analysis.recommended_technologies || [];
  return (
    <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-900/95 p-5 shadow-xl shadow-blue-950/20 md:p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-sky-200">
            <Bot size={14} />
            AI Challenge Intelligence
          </div>
          <h2 className="mt-4 text-xl font-semibold text-white md:text-2xl">{analysis.primary_category || analysis.category || "Civic Innovation"}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">{analysis.summary || analysis.problem_statement || "Structured AI decision support for this societal challenge."}</p>
        </div>
        <AIConfidenceBadge value={analysis.confidence_score || analysis.category_confidence || 0.82} />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <SeverityIndicator severity={analysis.severity || { level: analysis.severity_level, score: analysis.severity_score }} />
        <PriorityScore priority={analysis.priority || analysis} />
      </div>
      {!compact && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <InfoList title="Required Expertise" items={expertise} />
          <InfoList title="Recommended Technologies" items={technologies} />
          <InfoList title="Root Causes" items={analysis.root_causes || []} />
          <InfoList title="Risks" items={analysis.risks || analysis.risk_factors || []} />
        </div>
      )}
    </section>
  );
}

function InfoList({ title, items }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/45 p-5">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {(items.length ? items : ["Awaiting analysis"]).slice(0, 6).map((item) => (
          <span key={item} className="max-w-full rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100">{item}</span>
        ))}
      </div>
    </div>
  );
}
