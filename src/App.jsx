import { useState } from 'react'
import Home from './components/Home'
import Game from './components/Game'
import ScoreSubmit from './components/ScoreSubmit'
import Leaderboard from './components/Leaderboard'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [finalScore, setFinalScore] = useState(0)

  function handleGameComplete(score) {
    setFinalScore(score)
    setScreen('submit')
  }

  return (
    <>
      {screen === 'home' && (
        <Home
          onPlay={() => setScreen('game')}
          onLeaderboard={() => setScreen('leaderboard')}
        />
      )}
      {screen === 'game' && (
        <Game onComplete={handleGameComplete} />
      )}
      {screen === 'submit' && (
        <ScoreSubmit score={finalScore} onDone={() => setScreen('leaderboard')} />
      )}
      {screen === 'leaderboard' && (
        <Leaderboard onHome={() => setScreen('home')} />
      )}
    </>
  )
}
