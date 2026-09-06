import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((items) => items.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = "success") => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((items) => [...items, { id, message, type }].slice(-4));
    window.setTimeout(() => remove(id), 4200);
  }, [remove]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-24 z-[90] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div key={toast.id} className={`flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-lg ${toast.type === "error" ? "border-red-100" : "border-slate-200"}`}>
            <span className={`mt-0.5 ${toast.type === "error" ? "text-red-600" : toast.type === "info" ? "text-blue" : "text-green"}`}>
              {toast.type === "error" ? <XCircle size={20} /> : toast.type === "info" ? <Info size={20} /> : <CheckCircle2 size={20} />}
            </span>
            <p className="min-w-0 flex-1 text-sm font-semibold leading-6 text-navy">{toast.message}</p>
            <button onClick={() => remove(toast.id)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Dismiss notification">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  return context || { showToast: () => {} };
}
