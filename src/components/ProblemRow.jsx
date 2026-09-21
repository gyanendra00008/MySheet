import React, { useState } from "react";
import { 
  Check, 
  Star, 
  ExternalLink, 
  Code2, 
  FileText, 
  Clock, 
  Cpu, 
  ChevronDown 
} from "lucide-react";
import { YoutubeIcon } from "./YoutubeIcon";
import { getDifficultyColor, formatDifficulty } from "../utils/helpers";

export function ProblemRow({
  problem,
  isCompleted = false,
  isBookmarked = false,
  hasNote = false,
  customDiff = null,
  onToggleComplete,
  onToggleBookmark,
  onOpenNotes,
  onViewSolution,
  onSetCustomDiff
}) {
  const [showDiffMenu, setShowDiffMenu] = useState(false);

  const effectiveDifficulty = customDiff || problem.difficulty || "Unknown";

  return (
    <tr className={`group border-b border-slate-800/60 transition-colors ${
      isCompleted 
        ? "bg-emerald-950/10 hover:bg-emerald-950/20" 
        : "hover:bg-slate-800/40"
    }`}>
      {/* 1. Accessible Checkbox */}
      <td className="py-3 px-3.5 text-center w-12">
        <button
          onClick={() => onToggleComplete(problem.id)}
          aria-label={isCompleted ? `Mark ${problem.title} incomplete` : `Mark ${problem.title} complete`}
          title={isCompleted ? "Mark Incomplete" : "Mark Completed"}
          className={`w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
            isCompleted
              ? "bg-emerald-500 border-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30 scale-105"
              : "border-slate-700 hover:border-slate-500 bg-slate-900/60"
          }`}
        >
          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>
      </td>

      {/* 2. Star / Bookmark for Revision */}
      <td className="py-3 px-2 text-center w-10">
        <button
          onClick={() => onToggleBookmark(problem.id)}
          aria-label={isBookmarked ? "Remove from Revision" : "Star for Revision"}
          title={isBookmarked ? "Remove from Revision list" : "Star for Revision"}
          className="text-slate-600 hover:text-amber-400 transition-colors cursor-pointer p-0.5"
        >
          <Star 
            className={`w-4 h-4 transition-transform active:scale-125 ${
              isBookmarked 
                ? "text-amber-400 fill-amber-400 scale-110 drop-shadow-sm" 
                : "text-slate-600 hover:text-amber-400"
            }`} 
          />
        </button>
      </td>

      {/* 3. Problem Global No */}
      <td className="py-3 px-2 text-center w-14 font-mono text-xs text-slate-400">
        #{problem.globalNo}
      </td>

      {/* 4. Problem Title + LeetCode tags */}
      <td className="py-3 px-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onViewSolution(problem)}
              className={`font-semibold text-xs sm:text-sm text-left transition-colors cursor-pointer ${
                isCompleted 
                  ? "text-slate-400 line-through decoration-slate-600/80" 
                  : "text-slate-100 hover:text-indigo-400"
              }`}
            >
              {problem.title}
            </button>

            {/* Extra tags if full title has Leetcode info */}
            {problem.fullTitle && problem.fullTitle !== problem.title && (
              <span className="text-[11px] text-slate-400 font-normal">
                ({problem.fullTitle.replace(problem.title, "").replace(/^\s*[/( -]\s*/, "").replace(/\s*[)]\s*$/, "").trim()})
              </span>
            )}
          </div>

          {/* Complexity indicators */}
          {(problem.timeComplexity || problem.spaceComplexity) && (
            <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
              {problem.timeComplexity && (
                <span className="flex items-center gap-1 font-mono" title={`Time Complexity: ${problem.timeComplexity}`}>
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-400">TC:</span> {problem.timeComplexity}
                </span>
              )}
              {problem.spaceComplexity && (
                <span className="flex items-center gap-1 font-mono" title={`Space Complexity: ${problem.spaceComplexity}`}>
                  <Cpu className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-400">SC:</span> {problem.spaceComplexity}
                </span>
              )}
            </div>
          )}
        </div>
      </td>

      {/* 5. Difficulty Badge (Clickable dropdown to change) */}
      <td className="py-3 px-3 w-28 whitespace-nowrap">
        <div className="relative inline-block">
          <button
            onClick={() => setShowDiffMenu(!showDiffMenu)}
            title="Click to change difficulty"
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border cursor-pointer transition-all hover:scale-105 ${getDifficultyColor(effectiveDifficulty)}`}
          >
            <span>{formatDifficulty(effectiveDifficulty)}</span>
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
          </button>

          {showDiffMenu && (
            <>
              <div 
                className="fixed inset-0 z-20" 
                onClick={() => setShowDiffMenu(false)} 
              />
              <div className="absolute left-0 mt-1 w-32 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-30 py-1 text-xs">
                {["Easy", "Medium", "Hard", "Unknown"].map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      onSetCustomDiff(problem.id, d);
                      setShowDiffMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      d === "Easy" ? "bg-emerald-400" :
                      d === "Medium" ? "bg-amber-400" :
                      d === "Hard" ? "bg-rose-400" : "bg-slate-400"
                    }`} />
                    <span>{d === "Unknown" ? "Core / General" : d}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </td>

      {/* 6. Company Tags */}
      <td className="py-3 px-3 hidden md:table-cell max-w-[220px]">
        <div className="flex flex-wrap gap-1 items-center">
          {problem.companyTags && problem.companyTags.length > 0 ? (
            <>
              {problem.companyTags.slice(0, 2).map((comp, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800/90 text-slate-300 border border-slate-700/50 truncate max-w-[90px]"
                  title={comp}
                >
                  {comp}
                </span>
              ))}
              {problem.companyTags.length > 2 && (
                <span 
                  className="text-[10px] text-slate-400 font-medium cursor-help px-1 rounded hover:bg-slate-800"
                  title={problem.companyTags.slice(2).join(", ")}
                >
                  +{problem.companyTags.length - 2}
                </span>
              )}
            </>
          ) : (
            <span className="text-[11px] text-slate-600">—</span>
          )}
        </div>
      </td>

      {/* 7. Resources (LeetCode & YouTube) */}
      <td className="py-3 px-3 w-24 text-center whitespace-nowrap">
        <div className="flex items-center justify-center gap-1.5">
          {problem.leetcodeUrl ? (
            <a
              href={problem.leetcodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open problem on LeetCode"
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 border border-slate-800 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : problem.gfgUrl ? (
            <a
              href={problem.gfgUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open on GeeksforGeeks"
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 border border-slate-800 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : null}

          {problem.youtubeUrl ? (
            <a
              href={problem.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Watch video explanation by codestorywithMIK"
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors"
            >
              <YoutubeIcon className="w-3.5 h-3.5 text-red-500" />
            </a>
          ) : null}
        </div>
      </td>

      {/* 8. Solution & Notes Actions */}
      <td className="py-3 px-3.5 w-24 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1.5">
          {/* View Solution Code */}
          <button
            onClick={() => onViewSolution(problem)}
            title="Inspect Solution Code (C++ / Java)"
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-slate-900 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-400 border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Code</span>
          </button>

          {/* Personal Notes */}
          <button
            onClick={() => onOpenNotes(problem)}
            title={hasNote ? "View / Edit Note (Note attached)" : "Add Personal Note"}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer relative ${
              hasNote 
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-xs shadow-indigo-500/20" 
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            {hasNote && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}
