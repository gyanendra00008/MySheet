# 🚀 DSA Command Center 2.0 — Developer Edition

A premium, animated, developer-centric DSA productivity platform inspired by **Striver's A2Z DSA Sheet, GitHub, Linear, LeetCode, and modern IDEs**.

Built specifically for your local problem repository at `A:/Sheet` (1,660+ problems, 23 chapters, 70 topics, 256 handwritten concept notes).

---

## ✨ 2.0 Upgraded Features

### 1. ⌨️ Global Command Palette (`Ctrl + K` / `Cmd + K`)
- Instant keyboard-driven command navigation anywhere in the app.
- **Quick Problem Search**: Type any problem title, topic, or company to jump directly or inspect code.
- **Grouped Actions**:
  - Filter by status (*Pending*, *Completed*, *Revision ⭐*).
  - Filter by difficulty (*Easy*, *Medium*, *Hard*).
  - Toggle themes (*Dark / Light*).
  - Switch view modes (*Tree View / Table View*).
  - Open PDF Notes & Backup modal.
- Keyboard navigation with Arrow keys, Enter to select, and Escape to dismiss.

### 2. 🎬 GSAP Coordinated Motion System
- Smooth, professional initial page entrance with coordinated timelines.
- Staggered metric card reveals (`opacity` + `y-slide`).
- Seamless navbar entrance.
- **Full accessibility**: Respects `prefers-reduced-motion` to disable motion for users who prefer reduced movement.
- Zero duplicate animation runs or layout thrashing.

### 3. 📊 Intelligent Analytics & 14-Day Consistency Heatmap
- **Hero Progress Command Bar**: Multi-gradient completion tracker (`Indigo → Purple → Pink`).
- **14-Day Mini Heatmap**: Visual GitHub-inspired activity squares tracking your daily problem-solving volume.
- **Daily Target Counter**: Displays problems solved today.
- **Metric Cards**: Hover elevation (`translateY(-2px)`), JetBrains Mono typography, and micro-interactions.
- **Difficulty Breakdown**: Colored progress meters for *🟢 Easy*, *🟡 Medium*, *🔴 Hard*, and *⚪ Core / General*.
- **23 Chapter Quick Jump**: Responsive grid of chapters with instant scroll navigation.
- **Recently Completed Reel**: Dynamic strip of recently solved problems with timestamps and quick-inspect links.

### 4. 🔍 Power-User Filter & Search Console
- Quick search shortcut (`/` to focus).
- Segmented status pill controls (*All*, *Not Started*, *Completed*, *Revision ⭐*).
- **Searchable Company Filter**: Filter through **340+ tech companies** with an in-dropdown search bar.
- Video solution toggle (`codestorywithMIK` walkthroughs).
- Expand/Collapse All chapters button.
- Result count and one-click filter reset.

### 5. 🗂️ IDE-Outline Tree View & Flat Table View
- **Tree View**:
  - Clean indentation hierarchy.
  - Chapter accordions with completion badges.
  - Topic subsections with batch **"Mark All"** safety confirmation.
  - Problem rows with interactive difficulty dropdowns, company chips, and complexity badges (`TC: O(n)`, `SC: O(1)`).
- **Flat Table View**:
  - High-performance sortable table (Status, #, Title, Difficulty).
  - Pagination (25, 50, 100, 200, All).

### 6. 💻 In-App Code Viewer & Study Notebook
- **Solution Code Viewer**: GitHub Dark theme, line numbering, language selector (Full Code / C++ / Java), one-click copy.
- **Personal Study Notebook**: Markdown-friendly note editor with quick-insert templates (*Approach*, *Complexity*, *Edge Cases*, *Revision Checklist*) and `Ctrl+S` keyboard save.
- **Toast Notifications**: Non-intrusive floating feedback when problems are completed, notes saved, or code copied.

### 7. 📚 256 Handwritten iPad PDF Notes Explorer
- Searchable drawer for all 256 handwritten PDF notes in `A:/Sheet/iPad PDF Notes`.
- Real-time search by concept, algorithm, or filename.
- One-click copy of local file path.

### 8. 🌓 True Dark & Light Themes
- **Dark Mode**: Slate-950 (`#020617`) IDE terminal aesthetic with subtle ambient radial glow.
- **Light Mode**: High-contrast, clean neutral background with dark readable text and accessible borders.

---

## 🚀 Quick Start

```bash
cd A:/projects/GSheetDSA
npm install
npm run dev
```

Open **`http://localhost:5173`** in your browser.

To build the production bundle:
```bash
npm run build
npm run preview
```

---

## 🔄 Repeatable Problem Sync

To re-index or add new problems from `A:/Sheet`:
```bash
python scripts/import_problems.py
```
*Note: Your progress, notes, and streak are keyed by stable deterministic IDs and will never be overwritten.*
