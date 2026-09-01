export default function ProgressBar({ value = 0 }) {
  return <div className="h-2 w-full rounded-full bg-slate-100"><div className="impact-gradient h-2 rounded-full" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>;
}
