import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Html, Stars, Trail } from '@react-three/drei'
import * as THREE from 'three'
import { LOGOS_3D } from '../../data/logos3d.js'
import { useLogoGeometry } from './useLogoGeometry.js'
import { playSparkle } from '../../utils/sparkle.js'

// DOM content sits above this canvas, so R3F's own event system never sees
// the pointer. Track it at the window level in normalized device coords.
function usePointerNDC() {
  const ndc = useRef(new THREE.Vector2(0, 0))
  useEffect(() => {
    const onMove = (e) => {
      ndc.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1,
      )
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])
  return ndc
}

const NODE_COUNT = 150
const CONNECT_DIST = 3.4
const FIELD = { x: 26, y: 15, z: 8 }

function buildNetwork() {
  const positions = []
  for (let i = 0; i < NODE_COUNT; i++) {
    positions.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * FIELD.x,
        (Math.random() - 0.5) * FIELD.y,
        (Math.random() - 0.5) * FIELD.z - 2,
      ),
    )
  }
  const pairs = []
  for (let i = 0; i < NODE_COUNT; i++) {
    for (let j = i + 1; j < NODE_COUNT; j++) {
      if (positions[i].distanceTo(positions[j]) < CONNECT_DIST) pairs.push([i, j])
    }
  }
  const linePositions = new Float32Array(pairs.length * 6)
  return { positions, pairs, linePositions }
}

// Instanced node-network representing data pipelines; nodes drift, pulse,
// and swell near the raycast cursor position.
function DataNetwork({ dark }) {
  const meshRef = useRef()
  const linesRef = useRef()
  const groupRef = useRef()
  const cursor = useRef(new THREE.Vector3(999, 999, 0))
  const { positions, pairs, linePositions } = useMemo(buildNetwork, [])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const world = useMemo(() => new THREE.Vector3(), [])
  const { viewport } = useThree()
  const ndc = usePointerNDC()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const group = groupRef.current
    if (!group) return
    const pointer = ndc.current

    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, t * 0.02 + pointer.x * 0.12, 0.05)
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, -pointer.y * 0.08, 0.05)

    cursor.current.set((pointer.x * viewport.width) / 2, (pointer.y * viewport.height) / 2, 0)

    const mesh = meshRef.current
    for (let i = 0; i < NODE_COUNT; i++) {
      const p = positions[i]
      const drift = Math.sin(t * 0.5 + i * 1.7) * 0.15
      dummy.position.set(p.x, p.y + drift, p.z)
      world.copy(dummy.position).applyMatrix4(group.matrixWorld)
      const d = world.distanceTo(cursor.current)
      const swell = d < 3 ? 1 + (3 - d) * 0.9 : 1
      const pulse = 1 + Math.sin(t * 2 + i) * 0.15
      dummy.scale.setScalar(0.05 * pulse * swell)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true

    const arr = linesRef.current.geometry.attributes.position.array
    for (let k = 0; k < pairs.length; k++) {
      const [i, j] = pairs[k]
      const di = Math.sin(t * 0.5 + i * 1.7) * 0.15
      const dj = Math.sin(t * 0.5 + j * 1.7) * 0.15
      arr[k * 6 + 0] = positions[i].x
      arr[k * 6 + 1] = positions[i].y + di
      arr[k * 6 + 2] = positions[i].z
      arr[k * 6 + 3] = positions[j].x
      arr[k * 6 + 4] = positions[j].y + dj
      arr[k * 6 + 5] = positions[j].z
    }
    linesRef.current.geometry.attributes.position.needsUpdate = true
  })

  const nodeColor = dark ? '#a78bfa' : '#6366f1'
  const lineColor = dark ? '#7c3aed' : '#93c5fd'

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[null, null, NODE_COUNT]} frustumCulled={false}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={dark ? 2.2 : 0.6}
          roughness={0.3}
        />
      </instancedMesh>
      <lineSegments ref={linesRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={lineColor} transparent opacity={dark ? 0.22 : 0.35} />
      </lineSegments>
    </group>
  )
}

// A comet streaking across deep space, resetting when it leaves the field.
function Comet({ seed }) {
  const ref = useRef()
  const state = useMemo(() => {
    const rand = (a, b) => a + Math.abs(Math.sin(seed * 999.7 + a * 13.3)) * (b - a)
    return {
      speed: rand(3.5, 6),
      y0: rand(-6, 7),
      z: rand(-6, -3),
      offset: rand(0, 20),
      dir: seed % 2 === 0 ? 1 : -1,
    }
  }, [seed])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + state.offset
    const span = 44
    const x = ((t * state.speed) % span) - span / 2
    ref.current.position.set(x * state.dir, state.y0 + Math.sin(t * 0.4) * 1.5, state.z)
  })

  return (
    <Trail width={0.5} length={5} color="#67e8f9" attenuation={(w) => w * w}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#e0f2fe" />
      </mesh>
    </Trail>
  )
}

// Soft radial glow texture, built once and shared by every logo sprite.
let glowTexture = null
function getGlowTexture() {
  if (glowTexture) return glowTexture
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const g = canvas.getContext('2d')
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, 'rgba(255,255,255,0.85)')
  grad.addColorStop(0.35, 'rgba(255,255,255,0.28)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, size, size)
  glowTexture = new THREE.CanvasTexture(canvas)
  return glowTexture
}

