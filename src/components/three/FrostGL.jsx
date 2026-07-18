import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// WebGL replica of macOS backdrop-filter for platforms whose browsers won't
// render it: every frame the background scene is blurred (two-pass gaussian
// at quarter resolution, two iterations) and composited back onto the screen
// only inside the rounded rectangles of the glass panels, with the same
// saturation lift CSS applies. Panel rectangles are read live from the DOM,
// so scroll, reveals, and hover lifts all stay in sync.

const MAX_PANELS = 24

const blurVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const blurFragment = /* glsl */ `
  uniform sampler2D uTex;
  uniform vec2 uTexel;
  uniform vec2 uDir;
  varying vec2 vUv;

  void main() {
    vec2 step = uTexel * uDir;
    vec3 c = texture2D(uTex, vUv).rgb * 0.227027;
    c += texture2D(uTex, vUv + step * 1.3846).rgb * 0.316216;
    c += texture2D(uTex, vUv - step * 1.3846).rgb * 0.316216;
    c += texture2D(uTex, vUv + step * 3.2308).rgb * 0.070270;
    c += texture2D(uTex, vUv - step * 3.2308).rgb * 0.070270;
    gl_FragColor = vec4(c, 1.0);
  }
`

const compositeFragment = /* glsl */ `
  uniform sampler2D uTex;
  uniform vec2 uSize;
  uniform vec4 uRects[${MAX_PANELS}];
  uniform float uRadii[${MAX_PANELS}];
  uniform int uCount;
  varying vec2 vUv;

  float roundedRect(vec2 p, vec2 center, vec2 halfSize, float radius) {
    vec2 d = abs(p - center) - halfSize + radius;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - radius;
  }

  void main() {
    // CSS pixel coords, top-left origin, to match getBoundingClientRect.
    vec2 px = vec2(vUv.x * uSize.x, (1.0 - vUv.y) * uSize.y);

    float mask = 0.0;
    for (int i = 0; i < ${MAX_PANELS}; i++) {
      if (i >= uCount) break;
      float sd = roundedRect(px, uRects[i].xy, uRects[i].zw, uRadii[i]);
      mask = max(mask, 1.0 - smoothstep(-1.0, 1.0, sd));
    }
    if (mask <= 0.001) discard;

    vec3 color = texture2D(uTex, vUv).rgb;
    // saturate(160%) like the CSS material, plus a whisper of lift.
    float lum = dot(color, vec3(0.299, 0.587, 0.114));
    color = clamp(mix(vec3(lum), color, 1.6), 0.0, 1.0) + 0.015;
    gl_FragColor = vec4(color, mask);
  }
`

function makeTarget(w, h, depth) {
  return new THREE.WebGLRenderTarget(Math.max(2, Math.floor(w)), Math.max(2, Math.floor(h)), {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: depth,
    stencilBuffer: false,
  })
}

export default function FrostGL() {
  const { gl, scene, camera, size, viewport } = useThree()
  const panelsRef = useRef([])

  // Track every glass element currently in the document.
  useEffect(() => {
    const collect = () => {
      panelsRef.current = Array.from(document.querySelectorAll('.glass, .glass-deep')).map(
        (el) => ({
          el,
          radius: Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, 200),
        }),
      )
    }
    collect()
    const interval = setInterval(collect, 2000)
    return () => clearInterval(interval)
  }, [])

  const post = useMemo(() => {
    const dpr = viewport.dpr
    const sceneRT = makeTarget((size.width * dpr) / 2, (size.height * dpr) / 2, true)
    const blurA = makeTarget((size.width * dpr) / 4, (size.height * dpr) / 4, false)
    const blurB = makeTarget((size.width * dpr) / 4, (size.height * dpr) / 4, false)

    const postScene = new THREE.Scene()
    const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2))
    postScene.add(quad)

    const blurMaterial = new THREE.ShaderMaterial({
      vertexShader: blurVertex,
      fragmentShader: blurFragment,
      uniforms: {
        uTex: { value: null },
        uTexel: { value: new THREE.Vector2(1 / blurA.width, 1 / blurA.height) },
        uDir: { value: new THREE.Vector2(1, 0) },
      },
      depthTest: false,
      depthWrite: false,
    })

    const compositeMaterial = new THREE.ShaderMaterial({
      vertexShader: blurVertex,
      fragmentShader: compositeFragment,
      uniforms: {
        uTex: { value: null },
        uSize: { value: new THREE.Vector2(size.width, size.height) },
        uRects: { value: Array.from({ length: MAX_PANELS }, () => new THREE.Vector4()) },
        uRadii: { value: new Array(MAX_PANELS).fill(0) },
        uCount: { value: 0 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    })

    return { sceneRT, blurA, blurB, postScene, postCamera, quad, blurMaterial, compositeMaterial }
  }, [size.width, size.height, viewport.dpr])

  useEffect(
    () => () => {
      post.sceneRT.dispose()
      post.blurA.dispose()
      post.blurB.dispose()
    },
    [post],
  )

  useFrame(() => {
    const { sceneRT, blurA, blurB, postScene, postCamera, quad, blurMaterial, compositeMaterial } =
      post

    // Gather on-screen panel rectangles (CSS pixels, viewport-relative —
    // exactly the space the fixed canvas lives in).
    const rects = compositeMaterial.uniforms.uRects.value
    const radii = compositeMaterial.uniforms.uRadii.value
    let count = 0
    for (const { el, radius } of panelsRef.current) {
      if (count >= MAX_PANELS) break
      const r = el.getBoundingClientRect()
      if (r.width < 24 || r.height < 24) continue
      if (r.bottom < 0 || r.top > size.height || r.right < 0 || r.left > size.width) continue
      rects[count].set(r.left + r.width / 2, r.top + r.height / 2, r.width / 2, r.height / 2)
      radii[count] = Math.min(radius, r.width / 2, r.height / 2)
      count++
    }
    compositeMaterial.uniforms.uCount.value = count
    compositeMaterial.uniforms.uSize.value.set(size.width, size.height)

    // 1. Scene → offscreen (half res).
    gl.setRenderTarget(sceneRT)
    gl.clear()
    gl.render(scene, camera)

    // 2. Two blur iterations (H+V at quarter res).
    let readTex = sceneRT.texture
    for (let i = 0; i < 2; i++) {
      quad.material = blurMaterial
      blurMaterial.uniforms.uTex.value = readTex
      blurMaterial.uniforms.uDir.value.set(1, 0)
      gl.setRenderTarget(blurA)
      gl.render(postScene, postCamera)

      blurMaterial.uniforms.uTex.value = blurA.texture
      blurMaterial.uniforms.uDir.value.set(0, 1)
      gl.setRenderTarget(blurB)
      gl.render(postScene, postCamera)
      readTex = blurB.texture
    }

    // 3. Sharp scene to screen, then frost composited inside panel masks.
    gl.setRenderTarget(null)
    gl.render(scene, camera)
    quad.material = compositeMaterial
    compositeMaterial.uniforms.uTex.value = blurB.texture
    const autoClear = gl.autoClear
    gl.autoClear = false
    gl.render(postScene, postCamera)
    gl.autoClear = autoClear
  }, 1)

  return null
}
