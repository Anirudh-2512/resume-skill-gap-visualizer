import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

export default function EnvironmentSettings() {
  return (
    <>
      <ambientLight intensity={1.5} color="#2A1B4D" />
      <directionalLight position={[10, 10, 5]} intensity={2} color="#00E5FF" />
      <directionalLight position={[-10, -10, -5]} intensity={1} color="#8a2be2" />
      <pointLight position={[0, 0, 5]} intensity={1.5} color="#B39DDB" distance={20} />
      <ParticleField />
    </>
  )
}

function ParticleField() {
  const ref = useRef()
  const count = 1500
  
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
        // Random points in sphere manually for volumetric dust feel
        const r = 30 * Math.cbrt(Math.random())
        const theta = Math.random() * 2 * Math.PI
        const phi = Math.acos(2 * Math.random() - 1)
        p[i * 3] = r * Math.sin(phi) * Math.cos(theta)
        p[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
        p[i * 3 + 2] = r * Math.cos(phi)
    }
    return p
  }, [count])

  // Parallax + slight rotation to make it feel alive
  useFrame((state, delta) => {
    if (!ref.current) return
    ref.current.rotation.x -= delta * 0.02
    ref.current.rotation.y -= delta * 0.03
    
    // Parallax mapped to pointer
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, state.pointer.x * 2, 0.05)
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, state.pointer.y * 2, 0.05)
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#00E5FF"
          size={0.08}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.4}
        />
      </Points>
    </group>
  )
}
