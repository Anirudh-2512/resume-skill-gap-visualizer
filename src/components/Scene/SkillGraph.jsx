import React, { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'

function Node({ data }) {
  const ref = useRef()
  const matRef = useRef()
  const [hovered, setHover] = useState(false)
  const setSelectedSkill = useStore(state => state.setSelectedSkill)
  const selectedSkill = useStore(state => state.selectedSkill)
  const currentRoute = useStore(state => state.currentRoute)
  const appState = useStore(state => state.appState)

  const isSelected = selectedSkill?.id === data.id
  const isGapHighlighted = currentRoute === '/gaps' && !data.known

  let baseColor = data.known ? '#B39DDB' : '#050505'
  let emissiveColor = data.known ? '#8a2be2' : '#111111'
  let emissiveInt = data.known ? 2 : 0.5
  let targetOpacity = 1

  if (currentRoute === '/gaps') {
    if (!data.known) { emissiveColor = '#E63B2E'; emissiveInt = 6 }
    else { targetOpacity = 0.15 }
  } else if (currentRoute === '/path') {
    if (!data.known) targetOpacity = 0
    else targetOpacity = 0.05
  }

  const randomOffset = useMemo(() => Math.random() * 100, [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + randomOffset
    ref.current.position.y = data.pos[1] + Math.sin(t) * 0.3

    const isActive = appState === 'active'
    let targetScale = 0.001
    if (currentRoute === '/path' && !data.known) {
      targetScale = 0.001
    } else if (isActive) {
      targetScale = isSelected ? 1.6 : (hovered ? 1.3 : 1)
    }

    ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), isActive ? 0.08 : 0.2)

    const baseZ = data.pos[2]
    const currentZ = ref.current.position.z
    const targetZ = isGapHighlighted ? baseZ + 3 : (currentRoute === '/gaps' && data.known ? baseZ - 4 : baseZ)
    ref.current.position.z = THREE.MathUtils.lerp(currentZ, targetZ, 0.08)

    if (matRef.current) {
      matRef.current.opacity = THREE.MathUtils.lerp(matRef.current.opacity, targetOpacity, 0.08)
    }
  })

  const showLabel = targetOpacity > 0.1 && appState === 'active'

  return (
    <group position={data.pos} ref={ref}>
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); setHover(true) }}
        onPointerOut={() => setHover(false)}
        onClick={(e) => { e.stopPropagation(); setSelectedSkill(data) }}
      >
        <sphereGeometry args={[0.9, 64, 64]} />
        <meshStandardMaterial
          ref={matRef}
          color={baseColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveInt}
          roughness={0.15}
          metalness={0.9}
          transparent
          opacity={0}
        />
      </mesh>
      <Html position={[0, -1.4, 0]} center className="pointer-events-none transition-all duration-300" style={{ opacity: showLabel && (hovered || isSelected || isGapHighlighted) ? 1 : (showLabel ? 0.15 : 0) }}>
        <div className={`px-4 py-1.5 text-xs font-mono font-bold tracking-widest uppercase rounded-full backdrop-blur-md whitespace-nowrap border shadow-xl ${data.known ? 'bg-[#8a2be2]/20 border-[#8a2be2]/50 text-white shadow-[#8a2be2]/20' : (currentRoute === '/gaps' ? 'bg-[#E63B2E]/20 border-[#E63B2E]/80 text-[#E63B2E] shadow-[#E63B2E]/30' : 'bg-black/70 border-[#00E5FF]/60 text-[#00E5FF] shadow-[#00E5FF]/20')}`}>
          {data.label}
        </div>
      </Html>
    </group>
  )
}

function Edge({ source, target }) {
  const currentRoute = useStore(state => state.currentRoute)
  const appState = useStore(state => state.appState)
  const matRef = useRef()

  const points = useMemo(() => {
    const s = new THREE.Vector3(...source.pos)
    const t = new THREE.Vector3(...target.pos)
    // Guard: if points are identical, offset slightly
    if (s.distanceTo(t) < 0.01) t.x += 0.1
    return [s, t]
  }, [source, target])

  const isGapDependency = !source.known || !target.known

  let targetOpacity = 0.4
  let targetColor = '#4a4a6a'
  let targetWidth = 1.5

  if (currentRoute === '/gaps') {
    if (isGapDependency) { targetOpacity = 0.7; targetColor = '#E63B2E'; targetWidth = 3 }
    else { targetOpacity = 0.05 }
  } else if (currentRoute === '/path') {
    targetOpacity = 0.02
  }

  useFrame(() => {
    if (matRef.current) {
      matRef.current.opacity = THREE.MathUtils.lerp(matRef.current.opacity, targetOpacity, 0.05)
    }
  })

  if (appState !== 'active') return null

  return (
    <Line
      ref={matRef}
      points={points}
      color={targetColor}
      lineWidth={targetWidth}
      transparent
      opacity={0}
    />
  )
}

function LearningPathSequence() {
  const currentRoute = useStore(state => state.currentRoute)
  const skills = useStore(state => state.skills)
  const matRef = useRef()

  const points = useMemo(() => {
    // Use actual dynamic skills — only unknown (gap) skills form the learning path
    const pathSkills = skills.filter(s => !s.known)
    if (pathSkills.length < 2) return null // Need at least 2 points for a line
    return pathSkills.map(s => new THREE.Vector3(...s.pos).add(new THREE.Vector3(0, 0, 0.5)))
  }, [skills])

  useFrame((state, delta) => {
    if (!matRef.current) return
    if (currentRoute === '/path') {
      matRef.current.dashOffset -= delta * 4
      matRef.current.opacity = THREE.MathUtils.lerp(matRef.current.opacity, 1, 0.03)
    } else {
      matRef.current.opacity = THREE.MathUtils.lerp(matRef.current.opacity, 0, 0.1)
    }
  })

  // Don't render if not enough points
  if (!points || points.length < 2) return null

  return (
    <group>
      <Line
        points={points}
        color="#00E5FF"
        lineWidth={8}
        dashed
        dashScale={2}
        dashSize={3}
        dashOffset={0}
        transparent
      >
        <lineDashedMaterial ref={matRef} opacity={0} transparent color="#00E5FF" dashSize={1.5} gapSize={1.5} depthTest={false} />
      </Line>
    </group>
  )
}

export default function SkillGraph() {
  const skills = useStore(state => state.skills)
  const edges = useStore(state => state.edges)
  const setSelectedSkill = useStore(state => state.setSelectedSkill)

  // Don't render anything until we have valid skills
  if (!skills || skills.length === 0) return null

  return (
    <group onPointerMissed={() => setSelectedSkill(null)}>
      {edges.map((e, i) => {
        const sourceNode = skills.find(s => s.id === e.source)
        const targetNode = skills.find(s => s.id === e.target)
        if (!sourceNode || !targetNode) return null
        if (!sourceNode.pos || !targetNode.pos) return null
        return <Edge key={i} source={sourceNode} target={targetNode} />
      })}

      {skills.map(skill => (
        <Node key={skill.id} data={skill} />
      ))}

      <LearningPathSequence />
    </group>
  )
}