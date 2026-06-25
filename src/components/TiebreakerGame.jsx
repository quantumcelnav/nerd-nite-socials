import { useState, useEffect, useRef, useCallback } from 'react'
import { TIEBREAKER_MAX } from '../data/scoring'

const EASY_SPECS = [
  [47, 38, '+'], [93, 27, '-'], [56, 78, '+'],
  [124, 67, '-'], [65, 47, '+'], [83, 36, '-'],
  [72, 59, '+'], [148, 73, '-'], [44, 67, '+'],
  [96, 38, '-'], [37, 58, '+'], [107, 49, '-'],
]

const EE_SPECS = [
  { text: '12V ÷ 4Ω = ? A',      correct: '3',    inputMode: 'numeric' },
  { text: '5V × 3A = ? W',        correct: '15',   inputMode: 'numeric' },
  { text: '3Ω + 7Ω = ? Ω',       correct: '10',   inputMode: 'numeric' },
  { text: '6Ω || 3Ω = ? Ω',      correct: '2',    inputMode: 'numeric' },
  { text: '2^10 = ?',              correct: '1024', inputMode: 'numeric' },
]

const QUESTION_COUNT = 4

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQuestions() {
  const easy = shuffle(EASY_SPECS).slice(0, QUESTION_COUNT - 1).map(([a, b, op]) => ({
    text: `${a} ${op} ${b} =`,
    correct: String(op === '+' ? a + b : a - b),
    inputMode: 'numeric',
    isEE: false,
  }))
  const ee = { ...shuffle(EE_SPECS)[0], isEE: true }
  return [...easy, ee]
}

function isCorrect(question, value) {
  const t = value.trim()
  if (!t) return false
  const n = parseFloat(t)
  return !isNaN(n) && n === parseFloat(question.correct)
}

