import { useEffect, useState } from 'react'
import { supabase, supabaseReady } from '../lib/supabase'
import { useEdition } from '../contexts/EditionContext'
import { useShowState } from '../hooks/useShowState'
import '../game.css'
import '../admin.css'

const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN

export default function AdminPanel({ token }) {
  const { edition, allEditions } = useEdition()
  const [selectedSlug, setSelectedSlug] = useState(null)
  const activeSlug = selectedSlug ?? edition?.edition
  const { frozen, toggleFrozen } = useShowState(activeSlug)
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)

  if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) {
    return <div className="app-loading">Access denied.</div>
  }

  useEffect(() => {
    if (!supabaseReady || !activeSlug) return
    setLoading(true)
    supabase
      .from('scores')
      .select('id, name, score, mode, hidden, created_at')
      .eq('edition', activeSlug)
      .order('score', { ascending: false })
      .then(({ data }) => { setScores(data ?? []); setLoading(false) })
  }, [activeSlug])

  async function toggleHidden(row) {
    const { error } = await supabase
      .from('scores')
      .update({ hidden: !row.hidden })
      .eq('id', row.id)
    if (!error) {
      setScores(prev => prev.map(s => s.id === row.id ? { ...s, hidden: !s.hidden } : s))
    }
  }

  async function deleteScore(row) {
    if (!window.confirm(`Permanently delete "${row.name}"? This cannot be undone.`)) return
    const { error } = await supabase
      .from('scores')
      .delete()
      .eq('id', row.id)
    if (!error) {
      setScores(prev => prev.filter(s => s.id !== row.id))
    } else {
      alert('Delete failed — run this SQL in Supabase:\nCREATE POLICY "delete_hidden_scores" ON scores FOR DELETE TO anon USING (hidden = true);')
    }
  }

  const visible = scores.filter(s => !s.hidden)
  const hidden = scores.filter(s => s.hidden)

  return (
    <div className="admin-screen screen-enter" role="main">

      {/* Header */}
      <div className="admin-header">
        <div className="admin-title-row">
          <h1 className="admin-title">Admin</h1>
          {allEditions.length > 1 ? (
            <select
              className="episode-select"
              value={activeSlug}
              onChange={e => setSelectedSlug(e.target.value)}
              aria-label="Switch edition"
            >
              {allEditions.map((ed, i) => (
                <option key={ed.slug} value={ed.slug}>
                  {ed.label}{i === 0 ? ' (Current)' : ''}
                </option>
              ))}
            </select>
          ) : (
            <span className="admin-edition-label">{activeSlug}</span>
          )}
        </div>

        {/* Freeze toggle */}
        <button
          className={`freeze-toggle ${frozen ? 'freeze-toggle--frozen' : 'freeze-toggle--live'}`}
          onClick={toggleFrozen}
          aria-label={frozen ? 'Leaderboard is frozen — click to go live' : 'Leaderboard is live — click to freeze'}
        >
          {frozen ? '▶ GO LIVE' : '■ FREEZE LEADERBOARD'}
        </button>
        <p className="freeze-status">
          {frozen
            ? 'Leaderboard frozen — no new scores accepted'
            : 'Leaderboard live — accepting scores'}
        </p>
      </div>

      {/* Scores */}
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
                <span className="lb-mode">{row.mode}</span>
                <span className="lb-score">{row.score}</span>
                <button className="admin-action-btn admin-action-btn--hide"
                  onClick={() => toggleHidden(row)}
                  aria-label={`Hide ${row.name}`}>
                  Hide
                </button>
              </li>
            ))}
          </ol>

          {hidden.length > 0 && (
            <>
              <p className="admin-section-label">Hidden ({hidden.length})</p>
              <ol className="leaderboard-list admin-hidden-list" aria-label="Hidden scores">
                {hidden.map(row => (
                  <li key={row.id} className="lb-row">
                    <span className="lb-rank">–</span>
                    <span className="lb-name">{row.name}</span>
                    <span className="lb-score">{row.score}</span>
                    <button className="admin-action-btn admin-action-btn--restore"
                      onClick={() => toggleHidden(row)}
                      aria-label={`Restore ${row.name}`}>
                      Restore
                    </button>
                    <button className="admin-action-btn admin-action-btn--delete"
                      onClick={() => deleteScore(row)}
                      aria-label={`Permanently delete ${row.name}`}>
                      Delete
                    </button>
                  </li>
                ))}
              </ol>
            </>
          )}
        </>
      )}

      <a className="lb-home-btn" href="/" aria-label="Back to home">← Back to Home</a>
    </div>
  )
}
