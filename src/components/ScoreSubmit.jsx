import { useState } from 'react'
import { getTier } from '../data/scoring'
import '../game.css'

export default function ScoreSubmit({ score, maxScore, onDone }) {
  const [name, setName] = useState('')
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  const tier = getTier(pct)

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    // Supabase submission will go here
    onDone()
  }

  return (
    <div className="submit-screen">
      <div className="submit-card">
        <div className="submit-meter-label">Your Nerdometer reading</div>
        <div className="submit-pct" style={{ color: tier.color }}>{pct}%</div>
        <div className="submit-tier" style={{ color: tier.color }}>{tier.label}</div>

        <div className="submit-meter-bar">
          <div
            className="submit-meter-fill"
            style={{ width: `${pct}%`, background: tier.color }}
          />
        </div>

        <div className="submit-score-raw">{score} / {maxScore} pts</div>

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
          />
          <button className="submit-btn" type="submit" disabled={!name.trim()}>
            Submit Score
          </button>
        </form>
        <button className="skip-btn" onClick={onDone}>
          Skip — just show me the leaderboard
        </button>
      </div>
    </div>
  )
}
