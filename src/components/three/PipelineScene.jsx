import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, PerspectiveCamera, View } from '@react-three/drei'
import * as THREE from 'three'
import { siApacheairflow, siGooglebigquery, siGooglepubsub, siLooker } from 'simple-icons'
import { useLogoGeometry } from './useLogoGeometry.js'

// A living GCP data pipeline built from the actual product logos:
// Sources → Pub/Sub → Composer (Airflow) → BigQuery → Looker, with a dbt
// transform loop. Event particles flow through glowing tubes. Drag to orbit.

const NODES = [
  { id: 'src-a', label: null, pos: [-3.4, 1.0, 0.2], shape: 'db', color: '#94a3b8', size: 0.16 },
  { id: 'src-b', label: 'SOURCES', pos: [-3.5, 0, -0.1], shape: 'db', color: '#94a3b8', size: 0.16 },
  { id: 'src-c', label: null, pos: [-3.4, -1.0, 0.1], shape: 'db', color: '#94a3b8', size: 0.16 },
  { id: 'pubsub', label: 'PUB/SUB', pos: [-1.9, 0.1, 0], shape: 'logo', path: siGooglepubsub.path, color: '#AECBFA', size: 0.42 },
  { id: 'composer', label: 'COMPOSER', pos: [-0.35, 0.75, 0.15], shape: 'logo', path: siApacheairflow.path, color: '#00C7D4', size: 0.44 },
  { id: 'bigquery', label: 'BIGQUERY', pos: [1.2, -0.05, 0], shape: 'logo', path: siGooglebigquery.path, color: '#669DF6', size: 0.5 },
  { id: 'dbt', label: 'DBT', pos: [1.25, 1.35, -0.2], shape: 'sphere', color: '#FF694A', size: 0.16 },
  { id: 'looker', label: 'LOOKER', pos: [3.0, -0.35, 0.1], shape: 'logo', path: siLooker.path, color: '#7CB342', size: 0.4 },
]

const EDGES = [
  ['src-a', 'pubsub'],
  ['src-b', 'pubsub'],
  ['src-c', 'pubsub'],
  ['pubsub', 'composer'],
  ['composer', 'bigquery'],
  ['bigquery', 'dbt'],
  ['dbt', 'bigquery'],
  ['bigquery', 'looker'],
]

const PARTICLES_PER_EDGE = 6

function buildCurves() {
  const byId = Object.fromEntries(NODES.map((n) => [n.id, new THREE.Vector3(...n.pos)]))
  return EDGES.map(([a, b], i) => {
    const start = byId[a]
    const end = byId[b]
    const mid = start
      .clone()
      .lerp(end, 0.5)
      .add(new THREE.Vector3(0, (i % 2 === 0 ? 1 : -1) * 0.25, 0.35))
    return new THREE.QuadraticBezierCurve3(start, mid, end)
  })
}

// Draws a pill-shaped label chip onto a canvas and shows it as a sprite that
// always faces the camera and always renders on top of the pipeline geometry.
function makeLabelTexture(text, color, dark) {
  const scale = 4
  const fontSize = 13 * scale
  const padX = 12 * scale
  const padY = 6 * scale
  const canvas = document.createElement('canvas')
  const g = canvas.getContext('2d')
  g.font = `700 ${fontSize}px Orbitron, sans-serif`
  const tracking = fontSize * 0.14
  const textWidth = g.measureText(text).width + tracking * (text.length - 1)
  canvas.width = Math.ceil(textWidth + padX * 2)
  canvas.height = Math.ceil(fontSize + padY * 2)

  const r = canvas.height / 2
  g.beginPath()
  g.roundRect(scale, scale, canvas.width - scale * 2, canvas.height - scale * 2, r)
  g.fillStyle = dark ? 'rgba(8,6,24,0.85)' : 'rgba(255,255,255,0.92)'
  g.shadowColor = color
  g.shadowBlur = 8 * scale
  g.fill()
  g.shadowBlur = 0
  g.strokeStyle = color
  g.lineWidth = 1.5 * scale
  g.stroke()

  g.font = `700 ${fontSize}px Orbitron, sans-serif`
  g.fillStyle = dark ? '#f1f5f9' : '#0f172a'
  g.textBaseline = 'middle'
  let x = padX
  for (const ch of text) {
    g.fillText(ch, x, canvas.height / 2 + scale)
    x += g.measureText(ch).width + tracking
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 4
  return { texture, aspect: canvas.width / canvas.height }
}

function NodeLabel({ node, dark }) {
  const { texture, aspect } = useMemo(
    () => makeLabelTexture(node.label, node.color, dark),
    [node.label, node.color, dark],
  )
  const offset = node.shape === 'logo' ? node.size + 0.32 : node.size + 0.46
  const h = 0.24
  return (
    <sprite position={[0, -offset, 0.3]} scale={[h * aspect, h, 1]} renderOrder={20}>
      <spriteMaterial map={texture} transparent depthTest={false} />
    </sprite>
  )
}

// The extruded product logo, gently facing the camera with a slow wobble.
function LogoNode({ node, dark }) {
  const geometry = useLogoGeometry(node.path, 4)
  const ref = useRef()
  const s = node.size / 12

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    ref.current.rotation.y = Math.sin(t * 0.6 + node.pos[0]) * 0.35
    ref.current.material.emissiveIntensity =
      (dark ? 0.9 : 0.35) * (1 + 0.3 * Math.sin(t * 2.2 + node.pos[0] * 3))
  })

  return (
    <mesh ref={ref} geometry={geometry} scale={[s, -s, s]}>
      <meshPhysicalMaterial
        color={node.color}
        emissive={node.color}
        metalness={0.5}
        roughness={0.25}
        clearcoat={1}
        clearcoatRoughness={0.2}
      />
    </mesh>
  )
}

