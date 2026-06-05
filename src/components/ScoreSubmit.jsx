import { useState } from 'react'
import '../game.css'

export default function ScoreSubmit({ score, onDone }) {
  const [name, setName] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    // Supabase submission will go here
    onDone()
  }

  return (
    <div className="submit-screen">
      <div className="submit-card">
        <div className="submit-score-display">{score}</div>
        <div className="submit-score-label">points</div>
        <h2 className="submit-heading">Nice work, nerd.</h2>
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
