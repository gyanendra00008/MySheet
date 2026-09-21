import React, { useEffect, useRef } from "react";
import { 
  Flame, 
  Moon, 
  Sun, 
  BookOpen, 
  Database, 
  Code2, 
  CheckCircle2,
  Search
} from "lucide-react";
import gsap from "gsap";
import { calculateProgress } from "../utils/helpers";

export function Navbar({ 
  totalProblems, 
  completedCount, 
  streak, 
  theme, 
  onToggleTheme, 
  onOpenPdfNotes, 
  onOpenBackup,
  onOpenCommandPalette
}) {
  const percentage = calculateProgress(completedCount, totalProblems);
  const navRef = useRef(null);

  // GSAP subtle navbar entrance
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !navRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(navRef.current, {
        y: -16,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out"
      });
    }, navRef);

    return () => ctx.revert();
  }, []);

  return (
    <header 
      ref={navRef}
      className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-950/85 border-b border-slate-800/80 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20 shrink-0">
            <Code2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                DSA Command Center
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 hidden sm:inline">
                Developer Edition
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              {totalProblems} Curated Problems & Solutions • Local-First
            </p>
          </div>
        </div>

        {/* Center: Live Progress Pill */}
        <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 shadow-inner">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-white">{completedCount}</span>
            <span className="text-slate-500">/</span>
            <span>{totalProblems}</span>
          </div>
          <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-xs font-bold text-emerald-400 min-w-[3rem] text-right font-mono">
            {percentage}%
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Command Palette Trigger Button */}
          <button
            onClick={onOpenCommandPalette}
            title="Open Command Palette (Ctrl+K or ⌘K)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Search / Menu</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[10px] font-mono rounded bg-slate-950 text-slate-400 border border-slate-800">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>

          {/* Streak Badge */}
          <div 
            title={streak > 0 ? `Current Streak: ${streak} day(s)!` : "Solve problems to build your daily streak!"}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              streak > 0 
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-sm shadow-amber-500/10" 
                : "bg-slate-900/60 text-slate-400 border-slate-800"
            }`}
          >
            <Flame className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${streak > 0 ? "fill-amber-400 text-amber-500 animate-pulse" : "text-slate-500"}`} />
            <span className="font-bold font-mono">{streak}</span>
            <span className="hidden sm:inline">d</span>
          </div>

          {/* iPad PDF Notes Button */}
          <button
            onClick={onOpenPdfNotes}
            title="Browse 256 handwritten iPad PDF notes"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">PDF Notes</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold font-mono">256</span>
          </button>

          {/* Backup / Restore */}
          <button
            onClick={onOpenBackup}
            title="Backup & Restore Progress"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors cursor-pointer"
          >
            <Database className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors cursor-pointer"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