// Classic database silhouette: a stack of glowing discs.
function DbNode({ node, dark }) {
  return (
    <group>
      {[-1, 0, 1].map((i) => (
        <mesh key={i} position={[0, i * 0.115, 0]}>
          <cylinderGeometry args={[node.size, node.size, 0.07, 20]} />
          <meshStandardMaterial
            color={node.color}
            emissive={node.color}
            emissiveIntensity={dark ? 0.7 : 0.3}
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  )
}

function SphereNode({ node, dark }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    ref.current.material.emissiveIntensity =
      (dark ? 1.4 : 0.6) * (1 + 0.35 * Math.sin(clock.getElapsedTime() * 2.5))
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[node.size, 24, 24]} />
      <meshStandardMaterial color={node.color} emissive={node.color} metalness={0.5} roughness={0.25} />
    </mesh>
  )
}

function PipelineNode({ node, dark }) {
  return (
    <group position={node.pos}>
      {node.shape === 'logo' ? (
        <LogoNode node={node} dark={dark} />
      ) : node.shape === 'db' ? (
        <DbNode node={node} dark={dark} />
      ) : (
        <SphereNode node={node} dark={dark} />
      )}
      {node.label && <NodeLabel node={node} dark={dark} />}
    </group>
  )
}

function Flow({ dark }) {
  const curves = useMemo(buildCurves, [])
  const particlesRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const count = curves.length * PARTICLES_PER_EDGE

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    let idx = 0
    for (let e = 0; e < curves.length; e++) {
      const speed = 0.12 + (e % 3) * 0.03
      for (let k = 0; k < PARTICLES_PER_EDGE; k++) {
        const u = (t * speed + k / PARTICLES_PER_EDGE + e * 0.13) % 1
        const p = curves[e].getPointAt(u)
        dummy.position.copy(p)
        const fade = Math.min(1, Math.min(u, 1 - u) * 8)
        dummy.scale.setScalar(0.045 * fade + 0.001)
        dummy.updateMatrix()
        particlesRef.current.setMatrixAt(idx++, dummy.matrix)
      }
    }
    particlesRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      {curves.map((curve, i) => (
        <mesh key={i}>
          <tubeGeometry args={[curve, 32, 0.014, 6, false]} />
          <meshBasicMaterial
            color={dark ? '#7dd3fc' : '#6366f1'}
            transparent
            opacity={dark ? 0.28 : 0.35}
          />
        </mesh>
      ))}
      <instancedMesh ref={particlesRef} args={[null, null, count]} frustumCulled={false}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={dark ? '#a5f3fc' : '#4f46e5'} transparent opacity={0.95} />
      </instancedMesh>
    </group>
  )
}

function Rig({ rotRef, children }) {
  const group = useRef()
  useFrame(() => {
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, rotRef.current.x + 0.1, 0.1)
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, rotRef.current.y - 0.18, 0.1)
  })
  return <group ref={group}>{children}</group>
}

export default function PipelineScene({ theme }) {
  const dark = theme === 'dark'
  const rotRef = useRef({ x: 0, y: 0 })
  const drag = useRef(null)

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, rx: rotRef.current.x, ry: rotRef.current.y }
  }
  const onPointerMove = (e) => {
    if (!drag.current) return
    rotRef.current.y = drag.current.ry + (e.clientX - drag.current.x) * 0.008
    rotRef.current.x = THREE.MathUtils.clamp(
      drag.current.rx + (e.clientY - drag.current.y) * 0.008,
      -0.8,
      0.8,
    )
  }
  const endDrag = () => {
    drag.current = null
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
        <PerspectiveCamera makeDefault position={[0, 0.4, 6.8]} fov={45} />
        <ambientLight intensity={dark ? 0.4 : 0.9} />
        <pointLight position={[4, 4, 5]} intensity={dark ? 30 : 18} color="#8b5cf6" />
        <pointLight position={[-5, -2, 4]} intensity={dark ? 20 : 12} color="#38bdf8" />
        <Rig rotRef={rotRef}>
          <Float speed={1.6} rotationIntensity={0.08} floatIntensity={0.5}>
            {NODES.map((node) => (
              <PipelineNode key={node.id} node={node} dark={dark} />
            ))}
            <Flow dark={dark} />
          </Float>
        </Rig>
      </View>
    </div>
  )
}
