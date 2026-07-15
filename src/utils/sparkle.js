// A short generative "space sparkle" — a cascade of high, glassy pings with
// rising pitch and fast decay. Built with Web Audio, no files needed.
// The shared context is created lazily inside a user gesture, so autoplay
// policies are satisfied.
let ctx = null

export function playSparkle() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!ctx) ctx = new Ctx()
    if (ctx.state === 'suspended') ctx.resume()

    const now = ctx.currentTime
    const master = ctx.createGain()
    master.gain.value = 0.14
    master.connect(ctx.destination)

    const pings = [1568, 2093, 2637, 3520]
    pings.forEach((freq, i) => {
      const t = now + i * 0.055
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, t)
      osc.frequency.exponentialRampToValueAtTime(freq * 1.4, t + 0.22)
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.5 / (i * 0.6 + 1), t + 0.012)
      gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.38)
      osc.connect(gain).connect(master)
      osc.start(t)
      osc.stop(t + 0.45)
    })
  } catch {
    // Audio is decorative — never let it break the page.
  }
}
