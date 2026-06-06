import { useEffect, useState } from 'react'
import { supabase, supabaseReady } from '../lib/supabase'
import { useEdition } from '../contexts/EditionContext'
import '../game.css'

const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN

export default function AdminPanel({ token }) {
  const { edition, allEditions } = useEdition()
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEdition, setSelectedEdition] = useState(null)

  // Gate: token must match env var
  if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) {
    return (
      <div className="app-loading">Access denied.</div>
    )
  }

  const activeEdition = selectedEdition ?? edition?.edition

  useEffect(() => {
    if (!supabaseReady || !activeEdition) return
    setLoading(true)
    supabase
      .from('scores')
      .select('id, name, score, mode, hidden, created_at')
      .eq('edition', activeEdition)
      .order('score', { ascending: false })
      .then(({ data }) => { setScores(data ?? []); setLoading(false) })
  }, [activeEdition])

  async function toggleHidden(row) {
    const { error } = await supabase
      .from('scores')
      .update({ hidden: !row.hidden })
      .eq('id', row.id)
    if (!error) {
      setScores(prev => prev.map(s => s.id === row.id ? { ...s, hidden: !s.hidden } : s))
    }
  }

  const visible = scores.filter(s => !s.hidden)
  const hidden = scores.filter(s => s.hidden)

  return (
    <div className="leaderboard-screen screen-enter" role="main">
      <div className="leaderboard-header">
        <h1 className="leaderboard-title">Admin Panel</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <p className="leaderboard-edition">{activeEdition}</p>
          {allEditions.length > 1 && (
            <select
              className="episode-select"
              value={activeEdition}
              onChange={e => setSelectedEdition(e.target.value)}
              aria-label="Switch edition"
            >
              {allEditions.map((ed, i) => (
                <option key={ed.slug} value={ed.slug}>
                  {ed.label}{i === 0 ? ' (Current)' : ''}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loading ? (
        <p className="lb-loading">Loading…</p>
      ) : scores.length === 0 ? (
        <p className="lb-empty">No scores for this edition.</p>
      ) : (
        <>
          <ol className="leaderboard-list" aria-label="Scores">
            {visible.map((row, i) => (
              <li key={row.id} className={`lb-row ${i === 0 ? 'lb-top' : ''}`}>
                <span className="lb-rank">#{i + 1}</span>
                <span className="lb-name">{row.name}</span>
                <span className="lb-mode" style={{ fontSize: '0.7rem', opacity: 0.6 }}>{row.mode}</span>
                <span className="lb-score">{row.score}</span>
                <button
                  onClick={() => toggleHidden(row)}
                  style={{
                    marginLeft: '0.5rem',
                    background: 'transparent',
                    border: '1px solid var(--orange)',
                    color: 'var(--orange)',
                    fontFamily: 'Courier New',
                    fontSize: '0.7rem',
                    padding: '0.2rem 0.5rem',
                    cursor: 'pointer',
                  }}
                  aria-label={`Hide ${row.name}`}
                >
                  Hide
                </button>
              </li>
            ))}
          </ol>

          {hidden.length > 0 && (
            <>
              <p style={{ padding: '1rem 1.5rem 0.25rem', fontFamily: 'Courier New', fontSize: '0.75rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Hidden ({hidden.length})
              </p>
              <ol className="leaderboard-list" aria-label="Hidden scores" style={{ opacity: 0.4 }}>
                {hidden.map(row => (
                  <li key={row.id} className="lb-row" style={{ textDecoration: 'line-through' }}>
                    <span className="lb-rank">–</span>
                    <span className="lb-name">{row.name}</span>
                    <span className="lb-score">{row.score}</span>
                    <button
                      onClick={() => toggleHidden(row)}
                      style={{
                        marginLeft: '0.5rem',
                        background: 'transparent',
                        border: '1px solid var(--cyan)',
                        color: 'var(--cyan)',
                        fontFamily: 'Courier New',
                        fontSize: '0.7rem',
                        padding: '0.2rem 0.5rem',
                        cursor: 'pointer',
                      }}
                      aria-label={`Restore ${row.name}`}
                    >
                      Restore
                    </button>
                  </li>
                ))}
              </ol>
            </>
          )}
        </>
      )}

      <a className="lb-home-btn" href="/" aria-label="Back to home">
        ← Back to Home
      </a>
    </div>
  )
}
