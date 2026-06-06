import { useReducer, useEffect, useMemo } from 'react'
import { correctGifs, wrongGifs, pickRandom } from '../data/reactions'
import { POINTS, DIFFICULTY_LABEL, calcMaxScore } from '../data/scoring'
import ReactionGif from './ReactionGif'
import '../game.css'

function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern)
}

export default function Game({ edition, onComplete }) {
  const MAX_SCORE = useMemo(() => calcMaxScore(edition.talks), [edition])

  // Reducer defined inline so it can close over the edition prop
  function gameReducer(state, action) {
    const talk = edition.talks[state.talkIdx]
    const question = talk?.questions[state.questionIdx]

    switch (action.type) {
      case 'ANSWER': {
        const correct = action.idx === question.answer
        return {
          ...state,
          phase: 'result',
          selected: action.idx,
          isCorrect: correct,
          reactionGif: action.gif,
          score: correct ? state.score + POINTS[question.difficulty] : state.score,
        }
      }
      case 'NEXT': {
        const isLastQuestion = state.questionIdx >= talk.questions.length - 1
        const isLastTalk = state.talkIdx >= edition.talks.length - 1

        if (!isLastQuestion) {
          return { ...state, phase: 'question', questionIdx: state.questionIdx + 1, selected: null }
        }
        if (!isLastTalk) {
          const nextTalk = state.talkIdx + 1
          return {
            ...state,
            phase: edition.originStory[nextTalk] ? 'origin' : 'question',
            talkIdx: nextTalk,
            questionIdx: 0,
            selected: null,
          }
        }
        return {
          ...state,
          phase: edition.originStory[edition.talks.length] ? 'outro' : 'complete',
        }
      }
      case 'ORIGIN_NEXT':
        return { ...state, phase: 'question' }
      case 'OUTRO_NEXT':
        return { ...state, phase: 'complete' }
      default:
        return state
    }
  }

  const [state, dispatch] = useReducer(gameReducer, {
    phase: 'origin',
    talkIdx: 0,
    questionIdx: 0,
    score: 0,
    selected: null,
    isCorrect: false,
    reactionGif: null,
  })

  const { phase, talkIdx, questionIdx, score, selected, isCorrect, reactionGif } = state
  const talk = edition.talks[talkIdx]
  const question = talk?.questions[questionIdx]
  const totalQuestions = edition.talks.reduce((s, t) => s + t.questions.length, 0)
  const answeredSoFar = edition.talks
    .slice(0, talkIdx)
    .reduce((s, t) => s + t.questions.length, 0) + questionIdx

  useEffect(() => {
    if (phase === 'complete') onComplete(score, MAX_SCORE)
  }, [phase]) // eslint-disable-line

  function handleAnswer(idx) {
    const correct = idx === question.answer
    vibrate(correct ? [40] : [80, 40, 80])
    dispatch({ type: 'ANSWER', idx, gif: pickRandom(correct ? correctGifs : wrongGifs) })
  }

  if (phase === 'outro') {
    return (
      <OriginCard
        text={edition.originStory[edition.talks.length].text}
        label="— Nerd Nite —"
        btnLabel="See My Score"
        onNext={() => dispatch({ type: 'OUTRO_NEXT' })}
      />
    )
  }

  if (phase === 'origin') {
    return (
      <OriginCard
        text={edition.originStory[talkIdx]?.text}
        label="— The Origin Story —"
        btnLabel={`Start Round ${talkIdx + 1}: ${talk.title}`}
        onNext={() => dispatch({ type: 'ORIGIN_NEXT' })}
      />
    )
  }

  if (phase === 'complete') return null

  return (
    <div className="game-screen screen-enter">
      <div className="game-topbar">
        <div className="game-progress-bar" role="progressbar"
          aria-valuenow={answeredSoFar} aria-valuemax={totalQuestions}
          aria-label="Game progress">
          <div className="game-progress-fill"
            style={{ width: `${(answeredSoFar / totalQuestions) * 100}%` }} />
        </div>
        <div className="game-meta">
          <span className="game-talk-label">
            Round {talkIdx + 1} / {edition.talks.length}: <em>{talk.speaker}</em>
          </span>
          <span className="game-score" aria-label={`Current score: ${score}`}>{score} pts</span>
        </div>
      </div>

      <div className="question-card">
        <div className="question-meta">
          <span>Q{questionIdx + 1} of {talk.questions.length}</span>
          <span className={`difficulty-badge diff-${question.difficulty}`}
            aria-label={`Difficulty: ${DIFFICULTY_LABEL[question.difficulty]}`}>
            {DIFFICULTY_LABEL[question.difficulty]}
          </span>
        </div>
        <p className="question-text">{question.question}</p>
      </div>

      <div className="answer-grid" role="group" aria-label="Answer choices">
        {question.options.map((opt, i) => {
          let cls = 'answer-btn'
          if (phase === 'result') {
            if (i === question.answer) cls += ' correct'
            else if (i === selected) cls += ' wrong'
            else cls += ' dimmed'
          }
          return (
            <button key={i} className={cls}
              onClick={() => handleAnswer(i)}
              disabled={phase === 'result'}
              aria-pressed={selected === i}
              aria-label={opt}>
              <span className="answer-letter">{['A', 'B', 'C', 'D'][i]}</span>
              <span className="answer-text">{opt}</span>
            </button>
          )
        })}
      </div>

      {phase === 'result' && (
        <>
          <ReactionGif src={reactionGif} isCorrect={isCorrect} />
          <div className="result-bar">
            <span className={isCorrect ? 'result-correct' : 'result-wrong'}>
              {isCorrect
                ? `✓ Correct! +${POINTS[question.difficulty]} pts`
                : `✗ Not quite — the answer was ${['A','B','C','D'][question.answer]}`}
            </span>
            <button className="next-btn" onClick={() => dispatch({ type: 'NEXT' })}
              aria-label="Continue to next question">
              {questionIdx < talk.questions.length - 1 ? 'Next Question →'
                : talkIdx < edition.talks.length - 1 ? 'Next Round →'
                : 'Finish →'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function OriginCard({ text, label, btnLabel, onNext }) {
  return (
    <div className="origin-screen screen-enter">
      <div className="origin-card">
        <div className="origin-label">{label}</div>
        <p className="origin-text">{text}</p>
        <div className="origin-signature">
          <span className="origin-sig-name">Justin Fritz</span>
          <span className="origin-sig-title">Nerd Nite Fort Collins Boss</span>
        </div>
      </div>
      <button className="origin-btn" onClick={onNext}>{btnLabel}</button>
    </div>
  )
}