// The actual BigQuery / Vertex AI / Terraform logos, extruded and floating in
// space: clearcoat "glass metal" material, an additive halo glow, hover swell
// with a holographic label, and a click shockwave burst. Pointer hits are
// raycast manually from window events, since DOM overlays block R3F events.
function TechIcon({ name, color, path, position, dark }) {
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef()
  const hitRef = useRef()
  const glowRef = useRef()
  const shockRef = useRef()
  const burstAt = useRef(-10)
  const clickQueued = useRef(false)
  const hoverState = useRef(false)
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const { camera } = useThree()
  const ndc = usePointerNDC()
  const geometry = useLogoGeometry(path)

  // Click burst: raycast the tap/click position against this logo.
  useEffect(() => {
    const onDown = (e) => {
      const point = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1,
      )
      raycaster.setFromCamera(point, camera)
      if (hitRef.current && raycaster.intersectObject(hitRef.current, false).length > 0) {
        clickQueued.current = true
        playSparkle()
      }
    }
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [camera, raycaster])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    raycaster.setFromCamera(ndc.current, camera)
    const hit = hitRef.current && raycaster.intersectObject(hitRef.current, false).length > 0
    if (hit !== hoverState.current) {
      hoverState.current = hit
      setHovered(hit)
    }
    if (clickQueued.current) {
      clickQueued.current = false
      burstAt.current = t
    }

    // Scale: hover swell + a quick punch right after a click.
    const sinceBurst = t - burstAt.current
    const punch = sinceBurst < 0.5 ? Math.sin(sinceBurst * Math.PI * 2) * 0.35 : 0
    const target = (hovered ? 1.35 : 1) + punch
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, target, 0.18))
    // Presentation spin, plus a full whirl after a click.
    const whirl = sinceBurst < 1.2 ? (1 - sinceBurst / 1.2) * Math.PI * 2 * (1 - sinceBurst / 1.2) : 0
    meshRef.current.rotation.y = Math.sin(t * 0.4) * 0.6 + whirl

    // Halo breathes, brightens on hover, flashes on click.
    if (glowRef.current) {
      const base = dark ? 0.5 : 0.3
      const breathe = 1 + 0.15 * Math.sin(t * 1.8 + position[0])
      const flash = sinceBurst < 0.6 ? (1 - sinceBurst / 0.6) * 1.2 : 0
      glowRef.current.material.opacity = Math.min(1, base * breathe * (hovered ? 1.7 : 1) + flash)
    }

    // Expanding shockwave ring after a click.
    if (shockRef.current) {
      if (sinceBurst < 1.1) {
        const k = sinceBurst / 1.1
        shockRef.current.visible = true
        shockRef.current.scale.setScalar(0.4 + k * 3.2)
        shockRef.current.material.opacity = (1 - k) * 0.8
      } else {
        shockRef.current.visible = false
      }
    }
  })

  // SVG space is y-down and 24 units wide; mirror Y and scale to world units.
  const s = 0.055

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={1.6} position={position}>
      <group ref={meshRef}>
        <sprite ref={glowRef} scale={3.4} renderOrder={-1}>
          <spriteMaterial
            map={getGlowTexture()}
            color={color}
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>
        <mesh name={name} ref={hitRef} geometry={geometry} scale={[s, -s, s]}>
          <meshPhysicalMaterial
            color={color}
            emissive={color}
            emissiveIntensity={(dark ? 1.4 : 0.4) * (hovered ? 1.8 : 1)}
            metalness={0.65}
            roughness={0.18}
            clearcoat={1}
            clearcoatRoughness={0.15}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.05, 0.015, 8, 64]} />
          <meshBasicMaterial color={color} transparent opacity={dark ? 0.35 : 0.25} />
        </mesh>
        <mesh ref={shockRef} visible={false}>
          <ringGeometry args={[0.95, 1, 48]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
      {hovered && (
        <Html center distanceFactor={12} position={[0, 1.1, 0]} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '11px',
              letterSpacing: '0.2em',
              whiteSpace: 'nowrap',
              padding: '4px 10px',
              borderRadius: '9999px',
              color: dark ? '#e0f2fe' : '#1e293b',
              background: dark ? 'rgba(8,6,24,0.7)' : 'rgba(255,255,255,0.75)',
              border: `1px solid ${color}`,
              boxShadow: `0 0 14px ${color}66`,
              backdropFilter: 'blur(8px)',
            }}
          >
            {name.toUpperCase()}
          </div>
        </Html>
      )}
    </Float>
  )
}

function SceneLights({ dark }) {
  if (dark) {
    return (
      <>
        <ambientLight intensity={0.15} />
        <pointLight position={[8, 6, 6]} intensity={40} color="#a855f7" />
        <pointLight position={[-8, -4, 4]} intensity={30} color="#3b82f6" />
        <pointLight position={[0, 8, -6]} intensity={20} color="#ec4899" />
      </>
    )
  }
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[6, 10, 8]} intensity={1.4} color="#ffffff" />
      <pointLight position={[-6, -4, 6]} intensity={12} color="#7dd3fc" />
    </>
  )
}

export default function BackgroundScene({ theme }) {
  const dark = theme === 'dark'
  const icons = LOGOS_3D
  const iconPositions = [
    [-9.4, -4.6, -1.5],
    [8.6, -3.8, -1],
    [7.6, 4.3, -2],
  ]

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 55 }}
        dpr={Math.min(window.devicePixelRatio, 2)}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <SceneLights dark={dark} />
        {dark && (
          <>
            <Stars radius={70} depth={40} count={3500} factor={3.2} saturation={0.4} fade speed={0.8} />
            <Comet seed={1} />
            <Comet seed={2} />
          </>
        )}
        <DataNetwork dark={dark} />
        {icons.map((icon, i) => (
          <TechIcon key={icon.name} {...icon} position={iconPositions[i]} dark={dark} />
        ))}
        <fog attach="fog" args={[dark ? '#05020f' : '#eef2ff', 16, 34]} />
      </Canvas>
    </div>
  )
}
