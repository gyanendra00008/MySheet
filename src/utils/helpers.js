// Helper utilities for DSA Sheet Tracker

export function calculateProgress(completedCount, totalCount) {
  if (!totalCount || totalCount === 0) return 0;
  return Math.round((completedCount / totalCount) * 1000) / 10;
}

export function formatDifficulty(diff) {
  if (!diff || diff === "Unknown") return "Unknown";
  return diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase();
}

export function getDifficultyColor(diff, isDark = true) {
  const d = (diff || "").toLowerCase();
  if (d === "easy") {
    return isDark 
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" 
      : "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (d === "medium") {
    return isDark 
      ? "bg-amber-500/15 text-amber-400 border-amber-500/30" 
      : "bg-amber-50 text-amber-700 border-amber-200";
  }
  if (d === "hard") {
    return isDark 
      ? "bg-rose-500/15 text-rose-400 border-rose-500/30" 
      : "bg-rose-50 text-rose-700 border-rose-200";
  }
  return isDark 
    ? "bg-slate-500/15 text-slate-400 border-slate-500/30" 
    : "bg-slate-100 text-slate-600 border-slate-200";
}

export function calculateStreak(history = []) {
  if (!history || history.length === 0) return 0;

  // Extract unique sorted dates (YYYY-MM-DD)
  const uniqueDates = Array.from(
    new Set(
      history
        .map((h) => (h.date ? h.date.split("T")[0] : null))
        .filter(Boolean)
    )
  ).sort().reverse();

  if (uniqueDates.length === 0) return 0;

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // If latest completion wasn't today or yesterday, streak is broken
  const latestDate = uniqueDates[0];
  if (latestDate !== today && latestDate !== yesterday) {
    return 0;
  }

  let streak = 0;
  let expectedDate = new Date(latestDate);

  for (const dateStr of uniqueDates) {
    const currentDate = new Date(dateStr);
    const diffTime = Math.abs(expectedDate - currentDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      streak++;
      expectedDate = new Date(currentDate.getTime() - 86400000);
    } else {
      break;
    }
  }

  return streak;
}

export function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise((res, rej) => {
      if (document.execCommand("copy")) {
        res();
      } else {
        rej();
      }
      textArea.remove();
    });
  }
}
