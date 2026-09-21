import React, { useState, useEffect } from "react";
import { 
  X, 
  Save, 
  Trash2, 
  FileText, 
  Lightbulb 
} from "lucide-react";

export function NotesModal({ problem, noteText = "", isOpen, onClose, onSaveNote }) {
  const [currentText, setCurrentText] = useState("");

  useEffect(() => {
    if (isOpen) {
      setCurrentText(noteText || "");
    }
  }, [isOpen, noteText]);

  // Keyboard shortcut: Ctrl+S / Cmd+S to save, Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        onSaveNote(problem.id, currentText);
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, problem, currentText, onSaveNote, onClose]);

  if (!isOpen || !problem) return null;

  const handleSave = () => {
    onSaveNote(problem.id, currentText);
    onClose();
  };

  const handleDelete = () => {
    onSaveNote(problem.id, "");
    onClose();
  };

  const handleInsertTemplate = (type) => {
    const templates = {
      approach: `\n### 💡 Solution Approach:\n1. Core Idea / Intuition:\n2. Step-by-Step Invariants:\n3. Optimal Data Structure:\n`,
      complexity: `\n- **Time Complexity:** O(N)\n- **Space Complexity:** O(1)\n- **Reasoning:** `,
      pitfalls: `\n⚠️ **Edge Cases & Pitfalls:**\n- [ ] Size 0 or 1 array / Null pointer\n- [ ] Negative numbers / Integer overflow\n- [ ] Duplicate keys / Circular dependencies\n`,
      checklist: `\n📋 **Revision Checklist:**\n- [ ] Re-implement without looking at solution\n- [ ] Trace manually on sample test case\n- [ ] Review alternative patterns\n`
    };
    setCurrentText((prev) => prev + (templates[type] || ""));
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold">
              <FileText className="w-4 h-4" />
              <span>Personal Study Notebook</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {problem.title}
            </h2>
            <p className="text-xs text-slate-400">
              {problem.chapterName} › {problem.topicName} • #{problem.globalNo}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Template Chips */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 text-xs flex-wrap">
          <span className="text-slate-400 flex items-center gap-1 font-medium text-[11px]">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            Insert:
          </span>
          <button
            onClick={() => handleInsertTemplate("approach")}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] cursor-pointer transition-colors"
          >
            + Approach
          </button>
          <button
            onClick={() => handleInsertTemplate("complexity")}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] cursor-pointer transition-colors"
          >
            + Time & Space
          </button>
          <button
            onClick={() => handleInsertTemplate("pitfalls")}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] cursor-pointer transition-colors"
          >
            + Edge Cases
          </button>
          <button
            onClick={() => handleInsertTemplate("checklist")}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] cursor-pointer transition-colors"
          >
            + Revision Checklist
          </button>
        </div>

        {/* Textarea */}
        <div className="p-5 flex-1 bg-slate-950/30">
          <textarea
            value={currentText}
            onChange={(e) => {
              setCurrentText(e.target.value);
              setIsSaved(false);
            }}
            placeholder="Write down your solution intuition, key formulas, or tricky edge cases..."
            rows={10}
            className="w-full h-64 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 resize-none leading-relaxed"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-900 text-xs">
          <div className="flex items-center gap-3">
            {noteText ? (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            ) : <div />}

            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">Ctrl+S</kbd> to save
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Note</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
