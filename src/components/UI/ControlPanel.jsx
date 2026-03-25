import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { FileUp, ScanEye, Zap, FileText, Navigation, ArrowLeft, X } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useNavigate, useLocation } from 'react-router-dom'
import AnalyzePanel from './AnalyzePanel'
import { analyzeSkills } from '../../services/analyzeService'

export default function ControlPanel() {
  const appState = useStore(state => state.appState)
  const setAppState = useStore(state => state.setAppState)
  const setCurrentRoute = useStore(state => state.setCurrentRoute)
  const isTransitioning = useStore(state => state.isTransitioning)
  const setIsTransitioning = useStore(state => state.setIsTransitioning)
  const setAnalysis = useStore(state => state.setAnalysis)
  const setSkillGraph = useStore(state => state.setSkillGraph)
  const resetToIdle = useStore(state => state.resetToIdle)

  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname

  const [resumeFile, setResumeFile] = useState(null)
  const [jdText, setJdText] = useState('')
  const [showJDInput, setShowJDInput] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const hasResume = !!resumeFile
  const hasJD = jdText.trim().length > 0

  const handleNavigationTransition = (path) => {
    if (isTransitioning || location.pathname === path) return
    setIsTransitioning(true)
    setCurrentRoute(path)
    setTimeout(() => navigate(path), 500)
    setTimeout(() => setIsTransitioning(false), 1500)
  }

  const acceptFile = (file) => {
    if (!file) return
    if (!file.name.match(/\.(pdf|doc|docx|txt)$/i)) {
      setError('Please upload a PDF, DOCX, or TXT file.')
      return
    }
    setResumeFile(file)
    setError('')
  }

  const onDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true) }
  const onDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false) }
  const onDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    acceptFile(e.dataTransfer.files[0])
  }

  const handleUploadClick = () => {
    document.body.style.overflow = 'visible'
    inputRef.current.click()
    setTimeout(() => { document.body.style.overflow = 'hidden' }, 3000)
  }

  const handleFileChange = (e) => {
    acceptFile(e.target.files[0])
    document.body.style.overflow = 'hidden'
  }

  const handleAnalyze = async () => {
    if (appState === 'analyzing' || !hasResume || !hasJD) return
    console.log('KEY:', import.meta.env.VITE_GEMINI_API_KEY)
    setError('')
    setAppState('analyzing')
    try {
      const { analysis, skills, edges } = await analyzeSkills(resumeFile, jdText)

      // ── Debug logs — check F12 Console ──
      console.log('✅ MATCH SCORE:', analysis.match_score)
      console.log('✅ LEARNING PATH:', analysis.learning_path)
      console.log('✅ MISSING SKILLS:', analysis.missing_skills)
      console.log('✅ MATCHING SKILLS:', analysis.matching_skills)
      console.log('✅ SKILLS GRAPH:', skills)

      setAnalysis(analysis)
      setSkillGraph({ skills, edges })
      setAppState('active')
    } catch (err) {
      console.error('❌ ERROR:', err)
      setError(err.message || 'Analysis failed. Please try again.')
      setAppState('idle')
    }
  }

  // ── Show AnalyzePanel only on /app route ──
  if (appState === 'active' && (currentPath === '/app' || currentPath === '/')) {
    return <AnalyzePanel />
  }

  // ── Minimal nav on sub-routes /gaps /path ──
  if (appState === 'active') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-10 right-10 z-50 flex gap-4 pointer-events-auto"
      >
        <button
          onClick={() => { resetToIdle(); navigate('/') }}
          style={{ cursor: 'pointer' }}
          className="glass-panel px-5 py-3 flex items-center gap-2 hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-white/60" />
          <span className="text-sm font-sans font-bold text-white/60">Back to Start</span>
        </button>
        <button
          onClick={() => handleNavigationTransition('/app')}
          style={{ cursor: 'pointer' }}
          className="glass-panel px-6 py-3 flex items-center gap-3 hover:bg-[#8a2be2]/10 hover:border-[#8a2be2]/50 transition-all"
        >
          <Zap className="w-4 h-4 text-[#B39DDB]" />
          <span className="text-sm font-sans font-bold text-white">Diagnostics</span>
        </button>
        <button
          onClick={() => handleNavigationTransition(currentPath === '/gaps' ? '/path' : '/gaps')}
          style={{ cursor: 'pointer' }}
          className={`glass-panel px-6 py-3 flex items-center gap-3 transition-all ${currentPath === '/gaps' ? 'hover:bg-[#00E5FF]/10 hover:border-[#00E5FF]/50' : 'hover:bg-[#E63B2E]/10 hover:border-[#E63B2E]/50'}`}
        >
          {currentPath === '/gaps' ? (
            <><Navigation className="w-4 h-4 text-[#00E5FF]" /><span className="text-sm font-sans font-bold text-white">Learning Path</span></>
          ) : (
            <><ScanEye className="w-4 h-4 text-[#E63B2E]" /><span className="text-sm font-sans font-bold text-white">Skill Gaps</span></>
          )}
        </button>
      </motion.div>
    )
  }

  // ── Idle — Upload & Analyze panel ──
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="glass-panel p-8 w-[32rem] flex flex-col gap-6 pointer-events-auto border-l-4 border-l-[#00E5FF] shadow-[0_0_40px_rgba(0,229,255,0.1)] absolute top-24 left-10"
    >
      <div>
        <h2 className="text-3xl font-sans font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#B39DDB] tracking-tight">
          Skill Intelligence
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse"></div>
          <p className="text-sm font-mono tracking-widest uppercase text-[#00E5FF]">System Analysis Pipeline</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          style={{ position: 'fixed', top: '-9999px', left: '-9999px', opacity: 0 }}
        />

        {!hasResume ? (
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={handleUploadClick}
            style={{ cursor: 'pointer' }}
            className={`glass-pill px-6 py-5 flex flex-col items-center justify-center gap-2 border-2 border-dashed transition-all select-none ${dragOver ? 'border-[#00E5FF] bg-[#00E5FF]/10 scale-[1.02]' : 'border-white/20 hover:border-white/40 hover:bg-white/5'}`}
          >
            <FileUp className="w-6 h-6 text-white/50" />
            <span className="font-sans font-semibold text-white/70 text-sm">
              Drop resume here or <span className="text-[#00E5FF] underline">click to browse</span>
            </span>
            <span className="text-xs font-mono text-white/30">PDF · DOCX · TXT</span>
          </div>
        ) : (
          <div className="glass-pill px-6 py-4 flex items-center justify-between border-[#8a2be2]/50 bg-[#8a2be2]/10 shadow-[0_0_15px_rgba(138,43,226,0.1)]">
            <div className="flex items-center gap-3 min-w-0">
              <FileUp className="w-5 h-5 shrink-0 text-[#8a2be2]" />
              <span className="font-sans font-semibold text-white text-sm truncate">{resumeFile.name}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono text-[#8a2be2] uppercase">Ready</span>
              <button onClick={() => setResumeFile(null)} style={{ cursor: 'pointer' }} className="text-white/40 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowJDInput(v => !v)}
          style={{ cursor: 'pointer' }}
          className={`group relative overflow-hidden glass-pill px-6 py-4 flex items-center justify-between transition-all hover:scale-[1.02] active:scale-95 ${hasJD ? 'border-[#8a2be2]/50 bg-[#8a2be2]/10 shadow-[0_0_15px_rgba(138,43,226,0.1)]' : ''}`}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
          <div className="flex items-center gap-3">
            <FileText className={`w-5 h-5 ${hasJD ? 'text-[#8a2be2]' : 'text-white/60'}`} />
            <span className={`font-sans font-semibold text-lg ${hasJD ? 'text-white' : 'text-white/80'}`}>
              {hasJD ? 'JD Added ✓' : 'Paste Job Description'}
            </span>
          </div>
          {hasJD && <span className="text-xs font-mono text-[#8a2be2] uppercase">Ready</span>}
        </button>

        {showJDInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={6}
              style={{ cursor: 'text' }}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white/80 text-sm font-sans placeholder:text-white/20 resize-none outline-none focus:border-[#00E5FF]/50 transition-colors leading-relaxed"
            />
          </motion.div>
        )}
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

      {error && (
        <div className="bg-[#E63B2E]/10 border border-[#E63B2E]/30 rounded-xl px-4 py-3 text-sm text-[#E63B2E] font-sans">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <p className="text-xs font-mono text-white/30 tracking-widest uppercase">Operation Mode</p>
        <button
          onClick={handleAnalyze}
          disabled={!hasResume || !hasJD || appState === 'analyzing'}
          style={{ cursor: hasResume && hasJD ? 'pointer' : 'not-allowed' }}
          className={`group relative overflow-hidden rounded-xl border px-6 py-5 flex items-center justify-between transition-all ${hasResume && hasJD && appState !== 'analyzing' ? 'bg-[#00E5FF]/15 border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:bg-[#00E5FF]/25 hover:scale-[1.02] active:scale-95' : 'bg-black/40 border-white/10 opacity-40'}`}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-[#00E5FF]/0 via-[#00E5FF]/15 to-[#00E5FF]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
          <div className="flex items-center gap-3">
            <Zap className={`w-6 h-6 text-white ${appState === 'analyzing' ? 'animate-pulse' : ''}`} />
            <span className="font-sans font-bold text-xl text-white">
              {appState === 'analyzing' ? 'Analyzing...' : 'Analyze Architecture'}
            </span>
          </div>
          {appState === 'analyzing' && (
            <div className="w-5 h-5 border-2 border-white/20 border-t-[#00E5FF] rounded-full animate-spin"></div>
          )}
        </button>
      </div>
    </motion.div>
  )
}