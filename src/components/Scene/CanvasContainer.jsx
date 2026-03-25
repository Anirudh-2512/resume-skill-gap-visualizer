import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Preload, BakeShadows } from '@react-three/drei'
import EnvironmentSettings from './Environment.jsx'
import SkillGraph from './SkillGraph.jsx'
import CameraController from './CameraController.jsx'

export default function CanvasContainer({ eventSource }) {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        eventSource={eventSource}
        eventPrefix="client"
        camera={{ position: [0, 0, 15], fov: 45 }}
        dpr={window.devicePixelRatio > 1 ? [1, 2] : 1}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#050505']} />
        
        <Suspense fallback={null}>
          <CameraController />
          <EnvironmentSettings />
          <SkillGraph />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  )
}
