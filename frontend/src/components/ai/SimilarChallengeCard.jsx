export default function SimilarChallengeCard({ challenge }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold text-blue">{challenge.challenge_id}</p>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{Math.round((challenge.similarity || 0) * 100)}% similar</span>
      </div>
      <h4 className="mt-3 text-sm font-semibold leading-6 text-navy">{challenge.title}</h4>
      <p className="mt-2 text-xs text-slate-500">{challenge.relationship || "RELATED"}</p>
    </div>
  );
}

