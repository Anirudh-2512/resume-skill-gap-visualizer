import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../../store/useStore'

export default function CustomCursor() {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 })
  const selectedSkill = useStore(state => state.selectedSkill)
  
  // Custom cursor needs an interactive check to see if hovering over clickable items
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    document.body.style.cursor = 'none'
    
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    
    const handleMouseOver = (e) => {
      if(e.target.tagName.toLowerCase() === 'button' || e.target.tagName.toLowerCase() === 'div' && e.target.classList.contains('cursor-none')) {
        setIsHovering(true)
      } else {
        setIsHovering(false)
      }
    }

    const handleMouseOut = () => setIsHovering(false)

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
    }
  }, [])

  return (
    <motion.div 
      className="fixed top-0 left-0 w-8 h-8 rounded-full border border-[#00E5FF]/80 pointer-events-none z-[99999] flex items-center justify-center mix-blend-screen shadow-[0_0_10px_#00E5FF]"
      animate={{ 
        x: mousePos.x - 16, 
        y: mousePos.y - 16,
        scale: isHovering || selectedSkill ? 1.5 : 1,
        opacity: mousePos.x < 0 ? 0 : 1
      }}
      transition={{ type: "spring", stiffness: 700, damping: 40, mass: 0.2 }}
    >
      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
    </motion.div>
  )
}
