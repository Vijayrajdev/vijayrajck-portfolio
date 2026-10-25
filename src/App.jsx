import { Suspense, lazy, useState } from 'react'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Story from './components/Story.jsx'
import Skills from './components/Skills.jsx'
import Experience from './components/Experience.jsx'
import Projects from './components/Projects.jsx'
import Awards from './components/Awards.jsx'
import Contact from './components/Contact.jsx'
import QueryConsole from './components/QueryConsole.jsx'
import Terminal from './components/Terminal.jsx'
import Achievements from './components/Achievements.jsx'
import { BootSequence, Hud, Reticle } from './components/Future.jsx'
import OverlayCanvas from './components/three/OverlayCanvas.jsx'
import { useTheme } from './hooks/useTheme.js'
import { usePWAInstall } from './hooks/usePWAInstall.js'
import { useReveal } from './hooks/useReveal.js'
import { usePointerGlow } from './hooks/usePointerGlow.js'
import { useAchievements } from './hooks/useAchievements.js'
import { ACHIEVEMENTS, unlock } from './utils/achievements.js'
import { PORTFOLIO_DATA } from './data/portfolio.js'
import { WEBGL_AVAILABLE } from './utils/capabilities.js'

const BackgroundScene = lazy(() => import('./components/three/BackgroundScene.jsx'))
const PlayPage = lazy(() => import('./pages/PlayPage.jsx'))

// Two routes: the portfolio, and /play (Schema Storm). vercel.json rewrites
// /play to index.html so a direct visit or refresh works in production.
const ROUTE = window.location.pathname.replace(/\/+$/, '') === '/play' ? 'play' : 'home'

export default function App() {
  const [theme, flipTheme] = useTheme()
  const { canInstall, install } = usePWAInstall()
  const revealRef = useReveal()
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [badgesOpen, setBadgesOpen] = useState(false)
  const badges = useAchievements()
  usePointerGlow()

  const toggleTheme = () => {
    flipTheme()
    unlock('theme')
  }

  const background = WEBGL_AVAILABLE && (
    <Suspense fallback={null}>
      <BackgroundScene theme={theme} key={theme} />
    </Suspense>
  )

  // Shared by both routes: boot intro, HUD readout, reticle, badge toasts.
  const futureLayer = (
    <>
      <BootSequence />
      <Hud />
      <Reticle />
      <Achievements unlocked={badges} open={badgesOpen} onClose={() => setBadgesOpen(false)} />
    </>
  )

  if (ROUTE === 'play') {
    return (
      <div ref={revealRef} className="relative min-h-screen">
        {background}
        <Suspense fallback={null}>
          <PlayPage theme={theme} toggleTheme={toggleTheme} />
        </Suspense>
        {futureLayer}
      </div>
    )
  }

  return (
    <div ref={revealRef} className="relative min-h-screen">
      {/* Layer 0: deep-space background scene (CSS starfield stands in when
          WebGL is unavailable) */}
      {background}

      {/* Layer 10: glass DOM content (View placeholders live here) */}
      <div className="relative z-10">
        <main>
          <Hero theme={theme} />
          <Story />
          <Skills />
          <Projects theme={theme} />
          <QueryConsole />
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
      {WEBGL_AVAILABLE && <OverlayCanvas />}

      {/* Layer 50: navigation above everything */}
      <div className="relative z-50">
        <Nav
          theme={theme}
          toggleTheme={toggleTheme}
          canInstall={canInstall}
          install={install}
          openTerminal={() => setTerminalOpen(true)}
          badgeCount={badges.size}
          badgeTotal={ACHIEVEMENTS.length}
          openBadges={() => setBadgesOpen(true)}
        />
      </div>

      {/* Layer 60: ⌘K terminal */}
      <Terminal
        open={terminalOpen}
        setOpen={setTerminalOpen}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Layer 40–100: boot, HUD, reticle, badge panel + unlock toasts */}
      {futureLayer}
    </div>
  )
}
