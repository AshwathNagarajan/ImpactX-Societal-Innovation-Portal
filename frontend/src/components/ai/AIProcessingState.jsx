const steps = ["Analyzing challenge", "Classifying category", "Evaluating severity", "Searching similar challenges", "Matching expertise"];

export default function AIProcessingState({ title = "AI analysis in progress" }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-900/95 p-6 shadow-xl shadow-blue-950/20">
      <div className="impact-gradient h-2 w-24 animate-pulse rounded-full" />
      <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {steps.map((step) => (
          <div key={step} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 p-3 text-sm text-slate-200">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue" />
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}
