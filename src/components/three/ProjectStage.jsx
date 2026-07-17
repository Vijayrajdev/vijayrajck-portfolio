import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, PerspectiveCamera, View } from '@react-three/drei'
import * as THREE from 'three'
import { WEBGL_AVAILABLE } from '../../utils/capabilities.js'

// Distinct sculpture per project, draggable in 3D (click + drag to rotate,
// eases back home on release).
function ProjectSculpture({ id, accent, dark }) {
  const material = (
    <meshStandardMaterial
      color={accent}
      emissive={accent}
      emissiveIntensity={dark ? 1.1 : 0.3}
      metalness={0.7}
      roughness={0.2}
    />
  )

  if (id === 'sentinel-forge') {
    // Multi-agent platform: a core with orbiting agent nodes.
    return (
      <group>
        <mesh>
          <icosahedronGeometry args={[0.7, 0]} />
          {material}
        </mesh>
        {[0, 1, 2].map((i) => {
          const angle = (i / 3) * Math.PI * 2
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 1.25, Math.sin(angle) * 0.55, Math.sin(angle) * 0.7]}
            >
              <sphereGeometry args={[0.18, 16, 16]} />
              {material}
            </mesh>
          )
        })}
        <mesh rotation={[Math.PI / 2.6, 0, 0]}>
          <torusGeometry args={[1.25, 0.02, 8, 64]} />
          <meshBasicMaterial color={accent} transparent opacity={0.5} />
        </mesh>
      </group>
    )
  }

  if (id === 'nexus') {
    // Central hub: interlocked rings around a core.
    return (
      <group>
        <mesh>
          <sphereGeometry args={[0.55, 32, 32]} />
          {material}
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.0, 0.06, 12, 64]} />
          {material}
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 3]}>
          <torusGeometry args={[1.0, 0.06, 12, 64]} />
          {material}
        </mesh>
      </group>
    )
  }

  if (id === 'next-mission') {
    // Placeholder slot: an uncharted wireframe world awaiting its mission.
    return (
      <group>
        <mesh>
          <icosahedronGeometry args={[0.85, 1]} />
          <meshBasicMaterial color={accent} wireframe transparent opacity={0.55} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.3, 16, 16]} />
          {material}
        </mesh>
        <mesh rotation={[Math.PI / 3, 0, Math.PI / 6]}>
          <torusGeometry args={[1.15, 0.015, 8, 64]} />
          <meshBasicMaterial color={accent} transparent opacity={0.4} />
        </mesh>
      </group>
    )
  }

  // JobTrackr: stacked glass panels — the "Deep Glass" UI.
  return (
    <group>
      {[-0.4, 0, 0.4].map((z, i) => (
        <mesh key={i} position={[i * 0.15 - 0.15, i * 0.1 - 0.1, z]}>
          <boxGeometry args={[1.6, 1.1, 0.06]} />
          <meshPhysicalMaterial
            color={accent}
            metalness={0.1}
            roughness={0.05}
            transmission={0.6}
            transparent
            opacity={0.85}
            emissive={accent}
            emissiveIntensity={dark ? 0.4 : 0.1}
          />
        </mesh>
      ))}
    </group>
  )
}

function DraggableGroup({ rotRef, children }) {
  const group = useRef()
  useFrame(() => {
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, rotRef.current.x, 0.12)
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, rotRef.current.y, 0.12)
  })
  return <group ref={group}>{children}</group>
}

export default function ProjectStage({ project, theme }) {
  const dark = theme === 'dark'
  const rotRef = useRef({ x: 0, y: 0 })
  const drag = useRef(null)

  // No WebGL: a glowing accent orb keeps the card art instead of an empty box.
  if (!WEBGL_AVAILABLE) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div
          className="h-24 w-24 animate-pulse rounded-full"
          style={{
            background: `radial-gradient(circle at 35% 30%, ${project.accent}, ${project.accent}22 70%)`,
            boxShadow: `0 0 60px ${project.accent}66`,
          }}
        />
      </div>
    )
  }

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, rx: rotRef.current.x, ry: rotRef.current.y }
  }
  const onPointerMove = (e) => {
    if (!drag.current) return
    rotRef.current.y = drag.current.ry + (e.clientX - drag.current.x) * 0.012
    rotRef.current.x = THREE.MathUtils.clamp(
      drag.current.rx + (e.clientY - drag.current.y) * 0.012,
      -1.1,
      1.1,
    )
  }
  const endDrag = () => {
    drag.current = null
    // Snap home, like PresentationControls' snap.
    rotRef.current = { x: 0, y: 0 }
  }

  return (
    <div
      className="h-full w-full cursor-grab touch-pan-y select-none active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <View className="h-full w-full">
        <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={45} />
        <ambientLight intensity={dark ? 0.4 : 1.0} />
        <pointLight position={[4, 4, 4]} intensity={dark ? 30 : 20} color={project.accent} />
        <pointLight position={[-4, -2, 3]} intensity={10} color="#ffffff" />
        <DraggableGroup rotRef={rotRef}>
          <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.8}>
            <ProjectSculpture id={project.id} accent={project.accent} dark={dark} />
          </Float>
        </DraggableGroup>
      </View>
    </div>
  )
}
