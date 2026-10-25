import { useState } from 'react'
import BrandIcon from './BrandIcon.jsx'
import { PORTFOLIO_DATA } from '../data/portfolio.js'
import { SOCIAL_ICONS } from '../data/socials.js'

export default function Contact() {
  const { profile } = PORTFOLIO_DATA
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Portfolio contact from ${form.name}`)
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`)
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`
  }

  const field =
    'glass w-full rounded-2xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 outline-none transition focus:ring-2 focus:ring-purple-400/60 dark:text-slate-100 dark:placeholder-slate-500 bg-transparent'

  return (
    <section id="contact" className="relative mx-auto max-w-3xl scroll-mt-28 px-6 py-20">
      <div className="reveal mb-10 text-center">
        <p className="chapter-label">// CHAPTER 07 — TRANSMISSION</p>
        <h2 className="font-display glow-title mt-3 text-3xl font-bold tracking-wide uppercase sm:text-4xl">
          <span className="text-aurora">Open a Channel</span>
        </h2>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Open to conversations about data platforms, agentic AI, and everything GCP.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="reveal glass-deep space-y-4 rounded-3xl p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            required
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={field}
          />
          <input
            required
            type="email"
            placeholder="Your email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={field}
          />
        </div>
        <textarea
          required
          rows={5}
          placeholder="Tell me about your project…"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={`${field} resize-none`}
        />
        <button
          type="submit"
          className="font-display w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-3.5 text-xs font-bold tracking-[0.2em] text-white uppercase shadow-lg shadow-purple-500/30 transition hover:scale-[1.02] hover:shadow-purple-500/50"
        >
          Transmit Message
        </button>
      </form>

      <div className="reveal mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
        <a
          href={`mailto:${profile.email}`}
          className="glass flex items-center gap-2.5 rounded-2xl px-5 py-2.5 font-semibold transition hover:scale-105"
        >
          <BrandIcon icon={SOCIAL_ICONS.gmail} color={SOCIAL_ICONS.gmail.hex} />
          <span className="hidden sm:inline">{profile.email}</span>
          <span className="sm:hidden">Email</span>
        </a>
        <a
          href={profile.linkedin}
          target="_blank"
          rel="noreferrer"
          className="glass flex items-center gap-2.5 rounded-2xl px-5 py-2.5 font-semibold transition hover:scale-105"
        >
          <BrandIcon icon={SOCIAL_ICONS.linkedin} color={SOCIAL_ICONS.linkedin.hex} />
          LinkedIn
        </a>
        <a
          href={profile.github}
          target="_blank"
          rel="noreferrer"
          className="glass flex items-center gap-2.5 rounded-2xl px-5 py-2.5 font-semibold transition hover:scale-105"
        >
          <BrandIcon icon={SOCIAL_ICONS.github} className="h-4 w-4 fill-slate-800 dark:fill-white" color="" />
          GitHub
        </a>
        <a
          href={`tel:${profile.phone.replace(/\s/g, '')}`}
          className="glass flex items-center gap-2.5 rounded-2xl px-5 py-2.5 font-semibold transition hover:scale-105"
        >
          <BrandIcon icon={SOCIAL_ICONS.phone} color={SOCIAL_ICONS.phone.hexDark} />
          <span className="hidden sm:inline">{profile.phone}</span>
          <span className="sm:hidden">Call</span>
        </a>
      </div>
    </section>
  )
}
