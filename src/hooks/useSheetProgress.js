import { useState, useEffect, useCallback } from "react";
import { calculateStreak } from "../utils/helpers";

const STORAGE_KEYS = {
  COMPLETED: "gsheet_completed_v1",
  BOOKMARKED: "gsheet_bookmarks_v1",
  NOTES: "gsheet_notes_v1",
  DIFFICULTIES: "gsheet_custom_diff_v1",
  HISTORY: "gsheet_history_v1",
  THEME: "gsheet_theme_v1",
};

export function useSheetProgress() {
  const [completed, setCompleted] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COMPLETED);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [bookmarked, setBookmarked] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BOOKMARKED);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [notes, setNotes] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTES);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [customDiffs, setCustomDiffs] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DIFFICULTIES);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [history, setHistory] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME);
      if (stored) return stored;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "dark"; // default to dark
    } catch {
      return "dark";
    }
  });

  // Apply theme class to document
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  // Sync completed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPLETED, JSON.stringify(Array.from(completed)));
    } catch (e) {
      console.error(e);
    }
  }, [completed]);

  // Sync bookmarked
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKED, JSON.stringify(Array.from(bookmarked)));
    } catch (e) {
      console.error(e);
    }
  }, [bookmarked]);

  // Sync notes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    } catch (e) {
      console.error(e);
    }
  }, [notes]);

  // Sync custom difficulties
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DIFFICULTIES, JSON.stringify(customDiffs));
    } catch (e) {
      console.error(e);
    }
  }, [customDiffs]);

  // Sync history
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error(e);
    }
  }, [history]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const toggleComplete = useCallback((id) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      const isNowCompleted = !next.has(id);
      if (isNowCompleted) {
        next.add(id);
        // Add to history
        setHistory((prevHist) => [
          { problemId: id, date: new Date().toISOString() },
          ...prevHist.slice(0, 499), // keep last 500
        ]);
      } else {
        next.delete(id);
        // Remove from history
        setHistory((prevHist) => prevHist.filter((h) => h.problemId !== id));
      }
      return next;
    });
  }, []);

  const toggleBookmark = useCallback((id) => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const setNote = useCallback((id, text) => {
    setNotes((prev) => {
      const next = { ...prev };
      if (!text || text.trim() === "") {
        delete next[id];
      } else {
        next[id] = text;
      }
      return next;
    });
  }, []);

  const setCustomDifficulty = useCallback((id, diff) => {
    setCustomDiffs((prev) => {
      const next = { ...prev };
      if (!diff || diff === "Unknown") {
        delete next[id];
      } else {
        next[id] = diff;
      }
      return next;
    });
  }, []);

  const batchMarkTopic = useCallback((problemIds, shouldComplete) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      const now = new Date().toISOString();
      const newHistoryEntries = [];

      problemIds.forEach((id) => {
        if (shouldComplete) {
          if (!next.has(id)) {
            next.add(id);
            newHistoryEntries.push({ problemId: id, date: now });
          }
        } else {
          next.delete(id);
        }
      });

      if (newHistoryEntries.length > 0) {
        setHistory((prevHist) => [...newHistoryEntries, ...prevHist].slice(0, 500));
      } else if (!shouldComplete) {
        const idSet = new Set(problemIds);
        setHistory((prevHist) => prevHist.filter((h) => !idSet.has(h.problemId)));
      }

      return next;
    });
  }, []);

  const exportData = useCallback(() => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      completed: Array.from(completed),
      bookmarked: Array.from(bookmarked),
      notes,
      customDifficulties: customDiffs,
      history,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dsa_sheet_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [completed, bookmarked, notes, customDiffs, history]);

  const importData = useCallback((importedJson) => {
    try {
      const data = typeof importedJson === "string" ? JSON.parse(importedJson) : importedJson;
      if (Array.isArray(data.completed)) {
        setCompleted(new Set(data.completed));
      }
      if (Array.isArray(data.bookmarked)) {
        setBookmarked(new Set(data.bookmarked));
      }
      if (data.notes && typeof data.notes === "object") {
        setNotes(data.notes);
      }
      if (data.customDifficulties && typeof data.customDifficulties === "object") {
        setCustomDiffs(data.customDifficulties);
      }
      if (Array.isArray(data.history)) {
        setHistory(data.history);
      }
      return { success: true };
    } catch (err) {
      console.error("Import failed:", err);
      return { success: false, error: err.message };
    }
  }, []);

  const resetAll = useCallback(() => {
    setCompleted(new Set());
    setBookmarked(new Set());
    setNotes({});
    setCustomDiffs({});
    setHistory([]);
    Object.values(STORAGE_KEYS).forEach((k) => {
      if (k !== STORAGE_KEYS.THEME) localStorage.removeItem(k);
    });
  }, []);

  const streak = calculateStreak(history);

  return {
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
  };
}
