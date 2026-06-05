import edition from '../data/edition.json'
import '../App.css'

const PLACEHOLDER_SCORES = [
  { rank: 1, name: 'N. Tesla', score: 900 },
  { rank: 2, name: 'A. Lovelace', score: 800 },
  { rank: 3, name: 'R. Feynman', score: 700 },
]

export default function Home({ onPlay, onLeaderboard }) {
  return (
    <>
      <header className="header">
        <div className="header-title">
          <h1>Nerdometer</h1>
          <span className="tagline">How nerdy are you, really?</span>
        </div>
      </header>

      <section className="hero">
        <div className="hero-image">
          <span className="hero-image-placeholder">🧠</span>
        </div>
        <div className="hero-text">
          <div>
            <h2>Edition: {edition.edition}</h2>
            <p>
              Trivia built around tonight's Nerd Nite Fort Collins talks.
              Answer questions, unlock the Nerd Nite origin story, and
              climb the leaderboard.
            </p>
          </div>
          <button className="play-btn" onClick={onPlay}>Play Now</button>
        </div>
      </section>

      <section className="info-strip">
        <div className="info-text">
          <h3>Tonight's Talks</h3>
          {edition.talks.map(t => (
            <div key={t.id} className="talk-row">
              <strong>{t.title}</strong>
              <em>{t.speaker}</em>
            </div>
          ))}
        </div>
        <div className="leaderboard-panel">
          <h3>Top Scores</h3>
          {PLACEHOLDER_SCORES.map(row => (
            <div key={row.rank} className="score-row">
              <span className="rank">#{row.rank}</span>
              <span className="name">{row.name}</span>
              <span className="score">{row.score}</span>
            </div>
          ))}
          <button className="view-all-btn" onClick={onLeaderboard}>
            View Full Leaderboard
          </button>
        </div>
      </section>

      <section className="social-section">
        <h3>Find Us Online</h3>
        <div className="social-links">
          <a className="social-link" href="#" aria-label="Facebook">Facebook</a>
          <a className="social-link" href="#" aria-label="Instagram">Instagram</a>
          <a className="social-link" href="#" aria-label="Meetup">Meetup</a>
        </div>
      </section>

      <footer className="footer">
        <p>Nerd Nite Fort Collins &mdash; Be there and be square</p>
      </footer>
    </>
  )
}
