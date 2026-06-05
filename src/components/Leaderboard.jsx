import { useEffect, useRef } from 'react'
import edition from '../data/edition.json'
import '../game.css'

const MOCK_SCORES = [
  { rank: 1, name: 'N. Tesla',    score: 900 },
  { rank: 2, name: 'A. Lovelace', score: 800 },
  { rank: 3, name: 'R. Feynman',  score: 700 },
  { rank: 4, name: 'M. Curie',    score: 600 },
  { rank: 5, name: 'C. Sagan',    score: 500 },
]

export default function Leaderboard({ onHome }) {
  const homeRef = useRef(null)
  useEffect(() => { homeRef.current?.focus() }, [])

  return (
    <div className="leaderboard-screen screen-enter" role="main">
      <div className="leaderboard-header">
        <h1 className="leaderboard-title">Leaderboard</h1>
        <p className="leaderboard-edition">{edition.edition}</p>
      </div>
      <ol className="leaderboard-list" aria-label="Top scores">
        {MOCK_SCORES.map(row => (
          <li key={row.rank} className={`lb-row ${row.rank === 1 ? 'lb-top' : ''}`}
            aria-label={`Rank ${row.rank}: ${row.name}, ${row.score} points`}>
            <span className="lb-rank" aria-hidden="true">#{row.rank}</span>
            <span className="lb-name">{row.name}</span>
            <span className="lb-score" aria-hidden="true">{row.score}</span>
          </li>
        ))}
      </ol>
      <button className="lb-home-btn" onClick={onHome} ref={homeRef}
        aria-label="Back to home screen">
        ← Back to Home
      </button>
    </div>
  )
}
