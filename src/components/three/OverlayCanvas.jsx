import { Canvas } from '@react-three/fiber'
import { View } from '@react-three/drei'

// One shared WebGL context for every in-page 3D element (hero portrait +
// project stages), scissored into place via drei <View>. Keeping a single
// context avoids browser context-loss when many canvases coexist.
export default function OverlayCanvas() {
  return (
    <Canvas
      dpr={Math.min(window.devicePixelRatio, 2)}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 20,
        pointerEvents: 'none',
        transform: 'translateZ(0)',
      }}
      aria-hidden="true"
    >
      <View.Port />
    </Canvas>
  )
}
