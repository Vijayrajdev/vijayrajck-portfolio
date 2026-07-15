import { Suspense, lazy } from 'react'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Story from './components/Story.jsx'
import Skills from './components/Skills.jsx'
import Experience from './components/Experience.jsx'
import Projects from './components/Projects.jsx'
import Awards from './components/Awards.jsx'
import Contact from './components/Contact.jsx'
import OverlayCanvas from './components/three/OverlayCanvas.jsx'
import { useTheme } from './hooks/useTheme.js'
import { usePWAInstall } from './hooks/usePWAInstall.js'
import { useReveal } from './hooks/useReveal.js'
import { PORTFOLIO_DATA } from './data/portfolio.js'

const BackgroundScene = lazy(() => import('./components/three/BackgroundScene.jsx'))

export default function App() {
  const [theme, toggleTheme] = useTheme()
  const { canInstall, install } = usePWAInstall()
  const revealRef = useReveal()

  return (
    <div ref={revealRef} className="relative min-h-screen">
      {/* Layer 0: deep-space background scene */}
      <Suspense fallback={null}>
        <BackgroundScene theme={theme} key={theme} />
      </Suspense>

      {/* Layer 10: glass DOM content (View placeholders live here) */}
      <div className="relative z-10">
        <main>
          <Hero theme={theme} />
          <Story />
          <Skills />
          <Projects theme={theme} />
          <Experience />
          <Awards />
          <Contact />
        </main>
        <footer className="px-6 pb-8 text-center text-xs text-slate-500 dark:text-slate-400">
          <p className="chapter-label mb-2 !text-[9px]">// END OF TRANSMISSION</p>
          <p>
            © {new Date().getFullYear()} {PORTFOLIO_DATA.profile.name} · Built with React, Three.js
            &amp; Tailwind CSS
          </p>
          <p className="mt-2">
            Made with <span aria-label="love">❤️</span> by{' '}
            <a
              href={PORTFOLIO_DATA.profile.linkedin}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-indigo-500 underline-offset-4 transition hover:underline dark:text-cyan-300"
            >
              Vijay
            </a>
          </p>
        </footer>
      </div>

      {/* Layer 20: shared WebGL overlay rendering all in-page 3D views */}
      <OverlayCanvas />

      {/* Layer 50: navigation above everything */}
      <div className="relative z-50">
        <Nav theme={theme} toggleTheme={toggleTheme} canInstall={canInstall} install={install} />
      </div>
    </div>
  )
}
