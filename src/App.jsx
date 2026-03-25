import React, { useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import CanvasContainer from './components/Scene/CanvasContainer.jsx'
import ControlPanel from './components/UI/ControlPanel.jsx'
import InsightPanel from './components/UI/InsightPanel.jsx'
import CustomCursor from './components/UI/CustomCursor.jsx'
import { useStore } from './store/useStore'

function RouteSync() {
  const location = useLocation()
  const setCurrentRoute = useStore(state => state.setCurrentRoute)
  
  useEffect(() => {
    setCurrentRoute(location.pathname)
  }, [location, setCurrentRoute])
  
  return null
}

function App() {
  const scrollRef = useRef()

  return (
    <BrowserRouter>
      {/* RouteSync tracks current location for 3D state */}
      <RouteSync />
      
      <div 
        ref={scrollRef}
        className="w-screen h-screen overflow-hidden relative bg-[#050505] text-white selection:bg-[#00E5FF] selection:text-black"
      >
        {/* Fixed 3D Canvas Layer */}
        <div className="absolute inset-0 pointer-events-none z-[0]">
          <CanvasContainer eventSource={scrollRef} />
        </div>
        
        {/* HTML Route Layers (Dashboard Mode) */}
        <div className="absolute inset-0 pointer-events-none z-[10] p-8 flex flex-col justify-between h-[100dvh] overflow-hidden">
          <header className="flex justify-between items-center glass-pill px-6 py-3 w-max pointer-events-auto border-[#00E5FF]/20 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse shadow-[0_0_10px_#00E5FF]"></div>
              <h1 className="text-sm font-mono tracking-widest uppercase text-white/90">
                Skill Intelligence <span className="text-[#00E5FF]/60 ml-2">v3.0</span>
              </h1>
            </div>
          </header>

          <Routes>
            <Route path="*" element={<ControlPanel />} />
          </Routes>
          
          <InsightPanel />
        </div>

        <CustomCursor />
      </div>
    </BrowserRouter>
  )
}

export default App
