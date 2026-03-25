import React from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../../store/useStore'
import { Target, ShieldAlert, Sparkles, Navigation, ScanEye, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AnalyzePanel() {
  const skills = useStore(state => state.skills)
  const analysis = useStore(state => state.analysis)
  const resetToIdle = useStore(state => state.resetToIdle)
  const setCurrentRoute = useStore(state => state.setCurrentRoute)
  const setIsTransitioning = useStore(state => state.setIsTransitioning)
  const navigate = useNavigate()

  // ── Stats directly from Gemini analysis ──
  const total = (analysis?.resume_skills?.length ?? 0) + (analysis?.missing_skills?.length ?? 0)
  const matched = analysis?.matching_skills?.length ?? 0
  const missing = analysis?.missing_skills?.length ?? 0
  const score = analysis?.match_score ?? 0

  // ── Skills from store (built by buildGraphData) ──
  const knownSkills = skills.filter(s => s.known)
  const missingSkills = skills.filter(s => !s.known)
  const coreSkills = knownSkills.slice(0, 4)
  const intermediateSkills = knownSkills.slice(4)

  const highPriority = analysis?.missing_skills?.filter(s => s.priority === 'high') ?? []
  const medPriority = analysis?.missing_skills?.filter(s => s.priority === 'medium') ?? []

  const handleNavigationTransition = (path) => {
    setIsTransitioning(true)
    setCurrentRoute(path)
    setTimeout(() => navigate(path), 500)
    setTimeout(() => setIsTransitioning(false), 1500)
  }

  return (
    <div className="absolute inset-0 pointer-events-none p-10 flex justify-between gap-6 h-full z-20 overflow-hidden">

      {/* LEFT COLUMN */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-[28rem] flex flex-col gap-5 h-full pb-8 pointer-events-auto"
      >
        {/* Back button */}
        <button
          onClick={() => { resetToIdle(); navigate('/') }}
          style={{ cursor: 'pointer' }}
          className="w-fit glass-pill px-5 py-2.5 flex items-center gap-2 hover:bg-white/10 hover:border-white/30 transition-all text-white/50 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold font-sans tracking-widest uppercase">Back to Start</span>
        </button>

        {/* Header Panel */}
        <div className="glass-panel p-7 border-l-4 border-[#00E5FF] shadow-[0_0_30px_rgba(0,229,255,0.1)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/5 to-transparent z-[-1]" />
          <p className="text-xs font-mono tracking-widest text-[#00E5FF] uppercase mb-3">Skill Architecture Analysis</p>
          <h2 className="text-4xl font-sans font-bold text-white tracking-tight leading-none mb-1">Skill Architecture is the</h2>
          <h2 className="text-5xl font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-white to-[#B39DDB]">System.</h2>
          <p className="text-white/50 text-sm mt-3 leading-relaxed">
            Understand how your capabilities are structured, connected, and aligned with your target role.
          </p>
          {/* Stats — from Gemini directly */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-black/50 p-4 rounded-xl border border-white/5 flex flex-col items-center">
              <div className="text-3xl font-mono text-white mb-1">{analysis?.job_skills?.length ?? 0}</div>
              <div className="text-[9px] text-white/40 uppercase tracking-widest text-center">JD Skills</div>
            </div>
            <div className="bg-black/50 p-4 rounded-xl border border-[#B39DDB]/30 flex flex-col items-center">
              <div className="text-3xl font-mono text-[#B39DDB] mb-1">{matched}</div>
              <div className="text-[9px] text-[#B39DDB]/60 uppercase tracking-widest text-center">Matched</div>
            </div>
            <div className="bg-black/50 p-4 rounded-xl border border-[#E63B2E]/30 flex flex-col items-center">
              <div className="text-3xl font-mono text-[#E63B2E] mb-1">{missing}</div>
              <div className="text-[9px] text-[#E63B2E]/60 uppercase tracking-widest text-center">Missing</div>
            </div>
          </div>
        </div>

        {/* Match Analysis — score from Gemini */}
        <div className="glass-panel p-7">
          <div className="flex justify-between items-end mb-4">
            <h3 className="font-sans font-bold text-xl text-white">Match Analysis</h3>
            <span className="text-3xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8a2be2] to-[#00E5FF]">{score}%</span>
          </div>
          <div className="w-full bg-[#050505] border border-white/10 h-3 rounded-full overflow-hidden mb-6">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1.5, delay: 0.3, ease: 'circOut' }}
              className="h-full bg-gradient-to-r from-[#8a2be2] to-[#00E5FF] shadow-[0_0_10px_#00E5FF]"
            />
          </div>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center p-3 rounded-xl bg-black/40 border border-[#8a2be2]/20">
              <span className="text-[#B39DDB] flex items-center gap-3"><Target className="w-4 h-4" /> Matched Skills</span>
              <span className="text-white font-bold">{matched} skills</span>
            </div>
            {highPriority.length > 0 && (
              <div className="flex justify-between items-center p-3 rounded-xl bg-black/40 border border-[#E63B2E]/20">
                <span className="text-[#E63B2E] flex items-center gap-3"><ShieldAlert className="w-4 h-4" /> High Priority Gaps</span>
                <span className="text-white font-bold">{highPriority.length} critical</span>
              </div>
            )}
            {medPriority.length > 0 && (
              <div className="flex justify-between items-center p-3 rounded-xl bg-black/40 border border-yellow-600/20">
                <span className="text-yellow-400 flex items-center gap-3"><ShieldAlert className="w-4 h-4" /> Medium Priority</span>
                <span className="text-white font-bold">{medPriority.length} skills</span>
              </div>
            )}
          </div>
        </div>

        {/* AI Insight */}
        <div className="glass-panel p-7 border border-[#7B61FF]/40 bg-[#7B61FF]/5 relative overflow-hidden group shadow-[0_0_20px_rgba(123,97,255,0.1)] mt-auto">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#7B61FF]/10 blur-[50px] rounded-full group-hover:bg-[#7B61FF]/20 transition-all duration-700"></div>
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-5 h-5 text-[#7B61FF]" />
            <span className="font-sans font-bold text-lg text-white">AI Insight</span>
          </div>
          <p className="text-sm font-sans text-white/70 leading-relaxed italic border-l-2 border-[#7B61FF]/50 pl-4 py-1">
            "{analysis?.summary ?? 'Run an analysis to generate an intelligent summary.'}"
          </p>
        </div>
      </motion.div>

      {/* RIGHT COLUMN */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
        className="w-[26rem] flex flex-col gap-5 h-full pb-8 pointer-events-auto"
      >
        {/* Nav buttons */}
        <div className="glass-panel p-4 flex gap-3">
          <button
            onClick={() => handleNavigationTransition('/gaps')}
            style={{ cursor: 'pointer' }}
            className="flex-1 glass-pill py-3 flex items-center justify-center gap-2 hover:bg-[#E63B2E]/20 hover:border-[#E63B2E]/50 transition-all"
          >
            <ScanEye className="w-4 h-4 text-[#E63B2E]" />
            <span className="text-xs font-bold font-sans text-white">Skill Gaps</span>
          </button>
          <button
            onClick={() => handleNavigationTransition('/path')}
            style={{ cursor: 'pointer' }}
            className="flex-1 glass-pill py-3 flex items-center justify-center gap-2 hover:bg-[#00E5FF]/20 hover:border-[#00E5FF]/50 transition-all"
          >
            <Navigation className="w-4 h-4 text-[#00E5FF]" />
            <span className="text-xs font-bold font-sans text-white">Learning Path</span>
          </button>
        </div>

        {/* Skill Taxonomy */}
        <div className="glass-panel p-7 border-r-4 border-[#8a2be2]">
          <h3 className="font-sans font-bold text-xl text-white mb-5">Skill Taxonomy</h3>
          <div className="flex flex-col gap-5">
            {coreSkills.length > 0 && (
              <div>
                <h4 className="text-[9px] font-mono tracking-widest text-[#B39DDB] mb-2 uppercase">Your Matching Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {coreSkills.map(s => (
                    <span key={s.id} className="text-xs font-sans px-3 py-1.5 bg-[#8a2be2]/10 border border-[#8a2be2]/30 rounded-lg text-white">{s.label}</span>
                  ))}
                </div>
              </div>
            )}
            {intermediateSkills.length > 0 && (
              <div>
                <h4 className="text-[9px] font-mono tracking-widest text-white/30 mb-2 uppercase">More Matching Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {intermediateSkills.map(s => (
                    <span key={s.id} className="text-xs font-sans px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/60">{s.label}</span>
                  ))}
                </div>
              </div>
            )}
            {missingSkills.length > 0 && (
              <div>
                <h4 className="text-[9px] font-mono tracking-widest text-[#E63B2E]/70 mb-2 uppercase">Skills to Acquire</h4>
                <div className="flex flex-wrap gap-2">
                  {missingSkills.map(s => {
                    const meta = analysis?.missing_skills?.find(m => m.name === s.label)
                    const color = meta?.priority === 'high' ? '#E63B2E' : meta?.priority === 'medium' ? '#F59E0B' : '#6B7280'
                    return (
                      <span key={s.id} style={{ borderColor: `${color}50`, color }} className="text-xs font-sans px-3 py-1.5 bg-black/40 border rounded-lg">{s.label}</span>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Learning Path Steps — from Gemini in correct order */}
        <div className="glass-panel p-7 overflow-y-auto" style={{ maxHeight: '22rem' }}>
          <h3 className="font-sans font-bold text-xl text-white mb-5">Learning Path</h3>
          <div className="flex flex-col gap-3">
            {(analysis?.learning_path ?? []).map((step, i) => (
              <div key={i} className="flex gap-4 bg-black/50 p-4 rounded-2xl border border-white/5">
                <div className="w-8 h-8 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center shrink-0">
                  <span className="text-xs font-mono font-bold text-[#00E5FF]">{step.step}</span>
                </div>
                <div>
                  <p className="text-sm font-sans font-bold text-white mb-1">{step.skill}</p>
                  <p className="text-xs font-sans text-white/50 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
            {(!analysis?.learning_path || analysis.learning_path.length === 0) && (
              <p className="text-xs font-mono text-white/30 text-center py-4">Run analysis to generate learning path</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}