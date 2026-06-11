import { useEffect, useState } from 'react'
import { useEdition } from '../contexts/EditionContext'
import { supabase, supabaseReady } from '../lib/supabase'
import { NN_STATES } from '../data/nnStates'
import '../showpack.css'

const HAND_SIGNALS = [
  { signal: '👍  Thumb up',        meaning: 'Advance to next state' },
  { signal: '✋  Flat hand',        meaning: 'Hold — do not advance yet' },
  { signal: '✌️  Two fingers',      meaning: '2-minute warning to speaker' },
  { signal: '👆  One finger up',   meaning: 'One more question / one more minute' },
  { signal: '🤙  Call me',         meaning: 'Come find me — something needs attention' },
  { signal: '🔄  Spinning finger', meaning: 'Wrap it up now' },
  { signal: '❌  Cross arms',      meaning: 'Stop / abort — come to me immediately' },
]

export default function ShowPack({ token }) {
  const { edition } = useEdition()
  const [scores, setScores] = useState([])
  const [printTime] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))

  const COCKPIT_TOKEN = import.meta.env.VITE_COCKPIT_TOKEN
  if (!COCKPIT_TOKEN || token !== COCKPIT_TOKEN) {
    return <div style={{ padding: '2rem', fontFamily: 'monospace' }}>Access denied.</div>
  }

  useEffect(() => {
    if (!supabaseReady || !edition?.edition) return
    supabase
      .from('scores')
      .select('name, score, mode')
      .eq('edition', edition.edition)
      .eq('hidden', false)
      .order('score', { ascending: false })
      .limit(20)
      .then(({ data }) => setScores(data ?? []))
  }, [edition?.edition])

  if (!edition) return <div style={{ padding: '2rem', fontFamily: 'monospace' }}>Loading…</div>

  return (
    <div className="pack-root">
      <div className="pack-no-print">
        <button onClick={() => window.print()} className="pack-print-btn">
          🖨 Print Show Pack
        </button>
        <span className="pack-hint">Print before the show. Keep one copy per boss.</span>
      </div>

      {/* Cover */}
      <div className="pack-header">
        <div className="pack-title">SHOW PACK</div>
        <div className="pack-show">{edition.edition} — {edition.date}</div>
        <div className="pack-venue">{edition.venue}</div>
        <div className="pack-meta">
          Doors {edition.doorsOpen} · Show {edition.talksStart} · {edition.admission}
        </div>
        <div className="pack-printed">Printed {printTime} — verify current leaderboard before doors</div>
      </div>

      {/* Speakers */}
      <section className="pack-section">
        <h2 className="pack-section-title">TONIGHT'S LINEUP</h2>
        <table className="pack-table">
          <thead>
            <tr><th>#</th><th>Speaker</th><th>Talk</th></tr>
          </thead>
          <tbody>
            {edition.talks?.map((talk, i) => (
              <tr key={talk.id}>
                <td>{i + 1}</td>
                <td>{talk.speaker}</td>
                <td>{talk.title}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Runsheet */}
      <section className="pack-section">
        <h2 className="pack-section-title">RUNSHEET</h2>
        <div className="pack-states">
          {NN_STATES.map((state, idx) => (
            <div key={state.id} className="pack-state">
              <div className="pack-state-header">
                <span className="pack-state-num">{idx + 1}</span>
                <span className="pack-state-label">{state.label}</span>
                <span className="pack-state-box">TIME: ______</span>
              </div>
              {state.checklist.filter(i => i.owner !== 'auto').length > 0 && (
                <ul className="pack-checklist">
                  {state.checklist
                    .filter(item => item.owner !== 'auto')
                    .map(item => (
                      <li key={item.key}>
                        <span className="pack-check-box">☐</span>
                        {item.label}
                        <span className="pack-owner">[{item.owner}]</span>
                      </li>
                    ))
                  }
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Leaderboard snapshot */}
      <section className="pack-section">
        <h2 className="pack-section-title">LEADERBOARD SNAPSHOT <span className="pack-snapshot-time">(as of {printTime})</span></h2>
        {scores.length === 0 ? (
          <p className="pack-empty">No scores yet — print again after trivia opens.</p>
        ) : (
          <table className="pack-table">
            <thead><tr><th>#</th><th>Name</th><th>Score</th><th>Mode</th></tr></thead>
            <tbody>
              {scores.map((s, i) => (
                <tr key={i} className={i < 3 ? 'pack-top' : ''}>
                  <td>{i + 1}</td>
                  <td>{s.name}</td>
                  <td>{s.score}</td>
                  <td>{s.mode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Hand signals */}
      <section className="pack-section">
        <h2 className="pack-section-title">HAND SIGNALS</h2>
        <p className="pack-signals-note">
          Use when crew phones are down or mid-talk communication is needed.
          Boss → stage or stage → boss.
        </p>
        <table className="pack-table">
          <tbody>
            {HAND_SIGNALS.map(({ signal, meaning }) => (
              <tr key={signal}>
                <td className="pack-signal-glyph">{signal}</td>
                <td>{meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Emergency contacts */}
      <section className="pack-section">
        <h2 className="pack-section-title">CONTACTS</h2>
        <table className="pack-table">
          <thead><tr><th>Role</th><th>Name</th><th>Phone / Signal</th></tr></thead>
          <tbody>
            <tr><td>Boss</td><td>Justin Fritz</td><td>_______________</td></tr>
            <tr><td>Host</td><td>Hannah Bauer</td><td>_______________</td></tr>
            <tr><td>Social</td><td>Jamie Fritz</td><td>_______________</td></tr>
            <tr><td>Venue</td><td>Wolverine Farm</td><td>_______________</td></tr>
            <tr><td>Sound</td><td></td><td>_______________</td></tr>
          </tbody>
        </table>
      </section>

      <div className="pack-footer">
        Nerd Nite Fort Collins · TCAEvent OS · {edition.edition}
      </div>
    </div>
  )
}
