import React, { useState } from "react";
import { 
  ChevronDown, 
  ChevronRight, 
  CheckCheck,
  FolderOpen,
  AlertTriangle
} from "lucide-react";
import { ProblemRow } from "./ProblemRow";
import { ProgressBar } from "./ProgressBar";
import { calculateProgress } from "../utils/helpers";

export function TopicSection({
  topic,
  _chapterId,
  completedSet = new Set(),
  bookmarkedSet = new Set(),
  notes = {},
  customDiffs = {},
  onToggleComplete,
  onToggleBookmark,
  onOpenNotes,
  onViewSolution,
  onSetCustomDiff,
  onBatchMarkTopic
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);

  const totalProblems = topic.problems.length;
  const completedCount = topic.problems.filter((p) => completedSet.has(p.id)).length;
  const percent = calculateProgress(completedCount, totalProblems);
  const isAllCompleted = completedCount === totalProblems && totalProblems > 0;

  const handleBatchClick = (e) => {
    e.stopPropagation();
    // If more than 5 problems, confirm with user so accidental clicks don't mass-change state
    if (totalProblems > 5) {
      setShowBatchConfirm(true);
    } else {
      executeBatchToggle();
    }
  };

  const executeBatchToggle = () => {
    const probIds = topic.problems.map((p) => p.id);
    onBatchMarkTopic(probIds, !isAllCompleted);
    setShowBatchConfirm(false);
  };

  return (
    <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/40 transition-colors">
      {/* Topic Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-3 bg-slate-900/70 hover:bg-slate-900 border-b border-slate-800/60 cursor-pointer select-none transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <button className="text-slate-400 hover:text-white transition-transform">
            {isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          
          <FolderOpen className="w-4 h-4 text-indigo-400 shrink-0" />

          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-xs sm:text-sm text-slate-200">
              {topic.name}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({completedCount}/{totalProblems})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress bar in header */}
          <div className="hidden sm:flex items-center gap-2 w-28">
            <ProgressBar
              value={completedCount}
              max={totalProblems}
              size="xs"
              color={percent === 100 ? "emerald" : "indigo"}
            />
            <span className="text-[11px] font-bold font-mono text-slate-400 w-8 text-right">
              {percent}%
            </span>
          </div>

          {/* Batch Mark All Button */}
          <div className="relative">
            <button
              onClick={handleBatchClick}
              title={isAllCompleted ? "Unmark all in this topic" : "Mark all completed in this topic"}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                isAllCompleted
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isAllCompleted ? "Completed" : "Mark All"}
              </span>
            </button>

            {/* Confirmation Popover */}
            {showBatchConfirm && (
              <div 
                className="absolute right-0 top-full mt-1 w-64 p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-30 space-y-2 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Confirm Batch Action</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {isAllCompleted
                    ? `Unmark all ${totalProblems} problems in "${topic.name}"?`
                    : `Mark all ${totalProblems} problems in "${topic.name}" as completed?`}
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setShowBatchConfirm(false)}
                    className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer text-[11px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeBatchToggle}
                    className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer text-[11px]"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Problem Table */}
      {isOpen && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-3.5 text-center w-12">Status</th>
                <th className="py-2.5 px-2 text-center w-10">Rev</th>
                <th className="py-2.5 px-2 text-center w-14">#</th>
                <th className="py-2.5 px-3">Problem Title</th>
                <th className="py-2.5 px-3 w-28">Difficulty</th>
                <th className="py-2.5 px-3 hidden md:table-cell">Company Tags</th>
                <th className="py-2.5 px-3 w-24 text-center">Resources</th>
                <th className="py-2.5 px-3.5 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {topic.problems.map((problem) => (
                <ProblemRow
                  key={problem.id}
                  problem={problem}
                  isCompleted={completedSet.has(problem.id)}
                  isBookmarked={bookmarkedSet.has(problem.id)}
                  hasNote={Boolean(notes[problem.id])}
                  customDiff={customDiffs[problem.id]}
                  onToggleComplete={onToggleComplete}
                  onToggleBookmark={onToggleBookmark}
                  onOpenNotes={onOpenNotes}
                  onViewSolution={onViewSolution}
                  onSetCustomDiff={onSetCustomDiff}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
