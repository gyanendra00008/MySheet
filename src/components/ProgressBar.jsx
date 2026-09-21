import React from "react";

export function ProgressBar({ 
  value = 0, 
  max = 100, 
  size = "md", 
  color = "indigo", 
  showText = false,
  className = "" 
}) {
  const percentage = max > 0 ? Math.min(100, Math.max(0, Math.round((value / max) * 1000) / 10)) : 0;

  const heightClasses = {
    xs: "h-1",
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-3.5",
    xl: "h-5"
  };

  const colorClasses = {
    indigo: "bg-indigo-500 shadow-indigo-500/20",
    emerald: "bg-emerald-500 shadow-emerald-500/20",
    amber: "bg-amber-500 shadow-amber-500/20",
    rose: "bg-rose-500 shadow-rose-500/20",
    cyan: "bg-cyan-500 shadow-cyan-500/20",
    gradient: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-purple-500/25"
  };

  return (
    <div className={`w-full ${className}`}>
      {showText && (
        <div className="flex justify-between items-center text-xs font-medium mb-1.5 text-slate-400">
          <span>{value} / {max}</span>
          <span className="font-semibold text-slate-200">{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50 ${heightClasses[size] || heightClasses.md}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out shadow-sm ${colorClasses[color] || colorClasses.indigo}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
