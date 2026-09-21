import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSheetProgress } from "./hooks/useSheetProgress";
import { Navbar } from "./components/Navbar";
import { DashboardStats } from "./components/DashboardStats";
import { FilterBar } from "./components/FilterBar";
import { ChapterCard } from "./components/ChapterCard";
import { FlatTableView } from "./components/FlatTableView";
import { SolutionModal } from "./components/SolutionModal";
import { NotesModal } from "./components/NotesModal";
import { PdfNotesModal } from "./components/PdfNotesModal";
import { BackupModal } from "./components/BackupModal";
import { CommandPalette } from "./components/CommandPalette";
import { Toast } from "./components/Toast";
import { RotateCcw, Loader2, Code2 } from "lucide-react";

export function App() {
  const [sheetData, setSheetData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState(new Set());
  const [toast, setToast] = useState(null);

  const {
    theme,
    toggleTheme,
    completed,
    bookmarked,
    notes,
    customDiffs,
    history,
    streak,
    toggleComplete,
    toggleBookmark,
    setNote,
    setCustomDifficulty,
    batchMarkTopic,
    exportData,
    importData,
    resetAll,
  } = useSheetProgress();

  // Toast Helper
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3000);
  }, []);

  // Load problem metadata from public JSON
  useEffect(() => {
    fetch("/data/dsa_sheet_metadata.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load metadata");
        return res.json();
      })
      .then((data) => {
        setSheetData(data);
        setExpandedChapters(new Set(data.chapters.map((c) => c.id)));
        setLoadingData(false);
      })
      .catch((err) => {
        console.error("Error loading problem data:", err);
        setLoadingData(false);
      });
  }, []);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "completed" | "pending" | "revision"
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [chapterFilter, setChapterFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("");
  const [videoOnly, setVideoOnly] = useState(false);
  const [viewMode, setViewMode] = useState("tree"); // "tree" | "table"

  // Modal States
  const [activeSolutionProblem, setActiveSolutionProblem] = useState(null);
  const [activeNotesProblem, setActiveNotesProblem] = useState(null);
  const [isPdfNotesOpen, setIsPdfNotesOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global Keyboard Shortcuts (Ctrl+K or Cmd+K for Command Palette, / for search)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search problems"]');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleChapterExpand = useCallback((chapId) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapId)) {
        next.delete(chapId);
      } else {
        next.add(chapId);
      }
      return next;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    if (!sheetData) return;
    setExpandedChapters(new Set(sheetData.chapters.map((c) => c.id)));
  }, [sheetData]);

  const handleCollapseAll = useCallback(() => {
    setExpandedChapters(new Set());
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("all");
    setDifficultyFilter("all");
    setChapterFilter("all");
    setTopicFilter("all");
    setCompanyFilter("");
    setVideoOnly(false);
    showToast("Filters reset to default view", "info");
  }, [showToast]);

  // Wrapped State Actions with Toast feedback
  const handleToggleComplete = useCallback((id) => {
    const willBeComplete = !completed.has(id);
    toggleComplete(id);
    showToast(willBeComplete ? "Problem marked completed! 🎉" : "Problem marked incomplete", "success");
  }, [completed, toggleComplete, showToast]);

  const handleToggleBookmark = useCallback((id) => {
    const willBeBookmarked = !bookmarked.has(id);
    toggleBookmark(id);
    showToast(willBeBookmarked ? "Added to Revision list ⭐" : "Removed from Revision list", "info");
  }, [bookmarked, toggleBookmark, showToast]);

  const handleSaveNote = useCallback((id, text) => {
    setNote(id, text);
    showToast(text ? "Personal study note saved! 📝" : "Note removed", "success");
  }, [setNote, showToast]);

  const handleSetCustomDifficulty = useCallback((id, diff) => {
    setCustomDifficulty(id, diff);
    showToast(`Difficulty updated to ${diff}`, "info");
  }, [setCustomDifficulty, showToast]);

  const handleBatchMarkTopic = useCallback((probIds, shouldComplete) => {
    batchMarkTopic(probIds, shouldComplete);
    showToast(
      shouldComplete 
        ? `Marked ${probIds.length} problems completed!` 
        : `Unmarked ${probIds.length} problems!`, 
      "success"
    );
  }, [batchMarkTopic, showToast]);

  // Compute active filters count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (statusFilter !== "all") count++;
    if (difficultyFilter !== "all") count++;
    if (chapterFilter !== "all") count++;
    if (topicFilter !== "all") count++;
    if (companyFilter) count++;
    if (videoOnly) count++;
    return count;
  }, [searchQuery, statusFilter, difficultyFilter, chapterFilter, topicFilter, companyFilter, videoOnly]);

  // Filter Problem Function
  const matchesFilter = useCallback(
    (problem) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = problem.title.toLowerCase().includes(q);
        const matchFull = problem.fullTitle && problem.fullTitle.toLowerCase().includes(q);
        const matchChap = problem.chapterName.toLowerCase().includes(q);
        const matchTopic = problem.topicName.toLowerCase().includes(q);
        const matchId = problem.id.toLowerCase().includes(q);
        const matchNo = `#${problem.globalNo}`.includes(q) || String(problem.globalNo) === q;
        const matchComp = problem.companyTags && problem.companyTags.some((c) => c.toLowerCase().includes(q));

        if (!matchTitle && !matchFull && !matchChap && !matchTopic && !matchId && !matchNo && !matchComp) {
          return false;
        }
      }

      if (statusFilter === "completed" && !completed.has(problem.id)) return false;
      if (statusFilter === "pending" && completed.has(problem.id)) return false;
      if (statusFilter === "revision" && !bookmarked.has(problem.id)) return false;

      const effectiveDiff = customDiffs[problem.id] || problem.difficulty || "Unknown";
      if (difficultyFilter !== "all" && effectiveDiff !== difficultyFilter) {
        return false;
      }

      if (chapterFilter !== "all" && problem.chapterId !== chapterFilter) {
        return false;
      }

      if (topicFilter !== "all" && problem.topicId !== topicFilter) {
        return false;
      }

      if (companyFilter) {
        if (!problem.companyTags || !problem.companyTags.includes(companyFilter)) {
          return false;
        }
      }

      if (videoOnly && !problem.youtubeUrl) {
        return false;
      }

      return true;
    },
    [
      searchQuery,
      statusFilter,
      difficultyFilter,
      chapterFilter,
      topicFilter,
      companyFilter,
      videoOnly,
      completed,
      bookmarked,
      customDiffs,
    ]
  );

  // Filtered Chapters & Topics (Tree View)
  const filteredChapters = useMemo(() => {
    if (!sheetData) return [];
    return sheetData.chapters
      .map((chap) => {
        if (chapterFilter !== "all" && chap.id !== chapterFilter) {
          return null;
        }

        const filteredTopics = chap.topics
          .map((topic) => {
            if (topicFilter !== "all" && topic.id !== topicFilter) {
              return null;
            }

            const matchingProblems = topic.problems.filter(matchesFilter);
            if (matchingProblems.length === 0) return null;

            return {
              ...topic,
              problems: matchingProblems,
            };
          })
          .filter(Boolean);

        if (filteredTopics.length === 0) return null;

        return {
          ...chap,
          topics: filteredTopics,
        };
      })
      .filter(Boolean);
  }, [sheetData, chapterFilter, topicFilter, matchesFilter]);

  // Flat list of filtered problems
  const flatFilteredProblems = useMemo(() => {
    if (!sheetData) return [];
    const list = [];
    sheetData.chapters.forEach((c) => {
      c.topics.forEach((t) => {
        t.problems.forEach((p) => {
          if (matchesFilter(p)) {
            list.push(p);
          }
        });
      });
    });
    return list;
  }, [sheetData, matchesFilter]);

  // All problems flat array for Command Palette
  const allProblemsFlat = useMemo(() => {
    if (!sheetData) return [];
    const list = [];
    sheetData.chapters.forEach((c) => {
      c.topics.forEach((t) => {
        t.problems.forEach((p) => {
          list.push(p);
        });
      });
    });
    return list;
  }, [sheetData]);

  const handleSelectChapterFromDashboard = useCallback((chapId) => {
    setChapterFilter(chapId);
    setTopicFilter("all");
    setExpandedChapters((prev) => new Set([...prev, chapId]));
    setTimeout(() => {
      const el = document.getElementById(`chapter-${chapId}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, []);

  if (loadingData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-white">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 animate-bounce">
          <Code2 className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Initializing DSA Command Center (1,660+ Problems)...</span>
        </div>
      </div>
    );
  }

  if (!sheetData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <h2 className="text-xl font-bold text-rose-400">Failed to load problem dataset</h2>
        <p className="text-xs text-slate-400 mt-2">
          Make sure <code>public/data/dsa_sheet_metadata.json</code> exists by running the import script.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200 dev-grid-pattern relative">
      {/* Top Navigation */}
      <Navbar
        totalProblems={sheetData.metadata.totalProblems}
        completedCount={completed.size}
        streak={streak}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenPdfNotes={() => setIsPdfNotesOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Dashboard Metrics & Insights */}
        <DashboardStats
          chapters={sheetData.chapters}
          completedSet={completed}
          customDiffs={customDiffs}
          history={history}
          streak={streak}
          onSelectChapter={handleSelectChapterFromDashboard}
          onViewSolution={(prob) => setActiveSolutionProblem(prob)}
        />

        {/* Filter and Search Bar */}
        <div className="space-y-4">
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            difficultyFilter={difficultyFilter}
            onDifficultyFilterChange={setDifficultyFilter}
            chapterFilter={chapterFilter}
            onChapterFilterChange={setChapterFilter}
            topicFilter={topicFilter}
            onTopicFilterChange={setTopicFilter}
            companyFilter={companyFilter}
            onCompanyFilterChange={setCompanyFilter}
            videoOnly={videoOnly}
            onVideoOnlyChange={setVideoOnly}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onExpandAll={handleExpandAll}
            onCollapseAll={handleCollapseAll}
            onResetFilters={handleResetFilters}
            chapters={sheetData.chapters}
            popularCompanies={sheetData.metadata.allCompanies}
            activeFilterCount={activeFilterCount}
          />

          {/* Result Count and Active Filters Bar */}
          <div className="flex items-center justify-between px-1 text-xs text-slate-400">
            <div>
              Showing <span className="text-white font-bold font-mono">{flatFilteredProblems.length}</span> matching problems
              {activeFilterCount > 0 && <span> (filtered from {sheetData.metadata.totalProblems})</span>}
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Content View: Tree View or Table View */}
        {flatFilteredProblems.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">No problems found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No problems matched your active search or filter criteria. Try adjusting your query or resetting filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md cursor-pointer transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === "tree" ? (
          <div className="space-y-4">
            {filteredChapters.map((chapter) => (
              <ChapterCard
                key={chapter.id}
                chapter={chapter}
                isExpanded={expandedChapters.has(chapter.id)}
                onToggleExpand={() => toggleChapterExpand(chapter.id)}
                completedSet={completed}
                bookmarkedSet={bookmarked}
                notes={notes}
                customDiffs={customDiffs}
                onToggleComplete={handleToggleComplete}
                onToggleBookmark={handleToggleBookmark}
                onOpenNotes={(prob) => setActiveNotesProblem(prob)}
                onViewSolution={(prob) => setActiveSolutionProblem(prob)}
                onSetCustomDiff={handleSetCustomDifficulty}
                onBatchMarkTopic={handleBatchMarkTopic}
              />
            ))}
          </div>
        ) : (
          <FlatTableView
            problems={flatFilteredProblems}
            completedSet={completed}
            bookmarkedSet={bookmarked}
            notes={notes}
            customDiffs={customDiffs}
            onToggleComplete={handleToggleComplete}
            onToggleBookmark={handleToggleBookmark}
            onOpenNotes={(prob) => setActiveNotesProblem(prob)}
            onViewSolution={(prob) => setActiveSolutionProblem(prob)}
            onSetCustomDiff={handleSetCustomDifficulty}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-800/80 bg-slate-950 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-300">
              DSA Command Center — Developer Edition
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Reading local problems from <code className="text-slate-500">A:/Sheet</code> • 100% Local-First
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hover:text-slate-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Command Menu</span>
              <kbd className="px-1 py-0.2 rounded bg-slate-900 border border-slate-800 text-[10px]">⌘K</kbd>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsPdfNotesOpen(true)}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              iPad PDF Notes ({sheetData.metadata.totalPdfNotes})
            </button>
            <span>•</span>
            <button
              onClick={() => setIsBackupOpen(true)}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Backup & Restore
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        problems={allProblemsFlat}
        onViewSolution={(prob) => setActiveSolutionProblem(prob)}
        onSetStatusFilter={setStatusFilter}
        onSetDifficultyFilter={setDifficultyFilter}
        onResetFilters={handleResetFilters}
        onSetViewMode={setViewMode}
        onToggleTheme={toggleTheme}
        theme={theme}
        onOpenPdfNotes={() => setIsPdfNotesOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
      />

      <SolutionModal
        problem={activeSolutionProblem}
        isOpen={Boolean(activeSolutionProblem)}
        onClose={() => setActiveSolutionProblem(null)}
      />

      <NotesModal
        problem={activeNotesProblem}
        noteText={activeNotesProblem ? notes[activeNotesProblem.id] : ""}
        isOpen={Boolean(activeNotesProblem)}
        onClose={() => setActiveNotesProblem(null)}
        onSaveNote={handleSaveNote}
      />

      <PdfNotesModal
        pdfNotes={sheetData.pdfNotes}
        isOpen={isPdfNotesOpen}
        onClose={() => setIsPdfNotesOpen(false)}
      />

      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onExportData={exportData}
        onImportData={importData}
        onResetAll={resetAll}
        stats={{
          completedCount: completed.size,
          bookmarkedCount: bookmarked.size,
          notesCount: Object.keys(notes).length,
        }}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

export default App;
