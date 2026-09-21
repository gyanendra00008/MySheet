import React, { useState, useRef } from "react";
import { 
  Search, 
  RotateCcw, 
  Star, 
  CheckCircle2, 
  Circle, 
  LayoutList, 
  FolderTree, 
  Building2,
  ChevronDown,
  X
} from "lucide-react";
import { YoutubeIcon } from "./YoutubeIcon";

export function FilterBar({
  searchQuery = "",
  onSearchChange,
  statusFilter = "all",
  onStatusFilterChange,
  difficultyFilter = "all",
  onDifficultyFilterChange,
  chapterFilter = "all",
  onChapterFilterChange,
  topicFilter = "all",
  onTopicFilterChange,
  companyFilter = "",
  onCompanyFilterChange,
  videoOnly = false,
  onVideoOnlyChange,
  viewMode = "tree", // "tree" | "table"
  onViewModeChange,
  onExpandAll,
  onCollapseAll,
  onResetFilters,
  chapters = [],
  popularCompanies = [],
  activeFilterCount = 0
}) {
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const searchInputRef = useRef(null);

  // Available topics for chosen chapter
  const currentChapterObj = chapters.find((c) => c.id === chapterFilter);
  const availableTopics = currentChapterObj ? currentChapterObj.topics : [];

  // Filtered companies in searchable dropdown
  const filteredCompanies = popularCompanies.filter((c) =>
    c.toLowerCase().includes(companySearch.toLowerCase())
  );

  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800/90 p-4 space-y-4 shadow-lg transition-colors">
      {/* Top Row: Search Input + Status Pills + View Mode */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search problems, topics, #number, company tags..."
            className="w-full pl-10 pr-16 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchQuery ? (
              <button
                onClick={() => onSearchChange("")}
                className="text-slate-500 hover:text-slate-300 cursor-pointer p-0.5"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Status Filter Segmented Controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <button
            onClick={() => onStatusFilterChange("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === "all"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                : "bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            All
          </button>
          <button
            onClick={() => onStatusFilterChange("pending")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === "pending"
                ? "bg-amber-600 text-white shadow-sm shadow-amber-600/30"
                : "bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <Circle className="w-3 h-3 text-amber-400" />
            <span>Not Started</span>
          </button>
          <button
            onClick={() => onStatusFilterChange("completed")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === "completed"
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                : "bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Completed</span>
          </button>
          <button
            onClick={() => onStatusFilterChange("revision")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === "revision"
                ? "bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/30 font-bold"
                : "bg-slate-950/70 text-amber-400 hover:text-amber-300 border border-slate-800"
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>Revision</span>
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => onViewModeChange("tree")}
            title="Tree View (Chapter & Topic Hierarchy)"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewMode === "tree"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FolderTree className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Tree</span>
          </button>
          <button
            onClick={() => onViewModeChange("table")}
            title="Table View (Flat Sortable Table)"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewMode === "table"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LayoutList className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Table</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Detailed Dropdowns & Quick Controls */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-slate-800/60">
        {/* Difficulty Selector */}
        <div className="flex items-center gap-1.5">
          <select
            value={difficultyFilter}
            onChange={(e) => onDifficultyFilterChange(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">🟢 Easy</option>
            <option value="Medium">🟡 Medium</option>
            <option value="Hard">🔴 Hard</option>
            <option value="Unknown">⚪ Core / General</option>
          </select>
        </div>

        {/* Chapter Selector */}
        <div className="flex items-center gap-1.5">
          <select
            value={chapterFilter}
            onChange={(e) => {
              onChapterFilterChange(e.target.value);
              onTopicFilterChange("all");
            }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer max-w-[190px]"
          >
            <option value="all">All Chapters ({chapters.length})</option>
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.totalProblems})
              </option>
            ))}
          </select>
        </div>

        {/* Topic Selector (context-aware) */}
        {chapterFilter !== "all" && availableTopics.length > 0 && (
          <div className="flex items-center gap-1.5">
            <select
              value={topicFilter}
              onChange={(e) => onTopicFilterChange(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer max-w-[180px]"
            >
              <option value="all">All Topics ({availableTopics.length})</option>
              {availableTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.totalProblems})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Searchable Company Filter Popover */}
        <div className="relative">
          <button
            onClick={() => setShowCompanyMenu(!showCompanyMenu)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
              companyFilter 
                ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40" 
                : "bg-slate-950 border-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="truncate max-w-[130px]">
              {companyFilter || "Company Tags"}
            </span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {showCompanyMenu && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowCompanyMenu(false)} 
              />
              <div className="absolute left-0 mt-1 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-40 p-2 text-xs space-y-2">
                <input
                  type="text"
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                  placeholder="Filter 340+ companies..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                />
                <div className="max-h-52 overflow-y-auto divide-y divide-slate-800/40 space-y-0.5">
                  <button
                    onClick={() => {
                      onCompanyFilterChange("");
                      setShowCompanyMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-slate-800 text-slate-400 cursor-pointer font-medium"
                  >
                    All Companies
                  </button>
                  {filteredCompanies.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        onCompanyFilterChange(c);
                        setShowCompanyMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md transition-colors cursor-pointer flex items-center justify-between ${
                        companyFilter === c ? "bg-indigo-600 text-white" : "hover:bg-slate-800 text-slate-200"
                      }`}
                    >
                      <span className="truncate">{c}</span>
                      {companyFilter === c && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Has Video Toggle */}
        <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white cursor-pointer select-none">
          <input
            type="checkbox"
            checked={videoOnly}
            onChange={(e) => onVideoOnlyChange(e.target.checked)}
            className="rounded text-indigo-600 focus:ring-0 bg-slate-900 border-slate-700"
          />
          <YoutubeIcon className="w-3.5 h-3.5 text-red-500" />
          <span>Has Video</span>
        </label>

        {/* Tree view expand / collapse buttons */}
        {viewMode === "tree" && (
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={onExpandAll}
              className="px-2 py-1 rounded text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
            >
              Expand All
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={onCollapseAll}
              className="px-2 py-1 rounded text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        )}

        {/* Reset Filters Button */}
        {activeFilterCount > 0 && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset ({activeFilterCount})</span>
          </button>
        )}
      </div>
    </div>
  );
}
