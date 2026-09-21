import React, { useState, useRef, useEffect } from "react";
import { 
  X, 
  Download, 
  Upload, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Database 
} from "lucide-react";

export function BackupModal({
  isOpen,
  onClose,
  onExportData,
  onImportData,
  onResetAll,
  stats
}) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result);
        if (!json || typeof json !== "object") {
          throw new Error("Invalid JSON structure");
        }
        const res = onImportData(json);
        if (res.success) {
          setImportStatus({ type: "success", message: "Progress imported and synchronized successfully!" });
          setTimeout(() => setImportStatus(null), 3500);
        } else {
          setImportStatus({ type: "error", message: res.error || "Failed to parse backup file." });
        }
      } catch {
        setImportStatus({ type: "error", message: "Invalid JSON backup file format." });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Backup & Progress Data
              </h2>
              <p className="text-xs text-slate-400">
                Safeguard, export, or restore your study progress
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Status Alert */}
          {importStatus && (
            <div className={`p-3 rounded-xl border flex items-center gap-2 ${
              importStatus.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{importStatus.message}</span>
            </div>
          )}

          {/* Current Local Stats */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
              Active Storage Metrics:
            </span>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                <div className="text-base font-bold font-mono text-emerald-400">{stats.completedCount}</div>
                <div className="text-[10px] text-slate-400">Completed</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                <div className="text-base font-bold font-mono text-amber-400">{stats.bookmarkedCount}</div>
                <div className="text-[10px] text-slate-400">Revision</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                <div className="text-base font-bold font-mono text-indigo-400">{stats.notesCount}</div>
                <div className="text-[10px] text-slate-400">Notes</div>
              </div>
            </div>
          </div>

          {/* Export Button */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-2">
            <div className="font-semibold text-slate-200">Export Progress</div>
            <p className="text-slate-400 leading-relaxed">
              Download a single JSON file containing all marked problems, bookmarks, custom difficulties, notes, and streak history.
            </p>
            <button
              onClick={onExportData}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all cursor-pointer shadow-sm shadow-indigo-600/25"
            >
              <Download className="w-4 h-4" />
              <span>Export Backup JSON</span>
            </button>
          </div>

          {/* Import Button */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-2">
            <div className="font-semibold text-slate-200">Restore Progress</div>
            <p className="text-slate-400 leading-relaxed">
              Restore your progress from a previously exported backup JSON file.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Import Backup JSON</span>
            </button>
          </div>

          {/* Reset All */}
          <div className="p-4 rounded-xl border border-rose-900/40 bg-rose-950/10 space-y-2">
            <div className="font-semibold text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Danger Zone</span>
            </div>
            <p className="text-slate-400">
              Clear all saved completion states, notes, bookmarks, and streak history.
            </p>
            {confirmReset ? (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    onResetAll();
                    setConfirmReset(false);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all cursor-pointer"
                >
                  Yes, Reset Everything
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset All Data</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
