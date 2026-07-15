import { useMemo } from 'react'
import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'

// Extrudes an official brand SVG mark (24x24 viewBox) into centered 3D geometry.
export function useLogoGeometry(path, depth = 3) {
  return useMemo(() => {
    const loader = new SVGLoader()
    const parsed = loader.parse(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${path}"/></svg>`,
    )
    const shapes = parsed.paths.flatMap((p) => SVGLoader.createShapes(p))
    const geo = new THREE.ExtrudeGeometry(shapes, {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.25,
      bevelSize: 0.25,
      bevelSegments: 2,
      curveSegments: 12,
    })
    geo.center()
    return geo
  }, [path, depth])
}
