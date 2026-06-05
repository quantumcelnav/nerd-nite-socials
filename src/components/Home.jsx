import edition from '../data/edition.json'
import posterImg from '../assets/poster_s2026e06.jpg'
import '../App.css'

const PLACEHOLDER_SCORES = [
  { rank: 1, name: 'N. Tesla', score: 900 },
  { rank: 2, name: 'A. Lovelace', score: 800 },
  { rank: 3, name: 'R. Feynman', score: 700 },
]

export default function Home({ onPlay, onLeaderboard, isLiveMode }) {
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

      <div className="hero-poster">
        <img src={posterImg} alt={`Nerd Nite Fort Collins ${edition.edition} poster`} />
      </div>

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
          {PLACEHOLDER_SCORES.map(row => (
            <div key={row.rank} className="score-row">
              <span className="rank">#{row.rank}</span>
              <span className="name">{row.name}</span>
              <span className="score">{row.score}</span>
            </div>
          ))}
          <button className="view-all-btn" onClick={onLeaderboard}
            aria-label="View full leaderboard">
            View Full Leaderboard
          </button>
        </div>
      </section>

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
        <p>Nerd Nite Fort Collins &mdash; Be there and be square</p>
      </footer>
    </>
  )
}
