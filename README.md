# 🧠 Skill Intelligence — 3D Skill Gap Analyzer

An immersive, WebGL-powered skill gap analysis tool that parses your resume against a job description and visualizes your skill architecture in real-time 3D space.

---

## 🚀 Live Demo

Upload your resume (PDF/TXT), paste a job description, and watch your skill graph come alive in 3D.

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js >= 18
- npm >= 9
- A free [Groq API key](https://console.groq.com)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/hackthon-sample1.git
cd hackthon-sample1
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create environment file
Create a `.env` file in the project root:
```env
VITE_GEMINI_API_KEY=your_groq_api_key_here
```
> Get a free key at [console.groq.com](https://console.groq.com) — no credit card required.

### 4. Start the development server
```bash
npm run dev
```

### 5. Open in browser
```
http://localhost:5173
```

---

## 📦 Dependencies

### Core
| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^19.2.4 | UI framework |
| `react-dom` | ^19.2.4 | DOM rendering |
| `react-router-dom` | ^7.13.1 | Client-side routing |
| `zustand` | ^5.0.12 | Global state management |

### 3D Rendering
| Package | Version | Purpose |
|---------|---------|---------|
| `three` | ^0.183.2 | WebGL 3D engine |
| `@react-three/fiber` | ^9.5.0 | React renderer for Three.js |
| `@react-three/drei` | ^10.7.7 | Three.js helpers & abstractions |

### Animation & UI
| Package | Version | Purpose |
|---------|---------|---------|
| `framer-motion` | ^12.38.0 | Animations & transitions |
| `gsap` | ^3.14.2 | Hero section animations |
| `lucide-react` | ^0.577.0 | Icon library |
| `tailwindcss` | ^4.2.2 | Utility-first CSS |

### File Processing
| Package | Version | Purpose |
|---------|---------|---------|
| `pdfjs-dist` | latest | PDF text extraction |

---

## 🧠 Skill Gap Analysis Logic

### Overview
The system uses a 4-stage pipeline to analyze skill gaps:

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
- **PDF files**: Extracted using `pdfjs-dist` — reads each page's text content and concatenates into a single string
- **TXT files**: Read directly using the browser's `FileReader` API

### Stage 2 — AI Analysis
- The extracted resume text and job description are sent to **Groq's LLaMA 3.3 70B** model
- A structured prompt instructs the model to return strict JSON with:
  - `resume_skills` — skills found in the resume
  - `job_skills` — skills required by the job description
  - `matching_skills` — intersection of both
  - `missing_skills` — gap skills with priority (`high` / `medium` / `low`) and reasoning
  - `dependencies` — prerequisite relationships between skills
  - `learning_path` — ordered learning sequence from beginner → advanced
  - `match_score` — integer 0–100 representing resume-to-JD fit

### Stage 3 — Graph Data Construction
- Matching skills → nodes with `known: true` (purple glow)
- Missing skills → nodes with `known: false` (red glow)
- Skill dependencies → directed edges between nodes
- Node positions calculated using a 3D spiral algorithm for organic distribution

### Stage 4 — 3D Visualization
- Three.js renders skill nodes as glowing spheres in 3D space
- Three view modes:
  - **Diagnostics** (`/app`) — full skill architecture overview
  - **Skill Gaps** (`/gaps`) — highlights missing skills in red, dims known skills
  - **Learning Path** (`/path`) — cyan dashed line connecting gap skills in learning order

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Pages/
│   │   └── LandingPage.jsx       # Marketing landing page
│   ├── Scene/
│   │   ├── CanvasContainer.jsx   # Three.js canvas wrapper
│   │   ├── SkillGraph.jsx        # 3D node/edge renderer
│   │   ├── Environment.jsx       # Lighting & background
│   │   └── CameraController.jsx  # Camera animations
│   └── UI/
│       ├── ControlPanel.jsx      # Upload form & analyze button
│       ├── AnalyzePanel.jsx      # Results dashboard
│       ├── InsightPanel.jsx      # Node detail panel
│       └── CustomCursor.jsx      # Custom cursor
├── services/
│   └── analyzeService.js         # Groq API + PDF extraction
├── store/
│   └── useStore.js               # Zustand global state
├── App.jsx                       # Routes setup
└── main.jsx                      # Entry point
```

---

## 🐳 Docker Setup

See `Dockerfile` in the project root.

```bash
# Build
docker build -t skill-intelligence .

# Run
docker run -p 5173:5173 skill-intelligence
```

---



