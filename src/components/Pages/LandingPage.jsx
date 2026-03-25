// src/components/Pages/LandingPage.jsx
import React, { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Activity, LayoutDashboard, BrainCircuit, ScanSearch, Workflow, Command } from 'lucide-react'
import { useStore } from '../../store/useStore'

export default function LandingPage() {
  const navigate = useNavigate()
  const setAppState = useStore(state => state.setAppState)
  const setCurrentRoute = useStore(state => state.setCurrentRoute)
  const setIsTransitioning = useStore(state => state.setIsTransitioning)
  
  const heroRef = useRef(null)
  
  useEffect(() => {
    // Notify 3D camera we are on landing page mode
    setCurrentRoute('/')

    // Hero GSAP staggered entry animations
    const ctx = gsap.context(() => {
      gsap.from('.hero-text', {
        y: 40,
        opacity: 0,
        stagger: 0.08,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.2
      })
      gsap.from('.hero-btn', {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.8
      })
    }, heroRef)
    return () => ctx.revert()
  }, [setCurrentRoute])

  const startAnalysis = () => {
    // Navigate into the control dashboard explicitly
    setIsTransitioning(true)
    setTimeout(() => {
      navigate('/app') // Our new control plane route
    }, 400)
    
    setTimeout(() => {
      setIsTransitioning(false)
    }, 1200)
  }

  // Smooth UI scrolls mapped to viewport
  const { scrollY } = useScroll()
  const navBg = useTransform(scrollY, [0, 100], ['rgba(10,10,20,0)', 'rgba(10,10,20,0.8)'])
  const navBorder = useTransform(scrollY, [0, 100], ['1px solid rgba(123,97,255,0)', '1px solid rgba(123,97,255,0.15)'])
  const navBlur = useTransform(scrollY, [0, 100], ['blur(0px)', 'blur(24px)'])

  // Philosophy text split
  const manifesto = "We focus on dynamic skill architecture."

  return (
    <div className="w-full pointer-events-auto selection:bg-[#7B61FF] selection:text-white">
      
      {/* FLOATING ISLAND NAVBAR */}
      <motion.nav 
        style={{ background: navBg, backdropFilter: navBlur, borderBottom: navBorder }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center py-6 transition-all duration-300 pointer-events-auto"
      >
        <div className="glass-pill px-8 py-3 flex items-center gap-12 max-w-5xl w-[#90%] justify-between mx-auto bg-transparent">
          <div className="flex items-center gap-2">
            <Command className="w-5 h-5 text-[#7B61FF]" />
            <span className="font-sans font-extrabold tracking-tight text-[#F0EFF4] text-lg">Skill Intelligence</span>
          </div>
          
          <div className="flex items-center gap-8 text-sm font-sans text-[#F0EFF4]/70">
            <Link to="/app" className="hover:text-white transition-colors cursor-none">Analysis</Link>
            <Link to="/app/gaps" className="hover:text-white transition-colors cursor-none">Gaps</Link>
            <Link to="/app/path" className="hover:text-white transition-colors cursor-none">Path</Link>
          </div>

          <button onClick={startAnalysis} className="bg-[#7B61FF]/20 border border-[#7B61FF]/50 text-white px-6 py-2.5 rounded-full text-sm font-sans font-bold hover:bg-[#7B61FF] hover:scale-105 transition-all shadow-[0_0_20px_rgba(123,97,255,0.2)] cursor-none">
            Start Analysis
          </button>
        </div>
      </motion.nav>

      {/* HERO SECTION */}
      <section ref={heroRef} className="min-h-[100dvh] flex flex-col justify-end p-12 lg:p-24 pb-32 relative">
        <div className="absolute inset-0 z-[-1] pointer-events-none bg-gradient-to-t from-[#0A0A14] via-transparent to-transparent"></div>
        <div className="max-w-5xl mx-auto w-full z-10">
          <h1 className="hero-text text-5xl md:text-6xl font-sans font-bold text-white tracking-tight mb-2">
            Skill Architecture is the
          </h1>
          <h1 className="hero-text text-8xl md:text-[8rem] font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F0EFF4] to-[#7B61FF] pb-4 -ml-2">
            System.
          </h1>
          <p className="hero-text text-xl md:text-2xl font-sans text-[#F0EFF4]/70 max-w-2xl mt-6 mb-12 leading-relaxed">
            Understand how your capabilities are structured, connected, and evolving within the spatial intelligence matrix.
          </p>
          <button onClick={startAnalysis} className="hero-btn group relative overflow-hidden glass-pill px-10 py-5 flex items-center gap-3 transition-all hover:scale-[1.03] active:scale-95 border-[#7B61FF]/50 bg-[#7B61FF]/20 shadow-[0_0_40px_rgba(123,97,255,0.2)] cursor-none">
             <span className="absolute inset-0 bg-gradient-to-r from-[#7B61FF]/0 via-[#7B61FF]/20 to-[#7B61FF]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
             <span className="font-sans font-bold text-lg text-white">Analyze Now</span>
             <ScanSearch className="w-5 h-5 text-[#7B61FF] group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </section>

      {/* INTERACTIVE GAP WINDOW (Exposes 3D Canvas) */}
      <section className="h-[90vh] flex flex-col items-center justify-end pointer-events-none p-12 lg:p-24 pb-32">
         {/* The immersive 3D architecture functions natively here as the background */}
         <div className="glass-panel px-6 py-3 flex gap-3 items-center mix-blend-screen bg-[#0A0A14]/50 border-white/5">
           <div className="w-2.5 h-2.5 rounded-full bg-[#7B61FF] animate-pulse"></div>
           <span className="text-xs font-mono uppercase tracking-widest text-white/50">Interactive WebGL Sub-layer Access</span>
         </div>
      </section>

      {/* INSIGHT CARDS */}
      <section className="min-h-screen py-32 px-12 lg:px-24 bg-[#0A0A14] relative z-20 shadow-[0_-80px_100px_rgba(10,10,20,1)] border-t border-white/5">
        <div className="max-w-6xl mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <h2 className="text-5xl font-sans font-bold text-white mb-6">Functional Micro Interfaces</h2>
            <p className="text-[#F0EFF4]/70 font-sans text-xl max-w-xl">Intelligent nodes synthesizing your structural data into actionable vectors.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0 }}
              className="glass-panel p-10 bg-[#0A0A14]/80 flex flex-col h-[28rem] relative overflow-hidden group hover:border-[#7B61FF]/40 transition-colors duration-500"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#7B61FF]/10 blur-[60px] rounded-full group-hover:bg-[#7B61FF]/20 transition-all duration-700"></div>
              <Activity className="w-10 h-10 text-[#7B61FF] mb-8" />
              <h3 className="text-2xl font-sans font-bold text-white mb-4">Core Strengths</h3>
              <p className="text-base text-white/50 mb-auto leading-relaxed">Tracking high-density skill clusters anchored securely in your neural architecture.</p>
              
              <div className="mt-8 bg-black/40 p-5 rounded-2xl border border-white/5">
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: '92%' }} transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }} className="h-full bg-gradient-to-r from-[#7B61FF] to-[#00E5FF]"></motion.div>
                </div>
                <div className="flex justify-between mt-4 text-xs font-mono text-white/40"><span className="text-[#00E5FF]">Frontend Systems</span><span className="text-white/80 font-bold">92% SYNCLINE</span></div>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="glass-panel p-10 bg-[#0A0A14]/80 flex flex-col h-[28rem] relative overflow-hidden group hover:border-[#00E5FF]/40 transition-colors duration-500"
            >
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#00E5FF]/10 blur-[60px] rounded-full group-hover:bg-[#00E5FF]/20 transition-all duration-700"></div>
              <Workflow className="w-10 h-10 text-[#00E5FF] mb-8" />
              <h3 className="text-2xl font-sans font-bold text-white mb-4">Adjacent Capabilities</h3>
              <p className="text-base text-white/50 mb-auto leading-relaxed">Identifying low-friction trajectory learning pathways based on existing node proximity.</p>
              
              <div className="flex flex-col gap-3 mt-8">
                 <div className="bg-black/40 border border-white/5 py-3 px-4 rounded-xl flex justify-between items-center text-sm font-mono"><span className="text-white">GraphQL</span><span className="text-white/40 text-xs bg-white/5 px-2 py-1 rounded">+1 NODE</span></div>
                 <div className="bg-black/40 border border-white/5 py-3 px-4 rounded-xl flex justify-between items-center text-sm font-mono"><span className="text-white">Three.js</span><span className="text-white/40 text-xs bg-white/5 px-2 py-1 rounded">+2 NODES</span></div>
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="glass-panel p-10 bg-[#0A0A14]/80 flex flex-col h-[28rem] relative overflow-hidden group border-[#E63B2E]/20 hover:border-[#E63B2E]/40 transition-colors duration-500"
            >
              <div className="absolute top-1/2 left-1/2 -content z-[-1] w-56 h-56 bg-[#E63B2E]/10 blur-[60px] rounded-full group-hover:bg-[#E63B2E]/20 transition-all -translate-x-1/2 -translate-y-1/2 duration-700"></div>
              <BrainCircuit className="w-10 h-10 text-[#E63B2E] mb-8" />
              <h3 className="text-2xl font-sans font-bold text-white mb-4">Hidden Dependencies</h3>
              <p className="text-base text-white/50 mb-auto leading-relaxed">Critical prerequisites mapped against your target operational profile structure.</p>
              
              <div className="mt-8 flex items-center justify-center gap-3 bg-black/40 py-6 rounded-2xl border border-white/5">
                 <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-xs text-white/40 font-mono">S1</div>
                 <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-[#E63B2E]/50 relative"><div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#E63B2E] rounded-full shadow-[0_0_10px_#E63B2E] animate-ping"></div></div>
                 <div className="w-10 h-10 rounded-full border border-[#E63B2E]/50 bg-[#E63B2E]/10 text-[#E63B2E] font-bold flex items-center justify-center text-sm font-mono shadow-[0_0_15px_rgba(230,59,46,0.2)]">S2</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY MANIFESTO */}
      <section className="min-h-[80vh] flex flex-col justify-center items-center py-40 px-12 relative z-20 overflow-hidden bg-black/60 border-y border-white/5">
        <div className="absolute inset-0 z-[-1] opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(123,97,255,0.15) 0%, transparent 60%)' }}></div>
        <div className="max-w-5xl mx-auto text-center">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-2xl md:text-3xl font-sans text-white/40 mb-16 tracking-wide"
          >
            Most platforms focus on resumes as static lists.
          </motion.p>
          <h2 className="text-6xl md:text-8xl lg:text-[7rem] font-serif italic text-white leading-[1.1]">
            We focus on <br/>
            {manifesto.split(' ').map((word, i) => (
              <motion.span 
                key={i}
                initial={{ opacity: 0, scale: 0.9, y: 40, filter: 'blur(10px)' }}
                whileInView={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.15 * i, ease: "back.out(1.2)" }}
                className={word.includes('dynamic') ? 'text-[#7B61FF]' : 'text-[#F0EFF4]'}
                style={{ display: 'inline-block', marginRight: word.includes('.') ? 0 : '0.25em' }}
              >
                {word}
              </motion.span>
            ))}
          </h2>
        </div>
      </section>

      {/* PROTOCOL */}
      <section className="py-40 px-12 lg:px-24 bg-[#0A0A14] relative z-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-6 mb-24 section-header">
            <h2 className="text-5xl font-sans font-bold text-white tracking-tight">System Layers</h2>
            <div className="h-px bg-white/10 flex-1"></div>
            <span className="text-sm font-mono text-[#7B61FF] tracking-widest uppercase border border-[#7B61FF]/30 px-3 py-1 rounded-full bg-[#7B61FF]/10">Protocol v3</span>
          </div>

          <div className="space-y-8">
            {['Extract - Parse resume into structured neural skills', 'Map - Construct geometric logic against requirement matrices', 'Visualize - Build and display reactive physical architecture'].map((layer, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="glass-panel p-10 lg:p-12 bg-gradient-to-r from-white/[0.02] to-transparent border-l-4 border-l-[#7B61FF]/50 hover:border-l-[#7B61FF] hover:bg-white/[0.04] transition-all duration-500 rounded-2xl"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
                  <div className="text-7xl lg:text-8xl font-serif italic text-white/5 leading-none">0{i+1}</div>
                  <div>
                    <h4 className="text-3xl font-sans font-bold text-white mb-3">{layer.split('-')[0].trim()}</h4>
                    <p className="font-sans text-[#F0EFF4]/60 text-lg leading-relaxed">{layer.split('-')[1].trim()}.</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-48 px-12 flex flex-col items-center justify-center text-center bg-[#0A0A14] relative z-20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#7B61FF]/10 blur-[120px] rounded-full pointer-events-none z-[-1]"></div>
        <h2 className="text-6xl md:text-8xl font-sans font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-[#7B61FF]/30 mb-16 tracking-tighter">
          Understand Your System.
        </h2>
        <button onClick={startAnalysis} className="group relative overflow-hidden glass-pill px-14 py-8 flex items-center gap-5 transition-all hover:scale-[1.04] active:scale-95 border-[#7B61FF]/70 bg-[#7B61FF]/15 shadow-[0_0_60px_rgba(123,97,255,0.25)] pointer-events-auto cursor-none">
          <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
          <span className="font-sans font-extrabold text-2xl text-white tracking-wide">Initiate Analysis</span>
          <LayoutDashboard className="w-7 h-7 text-[#00E5FF] group-hover:-translate-y-1 group-hover:scale-110 transition-transform duration-300" />
        </button>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#05050A] rounded-t-[4rem] px-12 py-20 relative z-20 border-t border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col gap-3 items-center md:items-start text-center md:text-left">
            <h3 className="text-2xl font-sans font-extrabold text-white tracking-tight">Skill Intelligence</h3>
            <span className="text-base font-sans text-white/40">Neural skill mapping and onboarding analysis algorithms.</span>
          </div>
          <div className="glass-pill px-8 py-4 border-none bg-white/5 flex items-center gap-4 shadow-inner">
             <div className="w-3 h-3 rounded-full bg-[#39FF14] animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_10px_#39FF14]"></div>
             <span className="font-mono text-sm text-white/80 tracking-widest uppercase">System Operational</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
