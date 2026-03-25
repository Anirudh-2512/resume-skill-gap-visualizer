import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../store/useStore'
import { X, Target, ShieldAlert } from 'lucide-react'

export default function InsightPanel() {
  const selectedSkill = useStore(state => state.selectedSkill)
  const setSelectedSkill = useStore(state => state.setSelectedSkill)

  return (
    <AnimatePresence>
      {selectedSkill && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute right-6 top-6 bottom-6 w-96 glass-panel p-6 flex flex-col pointer-events-auto overflow-y-auto cursor-none"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${selectedSkill.known ? 'bg-[#8a2be2]' : 'bg-[#00E5FF] animate-pulse'}`}></div>
                <span className="text-xs font-mono uppercase tracking-widest text-white/50">Node Metadata</span>
              </div>
              <h2 className={`text-2xl font-bold font-sans tracking-tight ${selectedSkill.known ? 'text-white' : 'text-[#00E5FF]'}`}>
                {selectedSkill.label}
              </h2>
            </div>
            <button onClick={() => setSelectedSkill(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-none">
              <X className="w-5 h-5 text-white/50" />
            </button>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-6">
            <div className="glass-pill bg-black/40 p-4 border-none">
              <span className="text-xs font-mono text-white/40 block mb-1">CLUSTER</span>
              <span className="text-sm font-sans uppercase tracking-widest text-white/90">{selectedSkill.group}</span>
            </div>

            {selectedSkill.known ? (
              <div className="glass-pill bg-[#8a2be2]/10 border-[#8a2be2]/30 p-4">
                <div className="flex items-center gap-2 text-[#B39DDB] mb-2">
                  <Target className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Verified Trait</span>
                </div>
                <p className="text-sm text-white/70">This skill architecture has been verified from the uploaded profile databanks.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="glass-pill bg-[#00E5FF]/10 border-[#00E5FF]/30 p-4">
                  <div className="flex items-center gap-2 text-[#00E5FF] mb-2">
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Missing Dependency</span>
                  </div>
                  <p className="text-sm text-[#00E5FF]/80">{selectedSkill.gapReason}</p>
                </div>
                
                <div className="border border-white/10 p-4 rounded-xl">
                  <span className="text-xs font-mono text-white/40 block mb-2">RECOMMENDED INITIATIVE</span>
                  <p className="text-sm text-white/90 font-medium">{selectedSkill.nextStep}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
