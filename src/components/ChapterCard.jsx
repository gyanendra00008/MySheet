import React from "react";
import { 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2 
} from "lucide-react";
import { TopicSection } from "./TopicSection";
import { ProgressBar } from "./ProgressBar";
import { calculateProgress } from "../utils/helpers";

export function ChapterCard({
  chapter,
  isExpanded = true,
  onToggleExpand,
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
  // Calculate chapter stats
  let totalProblems = 0;
  let completedCount = 0;

  chapter.topics.forEach((t) => {
    t.problems.forEach((p) => {
      totalProblems++;
      if (completedSet.has(p.id)) {
        completedCount++;
      }
    });
  });

  const percent = calculateProgress(completedCount, totalProblems);
  const isFinished = completedCount === totalProblems && totalProblems > 0;

  return (
    <div 
      id={`chapter-${chapter.id}`}
      className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden transition-all shadow-sm"
    >
      {/* Chapter Accordion Header */}
      <div
        onClick={onToggleExpand}
        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-slate-900 hover:bg-slate-850 cursor-pointer select-none border-b border-slate-800/80 transition-colors gap-3"
      >
        {/* Left: Chapter Number, Name, Topic Count */}
        <div className="flex items-center gap-3.5">
          <div className="p-1 rounded-lg text-slate-400 hover:text-white transition-transform">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-indigo-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-slate-400" />
            )}
          </div>

          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-xs text-indigo-400">
            {chapter.order}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {chapter.name}
              </h2>
              {isFinished && (
                <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  Completed
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>{chapter.topics.length} {chapter.topics.length === 1 ? "topic" : "topics"}</span>
              <span>•</span>
              <span>{totalProblems} problems</span>
            </div>
          </div>
        </div>

        {/* Right: Chapter Progress Bar */}
        <div className="flex items-center gap-4 sm:min-w-[200px] justify-between sm:justify-end pl-11 sm:pl-0">
          <div className="flex-1 sm:w-36">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-400 font-medium">
                {completedCount} / {totalProblems}
              </span>
              <span className="font-bold text-slate-200">
                {percent}%
              </span>
            </div>
            <ProgressBar
              value={completedCount}
              max={totalProblems}
              size="sm"
              color={percent === 100 ? "emerald" : "indigo"}
            />
          </div>
        </div>
      </div>

      {/* Chapter Topics Body */}
      {isExpanded && (
        <div className="p-4 space-y-3.5 bg-slate-950/20">
          {chapter.topics.map((topic) => (
            <TopicSection
              key={topic.id}
              topic={topic}
              chapterId={chapter.id}
              completedSet={completedSet}
              bookmarkedSet={bookmarkedSet}
              notes={notes}
              customDiffs={customDiffs}
              onToggleComplete={onToggleComplete}
              onToggleBookmark={onToggleBookmark}
              onOpenNotes={onOpenNotes}
              onViewSolution={onViewSolution}
              onSetCustomDiff={onSetCustomDiff}
              onBatchMarkTopic={onBatchMarkTopic}
            />
          ))}
        </div>
      )}
    </div>
  );
}
