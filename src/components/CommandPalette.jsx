import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Search, 
  Code2, 
  BookOpen, 
  Database, 
  Sun, 
  Moon, 
  FolderTree, 
  LayoutList, 
  Star, 
  CheckCircle2, 
  Circle, 
  RotateCcw,
  ArrowRight
} from "lucide-react";
import { getDifficultyColor, formatDifficulty } from "../utils/helpers";

export function CommandPalette({
  isOpen,
  onClose,
  problems = [],
  onViewSolution,
  onSetStatusFilter,
  onSetDifficultyFilter,
  onResetFilters,
  onSetViewMode,
  onToggleTheme,
  theme,
  onOpenPdfNotes,
  onOpenBackup
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Static action commands
  const actionCommands = useMemo(() => [
    {
      id: "filter-pending",
      title: "Show Pending Problems (Not Started)",
      category: "Quick Filters",
      icon: <Circle className="w-4 h-4 text-amber-400" />,
      action: () => { onSetStatusFilter("pending"); onClose(); }
    },
    {
      id: "filter-completed",
      title: "Show Completed Problems",
      category: "Quick Filters",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      action: () => { onSetStatusFilter("completed"); onClose(); }
    },
    {
      id: "filter-revision",
      title: "Show Revision List (Starred ⭐)",
      category: "Quick Filters",
      icon: <Star className="w-4 h-4 text-amber-400 fill-amber-400" />,
      action: () => { onSetStatusFilter("revision"); onClose(); }
    },
    {
      id: "filter-easy",
      title: "Filter by Easy Difficulty",
      category: "Quick Filters",
      icon: <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />,
      action: () => { onSetDifficultyFilter("Easy"); onClose(); }
    },
    {
      id: "filter-medium",
      title: "Filter by Medium Difficulty",
      category: "Quick Filters",
      icon: <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />,
      action: () => { onSetDifficultyFilter("Medium"); onClose(); }
    },
    {
      id: "filter-hard",
      title: "Filter by Hard Difficulty",
      category: "Quick Filters",
      icon: <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />,
      action: () => { onSetDifficultyFilter("Hard"); onClose(); }
    },
    {
      id: "clear-filters",
      title: "Reset / Clear All Filters",
      category: "Quick Filters",
      icon: <RotateCcw className="w-4 h-4 text-rose-400" />,
      action: () => { onResetFilters(); onClose(); }
    },
    {
      id: "view-tree",
      title: "Switch to Tree View (Chapter & Topic Hierarchy)",
      category: "Navigation & Views",
      icon: <FolderTree className="w-4 h-4 text-indigo-400" />,
      action: () => { onSetViewMode("tree"); onClose(); }
    },
    {
      id: "view-table",
      title: "Switch to Table View (Flat Sortable Table)",
      category: "Navigation & Views",
      icon: <LayoutList className="w-4 h-4 text-indigo-400" />,
      action: () => { onSetViewMode("table"); onClose(); }
    },
    {
      id: "open-pdf-notes",
      title: "Browse Handwritten iPad PDF Notes (256 notes)",
      category: "Tools",
      icon: <BookOpen className="w-4 h-4 text-purple-400" />,
      action: () => { onOpenPdfNotes(); onClose(); }
    },
    {
      id: "open-backup",
      title: "Open Backup & Restore Progress (JSON Export/Import)",
      category: "Tools",
      icon: <Database className="w-4 h-4 text-cyan-400" />,
      action: () => { onOpenBackup(); onClose(); }
    },
    {
      id: "toggle-theme",
      title: `Switch to ${theme === "dark" ? "Light" : "Dark"} Theme`,
      category: "Preferences",
      icon: theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />,
      action: () => { onToggleTheme(); onClose(); }
    }
  ], [onSetStatusFilter, onSetDifficultyFilter, onResetFilters, onSetViewMode, onOpenPdfNotes, onOpenBackup, onToggleTheme, theme, onClose]);

  // Problem search matches
  const matchingProblems = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return problems
      .filter((p) => 
        p.title.toLowerCase().includes(q) || 
        (p.fullTitle && p.fullTitle.toLowerCase().includes(q)) ||
        p.chapterName.toLowerCase().includes(q) ||
        p.topicName.toLowerCase().includes(q) ||
        (p.companyTags && p.companyTags.some((c) => c.toLowerCase().includes(q)))
      )
      .slice(0, 8);
  }, [query, problems]);

  // Combined matching items
  const combinedItems = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return actionCommands;

    const filteredActions = actionCommands.filter((a) => 
      a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
    );

    const problemItems = matchingProblems.map((p) => ({
      id: `prob-${p.id}`,
      title: p.title,
      category: `Problem • ${p.chapterName}`,
      subtitle: `${p.topicName} • #${p.globalNo}`,
      difficulty: p.difficulty,
      icon: <Code2 className="w-4 h-4 text-indigo-400" />,
      action: () => { onViewSolution(p); onClose(); }
    }));

    return [...problemItems, ...filteredActions];
  }, [query, actionCommands, matchingProblems, onViewSolution, onClose]);

  // Reset selected index when items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [combinedItems]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % combinedItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + combinedItems.length) % combinedItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (combinedItems[selectedIndex]) {
        combinedItems[selectedIndex].action();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  // Auto-scroll list when selected index changes
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a problem name, company, topic, or command..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-medium rounded bg-slate-800 text-slate-400 border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Command / Problem List */}
        <div 
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-transparent"
        >
          {combinedItems.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">
              No matching problems or commands found for "{query}"
            </div>
          ) : (
            combinedItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors cursor-pointer select-none ${
                    isSelected 
                      ? "bg-indigo-600 text-white shadow-sm" 
                      : "text-slate-300 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="shrink-0">{item.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium truncate ${isSelected ? "text-white font-semibold" : "text-slate-200"}`}>
                          {item.title}
                        </span>
                        {item.difficulty && (
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${
                            isSelected ? "border-white/30 bg-white/20 text-white" : getDifficultyColor(item.difficulty)
                          }`}>
                            {formatDifficulty(item.difficulty)}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className={`text-[10px] truncate ${isSelected ? "text-indigo-200" : "text-slate-500"}`}>
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      isSelected ? "bg-indigo-700 text-indigo-100" : "bg-slate-800 text-slate-400"
                    }`}>
                      {item.category}
                    </span>
                    <ArrowRight className={`w-3 h-3 ${isSelected ? "opacity-100" : "opacity-0"}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>Use <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">↓</kbd> to navigate</span>
            <span><kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">↵</kbd> to select</span>
          </div>
          <span>DSA Command Palette</span>
        </div>
      </div>
    </div>
  );
}
