# Skill Intelligence — 3D Skill Gap Analyzer

An immersive, WebGL-powered skill gap analysis tool that parses your resume against a job description
and visualizes your skill architecture in real-time 3D space. Built with Vite + React + React Three Fiber.

---

## Overview

The app takes a resume (PDF/TXT) and a pasted job description, extracts the skill data with
Groq-powered AI, then renders a 3D skill graph of your known vs. missing skills. You can
explore Diagnostics, drill into Skill Gaps, and follow the AI-generated Learning Path.

---

## How It Works (4-Stage Pipeline)

```
Resume (PDF/TXT) + Job Description
         ↓
 1. Text Extraction
         ↓
 2. AI Analysis (Groq LLM)
         ↓
 3. Graph Data Construction
         ↓
 4. 3D Visualization
```

### Stage 1 — Text Extraction
- **PDF files**: `extractTextFromPDF` in `src/services/analyzeService.js` reads every page with
  `pdfjs-dist` (`page.getTextContent()`, pages concatenated into one string)
- **TXT files**: read directly via the browser `FileReader` API

### Stage 2 — AI Analysis
`analyzeSkills()` in `src/services/analyzeService.js`

- Sends the resume + job description through `ANALYSIS_PROMPT_TEMPLATE` (line 15)
- Calls `POST https://api.groq.com/openai/v1/chat/completions` with:
  - **Model: `openai/gpt-oss-120b`** (the previous `llama-3.3-70b-versatile` was deprecated
    by Groq on 2026-08-16 — use of the old ID returns 404)
  - `response_format: { type: 'json_object' }` for strict JSON output
  - `temperature: 0.2`, `max_tokens: 4096`
- The model returns a strict JSON object:
  - `resume_skills` — skills found in the resume
  - `job_skills` — required skills from the job description
  - `matching_skills` — intersection of both
  - `missing_skills` — gap skills with `priority` (`high` / `medium` / `low`) and `reason`
  - `dependencies` — prerequisite relationships between skills (`{ skill, requires[] }`)
  - `learning_path` — ordered steps from beginner to advanced (`{ step, skill, description }`)
  - `match_score` — integer 0–100 (normalized in `analyzeSkills`, lines 202–205, to a percentage if a decimal is returned)
  - `summary` — a short reasoning summary; guaranteed to be a non-empty string by the
    normalization at lines 196–198 (falls back to e.g. "3 skills match your resume, 2 skill gaps found.")

### Stage 3 — Graph Data Construction
`buildGraphData()` in `src/services/analyzeService.js:67`

- Nodes: every matching + missing skill, with
  - `id`, `label` (skill name), `group: 'skill'`
  - `known: true/false` (known → purple glow `#B39DDB`/`#8a2be2`, missing → muted gray `#050505`)
  - `pos` — 3D spiral coordinates via `spiral(i, count, radius)` (line 60)
  - `priority`, `gapReason`, `nextStep` — from missing_skills / learning_path
- Edges: dependency edges between skill nodes when both ends exist

### Stage 4 — 3D Visualization
Three.js renders skill nodes as glowing spheres; see "Routes" below.

---

## Features

- **Upload** — Drag & drop or click to upload a resume (PDF/DOCX/TXT; DOCX accepted by the
  file input but text extraction is implemented for PDF/TXT — `accept` in `ControlPanel.jsx`)
- **AI Insight** (`AnalyzePanel.jsx`) — purple glass panel with the analysis summary plus a
  **Key Gaps** list showing missing skills with priority badges (red = high, yellow = medium,
  muted = low)
- **Match Analysis** — match_score dial + JD skills / Matched / Missing stats
- **Skill Taxonomy** — your matching skills, plus a "Skills to Acquire" list for gaps
- **Learning Path** — ordered steps (step number badge, skill name, description)
- **3D Skill Graph** (`SkillGraph.jsx`) — nodes pulse on hover/selection; known skills glow
  purple, missing skills are red on the Gaps view
- **Custom cursor** (`CustomCursor.jsx`)

---

## Setup

### Prerequisites
- Node.js >= 18
- npm >= 9

### 1. Install dependencies
```bash
npm install
```

