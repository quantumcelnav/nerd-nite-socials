import { useState, useRef, useEffect } from 'react'
import { POSTGAME_MODE } from '../data/config'
import { supabase, supabaseReady } from '../lib/supabase'
import '../postgame.css'

const SOCIALS = [
  {
    id: 'fc-fb',
    label: 'Nerd Nite Fort Collins',
    cta: 'Follow us on Facebook',
    sub: 'Stay up to date on upcoming shows',
    href: 'https://www.facebook.com/profile.php?id=100093506363610',
    color: 'var(--cyan)',
  },
  {
    id: 'book',
    label: 'How to Win Friends & Influence Fungi',
    cta: 'Read the book',
    sub: 'The official Nerd Nite book — Amazon',
    href: 'https://www.amazon.com/dp/1250288347?tag=macmillan-20&tag=SMPbkhowtowinfriendssandinfluefungilpgb-20',
    color: 'var(--orange)',
  },
  {
    id: 'global-fb',
    label: 'Nerd Nite Global',
    cta: 'Nerd Nite is worldwide',
    sub: '100+ cities. Find your local show.',
    href: 'https://www.facebook.com/nerdnite',
    color: 'var(--cyan)',
  },
  {
    id: 'instagram',
    label: '@nerdnitereal',
    cta: 'Follow on Instagram',
    sub: 'Photos, stories, and nerd culture',
    href: 'https://www.instagram.com/nerdnitereal',
    color: 'var(--orange)',
  },
]

function SocialsMode({ onDone }) {
  const doneRef = useRef(null)
  useEffect(() => { doneRef.current?.focus() }, [])

  return (
    <div className="postgame-card">
      <div className="postgame-eyebrow">You played. Now spread the word.</div>
      <h2 className="postgame-heading">Spread the Nerd</h2>
      <p className="postgame-sub">
        Help us fill the room. Follow, share, and bring a friend who thinks
        they're smarter than they are.
      </p>

      <ul className="social-cta-list" aria-label="Nerd Nite social channels">
        {SOCIALS.map(s => (
          <li key={s.id}>
            <a
              className="social-cta-item"
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${s.cta} — ${s.sub}`}
              style={{ '--cta-color': s.color }}
            >
              <div className="social-cta-body">
                <span className="social-cta-action">{s.cta}</span>
                <span className="social-cta-sub">{s.sub}</span>
              </div>
              <span className="social-cta-arrow" aria-hidden="true">↗</span>
            </a>
          </li>
        ))}
      </ul>

      <button className="postgame-continue" onClick={onDone} ref={doneRef}>
        See the Leaderboard →
      </button>
    </div>
  )
}

function EmailMode({ onDone }) {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(true)
  const [done, setDone] = useState(false)
  const inputRef = useRef(null)
  const doneRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => { if (done) doneRef.current?.focus() }, [done])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    // Upsert so repeat players don't get a duplicate error
    if (supabaseReady) await supabase.from('emails').upsert(
      { email: email.trim(), subscribed },
      { onConflict: 'email' }
    )
    localStorage.setItem('nn_email_opted_in', '1')
    setDone(true)
  }

  if (done) {
    return (
      <div className="postgame-card">
        <div className="postgame-eyebrow">You're in.</div>
        <h2 className="postgame-heading">See you at the show.</h2>
        <p className="postgame-sub">
          We'll keep you posted on upcoming Nerd Nite Fort Collins events.
          Be there and be square.
        </p>
        <p className="postgame-sig">— Justin Fritz, Nerd Nite Fort Collins Boss</p>
        <button className="postgame-continue" onClick={onDone} ref={doneRef}>
          See the Leaderboard →
        </button>
      </div>
    )
  }

  return (
    <div className="postgame-card">
      <div className="postgame-eyebrow">Stay in the loop.</div>
      <h2 className="postgame-heading">Never Miss a Show</h2>
      <p className="postgame-sub">
        Get Nerd Nite Fort Collins updates — upcoming shows, speakers, and
        events. No spam. Just nerds.
      </p>

      <form className="email-form" onSubmit={handleSubmit} noValidate>
        <label className="email-label" htmlFor="pg-email">Your email address</label>
        <input
          id="pg-email"
          ref={inputRef}
          className="email-input"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          maxLength={120}
          autoComplete="email"
          aria-required="true"
        />
        <label className="email-checkbox-row">
          <input
            type="checkbox"
            checked={subscribed}
            onChange={e => setSubscribed(e.target.checked)}
            aria-label="Subscribe to Nerd Nite Fort Collins updates"
          />
          <span>Yes — send me upcoming show announcements</span>
        </label>
        <button
          className="postgame-continue"
          type="submit"
          disabled={!email.trim()}
        >
          Subscribe
        </button>
      </form>

      <button className="postgame-skip" onClick={onDone}>
        No thanks — take me to the leaderboard
      </button>
    </div>
  )
}

export default function PostGame({ onDone }) {
  return (
    <div className="postgame-screen screen-enter" role="main">
      {POSTGAME_MODE === 'email'
        ? <EmailMode onDone={onDone} />
        : <SocialsMode onDone={onDone} />}
    </div>
  )
}
