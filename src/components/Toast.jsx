import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export function Toast({ toast, onDismiss }) {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-indigo-400 shrink-0" />
  };

  const borderColors = {
    success: "border-emerald-500/30 bg-slate-900/95 text-slate-100",
    error: "border-rose-500/30 bg-slate-900/95 text-slate-100",
    info: "border-indigo-500/30 bg-slate-900/95 text-slate-100"
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto max-w-sm">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md ${borderColors[toast.type || "info"]}`}>
        {icons[toast.type || "info"]}
        <p className="text-xs font-medium pr-2">{toast.message}</p>
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white transition-colors cursor-pointer p-0.5 rounded"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
