import { useState } from 'react'
import Home from './components/Home'
import Game from './components/Game'
import OntologyGame from './components/OntologyGame'
import ScoreSubmit from './components/ScoreSubmit'
import Leaderboard from './components/Leaderboard'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [finalScore, setFinalScore] = useState(0)
  const [maxScore, setMaxScore] = useState(0)
  const [gameMode, setGameMode] = useState('trivia') // 'trivia' | 'ontology'

  function handleGameComplete(score, max) {
    setFinalScore(score)
    setMaxScore(max)
    setScreen('submit')
  }

  function handlePlay(mode) {
    setGameMode(mode)
    setScreen('game')
  }

  return (
    <div className="app-root">
      {screen === 'home' && (
        <div className="screen-enter" key="home">
          <Home onPlay={handlePlay} onLeaderboard={() => setScreen('leaderboard')} />
        </div>
      )}
      {screen === 'game' && gameMode === 'trivia' && (
        <div className="screen-enter" key="game">
          <Game onComplete={handleGameComplete} />
        </div>
      )}
      {screen === 'game' && gameMode === 'ontology' && (
        <div className="screen-enter" key="ontology">
          <OntologyGame onComplete={handleGameComplete} />
        </div>
      )}
      {screen === 'submit' && (
        <div className="screen-enter" key="submit">
          <ScoreSubmit
            score={finalScore}
            maxScore={maxScore}
            mode={gameMode}
            onDone={() => setScreen('leaderboard')}
          />
        </div>
      )}
      {screen === 'leaderboard' && (
        <div className="screen-enter" key="leaderboard">
          <Leaderboard onHome={() => setScreen('home')} />
        </div>
      )}
    </div>
  )
}
