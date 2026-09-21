import React, { useEffect, useRef, useMemo } from "react";
import { 
  CheckCircle2, 
  CircleDot, 
  ListChecks, 
  Flame, 
  TrendingUp, 
  Clock, 
  Sparkles,
  ExternalLink,
  Target,
  Calendar
} from "lucide-react";
import gsap from "gsap";
import { ProgressBar } from "./ProgressBar";
import { calculateProgress, getDifficultyColor, formatDifficulty } from "../utils/helpers";

export function DashboardStats({
  chapters = [],
  completedSet = new Set(),
  customDiffs = {},
  history = [],
  streak = 0,
  onSelectChapter,
  onViewSolution
}) {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const progressValRef = useRef(null);
  const hasAnimatedRef = useRef(false);

  // Compute aggregated stats
  const { 
    totalProblems, 
    completedCount, 
    diffCounts, 
    chapterStats 
  } = useMemo(() => {
    let total = 0;
    let completed = 0;

    const diffs = {
      Easy: { total: 0, completed: 0 },
      Medium: { total: 0, completed: 0 },
      Hard: { total: 0, completed: 0 },
      Unknown: { total: 0, completed: 0 }
    };

    const chapStats = chapters.map((chap) => {
      let chapTotal = 0;
      let chapCompleted = 0;

      chap.topics.forEach((topic) => {
        topic.problems.forEach((prob) => {
          chapTotal++;
          total++;

          const effectiveDiff = customDiffs[prob.id] || prob.difficulty || "Unknown";
          if (diffs[effectiveDiff]) {
            diffs[effectiveDiff].total++;
          } else {
            diffs.Unknown.total++;
          }

          if (completedSet.has(prob.id)) {
            chapCompleted++;
            completed++;
            if (diffs[effectiveDiff]) {
              diffs[effectiveDiff].completed++;
            } else {
              diffs.Unknown.completed++;
            }
          }
        });
      });

      return {
        id: chap.id,
        name: chap.name,
        order: chap.order,
        totalTopics: chap.topics.length,
        total: chapTotal,
        completed: chapCompleted,
        percent: calculateProgress(chapCompleted, chapTotal)
      };
    });

    return {
      totalProblems: total,
      completedCount: completed,
      diffCounts: diffs,
      chapterStats: chapStats
    };
  }, [chapters, completedSet, customDiffs]);

  const remainingCount = Math.max(0, totalProblems - completedCount);
  const overallPercentage = calculateProgress(completedCount, totalProblems);

  // Calculate today's completions
  const todayStr = new Date().toISOString().split("T")[0];
  const todayCompletions = useMemo(() => {
    return history.filter((h) => h.date && h.date.startsWith(todayStr)).length;
  }, [history, todayStr]);

  // Last 14 days mini heatmap data
  const activityHeatmap = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dStr = d.toISOString().split("T")[0];
      const count = history.filter((h) => h.date && h.date.startsWith(dStr)).length;
      days.push({
        date: dStr,
        dayName: d.toLocaleDateString("en-US", { weekday: "narrow" }),
        count
      });
    }
    return days;
  }, [history]);

  // Recently completed problems (last 5)
  const recentCompletions = useMemo(() => {
    return history
      .slice(0, 5)
      .map((h) => {
        for (const c of chapters) {
          for (const t of c.topics) {
            const p = t.problems.find((x) => x.id === h.problemId);
            if (p) {
              return { ...p, completedAt: h.date };
            }
          }
        }
        return null;
      })
      .filter(Boolean);
  }, [history, chapters]);

  // GSAP Entrance Animation
  useEffect(() => {
    if (hasAnimatedRef.current) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !containerRef.current) return;

    hasAnimatedRef.current = true;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.from(".gsap-hero", {
        opacity: 0,
        y: 20,
        duration: 0.6
      })
      .from(".gsap-metric-card", {
        opacity: 0,
        y: 15,
        duration: 0.4,
        stagger: 0.08
      }, "-=0.3")
      .from(".gsap-diff-card", {
        opacity: 0,
        y: 12,
        duration: 0.35,
        stagger: 0.06
      }, "-=0.2");
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="space-y-6">
      {/* 1. Hero Command Center Card */}
      <div 
        ref={heroRef}
        className="gsap-hero relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-[#0c1322] to-indigo-950/40 border border-slate-800 p-6 sm:p-8 shadow-2xl transition-all"
      >
        {/* Subtle Ambient Radial Glows */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Hero Details */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DSA Command Center</span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Your DSA Progress
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed max-w-xl">
                Build consistency. Master patterns. Get interview-ready across <strong className="text-slate-200 font-semibold">{totalProblems} chapter-wise problems</strong>.
              </p>
            </div>

            {/* Overall Progress Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Overall Completion
                </span>
                <span 
                  ref={progressValRef}
                  className="text-2xl font-black font-mono text-emerald-400 tracking-tight"
                >
                  {overallPercentage}%
                </span>
              </div>
              <ProgressBar 
                value={completedCount} 
                max={totalProblems} 
                size="lg" 
                color="gradient" 
              />
              <div className="flex justify-between items-center text-xs text-slate-400 pt-0.5">
                <span className="font-mono"><strong className="text-white">{completedCount}</strong> solved</span>
                <span className="font-mono"><strong className="text-white">{remainingCount}</strong> remaining</span>
              </div>
            </div>

            {/* Daily Target & Consistency Strip */}
            <div className="flex items-center gap-3 pt-2 flex-wrap text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                <span>Today's Solved:</span>
                <span className="font-mono font-bold text-white">{todayCompletions}</span>
              </div>

              {/* 14-Day Consistency Mini-Heatmap */}
              <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-400 mr-1" />
                <span className="text-[11px] mr-1">14d:</span>
                <div className="flex items-center gap-1">
                  {activityHeatmap.map((day, idx) => (
                    <div
                      key={idx}
                      title={`${day.date}: ${day.count} solved`}
                      className={`w-2.5 h-2.5 rounded-xs transition-colors ${
                        day.count >= 3 ? "bg-emerald-500" :
                        day.count >= 1 ? "bg-emerald-600/60" :
                        "bg-slate-800"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Counter Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
            <div className="gsap-metric-card group rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700/80 p-4 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Total Problems</span>
                <ListChecks className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold font-mono text-white tracking-tight">{totalProblems}</div>
              <div className="text-[11px] text-slate-400 mt-1">23 Comprehensive Chapters</div>
            </div>

            <div className="gsap-metric-card group rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/30 p-4 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Completed</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">{completedCount}</div>
              <div className="text-[11px] text-emerald-500/80 mt-1">{overallPercentage}% finished</div>
            </div>

            <div className="gsap-metric-card group rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/30 p-4 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Remaining</span>
                <CircleDot className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold font-mono text-amber-400 tracking-tight">{remainingCount}</div>
              <div className="text-[11px] text-slate-400 mt-1">Ready to be conquered</div>
            </div>

            <div className="gsap-metric-card group rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-orange-500/30 p-4 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Current Streak</span>
                <Flame className="w-4 h-4 text-orange-400 fill-orange-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold font-mono text-orange-400 tracking-tight">
                {streak} <span className="text-xs font-normal font-sans text-slate-400">days</span>
              </div>
              <div className="text-[11px] text-orange-500/80 mt-1">
                {streak > 0 ? "Daily momentum active!" : "Solve a problem today!"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Difficulty Breakdown Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Easy */}
        <div className="gsap-diff-card group rounded-xl bg-emerald-950/20 hover:bg-emerald-950/30 border border-emerald-900/40 p-4 shadow-sm transition-all hover:-translate-y-0.5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">🟢 Easy</span>
            <span className="text-xs font-bold font-mono text-emerald-300">
              {calculateProgress(diffCounts.Easy.completed, diffCounts.Easy.total)}%
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {diffCounts.Easy.completed} <span className="text-xs font-medium font-sans text-slate-400">/ {diffCounts.Easy.total}</span>
          </div>
          <ProgressBar 
            value={diffCounts.Easy.completed} 
            max={diffCounts.Easy.total} 
            size="xs" 
            color="emerald" 
            className="mt-2.5" 
          />
        </div>

        {/* Medium */}
        <div className="gsap-diff-card group rounded-xl bg-amber-950/20 hover:bg-amber-950/30 border border-amber-900/40 p-4 shadow-sm transition-all hover:-translate-y-0.5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">🟡 Medium</span>
            <span className="text-xs font-bold font-mono text-amber-300">
              {calculateProgress(diffCounts.Medium.completed, diffCounts.Medium.total)}%
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {diffCounts.Medium.completed} <span className="text-xs font-medium font-sans text-slate-400">/ {diffCounts.Medium.total}</span>
          </div>
          <ProgressBar 
            value={diffCounts.Medium.completed} 
            max={diffCounts.Medium.total} 
            size="xs" 
            color="amber" 
            className="mt-2.5" 
          />
        </div>

        {/* Hard */}
        <div className="gsap-diff-card group rounded-xl bg-rose-950/20 hover:bg-rose-950/30 border border-rose-900/40 p-4 shadow-sm transition-all hover:-translate-y-0.5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">🔴 Hard</span>
            <span className="text-xs font-bold font-mono text-rose-300">
              {calculateProgress(diffCounts.Hard.completed, diffCounts.Hard.total)}%
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {diffCounts.Hard.completed} <span className="text-xs font-medium font-sans text-slate-400">/ {diffCounts.Hard.total}</span>
          </div>
          <ProgressBar 
            value={diffCounts.Hard.completed} 
            max={diffCounts.Hard.total} 
            size="xs" 
            color="rose" 
            className="mt-2.5" 
          />
        </div>

        {/* Core / General */}
        <div className="gsap-diff-card group rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 p-4 shadow-sm transition-all hover:-translate-y-0.5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">⚪ Core / General</span>
            <span className="text-xs font-bold font-mono text-slate-300">
              {calculateProgress(diffCounts.Unknown.completed, diffCounts.Unknown.total)}%
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {diffCounts.Unknown.completed} <span className="text-xs font-medium font-sans text-slate-400">/ {diffCounts.Unknown.total}</span>
          </div>
          <ProgressBar 
            value={diffCounts.Unknown.completed} 
            max={diffCounts.Unknown.total} 
            size="xs" 
            color="indigo" 
            className="mt-2.5" 
          />
        </div>
      </div>

      {/* 3. Chapter Progress Navigation Grid */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300">
              Chapter Navigation & Progress ({chapterStats.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Click any chapter to jump
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {chapterStats.map((chap) => (
            <button
              key={chap.id}
              onClick={() => onSelectChapter?.(chap.id)}
              className="text-left p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800/90 hover:border-indigo-500/40 transition-all group cursor-pointer hover:-translate-y-0.5 shadow-xs"
            >
              <div className="flex justify-between items-start gap-1 mb-1.5">
                <span className="text-xs font-semibold text-slate-200 truncate group-hover:text-indigo-400 transition-colors">
                  {chap.name}
                </span>
                <span className="text-[11px] font-bold font-mono text-slate-400 group-hover:text-white">
                  {chap.percent}%
                </span>
              </div>
              <ProgressBar 
                value={chap.completed} 
                max={chap.total} 
                size="xs" 
                color={chap.percent === 100 ? "emerald" : chap.percent > 50 ? "indigo" : "cyan"} 
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>{chap.totalTopics} {chap.totalTopics === 1 ? "topic" : "topics"}</span>
                <span>{chap.completed}/{chap.total}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Recently Completed Problems Strip */}
      {recentCompletions.length > 0 && (
        <div className="rounded-2xl bg-slate-900/40 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Recently Solved Problems</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Last {recentCompletions.length} problems</span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {recentCompletions.map((p) => {
              const effectiveDiff = customDiffs[p.id] || p.difficulty || "Unknown";
              const formattedDate = p.completedAt 
                ? new Date(p.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) 
                : "";

              return (
                <div
                  key={p.id}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs hover:border-slate-700 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-slate-200 truncate max-w-[200px]" title={p.title}>
                    {p.title}
                  </span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${getDifficultyColor(effectiveDiff)}`}>
                    {formatDifficulty(effectiveDiff)}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hidden sm:inline">
                    {p.chapterName}
                  </span>
                  {formattedDate && (
                    <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                      {formattedDate}
                    </span>
                  )}
                  <button
                    onClick={() => onViewSolution?.(p)}
                    className="text-indigo-400 hover:text-indigo-300 p-0.5 rounded transition-colors cursor-pointer"
                    title="Inspect Solution Code"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