### 2. Environment file
Create a `.env` file in the project root:
```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```
Get a free key at [console.groq.com](https://console.groq.com) — no credit card required.

> Note: the key is read from `import.meta.env.VITE_GROQ_API_KEY` (set in the `.env` file).
> `ControlPanel.jsx:73` references a legacy env name `VITE_GEMINI_API_KEY` in its debug log.

### 3. Start the development server
```bash
npm run dev
```
Open http://localhost:5173

---

## Development Commands

| Command            | Purpose                                             |
|--------------------|-----------------------------------------------------|
| `npm run dev`      | Start Vite dev server (http://localhost:5173)        |
| `npm run build`    | Production build (`vite build` → `dist/`)            |
| `npm run preview`  | Preview the production build                         |
| `npm run lint`     | ESLint via `eslint.config.js` (currently broken — see Notes) |

---

## Project Structure

```
.
├── src/
│   ├── App.jsx                     # Routes setup (wildcard → ControlPanel; sub-routes handled there)
│   ├── App.css
│   ├── index.css
│   ├── main.jsx                    # Entry point (StrictMode + App)
│   ├── components/
│   │   ├── Pages/
│   │   │   └── LandingPage.jsx     # Marketing landing page
│   │   ├── Scene/
│   │   │   ├── CanvasContainer.jsx # Three.js canvas wrapper
│   │   │   ├── SkillGraph.jsx      # 3D node/edge renderer (nodes, halo/glow, route highlighting)
│   │   │   ├── Environment.jsx     # Lighting & background
│   │   │   └── CameraController.jsx# Camera animations
│   │   └── UI/
│   │       ├── ControlPanel.jsx    # Upload form, JD textarea, Analyze button (idle state)
│   │       ├── AnalyzePanel.jsx    # Diagnostics dashboard (stats, Match Analysis, AI Insight, Taxonomy, Learning Path)
│   │       ├── InsightPanel.jsx    # Node detail panel (selected skill, cluster, gap reason, next step)
│   │       └── CustomCursor.jsx    # Custom cursor
│   ├── services/
│   │   └── analyzeService.js       # Groq API + PDF/text extraction + graph data building
│   └── store/
│       └── useStore.js             # Zustand global state
├── backend/
│   ├── main.py                     # Empty placeholder
│   └── requirements.txt            # Empty placeholder
├── index.html                      # App shell (title, fonts, noise overlay svg)
├── vite.config.js                  # Vite + React + Tailwind plugin config
├── eslint.config.js                # ESLint config (references @eslint/js — not installed)
├── .env                            # Local env file (example: `VITE_GROQ_API_KEY=…`)
└── public/
    ├── favicon.svg
    └── icons.svg
```

---

## Routes & States

### Routes
`App.jsx` renders `ControlPanel` for every path (`<Route path="*">`). The sub-routes are
handled by `ControlPanel` + the 3D scene using `useStore.currentRoute`:

| Route   | Name (as documented)  | Behavior                                                    |
|---------|-----------------------|-------------------------------------------------------------|
| `/`     | Idle                  | Upload panel + job description input                         |
| `/app`  | Diagnostics           | Full skill architecture overview (AnalyzePanel)               |
| `/gaps` | Skill Gaps            | 3D view with missing skills highlighted in red                |
| `/path` | Learning Path         | 3D view with a cyan dashed line connecting gap skills in order|

### State (`src/store/useStore.js` — Zustand)
- `appState`: `idle` | `analyzing` | `active`
- `currentRoute`: string
- `isTransitioning`: boolean (500ms navigate + 1500ms hide)
- `selectedSkill`: node details (label, group, known, gapReason, nextStep, …) — set via `InsightPanel`
- `analysis`: full AI analysis object (`match_score`, `missing_skills`, `learning_path`, `summary`, …)
- `skills`, `edges`: graph data from `buildGraphData`
- `resetToIdle()`: clears analysis, skills, edges, route, and selected skill

### Flow
1. User uploads resume + pastes JD on `/`
2. Clicks **Analyze Architecture** → `handleAnalyze()` in `ControlPanel.jsx`
3. `analyzeSkills()` → text extraction → Groq request → JSON parse (`cleanJSON` strips markdown fences)
4. `setAnalysis(analysis)` + `setSkillGraph({ skills, edges })` → route to `/app`

---

## Key Files

- `src/services/analyzeService.js` — `extractTextFromPDF`, `analyzeSkills`, `buildGraphData`, `spiral`, `ANALYSIS_PROMPT_TEMPLATE`
- `src/components/UI/AnalyzePanel.jsx` — Diagnostics dashboard (stats, Match Analysis, AI Insight + Key Gaps, Taxonomy, Learning Path)
- `src/components/UI/InsightPanel.jsx` — Node metadata side panel
- `src/components/Scene/SkillGraph.jsx` — 3D node/edge rendering (`useFrame` loop, route-based visibility, hover/select)

---

## Technical Notes

- **Build passes**: `npm run build` → `dist/` (Vite 8, ~1.7 MB JS bundle, one warning about chunk size > 500 kB)
- **No Dockerfile**: the repo is run with the dev server / `vite build` as above
- **Lint status**: `npm run lint` currently fails because `@eslint/js` is not installed
  (`eslint.config.js` imports it, and it isn't in `package.json` or `node_modules`) — pre-existing issue
- **Debug logs**: `ControlPanel.jsx:73` logs `import.meta.env.VITE_GEMINI_API_KEY` to the console on
  every Analyze click (a legacy env name — there is no `VITE_GEMINI_API_KEY` in the codebase)
- **Known empty scaffolds**: `backend/main.py` and `backend/requirements.txt` are empty; `LandingPage.jsx` is
  the only page besides the idle upload view

---

## Contributing / Housekeeping

- Nothing is committed unless asked; run `git status` / `git log` first when touching git.
- Verify changes with `npm run build` (and, once lint is repaired, `npm run lint`).
- Do not introduce heavy dependencies.

---

## License

None specified in the repo.
