import { useEffect, useState } from 'react'
import { useEdition } from '../contexts/EditionContext'
import { supabase, supabaseReady } from '../lib/supabase'
import '../App.css'

const posters = import.meta.glob('../assets/poster_*.{jpg,png}', { eager: true })

function EpisodeDropdown({ currentSlug, allEditions, isLiveMode }) {
  if (allEditions.length <= 1) return null
  if (isLiveMode) return null

  function handleChange(e) {
    const slug = e.target.value
    window.location.href = slug === allEditions[0].slug ? '/' : `/${slug}`
  }

  return (
    <div className="episode-switcher">
      <label className="episode-switcher-label" htmlFor="episode-select">Past episodes</label>
      <select
        id="episode-select"
        className="episode-select"
        value={currentSlug}
        onChange={handleChange}
        aria-label="Switch to a past episode"
      >
        {allEditions.map((ed, i) => (
          <option key={ed.slug} value={ed.slug}>
            {ed.label}{i === 0 ? ' (Current)' : ''}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function Home({ onPlay, onLeaderboard, isLiveMode }) {
  const { edition, allEditions } = useEdition()
  const [topScores, setTopScores] = useState([])

  const posterImg = edition?.poster
    ? (posters[`../assets/${edition.poster}`]?.default ?? null)
    : null

  useEffect(() => {
    if (!supabaseReady || !edition) return
    supabase
      .from('scores')
      .select('name, score')
      .eq('edition', edition.edition)
      .neq('hidden', true)
      .order('score', { ascending: false })
      .limit(3)
      .then(({ data }) => setTopScores(data ?? []))
  }, [edition])

  if (!edition) return null

  return (
    <>
      <header className="header">
        <div className="header-title">
          <h1>Nerdometer</h1>
          <span className="tagline">How nerdy are you, really?</span>
        </div>
        {isLiveMode && (
          <div className="live-badge" aria-label="Live show mode active">
            LIVE TONIGHT
          </div>
        )}
        <div className="header-credit">
          Presented by <strong>Justin Fritz</strong><br />
          <em>Nerd Nite Fort Collins Boss</em>
        </div>
      </header>

      <section className="mode-select">
        <button className="mode-btn mode-trivia" onClick={() => onPlay('trivia')}
          aria-label="Play Trivia — test your knowledge of tonight's talks">
          <span className="mode-icon">🧠</span>
          <span className="mode-label">Trivia</span>
          <span className="mode-desc">Test your knowledge of tonight's talks</span>
        </button>
        <button className="mode-btn mode-ontology" onClick={() => onPlay('ontology')}
          aria-label="What Is It? — explore the nature of things">
          <span className="mode-icon">💭</span>
          <span className="mode-label">What Is It?</span>
          <span className="mode-desc">Explore the nature of things</span>
        </button>
      </section>

      {posterImg && (
        <div className="hero-poster">
          <img src={posterImg} alt={`Nerd Nite Fort Collins ${edition.edition} poster`} />
        </div>
      )}

      <section className="info-strip">
        <div className="info-text">
          <h3>Tonight's Talks</h3>
          <div className="event-meta">
            <span>{edition.date}</span>
            <span>{edition.venue}</span>
            <span>Doors {edition.doorsOpen} &middot; Talks {edition.talksStart}</span>
            <span>{edition.admission}</span>
          </div>
          {edition.talks.map(t => (
            <div key={t.id} className="talk-row">
              <strong>{t.title}</strong>
              <em>{t.speaker}</em>
            </div>
          ))}
          {edition.ticketUrl && (
            <a className="ticket-link" href={edition.ticketUrl} target="_blank" rel="noopener noreferrer">
              Get Tickets →
            </a>
          )}
        </div>
        <div className="leaderboard-panel">
          <h3>Top Scores</h3>
          {topScores.length === 0 ? (
            <p className="lb-empty-home">No scores yet — be the first!</p>
          ) : (
            topScores.map((row, i) => (
              <div key={i} className="score-row">
                <span className="rank">#{i + 1}</span>
                <span className="name">{row.name}</span>
                <span className="score">{row.score}</span>
              </div>
            ))
          )}
          <button className="view-all-btn" onClick={onLeaderboard}
            aria-label="View full leaderboard">
            View Full Leaderboard
          </button>
        </div>
      </section>

      <EpisodeDropdown currentSlug={edition.edition} allEditions={allEditions} isLiveMode={isLiveMode} />

      <section className="social-section">
        <h3>Find Us Online</h3>
        <div className="social-links">
          <a className="social-link"
            href="https://www.facebook.com/profile.php?id=100093506363610"
            target="_blank" rel="noopener noreferrer"
            aria-label="Nerd Nite Fort Collins on Facebook">
            Fort Collins
          </a>
          <a className="social-link"
            href="https://www.facebook.com/nerdnite"
            target="_blank" rel="noopener noreferrer"
            aria-label="Nerd Nite Global on Facebook">
            Facebook
          </a>
          <a className="social-link"
            href="https://www.instagram.com/nerdnitereal"
            target="_blank" rel="noopener noreferrer"
            aria-label="Nerd Nite on Instagram">
            Instagram
          </a>
          <a className="social-link"
            href="https://www.amazon.com/dp/1250288347?tag=macmillan-20&tag=SMPbkhowtowinfriendssandinfluefungilpgb-20"
            target="_blank" rel="noopener noreferrer"
            aria-label="How to Win Friends and Influence Fungi — the Nerd Nite book">
            The Book 📗
          </a>
        </div>
      </section>

      <footer className="footer">
        <p>Nerd Nite Fort Collins &mdash; Be there and be square &mdash; {new Date().getFullYear()}</p>
        <a className="hof-link" href="/?hof=1" aria-label="Hall of Fame — top scorer from every show">
          🏆 Hall of Fame
        </a>
      </footer>
    </>
  )
}
