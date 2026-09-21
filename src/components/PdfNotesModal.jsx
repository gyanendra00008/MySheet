import React, { useState, useMemo, useEffect } from "react";
import { 
  X, 
  Search, 
  BookOpen, 
  FileText, 
  Copy, 
  Check 
} from "lucide-react";
import { copyToClipboard } from "../utils/helpers";

export function PdfNotesModal({ pdfNotes = [], isOpen, onClose }) {
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filteredNotes = useMemo(() => {
    if (!search.trim()) return pdfNotes;
    const q = search.toLowerCase();
    return pdfNotes.filter(
      (n) => n.title.toLowerCase().includes(q) || n.filename.toLowerCase().includes(q)
    );
  }, [pdfNotes, search]);

  if (!isOpen) return null;

  const handleCopyPath = (note) => {
    const fullPath = `A:/Sheet/${note.relativePath}`;
    copyToClipboard(fullPath).then(() => {
      setCopiedId(note.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Handwritten iPad PDF Notes
              </h2>
              <p className="text-xs text-slate-400">
                {pdfNotes.length} curated handwritten concept & formula sheets from your collection
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

        {/* Search Bar */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search 256 handwritten notes (e.g. Graph, Dijkstra, DP, Tree)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              autoFocus
            />
          </div>
        </div>

        {/* Note List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-slate-800/40">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No notes found matching "{search}"
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/50 transition-colors gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">
                      {note.title}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">
                      A:/Sheet/{note.relativePath}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleCopyPath(note)}
                    title="Copy local file path"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                  >
                    {copiedId === note.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copied Path</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Path</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