export default function TiebreakerGame({ triviaScore, maxTriviaScore, onComplete }) {
  const [questions]     = useState(buildQuestions)
  const [phase, setPhase]       = useState('intro')
  const [answers, setAnswers]   = useState(['', '', '', ''])
  const [solved, setSolved]     = useState([false, false, false, false])
  const [timeLeft, setTimeLeft] = useState(TIEBREAKER_MAX)
  const [bonusScore, setBonusScore]     = useState(0)
  const [finalCorrect, setFinalCorrect] = useState(0)
  const [finalElapsed, setFinalElapsed] = useState(0)

  const startRef        = useRef(null)
  const timerRef        = useRef(null)
  const correctCountRef = useRef(0)
  const inputRefs       = useRef([])

  const finish = useCallback((ms) => {
    clearInterval(timerRef.current)
    const elapsed = ms / 1000
    const count   = correctCountRef.current
    const score   = Math.max(0, count * 25 - Math.floor(elapsed))
    setFinalElapsed(elapsed)
    setFinalCorrect(count)
    setBonusScore(score)
    setPhase('done')
  }, [])

  useEffect(() => () => clearInterval(timerRef.current), [])

  function startGame() {
    startRef.current = Date.now()
    setPhase('playing')
    timerRef.current = setInterval(() => {
      const ms        = Date.now() - startRef.current
      const remaining = TIEBREAKER_MAX - ms / 1000
      if (remaining <= 0) {
        setTimeLeft(0)
        finish(TIEBREAKER_MAX * 1000)
      } else {
        setTimeLeft(remaining)
      }
    }, 100)
  }

  function handleInput(qi, value) {
    const newAnswers = answers.map((a, i) => i === qi ? value : a)
    setAnswers(newAnswers)

    const newSolved = solved.map((s, i) => {
      if (i === qi) return isCorrect(questions[i], value)
      return s
    })
    setSolved(newSolved)
    correctCountRef.current = newSolved.filter(Boolean).length

    if (newSolved[qi] && !newSolved.every(Boolean)) {
      const next = newSolved.findIndex((s, i) => !s)
      if (next >= 0) setTimeout(() => inputRefs.current[next]?.focus(), 60)
    }
    if (newSolved.every(Boolean)) finish(Date.now() - startRef.current)
  }

  const timerColor = timeLeft > 60 ? 'var(--cyan)'
    : timeLeft > 20 ? 'var(--white)'
    : 'var(--orange)'

  // ── Intro ──────────────────────────────────────────────────
  if (phase === 'intro') return (
    <div className="tb-screen screen-enter">
      <div className="tb-card">
        <div className="tb-badge">BONUS ROUND</div>
        <div className="tb-intro-heading">Mental Math Sprint</div>
        <div className="tb-intro-body">
          4 problems — 3 easy, 1 EE.<br />
          Score = correct &times; 25 &minus; seconds used.<br />
          Up to +{TIEBREAKER_MAX} bonus points.
        </div>
        <div className="tb-trivia-so-far">Trivia so far: <strong>{triviaScore} pts</strong></div>
        <button className="tb-go-btn" onClick={startGame}>GO →</button>
      </div>
    </div>
  )

  // ── Done ───────────────────────────────────────────────────
  if (phase === 'done') return (
    <div className="tb-screen screen-enter">
      <div className="tb-card">
        <div className="tb-badge">{bonusScore > 0 ? 'CALCULATED' : 'TIME\'S UP'}</div>
        <div className="tb-done-breakdown">
          <span className="tb-done-correct">{finalCorrect}/{QUESTION_COUNT} correct</span>
          <span className="tb-done-formula">
            {finalCorrect} &times; 25 &minus; {Math.floor(finalElapsed)}s = <strong>{bonusScore}</strong>
          </span>
        </div>
        <div className="tb-done-bonus" style={{ color: bonusScore > 0 ? 'var(--cyan)' : 'rgba(245,245,240,0.4)' }}>
          {bonusScore > 0 ? `+${bonusScore} bonus pts` : 'No bonus'}
        </div>
        <div className="tb-done-final">
          <div className="tb-done-final-label">FINAL SCORE</div>
          <div className="tb-done-final-num">{triviaScore + bonusScore}</div>
          <div className="tb-done-final-max">/ {maxTriviaScore + TIEBREAKER_MAX}</div>
        </div>
        <button className="tb-continue-btn" onClick={() => onComplete(bonusScore)}>
          Submit Score →
        </button>
      </div>
    </div>
  )

  // ── Playing ────────────────────────────────────────────────
  const pct = (timeLeft / TIEBREAKER_MAX) * 100

  return (
    <div className="tb-screen screen-enter">
      <div className="tb-countdown-bar-wrap">
        <div className="tb-countdown-bar" style={{ width: `${pct}%`, background: timerColor }} />
      </div>
      <div className="tb-countdown-num" style={{ color: timerColor }}>
        {timeLeft.toFixed(1)}<span className="tb-countdown-unit">s</span>
      </div>

      <div className="tb-questions">
        {questions.map((q, qi) => (
          <div key={qi} className={`tb-qrow${solved[qi] ? ' tb-qrow--solved' : ''}${q.isEE ? ' tb-qrow--ee' : ''}`}>
            <div className="tb-qrow-left">
              {q.isEE && <span className="tb-ee-pip">⚡</span>}
              <span className="tb-qtext">{q.text}</span>
            </div>
            <div className="tb-qrow-right">
              <input
                ref={el => inputRefs.current[qi] = el}
                className={`tb-input${solved[qi] ? ' tb-input--correct' : ''}`}
                type="text"
                inputMode={q.inputMode}
                value={answers[qi]}
                onChange={e => handleInput(qi, e.target.value)}
                disabled={solved[qi]}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                aria-label={`Answer for: ${q.text}`}
              />
              {solved[qi] && <span className="tb-check-mark" aria-hidden="true">✓</span>}
            </div>
          </div>
        ))}
      </div>

      <button className="tb-submit-btn" onClick={() => finish(Date.now() - startRef.current)}>
        Submit ({solved.filter(Boolean).length}/{QUESTION_COUNT}) →
      </button>
    </div>
  )
}
