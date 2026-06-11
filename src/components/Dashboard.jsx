import { useEffect, useState } from 'react'
import { supabase, supabaseReady } from '../lib/supabase'
import { useShowState } from '../hooks/useShowState'
import { useEdition } from '../contexts/EditionContext'
import '../dashboard.css'

const MODE_LABEL = { trivia: 'TRIVIA', ontology: 'WHAT IS IT?' }

export default function Dashboard() {
  const { edition } = useEdition()
  const { frozen, dashboardEnabled } = useShowState(edition?.edition)
  const [scores, setScores] = useState([])

  function fetchScores() {
    if (!supabaseReady || !edition?.edition) return
    supabase
      .from('scores')
      .select('name, score, mode')
      .eq('edition', edition.edition)
      .neq('hidden', true)
      .order('score', { ascending: false })
      .limit(10)
      .then(({ data }) => setScores(data ?? []))
  }

  useEffect(() => {
    fetchScores()
    if (frozen) return

    const channel = supabase
      .channel('dashboard-scores')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'scores',
          filter: `edition=eq.${edition?.edition}` },
        fetchScores
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [frozen, edition?.edition])

  if (!dashboardEnabled) {
    return (
      <div className="dash-offline">
        <span className="dash-offline-text">DASHBOARD OFFLINE</span>
      </div>
    )
  }

  return (
    <div className="dash-root">
      <header className="dash-header">
        <span className="dash-title">NERD NITE FORT COLLINS</span>
        <span className="dash-edition">{edition?.edition}</span>
        {frozen && <span className="dash-frozen">■ FINAL RESULTS</span>}
      </header>

      <div className="dash-board">
        {scores.length === 0 ? (
          <p className="dash-empty">Waiting for scores…</p>
        ) : (
          <ol className="dash-list">
            {scores.map((row, i) => (
              <li key={i} className={`dash-row ${i === 0 ? 'dash-row--top' : ''}`}>
                <span className="dash-rank">#{i + 1}</span>
                <span className="dash-name">{row.name}</span>
                <span className="dash-mode">{MODE_LABEL[row.mode] ?? row.mode}</span>
                <span className="dash-score">{row.score}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <footer className="dash-footer">
        <span>Be there and be square</span>
        <span className="dash-dot">·</span>
        <span>fortcollins.nerdnite.com</span>
      </footer>
    </div>
  )
}
