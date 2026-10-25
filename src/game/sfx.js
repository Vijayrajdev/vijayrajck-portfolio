// Schema Storm sound — synthesised with Web Audio, no files. One shared
// context, created inside the first user gesture (autoplay rules). A soft
// bass pulse plays while the game runs and speeds up with each level.

let ctx = null
let master = null
let muted = (() => {
  try {
    return localStorage.getItem('vj-storm-muted') === '1'
  } catch {
    return false
  }
})()

function audio() {
  try {
    if (!ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext
      ctx = new Ctx()
      master = ctx.createGain()
      master.gain.value = muted ? 0 : 0.5
      master.connect(ctx.destination)
    }
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  } catch {
    return null
  }
}

export const isMuted = () => muted

export function setMuted(next) {
  muted = next
  try {
    localStorage.setItem('vj-storm-muted', next ? '1' : '0')
  } catch {
    /* preference lasts this visit */
  }
  if (master) master.gain.setTargetAtTime(next ? 0 : 0.5, ctx.currentTime, 0.02)
}

// One enveloped oscillator note.
function tone(freq, { at = 0, dur = 0.15, type = 'sine', vol = 0.3, slide = null } = {}) {
  const c = audio()
  if (!c || muted) return
  const t = c.currentTime + at
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (slide) osc.frequency.exponentialRampToValueAtTime(slide, t + dur)
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(vol, t + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0008, t + dur)
  osc.connect(gain).connect(master)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

// A burst of filtered noise (whooshes, thuds).
function noise({ at = 0, dur = 0.25, from = 3000, to = 300, vol = 0.25 } = {}) {
  const c = audio()
  if (!c || muted) return
  const t = c.currentTime + at
  const buffer = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  const src = c.createBufferSource()
  src.buffer = buffer
  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(from, t)
  filter.frequency.exponentialRampToValueAtTime(to, t + dur)
  const gain = c.createGain()
  gain.gain.setValueAtTime(vol, t)
  gain.gain.exponentialRampToValueAtTime(0.0008, t + dur)
  src.connect(filter).connect(gain).connect(master)
  src.start(t)
}

export const sfx = {
  unlock: () => audio(),
  load: () => {
    tone(784, { dur: 0.09, type: 'triangle' })
    tone(1175, { at: 0.06, dur: 0.14, type: 'triangle' })
  },
  quarantine: () => {
    tone(330, { dur: 0.12, type: 'square', vol: 0.12, slide: 180 })
    noise({ dur: 0.18, from: 1800, to: 400, vol: 0.12 })
  },
  vip: () =>
    [1047, 1319, 1568, 2093].forEach((f, i) =>
      tone(f, { at: i * 0.05, dur: 0.18, type: 'triangle', vol: 0.22 }),
    ),
  error: () => {
    tone(220, { dur: 0.32, type: 'sawtooth', vol: 0.18, slide: 70 })
    tone(110, { dur: 0.3, type: 'square', vol: 0.12 })
  },
  miss: () => {
    tone(880, { dur: 0.12, type: 'square', vol: 0.12 })
    tone(660, { at: 0.13, dur: 0.18, type: 'square', vol: 0.12 })
  },
  combo: () =>
    [1568, 2093, 2637].forEach((f, i) => tone(f, { at: i * 0.045, dur: 0.12, vol: 0.18 })),
  levelUp: () =>
    [523, 659, 784, 1047, 1319].forEach((f, i) =>
      tone(f, { at: i * 0.07, dur: 0.22, type: 'triangle', vol: 0.25 }),
    ),
  perfect: () =>
    [1047, 1568, 2093].forEach((f, i) => tone(f, { at: 0.4 + i * 0.09, dur: 0.3, vol: 0.2 })),
  freeze: () => {
    noise({ dur: 0.6, from: 6000, to: 500, vol: 0.2 })
    tone(1760, { dur: 0.5, vol: 0.12, slide: 440 })
  },
  tick: () => tone(660, { dur: 0.1, type: 'square', vol: 0.15 }),
  go: () => tone(1320, { dur: 0.3, type: 'square', vol: 0.18 }),
  gameOver: () =>
    [392, 330, 262, 196].forEach((f, i) =>
      tone(f, { at: i * 0.16, dur: 0.35, type: 'triangle', vol: 0.25 }),
    ),
}

// The bass pulse: a scheduler that books kicks slightly ahead on the audio
// clock so timing stays tight even when the main thread is busy.
let pulseTimer = null
let nextBeat = 0
let bpm = 96

export function startPulse(level) {
  const c = audio()
  if (!c) return
  bpm = 90 + level * 8
  if (pulseTimer) return
  nextBeat = c.currentTime + 0.1
  pulseTimer = setInterval(() => {
    while (nextBeat < c.currentTime + 0.2) {
      if (!muted) {
        const osc = c.createOscillator()
        const gain = c.createGain()
        osc.frequency.setValueAtTime(110, nextBeat)
        osc.frequency.exponentialRampToValueAtTime(42, nextBeat + 0.18)
        gain.gain.setValueAtTime(0.28, nextBeat)
        gain.gain.exponentialRampToValueAtTime(0.0008, nextBeat + 0.22)
        osc.connect(gain).connect(master)
        osc.start(nextBeat)
        osc.stop(nextBeat + 0.25)
      }
      nextBeat += 60 / bpm
    }
  }, 50)
}

export const setPulseLevel = (level) => {
  bpm = 90 + level * 8
}

export function stopPulse() {
  clearInterval(pulseTimer)
  pulseTimer = null
}
