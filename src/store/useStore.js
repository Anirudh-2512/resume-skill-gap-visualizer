import { create } from 'zustand'

export const useStore = create((set) => ({
  appState: 'idle',
  currentRoute: '/',
  isTransitioning: false,
  selectedSkill: null,
  analysis: null,

  setAppState: (state) => set({ appState: state }),
  setCurrentRoute: (route) => set({ currentRoute: route }),
  setIsTransitioning: (status) => set({ isTransitioning: status }),
  setSelectedSkill: (skill) => set({ selectedSkill: skill }),
  setAnalysis: (analysis) => set({ analysis }),

  resetToIdle: () => set({
    appState: 'idle',
    selectedSkill: null,
    analysis: null,
    currentRoute: '/',
    skills: [],
    edges: [],
  }),

  skills: [],
  edges: [],
  setSkillGraph: ({ skills, edges }) => set({ skills, edges }),
}))