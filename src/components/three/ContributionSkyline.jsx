import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera, View } from '@react-three/drei'
import * as THREE from 'three'

// A year of contributions as a city: one tower per day, weeks along X,
// weekdays along Z, height by count. A single InstancedMesh (one draw call),
// rendered through the shared overlay canvas like the other in-page scenes.
const COLORS = ['#334155', '#0e7490', '#22d3ee', '#a855f7', '#ec4899'].map(
  (c) => new THREE.Color(c),
)

function Towers({ weeks, max }) {
  const mesh = useRef()
  const group = useRef()
  const cells = useMemo(
    () =>
      weeks.flatMap((week, x) =>
        week.map((day, z) => (day ? { ...day, x, z } : null)).filter(Boolean),
      ),
    [weeks],
  )

  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const cols = weeks.length
    cells.forEach((c, i) => {
      const h = c.count ? 0.2 + (Math.log1p(c.count) / Math.log1p(max)) * 6 : 0.06
      m.makeScale(0.82, h, 0.82)
      m.setPosition(c.x - cols / 2, h / 2, c.z - 3.5)
      mesh.current.setMatrixAt(i, m)
      mesh.current.setColorAt(i, COLORS[c.level] ?? COLORS[0])
    })
    mesh.current.instanceMatrix.needsUpdate = true
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
  }, [cells, max, weeks.length])

  useFrame((_, dt) => {
    group.current.rotation.y += dt * 0.12
  })

  return (
    <group ref={group} rotation={[0, -0.5, 0]}>
      <instancedMesh ref={mesh} args={[undefined, undefined, cells.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          metalness={0.4}
          roughness={0.35}
          emissive="#7c3aed"
          emissiveIntensity={0.15}
        />
      </instancedMesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[weeks.length + 4, 12]} />
        <meshBasicMaterial color="#0b0620" transparent opacity={0.35} />
      </mesh>
    </group>
  )
}

export default function ContributionSkyline({ weeks, max }) {
  return (
    <View className="h-full w-full">
      <PerspectiveCamera
        makeDefault
        position={[0, 17, 27]}
        fov={45}
        onUpdate={(c) => c.lookAt(0, 0, 0)}
      />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={1.6} />
      <pointLight position={[-20, 10, -10]} intensity={40} color="#22d3ee" />
      <Towers weeks={weeks} max={max} />
    </View>
  )
}
