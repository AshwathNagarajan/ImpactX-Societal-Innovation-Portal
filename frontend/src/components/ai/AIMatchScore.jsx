export default function AIMatchScore({ value = 0, label = "AI Match", size = "md" }) {
  const percent = Math.max(0, Math.min(100, Math.round(value || 0)));
  const dimensions = size === "sm" ? "h-20 w-20" : "h-28 w-28";
  const inner = size === "sm" ? "h-14 w-14 text-lg" : "h-20 w-20 text-2xl";
  return (
    <div className={`grid ${dimensions} place-items-center rounded-full border border-blue-100 bg-white shadow-sm`} style={{ background: `conic-gradient(#2563EB 0 ${percent}%, #E2E8F0 ${percent}% 100%)` }}>
      <div className={`grid ${inner} place-items-center rounded-full bg-white text-center`}>
        <strong className="block text-navy">{percent}%</strong>
        <span className="text-[10px] font-medium text-slate-500">{label}</span>
      </div>
    </div>
  );
}

