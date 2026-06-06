import { useEffect, useState } from 'react'
import { supabase, supabaseReady } from '../lib/supabase'
import '../game.css'

export default function HallOfFame() {
  const [winners, setWinners] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabaseReady) { setLoading(false); return }

    supabase
      .from('scores')
      .select('edition, name, score')
      .neq('hidden', true)
      .order('score', { ascending: false })
      .then(({ data }) => {
        // Keep highest score per edition, sort newest edition first
        const byEdition = {}
        for (const row of data ?? []) {
          if (!byEdition[row.edition]) byEdition[row.edition] = row
        }
        setWinners(
          Object.values(byEdition).sort((a, b) => b.edition.localeCompare(a.edition))
        )
        setLoading(false)
      })
  }, [])

  return (
    <div className="leaderboard-screen screen-enter" role="main">
      <div className="leaderboard-header">
        <h1 className="leaderboard-title">Hall of Fame</h1>
        <p className="leaderboard-edition">All-time top scorer per show</p>
      </div>

      {loading ? (
        <p className="lb-loading">Loading…</p>
      ) : winners.length === 0 ? (
        <p className="lb-empty">No shows on record yet.</p>
      ) : (
        <ol className="leaderboard-list" aria-label="Hall of fame">
          {winners.map((row, i) => (
            <li key={row.edition} className={`lb-row ${i === 0 ? 'lb-top' : ''}`}
              aria-label={`${row.edition}: ${row.name}, ${row.score} points`}>
              <span className="lb-rank" aria-hidden="true">{row.edition}</span>
              <span className="lb-name">{row.name}</span>
              <span className="lb-score" aria-hidden="true">{row.score}</span>
            </li>
          ))}
        </ol>
      )}

      <a className="lb-home-btn" href="/" aria-label="Back to home screen">
        ← Back to Home
      </a>
    </div>
  )
}
