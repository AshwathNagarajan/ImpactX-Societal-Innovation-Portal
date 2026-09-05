import { X } from "lucide-react";
export default function Modal({ open, title, children, onClose, size = "md" }) {
  if (!open) return null;
  const width = size === "xl" ? "max-w-6xl" : "max-w-lg";
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4 backdrop-blur-sm">
    <div className={`max-h-[90vh] w-[calc(100vw-2rem)] ${width} scale-100 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl md:p-7`}>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-navy">{title}</h2>
        <button aria-label="Close" onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-navy"><X size={18} /></button>
      </div>
      {children}
    </div>
  </div>;
}
