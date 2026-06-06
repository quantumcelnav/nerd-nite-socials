import { useEffect, useRef, useState } from 'react'
import { supabase, supabaseReady } from '../lib/supabase'
import { useEdition } from '../contexts/EditionContext'
import '../game.css'

const MODE_LABEL = { trivia: 'Trivia', ontology: 'What Is It?' }

// A show is frozen when it has no nonce and is being viewed at a past-show URL
function useIsFrozen(edition) {
  const isArchiveUrl = window.location.pathname.length > 1
  return isArchiveUrl && !edition?.nonce
}

export default function Leaderboard({ onHome }) {
  const { edition } = useEdition()
  const isFrozen = useIsFrozen(edition)
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const homeRef = useRef(null)

  useEffect(() => { homeRef.current?.focus() }, [])

  useEffect(() => {
    if (!supabaseReady) { setLoading(false); return }

    supabase
      .from('scores')
      .select('name, score, mode')
      .eq('edition', edition.edition)
      .neq('hidden', true)
      .order('score', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setScores(data ?? [])
        setLoading(false)
      })

    // Only subscribe to live updates for active (non-frozen) shows
    if (isFrozen) return

    const channel = supabase
      .channel('scores-live')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'scores',
          filter: `edition=eq.${edition.edition}` },
        () => {
          supabase
            .from('scores')
            .select('name, score, mode')
            .eq('edition', edition.edition)
            .neq('hidden', true)
            .order('score', { ascending: false })
            .limit(10)
            .then(({ data }) => setScores(data ?? []))
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [isFrozen])

  return (
    <div className="leaderboard-screen screen-enter" role="main">
      <div className="leaderboard-header">
        <h1 className="leaderboard-title">Leaderboard</h1>
        <p className="leaderboard-edition">{edition.edition}</p>
        {isFrozen && (
          <p className="lb-frozen-badge" aria-label="This leaderboard is final">
            ■ Final Results
          </p>
        )}
      </div>

      {loading ? (
        <p className="lb-loading">Loading scores…</p>
      ) : scores.length === 0 ? (
        <p className="lb-empty">No scores yet — be the first!</p>
      ) : (
        <ol className="leaderboard-list" aria-label="Top scores">
          {scores.map((row, i) => (
            <li key={i} className={`lb-row ${i === 0 ? 'lb-top' : ''}`}
              aria-label={`Rank ${i + 1}: ${row.name}, ${row.score} points`}>
              <span className="lb-rank" aria-hidden="true">#{i + 1}</span>
              <span className="lb-name">{row.name}</span>
              <span className="lb-mode">{MODE_LABEL[row.mode] ?? row.mode}</span>
              <span className="lb-score" aria-hidden="true">{row.score}</span>
            </li>
          ))}
        </ol>
      )}

      <button className="lb-home-btn" onClick={onHome} ref={homeRef}
        aria-label="Back to home screen">
        ← Back to Home
      </button>
    </div>
  )
}
