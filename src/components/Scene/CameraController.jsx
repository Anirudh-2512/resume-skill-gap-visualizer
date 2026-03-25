import React, { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { useStore } from '../../store/useStore'

export default function CameraController() {
  const { camera } = useThree()
  const currentRoute = useStore(state => state.currentRoute)

  useEffect(() => {
    // Default: Analyze Architecture
    let target = { x: 0, y: 0, z: 15 }
    
    if (currentRoute === '/gaps') {
      target = { x: 0, y: 0, z: 8 } // Dolly forward to focus on gaps
    } else if (currentRoute === '/path') {
      target = { x: 0, y: -2, z: 2 } // Deep dive and follow path forward
    }

    gsap.to(camera.position, {
      x: target.x,
      y: target.y,
      z: target.z,
      duration: 1.2,
      ease: 'power3.inOut'
    })
  }, [currentRoute, camera])

  return null
}
