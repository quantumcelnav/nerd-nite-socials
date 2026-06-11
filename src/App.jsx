import { useState, useEffect } from 'react'
import { EditionProvider, useEdition } from './contexts/EditionContext'
import Home from './components/Home'
import Game from './components/Game'
import OntologyGame from './components/OntologyGame'
import ScoreSubmit from './components/ScoreSubmit'
import PostGame from './components/PostGame'
import Leaderboard from './components/Leaderboard'
import HallOfFame from './components/HallOfFame'
import AdminPanel from './components/AdminPanel'
import Dashboard from './components/Dashboard'
import Cockpit from './components/Cockpit'
import QRSlide from './components/QRSlide'
import ErrorBoundary from './components/ErrorBoundary'
import { useNonce } from './hooks/useNonce'
import { supabase, supabaseReady } from './lib/supabase'

const DASHBOARD_TOKEN = import.meta.env.VITE_DASHBOARD_TOKEN
const DASHBOARD_BUILD = import.meta.env.VITE_ENABLE_DASHBOARD === 'true'

function getEditionSlug() {
  const slug = window.location.pathname.slice(1).replace(/\/$/, '').toUpperCase()
  return /^S\d{4}E\d{2}$/.test(slug) ? slug : null
}

function AppInner() {
  const { edition, loading } = useEdition()
  const [screen, setScreen] = useState('home')
  const [finalScore, setFinalScore] = useState(0)
  const [maxScore, setMaxScore] = useState(0)
  const [gameMode, setGameMode] = useState('trivia')
  const isLiveMode = useNonce()

  useEffect(() => {
    if (supabaseReady) {
      supabase.from('scores').select('count', { count: 'exact', head: true }).then(() => {})
    }
  }, [])

  const params = new URLSearchParams(window.location.search)
  if (params.get('qr') === '1') return <QRSlide />

  if (loading) return <div className="app-loading">Loading…</div>
  if (!edition) return <div className="app-loading">Edition not found.</div>

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
          <Game edition={edition} onComplete={handleGameComplete} />
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

export default function App() {
  const params = new URLSearchParams(window.location.search)
  if (params.get('hof') === '1') return <HallOfFame />

  const dashToken = params.get('dashboard')
  if (DASHBOARD_BUILD && DASHBOARD_TOKEN && dashToken === DASHBOARD_TOKEN) return (
    <ErrorBoundary>
      <EditionProvider slug={getEditionSlug()}>
        <Dashboard />
      </EditionProvider>
    </ErrorBoundary>
  )

  const cockpitToken = params.get('cockpit')
  if (cockpitToken) return (
    <ErrorBoundary>
      <EditionProvider slug={getEditionSlug()}>
        <Cockpit token={cockpitToken} />
      </EditionProvider>
    </ErrorBoundary>
  )

  const adminToken = params.get('admin')
  if (adminToken) return (
    <ErrorBoundary>
      <EditionProvider slug={getEditionSlug()}>
        <AdminPanel token={adminToken} />
      </EditionProvider>
    </ErrorBoundary>
  )

  return (
    <ErrorBoundary>
      <EditionProvider slug={getEditionSlug()}>
        <AppInner />
      </EditionProvider>
    </ErrorBoundary>
  )
}
