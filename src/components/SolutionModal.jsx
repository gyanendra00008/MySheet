import React, { useState, useEffect } from "react";
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Clock, 
  Cpu, 
  Folder, 
  Loader2
} from "lucide-react";
import { YoutubeIcon } from "./YoutubeIcon";
import { copyToClipboard, getDifficultyColor, formatDifficulty } from "../utils/helpers";

export function SolutionModal({ problem, isOpen, onClose }) {
  const [solutionData, setSolutionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("all"); // "all" | "cpp" | "java"

  useEffect(() => {
    if (!isOpen || !problem) {
      return;
    }

    setLoading(true);
    setSelectedLanguage("all");
    
    fetch(`/data/solutions/${problem.id}.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Solution file not found");
        return res.json();
      })
      .then((data) => {
        setSolutionData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Could not load individual solution JSON, falling back", err);
        setSolutionData({
          ...problem,
          code: "// Unable to load solution preview from local file.\n// Source path: " + problem.sourcePath
        });
        setLoading(false);
      });
  }, [isOpen, problem]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !problem) return null;

  const handleCopy = () => {
    if (!solutionData?.code) return;
    copyToClipboard(solutionData.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Filter code snippet if user selects C++ or Java specifically
  let displayCode = solutionData?.code || "";
  if (selectedLanguage === "cpp" && displayCode.includes("JAVA")) {
    const parts = displayCode.split(/\/\*+.*JAVA.*\*+/i);
    if (parts.length > 0) displayCode = parts[0].trim();
  } else if (selectedLanguage === "java" && displayCode.includes("JAVA")) {
    const parts = displayCode.split(/\/\*+.*JAVA.*\*+/i);
    if (parts.length > 1) displayCode = parts[1].trim();
  }

  const lines = displayCode.split("\n");

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-800 bg-slate-900/90 gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
              <span className="font-semibold text-indigo-400">{problem.chapterName}</span>
              <span>›</span>
              <span>{problem.topicName}</span>
              <span>•</span>
              <span className="font-mono text-slate-400">#{problem.globalNo}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getDifficultyColor(problem.difficulty)}`}>
                {formatDifficulty(problem.difficulty)}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white truncate">
              {problem.title}
            </h2>

            {/* Complexities & Source path */}
            <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap pt-0.5">
              {problem.timeComplexity && (
                <span className="flex items-center gap-1 font-mono text-slate-300" title={`Time Complexity: ${problem.timeComplexity}`}>
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-slate-500">TC:</span> {problem.timeComplexity}
                </span>
              )}
              {problem.spaceComplexity && (
                <span className="flex items-center gap-1 font-mono text-slate-300" title={`Space Complexity: ${problem.spaceComplexity}`}>
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-slate-500">SC:</span> {problem.spaceComplexity}
                </span>
              )}
              {problem.sourcePath && (
                <span className="flex items-center gap-1 text-[11px] text-slate-500 font-mono truncate" title={`Source: A:/Sheet/${problem.sourcePath}`}>
                  <Folder className="w-3 h-3 text-slate-500 shrink-0" />
                  A:/Sheet/{problem.sourcePath}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Company Tags Bar */}
        {problem.companyTags && problem.companyTags.length > 0 && (
          <div className="px-5 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-slate-500 font-medium shrink-0 text-[11px]">Companies:</span>
            {problem.companyTags.map((comp, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 text-[11px] whitespace-nowrap border border-slate-700/60"
              >
                {comp}
              </span>
            ))}
          </div>
        )}

        {/* Action Bar: Language Selector & External Links */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-slate-950 border-b border-slate-800/90 text-xs gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400 hidden sm:inline">View:</span>
            <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
              <button
                onClick={() => setSelectedLanguage("all")}
                className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                  selectedLanguage === "all" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Full Code
              </button>
              {problem.hasCpp && (
                <button
                  onClick={() => setSelectedLanguage("cpp")}
                  className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                    selectedLanguage === "cpp" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  C++
                </button>
              )}
              {problem.hasJava && (
                <button
                  onClick={() => setSelectedLanguage("java")}
                  className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                    selectedLanguage === "java" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Java
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {/* LeetCode link */}
            {problem.leetcodeUrl && (
              <a
                href={problem.leetcodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">LeetCode</span>
              </a>
            )}

            {/* YouTube link */}
            {problem.youtubeUrl && (
              <a
                href={problem.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
              >
                <YoutubeIcon className="w-3.5 h-3.5 text-red-500" />
                <span className="hidden sm:inline">Video</span>
              </a>
            )}
          </div>
        </div>

        {/* Code Content Area */}
        <div className="flex-1 overflow-auto bg-[#0d1117] p-4 text-xs font-mono select-text">
          {loading ? (
            <div className="flex items-center justify-center h-64 gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
              <span>Loading solution code...</span>
            </div>
          ) : (
            <pre className="text-slate-200 leading-relaxed overflow-x-auto">
              <code>
                {lines.map((line, i) => (
                  <div key={i} className="table-row">
                    <span className="table-cell select-none text-slate-600 text-right pr-4 w-10">
                      {i + 1}
                    </span>
                    <span className="table-cell whitespace-pre">
                      {line}
                    </span>
                  </div>
                ))}
              </code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
