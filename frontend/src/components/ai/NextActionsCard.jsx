export default function NextActionsCard({ actions = [] }) {
  const list = actions.length ? actions : ["Review next milestone owners", "Confirm field testing access", "Update evidence and deliverables"];
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-navy">Recommended Next Actions</h3>
      <div className="mt-5 space-y-3">
        {list.map((action, index) => (
          <div key={action} className="flex gap-3 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-semibold text-blue">{index + 1}</span>
            {action}
          </div>
        ))}
      </div>
    </section>
  );
}

