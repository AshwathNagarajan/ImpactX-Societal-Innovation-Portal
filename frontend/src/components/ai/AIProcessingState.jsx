const steps = ["Analyzing challenge", "Classifying category", "Evaluating severity", "Searching similar challenges", "Matching expertise"];

export default function AIProcessingState({ title = "AI analysis in progress" }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6 shadow-sm">
      <div className="h-2 w-24 animate-pulse rounded-full bg-gradient-to-r from-blue via-cyan to-teal" />
      <h3 className="mt-5 text-lg font-semibold text-navy">{title}</h3>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {steps.map((step) => (
          <div key={step} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 text-sm text-slate-600">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue" />
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}

