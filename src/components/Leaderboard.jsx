import edition from '../data/edition.json'
import '../game.css'

const MOCK_SCORES = [
  { rank: 1, name: 'N. Tesla', score: 900 },
  { rank: 2, name: 'A. Lovelace', score: 800 },
  { rank: 3, name: 'R. Feynman', score: 700 },
  { rank: 4, name: 'M. Curie', score: 600 },
  { rank: 5, name: 'C. Sagan', score: 500 },
]

export default function Leaderboard({ onHome }) {
  return (
    <div className="leaderboard-screen">
      <div className="leaderboard-header">
        <h1 className="leaderboard-title">Leaderboard</h1>
        <p className="leaderboard-edition">{edition.edition}</p>
      </div>
      <div className="leaderboard-list">
        {MOCK_SCORES.map(row => (
          <div key={row.rank} className={`lb-row ${row.rank === 1 ? 'lb-top' : ''}`}>
            <span className="lb-rank">#{row.rank}</span>
            <span className="lb-name">{row.name}</span>
            <span className="lb-score">{row.score}</span>
          </div>
        ))}
      </div>
      <button className="lb-home-btn" onClick={onHome}>← Back to Home</button>
    </div>
  )
}
