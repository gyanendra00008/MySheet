import React, { useState, useMemo } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown 
} from "lucide-react";
import { ProblemRow } from "./ProblemRow";

export function FlatTableView({
  problems = [],
  completedSet = new Set(),
  bookmarkedSet = new Set(),
  notes = {},
  customDiffs = {},
  onToggleComplete,
  onToggleBookmark,
  onOpenNotes,
  onViewSolution,
  onSetCustomDiff
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortField, setSortField] = useState("globalNo");
  const [sortAsc, setSortAsc] = useState(true);

  // Sorting
  const sortedProblems = useMemo(() => {
    return [...problems].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "status") {
        valA = completedSet.has(a.id) ? 1 : 0;
        valB = completedSet.has(b.id) ? 1 : 0;
      } else if (sortField === "difficulty") {
        const diffRank = { Easy: 1, Medium: 2, Hard: 3, Unknown: 4 };
        valA = diffRank[customDiffs[a.id] || a.difficulty] || 4;
        valB = diffRank[customDiffs[b.id] || b.difficulty] || 4;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [problems, sortField, sortAsc, completedSet, customDiffs]);

  // Pagination
  const totalPages = pageSize === -1 ? 1 : Math.ceil(sortedProblems.length / pageSize);
  const paginatedProblems = useMemo(() => {
    if (pageSize === -1) return sortedProblems;
    const start = (currentPage - 1) * pageSize;
    return sortedProblems.slice(start, start + pageSize);
  }, [sortedProblems, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-900 border-b border-slate-800 gap-3">
        <div className="text-sm font-semibold text-slate-300">
          Showing <span className="text-white font-bold">{paginatedProblems.length}</span> of <span className="text-white font-bold">{problems.length}</span> problems
        </div>

        {/* Page size selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={-1}>All</option>
            </select>
          </div>

          {/* Pagination buttons */}
          {pageSize !== -1 && totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-400 px-2 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-2.5 px-3.5 text-center w-12 cursor-pointer" onClick={() => handleSort("status")}>
                <div className="flex items-center justify-center gap-1">
                  <span>Status</span>
                  <ArrowUpDown className="w-2.5 h-2.5" />
                </div>
              </th>
              <th className="py-2.5 px-2 text-center w-10">Rev</th>
              <th className="py-2.5 px-2 text-center w-14 cursor-pointer" onClick={() => handleSort("globalNo")}>
                <div className="flex items-center justify-center gap-1">
                  <span>#</span>
                  <ArrowUpDown className="w-2.5 h-2.5" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort("title")}>
                <div className="flex items-center gap-1">
                  <span>Problem Title</span>
                  <ArrowUpDown className="w-2.5 h-2.5" />
                </div>
              </th>
              <th className="py-2.5 px-3 w-28 cursor-pointer" onClick={() => handleSort("difficulty")}>
                <div className="flex items-center gap-1">
                  <span>Difficulty</span>
                  <ArrowUpDown className="w-2.5 h-2.5" />
                </div>
              </th>
              <th className="py-2.5 px-3 hidden md:table-cell">Company Tags</th>
              <th className="py-2.5 px-3 w-24 text-center">Resources</th>
              <th className="py-2.5 px-3.5 w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProblems.map((problem) => (
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

      {/* Bottom pagination */}
      {pageSize !== -1 && totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-slate-900/60 border-t border-slate-800 text-xs text-slate-400">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, problems.length)} of {problems.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <span className="font-semibold text-slate-200">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
