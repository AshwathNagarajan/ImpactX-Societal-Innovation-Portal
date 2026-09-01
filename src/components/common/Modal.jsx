import { X } from "lucide-react";
export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm">
    <div className="premium-surface w-full max-w-lg scale-100 rounded-2xl border p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-navy">{title}</h2>
        <button aria-label="Close" onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-navy"><X size={18} /></button>
      </div>
      {children}
    </div>
  </div>;
}
