import { useEffect, useState } from 'react'
import { supabase, supabaseReady } from '../lib/supabase'
import { useEdition } from '../contexts/EditionContext'
import { useShowState } from '../hooks/useShowState'
import '../game.css'
import '../admin.css'

const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN
const DASHBOARD_TOKEN = import.meta.env.VITE_DASHBOARD_TOKEN
const DASHBOARD_BUILD = import.meta.env.VITE_ENABLE_DASHBOARD === 'true'

const PANIC_SAYINGS = [
  "You are doing GREAT. The crowd doesn't know what hit them.",
  "Nerd Nite runs on chaos and caffeine. You have both.",
  "Every great show felt like this five minutes before it started.",
  "The microphone is hot, the beer is cold, and you've got this.",
  "Science is just vibes with math. You know the vibes.",
  "It's not a disaster. It's an adventure with an audience.",
]

export default function AdminPanel({ token }) {
  const { edition, allEditions } = useEdition()
  const [selectedSlug, setSelectedSlug] = useState(null)
  const activeSlug = selectedSlug ?? edition?.edition
  const { frozen, toggleFrozen, dashboardEnabled, setDashboard, showNonce, saveNonce } = useShowState(activeSlug)
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [panic, setPanic] = useState(false)
  const [saying] = useState(() => PANIC_SAYINGS[Math.floor(Math.random() * PANIC_SAYINGS.length)])
  const [nonceInput, setNonceInput] = useState('')
  const [nonceSaved, setNonceSaved] = useState(false)

  async function handleSaveNonce() {
    await saveNonce(nonceInput)
    setNonceSaved(true)
    setTimeout(() => setNonceSaved(false), 2000)
  }

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

      {/* Panic overlay */}
      {panic && (
        <div className="panic-overlay" onClick={() => setPanic(false)} role="dialog" aria-modal="true">
          <div className="panic-box" onClick={e => e.stopPropagation()}>
            <img
              className="panic-cat"
              src="https://cataas.com/cat/gif"
              alt="A very cute cat"
            />
            <p className="panic-saying">{saying}</p>
            <button className="panic-dismiss" onClick={() => setPanic(false)}>I'M FINE ✓</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="admin-header">
        <div className="admin-title-row">
          <h1 className="admin-title">Admin</h1>
          <button className="panic-btn" onClick={() => setPanic(true)} aria-label="Panic button">
            🐱 PANIC
          </button>
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

        {/* Dashboard control */}
        <div className={`dashboard-control ${!DASHBOARD_BUILD ? 'dashboard-control--disabled' : ''}`}>
          <span className="dashboard-label">DASHBOARD</span>
          <select
            className="dashboard-select"
            value={dashboardEnabled ? 'on' : 'off'}
            onChange={e => DASHBOARD_BUILD && setDashboard(e.target.value === 'on')}
            disabled={!DASHBOARD_BUILD}
            aria-label="Dashboard visibility"
          >
            <option value="off">Off</option>
            <option value="on">Live</option>
          </select>
          {DASHBOARD_BUILD && dashboardEnabled && DASHBOARD_TOKEN && (
            <a
              className="dashboard-link"
              href={`${window.location.origin}${window.location.pathname}?dashboard=${DASHBOARD_TOKEN}`}
              target="_blank"
              rel="noreferrer"
            >
              ↗ Open
            </a>
          )}
          {!DASHBOARD_BUILD && (
            <span className="dashboard-hint">not in this build</span>
          )}
        </div>

        {/* Nonce control */}
        <div className="dashboard-control">
          <span className="dashboard-label">NONCE</span>
          <input
            className="nonce-input"
            type="text"
            value={nonceInput}
            onChange={e => setNonceInput(e.target.value)}
            placeholder={showNonce ?? '(from build)'}
            maxLength={12}
            aria-label="Set live nonce"
          />
          <button className="nonce-save-btn" onClick={handleSaveNonce}>
            {nonceSaved ? 'SAVED ✓' : 'SET'}
          </button>
          {showNonce && <span className="dashboard-hint">DB override active</span>}
        </div>
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
