import { useState, useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import { getTier } from '../data/scoring'
import ShareCard from './ShareCard'
import { supabase, supabaseReady } from '../lib/supabase'
import { useEdition } from '../contexts/EditionContext'
import { useShowState } from '../hooks/useShowState'
import { isBlocked } from '../data/blocklist'
import '../game.css'

function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) return
    const start = performance.now()
    function step(now) {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setCount(Math.round(eased * target))
      if (t < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return count
}

function fireConfetti() {
  const colors = ['#00b8d9', '#e05c1a', '#f5f5f0', '#f5c518']
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors })
  setTimeout(() => confetti({ particleCount: 60, spread: 120, origin: { y: 0.4 }, colors }), 300)
  setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 60, origin: { x: 0 }, colors }), 500)
  setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 60, origin: { x: 1 }, colors }), 600)
}

export default function ScoreSubmit({ score, maxScore, mode, isLiveMode, onDone }) {
  const { edition } = useEdition()
  const { frozen } = useShowState(edition?.edition)
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [shareFeedback, setShareFeedback] = useState(null)
  const [meterWidth, setMeterWidth] = useState(0)
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  const tier = getTier(pct)
  const displayPct = useCountUp(pct, 1400)
  const confettiFired = useRef(false)

  useEffect(() => {
    const t = setTimeout(() => setMeterWidth(pct), 100)
    return () => clearTimeout(t)
  }, [pct])

  useEffect(() => {
    if (tier.label === 'Nerd Nite Boss' && !confettiFired.current) {
      confettiFired.current = true
      setTimeout(fireConfetti, 800)
    }
  }, [tier.label])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || submitting) return
    if (isBlocked(name)) {
      setSubmitError('That name isn\'t going to fly. Try something else.')
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    if (supabaseReady) {
      const { error } = await supabase.from('scores').insert({
        edition: edition.edition,
        name: name.trim(),
        score,
        max_score: maxScore,
        mode,
      })
      if (error) {
        setSubmitError('Could not save score — try again.')
        setSubmitting(false)
        return
      }
    }
    onDone()
  }

  const modeLabel = mode === 'ontology' ? 'What Is It?' : 'Trivia'

  return (
    <div className="submit-screen screen-enter">
      <div className="submit-card">
        <div className="submit-mode-tag">{modeLabel}</div>
        <div className="submit-meter-label">Your Nerdometer Reading</div>
        <div className="submit-pct" style={{ color: tier.color }}>{displayPct}%</div>
        <div className="submit-tier" style={{ color: tier.color }}>{tier.label}</div>

        <div className="submit-meter-bar" role="meter" aria-valuenow={pct} aria-valuemax={100}>
          <div className="submit-meter-fill"
            style={{ width: `${meterWidth}%`, background: tier.color }} />
        </div>

        <div className="submit-score-raw">{score} / {maxScore} pts</div>

        {tier.label === 'Nerd Nite Boss' && (
          <p className="submit-boss-msg">You are the real deal. 🎓</p>
        )}

        {isLiveMode && frozen ? (
          <p className="submit-practice-msg">
            The leaderboard is closed for tonight.
            <br />
            <span>Great game — the final scores are locked in.</span>
          </p>
        ) : isLiveMode ? (
          <>
            <p className="submit-subtext">Enter your name for the leaderboard.</p>
            <form className="submit-form" onSubmit={handleSubmit}>
              <input
                className="submit-input"
                type="text"
                placeholder="Your name or handle"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={24}
                autoFocus
                aria-label="Your name or handle"
              />
              {submitError && <p className="submit-error">{submitError}</p>}
              <button className="submit-btn" type="submit" disabled={!name.trim() || submitting}>
                {submitting ? 'Saving…' : 'Submit Score'}
              </button>
            </form>
          </>
        ) : (
          <p className="submit-practice-msg">
            You're in practice mode &mdash; scores don't count tonight.
            <br />
            <span>Come to Nerd Nite and scan the QR code to get on the leaderboard.</span>
          </p>
        )}
        <ShareCard pct={pct} tier={tier} mode={mode}
          onShare={(type) => {
            setShareFeedback(type === 'copied' ? 'Copied to clipboard!' : null)
            setTimeout(() => setShareFeedback(null), 2500)
          }} />
        {shareFeedback && <p className="share-feedback">{shareFeedback}</p>}
        <button className="skip-btn" onClick={onDone}>
          Skip — just show me the leaderboard
        </button>
      </div>
    </div>
  )
}
