import { useState } from 'react'
import Home from './components/Home'
import Game from './components/Game'
import OntologyGame from './components/OntologyGame'
import ScoreSubmit from './components/ScoreSubmit'
import PostGame from './components/PostGame'
import Leaderboard from './components/Leaderboard'
import QRSlide from './components/QRSlide'
import { useNonce } from './hooks/useNonce'

export default function App() {
  const [screen, setScreen] = useState('home')
  const isLiveMode = useNonce()

  // Projector mode: ?qr=1 shows the full-screen QR slide only
  const isQRMode = new URLSearchParams(window.location.search).get('qr') === '1'
  if (isQRMode) return <QRSlide />
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
          <Home onPlay={handlePlay} onLeaderboard={() => setScreen('leaderboard')} isLiveMode={isLiveMode} />
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
            isLiveMode={isLiveMode}
            onDone={() => setScreen('postgame')}
          />
        </div>
      )}
      {screen === 'postgame' && (
        <div className="screen-enter" key="postgame">
          <PostGame onDone={() => setScreen('leaderboard')} />
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
